import { v } from "convex/values";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Create a new project type.
 */
export const createProjectType = adminMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    categoryId: v.id("projectCategories"),
    isActive: v.boolean(),
    displayOrder: v.optional(v.number()),
    defaultFolderTemplateId: v.optional(v.id("folderTemplates")),
  },
  handler: async (ctx, args) => {
    const projectTypeId = await ctx.db.insert("projectTypes", {
      ...args,
    });
    return projectTypeId;
  },
});

/**
 * Update an existing project type.
 */
export const updateProjectType = adminMutation({
  args: {
    id: v.id("projectTypes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    isActive: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    defaultFolderTemplateId: v.optional(v.id("folderTemplates")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Toggle a project type's active status.
 */
export const toggleProjectTypeActive = adminMutation({
  args: {
    id: v.id("projectTypes"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
    return args.id;
  },
});

/**
 * Delete a project type permanently.
 */
export const deleteProjectType = adminMutation({
  args: {
    id: v.id("projectTypes"),
  },
  handler: async (ctx, args) => {
    // Also delete associated fields
    const fields = await ctx.db
      .query("projectTypeFields")
      .withIndex("by_projectTypeId", (q) => q.eq("projectTypeId", args.id))
      .collect();

    for (const field of fields) {
      await ctx.db.delete(field._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
