import { internalMutation } from "../../_generated/server";

/**
 * WARNING: This mutation deletes ALL data from ALL tables in the database.
 * This is an internal mutation that can be run from the CLI or dashboard.
 * Only use this in development environments!
 */
export const clearAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("⚠️ STARTING FULL DATABASE WIPE...");

    // List of all tables from schema.ts plus legacy tables
    const tableNames = [
      // Transactional Data
      "assets",
      "projects",
      "folders",
      "deliverables",
      "deliverableVersions",
      "versionRequests",
      "statusHistory",
      "projectSquads",
      "handoffLogs",
      "studioApprovals",
      "quotationRequestDrafts",
      "servicePackageDrafts",
      "quotations",

      // Configuration & Setup
      "projectTypes",
      "projectCategories",
      "projectTypeFields",
      "storageTiers",
      "folderTemplates",
      "quotationSections",
      "servicePackages",
      "quotationLibraryItems",
      "company",
      "appSettings",

      // Public Form Submissions
      "contacts",
      "feedbacks",
      "surveys",

      // Identity & User Data
      "profiles",

      // Legacy Tables (prior to schema unification)
      "clients",
      "employees",
    ];

    const stats: Record<string, number> = {};
    let totalDeleted = 0;

    for (const tableName of tableNames) {
      try {
        // Collect all documents from the table
        const docs = await ctx.db.query(tableName as any).collect();
        stats[tableName] = docs.length;

        if (docs.length > 0) {
          console.log(`  Deleting ${docs.length} from ${tableName}...`);
          // Batch delete for better performance if possible, but keep it simple for now
          for (const doc of docs) {
            await ctx.db.delete(doc._id);
          }
        } else {
          console.log(`  ○ ${tableName} is already empty`);
        }
        totalDeleted += docs.length;
      } catch (e) {
        // Table might not exist or schema might have moved/renamed it
        console.log(
          `  ○ Skipping ${tableName} (table may not exist or access denied)`,
        );
        stats[tableName] = 0;
      }
    }

    console.log(
      `\n✅ WIPE COMPLETE! Deleted ${totalDeleted} documents across all tables.`,
    );
    console.log(
      "ℹ️ Database has been reset to a completely clean state. You will need to re-seed and re-login (re-create your profile).",
    );
    
    return { success: true, totalDeleted, stats };
  },
});
