import { adminQuery, authenticatedWithProfileQuery } from "../../lib/customFunctions";
import { v } from "convex/values";

/**
 * List all service packages with optional filters.
 */
export const list = adminQuery({
  args: {
    categoryId: v.optional(v.id("projectCategories")),
    isActive: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("servicePackages");

    // Filter by active status
    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }

    const packages = await query.collect();

    // Filter by search (client-side for simplicity)
    let filtered = packages;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filtered = packages.filter((p) =>
        p.name.toLowerCase().includes(searchLower),
      );
    }

    // Filter by category
    if (args.categoryId) {
      filtered = filtered.filter((p) => p.categoryId === args.categoryId);
    }

    // Sort by creation date by default (newest first)
    return filtered.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Get a specific service package by ID.
 */
export const get = adminQuery({
  args: { id: v.id("servicePackages") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/**
 * List all active service packages for studio request flow.
 */
export const listActive = authenticatedWithProfileQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("servicePackages")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

/**
 * Get multiple service packages by IDs.
 */
export const getMany = authenticatedWithProfileQuery({
  args: { ids: v.array(v.id("servicePackages")) },
  handler: async (ctx, { ids }) => {
    const packages = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return packages.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});
