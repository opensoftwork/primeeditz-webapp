import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ============================================================================
// CATEGORY MUTATIONS
// ============================================================================

/**
 * Create a new library category
 */
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    createdBy: v.string(),
  },
  returns: v.id("libraryCategories"),
  handler: async (ctx, args) => {
    let displayOrder = args.displayOrder;
    if (displayOrder === undefined) {
      const categories = await ctx.db.query("libraryCategories").collect();
      displayOrder = categories.length > 0
        ? Math.max(...categories.map((c) => c.displayOrder)) + 1
        : 0;
    }
    
    return await ctx.db.insert("libraryCategories", {
      name: args.name,
      description: args.description,
      displayOrder,
      icon: args.icon,
      color: args.color,
      isActive: true,
      createdBy: args.createdBy,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a category
 */
export const updateCategory = mutation({
  args: {
    categoryId: v.id("libraryCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { categoryId, ...updates } = args;
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(categoryId, {
        ...cleanUpdates,
        updatedAt: Date.now(),
      });
    }
    
    return null;
  },
});

/**
 * Reorder categories
 */
export const reorderCategories = mutation({
  args: {
    orderedIds: v.array(v.id("libraryCategories")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await Promise.all(
      args.orderedIds.map((id, index) =>
        ctx.db.patch(id, { displayOrder: index, updatedAt: Date.now() })
      )
    );
    return null;
  },
});

/**
 * Delete category (soft delete)
 */
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("libraryCategories"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.categoryId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return null;
  },
});

// ============================================================================
// ITEM MUTATIONS
// ============================================================================

/**
 * Create a new library item
 */
export const createItem = mutation({
  args: {
    categoryId: v.id("libraryCategories"),
    name: v.string(),
    description: v.optional(v.string()),
    unit: v.string(),
    defaultRate: v.number(),
    image: v.optional(v.string()),
    sku: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    displayOrder: v.optional(v.number()),
    createdBy: v.string(),
  },
  returns: v.id("libraryItems"),
  handler: async (ctx, args) => {
    let displayOrder = args.displayOrder;
    if (displayOrder === undefined) {
      const items = await ctx.db
        .query("libraryItems")
        .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
        .collect();
      displayOrder = items.length > 0
        ? Math.max(...items.map((i) => i.displayOrder)) + 1
        : 0;
    }
    
    return await ctx.db.insert("libraryItems", {
      categoryId: args.categoryId,
      name: args.name,
      description: args.description,
      unit: args.unit,
      defaultRate: args.defaultRate,
      image: args.image,
      sku: args.sku,
      tags: args.tags,
      metadata: args.metadata,
      displayOrder,
      isActive: true,
      createdBy: args.createdBy,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update an item
 */
export const updateItem = mutation({
  args: {
    itemId: v.id("libraryItems"),
    categoryId: v.optional(v.id("libraryCategories")),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    unit: v.optional(v.string()),
    defaultRate: v.optional(v.number()),
    image: v.optional(v.string()),
    sku: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { itemId, ...updates } = args;
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(itemId, {
        ...cleanUpdates,
        updatedAt: Date.now(),
      });
    }
    
    return null;
  },
});

/**
 * Reorder items within a category
 */
export const reorderItems = mutation({
  args: {
    orderedIds: v.array(v.id("libraryItems")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await Promise.all(
      args.orderedIds.map((id, index) =>
        ctx.db.patch(id, { displayOrder: index, updatedAt: Date.now() })
      )
    );
    return null;
  },
});

/**
 * Delete item (soft delete)
 */
export const deleteItem = mutation({
  args: {
    itemId: v.id("libraryItems"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Duplicate an item
 */
export const duplicateItem = mutation({
  args: {
    itemId: v.id("libraryItems"),
    newName: v.optional(v.string()),
    createdBy: v.string(),
  },
  returns: v.id("libraryItems"),
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.itemId);
    if (!original) {
      throw new Error("Item not found");
    }
    
    const items = await ctx.db
      .query("libraryItems")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", original.categoryId))
      .collect();
    const maxOrder = items.length > 0
      ? Math.max(...items.map((i) => i.displayOrder))
      : 0;
    
    return await ctx.db.insert("libraryItems", {
      categoryId: original.categoryId,
      name: args.newName || `${original.name} (Copy)`,
      description: original.description,
      unit: original.unit,
      defaultRate: original.defaultRate,
      image: original.image,
      sku: undefined, // SKU should be unique
      tags: original.tags,
      metadata: original.metadata,
      displayOrder: maxOrder + 1,
      isActive: true,
      createdBy: args.createdBy,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Bulk import items
 */
export const bulkImportItems = mutation({
  args: {
    categoryId: v.id("libraryCategories"),
    items: v.array(
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
        unit: v.string(),
        defaultRate: v.number(),
        sku: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      })
    ),
    createdBy: v.string(),
  },
  returns: v.array(v.id("libraryItems")),
  handler: async (ctx, args) => {
    const existingItems = await ctx.db
      .query("libraryItems")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    
    let startOrder = existingItems.length > 0
      ? Math.max(...existingItems.map((i) => i.displayOrder)) + 1
      : 0;
    
    const insertedIds: string[] = [];
    
    for (const item of args.items) {
      const id = await ctx.db.insert("libraryItems", {
        categoryId: args.categoryId,
        name: item.name,
        description: item.description,
        unit: item.unit,
        defaultRate: item.defaultRate,
        image: undefined,
        sku: item.sku,
        tags: item.tags,
        metadata: undefined,
        displayOrder: startOrder++,
        isActive: true,
        createdBy: args.createdBy,
        updatedAt: Date.now(),
      });
      insertedIds.push(id);
    }
    
    return insertedIds as any;
  },
});
