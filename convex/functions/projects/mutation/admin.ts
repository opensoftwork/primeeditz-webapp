import { ConvexError, v } from "convex/values";
import {
  adminMutation,
  authenticatedWithProfileMutation,
} from "../../../lib/customFunctions";
import { now } from "../../../lib/helpers";
import {
  canTransition,
  getActorForState,
  getPhaseForState,
} from "../../../lib/statusMachine";
import { projectActionStateValidator } from "../../../schema";

// ============================================================================
// Admin Mutations
// ============================================================================

/**
 * Transition a project to a new action state.
 * Validates the transition using the status machine and auto-assigns phases/actors.
 */
export const transitionProject = authenticatedWithProfileMutation({
  args: {
    projectId: v.id("projects"),
    newState: projectActionStateValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Get project
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    // 2. Security Check: Only admins, workers, or the project owner can transition
    const isOwner = project.studioId === ctx.profile._id;
    const isAdmin = ctx.profile.role === "admin";
    const isEmployee = ctx.profile.role === "employee";

    if (!isAdmin && !isEmployee && !isOwner) {
      throw new ConvexError("Unauthorized to transition this project");
    }

    // 3. Validation: Use status machine to check if transition is allowed
    if (!canTransition(project.actionState, args.newState)) {
      throw new ConvexError(
        `Invalid transition: ${project.actionState} -> ${args.newState}`,
      );
    }

    // 4. Auto-determine new phase and awaiting actor
    const newPhase = getPhaseForState(args.newState);
    const newActor = getActorForState(args.newState);

    // 5. Update Project
    await ctx.db.patch(args.projectId, {
      phase: newPhase,
      actionState: args.newState,
      awaitingActorRole: newActor,
      updatedAt: now(),
    });

    // 6. Record in Status History
    await ctx.db.insert("statusHistory", {
      projectId: args.projectId,
      previousPhase: project.phase,
      newPhase: newPhase,
      previousActionState: project.actionState,
      newActionState: args.newState,
      previousAwaitingActorRole: project.awaitingActorRole,
      newAwaitingActorRole: newActor,
      changedBy: ctx.profile._id,
      changedAt: now(),
      notes: args.notes,
    });

    return { success: true, phase: newPhase };
  },
});

/**
 * Assign employee to project (admin only).
 */
export const assignEmployee = adminMutation({
  args: {
    projectId: v.id("projects"),
    employeeId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new ConvexError("Project not found");
    }

    // Verify employee exists and has employee role
    const employee = await ctx.db.get(args.employeeId);
    if (!employee || employee.role !== "employee") {
      throw new ConvexError("Invalid employee");
    }

    // CRITICAL: Transition status to 'assigned'
    if (canTransition(project.actionState, "assigned")) {
      const newPhase = getPhaseForState("assigned");
      const newActor = getActorForState("assigned");

      await ctx.db.patch(args.projectId, {
        assignedEmployeeId: args.employeeId,
        phase: newPhase,
        actionState: "assigned",
        awaitingActorRole: newActor,
        assignedAt: now(),
        updatedAt: now(),
      });

      // Record status history
      await ctx.db.insert("statusHistory", {
        projectId: args.projectId,
        previousPhase: project.phase,
        newPhase: newPhase,
        previousActionState: project.actionState,
        newActionState: "assigned",
        previousAwaitingActorRole: project.awaitingActorRole,
        newAwaitingActorRole: newActor,
        changedBy: ctx.profile._id,
        changedAt: now(),
        notes: `Project assigned to ${employee.name}`,
      });
    } else {
      // Just update assignment if transition not allowed (though status machine should allow from uploads_complete)
      await ctx.db.patch(args.projectId, {
        assignedEmployeeId: args.employeeId,
        updatedAt: now(),
      });
    }

    return { success: true };
  },
});

/**
 * Archive a project (admin only).
 * Sets the project status to 'archived' - data is preserved but not accessible.
 */
export const archiveProject = adminMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new ConvexError("Project not found");
    }

    // Cannot archive already archived projects
    if (project.phase === "archived") {
      throw new ConvexError("Project is already archived");
    }

    const previousPhase = project.phase;
    const previousActionState = project.actionState;
    const previousActor = project.awaitingActorRole;

    await ctx.db.patch(args.projectId, {
      phase: "archived",
      archivedAt: now(),
      archivedBy: ctx.profile._id,
      updatedAt: now(),
    });

    // Record status change
    await ctx.db.insert("statusHistory", {
      projectId: args.projectId,
      previousPhase,
      newPhase: "archived",
      previousActionState,
      newActionState: previousActionState, // State remains the same, but phase is archived
      previousAwaitingActorRole: previousActor,
      newAwaitingActorRole: undefined,
      changedBy: ctx.profile._id,
      changedAt: now(),
      notes: "Project archived",
    });

    return { success: true };
  },
});

