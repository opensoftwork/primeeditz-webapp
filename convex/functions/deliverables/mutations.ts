import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUserWithProfile } from "../../lib/customFunctions";
import { now } from "../../lib/helpers";
import { deliverableStatusValidator } from "../../schema";

/**
 * Create a new deliverable record after successful upload by employee.
 * Also creates a V1 entry in deliverableVersions for history tracking.
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

    // Check for existing root deliverable with same name (for version incrementing)
    const existingDeliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const existingRoot = existingDeliverables
      .filter((d) => d.name === args.name && !d.parentDeliverableId)
      .sort((a, b) => b.version - a.version)[0];

    const version = existingRoot ? existingRoot.version + 1 : 1;

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

    // Also create V1 entry in deliverableVersions for history tracking
    const versionId = await ctx.db.insert("deliverableVersions", {
      deliverableId,
      projectId: args.projectId,
      versionNumber: version,
      minioKey: args.minioKey,
      sizeBytes: args.sizeBytes,
      mimeType: args.mimeType,
      uploadedBy: profile._id,
      uploadedByRole: profile.role === "admin" ? "admin" : "employee",
      description: args.description,
      createdAt: now(),
    });

    // Update deliverable with latestVersionId
    await ctx.db.patch(deliverableId, {
      latestVersionId: versionId,
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
 * Reject a deliverable (QC failed).
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
 *
 * FLOW:
 * - Admin requests → routes to employee for rework
 * - Studio requests → routes to ADMIN for triage (admin decides: delegate to employee or fix it themselves)
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

    // Transition project state
    const project = await ctx.db.get(deliverable.projectId);
    if (project) {
      if (isAdmin) {
        // Admin → route to employee for rework
        await ctx.db.patch(deliverable.projectId, {
          actionState: "work_in_progress",
          awaitingActorRole: "employee",
          awaitingActorId: project.assignedEmployeeId,
          updatedAt: now(),
        });
      } else if (isStudio) {
        // Studio → route to ADMIN for triage (not directly to employee)
        await ctx.db.patch(deliverable.projectId, {
          actionState: "versions_requested",
          awaitingActorRole: "admin", // Admin triages first
          awaitingActorId: undefined, // Goes to admin pool
          versionCount: (project.versionCount || 0) + 1,
          updatedAt: now(),
        });
      }

      // Create handoff log
      await ctx.db.insert("handoffLogs", {
        projectId: deliverable.projectId,
        fromProfileId: profile._id,
        toProfileId: isAdmin ? project.assignedEmployeeId : undefined,
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
 *
 * KEY CHANGE (Epic 16 fix): This mutation now UPDATES the existing deliverable
 * in-place instead of creating a new deliverable row. The new file is recorded
 * in the deliverableVersions table for history tracking.
 *
 * Before: Created D2 as child of D1 → caused duplicates and UI confusion
 * After:  Updates D1's cached fields (minioKey, version, etc.) and creates
 *         a deliverableVersions entry for audit trail
 */
export const uploadCorrectedVersion = mutation({
  args: {
    parentDeliverableId: v.id("deliverables"), // The deliverable being updated
    name: v.string(),
    minioKey: v.string(),
    sizeBytes: v.number(),
    mimeType: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Get the deliverable (the "parent" IS the deliverable we're updating)
    const deliverable = await ctx.db.get(args.parentDeliverableId);
    if (!deliverable) throw new Error("Deliverable not found");

    // Verify the deliverable has a pending version
    if (
      deliverable.status !== "version_requested" &&
      deliverable.status !== "version_needed" &&
      deliverable.status !== "revision_requested"
    ) {
      throw new Error("Deliverable does not have a pending version request");
    }

    // Increment version number
    const newVersion = deliverable.version + 1;

    // 1. Create version history entry in deliverableVersions
    const versionId = await ctx.db.insert("deliverableVersions", {
      deliverableId: args.parentDeliverableId,
      projectId: deliverable.projectId,
      versionNumber: newVersion,
      minioKey: args.minioKey,
      sizeBytes: args.sizeBytes,
      mimeType: args.mimeType,
      uploadedBy: profile._id,
      uploadedByRole: profile.role === "admin" ? "admin" : "employee",
      description: args.description,
      createdAt: now(),
    });

    // 2. UPDATE the deliverable IN-PLACE (no new deliverable row!)
    await ctx.db.patch(args.parentDeliverableId, {
      version: newVersion,
      minioKey: args.minioKey,
      sizeBytes: args.sizeBytes,
      mimeType: args.mimeType,
      status: "pending_qc", // Goes back for QC review
      latestVersionId: versionId,
      versionFeedback: undefined, // Clear old feedback
      rejectionNotes: undefined, // Clear old rejection notes
    });

    // 3. Resolve all pending version requests on this deliverable
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
        resolvedDeliverableId: args.parentDeliverableId, // Points to same deliverable (now updated)
        resolvedAt: now(),
      });
    }

    // 4. Transition project state back to deliverables_ready (awaiting admin QC)
    const project = await ctx.db.get(deliverable.projectId);
    if (project) {
      await ctx.db.patch(deliverable.projectId, {
        actionState: "deliverables_ready",
        awaitingActorRole: "admin",
        updatedAt: now(),
      });

      // Create handoff log
      await ctx.db.insert("handoffLogs", {
        projectId: deliverable.projectId,
        fromProfileId: profile._id,
        toProfileId: undefined, // Goes to admin pool
        fromActionState: project.actionState,
        toActionState: "deliverables_ready",
        notes: `Version v${newVersion} uploaded for "${args.name}"`,
        createdAt: now(),
      });
    }

    return { deliverableId: args.parentDeliverableId, version: newVersion };
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
