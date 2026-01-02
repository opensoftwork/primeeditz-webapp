/**
 * Profile Mutations
 *
 * Mutations for user profile management.
 * Uses authenticatedMutation wrapper from customFunctions.
 */

import { v } from 'convex/values'
import { authenticatedMutation } from '../../lib/customFunctions'

/**
 * Create a new profile for the authenticated user.
 * Used during onboarding flow.
 *
 * @param name - User's full name (required)
 * @param phone - User's phone number (optional)
 * @param role - User's role: 'client' or 'admin' (for first user bootstrap)
 */
export const createProfile = authenticatedMutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal('client'), v.literal('admin')),
  },
  handler: async (ctx, args) => {
    // ctx.authUser is available from the authenticatedMutation wrapper
    const userId = ctx.authUser._id

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (existingProfile) {
      throw new Error('Profile already exists')
    }

    // Create the profile
    const profileId = await ctx.db.insert('profiles', {
      userId: userId, // Store Better Auth user ID as string
      name: args.name,
      phone: args.phone,
      role: args.role,
      onboardingComplete: true,
      updatedAt: Date.now(),
    })

    return profileId
  },
})

/**
 * Update an existing profile.
 * Used for profile settings page.
 */
export const updateProfile = authenticatedMutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.authUser._id

    // Get existing profile
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (!profile) {
      throw new Error('Profile not found')
    }

    // Update profile with provided fields
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    if (args.name !== undefined) updates.name = args.name
    if (args.phone !== undefined) updates.phone = args.phone
    if (args.company !== undefined) updates.company = args.company

    await ctx.db.patch(profile._id, updates)

    return profile._id
  },
})
