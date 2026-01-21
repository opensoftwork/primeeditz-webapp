/**
 * Employee Dashboard Functions
 * 
 * Queries for the employee dashboard view.
 */

import { v } from "convex/values";
import { employeeQuery } from "../../lib/customFunctions";

/**
 * Get stats for the employee dashboard.
 */
export const getEmployeeDashboardStats = employeeQuery({
  args: {},
  handler: async (ctx) => {
    const profileId = ctx.profile._id;

    const assignedProjects = await ctx.db
      .query("projects")
      .withIndex("by_assignedEmployeeId", (q) => q.eq("assignedEmployeeId", profileId))
      .collect();

    return {
      totalAssigned: assignedProjects.length,
      activeProjects: assignedProjects.filter(
        (p) => !["completed", "archived"].includes(p.phase) && p.actionState !== "cancelled"
      ).length,
      inProgress: assignedProjects.filter(
        (p) => p.actionState === "work_in_progress"
      ).length,
      delivered: assignedProjects.filter(
        (p) => p.actionState === "delivered" || p.phase === "completed"
      ).length,
    };
  },
});

/**
 * Get recent projects for the employee dashboard.
 */
export const getEmployeeRecentProjects = employeeQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const profileId = ctx.profile._id;
    const limit = args.limit ?? 5;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_assignedEmployeeId", (q) => q.eq("assignedEmployeeId", profileId))
      .order("desc")
      .take(limit);

    const projectTypes = await ctx.db.query("projectTypes").collect();
    const projectTypeMap = new Map(projectTypes.map((pt) => [pt._id, pt]));

    return projects.map((project) => ({
      _id: project._id,
      code: project.code,
      eventName: project.eventName,
      eventDate: project.eventDate,
      phase: project.phase,
      actionState: project.actionState,
      projectTypeName: projectTypeMap.get(project.projectTypeId)?.name ?? "Unknown",
      updatedAt: project.updatedAt,
    }));
  },
});
