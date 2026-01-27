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

    // 1. Get projects where employee is lead/directly assigned
    const assignedProjects = await ctx.db
      .query("projects")
      .withIndex("by_assignedEmployeeId", (q) =>
        q.eq("assignedEmployeeId", profileId),
      )
      .collect();

    // 2. Get projects where employee is in the squad
    const squadMemberships = await ctx.db
      .query("projectSquads")
      .withIndex("by_profileId", (q) => q.eq("profileId", profileId))
      .filter((q) => q.eq(q.field("dissolvedAt"), undefined))
      .collect();

    const squadProjectIds = squadMemberships.map((s) => s.projectId);

    // Combine unique project IDs
    const allProjectIds = new Set([
      ...assignedProjects.map((p) => p._id),
      ...squadProjectIds,
    ]);

    const allProjects = await Promise.all(
      Array.from(allProjectIds).map((id) => ctx.db.get(id)),
    );

    const validProjects = allProjects.filter(
      (p): p is NonNullable<typeof p> => !!p,
    );

    return {
      totalAssigned: validProjects.length,
      activeProjects: validProjects.filter(
        (p) =>
          !["completed", "archived"].includes(p.phase) &&
          p.actionState !== "cancelled",
      ).length,
      inProgress: validProjects.filter(
        (p) => p.actionState === "work_in_progress",
      ).length,
      delivered: validProjects.filter(
        (p) => p.actionState === "delivered" || p.phase === "completed",
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

    // 1. Get squad memberships
    const squadMemberships = await ctx.db
      .query("projectSquads")
      .withIndex("by_profileId", (q) => q.eq("profileId", profileId))
      .filter((q) => q.eq(q.field("dissolvedAt"), undefined))
      .collect();

    const squadProjectIds = squadMemberships.map((s) => s.projectId);

    // 2. Get assigned projects
    const assignedProjects = await ctx.db
      .query("projects")
      .withIndex("by_assignedEmployeeId", (q) =>
        q.eq("assignedEmployeeId", profileId),
      )
      .collect();

    const allIds = Array.from(
      new Set([...assignedProjects.map((p) => p._id), ...squadProjectIds]),
    );

    // Fetch projects and sort by updatedAt
    const projects = await Promise.all(allIds.map((id) => ctx.db.get(id)));

    const validSortedProjects = projects
      .filter((p): p is NonNullable<typeof p> => !!p)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);

    const projectTypes = await ctx.db.query("projectTypes").collect();
    const projectTypeMap = new Map(projectTypes.map((pt) => [pt._id, pt]));

    return validSortedProjects.map((project) => ({
      _id: project._id,
      code: project.code,
      eventName: project.endClientName,
      eventDate: project.preferredDeliveryDate,
      phase: project.phase,
      actionState: project.actionState,
      projectTypeName:
        projectTypeMap.get(project.projectTypeId)?.name ?? "Unknown",
      updatedAt: project.updatedAt,
    }));
  },
});
