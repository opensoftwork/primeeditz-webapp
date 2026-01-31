import { v } from "convex/values";
import { adminQuery, authenticatedQuery } from "../../lib/customFunctions";

/**
 * List all folder templates with project type names.
 */
export const list = adminQuery({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db.query("folderTemplates").collect();
    return await Promise.all(
      templates.map(async (template) => {
        const projectType = await ctx.db.get(template.projectTypeId);
        return {
          ...template,
          projectTypeName: projectType?.name || "N/A",
        };
      }),
    );
  },
});

/**
 * Get a specific folder template by ID.
 */
export const get = adminQuery({
  args: { id: v.id("folderTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * List all folder templates for a specific project type.
 * Used for selection in quotation/onboarding.
 */
export const listByProjectType = authenticatedQuery({
  args: { projectTypeId: v.id("projectTypes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("folderTemplates")
      .withIndex("by_projectType_isActive", (q) =>
        q.eq("projectTypeId", args.projectTypeId).eq("isActive", true)
      )
      .collect();
  },
});

/**
 * Get the default (or first) folder template for a project type.
 */
export const getByProjectTypeId = adminQuery({
  args: { projectTypeId: v.id("projectTypes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("folderTemplates")
      .withIndex("by_projectTypeId", (q) =>
        q.eq("projectTypeId", args.projectTypeId)
      )
      .first();
  },
});

/**
 * List all folder templates for a specific project type (Admin).
 */
export const listAllByProjectType = adminQuery({
  args: { projectTypeId: v.id("projectTypes") },
  handler: async (ctx, args) => {
    const projectType = await ctx.db.get(args.projectTypeId);
    const templates = await ctx.db
      .query("folderTemplates")
      .withIndex("by_projectTypeId", (q) =>
        q.eq("projectTypeId", args.projectTypeId)
      )
      .collect();

    return templates.map((template) => ({
      ...template,
      projectTypeName: projectType?.name || "N/A",
    }));
  },
});