/**
 * Unarchive a project (admin only).
 * Restores an archived project to 'active' status.
 */
export const unarchiveProject = adminMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new ConvexError("Project not found");
    }

    // Can only unarchive archived projects
    if (project.phase !== "archived") {
      throw new ConvexError("Project is not archived");
    }

    const previousPhase = project.phase;
    const previousActionState = project.actionState;

    await ctx.db.patch(args.projectId, {
      phase: "setup", // Default back to setup or keep previous? For now 'setup'
      archivedAt: undefined,
      archivedBy: undefined,
      updatedAt: now(),
    });

    // Record status change
    await ctx.db.insert("statusHistory", {
      projectId: args.projectId,
      previousPhase,
      newPhase: "setup",
      previousActionState,
      newActionState: previousActionState,
      changedBy: ctx.profile._id,
      changedAt: now(),
      notes: "Project unarchived",
    });

    return { success: true };
  },
});

/**
 * Soft delete a project (move to trash).
 * Sets deletedAt and deletedBy, making it invisible to standard queries.
 */
export const softDeleteProject = adminMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new ConvexError("Project not found");
    }

    if (project.deletedAt) {
      throw new ConvexError("Project is already in trash");
    }

    const previousPhase = project.phase;
    const previousActionState = project.actionState;
    const previousActor = project.awaitingActorRole;

    await ctx.db.patch(args.projectId, {
      deletedAt: now(),
      deletedBy: ctx.profile._id,
      updatedAt: now(),
    });

    // Record status change (optional but good for audit)
    await ctx.db.insert("statusHistory", {
      projectId: args.projectId,
      previousPhase,
      newPhase: previousPhase,
      previousActionState,
      newActionState: previousActionState,
      previousAwaitingActorRole: previousActor,
      newAwaitingActorRole: previousActor,
      changedBy: ctx.profile._id,
      changedAt: now(),
      notes: "Project moved to trash",
    });

    return { success: true };
  },
});

/**
 * Restore a soft-deleted project from trash.
 */
export const restoreProject = adminMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new ConvexError("Project not found");
    }

    if (!project.deletedAt) {
      throw new ConvexError("Project is not in trash");
    }

    await ctx.db.patch(args.projectId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now(),
    });

    await ctx.db.insert("statusHistory", {
      projectId: args.projectId,
      previousPhase: project.phase,
      newPhase: project.phase,
      previousActionState: project.actionState,
      newActionState: project.actionState,
      changedBy: ctx.profile._id,
      changedAt: now(),
      notes: "Project restored from trash",
    });

    return { success: true };
  },
});

/**
 * Permanently delete a project (admin only).
 * This removes the project and all related data, and unlinks quotations.
 */
export const permanentlyDeleteProject = adminMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new ConvexError("Project not found");
    }

    // 1. Unlink quotations (Story C-1 Requirement D)
    // NEVER cascade delete quotations (financial records)
    const quotations = await ctx.db
      .query("quotations")
      .withIndex("by_studioId", (q) => q.eq("studioId", project.studioId!))
      .collect();

    for (const quotation of quotations) {
      const projectIds = quotation.projectIds || [];
      if (
        quotation.projectId === args.projectId ||
        projectIds.includes(args.projectId)
      ) {
        const updatedProjectIds = projectIds.filter(
          (id) => id !== args.projectId,
        );
        const note = `Project ${project.code} deleted on ${new Date().toISOString()}`;

        await ctx.db.patch(quotation._id, {
          projectIds: updatedProjectIds,
          projectId:
            quotation.projectId === args.projectId
              ? updatedProjectIds[0] || undefined
              : quotation.projectId,
          studioNotes: quotation.studioNotes
            ? `${quotation.studioNotes}\n[System Note: ${note}]`
            : `[System Note: ${note}]`,
        });
      }
    }

    // 2. Collect MinIO keys for cleanup (to be used by action later)
    const fileKeys: string[] = [];

    // 3. Delete related data in order (children first)

    // A. Delete assets (belongs to folders and projects)
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const asset of assets) {
      if (asset.minioKey) fileKeys.push(asset.minioKey);
      await ctx.db.delete(asset._id);
    }

    // B. Delete reference files
    if (project.referenceFiles) {
      for (const file of project.referenceFiles) {
        if (file.storageKey) fileKeys.push(file.storageKey);
      }
    }

    // C. Delete folders
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const folder of folders) {
      await ctx.db.delete(folder._id);
    }

    // D. Delete deliverables
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const deliverable of deliverables) {
      if (deliverable.minioKey) fileKeys.push(deliverable.minioKey);
      await ctx.db.delete(deliverable._id);
    }

    // NEW: Delete version requests
    const versionRequests = await ctx.db
      .query("versionRequests")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const request of versionRequests) {
      await ctx.db.delete(request._id);
    }

    // E. Delete status history
    const statusHistory = await ctx.db
      .query("statusHistory")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const record of statusHistory) {
      await ctx.db.delete(record._id);
    }

    // F. Delete the project itself
    await ctx.db.delete(args.projectId);

    return { success: true, fileKeys };
  },
});

