/**
 * Development utilities for clearing test data
 * WARNING: Only use in development!
 */
import { mutation } from "../_generated/server";

export const clearTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all projects
    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    // Delete all quotations
    const quotations = await ctx.db.query("quotations").collect();
    for (const quotation of quotations) {
      await ctx.db.delete(quotation._id);
    }

    // Delete all status history
    const history = await ctx.db.query("statusHistory").collect();
    for (const h of history) {
      await ctx.db.delete(h._id);
    }

    // Delete all folders
    const folders = await ctx.db.query("folders").collect();
    for (const folder of folders) {
      await ctx.db.delete(folder._id);
    }

    // Delete all assets
    const assets = await ctx.db.query("assets").collect();
    for (const asset of assets) {
      await ctx.db.delete(asset._id);
    }

    return {
      deleted: {
        projects: projects.length,
        quotations: quotations.length,
        statusHistory: history.length,
        folders: folders.length,
        assets: assets.length,
      },
    };
  },
});
