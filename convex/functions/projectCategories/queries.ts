import { query } from "../../_generated/server";
import { adminQuery } from "../../lib/customFunctions";

/**
 * Get all active project categories.
 */
export const getActiveCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projectCategories")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

/**
 * Get all project categories for admin.
 */
export const getProjectCategories = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projectCategories").collect();
  },
});
