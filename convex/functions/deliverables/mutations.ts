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

    // Removal of automatic transition to awaiting_review.
    // Admin must now manually click "Send to Studio".

    return { success: true };
  },
});

/**
 * @deprecated Use `createVersionRequest` instead.
 * Kept for backward compatibility during migration.
 * Request version on a deliverable. Sends it back to employee for rework.
 */
export const requestVersion = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    versionFeedback: v.string(),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Verify admin role
    if (profile.role !== "admin") {
      throw new Error("Only admin can request versions");
    }

    if (!args.versionFeedback.trim()) {
      throw new Error("Version notes are required");
    }

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) throw new Error("Deliverable not found");

    // Update deliverable status
    await ctx.db.patch(args.deliverableId, {
      status: "version_requested",
      qcReviewedBy: profile._id,
      versionFeedback: args.versionFeedback,
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
        notes: `Version requested: ${args.versionFeedback}`,
        createdAt: now(),
      });
    }

    return { success: true };
  },
});

/**
 * @deprecated Use `createVersionRequest` instead.
 * Kept for backward compatibility during migration.
 * Reject a deliverable entirely.
 * Marks as version_needed without sending back to employee.
 */
/**
 * Reject a deliverable (QC failed).
 * @deprecated Use createVersionRequest instead.
 */
