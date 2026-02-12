import { v } from "convex/values";
import { DataModel, type Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  adminMutation,
  authenticatedWithProfileMutation,
  studioMutation,
} from "../../lib/customFunctions";
import {
  canTransition,
  getActorForState,
  getPhaseForState,
} from "../../lib/statusMachine";
import type {
  ActionState,
  FolderLevel1,
  FolderLevel2,
  FolderLevel3,
} from "../../schema";

type FolderItem = FolderLevel1 | FolderLevel2 | FolderLevel3;

/**
 * Shared helper for setting up project folders and storage allocation.
 */
export async function setupFoldersInternal(
  ctx: MutationCtx,
  args: {
    projectId: Id<"projects">;
    templateId: Id<"folderTemplates">;
    storageTierId: Id<"storageTiers">;
    changedBy: Id<"profiles">;
  },
) {
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

  // Create folder records from the template (flatten hierarchy)
  const folderIds = [];

  async function createFoldersRecursively(
    items: FolderItem[],
    parentId?: Id<"folders">,
    parentPath: string = "",
  ) {
    for (const item of items) {
      // 1. Determine the correct name-based slug for this folder.
      const slug = item.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // 2. Construct the absolute path.
      // We prioritize any multi-segment path already in the template if it looks absolute,
      // but otherwise we build it properly using parentPath + slug.
      const itemPath = item.path.replace(/^\/+|\/+$/g, "");
      let fullPath: string;

      if (parentPath) {
        // If we have a parent, ensure this folder is nested under it.
        // Even if itemPath is "family", if parent is "reception", fullPath becomes "reception/family"
        fullPath = `${parentPath}/${itemPath.includes("/") ? itemPath.split("/").pop() : itemPath}`;
      } else {
        // Root level
        fullPath = itemPath;
      }

      const folderId = await ctx.db.insert("folders", {
        projectId: args.projectId,
        name: item.name,
        path: fullPath,
        parentId: parentId, // Set the parent link!
        description: item.description,
        isRequired: item.isRequired,
        status: "pending_upload",
      });
      folderIds.push(folderId);

      if ("children" in item && item.children && item.children.length > 0) {
        await createFoldersRecursively(item.children, folderId, fullPath);
      }
    }
  }

  await createFoldersRecursively(template.folders);

  // Update project's storage allocation (convert GB to bytes)
  const storageInBytes = storageTier.sizeGB * 1024 * 1024 * 1024;

  // Transition the project status to storage_allocated
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
      changedBy: args.changedBy,
      changedAt: Date.now(),
      notes: `Folders set up using template: ${template.name}. Storage allocated: ${storageTier.sizeGB}GB.`,
    });
  } else {
    // Just update storage if transition isn't allowed
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
}

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
    return await setupFoldersInternal(ctx, {
      ...args,
      changedBy: ctx.profile._id,
    });
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
          `Cannot delete folders: folder "${folder.name}" contains uploaded assets`,
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

    return { success: true };
  },
});

/**
 * Update a folder's status.
 * Used by clients to mark a folder as "completed" after they finish uploading.
 */
export const updateFolderStatus = studioMutation({
  args: {
    folderId: v.id("folders"),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new Error("Folder not found");

    // Verify ownership
    const project = await ctx.db.get(folder.projectId);
    if (!project || project.studioId !== ctx.profile._id) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.folderId, {
      status: args.status,
    });

    return { success: true };
  },
});

/**
 * Mark all folders in a project as complete and transition project to uploads_complete.
 * Triggered by the "I'm done uploading" button in the UI.
 */
export const markAllUploadsComplete = authenticatedWithProfileMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Get project and folders
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Security check: only client owner or admin/employee can trigger
    const isOwner = project.studioId === ctx.profile._id;
    const isStaff =
      ctx.profile.role === "admin" || ctx.profile.role === "employee";
    if (!isOwner && !isStaff) throw new Error("Permission denied");

    // 2. Get all folders
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // 3. Mark all as completed
    for (const folder of folders) {
      if (folder.status !== "completed") {
        await ctx.db.patch(folder._id, { status: "completed" });
      }
    }

    // 4. Force transition project
    const newPhase = getPhaseForState("uploads_complete");
    const newActor = getActorForState("uploads_complete");

    if (project.actionState === "awaiting_uploads") {
      const nextState = "awaiting_assignment";
      const newPhase = getPhaseForState(nextState);
      const newActor = getActorForState(nextState);

      await ctx.db.patch(args.projectId, {
        phase: newPhase,
        actionState: nextState,
        awaitingActorRole: newActor,
        uploadsCompletedAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Status history for audit
      await ctx.db.insert("statusHistory", {
        projectId: args.projectId,
        previousPhase: project.phase,
        newPhase,
        previousActionState: project.actionState,
        newActionState: nextState,
        previousAwaitingActorRole: project.awaitingActorRole,
        newAwaitingActorRole: newActor,
        changedBy: ctx.profile._id,
        changedAt: Date.now(),
        notes: `Uploads marked as complete by ${ctx.profile.name} (${ctx.profile.role}). Ready for assignment.`,
      });
    }

    return { success: true };
  },
});

