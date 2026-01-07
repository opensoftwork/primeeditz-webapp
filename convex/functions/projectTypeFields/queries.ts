/**
 * Project Type Fields Queries
 *
 * Queries for fetching dynamic field definitions for project types.
 */

import { v } from 'convex/values'
import { query } from '../../_generated/server'

/**
 * Get all active fields for a project type
 */
export const getFieldsByProjectType = query({
  args: { projectTypeId: v.id('projectTypes') },
  returns: v.array(
    v.object({
      _id: v.id('projectTypeFields'),
      _creationTime: v.number(),
      projectTypeId: v.id('projectTypes'),
      name: v.string(),
      label: v.string(),
      type: v.union(
        v.literal('text'),
        v.literal('number'),
        v.literal('select'),
        v.literal('checkbox'),
        v.literal('textarea')
      ),
      required: v.boolean(),
      placeholder: v.optional(v.string()),
      description: v.optional(v.string()),
      options: v.optional(v.string()),
      min: v.optional(v.number()),
      max: v.optional(v.number()),
      displayOrder: v.number(),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const fields = await ctx.db
      .query('projectTypeFields')
      .withIndex('by_projectTypeId_active', (q) =>
        q.eq('projectTypeId', args.projectTypeId).eq('isActive', true)
      )
      .collect()

    // Sort by displayOrder
    return fields.sort((a, b) => a.displayOrder - b.displayOrder)
  },
})

/**
 * Get all fields for a project type (including inactive) - for admin
 */
export const getAllFieldsByProjectType = query({
  args: { projectTypeId: v.id('projectTypes') },
  returns: v.array(
    v.object({
      _id: v.id('projectTypeFields'),
      _creationTime: v.number(),
      projectTypeId: v.id('projectTypes'),
      name: v.string(),
      label: v.string(),
      type: v.union(
        v.literal('text'),
        v.literal('number'),
        v.literal('select'),
        v.literal('checkbox'),
        v.literal('textarea')
      ),
      required: v.boolean(),
      placeholder: v.optional(v.string()),
      description: v.optional(v.string()),
      options: v.optional(v.string()),
      min: v.optional(v.number()),
      max: v.optional(v.number()),
      displayOrder: v.number(),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const fields = await ctx.db
      .query('projectTypeFields')
      .withIndex('by_projectTypeId', (q) =>
        q.eq('projectTypeId', args.projectTypeId)
      )
      .collect()

    return fields.sort((a, b) => a.displayOrder - b.displayOrder)
  },
})
