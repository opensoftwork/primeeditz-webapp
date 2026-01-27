/**
 * Seed Functions
 *
 * One-time setup functions to populate initial data.
 */

import { mutation } from "../_generated/server";

/**
 * Seed default project types.
 * Run this once to set up initial project types.
 */
/**
 * Wipe all project configuration and re-seed.
 */
export const resetAndSeed = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Wipe existing data
    const categories = await ctx.db.query("projectCategories").collect();
    const types = await ctx.db.query("projectTypes").collect();
    const fields = await ctx.db.query("projectTypeFields").collect();

    for (const c of categories) await ctx.db.delete(c._id);
    for (const t of types) await ctx.db.delete(t._id);
    for (const f of fields) await ctx.db.delete(f._id);

    // 2. Initial categories
    const categoryData = [
      { name: "Album", isActive: true },
      { name: "Photography", isActive: true },
      { name: "Video", isActive: true },
      { name: "Corporate", isActive: true },
    ];

    const categoryMap = new Map();
    for (const cat of categoryData) {
      const id = await ctx.db.insert("projectCategories", cat);
      categoryMap.set(cat.name, id);
    }

    // 3. Initial types
    const projectTypeData = [
      {
        name: "Wedding Album",
        categoryId: categoryMap.get("Album"),
        isActive: true,
      },
      {
        name: "Pre-Wedding Album",
        categoryId: categoryMap.get("Album"),
        isActive: true,
      },
      {
        name: "Birthday Album",
        categoryId: categoryMap.get("Album"),
        isActive: true,
      },
      {
        name: "Wedding Photography Edit",
        categoryId: categoryMap.get("Photography"),
        isActive: true,
      },
      {
        name: "Wedding Film",
        categoryId: categoryMap.get("Video"),
        isActive: true,
      },
      {
        name: "YouTube Video",
        categoryId: categoryMap.get("Video"),
        isActive: true,
      },
      {
        name: "Instagram Reel",
        categoryId: categoryMap.get("Video"),
        isActive: true,
      },
      {
        name: "Corporate Event",
        categoryId: categoryMap.get("Corporate"),
        isActive: true,
      },
    ];

    for (const projectType of projectTypeData) {
      await ctx.db.insert("projectTypes", {
        name: projectType.name,
        categoryId: projectType.categoryId,
        isActive: projectType.isActive,
      });
    }

    return { message: "Data reset and re-seeded successfully" };
  },
});

/**
 * Seed initial storage tiers and folder templates for quotation testing.
 */
export const seedQuotationBasics = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Seed Storage Tiers
    const existingTiers = await ctx.db.query("storageTiers").collect();
    if (existingTiers.length === 0) {
      await ctx.db.insert("storageTiers", {
        name: "Standard Tier",
        sizeGB: 100,
        priceINR: 5000,
        isActive: true,
        isDefault: true,
      });
      await ctx.db.insert("storageTiers", {
        name: "Premium Tier",
        sizeGB: 500,
        priceINR: 15000,
        isActive: true,
      });
    }

    // 2. Seed Folder Templates
    const projectTypes = await ctx.db.query("projectTypes").collect();
    const weddingFilmType = projectTypes.find((t) => t.name === "Wedding Film");

    if (weddingFilmType) {
      const existingTemplates = await ctx.db
        .query("folderTemplates")
        .filter((q) => q.eq(q.field("projectTypeId"), weddingFilmType._id))
        .collect();

      if (existingTemplates.length === 0) {
        await ctx.db.insert("folderTemplates", {
          name: "Standard Wedding Structure",
          projectTypeId: weddingFilmType._id,
          folders: [
            "Raw Footage",
            "Music",
            "Assets",
            "Drafts",
            "Final Delivery",
          ],
          isActive: true,
          isDefault: true,
        });
      }
    }

    return { message: "Quotation basics seeded successfully" };
  },
});
