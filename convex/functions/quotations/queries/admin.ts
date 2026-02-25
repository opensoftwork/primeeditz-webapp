import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "../../../_generated/dataModel";
import { type QueryCtx } from "../../../_generated/server";
import { adminQuery } from "../../../lib/customFunctions";
import { quotationStatusValidator } from "../../../schema";

/**
 * Get all quotations with optional filters
 */
export const getQuotations = adminQuery({
  args: {
    status: v.optional(v.string()),
    studioId: v.optional(v.id("profiles")),
    projectId: v.optional(v.id("projects")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args) => {
    let quotations: Doc<"quotations">[];

    if (args.status) {
      quotations = await ctx.db
        .query("quotations")
        .withIndex("by_status", (q) =>
          q.eq(
            "status",
            args.status as
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded",
          ),
        )
        .collect();
    } else if (args.studioId) {
      quotations = await ctx.db
        .query("quotations")
        .withIndex("by_studioId", (q) => q.eq("studioId", args.studioId!))
        .collect();
    } else {
      quotations = await ctx.db.query("quotations").collect();
    }

    if (args.projectId) {
      quotations = quotations.filter((q) => q.projectId === args.projectId);
    }

    quotations.sort((a, b) => b._creationTime - a._creationTime);

    if (args.limit) {
      quotations = quotations.slice(0, args.limit);
    }

    return quotations;
  },
});

/**
 * Get all quotations for admin with cursor-based pagination.
 */
export const getAdminQuotationsPaginated = adminQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(quotationStatusValidator),
  },
  handler: async (ctx, args) => {
    const query = args.status
      ? ctx.db
          .query("quotations")
          .withIndex("by_status", (q) =>
            q.eq("status", args.status as Doc<"quotations">["status"]),
          )
      : ctx.db.query("quotations");

    const activeQuery = query.filter((q) => q.neq(q.field("isDeleted"), true));

    const results = await activeQuery
      .order("desc")
      .paginate(args.paginationOpts);

    // Get all profiles for client name enrichment
    const studioIds = [
      ...new Set(
        results.page
          .map((q) => q.studioId)
          .filter((id): id is Id<"profiles"> => !!id),
      ),
    ];
    const clients = await Promise.all(
      studioIds.map((id) => ctx.db.get(id as Id<"profiles">)),
    );
    const studioNameMap = new Map(
      clients
        .filter((c): c is Doc<"profiles"> => !!c)
        .map((c) => [c._id as string, c.name]),
    );

    // Get project names for enrichment
    const projectIds = [
      ...new Set(
        results.page
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

    const enrichedPage = results.page.map((q) => ({
      ...q,
      studioName: q.studioId ? studioNameMap.get(q.studioId) : undefined,
      projectName: q.projectId ? projectMap.get(q.projectId) : undefined,
    }));

    return {
      ...results,
      page: enrichedPage,
    };
  },
});

/**
 * Get a single quotation by ID
 */
export const getQuotation = adminQuery({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db.get(args.quotationId);
  },
});

/**
 * Get a quotation by code
 */
export const getQuotationByCode = adminQuery({
  args: {
    code: v.string(),
  },
  handler: async (ctx: QueryCtx, args) => {
    const quotations = await ctx.db
      .query("quotations")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .collect();

    if (quotations.length === 0) return null;
    return quotations.reduce(
      (latest: Doc<"quotations">, q: Doc<"quotations">) =>
        q.version > latest.version ? q : latest,
    );
  },
});

/**
 * Get quotation version history
 */
export const getQuotationHistory = adminQuery({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx: QueryCtx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return [];

    const allVersions = await ctx.db
      .query("quotations")
      .withIndex("by_code", (q) => q.eq("code", quotation.code))
      .collect();

    return allVersions.sort((a, b) => b.version - a.version);
  },
});

/**
 * Get quotation with enriched section data
 */
export const getQuotationWithSections = adminQuery({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx: QueryCtx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return null;

    // Get all sections used in this quotation
    const sectionIds = [
      ...new Set(
        quotation.lineItems
          .map((li) => li.sectionId)
          .filter((id): id is Id<"quotationSections"> => !!id),
      ),
    ];
    const sections = await Promise.all(sectionIds.map((id) => ctx.db.get(id)));

    // Get client name
    let studioName;
    if (quotation.studioId) {
      const profile = await ctx.db.get(quotation.studioId as Id<"profiles">);
      studioName = profile?.name;
    }

    // Get project name(s)
    let projectName;
    let projectCode;
    if (quotation.projectId) {
      const project = await ctx.db.get(quotation.projectId as Id<"projects">);
      projectName = project?.endClientName || project?.code;
      projectCode = project?.code;
    }

    // Get assigned employee
    let assignedEmployeeName;
    if (quotation.assignedEmployeeId) {
      const emp = await ctx.db.get(quotation.assignedEmployeeId);
      assignedEmployeeName = emp?.name;
    }

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

    // Get selected packages for package-based grouping in preview
    const selectedPackageIds = quotation.selectedPackageIds || [];
    const packages = await Promise.all(
      selectedPackageIds.map(async (pkgId) => {
        const pkg = await ctx.db.get(pkgId);
        if (!pkg) return null;
        const projectType = pkg.projectTypeId
          ? projectTypes.find((pt) => pt._id === pkg.projectTypeId)
          : undefined;
        return {
          _id: pkg._id,
          name: pkg.name,
          projectTypeId: pkg.projectTypeId || undefined,
          projectTypeName: projectType?.name,
          // Include line item descriptions for fallback matching in preview
          lineItemDescriptions: pkg.lineItems?.map((li) => li.description) || [],
        };
      }),
    );

    return {
      quotation: {
        ...quotation,
        studioName,
        projectName,
        projectCode,
        assignedEmployeeName,
      },
      sections: sections.filter(
        (s): s is Doc<"quotationSections"> => s !== null,
      ),
      projects: projects.filter((p): p is NonNullable<typeof p> => p !== null),
      packages: packages.filter((p): p is NonNullable<typeof p> => p !== null),
    };
  },
});
