import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * uploadGate: Validates if a project is eligible for asset uploads.
 * 
 * Rules:
 * 1. Project must exist.
 * 2. If source is 'client_request', an approved quotation MUST exist.
 * 3. If source is 'admin_init', the gate is bypassed (allowed).
 */
export async function checkUploadEligibility(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
) {
  const project = await ctx.db.get(projectId);
  if (!project) {
    return {
      isAllowed: false,
      reason: "Project not found",
    };
  }

  // 3. Admin user bypass
  const profile = (ctx as any).profile;
  if (profile?.role === "admin") {
    return {
      isAllowed: true,
      reason: "Admin bypass",
    };
  }

  // Admin-initiated projects bypass the quotation gate
  if (project.source === "admin_init") {
    return {
      isAllowed: true,
      reason: "Internal project: No quotation required",
    };
  }

  // For client requests, check for an approved quotation
  const projectIdString = projectId as string;
  
  // Check direct link
  let approvedQuotation = await ctx.db
    .query("quotations")
    .withIndex("by_status", (q) => q.eq("status", "approved"))
    .filter((q) => q.eq(q.field("projectId"), projectIdString))
    .first();

  // Check multi-project quotations
  if (!approvedQuotation) {
    const allApproved = await ctx.db
      .query("quotations")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
    
    approvedQuotation = allApproved.find((q) => 
      q.projectIds?.includes(projectIdString)
    ) || null;
  }

  if (approvedQuotation) {
    return {
      isAllowed: true,
      reason: "Approved quotation found",
    };
  }

  return {
    isAllowed: false,
    reason: "Quotation pending approval",
  };
}
