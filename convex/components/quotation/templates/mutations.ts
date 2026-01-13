import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Template line item validator for input
 */
const templateLineItemInput = v.object({
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
 * Create a new quotation template
 */
export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    lineItems: v.array(templateLineItemInput),
    terms: v.optional(v.string()),
    projectTypeHint: v.optional(v.string()),
    createdBy: v.string(), // Host app passes user identifier
  },
  returns: v.id("quotationTemplates"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("quotationTemplates", {
      name: args.name,
      description: args.description,
      lineItems: args.lineItems,
      terms: args.terms,
      projectTypeHint: args.projectTypeHint,
      isActive: true,
      createdBy: args.createdBy,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update an existing template
 */
export const updateTemplate = mutation({
  args: {
    templateId: v.id("quotationTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    lineItems: v.optional(v.array(templateLineItemInput)),
    terms: v.optional(v.string()),
    projectTypeHint: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { templateId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(templateId, {
        ...cleanUpdates,
        updatedAt: Date.now(),
      });
    }
    
    return null;
  },
});

/**
 * Toggle template active status
 */
export const toggleTemplateActive = mutation({
  args: {
    templateId: v.id("quotationTemplates"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }
    
    const newStatus = !template.isActive;
    await ctx.db.patch(args.templateId, { 
      isActive: newStatus,
      updatedAt: Date.now(),
    });
    return newStatus;
  },
});

/**
 * Delete a template (soft delete)
 */
export const deleteTemplate = mutation({
  args: {
    templateId: v.id("quotationTemplates"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.templateId, { 
      isActive: false,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Duplicate a template
 */
export const duplicateTemplate = mutation({
  args: {
    templateId: v.id("quotationTemplates"),
    newName: v.string(),
    createdBy: v.string(),
  },
  returns: v.id("quotationTemplates"),
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.templateId);
    if (!original) {
      throw new Error("Template not found");
    }
    
    return await ctx.db.insert("quotationTemplates", {
      name: args.newName,
      description: original.description,
      lineItems: original.lineItems,
      terms: original.terms,
      projectTypeHint: original.projectTypeHint,
      isActive: true,
      createdBy: args.createdBy,
      updatedAt: Date.now(),
    });
  },
});
