/**
 * Custom Convex Functions with Auth Wrappers
 *
 * Provides role-based access control at the API level:
 * - authenticatedQuery/Mutation: Requires valid session
 * - adminQuery/Mutation: Requires admin role
 * - clientQuery/Mutation: Requires client role
 *
 * Uses Better Auth component for authentication.
 * @see https://github.com/get-convex/convex-helpers
 */

import {
  customQuery,
  customMutation,
  customAction,
} from 'convex-helpers/server/customFunctions'
import { query, mutation, action } from '../_generated/server'
import type { QueryCtx, MutationCtx, ActionCtx } from '../_generated/server'
import type { Id } from '../_generated/dataModel'
import { authComponent } from '../auth'
import { api } from '../_generated/api'

// ============================================================================
// Types
// ============================================================================

// Better Auth user type (from component)
export type AuthUser = {
  _id: string // Better Auth uses _id (Convex style)
  email: string
  name: string
  image?: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export type Profile = {
  _id: Id<'profiles'>
  userId: string // Better Auth user ID
  role: 'client' | 'employee' | 'admin'
  name: string
  phone?: string
  company?: string
  onboardingComplete: boolean
  updatedAt: number
}

export type AuthContext = {
  authUser: AuthUser
}

export type AuthContextWithProfile = AuthContext & {
  profile: Profile
}

// ============================================================================
// Auth Helpers
// ============================================================================

/**
 * Get authenticated user from Better Auth component.
 * Uses authComponent.getAuthUser(ctx) to get the current user.
 */
async function getAuthUser(
  ctx: QueryCtx | MutationCtx
): Promise<AuthUser> {
  const user = await authComponent.getAuthUser(ctx)
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  return user as unknown as AuthUser
}

/**
 * Get authenticated user with their profile.
 * Throws "Not authenticated" if no session.
 * Throws "Profile not found" if profile doesn't exist.
 */
export async function getAuthUserWithProfile(
  ctx: QueryCtx | MutationCtx
): Promise<{ authUser: AuthUser; profile: Profile }> {
  const authUser = await getAuthUser(ctx)

  // Get profile by Better Auth user ID (stored as string)
  const profile = await ctx.db
    .query('profiles')
    .withIndex('by_userId', (q) => q.eq('userId', authUser._id))
    .first()

  if (!profile) {
    throw new Error('Profile not found. Please complete onboarding.')
  }

  return { authUser, profile: profile as unknown as Profile }
}

/**
 * Require specific role(s).
 * Throws "Access denied" if role doesn't match.
 */
function requireRole(
  profile: Profile,
  allowedRoles: Array<'client' | 'employee' | 'admin'>
): void {
  if (!allowedRoles.includes(profile.role)) {
    throw new Error('Access denied')
  }
}

// ============================================================================
// Authenticated Wrappers (Any logged-in user)
// ============================================================================

/**
 * Query wrapper that requires authentication.
 * Adds `ctx.authUser` with user data from Better Auth.
 */
export const authenticatedQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const authUser = await getAuthUser(ctx)
    return { ctx: { ...ctx, authUser }, args: {} }
  },
})

/**
 * Mutation wrapper that requires authentication.
 * Adds `ctx.authUser` with user data from Better Auth.
 */
export const authenticatedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const authUser = await getAuthUser(ctx)
    return { ctx: { ...ctx, authUser }, args: {} }
  },
})

/**
 * Mutation wrapper that requires authentication AND profile.
 * Adds `ctx.authUser` and `ctx.profile`.
 */
export const authenticatedWithProfileMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const { authUser, profile } = await getAuthUserWithProfile(ctx)
    return { ctx: { ...ctx, authUser, profile }, args: {} }
  },
})

/**
 * Query wrapper that requires authentication AND profile.
 * Adds `ctx.authUser` and `ctx.profile`.
 */
export const authenticatedWithProfileQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const { authUser, profile } = await getAuthUserWithProfile(ctx)
    return { ctx: { ...ctx, authUser, profile }, args: {} }
  },
})

// ============================================================================
// Admin Wrappers
// ============================================================================

/**
 * Query wrapper that requires admin role.
 * Adds `ctx.authUser` and `ctx.profile`.
 */
export const adminQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const { authUser, profile } = await getAuthUserWithProfile(ctx)
    requireRole(profile, ['admin'])
    return { ctx: { ...ctx, authUser, profile }, args: {} }
  },
})

/**
 * Mutation wrapper that requires admin role.
 * Adds `ctx.authUser` and `ctx.profile`.
 */
export const adminMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const { authUser, profile } = await getAuthUserWithProfile(ctx)
    requireRole(profile, ['admin'])
    return { ctx: { ...ctx, authUser, profile }, args: {} }
  },
})

// ============================================================================
// Client Wrappers
// ============================================================================

/**
 * Query wrapper that requires client role.
 * Adds `ctx.authUser` and `ctx.profile`.
 */
export const clientQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const { authUser, profile } = await getAuthUserWithProfile(ctx)
    requireRole(profile, ['client'])
    return { ctx: { ...ctx, authUser, profile }, args: {} }
  },
})

/**
 * Mutation wrapper that requires client role.
 * Adds `ctx.authUser` and `ctx.profile`.
 */
export const clientMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const { authUser, profile } = await getAuthUserWithProfile(ctx)
    requireRole(profile, ['client'])
    return { ctx: { ...ctx, authUser, profile }, args: {} }
  },
})

// ============================================================================
// Employee Wrappers
// ============================================================================

/**
 * Query wrapper that requires employee role.
 * Adds `ctx.authUser` and `ctx.profile`.
 */
export const employeeQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const { authUser, profile } = await getAuthUserWithProfile(ctx)
    requireRole(profile, ['employee'])
    return { ctx: { ...ctx, authUser, profile }, args: {} }
  },
})

/**
 * Mutation wrapper that requires employee role.
 * Adds `ctx.authUser` and `ctx.profile`.
 */
export const employeeMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const { authUser, profile } = await getAuthUserWithProfile(ctx)
    requireRole(profile, ['employee'])
    return { ctx: { ...ctx, authUser, profile }, args: {} }
  },
})

// ============================================================================
// Staff Wrappers (Admin or Employee)
// ============================================================================

/**
 * Query wrapper that requires admin or employee role.
 * Useful for internal staff operations.
 */
export const staffQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const { authUser, profile } = await getAuthUserWithProfile(ctx)
    requireRole(profile, ['admin', 'employee'])
    return { ctx: { ...ctx, authUser, profile }, args: {} }
  },
})

/**
 * Mutation wrapper that requires admin or employee role.
 * Useful for internal staff operations.
 */
export const staffMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const { authUser, profile } = await getAuthUserWithProfile(ctx)
    requireRole(profile, ['admin', 'employee'])
    return { ctx: { ...ctx, authUser, profile }, args: {} }
  },
})

// ============================================================================
// Action Wrappers
// ============================================================================

/**
 * Action wrapper that requires client role.
 * Adds `ctx.profile`.
 */
export const clientAction = customAction(action, {
  args: {},
  input: async (ctx: ActionCtx): Promise<{ ctx: { profile: Profile } & ActionCtx; args: Record<string, unknown> }> => {
    const authUser = await authComponent.getAuthUser(ctx)
    if (!authUser) {
      throw new Error('Not authenticated')
    }

    const profile = (await ctx.runQuery(api.profiles.getMyProfile)) as Profile | null
    
    if (!profile) {
      throw new Error('Profile not found')
    }

    if (profile.role !== 'client') {
      throw new Error('Access denied')
    }

    return { ctx: { ...ctx, profile }, args: {} }
  },
})
