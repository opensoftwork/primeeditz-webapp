import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthUserWithProfile } from "../../lib/customFunctions";

/**
 * Get storage usage for a project.
 * Returns used and allocated storage in bytes.
 * Accessible by both clients (who own the project) and admins.
 */
export const getProjectStorageUsage = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);
    if (!profile) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Verify access - client must own, or be admin
    if (profile.role === "studio" && project.studioId !== profile._id) {
      throw new Error("Access denied");
    }

    // Sum all asset sizes for this project
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const used = assets.reduce((sum, asset) => sum + asset.sizeBytes, 0);

    // Get allocation from project or quotation
    let allocated = project.storageAllocated || 0;

    if (!allocated) {
      // Check for approved quotation
      const projectIdString = args.projectId as string;

      let quotation = await ctx.db
        .query("quotations")
        .withIndex("by_status", (q) => q.eq("status", "approved"))
        .filter((q) => q.eq(q.field("projectId"), projectIdString))
        .first();

      if (!quotation) {
        const allApproved = await ctx.db
          .query("quotations")
          .withIndex("by_status", (q) => q.eq("status", "approved"))
          .collect();

        quotation =
          allApproved.find((q) => q.projectIds?.includes(projectIdString)) ||
          null;
      }

      if (quotation) {
        // Find storage tier in line items
        const storageItem = quotation.lineItems.find((item) =>
          item.description.toLowerCase().includes("storage"),
        );

        if (storageItem) {
          const match = storageItem.description.match(/(\d+)\s*GB/i);
          if (match) {
            allocated = parseInt(match[1]) * 1024 * 1024 * 1024;
          }
        }
      }
    }

    // Default to 100GB if still 0 (fallback)
    if (!allocated) {
      allocated = 100 * 1024 * 1024 * 1024;
    }

    return {
      used,
      allocated,
      percentage: (used / allocated) * 100,
    };
  },
});
