import { v } from "convex/values";
import { adminQuery, authenticatedQuery } from "../../../lib/customFunctions";

/**
 * Get all service packages (Accessible by Studios for package selection)
 */
export const getPackages = authenticatedQuery({
  args: {
    activeOnly: v.optional(v.boolean()),
    categoryId: v.optional(v.id("projectCategories")),
  },
  handler: async (ctx, args) => {
    let packages;

    if (args.activeOnly) {
      packages = await ctx.db
        .query("servicePackages")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .collect();
    } else {
      packages = await ctx.db.query("servicePackages").collect();
    }

    if (args.categoryId) {
      return packages.filter((p) => p.categoryId === args.categoryId);
    }

    return packages;
  },
});

/**
 * Get a single service package by ID
 */
export const getPackage = authenticatedQuery({
  args: {
    packageId: v.id("servicePackages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.packageId);
  },
});

/**
 * Get packages filtered by project type
 */
export const getPackagesByProjectType = authenticatedQuery({
  args: {
    projectTypeId: v.id("projectTypes"),
  },
  handler: async (ctx, args) => {
    const packages = await ctx.db
      .query("servicePackages")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    return packages.filter((t) => t.projectTypeId === args.projectTypeId);
  },
});
