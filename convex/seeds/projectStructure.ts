import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * SEED: Project Categories & Types
 *
 * Aligned with Prime Editz B2B Rate Card pricing strategy.
 * Categories: Photography Post-Production, Videography Post-Production
 */

export async function seedProjectStructure(ctx: MutationCtx) {
  // ==========================================================================
  // PROJECT CATEGORIES
  // ==========================================================================
  const categories = [
    {
      name: "Photography Post-Production",
      isActive: true,
      displayOrder: 1,
    },
    {
      name: "Videography Post-Production",
      isActive: true,
      displayOrder: 2,
    },
  ];

  const categoryMap: Record<string, Id<"projectCategories">> = {};

  for (const cat of categories) {
    const existing = await ctx.db
      .query("projectCategories")
      .filter((q) => q.eq(q.field("name"), cat.name))
      .first();

    if (existing) {
      categoryMap[cat.name] = existing._id;
      await ctx.db.patch(existing._id, { displayOrder: cat.displayOrder });
    } else {
      const id = await ctx.db.insert("projectCategories", cat);
      categoryMap[cat.name] = id;
    }
  }

  // ==========================================================================
  // PROJECT TYPES - Aligned with Pricing Document
  // ==========================================================================
  const projectTypes = [
    // Photography Post-Production Types
    {
      name: "Traditional Photo Color Correction",
      category: "Photography Post-Production",
      displayOrder: 1,
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Color Corrected Photos",
        requiresSignoff: false,
      },
    },
    {
      name: "Candid Photo Grading",
      category: "Photography Post-Production",
      displayOrder: 2,
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Graded Photos",
        requiresSignoff: false,
      },
    },
    {
      name: "Album Design - Traditional",
      category: "Photography Post-Production",
      displayOrder: 3,
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Printed Album",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Album Design Files",
        requiresSignoff: true,
      },
    },
    {
      name: "Album Design - Candid",
      category: "Photography Post-Production",
      displayOrder: 4,
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Premium Candid Album",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Album Design Files",
        requiresSignoff: true,
      },
    },
    {
      name: "Album Design - Custom Branding",
      category: "Photography Post-Production",
      displayOrder: 5,
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Branded Premium Album",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Album Design + Branding Assets",
        requiresSignoff: true,
      },
    },
    // Videography Post-Production Types
    {
      name: "Traditional Video Edit",
      category: "Videography Post-Production",
      displayOrder: 6,
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Full Length Video",
        requiresSignoff: false,
      },
    },
    {
      name: "Pre-Wedding Teaser",
      category: "Videography Post-Production",
      displayOrder: 7,
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Teaser + Video Files",
        requiresSignoff: false,
      },
    },
    {
      name: "Pre-Wedding with VFX",
      category: "Videography Post-Production",
      displayOrder: 8,
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "VFX Enhanced Video",
        requiresSignoff: false,
      },
    },
    {
      name: "Highlight/Teaser Edit",
      category: "Videography Post-Production",
      displayOrder: 9,
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Highlight Reel",
        requiresSignoff: false,
      },
    },
    {
      name: "VFX Work",
      category: "Videography Post-Production",
      displayOrder: 10,
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "VFX Rendered Files",
        requiresSignoff: false,
      },
    },
    {
      name: "Cinematic Film",
      category: "Videography Post-Production",
      displayOrder: 11,
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "USB/Drive Delivery",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Cinematic Film Master",
        requiresSignoff: true,
      },
    },
    // Combo/Package Project Types
    {
      name: "Wedding Package - Silver",
      category: "Photography Post-Production",
      displayOrder: 20,
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Album + USB",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "All Digital Assets",
        requiresSignoff: true,
      },
    },
    {
      name: "Wedding Package - Gold",
      category: "Photography Post-Production",
      displayOrder: 21,
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Albums + USB",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "All Digital Assets",
        requiresSignoff: true,
      },
    },
    {
      name: "Wedding Package - Platinum",
      category: "Videography Post-Production",
      displayOrder: 22,
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Premium Albums + USB",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "All Digital Assets + Drone",
        requiresSignoff: true,
      },
    },
    {
      name: "Wedding Package - Diamond",
      category: "Videography Post-Production",
      displayOrder: 23,
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "All Albums + Parent Albums + USB",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Complete Digital Suite",
        requiresSignoff: true,
      },
    },
    {
      name: "Wedding Package - Royal Elite",
      category: "Videography Post-Production",
      displayOrder: 24,
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Luxury Albums + 4 Parent Albums + USB",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Complete Digital Suite + Raw Backups",
        requiresSignoff: true,
      },
    },
  ];

  const typeMap: Record<string, Id<"projectTypes">> = {};

  for (const type of projectTypes) {
    const existing = await ctx.db
      .query("projectTypes")
      .filter((q) => q.eq(q.field("name"), type.name))
      .first();

    if (existing) {
      typeMap[type.name] = existing._id;
      await ctx.db.patch(existing._id, {
        deliveryConfig: type.deliveryConfig,
        displayOrder: type.displayOrder,
        categoryId: categoryMap[type.category],
      });
    } else {
      const id = await ctx.db.insert("projectTypes", {
        name: type.name,
        categoryId: categoryMap[type.category],
        isActive: true,
        displayOrder: type.displayOrder,
        deliveryConfig: type.deliveryConfig,
      });
      typeMap[type.name] = id;
    }
  }

  console.log(
    `Seeded ${Object.keys(categoryMap).length} categories and ${Object.keys(typeMap).length} project types`,
  );

  return { categoryMap, typeMap };
}
