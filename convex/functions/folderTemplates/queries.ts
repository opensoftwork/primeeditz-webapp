import { v } from "convex/values";
import { adminQuery, authenticatedQuery } from "../../lib/customFunctions";

/**
 * List all folder templates.
 */
export const list = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("folderTemplates").collect();
  },
});

/**
 * Get a specific folder template by ID.
 */
export const get = adminQuery({
  args: { id: v.id("folderTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * List all folder templates for a specific project type.
 * Used for selection in quotation/onboarding.
 */
export const listByProjectType = authenticatedQuery({
  args: { projectTypeId: v.id("projectTypes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("folderTemplates")
      .withIndex("by_projectType_isActive", (q) =>
        q.eq("projectTypeId", args.projectTypeId).eq("isActive", true)
      )
      .collect();
  },
});
