import { v } from "convex/values";
import { adminQuery, authenticatedQuery } from "../../../lib/customFunctions";

/**
 * Get all quotation templates (Accessible by Studios for package selection)
 */
export const getTemplates = authenticatedQuery({
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
export const getTemplate = authenticatedQuery({
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
export const getTemplatesByProjectType = authenticatedQuery({
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
