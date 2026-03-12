import { v } from "convex/values";
import { adminQuery } from "../../lib/customFunctions";

/**
 * List all feedbacks, sorted by creation time (newest first).
 */
export const listFeedbacks = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("feedbacks").order("desc").collect();
  },
});

/**
 * Get a single feedback by ID.
 */
export const getFeedbackById = adminQuery({
  args: { id: v.id("feedbacks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
