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
export const seedProjectTypes = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query('projectTypes').first()
    if (existing) {
      return { message: 'Project types already seeded', count: 0 }
    }

    const projectTypes = [
      // Album category
      { name: 'Wedding Album', category: 'Album', isActive: true },
      { name: 'Pre-Wedding Album', category: 'Album', isActive: true },
      { name: 'Birthday Album', category: 'Album', isActive: true },
      // Photography category
      { name: 'Wedding Photography Edit', category: 'Photography', isActive: true },
      // Video category
      { name: 'Wedding Film', category: 'Video', isActive: true },
      { name: 'YouTube Video', category: 'Video', isActive: true },
      { name: 'Instagram Reel', category: 'Video', isActive: true },
      // Corporate category
      { name: 'Corporate Event', category: 'Corporate', isActive: true },
    ]

    let count = 0
    for (const projectType of projectTypes) {
      await ctx.db.insert('projectTypes', projectType)
      count++
    }

    return { message: `Seeded ${count} project types`, count }
  },
})
