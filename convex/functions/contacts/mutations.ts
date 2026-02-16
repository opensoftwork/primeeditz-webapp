import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Public mutation — no auth required.
 * Used by external websites via HTTP POST.
 */
export const createContact = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phoneno: v.string(),
    service: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contacts", {
      name: args.name,
      email: args.email,
      phoneno: args.phoneno,
      service: args.service,
      message: args.message,
    });
    return id;
  },
});

/**
 * Admin-only delete mutation.
 */
export const deleteContact = adminMutation({
  args: {
    id: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
