import { v } from "convex/values";
import { adminQuery } from "../../lib/customFunctions";

/**
 * List all contacts, sorted by creation time (newest first).
 */
export const listContacts = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contacts").order("desc").collect();
  },
});

/**
 * Get a single contact by ID.
 */
export const getContactById = adminQuery({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
