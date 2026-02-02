import { adminMutation } from "../../lib/customFunctions";
import { v } from "convex/values";
import { servicePackageLineItemValidator } from "../../schema";

/**
 * Create a new service package.
 */
export const create = adminMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    projectConfigs: v.optional(v.array(v.object({
      id: v.string(),
      label: v.optional(v.string()),
      categoryId: v.optional(v.id("projectCategories")),
      projectTypeId: v.id("projectTypes"),
      folderTemplateId: v.id("folderTemplates"),
      defaultStorageTierId: v.optional(v.id("storageTiers")),
    }))),
    projectTypeId: v.optional(v.id("projectTypes")),
    folderTemplateId: v.optional(v.id("folderTemplates")),
    defaultStorageTierId: v.optional(v.id("storageTiers")),
    lineItems: v.array(servicePackageLineItemValidator),
    terms: v.optional(v.string()),
    applyGST: v.optional(v.boolean()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("servicePackages", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update an existing service package.
 */
export const update = adminMutation({
  args: {
    id: v.id("servicePackages"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    projectConfigs: v.optional(v.array(v.object({
      id: v.string(),
      label: v.optional(v.string()),
      categoryId: v.optional(v.id("projectCategories")),
      projectTypeId: v.id("projectTypes"),
      folderTemplateId: v.id("folderTemplates"),
      defaultStorageTierId: v.optional(v.id("storageTiers")),
    }))),
    projectTypeId: v.optional(v.id("projectTypes")),
    folderTemplateId: v.optional(v.id("folderTemplates")),
    defaultStorageTierId: v.optional(v.id("storageTiers")),
    lineItems: v.optional(v.array(servicePackageLineItemValidator)),
    terms: v.optional(v.string()),
    applyGST: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Toggle the active status of a service package.
 */
export const toggleActive = adminMutation({
  args: {
    id: v.id("servicePackages"),
    isActive: v.boolean(),
  },
  handler: async (ctx, { id, isActive }) => {
    await ctx.db.patch(id, {
      isActive,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Duplicate a service package.
 */
export const duplicate = adminMutation({
  args: {
    id: v.id("servicePackages"),
  },
  handler: async (ctx, { id }) => {
    const pkg = await ctx.db.get(id);
    if (!pkg) throw new Error("Package not found");

    const { _id, _creationTime, ...data } = pkg;
    
    return await ctx.db.insert("servicePackages", {
      ...data,
      name: `Copy of ${data.name}`,
      isActive: false, // Default to inactive for the copy
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a service package.
 */
export const deleteServicePackage = adminMutation({
  args: {
    id: v.id("servicePackages"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
