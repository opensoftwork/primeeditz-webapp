import { v } from "convex/values";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Create a new folder template.
 */
export const createFolderTemplate = adminMutation({
  args: {
    name: v.string(),
    folders: v.array(v.string()),
    projectTypeId: v.optional(v.id("projectTypes")),
    isDefault: v.optional(v.boolean()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // If isDefault is true, unset other defaults for the same project type
    if (args.isDefault) {
      const existing = await ctx.db
        .query("folderTemplates")
        .withIndex("by_projectTypeId", (q) =>
          q.eq("projectTypeId", args.projectTypeId),
        )
        .collect();

      for (const t of existing) {
        if (t.isDefault) {
          await ctx.db.patch(t._id, { isDefault: false });
        }
      }
    }

    const templateId = await ctx.db.insert("folderTemplates", {
      ...args,
    });

    return templateId;
  },
});

/**
 * Update an existing folder template.
 */
export const updateFolderTemplate = adminMutation({
  args: {
    id: v.id("folderTemplates"),
    name: v.optional(v.string()),
    folders: v.optional(v.array(v.string())),
    projectTypeId: v.optional(v.id("projectTypes")),
    isDefault: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // If isDefault is being set to true, unset other defaults for the same project type
    if (updates.isDefault) {
      const template = await ctx.db.get(id);
      const projectTypeId = updates.projectTypeId ?? template?.projectTypeId;

      const existing = await ctx.db
        .query("folderTemplates")
        .withIndex("by_projectTypeId", (q) =>
          q.eq("projectTypeId", projectTypeId),
        )
        .collect();

      for (const t of existing) {
        if (t.isDefault && t._id !== id) {
          await ctx.db.patch(t._id, { isDefault: false });
        }
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Delete a folder template.
 * Prevent deletion if in use by projects (TBD later with usage check).
 */
export const deleteFolderTemplate = adminMutation({
  args: {
    id: v.id("folderTemplates"),
  },
  handler: async (ctx, args) => {
    // Basic check: in a real app, we'd check if any project is currently using this template's structure
    // But since folders are independent records once created, we can just delete the template.
    await ctx.db.delete(args.id);
    return args.id;
  },
});
