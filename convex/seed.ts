import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { seedProjectStructure } from "./seeds/projectStructure";
import { seedQuotationSections } from "./seeds/quotationSections";
import { seedQuotationTemplates } from "./seeds/quotationTemplates";
import { seedQuotationLibraryItems } from "./seeds/quotationLibraryItems";

/**
 * SEEDING ENTRY POINT
 * 
 * Orchestrates the modular seeding process.
 */
export const seedAll = mutation({
  args: {
    clearFirst: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    console.log("Starting modular seed process...");

    // 1. Seed Projects (Categories & Types)
    const { typeMap } = await seedProjectStructure(ctx);
    console.log("Project structure seeded.");

    // 2. Seed Quotation Sections
    const sectionMap = await seedQuotationSections(ctx);
    console.log("Quotation sections seeded.");

    // 3. Seed Quotation Library Items (Individual Segments)
    await seedQuotationLibraryItems(ctx, sectionMap, typeMap);
    console.log("Quotation library items seeded.");

    // 4. Seed Quotation Templates
    await seedQuotationTemplates(ctx, sectionMap, typeMap);
    console.log("Quotation templates seeded.");

    console.log("All seeds completed successfully!");
    return { success: true };
  },
});
