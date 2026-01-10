import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

// Check if this is the first user (for admin bootstrap)
export const isFirstUser = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    return profiles.length === 0;
  },
});

// Create a new profile
export const createProfile = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the current user from Better Auth
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject))
      .first();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    // Check if this is the first user
    const profiles = await ctx.db.query("profiles").collect();
    const isFirst = profiles.length === 0;
    const role = isFirst ? ("admin" as const) : ("client" as const);

    // Create the profile
    const profileId = await ctx.db.insert("profiles", {
      userId: user.subject,
      email: user.email!, // Email is usually present in identity
      name: args.name,
      phone: args.phone,
      company: args.company,
      role,
      onboardingComplete: true,
      updatedAt: Date.now(),
    });

    return { profileId, role };
  },
});

// Get current user's profile
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject))
      .first();

    return profile;
  },
});

// Helper for actions to lookup profile
export const getProfileByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});
