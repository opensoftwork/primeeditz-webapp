import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { Role, ActionState } from "../schema";

export interface UploadPermission {
  allowed: boolean;
  reason: string;
  canOverride?: boolean;
}

/**
 * Validates if a user is eligible to upload assets to a project.
 * Implements Story 5A.3 rules.
 */
export async function canUpload(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userRole: Role,
  userId?: Id<"profiles">
): Promise<UploadPermission> {
  const project = await ctx.db.get(projectId);
  if (!project) {
    return { allowed: false, reason: "Project not found" };
  }

  const { actionState, source, assignedEmployeeId } = project;

  // 1. Admin-initiated projects (Internal Projects)
  if (source === "admin_init" && userRole === "admin") {
    const allowedAdminStates = [
      "storage_allocated",
      "awaiting_uploads",
      "uploads_complete",
      "assigned",
      "work_in_progress",
      "deliverables_ready",
      "awaiting_review",
      "revisions_requested"
    ];
    if (allowedAdminStates.includes(actionState)) {
      return {
        allowed: true,
        reason: "Internal project - Admin upload allowed",
      };
    }
  }

  // 2. Client Permissions
  if (userRole === "studio") {
    switch (actionState) {
      case "awaiting_uploads":
      case "uploads_complete":
        return { allowed: true, reason: "Ready to upload" };
      case "draft":
        return { allowed: false, reason: "Project request not submitted" };
      case "awaiting_quotation":
        return { allowed: false, reason: "Waiting for quotation" };
      case "quotation_sent":
        return { allowed: false, reason: "Review and approve quotation first" };
      case "quotation_approved":
      case "storage_allocated":
        return { allowed: false, reason: "Upload area is being prepared" };
      default:
        return { allowed: false, reason: "Upload phase is complete" };
    }
  }

  // 3. Admin Permissions
  if (userRole === "admin") {
    switch (actionState) {
      case "storage_allocated":
      case "uploads_complete":
      case "awaiting_assignment":
      case "assigned":
      case "work_in_progress":
      case "deliverables_ready":
      case "awaiting_review":
      case "revisions_requested":
        return { allowed: true, reason: "Admin can upload" };
      case "awaiting_uploads":
        return {
          allowed: false,
          reason: "Waiting for client to upload files",
          canOverride: true,
        };
      default:
        return { allowed: false, reason: "Not at upload stage" };
    }
  }

  // 4. Employee Permissions
  if (userRole === "employee") {
    // Must be assigned to this project
    if (!assignedEmployeeId || assignedEmployeeId !== userId) {
      return { allowed: false, reason: "Not assigned to this project" };
    }

    switch (actionState) {
      case "assigned":
      case "work_in_progress":
      case "revisions_requested":
        return { allowed: true, reason: "Upload deliverables" };
      default:
        return { allowed: false, reason: "Not in production phase" };
    }
  }

  return { allowed: false, reason: "Unknown role or denied" };
}

/**
 * Backward compatible alias for existing checks.
 */
export async function checkUploadEligibility(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
): Promise<{ isAllowed: boolean; reason: string; canOverride: boolean }> {
  const profile = (ctx as any).profile;
  const permission = await canUpload(
    ctx,
    projectId,
    profile?.role ?? "studio",
    profile?._id
  );

  return {
    isAllowed: permission.allowed,
    reason: permission.reason,
    canOverride: !!permission.canOverride,
  };
}
