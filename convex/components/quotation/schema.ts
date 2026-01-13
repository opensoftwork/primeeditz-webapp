import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Quotation Component Schema
 * 
 * This schema is isolated from the main app's schema.
 * Tables defined here are only accessible through the component's API.
 * 
 * Design Philosophy:
 * - Quotation is a first-class entity (not a child of Project)
 * - Sections are user-configurable (not hardcoded)
 * - Hierarchical line items with unlimited nesting
 * - Versioning with parent-child linking
 */

// ============================================================================
// VALIDATORS (Reusable)
// ============================================================================

/**
 * Sub-item validator for nested line items
 */
const subItemValidator = v.object({
  id: v.string(), // Client-generated UUID for drag/drop
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
});

/**
 * Line item validator with optional nested sub-items
 */
const lineItemValidator = v.object({
  id: v.string(), // Client-generated UUID for drag/drop
  sectionId: v.id("quotationSections"),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  length: v.optional(v.string()), // For construction: "10ft"
  width: v.optional(v.string()), // For construction: "12ft"
  image: v.optional(v.string()), // Storage key for item image
  subItems: v.optional(v.array(subItemValidator)),
});

/**
 * Template line item (without IDs, used as blueprint)
 */
const templateLineItemValidator = v.object({
  sectionId: v.id("quotationSections"),
  description: v.string(),
  unit: v.string(),
  unitPrice: v.number(),
  defaultQuantity: v.number(),
  subItems: v.optional(
    v.array(
      v.object({
        description: v.string(),
        unit: v.string(),
        unitPrice: v.number(),
        defaultQuantity: v.number(),
      })
    )
  ),
});

/**
 * Quotation status workflow
 */
const quotationStatusValidator = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("viewed"),
  v.literal("approved"),
  v.literal("changes_requested"),
  v.literal("rejected"),
  v.literal("expired"),
  v.literal("superseded") // When a new version is created
);

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

export default defineSchema({
  // --------------------------------------------------------------------------
  // Quotation Sections
  // User-configurable categories for organizing line items
  // Examples: "Design Services", "Post-Production", "Construction"
  // --------------------------------------------------------------------------
  quotationSections: defineTable({
    name: v.string(),
    displayOrder: v.number(),
    icon: v.optional(v.string()), // Lucide icon name (e.g., "PenTool")
    color: v.optional(v.string()), // Accent color (e.g., "#3B82F6")
    isActive: v.boolean(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_displayOrder", ["displayOrder"]),

  // --------------------------------------------------------------------------
  // Quotation Templates
  // Reusable blueprints for creating quotations quickly
  // --------------------------------------------------------------------------
  quotationTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    lineItems: v.array(templateLineItemValidator),
    terms: v.optional(v.string()),
    
    // Optional project type hint for filtering (soft link, not enforced)
    // This is a STRING, not an ID, because we don't know the host app's schema
    projectTypeHint: v.optional(v.string()),
    
    isActive: v.boolean(),
    
    // Audit (stored as strings for portability)
    createdBy: v.string(), // Host app's user identifier
    updatedAt: v.number(),
  })
    .index("by_isActive", ["isActive"]),

  // --------------------------------------------------------------------------
  // Quotations (Main Entity)
  // First-class entity that can exist standalone or linked to external entities
  // --------------------------------------------------------------------------
  quotations: defineTable({
    code: v.string(), // "QT-000001" - unique within this component
    version: v.number(), // 1, 2, 3... for revisions
    parentQuotationId: v.optional(v.id("quotations")), // Link to previous version
    
    // External linking (all optional, stored as strings for portability)
    // The host app decides what these mean
    clientId: v.optional(v.string()), // Client/customer identifier
    projectId: v.optional(v.string()), // Primary project link
    projectIds: v.optional(v.array(v.string())), // Multi-project support
    
    // Template reference (internal to component)
    templateId: v.optional(v.id("quotationTemplates")),
    
    // Status workflow
    status: quotationStatusValidator,
    
    // Line items with hierarchical structure
    lineItems: v.array(lineItemValidator),
    
    // Calculated totals
    subtotal: v.number(),
    taxRate: v.number(), // Configurable (0.18 for 18% GST)
    taxAmount: v.number(),
    discountAmount: v.optional(v.number()),
    total: v.number(),
    
    // Terms & validity
    terms: v.optional(v.string()),
    validUntil: v.optional(v.number()), // Timestamp for expiry
    
    // Client feedback
    clientNotes: v.optional(v.string()), // For changes_requested or rejected
    
    // Audit trail (stored as strings for portability)
    createdBy: v.string(), // Host app's user identifier
    sentAt: v.optional(v.number()),
    viewedAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    rejectedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_projectId", ["projectId"])
    .index("by_status", ["status"])
    .index("by_code", ["code"])
    .index("by_parentQuotationId", ["parentQuotationId"]),

});

// NOTE: Library Items are in a separate component (convex/components/library)
// for maximum reusability across quotations, invoices, and other modules.

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export type QuotationStatus = 
  | "draft"
  | "sent"
  | "viewed"
  | "approved"
  | "changes_requested"
  | "rejected"
  | "expired"
  | "superseded";

export type LineItem = {
  id: string;
  sectionId: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  length?: string;
  width?: string;
  image?: string;
  subItems?: SubItem[];
};

export type SubItem = {
  id: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
};
