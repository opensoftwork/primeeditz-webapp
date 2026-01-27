import { ConvexError, v } from "convex/values";
import { Doc, Id } from "../../_generated/dataModel";
import { employeeQuery } from "../../lib/customFunctions";
import { enrichReferenceFilesWithUrls } from "../../lib/storageUtils";

/**
 * Get project details for an employee.
 * Verifies that the employee is part of the project's squad.
 */
export const getEmployeeProject = employeeQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const profileId = ctx.profile._id;
    const project = await ctx.db.get(args.projectId);

    if (!project) throw new ConvexError("Project not found");

    // Verify squad membership
    const squadMember = await ctx.db
      .query("projectSquads")
      .withIndex("by_project_profile", (q) =>
        q.eq("projectId", args.projectId).eq("profileId", profileId),
      )
      .filter((q) => q.eq(q.field("dissolvedAt"), undefined))
      .first();

    if (!squadMember && project.assignedEmployeeId !== profileId) {
      throw new ConvexError("Access denied: Not part of this project squad");
    }

    // Enrich with project type data
    const projectType = await ctx.db.get(project.projectTypeId);

    // Get full squad info
    const squad = await ctx.db
      .query("projectSquads")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("dissolvedAt"), undefined))
      .collect();

    const enrichedSquad = await Promise.all(
      squad.map(async (s) => {
        const profile = await ctx.db.get(s.profileId);
        return {
          ...s,
          profile,
        };
      }),
    );

    // Enrich reference files with proper URLs
    const referenceFiles = enrichReferenceFilesWithUrls(project.referenceFiles);

    // Get handoff logs
    const handoffLogs = await ctx.db
      .query("handoffLogs")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const enrichedHandoffLogs = await Promise.all(
      handoffLogs.map(async (log) => {
        const fromProfile = await ctx.db.get(log.fromProfileId);
        const toProfile = log.toProfileId
          ? await ctx.db.get(log.toProfileId)
          : null;
        return {
          ...log,
          fromProfile,
          toProfile,
        };
      }),
    );

    // Get status history
    const statusHistory = await ctx.db
      .query("statusHistory")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const enrichedStatusHistory = await Promise.all(
      statusHistory.map(async (h) => {
        const profile = await ctx.db.get(h.changedBy);
        return {
          ...h,
          actorName: profile?.name || "System",
        };
      }),
    );

    return {
      ...project,
      projectTypeName: projectType?.name ?? "Unknown",
      squad: enrichedSquad,
      referenceFiles,
      handoffLogs: enrichedHandoffLogs,
      statusHistory: enrichedStatusHistory,
      currentMemberRole: squadMember?.role || "Staff",
      isLead: squadMember?.isLead || project.assignedEmployeeId === profileId,
    };
  },
});
