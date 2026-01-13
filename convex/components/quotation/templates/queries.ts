import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Template line item validator for return types
 */
const templateLineItemReturn = v.object({
  sectionId: v.id("quotationSections"),
  description: v.string(),
  unit: v.string(),
  unitPrice: v.number(),
  defaultQuantity: v.number(),
  subItems: v.optional(
    v.array(
      v.object({
        description: v.string(),
        unit: v.string(),
        unitPrice: v.number(),
        defaultQuantity: v.number(),
      })
    )
  ),
});

/**
 * Get all quotation templates
 */
export const getTemplates = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("quotationTemplates"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      lineItems: v.array(templateLineItemReturn),
      terms: v.optional(v.string()),
      projectTypeHint: v.optional(v.string()),
      isActive: v.boolean(),
      createdBy: v.string(),
      updatedAt: v.number(),
    })
  ),
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
export const getTemplate = query({
  args: {
    templateId: v.id("quotationTemplates"),
  },
  returns: v.union(
    v.object({
      _id: v.id("quotationTemplates"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      lineItems: v.array(templateLineItemReturn),
      terms: v.optional(v.string()),
      projectTypeHint: v.optional(v.string()),
      isActive: v.boolean(),
      createdBy: v.string(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

/**
 * Get templates filtered by project type hint
 */
export const getTemplatesByProjectType = query({
  args: {
    projectTypeHint: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("quotationTemplates"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      lineItems: v.array(templateLineItemReturn),
      terms: v.optional(v.string()),
      projectTypeHint: v.optional(v.string()),
      isActive: v.boolean(),
      createdBy: v.string(),
      updatedAt: v.number(),
    })
  ),
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
