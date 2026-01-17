import { v } from "convex/values";
import { query } from "../../_generated/server";
import { adminQuery, clientQuery } from "../../lib/customFunctions";

/**
 * Get all folders for a project (admin view).
 * Returns folder details with asset counts.
 */
export const getProjectFolders = adminQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Enrich with asset counts
    const enrichedFolders = await Promise.all(
      folders.map(async (folder) => {
        const assets = await ctx.db
          .query("assets")
          .withIndex("by_folderId", (q) => q.eq("folderId", folder._id))
          .collect();

        const totalSize = assets.reduce((sum, asset) => sum + asset.sizeBytes, 0);

        return {
          ...folder,
          assetCount: assets.length,
          totalSize,
        };
      })
    );

    return enrichedFolders;
  },
});

/**
 * Get project folders for client view.
 * Shows only the client's own project folders.
 */
export const getMyProjectFolders = clientQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Verify project belongs to this client
    const project = await ctx.db.get(args.projectId);
    if (!project || project.clientId !== ctx.profile._id) {
      throw new Error("Access denied");
    }

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Enrich with asset counts
    const enrichedFolders = await Promise.all(
      folders.map(async (folder) => {
        const assets = await ctx.db
          .query("assets")
          .withIndex("by_folderId", (q) => q.eq("folderId", folder._id))
          .collect();

        return {
          _id: folder._id,
          name: folder.name,
          status: folder.status,
          assetCount: assets.length,
        };
      })
    );

    return enrichedFolders;
  },
});

/**
 * Check if folder setup is allowed for a project.
 * Returns setup eligibility and any blockers.
 */
export const canSetupFolders = adminQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      return {
        canSetup: false,
        reason: "Project not found",
        hasApprovedQuotation: false,
        hasFolders: false,
      };
    }

    // Check if folders already exist
    const existingFolder = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    if (existingFolder) {
      return {
        canSetup: false,
        reason: "Folders have already been set up",
        hasApprovedQuotation: true,
        hasFolders: true,
      };
    }

    // Check for approved quotation
    // Note: quotations.projectId is stored as v.optional(v.string())
    const projectIdString = args.projectId as string;
    const approvedQuotation = await ctx.db
      .query("quotations")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .filter((q) => q.eq(q.field("projectId"), projectIdString))
      .first();

    if (!approvedQuotation) {
      return {
        canSetup: false,
        reason: "No approved quotation for this project",
        hasApprovedQuotation: false,
        hasFolders: false,
      };
    }

    return {
      canSetup: true,
      reason: null,
      hasApprovedQuotation: true,
      hasFolders: false,
    };
  },
});

/**
 * Get folder setup summary for project detail view.
 * Returns quick overview of folder status.
 */
export const getFolderSetupStatus = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (folders.length === 0) {
      return {
        hasSetup: false,
        totalFolders: 0,
        pendingCount: 0,
        inProgressCount: 0,
        completedCount: 0,
      };
    }

    const statusCounts = folders.reduce(
      (acc, folder) => {
        acc[folder.status] = (acc[folder.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      hasSetup: true,
      totalFolders: folders.length,
      pendingCount: statusCounts["pending_upload"] || 0,
      inProgressCount: statusCounts["in_progress"] || 0,
      completedCount: statusCounts["completed"] || 0,
    };
  },
});