/**
 * Helper to check if all folders are complete and transition project to uploads_complete.
 */
async function checkAndTransitionUploadsComplete(
  ctx: any,
  projectId: Id<"projects">,
) {
  const folders = await ctx.db
    .query("folders")
    .withIndex("by_projectId", (q: any) => q.eq("projectId", projectId))
    .collect();

  const allCompleted = folders.every((f: any) => f.status === "completed");

  if (allCompleted) {
    const project = await ctx.db.get(projectId);
    if (project && project.actionState === "awaiting_uploads") {
      const nextState = "awaiting_assignment";
      const newPhase = getPhaseForState(nextState);
      const newActor = getActorForState(nextState);

      await ctx.db.patch(projectId, {
        phase: newPhase,
        actionState: nextState,
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
        newActionState: nextState,
        previousAwaitingActorRole: project.awaitingActorRole,
        newAwaitingActorRole: newActor,
        changedBy: ctx.profile._id,
        changedAt: Date.now(),
        notes: `All folders marked as completed. Auto-transitioned to assignment phase. (Triggered by ${ctx.profile.role} ${ctx.profile.name})`,
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

    throw new Error(
      `Cannot open project for upload from current state: ${project.actionState}`,
    );
  },
});

/**
 * Maintenance: Fixes folder hierarchy for a project generically using templates.
 */
export const repairProjectFolders = adminMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // 1. Find the suitable template
    let template;
    const projectType = await ctx.db.get(project.projectTypeId);
    if (projectType?.defaultFolderTemplateId) {
      template = await ctx.db.get(projectType.defaultFolderTemplateId);
    }

    if (!template && project.quotationId) {
      const quotation = await ctx.db.get(project.quotationId);
      if (quotation && quotation.selectedPackageIds?.length > 0) {
        for (const pkgId of quotation.selectedPackageIds) {
          const pkg = await ctx.db.get(pkgId);
          if (pkg?.projectConfigs) {
            const config = pkg.projectConfigs.find(
              (c) => c.projectTypeId === project.projectTypeId,
            );
            if (config?.folderTemplateId) {
              template = await ctx.db.get(config.folderTemplateId);
              break;
            }
          }
        }
      }
    }

    if (!template) {
      template = await ctx.db
        .query("folderTemplates")
        .withIndex("by_projectTypeId", (q) =>
          q.eq("projectTypeId", project.projectTypeId),
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
    }

    if (!template) throw new Error("No folder template found to repair from");

    // 2. Load all project folders
    const allFolders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    let repairedCount = 0;
    const assignedIds = new Set<string>();

    /**
     * Recursively matches template nodes to project folders and updates their paths.
     */
    async function matchNodes(
      items: FolderItem[],
      parentId?: Id<"folders">,
      parentPath: string = "",
    ) {
      for (const item of items) {
        // Find a matching folder that hasn't been assigned yet
        // Match by name (case-insensitive)
        const match = allFolders.find(
          (f) =>
            !assignedIds.has(f._id) &&
            f.name.toLowerCase() === item.name.toLowerCase(),
        );

        const itemPath = item.path.replace(/^\/+|\/+$/g, "");
        let fullPath: string;

        if (parentPath) {
          // Construct proper absolute path based on parent
          fullPath = `${parentPath}/${itemPath.includes("/") ? itemPath.split("/").pop() : itemPath}`;
        } else {
          fullPath = itemPath;
        }

        if (match) {
          assignedIds.add(match._id);
          if (match.path !== fullPath || match.parentId !== parentId) {
            await ctx.db.patch(match._id, {
              path: fullPath,
              parentId: parentId,
            });
            repairedCount++;
          }

          // Recursively match children
          if ("children" in item && item.children && item.children.length > 0) {
            await matchNodes(item.children, match._id, fullPath);
          }
        }
      }
    }

    await matchNodes(template.folders);

    // 3. Final pass: ensure any remaining unassigned folders have clean paths (no leading slashes)
    for (const folder of allFolders) {
      if (!assignedIds.has(folder._id) && folder.path.startsWith("/")) {
        await ctx.db.patch(folder._id, {
          path: folder.path.replace(/^\/+/, ""),
        });
        repairedCount++;
      }
    }

    return {
      success: true,
      repairedCount,
      message: `Repaired ${repairedCount} folders for project ${project.code}.`,
    };
  },
});
