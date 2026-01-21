/**
 * Profile Mutations
 *
 * Mutations for user profile management.
 * Uses authenticatedMutation wrapper from customFunctions.
 */

import { v } from 'convex/values'
import { authenticatedMutation, adminMutation } from '../../lib/customFunctions'

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
      email: ctx.authUser.email, // Store email for easier admin access
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

/**
 * Create a draft client profile (admin-initiated).
 * Used when admin creates a project for a new client who hasn't registered.
 * The client will receive an invitation to complete their profile later.
 *
 * @param name - Client's full name (required)
 * @param email - Client's email address (required)
 * @param phone - Client's phone number (optional)
 * @param company - Client's company name (optional)
 */
export const createDraftClientProfile = authenticatedMutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify the caller is an admin or employee (has permission to create clients)
    const callerUserId = ctx.authUser._id

    const callerProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', callerUserId))
      .first()

    if (!callerProfile) {
      throw new Error('Caller profile not found')
    }

    if (callerProfile.role !== 'admin' && callerProfile.role !== 'employee') {
      throw new Error('Only admins and employees can create client profiles')
    }

    // Check if a profile with this email already exists
    const allProfiles = await ctx.db.query('profiles').collect()
    const existingProfile = allProfiles.find(
      (p) => p.email.toLowerCase() === args.email.toLowerCase()
    )

    if (existingProfile) {
      throw new Error('A profile with this email already exists')
    }

    // Create the draft client profile
    // Note: userId will be set when the client actually registers/logs in
    // For now, we use a placeholder that can be linked later
    const profileId = await ctx.db.insert('profiles', {
      userId: `draft_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Placeholder
      email: args.email,
      name: args.name,
      phone: args.phone,
      company: args.company,
      role: 'client',
      onboardingComplete: false, // Client hasn't completed onboarding
      updatedAt: Date.now(),
    })

    return {
      profileId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      company: args.company,
    }
  },
})

/**
 * Update a client profile (admin only).
 */
export const updateClientProfile = adminMutation({
  args: {
    profileId: v.id('profiles'),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profileId, ...updates } = args

    const targetProfile = await ctx.db.get(profileId)
    if (!targetProfile) throw new Error('Client profile not found')
    if (targetProfile.role !== 'client') throw new Error('Target profile is not a client')

    const filteredUpdates: Record<string, any> = {
      updatedAt: Date.now(),
    }

    if (updates.name !== undefined) filteredUpdates.name = updates.name
    if (updates.phone !== undefined) filteredUpdates.phone = updates.phone
    if (updates.company !== undefined) filteredUpdates.company = updates.company

    await ctx.db.patch(profileId, filteredUpdates)

    return profileId
  },
})

/**
 * Deactivate a client profile (soft delete).
 */
export const deactivateClient = adminMutation({
  args: {
    profileId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const targetProfile = await ctx.db.get(args.profileId)
    if (!targetProfile) throw new Error('Client profile not found')

    await ctx.db.patch(args.profileId, {
      deactivatedAt: Date.now(),
      deactivatedBy: ctx.profile._id,
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

/**
 * Reactivate a deactivated client profile.
 */
export const reactivateClient = adminMutation({
  args: {
    profileId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const targetProfile = await ctx.db.get(args.profileId)
    if (!targetProfile) throw new Error('Client profile not found')

    await ctx.db.patch(args.profileId, {
      deactivatedAt: undefined,
      deactivatedBy: undefined,
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

/**
 * Claim a draft profile (onboarding).
 * Links the current authenticated user to a pre-created draft profile.
 */
export const claimDraftProfile = authenticatedMutation({
  args: {
    profileId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const userId = ctx.authUser._id
    const userEmail = ctx.authUser.email

    // Check if user already has a profile (other than the draft one they are claiming)
    const existingProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (existingProfile && existingProfile._id !== args.profileId) {
      throw new Error('User already has an active profile')
    }

    // Get the draft profile
    const draftProfile = await ctx.db.get(args.profileId)
    if (!draftProfile) {
      throw new Error('Profile not found')
    }

    // Verify it is a draft
    if (!draftProfile.userId.startsWith('draft_')) {
      throw new Error('This profile has already been claimed')
    }

    // Update the profile to link to the real user
    await ctx.db.patch(args.profileId, {
      userId: userId,
      email: userEmail,
      onboardingComplete: true,
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

