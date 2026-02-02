import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { adminMutation } from "../../lib/customFunctions";

/**
 * DESTRUCTIVE: Wipes all data from the database.
 * Use with extreme caution!
 */
export const wipeAllData = adminMutation({
  args: {
    confirm: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.confirm) {
      throw new Error("Wipe not confirmed");
    }

    console.log("⚠️ STARTING FULL DATABASE WIPE...");

    const tables = [
      "projects",
      "statusHistory",
      "projectCategories",
      "projectTypes",
      "projectTypeFields",
      "storageTiers",
      "folderTemplates",
      "folders",
      "assets",
      "deliverables",
      "quotationSections",
      "servicePackages",
      "quotationLibraryItems",
      "quotations",
      "projectSquads",
      "handoffLogs",
      "servicePackageDrafts",
    ] as const;

    const stats: Record<string, number> = {};

    for (const table of tables) {
      try {
        const docs = await ctx.db.query(table as any).collect();
        stats[table] = docs.length;
        if (docs.length > 0) {
          console.log(`  Deleting ${docs.length} from ${table}...`);
          for (const doc of docs) {
            await ctx.db.delete(doc._id);
          }
        }
      } catch (e) {
        console.log(`  ○ Skipping ${table} (table may not exist yet)`);
        stats[table] = 0;
      }
    }

    console.log("✅ WIPE COMPLETE!");
    return { success: true, stats };
  },
});
