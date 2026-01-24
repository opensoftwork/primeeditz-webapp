import { v } from "convex/values";
import { adminMutation } from "../../../lib/customFunctions";

/**
 * Template line item validator for input
 */
const templateLineItemInput = v.object({
  sectionId: v.id("quotationSections"),
  description: v.string(),
  unit: v.string(),
  unitPrice: v.number(),
  defaultQuantity: v.number(),
  spawnsProject: v.optional(v.boolean()),
  projectTypeId: v.optional(v.id("projectTypes")),
  selectedFolderTemplateId: v.optional(v.id("folderTemplates")),
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
export const createTemplate = adminMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    lineItems: v.array(templateLineItemInput),
    terms: v.optional(v.string()),
    projectTypeHint: v.optional(v.string()),
    createdBy: v.string(), // Host app passes user identifier
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quotationTemplates", {
      name: args.name,
      description: args.description,
      lineItems: args.lineItems,
      terms: args.terms,
      projectTypeHint: args.projectTypeHint,
      isActive: true,
      createdBy: args.createdBy,
    });
  },
});

/**
 * Update an existing template
 */
export const updateTemplate = adminMutation({
  args: {
    templateId: v.id("quotationTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    lineItems: v.optional(v.array(templateLineItemInput)),
    terms: v.optional(v.string()),
    projectTypeHint: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { templateId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(templateId, {
        ...cleanUpdates,
      });
    }
    
    return null;
  },
});

/**
 * Toggle template active status
 */
export const toggleTemplateActive = adminMutation({
  args: {
    templateId: v.id("quotationTemplates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }
    
    const newStatus = !template.isActive;
    await ctx.db.patch(args.templateId, { 
      isActive: newStatus,
    });
    return newStatus;
  },
});

/**
 * Delete a template (soft delete)
 */
export const deleteTemplate = adminMutation({
  args: {
    templateId: v.id("quotationTemplates"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.templateId, { 
      isActive: false,
    });
    return null;
  },
});

/**
 * Duplicate a template
 */
export const duplicateTemplate = adminMutation({
  args: {
    templateId: v.id("quotationTemplates"),
    newName: v.string(),
    createdBy: v.string(),
  },
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
    });
  },
});
