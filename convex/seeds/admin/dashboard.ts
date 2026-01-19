import { v } from "convex/values";
import { adminQuery } from "../../lib/customFunctions";
import { Doc, Id } from "../../_generated/dataModel";

/**
 * Get admin dashboard statistics.
 */
export const getAdminDashboardStats = adminQuery({
  args: {},
  handler: async (ctx) => {
    const pendingProjects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "pending_review"))
      .collect();
    const pendingRequestsCount = pendingProjects.length;

    const activeProjects = await ctx.db
      .query("projects")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("status"), "in_progress"),
          ),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();
    const activeProjectsCount = activeProjects.length;

    const teamMembers = await ctx.db
      .query("profiles")
      .filter((q) =>
        q.and(
          q.or(q.eq(q.field("role"), "employee"), q.eq(q.field("role"), "admin")),
          q.eq(q.field("deactivatedAt"), undefined)
        )
      )
      .collect();
    const totalEmployeesCount = teamMembers.length;

    return {
      pendingRequestsCount,
      activeProjectsCount,
      totalEmployeesCount,
    };
  },
});

/**
 * Get pending projects list for admin dashboard.
 */
export const getPendingProjects = adminQuery({
  args: {},
  handler: async (ctx) => {
    const pendingProjects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "pending_review"))
      .order("desc")
      .take(10);

    const enrichedProjects = await Promise.all(
      pendingProjects.map(async (project) => {
        const projectType = await ctx.db.get(project.projectTypeId);
        const client = project.clientId
          ? await ctx.db.get(project.clientId)
          : null;

        return {
          _id: project._id,
          code: project.code,
          projectTypeName: projectType?.name ?? "Unknown",
          clientName: client?.name ?? "Unknown Client",
          eventName: project.eventName,
          eventDate: project.eventDate,
          createdAt: project._creationTime,
        };
      }),
    );

    return enrichedProjects;
  },
});
