import { v } from "convex/values";
import { adminQuery } from "../../lib/customFunctions";
import { QueryCtx } from "../../_generated/server";
import { Doc } from "../../_generated/dataModel";

/**
 * Get all quotations with optional filters
 */
export const getQuotations = adminQuery({
  args: {
    status: v.optional(v.string()),
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args) => {
    let quotations: Doc<"quotations">[];
    
    if (args.status) {
      quotations = await ctx.db
        .query("quotations")
        .withIndex("by_status", (q) => q.eq("status", args.status as "draft" | "sent" | "viewed" | "approved" | "changes_requested" | "rejected" | "expired" | "superseded"))
        .collect();
    } else if (args.clientId) {
      quotations = await ctx.db
        .query("quotations")
        .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
        .collect();
    } else {
      quotations = await ctx.db.query("quotations").collect();
    }
    
    if (args.projectId) {
      quotations = quotations.filter((q) => q.projectId === args.projectId);
    }
    
    quotations.sort((a, b) => b._creationTime - a._creationTime);
    
    if (args.limit) {
      quotations = quotations.slice(0, args.limit);
    }
    
    return quotations;
  },
});

/**
 * Get a single quotation by ID
 */
export const getQuotation = adminQuery({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db.get(args.quotationId);
  },
});

/**
 * Get a quotation by code
 */
export const getQuotationByCode = adminQuery({
  args: {
    code: v.string(),
  },
  handler: async (ctx: QueryCtx, args) => {
    const quotations = await ctx.db
      .query("quotations")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .collect();
    
    if (quotations.length === 0) return null;
    return quotations.reduce((latest: Doc<"quotations">, q: Doc<"quotations">) => 
      q.version > latest.version ? q : latest
    );
  },
});

/**
 * Get quotation version history
 */
export const getQuotationHistory = adminQuery({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx: QueryCtx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return [];
    
    const allVersions = await ctx.db
      .query("quotations")
      .withIndex("by_code", (q) => q.eq("code", quotation.code))
      .collect();
    
    return allVersions.sort((a, b) => b.version - a.version);
  },
});

/**
 * Get quotation with enriched section data
 */
export const getQuotationWithSections = adminQuery({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx: QueryCtx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return null;
    
    // Get all sections used in this quotation
    const sectionIds = [...new Set(quotation.lineItems.map((li) => li.sectionId))];
    const sections = await Promise.all(
      sectionIds.map((id) => ctx.db.get(id))
    );
    
    return {
      quotation,
      sections: sections.filter((s): s is Doc<"quotationSections"> => s !== null),
    };
  },
});

/**
 * Get all available library items, merging individual segments and template line items
 */
export const getLibraryItems = adminQuery({
  args: {
    projectTypeHint: v.optional(v.id("projectTypes")),
  },
  handler: async (ctx: QueryCtx, args) => {
    // 1. Fetch individual library items
    const libraryItems = await ctx.db
      .query("quotationLibraryItems")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // 2. Fetch all templates to extract their line items
    const templates = await ctx.db
      .query("quotationTemplates")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // 3. Process library items
    let filteredLibraryItems = libraryItems;
    if (args.projectTypeHint) {
      filteredLibraryItems = libraryItems.filter(
        (item) => !item.projectTypeHint || item.projectTypeHint === args.projectTypeHint
      );
    }

    const processedLibraryItems = filteredLibraryItems.map((item) => ({
      ...item,
      source: "library" as const,
    }));

    // 4. Process template line items
    const templateLineItems: any[] = [];
    templates.forEach((template) => {
      // If projectTypeHint is provided, only include line items from matching templates
      if (args.projectTypeHint && template.projectTypeHint !== args.projectTypeHint) {
        return;
      }

      template.lineItems.forEach((li) => {
        templateLineItems.push({
          _id: `${template._id}_${li.sectionId}_${li.description}`,
          name: li.description,
          description: `From Template: ${template.name}`,
          sectionId: li.sectionId,
          unit: li.unit,
          unitPrice: li.unitPrice,
          isActive: true,
          source: "template" as const,
          templateName: template.name,
        });
      });
    });

    // 5. Merge and deduplicate (optional, but let's keep all for now)
    const allItems = [...processedLibraryItems, ...templateLineItems];

    // 6. Group by section
    const sections = await ctx.db.query("quotationSections").collect();
    
    return sections.map(section => ({
      section,
      items: allItems.filter(item => item.sectionId === section._id)
    })).filter(group => group.items.length > 0);
  },
});
