import { v } from 'convex/values'
import { query } from '../../_generated/server'
import { adminQuery } from '../../lib/customFunctions'

/**
 * Get all active project types.
 * Used by the project wizard to show available options.
 */
export const getActiveProjectTypes = query({
  args: {},
  handler: async (ctx) => {
    const types = await ctx.db
      .query('projectTypes')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .collect()

    return await Promise.all(
      types.map(async (t) => {
        const [category, fields] = await Promise.all([
          ctx.db.get(t.categoryId),
          ctx.db
            .query('projectTypeFields')
            .withIndex('by_projectTypeId_active', (q) =>
              q.eq('projectTypeId', t._id).eq('isActive', true)
            )
            .collect(),
        ])
        return {
          ...t,
          categoryName: category?.name || 'Uncategorized',
          hasCustomFields: fields.length > 0,
        }
      })
    )
  },
})

/**
 * Get all project types for admin, with field counts.
 */
export const getProjectTypes = adminQuery({
  args: {},
  handler: async (ctx) => {
    const projectTypes = await ctx.db.query('projectTypes').collect()

    // Enrich with field counts and category names
    const enriched = await Promise.all(
      projectTypes.map(async (type) => {
        const [fields, category] = await Promise.all([
          ctx.db
            .query('projectTypeFields')
            .withIndex('by_projectTypeId', (q) => q.eq('projectTypeId', type._id))
            .collect(),
          ctx.db.get(type.categoryId),
        ])
        return {
          ...type,
          fieldCount: fields.length,
          categoryName: category?.name || 'Uncategorized',
        }
      })
    )

    return enriched
  },
})

/**
 * Get a single project type by ID (public query for wizard).
 */
export const getProjectType = query({
  args: {
    projectTypeId: v.id('projectTypes'),
  },
  handler: async (ctx, args) => {
    const type = await ctx.db.get(args.projectTypeId)
    if (!type) return null

    const fields = await ctx.db
      .query('projectTypeFields')
      .withIndex('by_projectTypeId_active', (q) =>
        q.eq('projectTypeId', args.projectTypeId).eq('isActive', true)
      )
      .collect()

    return {
      ...type,
      hasCustomFields: fields.length > 0,
    }
  },
})

/**
 * Get a single project type by ID with its fields.
 */
export const getProjectTypeWithFields = adminQuery({
  args: {
    projectTypeId: v.id('projectTypes'),
  },
  handler: async (ctx, args) => {
    const projectType = await ctx.db.get(args.projectTypeId)
    if (!projectType) return null

    const [fields, category] = await Promise.all([
      ctx.db
        .query('projectTypeFields')
        .withIndex('by_projectTypeId', (q) => q.eq('projectTypeId', args.projectTypeId))
        .collect(),
      ctx.db.get(projectType.categoryId),
    ])

    // Sort fields by displayOrder
    fields.sort((a, b) => a.displayOrder - b.displayOrder)

    return {
      ...projectType,
      categoryName: category?.name || 'Uncategorized',
      fields,
    }
  },
})
