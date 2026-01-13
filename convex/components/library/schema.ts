import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Library Component Schema
 * 
 * A reusable items catalog that can be consumed by:
 * - Quotation system (add items to quotes)
 * - Invoice system (add items to invoices)
 * - Inventory management
 * - Purchase orders
 * - Any module that needs a catalog of items
 * 
 * Design Philosophy:
 * - Categories are user-configurable
 * - Items belong to categories
 * - No dependency on any other component
 */

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

export default defineSchema({
  // --------------------------------------------------------------------------
  // Library Categories
  // User-defined groupings for organizing items
  // Examples: "Design Services", "Post-Production", "Materials", "Labor"
  // --------------------------------------------------------------------------
  libraryCategories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    displayOrder: v.number(),
    icon: v.optional(v.string()), // Lucide icon name (e.g., "PenTool")
    color: v.optional(v.string()), // Accent color (e.g., "#3B82F6")
    isActive: v.boolean(),
    
    // Audit
    createdBy: v.string(), // Host app's user identifier
    updatedAt: v.number(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_displayOrder", ["displayOrder"]),

  // --------------------------------------------------------------------------
  // Library Items
  // Reusable item definitions for quick addition to various documents
  // --------------------------------------------------------------------------
  libraryItems: defineTable({
    categoryId: v.id("libraryCategories"),
    
    // Item details
    name: v.string(),
    description: v.optional(v.string()),
    
    // Pricing & units
    unit: v.string(), // "sqft", "hr", "ls", "view", etc.
    defaultRate: v.number(),
    
    // Optional metadata
    image: v.optional(v.string()), // Storage key for item image
    sku: v.optional(v.string()), // Stock-keeping unit for inventory
    tags: v.optional(v.array(v.string())), // For search/filter
    
    // Custom fields for flexibility
    metadata: v.optional(v.any()), // Any additional data
    
    // Display
    displayOrder: v.number(),
    isActive: v.boolean(),
    
    // Audit
    createdBy: v.string(), // Host app's user identifier
    updatedAt: v.number(),
  })
    .index("by_categoryId", ["categoryId"])
    .index("by_isActive", ["isActive"])
    .searchIndex("search_name", { searchField: "name" }),
});

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export type LibraryCategory = {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  icon?: string;
  color?: string;
  isActive: boolean;
};

export type LibraryItem = {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  unit: string;
  defaultRate: number;
  image?: string;
  sku?: string;
  tags?: string[];
  displayOrder: number;
  isActive: boolean;
};
