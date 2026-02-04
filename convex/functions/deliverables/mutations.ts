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
      mimeType: args.mimeType,
      uploadedBy: profile._id,
    });

    return deliverableId;
  },
});

/**
 * Approve a deliverable after QC review.
 * Only admin can approve.
 */
export const approveDeliverable = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    qcNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Verify admin role
    if (profile.role !== "admin") {
      throw new Error("Only admin can approve deliverables");
    }

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) throw new Error("Deliverable not found");

    // Update deliverable status
    await ctx.db.patch(args.deliverableId, {
      status: "approved",
      qcReviewedBy: profile._id,
      qcNotes: args.qcNotes,
    });

    // Optionally update project state
    const project = await ctx.db.get(deliverable.projectId);
    if (project && project.actionState === "deliverables_ready") {
      await ctx.db.patch(deliverable.projectId, {
        actionState: "awaiting_review",
        awaitingActorRole: "studio",
        updatedAt: now(),
      });
    }

    return { success: true };
  },
});

/**
 * Request revision on a deliverable.
 * Sends it back to employee for rework.
 */
export const requestRevision = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    rejectionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Verify admin role
    if (profile.role !== "admin") {
      throw new Error("Only admin can request revisions");
    }

    if (!args.rejectionNotes.trim()) {
      throw new Error("Revision notes are required");
    }

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) throw new Error("Deliverable not found");

    // Update deliverable status
    await ctx.db.patch(args.deliverableId, {
      status: "revision_requested",
      qcReviewedBy: profile._id,
      rejectionNotes: args.rejectionNotes,
    });

    // Transition project back to work_in_progress
    const project = await ctx.db.get(deliverable.projectId);
    if (project) {
      await ctx.db.patch(deliverable.projectId, {
        actionState: "work_in_progress",
        awaitingActorRole: "employee",
        awaitingActorId: project.assignedEmployeeId,
        updatedAt: now(),
      });

      // Record handoff log
      await ctx.db.insert("handoffLogs", {
        projectId: deliverable.projectId,
        fromProfileId: profile._id,
        toProfileId: project.assignedEmployeeId,
        fromActionState: "deliverables_ready",
        toActionState: "work_in_progress",
        notes: `Revision requested: ${args.rejectionNotes}`,
        createdAt: now(),
      });
    }

    return { success: true };
  },
});

/**
 * Reject a deliverable entirely.
 * Marks as revision_needed without sending back to employee.
 */
export const rejectDeliverable = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    rejectionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Verify admin role
    if (profile.role !== "admin") {
      throw new Error("Only admin can reject deliverables");
    }

    if (!args.rejectionNotes.trim()) {
      throw new Error("Rejection notes are required");
    }

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) throw new Error("Deliverable not found");

    // Update deliverable status
    await ctx.db.patch(args.deliverableId, {
      status: "revision_needed",
      qcReviewedBy: profile._id,
      rejectionNotes: args.rejectionNotes,
    });

    return { success: true };
  },
});

/**
 * Send approved deliverable to studio/client for review.
 */
export const sendToStudio = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Verify admin role
    if (profile.role !== "admin") {
      throw new Error("Only admin can send deliverables to studio");
    }

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) throw new Error("Deliverable not found");

    if (deliverable.status !== "approved") {
      throw new Error("Only approved deliverables can be sent to studio");
    }

    // Get the project to find studio
    const project = await ctx.db.get(deliverable.projectId);
    if (!project) throw new Error("Project not found");
    if (!project.studioId) throw new Error("No studio associated with project");

    // Update project state to awaiting review by studio
    await ctx.db.patch(deliverable.projectId, {
      actionState: "awaiting_review",
      awaitingActorRole: "studio",
      awaitingActorId: project.studioId,
      updatedAt: now(),
    });

    // Record handoff
    await ctx.db.insert("handoffLogs", {
      projectId: deliverable.projectId,
      fromProfileId: profile._id,
      toProfileId: project.studioId,
      fromActionState: "deliverables_ready",
      toActionState: "awaiting_review",
      notes: args.notes || "Deliverable sent for studio review",
      createdAt: now(),
    });

    return { success: true, studioId: project.studioId };
  },
});

/**
 * Client approves all deliverables.
 * Transitions project to delivery phase.
 */
export const clientApproveDeliverables = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Verify studio ownership
    if (profile.role !== "admin" && project.studioId !== profile._id) {
      throw new Error("Unauthorized to approve these deliverables");
    }

    // Transition to delivery phase
    await ctx.db.patch(args.projectId, {
      phase: "delivery",
      actionState: "review_approved",
      awaitingActorRole: "admin",
      reviewApprovedAt: now(),
      updatedAt: now(),
    });

    // Create status history entry
    await ctx.db.insert("statusHistory", {
      projectId: args.projectId,
      previousPhase: "review",
      newPhase: "delivery",
      previousActionState: "awaiting_review",
      newActionState: "review_approved",
      changedBy: profile._id,
      changedAt: now(),
      notes: "Client approved all deliverables",
    });

    return { success: true };
  },
});

/**
 * Client requests revision on deliverables.
 * Transitions project back to production.
 */
export const clientRequestRevision = mutation({
  args: {
    projectId: v.id("projects"),
    revisionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Verify studio ownership
    if (profile.role !== "admin" && project.studioId !== profile._id) {
      throw new Error("Unauthorized to request revisions");
    }

    const currentRevisions = project.revisionCount || 0;

    // Transition back to production
    await ctx.db.patch(args.projectId, {
      actionState: "revisions_requested",
      awaitingActorRole: "employee",
      awaitingActorId: project.assignedEmployeeId,
      revisionCount: currentRevisions + 1,
      updatedAt: now(),
    });

    // Create handoff log
    await ctx.db.insert("handoffLogs", {
      projectId: args.projectId,
      fromProfileId: profile._id,
      toProfileId: project.assignedEmployeeId,
      fromActionState: "awaiting_review",
      toActionState: "revisions_requested",
      notes: args.revisionNotes,
      createdAt: now(),
    });

    return {
      success: true,
      revisionCount: currentRevisions + 1,
      isOverLimit: currentRevisions + 1 >= 3,
    };
  },
});