/**
 * Link a project to an existing approved quotation.
 * Story: 3-12
 * This enables folder setup to use the quotation's storage pool.
 */
export const linkProjectToQuotation = adminMutation({
  args: {
    projectId: v.id("projects"),
    quotationId: v.id("quotations"),
  },
  handler: async (ctx, args) => {
    // 1. Get the project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new ConvexError("Project not found");
    }

    // 2. Get the quotation
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new ConvexError("Quotation not found");
    }

    // 3. Validate quotation is approved
    if (quotation.status !== "approved") {
      throw new ConvexError("Quotation must be approved to link");
    }

    // 4. Validate client match
    if (
      project.studioId &&
      quotation.studioId &&
      project.studioId !== quotation.studioId
    ) {
      throw new ConvexError("Quotation belongs to a different client");
    }

    // 5. Update the quotation to include this project
    const existingProjectIds = quotation.projectIds || [];

    if (!existingProjectIds.includes(args.projectId)) {
      // Add to projectIds array
      await ctx.db.patch(args.quotationId, {
        projectIds: [...existingProjectIds, args.projectId],
        // Also set single projectId for backward compatibility if not set
        projectId: quotation.projectId || args.projectId,
      });
    }

    // CRITICAL: If project is in awaiting_quotation, transition it to quotation_approved
    if (
      project.actionState === "awaiting_quotation" ||
      project.actionState === "draft"
    ) {
      const newPhase = getPhaseForState("quotation_approved");
      const newActor = getActorForState("quotation_approved");

      await ctx.db.patch(args.projectId, {
        phase: newPhase,
        actionState: "quotation_approved",
        awaitingActorRole: newActor,
        quotationApprovedAt: now(),
        updatedAt: now(),
      });

      // Record status history
      await ctx.db.insert("statusHistory", {
        projectId: args.projectId,
        previousPhase: project.phase,
        newPhase: newPhase,
        previousActionState: project.actionState,
        newActionState: "quotation_approved",
        previousAwaitingActorRole: project.awaitingActorRole,
        newAwaitingActorRole: newActor,
        changedBy: ctx.profile._id,
        changedAt: now(),
        notes: `Linked project to approved quotation ${quotation.code}`,
      });
    }

    return {
      success: true,
      quotationCode: quotation.code,
      quotationTotal: quotation.total,
    };
  },
});

/**
 * Unlink a project from a quotation.
 * Story: 3-12
 */
export const unlinkProjectFromQuotation = adminMutation({
  args: {
    projectId: v.id("projects"),
    quotationId: v.id("quotations"),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new ConvexError("Quotation not found");
    }

    const existingProjectIds = quotation.projectIds || [];

    // Remove from projectIds array
    const updatedProjectIds = existingProjectIds.filter(
      (id) => id !== args.projectId,
    );

    await ctx.db.patch(args.quotationId, {
      projectIds: updatedProjectIds,
      // Clear single projectId if it matches
      projectId:
        quotation.projectId === args.projectId
          ? updatedProjectIds[0] || undefined
          : quotation.projectId,
    });

    // Also reset project's storage allocation if it was from this quotation
    const project = await ctx.db.get(args.projectId);
    if (project && project.storageAllocated) {
      await ctx.db.patch(args.projectId, {
        storageAllocated: undefined,
        updatedAt: now(),
      });
    }

    return { success: true };
  },
});

/**
 * Update project storage allocation (admin only).
 */
export const updateStorageAllocation = adminMutation({
  args: {
    projectId: v.id("projects"),
    storageAllocated: v.number(), // in bytes
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new ConvexError("Project not found");
    }

    await ctx.db.patch(args.projectId, {
      storageAllocated: args.storageAllocated,
      updatedAt: now(),
    });

    // Record status history
    await ctx.db.insert("statusHistory", {
      projectId: args.projectId,
      previousPhase: project.phase,
      newPhase: project.phase,
      previousActionState: project.actionState,
      newActionState: project.actionState,
      changedBy: ctx.profile._id,
      changedAt: now(),
      notes: `Storage allocation updated to ${args.storageAllocated / (1024 * 1024 * 1024)} GB`,
    });

    return { success: true };
  },
});
