// convex/functions/admin/cleanup.ts

import { internalMutation } from "../../_generated/server";

/**
 * ⚠️ DESTRUCTIVE: Clears legacy development data.
 * Only use in development environment!
 */
export const clearLegacyData = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 Starting legacy data cleanup...");

    const stats = {
      quotationTemplates: 0,
      projectTypeFields: 0,
      oldQuotations: 0,
      orphanedProjects: 0,
    };

    // 1. Clear quotationTemplates (Handle non-schema table with any)
    try {
      const oldTemplates = await ctx.db.query("quotationTemplates" as any).collect();
      for (const template of oldTemplates) {
        await ctx.db.delete(template._id);
        stats.quotationTemplates++;
      }
      console.log(`  ✓ Deleted ${stats.quotationTemplates} quotation templates`);
    } catch (e) {
      console.log("  ○ quotationTemplates table not found or empty (skipping)");
    }

    // 2. Clear projectTypeFields
    try {
      const oldFields = await ctx.db.query("projectTypeFields").collect();
      for (const field of oldFields) {
        await ctx.db.delete(field._id);
        stats.projectTypeFields++;
      }
      console.log(`  ✓ Deleted ${stats.projectTypeFields} project type fields`);
    } catch (e) {
      console.log("  ○ projectTypeFields table error (skipping)");
    }

    // 3. Clear old quotations (those without selectedPackageIds)
    const quotations = await ctx.db.query("quotations").collect();
    for (const quotation of quotations) {
      // Check if it's old format (no selectedPackageIds or has templateId)
      if (
        !quotation.selectedPackageIds ||
        quotation.selectedPackageIds.length === 0
      ) {
        // Delete related projects first
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_quotationId", (q) =>
            q.eq("quotationId", quotation._id),
          )
          .collect();

        for (const project of projects) {
          // Delete folders for this project
          const folders = await ctx.db
            .query("folders")
            .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
            .collect();
          for (const folder of folders) {
            await ctx.db.delete(folder._id);
          }

          // Delete assets for this project
          const assets = await ctx.db
            .query("assets")
            .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
            .collect();
          for (const asset of assets) {
            await ctx.db.delete(asset._id);
          }

          await ctx.db.delete(project._id);
          stats.orphanedProjects++;
        }

        await ctx.db.delete(quotation._id);
        stats.oldQuotations++;
      }
    }
    console.log(`  ✓ Deleted ${stats.oldQuotations} old quotations`);
    console.log(`  ✓ Deleted ${stats.orphanedProjects} orphaned projects`);

    console.log("✅ Legacy data cleanup complete!");
    return stats;
  },
});
