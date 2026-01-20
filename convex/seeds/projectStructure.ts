import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function seedProjectStructure(ctx: MutationCtx) {
  const categories = [
    { name: "Photography", isActive: true },
    { name: "Videography", isActive: true },
    { name: "Design & Post", isActive: true },
    { name: "Corporate", isActive: true },
  ];

  const categoryMap: Record<string, Id<"projectCategories">> = {};

  for (const cat of categories) {
    const existing = await ctx.db
      .query("projectCategories")
      .filter((q) => q.eq(q.field("name"), cat.name))
      .first();
    
    if (existing) {
      categoryMap[cat.name] = existing._id;
    } else {
      const id = await ctx.db.insert("projectCategories", cat);
      categoryMap[cat.name] = id;
    }
  }

  const projectTypes = [
    { 
      name: "Wedding Photography", 
      category: "Photography",
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Album Production",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Photo Delivery",
        requiresSignoff: true,
      }
    },
    { 
      name: "Pre-Wedding Shoot", 
      category: "Photography",
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Print Package",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Photo Delivery",
        requiresSignoff: true,
      }
    },
    { 
      name: "Maternity Session", 
      category: "Photography",
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Framed Prints",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Digital Gallery",
        requiresSignoff: true,
      }
    },
    { 
      name: "Wedding Film", 
      category: "Videography",
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Video Delivery",
        requiresSignoff: false,
      }
    },
    { 
      name: "YouTube Video Edit", 
      category: "Videography",
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Final Render Delivery",
        requiresSignoff: false,
      }
    },
    { 
      name: "Instagram Reels Bundle", 
      category: "Videography",
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Reels Pack Handover",
        requiresSignoff: false,
      }
    },
    { 
      name: "Premium Coffee Table Album", 
      category: "Design & Post",
      deliveryConfig: {
        hasPhysicalDelivery: true,
        physicalDeliveryLabel: "Premium Album Printing",
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Digital Proofs",
        requiresSignoff: true,
      }
    },
    { 
      name: "Commercial Ad Film", 
      category: "Corporate",
      deliveryConfig: {
        hasPhysicalDelivery: false,
        hasDigitalDelivery: true,
        digitalDeliveryLabel: "Master Delivery",
        requiresSignoff: false,
      }
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
      // Also update existing with the new config if needed, or if we want to ensure fresh seed
      await ctx.db.patch(existing._id, { deliveryConfig: type.deliveryConfig });
    } else {
      const id = await ctx.db.insert("projectTypes", {
        name: type.name,
        categoryId: categoryMap[type.category],
        isActive: true,
        displayOrder: 0,
        deliveryConfig: type.deliveryConfig,
      });
      typeMap[type.name] = id;
    }
  }

  return { categoryMap, typeMap };
}
