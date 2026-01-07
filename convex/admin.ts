/**
 * Admin Dashboard Queries
 *
 * Provides real-time dashboard statistics and pending projects list
 * for the admin portal.
 */

import { v } from 'convex/values'
import { adminQuery } from './lib/customFunctions'

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

/**
 * Get all projects for admin listing with filters and pagination.
 */
export const getAdminProjects = adminQuery({
  args: {
    status: v.optional(v.string()),
    projectTypeId: v.optional(v.id('projectTypes')),
    clientSearch: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal('date'), v.literal('status'))),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1
    const pageSize = args.pageSize ?? 20
    const sortOrder = args.sortOrder ?? 'desc'

    // Get all projects - filter by status if provided
    let allProjects
    if (args.status) {
      allProjects = await ctx.db
        .query('projects')
        .withIndex('by_status', (q) => q.eq('status', args.status as any))
        .order(sortOrder)
        .collect()
    } else {
      allProjects = await ctx.db
        .query('projects')
        .order(sortOrder)
        .collect()
    }

    // Apply projectTypeId filter in memory (no index for this)
    if (args.projectTypeId) {
      allProjects = allProjects.filter(
        (p) => p.projectTypeId === args.projectTypeId
      )
    }

    // Get all project types and clients for enrichment
    const projectTypes = await ctx.db.query('projectTypes').collect()
    const projectTypeMap = new Map(projectTypes.map((pt) => [pt._id, pt]))

    const clients = await ctx.db
      .query('profiles')
      .withIndex('by_role', (q) => q.eq('role', 'client'))
      .collect()
    const clientMap = new Map(clients.map((c) => [c._id, c]))

    // Enrich projects with type and client names
    let enrichedProjects = allProjects.map((project) => {
      const projectType = projectTypeMap.get(project.projectTypeId)
      const client = clientMap.get(project.clientId)

      return {
        _id: project._id,
        code: project.code,
        status: project.status,
        projectTypeName: projectType?.name ?? 'Unknown',
        clientName: client?.name ?? 'Unknown Client',
        clientId: project.clientId,
        eventName: project.eventName,
        eventDate: project.eventDate,
        createdAt: project._creationTime,
        updatedAt: project.updatedAt,
      }
    })

    // Apply client search filter in memory
    if (args.clientSearch) {
      const search = args.clientSearch.toLowerCase()
      enrichedProjects = enrichedProjects.filter(
        (p) =>
          p.clientName.toLowerCase().includes(search) ||
          p.code.toLowerCase().includes(search)
      )
    }

    // Sort by status if requested
    if (args.sortBy === 'status') {
      const statusOrder = [
        'pending_review',
        'active',
        'in_progress',
        'completed',
        'archived',
        'draft',
      ]
      enrichedProjects.sort((a, b) => {
        const aIndex = statusOrder.indexOf(a.status)
        const bIndex = statusOrder.indexOf(b.status)
        return sortOrder === 'asc' ? aIndex - bIndex : bIndex - aIndex
      })
    }

    // Calculate pagination
    const totalCount = enrichedProjects.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = (page - 1) * pageSize
    const paginatedProjects = enrichedProjects.slice(
      startIndex,
      startIndex + pageSize
    )

    return {
      projects: paginatedProjects,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  },
})

/**
 * Get all project types for filter dropdown.
 */
export const getProjectTypes = adminQuery({
  args: {},
  handler: async (ctx) => {
    const projectTypes = await ctx.db.query('projectTypes').collect()
    return projectTypes.map((pt) => ({
      _id: pt._id,
      name: pt.name,
      category: pt.category,
      isActive: pt.isActive,
    }))
  },
})

