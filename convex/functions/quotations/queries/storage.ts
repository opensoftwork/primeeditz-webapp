import { v } from "convex/values";
import type { Doc, Id } from "../../../_generated/dataModel";
import { adminQuery } from "../../../lib/customFunctions";

/**
 * Get all approved quotations for a client with storage usage info.
 * Used for project-quotation linking in folder setup.
 * Story: 3-13
 */
export const getClientApprovedQuotations = adminQuery({
  args: {
    studioId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const quotations = await ctx.db
      .query("quotations")
      .withIndex("by_studioId", (q) => q.eq("studioId", args.studioId))
      .collect();

    // Filter only approved quotations
    const approvedQuotations = quotations.filter(
      (q) => q.status === "approved",
    );

    // 2. For each quotation, calculate storage usage from linked projects
    const enriched = await Promise.all(
      approvedQuotations.map(async (quotation) => {
        // Get projects linked to this quotation
        const allProjects = await ctx.db.query("projects").collect();

        // Find projects that reference this quotation
        const linkedProjects = allProjects.filter((p) => {
          return (
            quotation.projectId === p._id ||
            quotation.projectIds?.includes(p._id)
          );
        });

        // Calculate allocated storage from linked projects
        const allocatedBytes = linkedProjects.reduce(
          (sum, p) => sum + (p.storageAllocated || 0),
          0,
        );

        // Try to determine total storage from quotation
        let totalStorageGB = 100; // Default fallback

        // Look for storage tier in line items
        const storageTiers = await ctx.db.query("storageTiers").collect();
        for (const li of quotation.lineItems) {
          const desc = li.description.toLowerCase();
          if (
            desc.includes("storage") ||
            desc.includes("gb") ||
            desc.includes("cloud")
          ) {
            // Try to match with a storage tier by rate
            const matchingTier = storageTiers.find(
              (t) => t.priceINR === li.rate,
            );
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
            allocatedGB:
              Math.round((allocatedBytes / (1024 * 1024 * 1024)) * 100) / 100,
            remainingGB:
              Math.round((remainingBytes / (1024 * 1024 * 1024)) * 100) / 100,
            totalBytes,
            allocatedBytes,
            remainingBytes,
          },
        };
      }),
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

    // Get linked projects
    const allProjects = await ctx.db.query("projects").collect();
    const linkedProjects = allProjects.filter((p) => {
      return (
        quotation.projectId === p._id ||
        quotation.projectIds?.includes(p._id)
      );
    });

    // Calculate storage
    const allocatedBytes = linkedProjects.reduce(
      (sum, p) => sum + (p.storageAllocated || 0),
      0,
    );
    const usedBytes = linkedProjects.reduce(
      (sum, p) => sum + (p.storageUsed || 0),
      0,
    );

    // Get storage tier
    let totalStorageGB = 100;
    const storageTiers = await ctx.db.query("storageTiers").collect();
    for (const li of quotation.lineItems) {
      const desc = li.description.toLowerCase();
      if (
        desc.includes("storage") ||
        desc.includes("gb") ||
        desc.includes("cloud")
      ) {
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
        endClientName: p.endClientName,
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
        allocatedGB:
          Math.round((allocatedBytes / (1024 * 1024 * 1024)) * 100) / 100,
        usedGB: Math.round((usedBytes / (1024 * 1024 * 1024)) * 100) / 100,
        remainingGB:
          Math.round(
            ((totalBytes - allocatedBytes) / (1024 * 1024 * 1024)) * 100,
          ) / 100,
        totalBytes,
        allocatedBytes,
        usedBytes,
        remainingBytes: totalBytes - allocatedBytes,
      },
      linkedProjects: enrichedProjects,
    };
  },
});
