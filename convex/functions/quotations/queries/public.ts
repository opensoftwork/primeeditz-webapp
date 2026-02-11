import { v } from "convex/values";
import type { Doc, Id } from "../../../_generated/dataModel";
import { type QueryCtx, query } from "../../../_generated/server";

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
    if (
      quotation.shareTokenExpiresAt &&
      Date.now() > quotation.shareTokenExpiresAt
    ) {
      return { error: "Link expired" };
    }

    // Check status
    const publicStatus = [
      "sent",
      "viewed",
      "approved",
      "changes_requested",
      "rejected",
    ];
    if (!publicStatus.includes(quotation.status)) {
      return { error: "Quotation no longer available" };
    }

    // Get sections for detail view
    const sectionIds = [
      ...new Set(
        quotation.lineItems
          .map((li) => li.sectionId)
          .filter((id): id is Id<"quotationSections"> => !!id),
      ),
    ];
    const sections = await Promise.all(sectionIds.map((id) => ctx.db.get(id)));

    return {
      quotation,
      sections: sections.filter(
        (s): s is Doc<"quotationSections"> => s !== null,
      ),
    };
  },
});
