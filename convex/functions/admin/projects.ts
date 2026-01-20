import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { adminQuery, adminMutation } from "../../lib/customFunctions";
import { internalQuery } from "../../_generated/server";
import { Doc, Id } from "../../_generated/dataModel";
import { projectPhaseValidator, projectActionStateValidator } from "../../schema";
import { checkUploadEligibility } from "../../lib/uploadGate";

/**
 * Get all projects for admin listing with cursor-based pagination.
 */
export const getAdminProjectsPaginated = adminQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    phase: v.optional(projectPhaseValidator),
    actionState: v.optional(projectActionStateValidator),
    projectTypeId: v.optional(v.id("projectTypes")),
    includeTrashed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query;
    if (args.phase) {
      query = ctx.db.query("projects").withIndex("by_phase", (q) => q.eq("phase", args.phase!));
    } else if (args.actionState) {
      query = ctx.db.query("projects").withIndex("by_actionState", (q) => q.eq("actionState", args.actionState!));
    } else {
      query = ctx.db.query("projects");
    }

    const results = await query
      .filter((q) => args.includeTrashed ? q.neq(q.field("deletedAt"), -1) : q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    const projectTypes: Doc<"projectTypes">[] = await ctx.db.query("projectTypes").collect();
    const projectTypeMap = new Map<Id<"projectTypes">, Doc<"projectTypes">>(
      projectTypes.map((pt) => [pt._id, pt])
    );

    const clients: Doc<"profiles">[] = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "client"))
      .collect();
    const clientMap = new Map<Id<"profiles">, Doc<"profiles">>(
      clients.map((c) => [c._id, c])
    );

    const enrichedPage = results.page
      .filter(
        (p: Doc<"projects">) => !args.projectTypeId || p.projectTypeId === args.projectTypeId,
      )
      .map((project: Doc<"projects">) => {
        const projectType = projectTypeMap.get(project.projectTypeId);
        const client = project.clientId ? clientMap.get(project.clientId) : null;

        return {
          _id: project._id,
          code: project.code,
          phase: project.phase,
          actionState: project.actionState,
          status: project.actionState, // Compatibility
          projectTypeName: projectType?.name ?? "Unknown",
          clientName: client?.name ?? "Unknown Client",
          clientId: project.clientId,
          eventName: project.eventName,
          eventDate: project.eventDate,
          deliveryConfig: projectType?.deliveryConfig,
          createdAt: project._creationTime,
          updatedAt: project.updatedAt,
        };
      });

    return {
      ...results,
      page: enrichedPage,
    };
  },
});

/**
 * Internal query to fetch projects that have been in trash for > 30 days.
 */
export const internalGetExpiredTrash = internalQuery({
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return await ctx.db
      .query('projects')
      .filter((q) =>
        q.and(
          q.neq(q.field('deletedAt'), undefined),
          q.lt(q.field('deletedAt'), thirtyDaysAgo)
        )
      )
      .collect()
  },
})

/**
 * Get soft-deleted projects (trash view).
 */
export const getTrashedProjects = adminQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("projects")
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    const enrichedPage = await Promise.all(
      results.page.map(async (project: Doc<"projects">) => {
        const [projectType, client] = await Promise.all([
          ctx.db.get(project.projectTypeId),
          project.clientId ? ctx.db.get(project.clientId) : null,
        ]);

        return {
          _id: project._id,
          code: project.code,
          phase: project.phase,
          actionState: project.actionState,
          status: project.actionState, // Compatibility
          projectTypeName: projectType?.name ?? "Unknown",
          clientName: client?.name ?? "Unknown Client",
          deletedAt: project.deletedAt,
          eventName: project.eventName,
          createdAt: project._creationTime,
        };
      })
    );

    return {
      ...results,
      page: enrichedPage,
    };
  },
});

/**
 * Get a single project by ID (admin view).
 */
