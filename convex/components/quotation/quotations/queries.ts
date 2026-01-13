import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Sub-item return validator
 */
const subItemReturn = v.object({
  id: v.string(),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
});

/**
 * Line item return validator
 */
const lineItemReturn = v.object({
  id: v.string(),
  sectionId: v.id("quotationSections"),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  length: v.optional(v.string()),
  width: v.optional(v.string()),
  image: v.optional(v.string()),
  subItems: v.optional(v.array(subItemReturn)),
});

/**
 * Quotation status validator
 */
const statusValidator = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("viewed"),
  v.literal("approved"),
  v.literal("changes_requested"),
  v.literal("rejected"),
  v.literal("expired"),
  v.literal("superseded")
);

/**
 * Full quotation return validator
 */
const quotationReturn = v.object({
  _id: v.id("quotations"),
  _creationTime: v.number(),
  code: v.string(),
  version: v.number(),
  parentQuotationId: v.optional(v.id("quotations")),
  clientId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  projectIds: v.optional(v.array(v.string())),
  templateId: v.optional(v.id("quotationTemplates")),
  status: statusValidator,
  lineItems: v.array(lineItemReturn),
  subtotal: v.number(),
  taxRate: v.number(),
  taxAmount: v.number(),
  discountAmount: v.optional(v.number()),
  total: v.number(),
  terms: v.optional(v.string()),
  validUntil: v.optional(v.number()),
  clientNotes: v.optional(v.string()),
  createdBy: v.string(),
  sentAt: v.optional(v.number()),
  viewedAt: v.optional(v.number()),
  approvedAt: v.optional(v.number()),
  rejectedAt: v.optional(v.number()),
  updatedAt: v.number(),
});

/**
 * Get all quotations with optional filters
 */
export const getQuotations = query({
  args: {
    status: v.optional(statusValidator),
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(quotationReturn),
  handler: async (ctx, args) => {
    let quotations;
    
    if (args.status) {
      quotations = await ctx.db
        .query("quotations")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else if (args.clientId) {
      quotations = await ctx.db
        .query("quotations")
        .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId!))
        .collect();
    } else if (args.projectId) {
      quotations = await ctx.db
        .query("quotations")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else {
      quotations = await ctx.db.query("quotations").collect();
    }
    
    // Sort by creation time descending (newest first)
    quotations.sort((a, b) => b._creationTime - a._creationTime);
    
    // Apply limit if provided
    if (args.limit) {
      quotations = quotations.slice(0, args.limit);
    }
    
    return quotations;
  },
});

/**
 * Get a single quotation by ID
 */
export const getQuotation = query({
  args: {
    quotationId: v.id("quotations"),
  },
  returns: v.union(quotationReturn, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.quotationId);
  },
});

/**
 * Get a quotation by code
 */
export const getQuotationByCode = query({
  args: {
    code: v.string(),
  },
  returns: v.union(quotationReturn, v.null()),
  handler: async (ctx, args) => {
    const quotations = await ctx.db
      .query("quotations")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .collect();
    
    // Return the latest version
    if (quotations.length === 0) return null;
    return quotations.reduce((latest, q) => 
      q.version > latest.version ? q : latest
    );
  },
});

/**
 * Get quotation version history
 */
export const getQuotationHistory = query({
  args: {
    quotationId: v.id("quotations"),
  },
  returns: v.array(quotationReturn),
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return [];
    
    // Find all versions with the same code
    const allVersions = await ctx.db
      .query("quotations")
      .withIndex("by_code", (q) => q.eq("code", quotation.code))
      .collect();
    
    // Sort by version descending
    return allVersions.sort((a, b) => b.version - a.version);
  },
});

/**
 * Get quotation with enriched section data
 */
export const getQuotationWithSections = query({
  args: {
    quotationId: v.id("quotations"),
  },
  returns: v.union(
    v.object({
      quotation: quotationReturn,
      sections: v.array(
        v.object({
          _id: v.id("quotationSections"),
          _creationTime: v.number(),
          name: v.string(),
          displayOrder: v.number(),
          icon: v.optional(v.string()),
          color: v.optional(v.string()),
          isActive: v.boolean(),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return null;
    
    // Get all sections used in this quotation
    const sectionIds = [...new Set(quotation.lineItems.map((li) => li.sectionId))];
    const sections = await Promise.all(
      sectionIds.map((id) => ctx.db.get(id))
    );
    
    return {
      quotation,
      sections: sections.filter((s): s is NonNullable<typeof s> => s !== null),
    };
  },
});
