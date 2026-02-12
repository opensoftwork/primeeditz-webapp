import { v } from "convex/values";
import { query } from "../../_generated/server";
import {
  adminQuery,
  authenticatedWithProfileQuery,
  staffQuery,
  studioQuery,
} from "../../lib/customFunctions";

/**
 * Get all folders for a project (staff view).
 * Returns folder details with asset counts.
 * Parent folders aggregate file counts and status from child folders.
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

    // First pass: get direct asset counts for each folder
    const folderAssetData = await Promise.all(
      folders.map(async (folder) => {
        const assets = await ctx.db
          .query("assets")
          .withIndex("by_folderId", (q) => q.eq("folderId", folder._id))
          .collect();

        const directAssetCount = assets.length;
        const directTotalSize = assets.reduce(
          (sum, asset) => sum + asset.sizeBytes,
          0,
        );

        return {
          folder,
          directAssetCount,
          directTotalSize,
        };
      }),
    );

    // Build a map for quick lookup
    const folderDataMap = new Map(
      folderAssetData.map((data) => [data.folder.path, data]),
    );

    // Second pass: compute aggregated counts and status for each folder
    const enrichedFolders = folderAssetData.map((data) => {
      const { folder, directAssetCount, directTotalSize } = data;

      // Normalize paths for comparison
      const folderPath = folder.path.replace(/^\/+|\/+$/g, "");
      const childPrefix = folderPath + "/";

      const descendants = folderAssetData.filter((d) => {
        const dPath = d.folder.path.replace(/^\/+|\/+$/g, "");
        return dPath.startsWith(childPrefix);
      });

      // Aggregate totals from descendants
      const totalAssetCount =
        directAssetCount +
        descendants.reduce((sum, d) => sum + d.directAssetCount, 0);
      const totalSize =
        directTotalSize +
        descendants.reduce((sum, d) => sum + d.directTotalSize, 0);

      // Determine display status based on hierarchy
      let displayStatus = folder.status;

      // COMPUTED STATUS LOGIC:
      // Only compute display status if the folder is NOT already marked as completed.
      // Explicitly completed folders (via submission or manual action) should stay completed.
      if (folder.status !== "completed") {
        // Check if this folder has children (is a parent folder)
        const hasChildren = descendants.length > 0;

        if (hasChildren) {
          // For parent folders, compute status from direct children
          const directChildren = folderAssetData.filter((d) => {
            const dPath = d.folder.path.replace(/^\/+|\/+$/g, "");
            if (!dPath.startsWith(childPrefix)) return false;
            const remainder = dPath.slice(childPrefix.length);
            return !remainder.includes("/");
          });

          if (directChildren.length > 0) {
            // Get the computed status for each direct child
            const childStatuses = directChildren.map((child) => {
              // Recursively compute child's display status
              const childHasOwnFiles = child.directAssetCount > 0;
              const childStoredStatus = child.folder.status;

              if (child.directAssetCount === 0) {
                // Check if this child has its own descendants with files
                const childPath = child.folder.path.replace(/^\/+|\/+$/g, "");
                const childDescPrefix = childPath + "/";
                const childDescendants = folderAssetData.filter((d) => {
                  const dPath = d.folder.path.replace(/^\/+|\/+$/g, "");
                  return dPath.startsWith(childDescPrefix);
                });
                const childTotalFiles = childDescendants.reduce(
                  (sum, d) => sum + d.directAssetCount,
                  0,
                );

                if (childTotalFiles === 0) {
                  // Even if no files, follow the stored status if it's completed
                  return childStoredStatus === "completed"
                    ? "completed"
                    : "pending_upload";
                }
                // Has descendant files, check if all descendants are completed
                const allDescCompleted = childDescendants.every(
                  (d) => d.folder.status === "completed",
                );
                return allDescCompleted ? "completed" : "in_progress";
              }

              // Child has direct files
              if (childStoredStatus === "pending_upload") {
                return "in_progress";
              }
              return childStoredStatus;
            });

            const allCompleted = childStatuses.every((s) => s === "completed");
            const anyInProgress = childStatuses.some(
              (s) => s === "in_progress" || s === "completed",
            );
            const allPending = childStatuses.every(
              (s) => s === "pending_upload",
            );

            if (allCompleted) {
              displayStatus = "completed";
            } else if (allPending) {
              displayStatus = "pending_upload";
            } else {
              displayStatus = "in_progress";
            }
          }
        } else {
          // Leaf folder - compute status based on its own file count
          if (directAssetCount === 0) {
            displayStatus = "pending_upload";
          } else if (
            folder.status === "pending_upload" &&
            directAssetCount > 0
          ) {
            displayStatus = "in_progress";
          }
        }
      }

      return {
        ...folder,
        status: displayStatus,
        assetCount: totalAssetCount,
        totalSize,
      };
    });

    return enrichedFolders;
  },
});

/**
 * Get project folders for client view.
 * Shows only the client's own project folders.
 * Parent folders aggregate file counts and status from child folders.
 */
