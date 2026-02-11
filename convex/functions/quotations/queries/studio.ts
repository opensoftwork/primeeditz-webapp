import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "../../../_generated/dataModel";
import { studioQuery } from "../../../lib/customFunctions";
import { quotationStatusValidator } from "../../../schema";

/**
 * Get current client's quotations
 */
export const getMyQuotations = studioQuery({
  args: {},
  handler: async (ctx, args) => {
    const quotations = await ctx.db
      .query("quotations")
      .withIndex("by_studioId", (q) => q.eq("studioId", ctx.profile._id))
      .collect();

    // Filter by status (visible to client) and exclude deleted quotations
    const studioVisibleStatus = [
      "initiated",
      "sent",
      "viewed",
      "approved",
      "changes_requested",
      "rejected",
    ];
    const visibleQuotations = quotations.filter(
      (q) => studioVisibleStatus.includes(q.status) && q.isDeleted !== true,
    );

    // Get project names for enrichment
    const projectIds = [
      ...new Set(
        visibleQuotations
          .map((q) => q.projectId)
          .filter((id): id is Id<"projects"> => !!id),
      ),
    ];
    const projects = await Promise.all(
      projectIds.map((id) => ctx.db.get(id as Id<"projects">)),
    );
    const projectMap = new Map(
      projects
        .filter((p): p is Doc<"projects"> => !!p)
        .map((p) => [p._id as string, p.endClientName || p.code]),
    );

    return visibleQuotations
      .map((q) => ({
        ...q,
        projectName: q.projectId ? projectMap.get(q.projectId) : undefined,
      }))
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Get all quotations for the current client with cursor-based pagination.
 * Compatible with useSimplePaginatedQuery for infinite scroll or page navigation.
 */
export const getMyQuotationsPaginated = studioQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(quotationStatusValidator),
  },
  handler: async (ctx, args) => {
    // Execute pagination - conditionally use index for status filtering
    // Clients only see their own quotations and non-draft quotations
    let query = ctx.db
      .query("quotations")
      .withIndex("by_studioId", (q) => q.eq("studioId", ctx.profile._id));

    // Filter by client visible status
    const studioVisibleStatus = [
      "initiated",
      "sent",
      "viewed",
      "approved",
      "changes_requested",
      "rejected",
      "expired",
      "superseded",
    ];

    // Applying status filter if provided, otherwise filter by visible statuses
    if (args.status) {
      query = query.filter((q) =>
        q.and(
          q.eq(q.field("status"), args.status!),
          q.neq(q.field("isDeleted"), true),
        ),
      );
    } else {
      query = query.filter((q) =>
        q.and(
          q.or(
            ...studioVisibleStatus.map((status) =>
              q.eq(q.field("status"), status),
            ),
          ),
          q.neq(q.field("isDeleted"), true),
        ),
      );
    }

    const results = await query.order("desc").paginate(args.paginationOpts);

    // Get project names for enrichment
    const projectIds = [
      ...new Set(
        results.page.map((q) => q.projectId).filter((id): id is Id<"projects"> => !!id),
      ),
    ];
    const projects = await Promise.all(
      projectIds.map((id) => ctx.db.get(id as Id<"projects">)),
    );
    const projectMap = new Map(
      projects
        .filter((p): p is Doc<"projects"> => !!p)
        .map((p) => [p._id as string, p.endClientName || p.code]),
    );

    const enrichedPage = results.page.map((q) => ({
      ...q,
      projectName: q.projectId ? projectMap.get(q.projectId) : undefined,
      endClientName: q.endClientName,
    }));

    return {
      ...results,
      page: enrichedPage,
    };
  },
});

/**
 * Get client's specific quotation with sections
 */
export const getMyQuotationDetail = studioQuery({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return null;

    // Verify ownership
    if (quotation.studioId !== ctx.profile._id) {
      throw new Error("Access denied: Not your quotation");
    }

    // Status check
    const studioVisibleStatus = [
      "initiated",
      "sent",
      "viewed",
      "approved",
      "changes_requested",
      "rejected",
    ];
    if (!studioVisibleStatus.includes(quotation.status)) {
      return null;
    }

    // Get all sections used in this quotation
    const sectionIds = [
      ...new Set(quotation.lineItems.map((li) => li.sectionId)),
    ];
    const sections = await Promise.all(
      sectionIds.map((id) => (id ? ctx.db.get(id) : null)),
    );

    // Get all projects linked to this quotation (for project-based grouping)
    const projectTypes = await ctx.db.query("projectTypes").collect();
    const projectIds =
      quotation.projectIds ||
      (quotation.projectId ? [quotation.projectId] : []);
    const projects = await Promise.all(
      projectIds.map(async (id) => {
        const project = await ctx.db.get(id as Id<"projects">);
        if (!project) return null;
        const projectType = projectTypes.find(
          (pt) => pt._id === project.projectTypeId,
        );
        return {
          _id: project._id,
          code: project.code,
          endClientName: project.endClientName,
          projectTypeId: project.projectTypeId,
          projectTypeName: projectType?.name || "Unknown",
        };
      }),
    );

    return {
      quotation: {
        ...quotation,
      },
      sections: sections.filter(
        (s): s is Doc<"quotationSections"> => s !== null,
      ),
      projects: projects.filter((p): p is NonNullable<typeof p> => p !== null),
    };
  },
});

/**
 * Get the current quotation request draft for the studio.
 */
export const getMyDraft = studioQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("quotationRequestDrafts")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", ctx.profile._id))
      .first();
  },
});