export const rejectDeliverable = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    versionFeedback: v.string(),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Verify admin role
    if (profile.role !== "admin") {
      throw new Error("Only admin can reject deliverables");
    }

    if (!args.versionFeedback.trim()) {
      throw new Error("Feedback notes are required");
    }

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) throw new Error("Deliverable not found");

    // Update deliverable status
    await ctx.db.patch(args.deliverableId, {
      status: "version_needed",
      qcReviewedBy: profile._id,
      versionFeedback: args.versionFeedback,
      qcNotes: args.versionFeedback,
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
 * @deprecated Use `createVersionRequest` (deliverable-level) instead.
 * Client requests version on deliverables.
 * Transitions project back to production.
 */
export const clientRequestVersion = mutation({
  args: {
    projectId: v.id("projects"),
    versionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Verify studio ownership
    if (profile.role !== "admin" && project.studioId !== profile._id) {
      throw new Error("Unauthorized to request versions");
    }

    const currentVersions = project.versionCount || 0;

    // Transition back to production
    await ctx.db.patch(args.projectId, {
      actionState: "versions_requested",
      awaitingActorRole: "employee",
      awaitingActorId: project.assignedEmployeeId,
      versionCount: currentVersions + 1,
      updatedAt: now(),
    });

    // Create handoff log
    await ctx.db.insert("handoffLogs", {
      projectId: args.projectId,
      fromProfileId: profile._id,
      toProfileId: project.assignedEmployeeId,
      fromActionState: "awaiting_review",
      toActionState: "versions_requested",
      notes: args.versionNotes,
      createdAt: now(),
    });

    return {
      success: true,
      versionCount: currentVersions + 1,
      isOverLimit: currentVersions + 1 >= 3,
    };
  },
});

/**
 * Create a structured version request for a deliverable.
 * Replaces legacy requestVersion and rejectDeliverable.
 */
export const createVersionRequest = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    notes: v.string(),
    referenceImages: v.optional(
      v.array(
        v.object({
          fileName: v.string(),
          fileSize: v.number(),
          mimeType: v.string(),
          minioKey: v.string(),
          note: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) throw new Error("Deliverable not found");

    // Determine role-based behavior
    const isAdmin = profile.role === "admin";
    const isStudio = profile.role === "studio";

    if (!isAdmin && !isStudio) {
      throw new Error("Only admin or studio can create version requests");
    }

    // Validate deliverable is in a revisable state
    if (isAdmin && deliverable.status !== "pending_qc") {
      throw new Error(
        "Admin can only request versions for deliverables in pending_qc status",
      );
    }
    if (isStudio && deliverable.status !== "approved") {
      throw new Error("Studio can only request versions for approved deliverables");
    }

    // Auto-increment version number
    const existingRequests = await ctx.db
      .query("versionRequests")
      .withIndex("by_deliverableId", (q) =>
        q.eq("deliverableId", args.deliverableId),
      )
      .collect();
    const versionNumber = existingRequests.length + 1;

    // Create the version request
    const requestId = await ctx.db.insert("versionRequests", {
      deliverableId: args.deliverableId,
      projectId: deliverable.projectId,
      requestedBy: profile._id,
      requestedByRole: isAdmin ? "admin" : "studio",
      versionNumber,
      notes: args.notes,
      referenceImages: args.referenceImages,
      status: "pending",
      createdAt: now(),
    });

    // Update deliverable status
    const newStatus = isAdmin ? "version_requested" : "version_needed";
    await ctx.db.patch(args.deliverableId, {
      status: newStatus,
      versionFeedback: args.notes,
    });

    // Transition project state (same as existing requestVersion logic)
    const project = await ctx.db.get(deliverable.projectId);
    if (project) {
      if (isAdmin) {
        await ctx.db.patch(deliverable.projectId, {
          actionState: "work_in_progress",
          awaitingActorRole: "employee",
          awaitingActorId: project.assignedEmployeeId,
          updatedAt: now(),
        });
      } else if (isStudio) {
        await ctx.db.patch(deliverable.projectId, {
          actionState: "versions_requested",
          awaitingActorRole: "employee",
          awaitingActorId: project.assignedEmployeeId,
          versionCount: (project.versionCount || 0) + 1,
          updatedAt: now(),
        });
      }

      // Create handoff log
      await ctx.db.insert("handoffLogs", {
        projectId: deliverable.projectId,
        fromProfileId: profile._id,
        toProfileId: project.assignedEmployeeId,
        fromActionState: project.actionState,
        toActionState: isAdmin ? "work_in_progress" : "versions_requested",
        notes: `Version #${versionNumber}: ${args.notes}`,
        createdAt: now(),
      });
    }

    return { requestId, versionNumber };
  },
});

/**
 * Update the status of a version request.
 */
export const updateVersionRequestStatus = mutation({
  args: {
    requestId: v.id("versionRequests"),
    status: v.union(v.literal("in_progress"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Version request not found");

    const updates: any = { status: args.status };
    if (args.status === "resolved") {
      updates.resolvedAt = now();
    }

    await ctx.db.patch(args.requestId, updates);

    return { success: true };
  },
});

/**
 * Upload a corrected version of a deliverable.
 * Links it to the parent, resolves pending requests, and transitions project status.
 */
export const uploadCorrectedVersion = mutation({
  args: {
    parentDeliverableId: v.id("deliverables"),
    name: v.string(),
    minioKey: v.string(),
    sizeBytes: v.number(),
    mimeType: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Get the parent deliverable
    const parent = await ctx.db.get(args.parentDeliverableId);
    if (!parent) throw new Error("Parent deliverable not found");

    // Verify the parent has a pending version
    if (
      parent.status !== "version_requested" &&
      parent.status !== "version_needed"
    ) {
      throw new Error("Parent deliverable does not have a pending version");
    }

    // Auto-increment version based on name
    const existing = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", parent.projectId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .order("desc")
      .first();
    const version = existing ? existing.version + 1 : 1;

    // 1. Create the new corrected deliverable
    const newDeliverableId = await ctx.db.insert("deliverables", {
      projectId: parent.projectId,
      name: args.name,
      description: args.description,
      version,
      status: "pending_qc", // Goes back for QC review
      minioKey: args.minioKey,
      sizeBytes: args.sizeBytes,
      mimeType: args.mimeType,
      uploadedBy: profile._id,
      parentDeliverableId: args.parentDeliverableId, // Link to original
    });

    // 2. Resolve all pending version requests on the parent
    const pendingRequests = await ctx.db
      .query("versionRequests")
      .withIndex("by_deliverableId", (q) =>
        q.eq("deliverableId", args.parentDeliverableId),
      )
      .filter((q) => q.neq(q.field("status"), "resolved"))
      .collect();

    for (const request of pendingRequests) {
      await ctx.db.patch(request._id, {
        status: "resolved",
        resolvedDeliverableId: newDeliverableId,
        resolvedAt: now(),
      });
    }

    // 3. Transition project state back to deliverables_ready
    // Note: It's deliverables_ready because it's now awaiting Admin QC
    const project = await ctx.db.get(parent.projectId);
    if (project) {
      await ctx.db.patch(parent.projectId, {
        actionState: "deliverables_ready",
        awaitingActorRole: "admin",
        updatedAt: now(),
      });

      // Create handoff log
      await ctx.db.insert("handoffLogs", {
        projectId: parent.projectId,
        fromProfileId: profile._id,
        toProfileId: undefined, // Goes to admin pool
        fromActionState: project.actionState,
        toActionState: "deliverables_ready",
        notes: `Corrected version v${version} uploaded for "${args.name}"`,
        createdAt: now(),
      });
    }

    return { newDeliverableId, version };
  },
});

/**
 * Studio approves an individual deliverable.
 * This does NOT transition the project phase.
 */
export const studioApproveDeliverable = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Verify studio role and ownership
    if (profile.role !== "studio" && profile.role !== "admin") {
      throw new Error("Only studio or admin can approve deliverables");
    }

    if (profile.role === "studio" && project.studioId !== profile._id) {
      throw new Error("Unauthorized to approve this deliverable");
    }

    // Check if already approved
    const existing = await ctx.db
      .query("studioApprovals")
      .withIndex("by_deliverableId", (q) =>
        q.eq("deliverableId", args.deliverableId),
      )
      .first();

    if (existing) return { success: true };

    // Record approval
    await ctx.db.insert("studioApprovals", {
      deliverableId: args.deliverableId,
      projectId: args.projectId,
      studioProfileId: profile._id,
      approvedAt: now(),
    });

    return { success: true };
  },
});