export const getAdminProject = adminQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const [client, projectType, history, quotation, assignedEmployee] = await Promise.all([
      project.clientId ? ctx.db.get(project.clientId as Id<"profiles">) : null,
      ctx.db.get(project.projectTypeId),
      ctx.db.query("statusHistory")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
        .order("desc")
        .collect(),
      // Find the quotation associated with this project
      ctx.db.query("quotations")
        .filter((q) => q.eq(q.field("projectId"), args.projectId))
        .first(),
      // Get assigned employee if there is one
      project.assignedEmployeeId 
        ? ctx.db.get(project.assignedEmployeeId as Id<"profiles">) 
        : null,
    ]);

    const enrichedHistory = await Promise.all(
      history.map(async (entry) => {
        const actor = await ctx.db.get(entry.changedBy);
        return {
          ...entry,
          actorName: actor?.name ?? "Unknown",
        };
      }),
    );

    const uploadEligibility = await checkUploadEligibility(ctx, args.projectId);

    return {
      ...project,
      clientName: client?.name ?? "Unknown Client",
      clientEmail: client?.email ?? "Unknown Email",
      projectTypeName: projectType?.name ?? "Unknown",
      deliveryConfig: projectType?.deliveryConfig,
      assignedEmployeeId: project.assignedEmployeeId,
      assignedEmployeeName: assignedEmployee?.name,
      quotationId: quotation?._id,
      statusHistory: enrichedHistory,
      uploadEligibility,
    };
  },
});


/**
 * @deprecated Use getAdminProjectsPaginated
 */
export const getAdminProjects = adminQuery({
  args: {
    phase: v.optional(projectPhaseValidator),
    actionState: v.optional(projectActionStateValidator),
    projectTypeId: v.optional(v.id("projectTypes")),
    clientSearch: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal("date"), v.literal("status"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const sortOrder = args.sortOrder ?? "desc";

    let query;
    if (args.phase) {
      query = ctx.db.query("projects").withIndex("by_phase", (q) => q.eq("phase", args.phase!));
    } else if (args.actionState) {
      query = ctx.db.query("projects").withIndex("by_actionState", (q) => q.eq("actionState", args.actionState!));
    } else {
      query = ctx.db.query("projects");
    }
    
    let allProjects = await query.order(sortOrder).collect();

    if (args.projectTypeId) {
      allProjects = allProjects.filter((p) => p.projectTypeId === args.projectTypeId);
    }

    const [projectTypes, clients] = await Promise.all([
      ctx.db.query("projectTypes").collect(),
      ctx.db.query("profiles").withIndex("by_role", (q) => q.eq("role", "client")).collect()
    ]);

    const projectTypeMap = new Map(projectTypes.map((pt) => [pt._id, pt]));
    const clientMap = new Map(clients.map((c) => [c._id, c]));

    let enrichedProjects = allProjects.map((project) => ({
      _id: project._id,
      code: project.code,
      phase: project.phase,
      actionState: project.actionState,
      status: project.actionState, // Compatibility
      projectTypeName: projectTypeMap.get(project.projectTypeId)?.name ?? "Unknown",
      clientName: (project.clientId ? clientMap.get(project.clientId) : null)?.name ?? "Unknown Client",
      clientId: project.clientId,
      eventName: project.eventName,
      eventDate: project.eventDate,
      createdAt: project._creationTime,
      updatedAt: project.updatedAt,
    }));

    if (args.clientSearch) {
      const search = args.clientSearch.toLowerCase();
      enrichedProjects = enrichedProjects.filter(
        (p) => (p.clientName?.toLowerCase().includes(search) ?? false) || p.code.toLowerCase().includes(search)
      );
    }

    if (args.sortBy === "status") {
      const statusOrder = ["draft", "awaiting_quotation", "quotation_sent", "active", "in_progress", "completed", "archived"];
      enrichedProjects.sort((a, b) => {
        const aIndex = statusOrder.indexOf(a.actionState);
        const bIndex = statusOrder.indexOf(b.actionState);
        return sortOrder === "asc" ? aIndex - bIndex : bIndex - aIndex;
      });
    }

    const totalCount = enrichedProjects.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    return {
      projects: enrichedProjects.slice(startIndex, startIndex + pageSize),
      pagination: { page, pageSize, totalCount, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  },
});
