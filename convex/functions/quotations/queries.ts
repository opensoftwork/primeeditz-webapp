import { v } from "convex/values";
import { adminQuery, clientQuery } from "../../lib/customFunctions";
import { QueryCtx, query } from "../../_generated/server";
import { Doc, Id } from "../../_generated/dataModel";

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

/**
 * Get quotation by share token (Public)
 */
export const getQuotationByShareToken = query({
  args: {
    shareToken: v.string(),
  },
  handler: async (ctx: QueryCtx, args) => {
    const quotation = await ctx.db
      .query("quotations")
      .withIndex("by_shareToken", (q) => q.eq("shareToken", args.shareToken))
      .unique();
    
    if (!quotation) return null;
    
    // Check expiry
    if (quotation.shareTokenExpiresAt && Date.now() > quotation.shareTokenExpiresAt) {
       return { error: "Link expired" };
    }
    
    // Check status
    const publicStatus = ["sent", "viewed", "approved", "changes_requested", "rejected"];
    if (!publicStatus.includes(quotation.status)) {
       return { error: "Quotation no longer available" };
    }
    
    // Get sections for detail view
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
 * Get current client's quotations
 */
export const getMyQuotations = clientQuery({
  args: {},
  handler: async (ctx, args) => {
    const quotations = await ctx.db
      .query("quotations")
      .withIndex("by_clientId", (q) => q.eq("clientId", ctx.profile._id))
      .collect();
    
    // Filter by status (visible to client)
    const clientVisibleStatus = ["sent", "viewed", "approved", "changes_requested", "rejected"];
    const visibleQuotations = quotations.filter((q) => clientVisibleStatus.includes(q.status));

    // Get project names for enrichment
    const projectIds = [...new Set(visibleQuotations.map(q => q.projectId).filter((id): id is string => !!id))];
    const projects = await Promise.all(
      projectIds.map((id) => ctx.db.get(id as Id<"projects">))
    );
    const projectMap = new Map(
      projects.filter((p): p is Doc<"projects"> => !!p).map((p) => [p._id as string, p.eventName || p.code])
    );

    return visibleQuotations
      .map((q) => ({
        ...q,
        projectName: q.projectId ? projectMap.get(q.projectId) : undefined,
      }))
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Get client's specific quotation with sections
 */
export const getMyQuotationDetail = clientQuery({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return null;

    // Verify ownership
    if (quotation.clientId !== ctx.profile._id) {
      throw new Error("Access denied: Not your quotation");
    }

    // Status check
    const clientVisibleStatus = ["sent", "viewed", "approved", "changes_requested", "rejected"];
    if (!clientVisibleStatus.includes(quotation.status)) {
       return null;
    }

    // Get all sections used in this quotation
    const sectionIds = [...new Set(quotation.lineItems.map((li) => li.sectionId))];
    const sections = await Promise.all(
      sectionIds.map((id) => id ? ctx.db.get(id) : null)
    );

    return {
      quotation,
      sections: sections.filter((s): s is Doc<"quotationSections"> => s !== null),
    };
  },
});

/**
 * Get all approved quotations for a client with storage usage info.
 * Used for project-quotation linking in folder setup.
 * Story: 3-13
 */
export const getClientApprovedQuotations = adminQuery({
  args: {
    clientId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const clientIdString = args.clientId as string;
    
    // 1. Get approved quotations for this client
    const quotations = await ctx.db
      .query("quotations")
      .withIndex("by_clientId", (q) => q.eq("clientId", clientIdString))
      .collect();

    // Filter only approved quotations
    const approvedQuotations = quotations.filter((q) => q.status === "approved");

    // 2. For each quotation, calculate storage usage from linked projects
    const enriched = await Promise.all(
      approvedQuotations.map(async (quotation) => {
        // Get projects linked to this quotation
        const quotationIdString = quotation._id as string;
        const allProjects = await ctx.db.query("projects").collect();
        
        // Find projects that reference this quotation (via projectId in quotation)
        // Or projects where quotation.projectId matches
        const linkedProjects = allProjects.filter((p) => {
          const projectIdString = p._id as string;
          return quotation.projectId === projectIdString || 
                 quotation.projectIds?.includes(projectIdString);
        });

        // Calculate allocated storage from linked projects
        const allocatedBytes = linkedProjects.reduce(
          (sum, p) => sum + (p.storageAllocated || 0),
          0
        );

        // Try to determine total storage from quotation
        // Option 1: Check if there's a storage-related line item
        // For now, we'll estimate based on total quotation value or use a default
        // In production, you'd have a specific storage tier line item
        let totalStorageGB = 100; // Default fallback

        // Look for storage tier in line items (if naming convention includes "storage" or "GB")
        const storageTiers = await ctx.db.query("storageTiers").collect();
        for (const li of quotation.lineItems) {
          const desc = li.description.toLowerCase();
          if (desc.includes("storage") || desc.includes("gb") || desc.includes("cloud")) {
            // Try to match with a storage tier by rate
            const matchingTier = storageTiers.find((t) => t.priceINR === li.rate);
            if (matchingTier) {
              totalStorageGB = matchingTier.sizeGB;
              break;
            }
          }
        }

        const totalBytes = totalStorageGB * 1024 * 1024 * 1024;
        const remainingBytes = totalBytes - allocatedBytes;

        return {
          _id: quotation._id,
          code: quotation.code,
          status: quotation.status,
          total: quotation.total,
          approvedAt: quotation.approvedAt,
          _creationTime: quotation._creationTime,
          linkedProjectCount: linkedProjects.length,
          storageInfo: {
            totalGB: totalStorageGB,
            allocatedGB: Math.round((allocatedBytes / (1024 * 1024 * 1024)) * 100) / 100,
            remainingGB: Math.round((remainingBytes / (1024 * 1024 * 1024)) * 100) / 100,
            totalBytes,
            allocatedBytes,
            remainingBytes,
          },
        };
      })
    );

    // Sort by approval date (most recent first)
    return enriched.sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));
  },
});

/**
 * Get quotation storage summary.
 * Story: 3-15
 */
export const getQuotationStorageSummary = adminQuery({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return null;

    // Get linked projects (where quotation points to project OR projectIds array)
    const allProjects = await ctx.db.query("projects").collect();
    const linkedProjects = allProjects.filter((p) => {
      const projectIdString = p._id as string;
      return quotation.projectId === projectIdString || 
             quotation.projectIds?.includes(projectIdString);
    });

    // Calculate storage
    const allocatedBytes = linkedProjects.reduce(
      (sum, p) => sum + (p.storageAllocated || 0),
      0
    );
    const usedBytes = linkedProjects.reduce(
      (sum, p) => sum + (p.storageUsed || 0),
      0
    );

    // Get storage tier (estimate from line items)
    let totalStorageGB = 100;
    const storageTiers = await ctx.db.query("storageTiers").collect();
    for (const li of quotation.lineItems) {
      const desc = li.description.toLowerCase();
      if (desc.includes("storage") || desc.includes("gb") || desc.includes("cloud")) {
        const matchingTier = storageTiers.find((t) => t.priceINR === li.rate);
        if (matchingTier) {
          totalStorageGB = matchingTier.sizeGB;
          break;
        }
      }
    }

    const totalBytes = totalStorageGB * 1024 * 1024 * 1024;

    // Enrich linked projects with names
    const projectTypes = await ctx.db.query("projectTypes").collect();
    const enrichedProjects = linkedProjects.map((p) => {
      const projectType = projectTypes.find((pt) => pt._id === p.projectTypeId);
      return {
        _id: p._id,
        code: p.code,
        eventName: p.eventName,
        projectTypeName: projectType?.name || "Unknown",
        storageAllocated: p.storageAllocated || 0,
        storageUsed: p.storageUsed || 0,
      };
    });

    return {
      quotationId: quotation._id,
      quotationCode: quotation.code,
      storage: {
        totalGB: totalStorageGB,
        allocatedGB: Math.round((allocatedBytes / (1024 * 1024 * 1024)) * 100) / 100,
        usedGB: Math.round((usedBytes / (1024 * 1024 * 1024)) * 100) / 100,
        remainingGB: Math.round(((totalBytes - allocatedBytes) / (1024 * 1024 * 1024)) * 100) / 100,
        totalBytes,
        allocatedBytes,
        usedBytes,
        remainingBytes: totalBytes - allocatedBytes,
      },
      linkedProjects: enrichedProjects,
    };
  },
});

