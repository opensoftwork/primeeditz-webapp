import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Public mutation — no auth required.
 */
export const createFeedback = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    rating: v.number(),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("feedbacks", {
      name: args.name,
      email: args.email,
      rating: args.rating,
      feedback: args.feedback,
    });
    return id;
  },
});

/**
 * Admin-only delete mutation.
 */
export const deleteFeedback = adminMutation({
  args: {
    id: v.id("feedbacks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
