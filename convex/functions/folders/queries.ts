import { v } from "convex/values";
import { query } from "../../_generated/server";
import { 
  adminQuery, 
  clientQuery, 
  staffQuery, 
  authenticatedWithProfileQuery 
} from "../../lib/customFunctions";

/**
 * Get all folders for a project (staff view).
 * Returns folder details with asset counts.
 */
export const getProjectFolders = staffQuery({
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

        const totalSize = assets.reduce((sum, asset) => sum + asset.sizeBytes, 0);

        return {
          _id: folder._id,
          name: folder.name,
          status: folder.status,
          assetCount: assets.length,
          totalSize,
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

    // Validate action state - folder setup is only allowed in quotation_approved state
    // This ensures proper workflow progression
    const validSetupStates = ["quotation_approved"];
    const isValidState = validSetupStates.includes(project.actionState);

    // Admin-initiated projects bypass the quotation check
    if (project.source === "admin_init") {
      return {
        canSetup: true,
        reason: null,
        hasApprovedQuotation: true, // Treated as approved for lifecycle purposes
        hasFolders: false,
      };
    }

    // Check for approved quotation linked to this project
    // Note: quotations.projectId is stored as v.optional(v.string())
    const projectIdString = args.projectId as string;
    
    // Check single projectId field
    let approvedQuotation = await ctx.db
      .query("quotations")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .filter((q) => q.eq(q.field("projectId"), projectIdString))
      .first();

    // Also check projectIds array (for multi-project quotations)
    if (!approvedQuotation) {
      const allApprovedQuotations = await ctx.db
        .query("quotations")
        .withIndex("by_status", (q) => q.eq("status", "approved"))
        .collect();
      
      approvedQuotation = allApprovedQuotations.find((q) => 
        q.projectIds?.includes(projectIdString)
      ) || null;
    }

    if (approvedQuotation) {
      // Check if project is in the correct state for folder setup
      if (!isValidState) {
        return {
          canSetup: false,
          reason: `Project is in "${project.actionState}" state. Folder setup is only available after quotation approval and before storage allocation.`,
          hasApprovedQuotation: true,
          hasFolders: false,
        };
      }
      return {
        canSetup: true,
        reason: null,
        hasApprovedQuotation: true,
        hasFolders: false,
      };
    }

    // No direct quotation link - check if we can allow setup with quotation selection
    // This enables the enhanced flow where admin can link to any client quotation
    const clientId = project.clientId;
    if (clientId) {
      const clientIdString = clientId as string;
      const clientQuotations = await ctx.db
        .query("quotations")
        .withIndex("by_clientId", (q) => q.eq("clientId", clientIdString))
        .collect();
      
      const hasClientApprovedQuotation = clientQuotations.some(
        (q) => q.status === "approved"
      );

      if (hasClientApprovedQuotation) {
        // Check if project is in the correct state for folder setup
        if (!isValidState) {
          return {
            canSetup: false,
            reason: `Project is in "${project.actionState}" state. Folder setup is only available after quotation approval.`,
            hasApprovedQuotation: false,
            hasFolders: false,
          };
        }
        // Client has approved quotations - allow setup with quotation selection step
        return {
          canSetup: true,
          reason: null,
          hasApprovedQuotation: false, // Not directly linked, but client has approved quotations
          hasFolders: false,
          needsQuotationSelection: true, // Flag for UI to show quotation selection
        };
      }
    }

    return {
      canSetup: false,
      reason: "No approved quotation for this project",
      hasApprovedQuotation: false,
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

/**
 * Get a single folder's details.
 * Staff access (Admin/Employee) or Client ownership via project.
 */
export const getFolderDetails = authenticatedWithProfileQuery({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new Error("Folder not found");

    // Verify access
    const project = await ctx.db.get(folder.projectId);
    if (!project) throw new Error("Project not found");

    // If client, verify they own the project
    if (ctx.profile.role === 'client') {
      if (project.clientId !== ctx.profile._id) {
        throw new Error("Access denied");
      }
    }
    
    // For staff (admin/employee), we allow access if they reached here.
    // getProjectFolders/getAdminProject already handle their list-level security.

    return folder;
  },
});

/**
 * Get assets in a folder.
 * Staff access (Admin/Employee) or Client ownership via project.
 */
export const getFolderAssets = authenticatedWithProfileQuery({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new Error("Folder not found");

    // Verify access
    const project = await ctx.db.get(folder.projectId);
    if (!project) throw new Error("Project not found");

    // If client, verify ownership
    if (ctx.profile.role === 'client') {
      if (project.clientId !== ctx.profile._id) {
        throw new Error("Access denied");
      }
    }

    const assets = await ctx.db
      .query("assets")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();

    // Enrich with uploader info
    return await Promise.all(assets.map(async (asset) => {
      const uploader = asset.uploadedBy ? await ctx.db.get(asset.uploadedBy) : null;
      return {
        ...asset,
        uploaderName: uploader?.name || "Unknown",
        uploaderRole: (uploader as any)?.role || "client",
      };
    }));
  },
});

