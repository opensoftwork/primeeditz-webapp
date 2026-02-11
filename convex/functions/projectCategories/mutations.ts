import { v } from "convex/values";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Create a new project category.
 */
export const createCategory = adminMutation({
  args: {
    name: v.string(),
    isActive: v.boolean(),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("projectCategories", {
      ...args,
    });
    return categoryId;
  },
});

/**
 * Update an existing project category.
 */
export const createCategoryOnFly = adminMutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if category already exists
    const existing = await ctx.db
      .query("projectCategories")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("projectCategories", {
      name: args.name,
      isActive: true,
    });
  },
});
