import { v } from "convex/values";
import { api } from "../../_generated/api";
import type { Doc, Id } from "../../_generated/dataModel";
import { internalMutation, query } from "../../_generated/server";
import { quotationStatusValidator } from "../../schema";

export type EnrichedQuotation = Doc<"quotations"> & {
  studioName?: string;
  projectName?: string;
};

/**
 * Get enriched quotations for admin listing.
 */
export const getAdminQuotations = query({
  args: {
    status: v.optional(quotationStatusValidator),
    studioId: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args): Promise<EnrichedQuotation[]> => {
    const quotations: Doc<"quotations">[] = await ctx.runQuery(
      api.functions.quotations.queries.getQuotations,
      {
        status: args.status,
        studioId: args.studioId,
      },
    );

    const studioIds = [
      ...new Set(
        quotations
          .map((q) => q.studioId)
          .filter((id): id is Id<"profiles"> => !!id),
      ),
    ];
    const projectIds = [
      ...new Set(
        quotations
          .map((q) => q.projectId)
          .filter((id): id is Id<"projects"> => !!id),
      ),
    ];

    const [clients, projects] = await Promise.all([
      Promise.all(studioIds.map((id) => ctx.db.get(id))),
      Promise.all(projectIds.map((id) => ctx.db.get(id))),
    ]);

    const clientMap = new Map(
      clients
        .filter((c): c is Doc<"profiles"> => !!c)
        .map((c) => [c._id, c.name]),
    );
    const projectMap = new Map(
      projects
        .filter((p): p is Doc<"projects"> => !!p)
        .map((p) => [p._id, p.endClientName || p.code]),
    );

    return quotations.map((q) => ({
      ...q,
      studioName: q.studioId ? clientMap.get(q.studioId) : undefined,
      projectName: q.projectId ? projectMap.get(q.projectId) : undefined,
    }));
  },
});

/**
 * DEV ONLY: Delete all quotations for testing.
 */
export const deleteAllQuotations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const quotations = await ctx.db.query("quotations").collect();
    for (const q of quotations) {
      await ctx.db.delete(q._id);
    }
    return { deleted: quotations.length };
  },
});
