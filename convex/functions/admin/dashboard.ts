import { v } from "convex/values";
import { Doc, Id } from "../../_generated/dataModel";
import { adminQuery } from "../../lib/customFunctions";

/**
 * Get admin dashboard statistics.
 */
export const getAdminDashboardStats = adminQuery({
  args: {},
  handler: async (ctx) => {
    // Count pending requests (actionState: awaiting_quotation)
    const pendingProjects = await ctx.db
      .query("projects")
      .withIndex("by_actionState", (q) =>
        q.eq("actionState", "awaiting_quotation"),
      )
      .collect();
    const pendingRequestsCount = pendingProjects.length;

    // Count active projects (phases: onboarding, production, review, delivery)
    const onboarding = await ctx.db
      .query("projects")
      .withIndex("by_phase", (q) => q.eq("phase", "onboarding"))
      .collect();
    const production = await ctx.db
      .query("projects")
      .withIndex("by_phase", (q) => q.eq("phase", "production"))
      .collect();
    const review = await ctx.db
      .query("projects")
      .withIndex("by_phase", (q) => q.eq("phase", "review"))
      .collect();
    const delivery = await ctx.db
      .query("projects")
      .withIndex("by_phase", (q) => q.eq("phase", "delivery"))
      .collect();

    const activeProjectsCount =
      onboarding.length + production.length + review.length + delivery.length;

    const teamMembers = await ctx.db
      .query("profiles")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("role"), "employee"),
            q.eq(q.field("role"), "admin"),
          ),
          q.eq(q.field("deactivatedAt"), undefined),
        ),
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
      .withIndex("by_actionState", (q) =>
        q.eq("actionState", "awaiting_quotation"),
      )
      .order("desc")
      .take(10);

    const enrichedProjects = await Promise.all(
      pendingProjects.map(async (project) => {
        const projectType = await ctx.db.get(project.projectTypeId);
        const client = project.studioId
          ? await ctx.db.get(project.studioId)
          : null;

        return {
          _id: project._id,
          code: project.code,
          projectTypeName: projectType?.name ?? "Unknown",
          studioName: client?.name ?? "Unknown Client",
          eventName: project.endClientName,
          eventDate: project.preferredDeliveryDate,
          createdAt: project._creationTime,
        };
      }),
    );

    return enrichedProjects;
  },
});
