import { v } from "convex/values";
import { adminQuery, adminMutation } from "../../lib/customFunctions";
import { Doc, Id } from "../../_generated/dataModel";

/**
 * Get all project types for filter dropdown.
 */
export const getProjectTypes = adminQuery({
  args: {},
  handler: async (ctx) => {
    const projectTypes = await ctx.db.query("projectTypes").collect();
    const enriched = await Promise.all(
      projectTypes.map(async (pt) => {
        const category = pt.categoryId ? await ctx.db.get(pt.categoryId) : null;
        return {
          _id: pt._id,
          name: pt.name,
          categoryName: (category as Doc<"projectCategories"> | null)?.name || 'Uncategorized',
          isActive: pt.isActive,
        };
      })
    )
    return enriched;
  },
});

/**
 * Get fields for a specific project type.
 */
export const getProjectTypeFields = adminQuery({
  args: { projectTypeId: v.id("projectTypes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectTypeFields")
      .withIndex("by_projectTypeId", (q) =>
        q.eq("projectTypeId", args.projectTypeId),
      )
      .order("asc")
      .collect();
  },
});

/**
 * Create a new project type.
 */
export const createProjectType = adminMutation({
  args: {
    name: v.string(),
    categoryId: v.id("projectCategories"),
    isActive: v.boolean(),
    displayOrder: v.optional(v.number()),
    deliveryConfig: v.optional(
      v.object({
        hasPhysicalDelivery: v.boolean(),
        physicalDeliveryLabel: v.optional(v.string()),
        hasDigitalDelivery: v.boolean(),
        digitalDeliveryLabel: v.optional(v.string()),
        requiresSignoff: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projectTypes", { ...args });
  },
});

/**
 * Update a project type.
 */
export const updateProjectType = adminMutation({
  args: {
    id: v.id("projectTypes"),
    name: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    isActive: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    deliveryConfig: v.optional(
      v.object({
        hasPhysicalDelivery: v.boolean(),
        physicalDeliveryLabel: v.optional(v.string()),
        hasDigitalDelivery: v.boolean(),
        digitalDeliveryLabel: v.optional(v.string()),
        requiresSignoff: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

/**
 * Create or update a project type field.
 */
export const upsertProjectTypeField = adminMutation({
  args: {
    id: v.optional(v.id("projectTypeFields")),
    projectTypeId: v.id("projectTypes"),
    name: v.string(),
    label: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("select"),
      v.literal("checkbox"),
      v.literal("textarea"),
    ),
    required: v.boolean(),
    placeholder: v.optional(v.string()),
    description: v.optional(v.string()),
    options: v.optional(v.string()),
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    displayOrder: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("projectTypeFields", data);
    }
  },
});

/**
 * Delete a project type field.
 */
export const deleteProjectTypeField = adminMutation({
  args: { id: v.id("projectTypeFields") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Reorder project type fields.
 */
export const reorderProjectTypeFields = adminMutation({
  args: {
    fields: v.array(
      v.object({
        id: v.id("projectTypeFields"),
        displayOrder: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const field of args.fields) {
      await ctx.db.patch(field.id, { displayOrder: field.displayOrder });
    }
  },
});
