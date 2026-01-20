import { v } from "convex/values";
import { adminMutation, clientMutation } from "../../lib/customFunctions";
import { canTransition, getPhaseForState, getActorForState } from "../../lib/statusMachine";
import { ActionState } from "../../schema";
import { Id } from "../../_generated/dataModel";

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
    
    // CRITICAL: Transition the project status to storage_allocated
    // This unblocks the next steps in the pipeline (awaiting_uploads)
    if (canTransition(project.actionState as ActionState, "storage_allocated")) {
      const newPhase = getPhaseForState("storage_allocated");
      const newActor = getActorForState("storage_allocated");

      await ctx.db.patch(args.projectId, {
        storageAllocated: storageInBytes,
        phase: newPhase,
        actionState: "storage_allocated",
        awaitingActorRole: newActor,
        updatedAt: Date.now(),
      });

      // Record status history
      await ctx.db.insert("statusHistory", {
        projectId: args.projectId,
        previousPhase: project.phase,
        newPhase: newPhase,
        previousActionState: project.actionState,
        newActionState: "storage_allocated",
        previousAwaitingActorRole: project.awaitingActorRole,
        newAwaitingActorRole: newActor,
        changedBy: ctx.profile._id,
        changedAt: Date.now(),
        notes: `Folders set up using template: ${template.name}. Storage allocated: ${storageTier.sizeGB}GB.`,
      });
    } else {
      // Just update storage if transition isn't allowed (shouldn't happen in normal flow)
      await ctx.db.patch(args.projectId, {
        storageAllocated: storageInBytes,
        updatedAt: Date.now(),
      });
    }

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

    // Reset storage allocation and potentially status
    await ctx.db.patch(args.projectId, {
      storageAllocated: 0,
      updatedAt: Date.now(),
    });

    // Record the removal in history
    await ctx.db.insert("statusHistory", {
      projectId: args.projectId,
      previousPhase: "setup",
      newPhase: "setup",
      previousActionState: "storage_allocated",
      newActionState: "quotation_approved", // Step back to approved but not yet allocated
      changedBy: ctx.profile._id,
      changedAt: Date.now(),
      notes: "Project folders and storage allocation removed by admin.",
    });

    return {
      success: true,
      foldersDeleted: folders.length,
    };
  },
});

/**
 * Admin update folder status.
 * Used by admins to mark folders as completed.
 */
export const adminUpdateFolderStatus = adminMutation({
  args: {
    folderId: v.id("folders"),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new Error("Folder not found");

    await ctx.db.patch(args.folderId, {
      status: args.status,
    });

    if (args.status === "completed") {
      await checkAndTransitionUploadsComplete(ctx, folder.projectId);
    }

    return { success: true };
  },
});

/**
 * Update a folder's status.
 * Used by clients to mark a folder as "completed" after they finish uploading.
 */
export const updateFolderStatus = clientMutation({
  args: {
    folderId: v.id("folders"),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new Error("Folder not found");

    // Verify ownership
    const project = await ctx.db.get(folder.projectId);
    if (!project || project.clientId !== ctx.profile._id) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.folderId, {
      status: args.status,
    });

    if (args.status === "completed") {
      await checkAndTransitionUploadsComplete(ctx, folder.projectId);
    }

    return { success: true };
  },
});

/**
 * Helper to check if all folders are complete and transition project to uploads_complete.
 */
async function checkAndTransitionUploadsComplete(ctx: any, projectId: Id<"projects">) {
  const folders = await ctx.db
    .query("folders")
    .withIndex("by_projectId", (q: any) => q.eq("projectId", projectId))
    .collect();

  const allCompleted = folders.every((f: any) => f.status === "completed");

  if (allCompleted) {
    const project = await ctx.db.get(projectId);
    if (project && project.actionState === "awaiting_uploads") {
      const newPhase = getPhaseForState("uploads_complete");
      const newActor = getActorForState("uploads_complete");

      await ctx.db.patch(projectId, {
        phase: newPhase,
        actionState: "uploads_complete",
        awaitingActorRole: newActor,
        uploadsCompletedAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Status history
      await ctx.db.insert("statusHistory", {
        projectId,
        previousPhase: project.phase,
        newPhase,
        previousActionState: project.actionState,
        newActionState: "uploads_complete",
        previousAwaitingActorRole: project.awaitingActorRole,
        newAwaitingActorRole: newActor,
        changedBy: ctx.profile._id,
        changedAt: Date.now(),
        notes: "All folders marked as completed. Project is ready for assignment.",
      });
    }
  }
}

/**
 * Open project for client uploads.
 * Transition project from storage_allocated to awaiting_uploads.
 */
export const openProjectForUpload = adminMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (canTransition(project.actionState as ActionState, "awaiting_uploads")) {
      const newPhase = getPhaseForState("awaiting_uploads");
      const newActor = getActorForState("awaiting_uploads");

      await ctx.db.patch(args.projectId, {
        phase: newPhase,
        actionState: "awaiting_uploads",
        awaitingActorRole: newActor,
        updatedAt: Date.now(),
      });

      // Record status history
      await ctx.db.insert("statusHistory", {
        projectId: args.projectId,
        previousPhase: project.phase,
        newPhase: newPhase,
        previousActionState: project.actionState,
        newActionState: "awaiting_uploads",
        previousAwaitingActorRole: project.awaitingActorRole,
        newAwaitingActorRole: newActor,
        changedBy: ctx.profile._id,
        changedAt: Date.now(),
        notes: "Project opened for client uploads.",
      });

      return { success: true };
    }

    throw new Error(`Cannot open project for upload from current state: ${project.actionState}`);
  },
});
