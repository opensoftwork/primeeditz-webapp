import { v } from "convex/values";
import { adminMutation } from "../../../lib/customFunctions";
import { servicePackageLineItemValidator } from "../../../schema";

/**
 * Create a new service package
 */
export const createPackage = adminMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    projectTypeId: v.id("projectTypes"),
    folderTemplateId: v.id("folderTemplates"),
    defaultStorageTierId: v.optional(v.id("storageTiers")),
    lineItems: v.array(servicePackageLineItemValidator),
    terms: v.optional(v.string()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("servicePackages", {
      name: args.name,
      description: args.description,
      categoryId: args.categoryId,
      projectTypeId: args.projectTypeId,
      folderTemplateId: args.folderTemplateId,
      defaultStorageTierId: args.defaultStorageTierId,
      lineItems: args.lineItems,
      terms: args.terms,
      isActive: true,
      createdBy: args.createdBy,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update an existing package
 */
export const updatePackage = adminMutation({
  args: {
    packageId: v.id("servicePackages"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    projectTypeId: v.optional(v.id("projectTypes")),
    folderTemplateId: v.optional(v.id("folderTemplates")),
    defaultStorageTierId: v.optional(v.id("storageTiers")),
    lineItems: v.optional(v.array(servicePackageLineItemValidator)),
    terms: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { packageId, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );

    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(packageId, {
        ...cleanUpdates,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

/**
 * Toggle package active status
 */
export const togglePackageActive = adminMutation({
  args: {
    packageId: v.id("servicePackages"),
  },
  handler: async (ctx, args) => {
    const pkg = await ctx.db.get(args.packageId);
    if (!pkg) {
      throw new Error("Package not found");
    }

    const newStatus = !pkg.isActive;
    await ctx.db.patch(args.packageId, {
      isActive: newStatus,
      updatedAt: Date.now(),
    });
    return newStatus;
  },
});

/**
 * Delete a package (mark inactive)
 */
export const deletePackage = adminMutation({
  args: {
    packageId: v.id("servicePackages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.packageId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return null;
  },
});
