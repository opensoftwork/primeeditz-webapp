/**
 * Project Queries
 *
 * Read operations for projects with role-based access.
 * Uses clientQuery for client-owned project access.
 */

import { v } from 'convex/values'
import { clientQuery, adminQuery } from '../../lib/customFunctions'
import { enrichReferenceFilesWithUrls } from '../../lib/storageUtils'
import type { Doc } from '../../_generated/dataModel'

// ============================================================================
// Client Queries
// ============================================================================

/**
 * Get all projects for the current client.
 * Excludes drafts - only shows submitted projects.
 */
export const getMyProjects = clientQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_clientId', (q) => q.eq('clientId', ctx.profile._id))
      .filter((q) => q.neq(q.field('status'), 'draft'))
      .order('desc')
      .collect()

    return projects
  },
})

/**
 * Get a draft project for the current client.
 * Used by the wizard to resume a draft.
 */
export const getDraft = clientQuery({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    // Verify ownership
    if (project.clientId !== ctx.profile._id) {
      throw new Error('Access denied')
    }

    // Only return if it's a draft
    if (project.status !== 'draft') {
      throw new Error('Project is not a draft')
    }

    return project
  },
})

/**
 * Get the current active draft project for the current client.
 * Used to resume a draft without knowing its ID.
 */
export const getMyActiveDraft = clientQuery({
  args: {},
  handler: async (ctx) => {
    const draft = await ctx.db
      .query('projects')
      .withIndex('by_clientId', (q) => q.eq('clientId', ctx.profile._id))
      .filter((q) => q.eq(q.field('status'), 'draft'))
      .first()

    return draft
  },
})

/**
 * Get a single project by ID.
 * Verifies ownership for clients.
 * Enriches reference files with proper MinIO public URLs.
 */
export const getProject = clientQuery({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    // Verify ownership
    if (project.clientId !== ctx.profile._id) {
      throw new Error('Access denied')
    }

    // Enrich with project type
    const projectType = await ctx.db.get(project.projectTypeId)

    // Enrich reference files with proper URLs
    const enrichedFiles = enrichReferenceFilesWithUrls(project.referenceFiles)

    return {
      ...project,
      projectTypeName: projectType?.name ?? 'Unknown',
      referenceFiles: enrichedFiles,
    }
  },
})

/**
 * Get projects with their project type info.
 * Returns enriched project data for dashboard display.
 */
export const getMyProjectsWithType = clientQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_clientId', (q) => q.eq('clientId', ctx.profile._id))
      .filter((q) => q.neq(q.field('status'), 'draft'))
      .order('desc')
      .collect()

    // Enrich with project type and category
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const projectType = await ctx.db.get(project.projectTypeId)
        let categoryName = 'Other'
        const pt = projectType as Doc<"projectTypes"> | null;
        if (pt && pt.categoryId) {
          const category = await ctx.db.get(pt.categoryId)
          categoryName = (category as Doc<"projectCategories"> | null)?.name || 'Other'
        }
        return {
          ...project,
          projectTypeName: projectType?.name ?? 'Unknown',
          projectTypeCategory: categoryName,
        }
      })
    )

    return enriched
  },
})

// ============================================================================
// Admin Queries
// ============================================================================

/**
 * Get all projects (admin view).
 */
export const getAllProjects = adminQuery({
  args: {
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('pending_review'),
        v.literal('active'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('archived')
      )
    ),
  },
  handler: async (ctx, args) => {
    // Build query based on filter
    const projects = args.status
      ? await ctx.db
        .query('projects')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect()
      : await ctx.db
        .query('projects')
        .order('desc')
        .collect()

    // Enrich with client and project type info
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const [client, projectType] = await Promise.all([
          project.clientId ? ctx.db.get(project.clientId) : null,
          ctx.db.get(project.projectTypeId),
        ])
        return {
          ...project,
          clientName: client?.name ?? 'Unknown',
          projectTypeName: projectType?.name ?? 'Unknown',
        }
      })
    )

    return enriched
  },
})

/**
 * Get pending review projects (admin dashboard).
 */
export const getPendingProjects = adminQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_status', (q) => q.eq('status', 'pending_review'))
      .order('desc')
      .collect()

    // Enrich with client info (clientId is optional for admin-initiated projects)
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const client = project.clientId
          ? await ctx.db.get(project.clientId)
          : null
        return {
          ...project,
          clientName: client?.name ?? 'Unknown',
        }
      })
    )

    return enriched
  },
})
