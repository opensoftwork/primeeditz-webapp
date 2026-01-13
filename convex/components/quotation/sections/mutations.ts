import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Create a new quotation section
 */
export const createSection = mutation({
  args: {
    name: v.string(),
    displayOrder: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  returns: v.id("quotationSections"),
  handler: async (ctx, args) => {
    // Get the max displayOrder if not provided
    let displayOrder = args.displayOrder;
    if (displayOrder === undefined) {
      const sections = await ctx.db.query("quotationSections").collect();
      displayOrder = sections.length > 0 
        ? Math.max(...sections.map((s) => s.displayOrder)) + 1 
        : 0;
    }
    
    return await ctx.db.insert("quotationSections", {
      name: args.name,
      displayOrder,
      icon: args.icon,
      color: args.color,
      isActive: true,
    });
  },
});

/**
 * Update an existing section
 */
export const updateSection = mutation({
  args: {
    sectionId: v.id("quotationSections"),
    name: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { sectionId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(sectionId, cleanUpdates);
    }
    
    return null;
  },
});

/**
 * Toggle section active status
 */
export const toggleSectionActive = mutation({
  args: {
    sectionId: v.id("quotationSections"),
  },
  returns: v.boolean(), // Returns new isActive state
  handler: async (ctx, args) => {
    const section = await ctx.db.get(args.sectionId);
    if (!section) {
      throw new Error("Section not found");
    }
    
    const newStatus = !section.isActive;
    await ctx.db.patch(args.sectionId, { isActive: newStatus });
    return newStatus;
  },
});

/**
 * Reorder sections
 */
export const reorderSections = mutation({
  args: {
    orderedIds: v.array(v.id("quotationSections")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await Promise.all(
      args.orderedIds.map((id, index) =>
        ctx.db.patch(id, { displayOrder: index })
      )
    );
    return null;
  },
});

/**
 * Delete a section (soft delete by setting isActive = false)
 * In a component, we prefer soft delete for data integrity
 */
export const deleteSection = mutation({
  args: {
    sectionId: v.id("quotationSections"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Soft delete
    await ctx.db.patch(args.sectionId, { isActive: false });
    return null;
  },
});
