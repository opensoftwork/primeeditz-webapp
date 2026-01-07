/**
 * Project Types Queries
 * 
 * Read operations for project types.
 */

import { v } from 'convex/values'
import { query } from '../../_generated/server'

/**
 * Get all active project types.
 * Used by the project wizard to show available options.
 */
export const getActiveProjectTypes = query({
  args: {},
  handler: async (ctx) => {
    const projectTypes = await ctx.db
      .query('projectTypes')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    return projectTypes
  },
})

/**
 * Get a single project type by ID.
 */
export const getProjectType = query({
  args: {
    projectTypeId: v.id('projectTypes'),
  },
  handler: async (ctx, args) => {
    const projectType = await ctx.db.get(args.projectTypeId)
    return projectType
  },
})

/**
 * Get all project types (including inactive) for admin.
 */
export const getAllProjectTypes = query({
  args: {},
  handler: async (ctx) => {
    const projectTypes = await ctx.db
      .query('projectTypes')
      .collect()

    return projectTypes
  },
})
