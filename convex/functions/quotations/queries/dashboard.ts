import { v } from "convex/values";
import type { Doc, Id } from "../../../_generated/dataModel";
import { adminQuery } from "../../../lib/customFunctions";

/**
 * Get pending quotations for admin dashboard notification widget.
 * Shows quotations created by studios that need Admin review/approval.
 * Story: 15.3
 */
export const getPendingQuotationsForAdmin = adminQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get quotations that actually need Admin action (Input from Studio):
    const pendingStatuses = ["initiated", "changes_requested"];

    // Fetch and filter
    const allQuotations = await ctx.db
      .query("quotations")
      .filter((q) =>
        q.and(
          q.neq(q.field("isDeleted"), true),
          q.eq(q.field("createdBy"), "STUDIO"), // Strictly Studio-initiated ONLY
          q.or(
            ...pendingStatuses.map((status) => q.eq(q.field("status"), status)),
          ),
        ),
      )
      .order("desc")
      .collect();

    const studioQuotations = allQuotations;

    // Apply limit
    const limited = args.limit
      ? studioQuotations.slice(0, args.limit)
      : studioQuotations;

    // Get all profiles for studio name enrichment
    const studioIds = [
      ...new Set(
        limited
          .map((q) => q.studioId)
          .filter((id): id is Id<"profiles"> => !!id),
      ),
    ];
    const studios = await Promise.all(studioIds.map((id) => ctx.db.get(id)));
    const studioNameMap = new Map(
      studios
        .filter((s): s is Doc<"profiles"> => !!s)
        .map((s) => [s._id as string, s.name]),
    );

    // Get project names for enrichment
    const projectIds = [
      ...new Set(
        limited
          .map((q) => q.projectId)
          .filter((id): id is Id<"projects"> => !!id),
      ),
    ];
    const projects = await Promise.all(projectIds.map((id) => ctx.db.get(id)));
    const projectMap = new Map(
      projects
        .filter((p): p is Doc<"projects"> => !!p)
        .map((p) => [p._id as string, p.endClientName || p.code]),
    );

    const enrichedQuotations = limited.map((q) => ({
      _id: q._id,
      code: q.code,
      status: q.status,
      total: q.total,
      studioId: q.studioId,
      studioName: q.studioId ? studioNameMap.get(q.studioId) : undefined,
      projectId: q.projectId,
      projectName: q.projectId ? projectMap.get(q.projectId) : undefined,
      endClientName: q.endClientName,
      _creationTime: q._creationTime,
      sentAt: q.sentAt,
    }));

    return {
      quotations: enrichedQuotations,
      totalCount: studioQuotations.length,
    };
  },
});

/**
 * Get the latest draft quotation for the current admin.
 */
export const getMyLatestDraft = adminQuery({
  args: {},
  handler: async (ctx) => {
    // Find quotations with draft status created by this admin
    const draft = await ctx.db
      .query("quotations")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .order("desc")
      .first();

    return draft;
  },
});
