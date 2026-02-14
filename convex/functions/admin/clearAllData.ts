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

    const tableNames = [
      "assets",
      "clients",
      "deliverables",
      "deliverableVersions",
      "employees",
      "folders",
      "projects",
      "quotations",
      "statusHistory",
      "projectSquads",
      "handoffLogs",
      "quotationRequestDrafts",
      "versionRequests",
      "studioApprovals",
    ];

    const stats: Record<string, number> = {};
    let totalDeleted = 0;

    for (const tableName of tableNames) {
      try {
        const docs = await ctx.db.query(tableName as any).collect();
        stats[tableName] = docs.length;
        if (docs.length > 0) {
          console.log(`  Deleting ${docs.length} from ${tableName}...`);
          for (const doc of docs) {
            await ctx.db.delete(doc._id);
          }
        } else {
          console.log(`  ○ ${tableName} is already empty`);
        }
        totalDeleted += docs.length;
      } catch (e) {
        console.log(`  ○ Skipping ${tableName} (table may not exist or access denied)`);
        stats[tableName] = 0;
      }
    }

    console.log(
      `\n✅ WIPE COMPLETE! Deleted ${totalDeleted} documents across all tables.`,
    );
    console.log(
      "ℹ️ Preserved: Profiles, Auth, Project Types, Storage Tiers, Service Packages, and related system configurations.",
    );
    return { success: true, totalDeleted, stats };
  },
});
