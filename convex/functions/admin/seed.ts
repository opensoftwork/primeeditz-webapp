import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Reset and Seed the database with high-quality starter data.
 * Accommodates the new multi-project configuration architecture.
 */
export const runSeed = mutation({
  args: {
    confirm: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.confirm) {
      throw new Error("Seed not confirmed");
    }

    // Since this is a mutation (not adminMutation), we need to manually find 
    // an admin profile to assign as the creator of packages.
    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();

    if (!adminProfile) {
      console.error("❌ NO ADMIN PROFILE FOUND IN DATABASE");
      throw new Error("No admin profile found. Please create an admin account first.");
    }

    console.log(`👤 SEEDING AS ADMIN: ${adminProfile.name} (${adminProfile._id})`);
    console.log("🧹 WIPING EXISTING DATA FOR CLEAN SEED...");
    
    // 1. Wipe relevant tables (keeping profiles/users)
    const tablesToWipe = [
      "projectCategories",
      "projectTypes",
      "projectTypeFields",
      "storageTiers",
      "folderTemplates",
      "servicePackages",
      "quotationSections",
      "projects",
      "quotations",
      "servicePackageDrafts"
    ] as const;

    for (const table of tablesToWipe) {
      const docs = await ctx.db.query(table as any).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    console.log("🌱 SEEDING NEW DATA...");

    // 2. Create Quotation Sections
    const sectionCoreId = await ctx.db.insert("quotationSections", {
      name: "Core Services",
      icon: "Package",
      isActive: true,
      displayOrder: 1,
    });

    const sectionAddonId = await ctx.db.insert("quotationSections", {
      name: "Add-ons & Upgrades",
      icon: "PlusCircle",
      isActive: true,
      displayOrder: 2,
    });

    // 3. Create Project Categories
    const catWeddingId = await ctx.db.insert("projectCategories", {
      name: "Wedding Post-Production",
      isActive: true,
      displayOrder: 1,
    });

    const catSocialId = await ctx.db.insert("projectCategories", {
      name: "Social Media & Reels",
      isActive: true,
      displayOrder: 2,
    });

    // 4. Create Project Types
    const typeHighlightId = await ctx.db.insert("projectTypes", {
      name: "Cinematic Highlight",
      description: "A 3-5 minute high-end wedding highlight film.",
      icon: "Film",
      categoryId: catWeddingId,
      isActive: true,
      displayOrder: 1,
    });

    const typeReelId = await ctx.db.insert("projectTypes", {
      name: "Instagram Reel",
      description: "Short-form vertical content for social platforms.",
      icon: "Instagram",
      categoryId: catSocialId,
      isActive: true,
      displayOrder: 2,
    });

    // 5. Create Storage Tiers
    const tierStandardId = await ctx.db.insert("storageTiers", {
      name: "Standard Delivery",
      sizeGB: 50,
      priceINR: 0,
      isActive: true,
      isDefault: true,
    });

    const tierProId = await ctx.db.insert("storageTiers", {
      name: "Raw Footage Storage",
      sizeGB: 500,
      priceINR: 5000,
      isActive: true,
    });

    // 6. Create Folder Templates
    const weddingFolderStruct = [
      {
        name: "01_Footage",
        path: "01_Footage",
        children: [
          { name: "Cam_A", path: "01_Footage/Cam_A" },
          { name: "Cam_B", path: "01_Footage/Cam_B" },
          { name: "Drones", path: "01_Footage/Drones" },
        ]
      },
      {
        name: "02_Audio",
        path: "02_Audio",
        children: [
          { name: "Music", path: "02_Audio/Music" },
          { name: "Ambience", path: "02_Audio/Ambience" },
        ]
      },
      { name: "03_Drafts", path: "03_Drafts" },
      { name: "04_Final_Masters", path: "04_Final_Masters", isRequired: true }
    ];

    const templateWeddingId = await ctx.db.insert("folderTemplates", {
      name: "Standard Wedding Workflow",
      description: "Comprehensive structure for wedding films.",
      projectTypeId: typeHighlightId,
      folders: weddingFolderStruct as any,
      isActive: true,
      isDefault: true,
    });

    const templateReelId = await ctx.db.insert("folderTemplates", {
      name: "Vertical Video Layout",
      description: "Streamlined structure for reels and shorts.",
      projectTypeId: typeReelId,
      folders: [
        { name: "Footage", path: "Footage" },
        { name: "Music_VO", path: "Music_VO" },
        { name: "Exports", path: "Exports", isRequired: true }
      ] as any,
      isActive: true,
      isDefault: true,
    });

    // Update Project Types with default templates
    await ctx.db.patch(typeHighlightId, { defaultFolderTemplateId: templateWeddingId });
    await ctx.db.patch(typeReelId, { defaultFolderTemplateId: templateReelId });

    // 7. Create Service Packages (Multi-Config!)
    
    // Package 1: Single Config
    await ctx.db.insert("servicePackages", {
      name: "The Cinematic Highlight",
      description: "Premium wedding highlight edit with color grading and sound design.",
      categoryId: catWeddingId,
      projectConfigs: [
        {
          id: "config_highlight",
          label: "Principal Highlight Film",
          categoryId: catWeddingId,
          projectTypeId: typeHighlightId,
          folderTemplateId: templateWeddingId,
          defaultStorageTierId: tierStandardId,
        }
      ],
      // Required legacy fields (set to first config)
      projectTypeId: typeHighlightId,
      folderTemplateId: templateWeddingId,
      defaultStorageTierId: tierStandardId,
      
      lineItems: [
        {
          id: "li_1",
          sectionId: sectionCoreId,
          description: "Cinematic Editing & Grading",
          unit: "per film",
          rate: 15000,
          quantity: 1,
          projectConfigId: "config_highlight"
        }
      ],
      terms: "Standard 7-day delivery turnaround. Includes 2 rounds of revisions.",
      applyGST: true,
      isActive: true,
      createdBy: adminProfile._id,
      updatedAt: Date.now(),
    });

    // Package 2: Multi-Project Config (Bundle)
    await ctx.db.insert("servicePackages", {
      name: "Social Viral Bundle",
      description: "Full wedding package including a main highlight and 3 social reels.",
      categoryId: catSocialId,
      projectConfigs: [
        {
          id: "config_main",
          label: "Main Wedding Highlight",
          categoryId: catWeddingId,
          projectTypeId: typeHighlightId,
          folderTemplateId: templateWeddingId,
          defaultStorageTierId: tierStandardId,
        },
        {
          id: "config_reels",
          label: "Social Reels (Set of 3)",
          categoryId: catSocialId,
          projectTypeId: typeReelId,
          folderTemplateId: templateReelId,
          defaultStorageTierId: tierStandardId,
        }
      ],
      // Legacy fields (from first config)
      projectTypeId: typeHighlightId,
      folderTemplateId: templateWeddingId,
      defaultStorageTierId: tierStandardId,

      lineItems: [
        {
          id: "li_bundle_1",
          sectionId: sectionCoreId,
          description: "Premium Highlight Film",
          unit: "per film",
          rate: 15000,
          quantity: 1,
          projectConfigId: "config_main"
        },
        {
          id: "li_bundle_2",
          sectionId: sectionCoreId,
          description: "Social Media Reels",
          unit: "per reel",
          rate: 2500,
          quantity: 3,
          projectConfigId: "config_reels"
        }
      ],
      terms: "Bundle discount applied. Reels will be delivered sequentially.",
      applyGST: true,
      isActive: true,
      createdBy: adminProfile._id,
      updatedAt: Date.now(),
    });

    console.log("✅ SEEDING COMPLETE!");
    return { success: true };
  },
});
