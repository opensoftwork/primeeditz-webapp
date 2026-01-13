import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get all quotation sections
 * Returns sections ordered by displayOrder
 */
export const getSections = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("quotationSections"),
      _creationTime: v.number(),
      name: v.string(),
      displayOrder: v.number(),
      icon: v.optional(v.string()),
      color: v.optional(v.string()),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    let sections;
    
    if (args.activeOnly) {
      sections = await ctx.db
        .query("quotationSections")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .collect();
    } else {
      sections = await ctx.db.query("quotationSections").collect();
    }
    
    return sections.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

/**
 * Get a single section by ID
 */
export const getSection = query({
  args: {
    sectionId: v.id("quotationSections"),
  },
  returns: v.union(
    v.object({
      _id: v.id("quotationSections"),
      _creationTime: v.number(),
      name: v.string(),
      displayOrder: v.number(),
      icon: v.optional(v.string()),
      color: v.optional(v.string()),
      isActive: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sectionId);
  },
});