export const getMyProjectFolders = studioQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Verify project belongs to this client
    const project = await ctx.db.get(args.projectId);
    if (!project || project.studioId !== ctx.profile._id) {
      throw new Error("Access denied");
    }

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // First pass: get direct asset counts for each folder
    const folderAssetData = await Promise.all(
      folders.map(async (folder) => {
        const assets = await ctx.db
          .query("assets")
          .withIndex("by_folderId", (q) => q.eq("folderId", folder._id))
          .collect();

        const directAssetCount = assets.length;
        const directTotalSize = assets.reduce(
          (sum, asset) => sum + asset.sizeBytes,
          0,
        );

        return {
          folder,
          directAssetCount,
          directTotalSize,
        };
      }),
    );

    // Second pass: compute aggregated counts and status for each folder
    const enrichedFolders = folderAssetData.map((data) => {
      const { folder, directAssetCount, directTotalSize } = data;

      // Normalize paths for comparison
      const folderPath = folder.path.replace(/^\/+|\/+$/g, "");
      const childPrefix = folderPath + "/";

      const descendants = folderAssetData.filter((d) => {
        const dPath = d.folder.path.replace(/^\/+|\/+$/g, "");
        return dPath.startsWith(childPrefix);
      });

      // Aggregate totals from descendants
      const totalAssetCount =
        directAssetCount +
        descendants.reduce((sum, d) => sum + d.directAssetCount, 0);
      const totalSize =
        directTotalSize +
        descendants.reduce((sum, d) => sum + d.directTotalSize, 0);

      // Determine display status based on hierarchy
      let displayStatus = folder.status;

      // COMPUTED STATUS LOGIC:
      // Only compute display status if the folder is NOT already marked as completed.
      // Explicitly completed folders (via submission or manual action) should stay completed.
      if (folder.status !== "completed") {
        // Check if this folder has children (is a parent folder)
        const hasChildren = descendants.length > 0;

        if (hasChildren) {
          // For parent folders, compute status from direct children
          const directChildren = folderAssetData.filter((d) => {
            const dPath = d.folder.path.replace(/^\/+|\/+$/g, "");
            if (!dPath.startsWith(childPrefix)) return false;
            const remainder = dPath.slice(childPrefix.length);
            return !remainder.includes("/");
          });

          if (directChildren.length > 0) {
            // Get the computed status for each direct child
            const childStatuses = directChildren.map((child) => {
              const childStoredStatus = child.folder.status;

              // Recursive status computation logic for children
              if (child.directAssetCount === 0) {
                // Check if this child has its own descendants with files
                const childPath = child.folder.path.replace(/^\/+|\/+$/g, "");
                const childDescPrefix = childPath + "/";
                const childDescendants = folderAssetData.filter((d) => {
                  const dPath = d.folder.path.replace(/^\/+|\/+$/g, "");
                  return dPath.startsWith(childDescPrefix);
                });
                const childTotalFiles = childDescendants.reduce(
                  (sum, d) => sum + d.directAssetCount,
                  0,
                );

                if (childTotalFiles === 0) {
                  // Even if no files, follow the stored status if it's completed
                  return childStoredStatus === "completed"
                    ? "completed"
                    : "pending_upload";
                }
                // Has descendant files, check if all descendants are completed
                const allDescCompleted = childDescendants.every(
                  (d) => d.folder.status === "completed",
                );
                return allDescCompleted ? "completed" : "in_progress";
              }

              // Child has direct files
              if (childStoredStatus === "pending_upload") {
                return "in_progress";
              }
              return childStoredStatus;
            });

            const allCompleted = childStatuses.every((s) => s === "completed");
            const allPending = childStatuses.every(
              (s) => s === "pending_upload",
            );

            if (allCompleted) {
              displayStatus = "completed";
            } else if (allPending) {
              displayStatus = "pending_upload";
            } else {
              displayStatus = "in_progress";
            }
          }
        } else {
          // Leaf folder - compute status based on its own file count
          if (directAssetCount === 0) {
            displayStatus = "pending_upload";
          } else if (
            folder.status === "pending_upload" &&
            directAssetCount > 0
          ) {
            displayStatus = "in_progress";
          }
        }
      }

      return {
        _id: folder._id,
        projectId: folder.projectId,
        name: folder.name,
        path: folder.path,
        status: displayStatus,
        assetCount: totalAssetCount,
        totalSize,
      };
    });

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
    // Note: quotations.projectId is now v.id("projects")
    let approvedQuotation = await ctx.db
      .query("quotations")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .first();

    // Also check projectIds array (for multi-project quotations)
    if (!approvedQuotation) {
      const allApprovedQuotations = await ctx.db
        .query("quotations")
        .withIndex("by_status", (q) => q.eq("status", "approved"))
        .collect();

      approvedQuotation =
        allApprovedQuotations.find((q) =>
          q.projectIds?.includes(args.projectId),
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
    const studioId = project.studioId;
    if (studioId) {
      const clientQuotations = await ctx.db
        .query("quotations")
        .withIndex("by_studioId", (q) => q.eq("studioId", studioId))
        .collect();

      const hasClientApprovedQuotation = clientQuotations.some(
        (q) => q.status === "approved",
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
      {} as Record<string, number>,
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
    if (ctx.profile.role === "studio") {
      if (project.studioId !== ctx.profile._id) {
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
    if (ctx.profile.role === "studio") {
      if (project.studioId !== ctx.profile._id) {
        throw new Error("Access denied");
      }
    }

    const assets = await ctx.db
      .query("assets")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();

    // Enrich with uploader info
    return await Promise.all(
      assets.map(async (asset) => {
        const uploader = asset.uploadedBy
          ? await ctx.db.get(asset.uploadedBy)
          : null;
        return {
          ...asset,
          uploaderName: uploader?.name || "Unknown",
          uploaderRole: (uploader as any)?.role || "client",
        };
      }),
    );
  },
});

/**
 * Get all assets in a folder and all its descendants.
 * Used for zipping entire folder trees.
 */
export const getFolderAssetsRecursive = authenticatedWithProfileQuery({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const rootFolder = await ctx.db.get(args.folderId);
    if (!rootFolder) throw new Error("Folder not found");

    // Verify access
    const project = await ctx.db.get(rootFolder.projectId);
    if (!project) throw new Error("Project not found");

    if (ctx.profile.role === "studio") {
      if (project.studioId !== ctx.profile._id) {
        throw new Error("Access denied");
      }
    }

    // Find all descendant folders including the root
    const allProjectFolders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", rootFolder.projectId))
      .collect();

    const descendantFolders = allProjectFolders.filter((f) =>
      f.path.startsWith(rootFolder.path),
    );

    // Get assets for all these folders
    const allAssets = await Promise.all(
      descendantFolders.map(async (folder) => {
        const assets = await ctx.db
          .query("assets")
          .withIndex("by_folderId", (q) => q.eq("folderId", folder._id))
          .collect();

        // Return assets with their relative path within the root folder
        const relativePath =
          folder.path === rootFolder.path
            ? ""
            : folder.path.slice(rootFolder.path.length + 1);

        return assets.map((asset) => ({
          ...asset,
          relativePath,
        }));
      }),
    );

    const flattenedAssets = allAssets.flat();

    // Enrich with uploader info
    return await Promise.all(
      flattenedAssets.map(async (asset) => {
        const uploader = asset.uploadedBy
          ? await ctx.db.get(asset.uploadedBy)
          : null;
        return {
          ...asset,
          uploaderName: uploader?.name || "Unknown",
          uploaderRole: (uploader as any)?.role || "client",
        };
      }),
    );
  },
});
