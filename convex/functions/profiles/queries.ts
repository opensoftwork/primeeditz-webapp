/**
 * Profile Queries
 *
 * Queries for user profile management.
 * Uses authenticatedQuery wrapper from customFunctions.
 */

import { query } from "../../_generated/server";
import { authenticatedQuery } from "../../lib/customFunctions";

/**
 * Get the current user's profile.
 * Returns null if profile doesn't exist (user needs onboarding).
 */
export const getMyProfile = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    // ctx.authUser is available from the authenticatedQuery wrapper
    const userId = ctx.authUser._id;

    // Get profile by Better Auth user ID
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

/**
 * Check if profiles table is empty (for first admin bootstrap).
 * Returns true if this would be the first user.
 */
export const isFirstUser = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    // Count existing profiles
    const existingProfile = await ctx.db.query("profiles").first();
    return existingProfile === null;
  },
});

/**
 * Get profile by user ID (public query for route guards).
 * This query doesn't require authentication.
 */
export const getProfileByUserId = query({
  args: {},
  handler: async (_ctx) => {
    // This is a placeholder - actual implementation would need
    // the user ID passed from the auth context
    return null;
  },
});
