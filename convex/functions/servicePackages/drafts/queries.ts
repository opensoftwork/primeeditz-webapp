import { adminQuery } from "../../../lib/customFunctions";
import { v } from "convex/values";

/**
 * Get the active service package draft for the current admin.
 */
export const getActiveDraft = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("servicePackageDrafts")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", ctx.profile._id))
      .first();
  },
});

/**
 * Get a specific service package draft by ID.
 */
export const getDraftById = adminQuery({
  args: {
    id: v.id("servicePackageDrafts"),
  },
  handler: async (ctx, { id }) => {
    const draft = await ctx.db.get(id);
    if (!draft) return null;
    
    // Safety check: only the creator can access their draft
    if (draft.createdBy !== ctx.profile._id) {
       throw new Error("Access denied: This draft belongs to another user.");
    }
    
    return draft;
  },
});
