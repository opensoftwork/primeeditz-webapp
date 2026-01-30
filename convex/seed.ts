import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { seedFolderTemplates } from "./seeds/folderTemplates";
import { seedProjectStructure } from "./seeds/projectStructure";
import { seedProjectTypeFields } from "./seeds/projectTypeFields";
import { seedQuotationLibraryItems } from "./seeds/quotationLibraryItems";
import { seedQuotationSections } from "./seeds/quotationSections";
import { seedServicePackages } from "./seeds/servicePackages";
import { seedStorageTiers } from "./seeds/storageTiers";

/**
 * SEEDING ENTRY POINT
 *
 * Orchestrates the modular seeding process aligned with Prime Editz B2B Rate Card.
 *
 * Run via Convex Dashboard or CLI:
 *   npx convex run seed:seedAll '{"clearFirst": true}'
 */
export const seedAll = mutation({
  args: {
    clearFirst: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    console.log("========================================");
    console.log("Starting Prime Editz Database Seeding...");
    console.log("========================================\n");

    if (args.clearFirst) {
      console.log("⚠️  Clearing existing data...\n");
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
        "quotationTemplates",
      ] as const;

      for (const table of tables) {
        try {
          const docs = await ctx.db.query(table as any).collect();
          if (docs.length > 0) {
            console.log(`  Deleting ${docs.length} from ${table}...`);
            for (const doc of docs) {
              await ctx.db.delete(doc._id);
            }
          }
        } catch (e) {
          // Skip if table doesn't exist
        }
      }
      console.log("");
    }

    // 1. Seed Project Structure (Categories & Types)
    console.log("📁 Step 1: Seeding Project Structure...");
    const { categoryMap, typeMap } = await seedProjectStructure(ctx);
    console.log(
      `   ✓ ${Object.keys(categoryMap).length} categories, ${Object.keys(typeMap).length} project types\n`,
    );

    // 2. Seed Project Type Fields (Dynamic Form Fields)
    console.log("📝 Step 2: Seeding Project Type Fields...");
    await seedProjectTypeFields(ctx, typeMap);
    console.log("");

    // 3. Seed Storage Tiers
    console.log("💾 Step 3: Seeding Storage Tiers...");
    await seedStorageTiers(ctx);
    console.log("");

    // 4. Seed Folder Templates
    console.log("📂 Step 4: Seeding Folder Templates...");
    await seedFolderTemplates(ctx, typeMap);
    console.log("");

    // 5. Seed Quotation Sections
    console.log("📊 Step 5: Seeding Quotation Sections...");
    const sectionMap = await seedQuotationSections(ctx);
    console.log(`   ✓ ${Object.keys(sectionMap).length} sections\n`);

    // 6. Seed Quotation Library Items (Individual Line Items)
    console.log("📚 Step 6: Seeding Quotation Library Items...");
    await seedQuotationLibraryItems(ctx, sectionMap, typeMap);
    console.log("");

    // 7. Seed Service Packages (Replaces Quotation Templates)
    console.log("📋 Step 7: Seeding Service Packages...");
    await seedServicePackages(ctx);
    console.log("");

    console.log("========================================");
    console.log("✅ All seeds completed successfully!");
    console.log("========================================");

    return {
      success: true,
      summary: {
        categories: Object.keys(categoryMap).length,
        projectTypes: Object.keys(typeMap).length,
        sections: Object.keys(sectionMap).length,
      },
    };
  },
});

/**
 * Quick seed for just quotation-related data (faster for testing)
 */
export const seedQuotationsOnly = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Seeding quotation data only...");

    // Get existing type map
    const projectTypes = await ctx.db.query("projectTypes").collect();
    const typeMap: Record<string, any> = {};
    for (const t of projectTypes) {
      typeMap[t.name] = t._id;
    }

    // Seed sections
    const sectionMap = await seedQuotationSections(ctx);

    // Seed library items
    await seedQuotationLibraryItems(ctx, sectionMap, typeMap);

    // Seed packages
    await seedServicePackages(ctx);

    console.log("Quotation seeding complete!");
    return { success: true };
  },
});
