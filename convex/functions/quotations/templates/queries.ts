import { v } from "convex/values";
import { adminQuery } from "../../../lib/customFunctions";

/**
 * Get all quotation templates
 */
export const getTemplates = adminQuery({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.activeOnly) {
      return await ctx.db
        .query("quotationTemplates")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .collect();
    }
    return await ctx.db.query("quotationTemplates").collect();
  },
});

/**
 * Get a single template by ID
 */
export const getTemplate = adminQuery({
  args: {
    templateId: v.id("quotationTemplates"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

/**
 * Get templates filtered by project type hint
 */
export const getTemplatesByProjectType = adminQuery({
  args: {
    projectTypeHint: v.string(),
  },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("quotationTemplates")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    
    return templates.filter(
      (t) => t.projectTypeHint === args.projectTypeHint
    );
  },
});
