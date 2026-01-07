/**
 * Admin Dashboard Queries
 *
 * Provides real-time dashboard statistics and pending projects list
 * for the admin portal.
 */

import { adminQuery } from '../../lib/customFunctions'

/**
 * Get admin dashboard statistics.
 * Returns counts for pending requests, active projects, and team members.
 */
export const getAdminDashboardStats = adminQuery({
  args: {},
  handler: async (ctx) => {
    // Count pending requests (status: pending_review)
    const pendingProjects = await ctx.db
      .query('projects')
      .withIndex('by_status', (q) => q.eq('status', 'pending_review'))
      .collect()
    const pendingRequestsCount = pendingProjects.length

    // Count active projects (status: active or in_progress)
    const activeProjects = await ctx.db
      .query('projects')
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'active'),
          q.eq(q.field('status'), 'in_progress')
        )
      )
      .collect()
    const activeProjectsCount = activeProjects.length

    // Count team members (role: employee or admin)
    const teamMembers = await ctx.db
      .query('profiles')
      .filter((q) =>
        q.or(
          q.eq(q.field('role'), 'employee'),
          q.eq(q.field('role'), 'admin')
        )
      )
      .collect()
    const totalEmployeesCount = teamMembers.length

    return {
      pendingRequestsCount,
      activeProjectsCount,
      totalEmployeesCount,
    }
  },
})

/**
 * Get pending projects list for admin dashboard.
 * Returns up to 10 most recent projects with status 'pending_review',
 * including project type and client information.
 */
export const getPendingProjects = adminQuery({
  args: {},
  handler: async (ctx) => {
    // Get pending projects sorted by creation time (newest first)
    const pendingProjects = await ctx.db
      .query('projects')
      .withIndex('by_status', (q) => q.eq('status', 'pending_review'))
      .order('desc')
      .take(10)

    // Enrich with project type and client information
    const enrichedProjects = await Promise.all(
      pendingProjects.map(async (project) => {
        // Get project type
        const projectType = await ctx.db.get(project.projectTypeId)

        // Get client profile
        const client = await ctx.db.get(project.clientId)

        return {
          _id: project._id,
          code: project.code,
          projectTypeName: projectType?.name ?? 'Unknown',
          clientName: client?.name ?? 'Unknown Client',
          eventName: project.eventName,
          eventDate: project.eventDate,
          createdAt: project._creationTime,
        }
      })
    )

    return enrichedProjects
  },
})
