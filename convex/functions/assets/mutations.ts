import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUserWithProfile } from "../../lib/customFunctions";

/**
 * Create a new asset record after successful upload.
 * Works for both clients (who own the project) and admins.
 */
export const createAsset = mutation({
  args: {
    projectId: v.id("projects"),
    folderId: v.id("folders"),
    filename: v.string(),
    minioKey: v.string(),
    sizeBytes: v.number(),
    mimeType: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Verify authentication
    const { profile } = await getAuthUserWithProfile(ctx);

    // 2. Verify access - client must own project, or user must be admin
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (profile.role === "studio" && project.studioId !== profile._id) {
      throw new Error("Access denied");
    }

    // 3. Create the asset record
    const assetId = await ctx.db.insert("assets", {
      projectId: args.projectId,
      folderId: args.folderId,
      filename: args.filename,
      minioKey: args.minioKey,
      sizeBytes: args.sizeBytes,
      mimeType: args.mimeType,
      uploadedBy: profile._id,
    });

    // 4. Update folder status if it was pending
    const folder = await ctx.db.get(args.folderId);
    if (folder && folder.status === "pending_upload") {
      await ctx.db.patch(args.folderId, {
        status: "in_progress",
      });
    }

    return assetId;
  },
});

/**
 * Delete an asset record.
 * Only the uploader, project owner, or admin can delete.
 */
export const deleteAsset = mutation({
  args: {
    assetId: v.id("assets"),
  },
  handler: async (ctx, args) => {
    // 1. Verify authentication
    const { profile } = await getAuthUserWithProfile(ctx);

    // 2. Get the asset
    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // 3. Verify access
    const project = await ctx.db.get(asset.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Allow if:
    // - User is admin
    // - User is the studio that owns the project
    const isOwner =
      profile.role === "studio" && project.studioId === profile._id;
    const isAdmin = profile.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error(
        "Access denied: You don't have permission to delete this asset",
      );
    }

    // 4. Delete the record
    await ctx.db.delete(args.assetId);

    return { success: true };
  },
});
