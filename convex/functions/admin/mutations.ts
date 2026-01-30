// convex/functions/admin/mutations.ts

import { internal } from "../../_generated/api";
import { adminMutation } from "../../lib/customFunctions";
import { v } from "convex/values";


/**
 * ⚠️ DESTRUCTIVE: Clears all legacy data.
 * Requires explicit confirmation string.
 */
export const clearLegacyDataWithConfirmation = adminMutation({
  args: {
    confirmationText: v.string(),
  },
  handler: async (ctx, { confirmationText }): Promise<any> => {
    // Require exact confirmation text
    if (confirmationText !== "DELETE ALL LEGACY DATA") {
      throw new Error(
        "Invalid confirmation. Type 'DELETE ALL LEGACY DATA' exactly.",
      );
    }

    // Check if running in production
    const isProduction = process.env.CONVEX_CLOUD_URL?.includes("convex.cloud");
    if (isProduction) {
      // Safety check
    }

    // Run the cleanup
    const result = (await ctx.runMutation(
      internal.functions.admin.cleanup.clearLegacyData,
    )) as any;

    return {
      success: true,
      ...result,
    };
  },
});
