import { v } from "convex/values";
import { query } from "../../_generated/server";

import { getAuthUserWithProfile } from "../../lib/customFunctions";

/**
 * Get all deliverables for a project.
 * Filters out legacy child deliverables (those with parentDeliverableId).
 */
export const getProjectDeliverables = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc") // Newest first
      .collect();

    // Filter out legacy child deliverables (from before version-in-place migration)
    const rootDeliverables = deliverables.filter((d) => !d.parentDeliverableId);

    const enrichedDeliverables = await Promise.all(
      rootDeliverables.map(async (d) => {
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
 * Get all versions of a deliverable from the deliverableVersions table.
 * Uses deliverableId for direct lookup (replaces legacy name-based matching).
 */
export const getDeliverableVersions = query({
  args: {
    deliverableId: v.id("deliverables"),
    // Keep legacy args as optional for backward compat during transition
    projectId: v.optional(v.id("projects")),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Query deliverableVersions table directly
    const versions = await ctx.db
      .query("deliverableVersions")
      .withIndex("by_deliverableId", (q) =>
        q.eq("deliverableId", args.deliverableId),
      )
      .order("desc")
      .collect();

    // Enrich with uploader names
    const enriched = await Promise.all(
      versions.map(async (v) => {
        const uploader = await ctx.db.get(v.uploadedBy);
        return {
          ...v,
          uploadedByName: uploader?.name ?? "Unknown",
        };
      }),
    );

    return enriched;
  },
});

/**
 * Get recent status changes for deliverables (Approved or Version Requested).
 * Used for in-app status banners.
 */
export const getRecentStatusChanges = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Get deliverables changed in last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), oneDayAgo),
          q.or(
            q.eq(q.field("status"), "approved"),
            q.eq(q.field("status"), "version_requested"),
          ),
        ),
      )
      .order("desc")
      .take(5);

    return deliverables;
  },
});

/**
 * Get deliverables for client/studio view.
 * ENFORCES QC GATE: Only approved deliverables are visible.
 * Filters out legacy child deliverables.
 */
export const getClientDeliverables = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Fetch project to check state
    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    // Client can only see deliverables if project is in review or delivery phase
    const isVisibleToClient =
      project.actionState === "awaiting_review" ||
      project.actionState === "review_approved" ||
      project.actionState === "versions_requested" ||
      project.phase === "delivery";

    if (!isVisibleToClient) {
      return [];
    }

    // Fetch deliverables for this project
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc") // Newest first
      .collect();

    // Filter out legacy child deliverables
    const rootDeliverables = deliverables.filter((d) => !d.parentDeliverableId);

    // Enrich with approval and version data
    const enriched = await Promise.all(
      rootDeliverables.map(async (d) => {
        // Check studio approval
        const approval = await ctx.db
          .query("studioApprovals")
          .withIndex("by_deliverableId", (q) => q.eq("deliverableId", d._id))
          .first();

        // Check latest version request
        const latestVersion = await ctx.db
          .query("versionRequests")
          .withIndex("by_deliverableId", (q) => q.eq("deliverableId", d._id))
          .order("desc")
          .first();

        return {
          ...d,
          isStudioApproved: !!approval,
          studioApprovedAt: approval?.approvedAt,
          latestVersionStatus: latestVersion?.status,
          latestVersionId: latestVersion?._id,
        };
      }),
    );

    return enriched;
  },
});

/**
 * Get all version requests for a specific deliverable.
 */
export const getDeliverableVersionRequests = query({
  args: {
    deliverableId: v.id("deliverables"),
  },
  handler: async (ctx, args) => {
    await getAuthUserWithProfile(ctx);

    const requests = await ctx.db
      .query("versionRequests")
      .withIndex("by_deliverableId", (q) =>
        q.eq("deliverableId", args.deliverableId),
      )
      .order("asc")
      .collect();

    // Enrich with requester names
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const requester = await ctx.db.get(r.requestedBy);
        return {
          ...r,
          requestedByName: requester ? `${requester.name}` : "Unknown",
        };
      }),
    );

    return enriched;
  },
});

/**
 * Get full version history for a project.
 */
export const getProjectVersionHistory = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await getAuthUserWithProfile(ctx);

    const requests = await ctx.db
      .query("versionRequests")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    // Enrich with deliverable names and requester names
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const deliverable = await ctx.db.get(r.deliverableId);
        const requester = await ctx.db.get(r.requestedBy);
        return {
          ...r,
          deliverableName: deliverable?.name || "Unknown",
          requestedByName: requester ? `${requester.name}` : "Unknown",
        };
      }),
    );

    return enriched;
  },
});

/**
 * Get a single version request by ID.
 */
export const getVersionRequest = query({
  args: {
    requestId: v.id("versionRequests"),
  },
  handler: async (ctx, args) => {
    await getAuthUserWithProfile(ctx);

    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    const requester = await ctx.db.get(request.requestedBy);
    const deliverable = await ctx.db.get(request.deliverableId);

    return {
      ...request,
      requestedByName: requester ? requester.name : "Unknown",
      deliverableName: deliverable?.name || "Unknown",
      deliverableMinioKey: deliverable?.minioKey,
      deliverableMimeType: deliverable?.mimeType,
    };
  },
});
