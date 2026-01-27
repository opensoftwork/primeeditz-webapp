import { internalMutation } from "../../_generated/server";

/**
 * DEV ONLY: Permanently delete all soft-deleted projects.
 */
export const cleanupSoftDeletedProjects = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allProjects = await ctx.db.query("projects").collect();
    const softDeleted = allProjects.filter((p) => p.deletedAt !== undefined);

    for (const project of softDeleted) {
      // Delete related folders
      const folders = await ctx.db
        .query("folders")
        .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
        .collect();
      for (const folder of folders) {
        await ctx.db.delete(folder._id);
      }

      // Delete related assets
      const assets = await ctx.db
        .query("assets")
        .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
        .collect();
      for (const asset of assets) {
        await ctx.db.delete(asset._id);
      }

      // Delete the project
      await ctx.db.delete(project._id);
    }

    return { deleted: softDeleted.length };
  },
});
