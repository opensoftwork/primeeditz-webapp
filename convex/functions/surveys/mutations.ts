import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Public mutation — no auth required.
 */
export const createSurvey = mutation({
  args: {
    // Required contact details
    name: v.string(),
    email: v.string(),
    // Optional contact details
    phone: v.optional(v.string()),
    channelName: v.optional(v.string()),
    instagramHandle: v.optional(v.string()),
    bestTimeToContact: v.optional(v.string()),
    preferredContactMethod: v.optional(v.string()),
    mayContact: v.optional(v.string()),
    // Section A
    q1_role: v.optional(v.string()),
    q1_roleOther: v.optional(v.string()),
    q2_frequency: v.optional(v.string()),
    q3_contentTypes: v.optional(v.array(v.string())),
    q3_contentTypesOther: v.optional(v.string()),
    q4_monthlyVolume: v.optional(v.string()),
    // Section B
    q5_currentEditing: v.optional(v.string()),
    q6_frustrations: v.optional(v.any()),
    q7_editingChallenges: v.optional(v.array(v.string())),
    q7_editingChallengesOther: v.optional(v.string()),
    q8_turnaroundTime: v.optional(v.string()),
    q9_turnaroundSatisfaction: v.optional(v.string()),
    q10_revisionRounds: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("surveys", args);
    return id;
  },
});

/**
 * Admin-only delete mutation.
 */
export const deleteSurvey = adminMutation({
  args: {
    id: v.id("surveys"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
