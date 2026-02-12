import { internalMutation } from "../../_generated/server";

/**
 * One-time migration: Populate deliverableVersions table from existing deliverables.
 *
 * This migration:
 * 1. For each ROOT deliverable (no parentDeliverableId): creates a V1 entry
 * 2. For each CHILD deliverable (has parentDeliverableId): creates a version entry
 *    linked to the parent, and updates the parent's cached fields to the latest child
 *
 * Safe to run multiple times — skips deliverables that already have version entries.
 */
export const migrateDeliverableVersions = internalMutation({
  args: {},
  handler: async (ctx) => {

    // Get ALL deliverables
    const allDeliverables = await ctx.db.query("deliverables").collect();

    // Check if migration already ran by looking for any existing deliverableVersions
    const existingVersions = await ctx.db
      .query("deliverableVersions")
      .take(1);
    if (existingVersions.length > 0) {
      return {
        success: true,
        message: "Migration already completed — deliverableVersions table is not empty",
        skipped: true,
      };
    }

    // Separate into roots and children
    const roots = allDeliverables.filter((d) => !d.parentDeliverableId);
    const children = allDeliverables.filter((d) => !!d.parentDeliverableId);

    let createdVersions = 0;
    let updatedParents = 0;

    // 1. Create V1 entries for all root deliverables
    for (const root of roots) {
      const versionId = await ctx.db.insert("deliverableVersions", {
        deliverableId: root._id,
        projectId: root.projectId,
        versionNumber: 1, // Root is always V1
        minioKey: root.minioKey,
        sizeBytes: root.sizeBytes,
        mimeType: root.mimeType,
        uploadedBy: root.uploadedBy,
        uploadedByRole: "employee", // Default — original uploads are from employees
        description: root.description,
        createdAt: root._creationTime,
      });

      // Set latestVersionId on the root (will be overridden if children exist)
      await ctx.db.patch(root._id, { latestVersionId: versionId });
      createdVersions++;
    }

    // 2. Process children — group by parentDeliverableId
    const childrenByParent = new Map<string, typeof children>();
    for (const child of children) {
      const parentId = child.parentDeliverableId!;
      const existing = childrenByParent.get(parentId) || [];
      existing.push(child);
      childrenByParent.set(parentId, existing);
    }

    for (const [parentId, childGroup] of childrenByParent.entries()) {
      // Sort children by version number ascending
      const sorted = childGroup.sort((a, b) => a.version - b.version);

      for (const child of sorted) {
        // Create a version entry linked to the parent
        const versionId = await ctx.db.insert("deliverableVersions", {
          deliverableId: parentId as any, // Points to the root deliverable
          projectId: child.projectId,
          versionNumber: child.version,
          minioKey: child.minioKey,
          sizeBytes: child.sizeBytes,
          mimeType: child.mimeType,
          uploadedBy: child.uploadedBy,
          uploadedByRole: "employee", // Default
          description: child.description,
          createdAt: child._creationTime,
        });
        createdVersions++;
      }

      // Update the parent to reflect the latest child's data
      const latestChild = sorted[sorted.length - 1];
      const latestVersionEntry = await ctx.db
        .query("deliverableVersions")
        .withIndex("by_deliverableId", (q) =>
          q.eq("deliverableId", parentId as any),
        )
        .order("desc")
        .first();

      if (latestChild && latestVersionEntry) {
        await ctx.db.patch(parentId as any, {
          version: latestChild.version,
          minioKey: latestChild.minioKey,
          sizeBytes: latestChild.sizeBytes,
          mimeType: latestChild.mimeType,
          status: latestChild.status as any,
          latestVersionId: latestVersionEntry._id,
        });
        updatedParents++;
      }
    }

    return {
      success: true,
      message: `Migration complete`,
      stats: {
        totalDeliverables: allDeliverables.length,
        rootDeliverables: roots.length,
        childDeliverables: children.length,
        createdVersionEntries: createdVersions,
        updatedParents: updatedParents,
      },
    };
  },
});
