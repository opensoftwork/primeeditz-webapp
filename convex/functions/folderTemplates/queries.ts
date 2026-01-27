import { v } from "convex/values";
import { query } from "../../_generated/server";
import { adminQuery } from "../../lib/customFunctions";

/**
 * List all folder templates for admin.
 */
export const listFolderTemplates = adminQuery({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db.query("folderTemplates").collect();

    // Enrich with project type name
    return await Promise.all(
      templates.map(async (t) => {
        let projectTypeName = "General";
        if (t.projectTypeId) {
          const type = await ctx.db.get(t.projectTypeId);
          if (type) projectTypeName = type.name;
        }
        return {
          ...t,
          projectTypeName,
        };
      }),
    );
  },
});

/**
 * Get a single folder template by ID.
 */
export const getFolderTemplate = adminQuery({
  args: {
    templateId: v.id("folderTemplates"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

/**
 * Get templates by project type.
 * Used when setting up folders for a project.
 */
export const getTemplatesByProjectType = query({
  args: {
    projectTypeId: v.id("projectTypes"),
  },
  handler: async (ctx, args) => {
    // Get templates specifically for this project type
    const specificTemplates = await ctx.db
      .query("folderTemplates")
      .withIndex("by_projectTypeId", (q) =>
        q.eq("projectTypeId", args.projectTypeId),
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Also get general templates (where projectTypeId is not set)
    const allTemplates = await ctx.db.query("folderTemplates").collect();
    const generalTemplates = allTemplates.filter(
      (t) => !t.projectTypeId && t.isActive,
    );

    return [...specificTemplates, ...generalTemplates];
  },
});
