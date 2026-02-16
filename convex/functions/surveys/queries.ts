import { v } from "convex/values";
import { adminQuery } from "../../lib/customFunctions";

/**
 * List all surveys, sorted by creation time (newest first).
 */
export const listSurveys = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("surveys").order("desc").collect();
  },
});

/**
 * Get a single survey by ID.
 */
export const getSurveyById = adminQuery({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
