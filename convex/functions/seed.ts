/**
 * Seed Functions
 * 
 * One-time setup functions to populate initial data.
 */

import { mutation } from '../_generated/server'

/**
 * Seed default project types.
 * Run this once to set up initial project types.
 */
/**
 * Wipe all project configuration and re-seed.
 */
export const resetAndSeed = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Wipe existing data
    const categories = await ctx.db.query('projectCategories').collect()
    const types = await ctx.db.query('projectTypes').collect()
    const fields = await ctx.db.query('projectTypeFields').collect()

    for (const c of categories) await ctx.db.delete(c._id)
    for (const t of types) await ctx.db.delete(t._id)
    for (const f of fields) await ctx.db.delete(f._id)

    // 2. Initial categories
    const categoryData = [
      { name: 'Album', isActive: true },
      { name: 'Photography', isActive: true },
      { name: 'Video', isActive: true },
      { name: 'Corporate', isActive: true },
    ]

    const categoryMap = new Map()
    for (const cat of categoryData) {
      const id = await ctx.db.insert('projectCategories', cat)
      categoryMap.set(cat.name, id)
    }

    // 3. Initial types
    const projectTypeData = [
      { name: 'Wedding Album', categoryId: categoryMap.get('Album'), isActive: true },
      { name: 'Pre-Wedding Album', categoryId: categoryMap.get('Album'), isActive: true },
      { name: 'Birthday Album', categoryId: categoryMap.get('Album'), isActive: true },
      { name: 'Wedding Photography Edit', categoryId: categoryMap.get('Photography'), isActive: true },
      { name: 'Wedding Film', categoryId: categoryMap.get('Video'), isActive: true },
      { name: 'YouTube Video', categoryId: categoryMap.get('Video'), isActive: true },
      { name: 'Instagram Reel', categoryId: categoryMap.get('Video'), isActive: true },
      { name: 'Corporate Event', categoryId: categoryMap.get('Corporate'), isActive: true },
    ]

    for (const projectType of projectTypeData) {
      await ctx.db.insert('projectTypes', {
        name: projectType.name,
        categoryId: projectType.categoryId,
        isActive: projectType.isActive,
      })
    }

    return { message: 'Data reset and re-seeded successfully' }
  },
})

