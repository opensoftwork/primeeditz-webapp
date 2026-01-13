import { mutation } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'

/**
 * Migration mutation to normalize categories.
 * 1. Creates initial categories from previously used string labels.
 * 2. Links existing project types to these categories.
 */
export const migrateCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get all project types
    const projectTypes = await ctx.db.query('projectTypes').collect()
    
    // 2. Extract unique categories
    const defaultCategories = ["Photography", "Videography", "Events", "Design", "Commercial"]
    
    const categoryMap = new Map<string, Id<'projectCategories'>>()
    
    // Create default categories first
    for (const catName of defaultCategories) {
      const existing = await ctx.db
        .query('projectCategories')
        .withIndex('by_isActive', (q) => q.eq('isActive', true))
        .filter((q) => q.eq(q.field('name'), catName))
        .first()
      
      if (!existing) {
        const id = await ctx.db.insert('projectCategories', {
          name: catName,
          isActive: true,
          displayOrder: defaultCategories.indexOf(catName),
        })
        categoryMap.set(catName, id)
      } else {
        categoryMap.set(catName, existing._id)
      }
    }

    // Link project types to the "Photography" category by default if they have no categoryId
    const firstCatId = categoryMap.get("Photography")
    
    for (const type of projectTypes) {
      if (!type.categoryId) {
        await ctx.db.patch(type._id, {
          categoryId: firstCatId
        })
      }
    }
    
    return { success: true, migrated: projectTypes.length }
  },
})
