import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUserWithProfile } from "../../lib/customFunctions";
import { now } from "../../lib/helpers";
import { deliverableStatusValidator } from "../../schema";

/**
 * Create a new deliverable record after successful upload by employee.
 */
export const uploadDeliverable = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    minioKey: v.string(),
    sizeBytes: v.number(),
    mimeType: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Verify project exists
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Get current version for this deliverable name in this project
    const existing = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .order("desc")
      .first();

    const version = existing ? existing.version + 1 : 1;

    // Create the deliverable
    const deliverableId = await ctx.db.insert("deliverables", {
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      version: version,
      status: "pending_qc",
      minioKey: args.minioKey,
      sizeBytes: args.sizeBytes,
      uploadedBy: profile._id,
    });

    return deliverableId;
  },
});
