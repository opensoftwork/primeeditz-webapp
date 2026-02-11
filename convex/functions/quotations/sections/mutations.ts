import { v } from "convex/values";
import { adminMutation } from "../../../lib/customFunctions";

/**
 * Create a new quotation section
 */
export const createSection = adminMutation({
  args: {
    name: v.string(),
    displayOrder: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the max displayOrder if not provided
    let displayOrder = args.displayOrder;
    if (displayOrder === undefined) {
      const sections = await ctx.db.query("quotationSections").collect();
      displayOrder =
        sections.length > 0
          ? Math.max(...sections.map((s) => s.displayOrder ?? 0)) + 1
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
export const updateSection = adminMutation({
  args: {
    sectionId: v.id("quotationSections"),
    name: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { sectionId, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
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
export const toggleSectionActive = adminMutation({
  args: {
    sectionId: v.id("quotationSections"),
  },
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
export const reorderSections = adminMutation({
  args: {
    orderedIds: v.array(v.id("quotationSections")),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.orderedIds.map((id, index) =>
        ctx.db.patch(id, { displayOrder: index }),
      ),
    );
    return null;
  },
});

/**
 * Delete a section
 */
export const deleteSection = adminMutation({
  args: {
    sectionId: v.id("quotationSections"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sectionId);
    return null;
  },
});
