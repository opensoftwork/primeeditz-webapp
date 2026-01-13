import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Category return validator
 */
const categoryReturn = v.object({
  _id: v.id("libraryCategories"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.optional(v.string()),
  displayOrder: v.number(),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  isActive: v.boolean(),
  createdBy: v.string(),
  updatedAt: v.number(),
});

/**
 * Item return validator
 */
const itemReturn = v.object({
  _id: v.id("libraryItems"),
  _creationTime: v.number(),
  categoryId: v.id("libraryCategories"),
  name: v.string(),
  description: v.optional(v.string()),
  unit: v.string(),
  defaultRate: v.number(),
  image: v.optional(v.string()),
  sku: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  metadata: v.optional(v.any()),
  displayOrder: v.number(),
  isActive: v.boolean(),
  createdBy: v.string(),
  updatedAt: v.number(),
});

/**
 * Get all library categories
 */
export const getCategories = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.array(categoryReturn),
  handler: async (ctx, args) => {
    let categories;
    
    if (args.activeOnly) {
      categories = await ctx.db
        .query("libraryCategories")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .collect();
    } else {
      categories = await ctx.db.query("libraryCategories").collect();
    }
    
    return categories.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

/**
 * Get a single category
 */
export const getCategory = query({
  args: {
    categoryId: v.id("libraryCategories"),
  },
  returns: v.union(categoryReturn, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.categoryId);
  },
});

/**
 * Get all library items
 */
export const getItems = query({
  args: {
    categoryId: v.optional(v.id("libraryCategories")),
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.array(itemReturn),
  handler: async (ctx, args) => {
    let items;
    
    if (args.categoryId) {
      items = await ctx.db
        .query("libraryItems")
        .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId!))
        .collect();
    } else if (args.activeOnly) {
      items = await ctx.db
        .query("libraryItems")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .collect();
    } else {
      items = await ctx.db.query("libraryItems").collect();
    }
    
    // Filter by active if both categoryId and activeOnly are provided
    if (args.categoryId && args.activeOnly) {
      items = items.filter((i) => i.isActive);
    }
    
    return items.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

/**
 * Get a single item
 */
export const getItem = query({
  args: {
    itemId: v.id("libraryItems"),
  },
  returns: v.union(itemReturn, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.itemId);
  },
});

/**
 * Search items by name
 */
export const searchItems = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(itemReturn),
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return [];
    }
    
    const results = await ctx.db
      .query("libraryItems")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(args.limit ?? 20);
    
    return results;
  },
});

/**
 * Get items grouped by category
 */
export const getItemsGroupedByCategory = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      category: categoryReturn,
      items: v.array(itemReturn),
    })
  ),
  handler: async (ctx, args) => {
    // Get categories
    let categories = await ctx.db.query("libraryCategories").collect();
    if (args.activeOnly) {
      categories = categories.filter((c) => c.isActive);
    }
    categories.sort((a, b) => a.displayOrder - b.displayOrder);
    
    // Get items for each category
    const result = await Promise.all(
      categories.map(async (category) => {
        let items = await ctx.db
          .query("libraryItems")
          .withIndex("by_categoryId", (q) => q.eq("categoryId", category._id))
          .collect();
        
        if (args.activeOnly) {
          items = items.filter((i) => i.isActive);
        }
        items.sort((a, b) => a.displayOrder - b.displayOrder);
        
        return { category, items };
      })
    );
    
    return result;
  },
});
