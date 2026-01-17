import { v } from "convex/values";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Setup project folders from a template.
 * Creates folder records linked to the project and updates storage allocation.
 */
export const setupProjectFolders = adminMutation({
  args: {
    projectId: v.id("projects"),
    templateId: v.id("folderTemplates"),
    storageTierId: v.id("storageTiers"),
  },
  handler: async (ctx, args) => {
    // Get the project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if folders already exist for this project
    const existingFolders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    if (existingFolders) {
      throw new Error("Folders have already been set up for this project");
    }

    // Get the folder template
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Folder template not found");
    }

    // Get the storage tier
    const storageTier = await ctx.db.get(args.storageTierId);
    if (!storageTier) {
      throw new Error("Storage tier not found");
    }

    // Create folder records from the template
    const folderIds = [];
    for (const folderName of template.folders) {
      const folderId = await ctx.db.insert("folders", {
        projectId: args.projectId,
        name: folderName,
        path: `/${folderName.toLowerCase().replace(/\s+/g, "-")}`,
        status: "pending_upload",
      });
      folderIds.push(folderId);
    }

    // Update project's storage allocation (convert GB to bytes)
    const storageInBytes = storageTier.sizeGB * 1024 * 1024 * 1024;
    await ctx.db.patch(args.projectId, {
      storageAllocated: storageInBytes,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      foldersCreated: folderIds.length,
      storageAllocated: storageInBytes,
    };
  },
});

/**
 * Delete all folders for a project.
 * Admin-only operation for cleanup or reset.
 */
export const deleteProjectFolders = adminMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Get all folders for the project
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Check if any folder has assets
    for (const folder of folders) {
      const assets = await ctx.db
        .query("assets")
        .withIndex("by_folderId", (q) => q.eq("folderId", folder._id))
        .first();

      if (assets) {
        throw new Error(
          `Cannot delete folders: folder "${folder.name}" contains uploaded assets`
        );
      }
    }

    // Delete all folders
    for (const folder of folders) {
      await ctx.db.delete(folder._id);
    }

    // Reset storage allocation
    await ctx.db.patch(args.projectId, {
      storageAllocated: 0,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      foldersDeleted: folders.length,
    };
  },
});
