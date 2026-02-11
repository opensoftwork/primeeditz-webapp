import { v } from "convex/values";
import { adminQuery } from "../../../lib/customFunctions";

/**
 * Get all quotation sections
 * Returns sections ordered by displayOrder
 */
export const getSections = adminQuery({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
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

    // Sort by displayOrder if it exists, otherwise use 0
    return sections.sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    );
  },
});

/**
 * Get a single section by ID
 */
export const getSection = adminQuery({
  args: {
    sectionId: v.id("quotationSections"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sectionId);
  },
});
