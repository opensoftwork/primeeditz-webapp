import { ConvexError, v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { authComponent } from "./auth";

// Check if this is the first user (for admin bootstrap)
export const isFirstUser = query({
  args: {},
  handler: async (ctx) => {
    const firstProfile = await ctx.db.query("profiles").first();
    return firstProfile === null;
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
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (existingProfile) {
      throw new ConvexError("Profile already exists");
    }

    // Check if this is the first user
    const firstProfile = await ctx.db.query("profiles").first();
    const isFirst = firstProfile === null;
    const role = isFirst ? ("admin" as const) : ("studio" as const);

    // Create the profile
    const profileId = await ctx.db.insert("profiles", {
      userId: user._id,
      email: user.email, // Email from Better Auth user
      name: args.name,
      phone: args.phone,
      company: args.company,
      image: user.image || undefined,
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
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch (e) {
      return null;
    }

    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!profile) return null;

    return {
      ...profile,
      image: profile.image || user.image, // Fallback to auth provider image
    };
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
// Helper for actions to lookup profile by ID
export const getProfileById = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.profileId);
  },
});

// Claim a draft profile (onboarding)
export const claimDraftProfile = mutation({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    const userId = user._id;
    const userEmail = user.email;

    // Check if user already has a profile (other than the draft one they are claiming)
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      if (existingProfile._id === args.profileId) {
        return args.profileId;
      }
      throw new ConvexError("User already has an active profile");
    }

    // Get the draft profile
    const draftProfile = await ctx.db.get(args.profileId);
    if (!draftProfile) {
      throw new ConvexError("Profile not found");
    }

    // Verify it is a draft
    if (!draftProfile.userId || !draftProfile.userId.startsWith("draft_")) {
      throw new ConvexError("This profile has already been claimed or is invalid");
    }

    // Security Check: Verify email if it's not a placeholder
    const isPlaceholderEmail = draftProfile.email?.endsWith("@pending.primeeditz.com");
    if (draftProfile.email && !isPlaceholderEmail && draftProfile.email !== userEmail) {
      throw new ConvexError("You are not authorized to claim this profile");
    }

    // Update the profile to link to the real user
    await ctx.db.patch(args.profileId, {
      userId: userId,
      email: userEmail,
      image: user.image || undefined,
      onboardingComplete: true,
      updatedAt: Date.now(),
    });

    return args.profileId;
  },
});

