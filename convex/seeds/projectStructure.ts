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
    { name: "Wedding Photography", category: "Photography" },
    { name: "Pre-Wedding Shoot", category: "Photography" },
    { name: "Maternity Session", category: "Photography" },
    { name: "Wedding Film", category: "Videography" },
    { name: "YouTube Video Edit", category: "Videography" },
    { name: "Instagram Reels Bundle", category: "Videography" },
    { name: "Premium Coffee Table Album", category: "Design & Post" },
    { name: "Commercial Ad Film", category: "Corporate" },
  ];

  const typeMap: Record<string, Id<"projectTypes">> = {};

  for (const type of projectTypes) {
    const existing = await ctx.db
      .query("projectTypes")
      .filter((q) => q.eq(q.field("name"), type.name))
      .first();
    
    if (existing) {
      typeMap[type.name] = existing._id;
    } else {
      const id = await ctx.db.insert("projectTypes", {
        name: type.name,
        categoryId: categoryMap[type.category],
        isActive: true,
        displayOrder: 0,
      });
      typeMap[type.name] = id;
    }
  }

  return { categoryMap, typeMap };
}
