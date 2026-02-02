import { v } from "convex/values";
import { query } from "../../_generated/server";
import { enrichReferenceFilesWithUrls } from "../../lib/storageUtils";
import { getAuthUserWithProfile } from "../../lib/customFunctions";

/**
 * Get all deliverables for a project.
 */
export const getProjectDeliverables = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Just ensure the user is authenticated (admin or studio or relevant employee)
    // For now we assume this is used by admin/employee details which are protected
    // more strictly in other layers or we can add strict checks here.
    // Simplifying auth check for now to just "authenticated user"
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc") // Newest first
      .collect();

    const enrichedDeliverables = await Promise.all(
      deliverables.map(async (d) => {
        const uploader = await ctx.db.get(d.uploadedBy);

        return {
          ...d,
          uploadedByName: uploader?.name ?? "Unknown",
        };
      }),
    );

    return enrichedDeliverables;
  },
});

/**
 * Get a single deliverable by ID.
 */
export const getDeliverable = query({
  args: {
    deliverableId: v.id("deliverables"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) return null;

    const uploader = await ctx.db.get(deliverable.uploadedBy);

    return {
      ...deliverable,
      uploadedByName: uploader?.name ?? "Unknown",
    };
  },
});

/**
 * Get all versions of a deliverable by name.
 */
export const getDeliverableVersions = query({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const versions = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .order("desc")
      .collect();

    return versions.map((v) => ({
      _id: v._id,
      version: v.version,
      status: v.status,
      sizeBytes: v.sizeBytes,
      _creationTime: v._creationTime,
    }));
  },
});
