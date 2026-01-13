/**
 * Quotation Bridge
 * 
 * This is the ONLY file in the main app for Quotations.
 * It serves as a surgical pass-through to the Quotation Component.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";

// --- VALIDATORS ---
const templateLineItemInput = v.object({
  sectionId: v.string(),
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

// --- SECTIONS ---
export const getSections = query({
  args: { activeOnly: v.boolean() },
  handler: async (ctx, args) => await ctx.runQuery(components.quotation.sections.queries.getSections, args),
});

export const createSection = mutation({
  args: { 
    name: v.string(), 
    icon: v.optional(v.string()), 
    color: v.optional(v.string()),
    isActive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => await ctx.runMutation(components.quotation.sections.mutations.createSection, args),
});

export const updateSection = mutation({
  args: { sectionId: v.string(), name: v.optional(v.string()), isActive: v.optional(v.boolean()), icon: v.optional(v.string()), color: v.optional(v.string()) },
  handler: async (ctx, args) => await ctx.runMutation(components.quotation.sections.mutations.updateSection, args),
});

export const toggleActive = mutation({
  args: { id: v.string(), isActive: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.runMutation(components.quotation.sections.mutations.updateSection, {
      sectionId: args.id,
      isActive: args.isActive,
    });
  },
});

export const reorderSections = mutation({
  args: { orderedIds: v.array(v.string()) },
  handler: async (ctx, args) => await ctx.runMutation(components.quotation.sections.mutations.reorderSections, args),
});

export const deleteSection = mutation({
  args: { sectionId: v.string() },
  handler: async (ctx, args) => await ctx.runMutation(components.quotation.sections.mutations.deleteSection, args),
});

// --- TEMPLATES ---
export const getTemplates = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => await ctx.runQuery(components.quotation.templates.queries.getTemplates, args),
});

export const getTemplate = query({
  args: { templateId: v.string() },
  handler: async (ctx, args) => await ctx.runQuery(components.quotation.templates.queries.getTemplate, { templateId: args.templateId }),
});

export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    lineItems: v.array(templateLineItemInput),
    terms: v.optional(v.string()),
    projectTypeHint: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => await ctx.runMutation(components.quotation.templates.mutations.createTemplate, args),
});


export const updateTemplate = mutation({
  args: {
    templateId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    lineItems: v.optional(v.array(templateLineItemInput)),
    terms: v.optional(v.string()),
    projectTypeHint: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => await ctx.runMutation(components.quotation.templates.mutations.updateTemplate, args),
});


export const deleteTemplate = mutation({
  args: { templateId: v.string() },
  handler: async (ctx, args) => await ctx.runMutation(components.quotation.templates.mutations.deleteTemplate, { templateId: args.templateId }),
});
