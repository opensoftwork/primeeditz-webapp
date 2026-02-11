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

/**
 * Get recent status changes for deliverables (Approved or Revision Requested).
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
            q.eq(q.field("status"), "revision_requested"),
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
      project.actionState === "revisions_requested" ||
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

    return deliverables;
  },
});
