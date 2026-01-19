/**
 * Admin Dashboard Queries
 *
 * Provides real-time dashboard statistics and pending projects list
 * for the admin portal.
 */

import { paginationOptsValidator } from "convex/server";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { adminMutation, adminQuery } from "./lib/customFunctions";
import { api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { projectStatusValidator, quotationStatusValidator } from "./schema";
import { checkUploadEligibility } from "./lib/uploadGate";

/**
 * Get admin dashboard statistics.
 * Returns counts for pending requests, active projects, and team members.
 */
export const getAdminDashboardStats = adminQuery({
  args: {},
  handler: async (ctx) => {
    // Count pending requests (status: pending_review)
    const pendingProjects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "pending_review"))
      .collect();
    const pendingRequestsCount = pendingProjects.length;

    // Count active projects (status: active or in_progress)
    const activeProjects = await ctx.db
      .query("projects")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("status"), "in_progress"),
          ),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();
    const activeProjectsCount = activeProjects.length;

    // Count team members (role: employee or admin)
    const teamMembers = await ctx.db
      .query("profiles")
      .filter((q) =>
        q.and(
          q.or(q.eq(q.field("role"), "employee"), q.eq(q.field("role"), "admin")),
          q.eq(q.field("deactivatedAt"), undefined)
        )
      )
      .collect();
    const totalEmployeesCount = teamMembers.length;

    return {
      pendingRequestsCount,
      activeProjectsCount,
      totalEmployeesCount,
    };
  },
});

/**
 * Get pending projects list for admin dashboard.
 * Returns up to 10 most recent projects with status 'pending_review',
 * including project type and client information.
 */
export const getPendingProjects = adminQuery({
  args: {},
  handler: async (ctx) => {
    // Get pending projects sorted by creation time (newest first)
    const pendingProjects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "pending_review"))
      .order("desc")
      .take(10);

    // Enrich with project type and client information
    const enrichedProjects = await Promise.all(
      pendingProjects.map(async (project) => {
        // Get project type
        const projectType = await ctx.db.get(project.projectTypeId);

        // Get client profile (clientId is optional for admin-initiated projects)
        const client = project.clientId
          ? await ctx.db.get(project.clientId)
          : null;

        return {
          _id: project._id,
          code: project.code,
          projectTypeName: projectType?.name ?? "Unknown",
          clientName: client?.name ?? "Unknown Client",
          eventName: project.eventName,
          eventDate: project.eventDate,
          createdAt: project._creationTime,
        };
      }),
    );

    return enrichedProjects;
  },
});

/**
 * Get all projects for admin listing with cursor-based pagination.
 * Compatible with useSimplePaginatedQuery for infinite scroll or page navigation.
 */
export const getAdminProjectsPaginated = adminQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(projectStatusValidator),
    projectTypeId: v.optional(v.id("projectTypes")),
    includeTrashed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Execute pagination - conditionally use index for status filtering
    const results = await (args.status
      ? ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .filter((q) => args.includeTrashed ? q.neq(q.field("deletedAt"), -1) : q.eq(q.field("deletedAt"), undefined))
        .order("desc")
        .paginate(args.paginationOpts)
      : ctx.db
        .query("projects")
        .filter((q) => args.includeTrashed ? q.neq(q.field("deletedAt"), -1) : q.eq(q.field("deletedAt"), undefined))
        .order("desc")
        .paginate(args.paginationOpts));
    // Get all project types and clients for enrichment
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

    // Filter by projectTypeId in memory and enrich
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
          status: project.status,
          projectTypeName: projectType?.name ?? "Unknown",
          clientName: client?.name ?? "Unknown Client",
          clientId: project.clientId,
          eventName: project.eventName,
          eventDate: project.eventDate,
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
 * Used by automated cleanup cron.
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

    // Enrich with project type and client info
    const enrichedPage = await Promise.all(
      results.page.map(async (project: Doc<"projects">) => {
        const [projectType, client] = await Promise.all([
          ctx.db.get(project.projectTypeId),
          project.clientId ? ctx.db.get(project.clientId) : null,
        ]);

        return {
          _id: project._id,
          code: project.code,
          status: project.status,
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
 * Get all projects for admin listing with offset-based pagination.
 * @deprecated Use getAdminProjectsPaginated with useSimplePaginatedQuery for better UX
 */
export const getAdminProjects = adminQuery({
  args: {
    status: v.optional(projectStatusValidator),
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

    // Get all projects - filter by status if provided
    let allProjects: Doc<"projects">[];
    if (args.status) {
      allProjects = await ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order(sortOrder)
        .collect();
    } else {
      allProjects = await ctx.db.query("projects").order(sortOrder).collect();
    }

    // Apply projectTypeId filter in memory (no index for this)
    if (args.projectTypeId) {
      allProjects = allProjects.filter(
        (p) => p.projectTypeId === args.projectTypeId,
      );
    }

    // Get all project types and clients for enrichment
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

    // Enrich projects with type and client names
    let enrichedProjects = allProjects.map((project: Doc<"projects">) => {
      const projectType = projectTypeMap.get(project.projectTypeId);
      const client = project.clientId ? clientMap.get(project.clientId) : null;

      return {
        _id: project._id,
        code: project.code,
        status: project.status,
        projectTypeName: projectType?.name ?? "Unknown",
        clientName: client?.name ?? "Unknown Client",
        clientId: project.clientId,
        eventName: project.eventName,
        eventDate: project.eventDate,
        createdAt: project._creationTime,
        updatedAt: project.updatedAt,
      };
    });

    // Apply client search filter in memory
    if (args.clientSearch) {
      const search = args.clientSearch.toLowerCase();
      enrichedProjects = enrichedProjects.filter(
        (p) =>
          (p.clientName?.toLowerCase().includes(search) ?? false) ||
          p.code.toLowerCase().includes(search),
      );
    }

    // Sort by status if requested
    if (args.sortBy === "status") {
      const statusOrder = [
        "pending_review",
        "active",
        "in_progress",
        "completed",
        "archived",
        "draft",
      ];
      enrichedProjects.sort((a, b) => {
        const aIndex = statusOrder.indexOf(a.status);
        const bIndex = statusOrder.indexOf(b.status);
        return sortOrder === "asc" ? aIndex - bIndex : bIndex - aIndex;
      });
    }

    // Calculate pagination
    const totalCount = enrichedProjects.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedProjects = enrichedProjects.slice(
      startIndex,
      startIndex + pageSize,
    );

    return {
      projects: paginatedProjects,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
});

/**
 * Get all project types for filter dropdown.
 */
export const getProjectTypes = adminQuery({
  args: {},
  handler: async (ctx) => {
    const projectTypes = await ctx.db.query("projectTypes").collect();
    const enriched = await Promise.all(
      projectTypes.map(async (pt) => {
        const category = pt.categoryId ? await ctx.db.get(pt.categoryId) : null;
        return {
          _id: pt._id,
          name: pt.name,
          categoryName: (category as Doc<"projectCategories"> | null)?.name || 'Uncategorized',
          isActive: pt.isActive,
        };
      })
    )
    return enriched;
  },
});

/**
 * Get fields for a specific project type.
 */
export const getProjectTypeFields = adminQuery({
  args: { projectTypeId: v.id("projectTypes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectTypeFields")
      .withIndex("by_projectTypeId", (q) =>
        q.eq("projectTypeId", args.projectTypeId),
      )
      .order("asc")
      .collect();
  },
});

/**
 * Create a new project type.
 */
export const createProjectType = adminMutation({
  args: {
    name: v.string(),
    categoryId: v.id("projectCategories"),
    isActive: v.boolean(),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projectTypes", {
      ...args,
    });
  },
});

/**
 * Update a project type.
 */
export const updateProjectType = adminMutation({
  args: {
    id: v.id("projectTypes"),
    name: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    isActive: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

/**
 * Create or update a project type field.
 */
export const upsertProjectTypeField = adminMutation({
  args: {
    id: v.optional(v.id("projectTypeFields")),
    projectTypeId: v.id("projectTypes"),
    name: v.string(),
    label: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("select"),
      v.literal("checkbox"),
      v.literal("textarea"),
    ),
    required: v.boolean(),
    placeholder: v.optional(v.string()),
    description: v.optional(v.string()),
    options: v.optional(v.string()),
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    displayOrder: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    } else {
      return await ctx.db.insert("projectTypeFields", data);
    }
  },
});

/**
 * Delete a project type field.
 */
export const deleteProjectTypeField = adminMutation({
  args: { id: v.id("projectTypeFields") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Reorder project type fields.
 */
export const reorderProjectTypeFields = adminMutation({
  args: {
    fields: v.array(
      v.object({
        id: v.id("projectTypeFields"),
        displayOrder: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const field of args.fields) {
      await ctx.db.patch(field.id, { displayOrder: field.displayOrder });
    }
  },
});

/**
 * Get a single project by ID (admin view).
 * Includes detailed client info, project type, and status history.
 */

export const getAdminProject = adminQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      return null;
    }

    // Get client profile (clientId is optional for admin-initiated projects)
    const client = project.clientId
      ? await ctx.db.get(project.clientId)
      : null;

    // Get project type
    const projectType = await ctx.db.get(project.projectTypeId);

    // Get status history
    const history = await ctx.db
      .query("statusHistory")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    // Enrich history with actor names
    const enrichedHistory = await Promise.all(
      history.map(async (entry) => {
        const actor = await ctx.db.get(entry.changedBy);
        return {
          ...entry,
          actorName: actor?.name ?? "Unknown",
        };
      }),
    );

    // Enrich with upload eligibility
    const uploadEligibility = await checkUploadEligibility(ctx, args.projectId);

    return {
      ...project,
      clientName: client?.name ?? "Unknown Client",
      clientEmail: client?.email ?? "Unknown Email",
      projectTypeName: projectType?.name ?? "Unknown",
      statusHistory: enrichedHistory,
      uploadEligibility,
    };
  },
});

export type EnrichedQuotation = Doc<"quotations"> & {
  clientName?: string;
  projectName?: string;
};

/**
 * Get enriched quotations for admin listing.
 */
export const getAdminQuotations = query({
  args: {
    status: v.optional(quotationStatusValidator),
    clientId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<EnrichedQuotation[]> => {
    // 1. Fetch raw quotations via standard functions
    const quotations: Doc<"quotations">[] = await ctx.runQuery(api.functions.quotations.queries.getQuotations, {
      status: args.status,
      clientId: args.clientId,
    });

    // 2. Extract IDs for batch enrichment
    const clientIds = quotations
      .map((q: Doc<"quotations">) => q.clientId)
      .filter((id: string | undefined): id is string => !!id);

    const projectIds = quotations
      .map((q: Doc<"quotations">) => q.projectId)
      .filter((id: string | undefined): id is string => !!id);

    // 3. Fetch related data from host app tables
    const clients = await Promise.all(
      clientIds.map((id: string) => ctx.db.get(id as Id<"profiles">))
    );
    const clientMap = new Map(
      clients.filter((c: Doc<"profiles"> | null): c is Doc<"profiles"> => !!c).map((c: Doc<"profiles">) => [c._id as string, c.name])
    );

    const projects = await Promise.all(
      projectIds.map((id: string) => ctx.db.get(id as Id<"projects">))
    );
    const projectMap = new Map(
      projects.filter((p: Doc<"projects"> | null): p is Doc<"projects"> => !!p).map((p: Doc<"projects">) => [p._id as string, p.eventName || p.code])
    );

    // 4. Enrich and return
    return quotations.map((q: Doc<"quotations">) => ({
      ...q,
      clientName: q.clientId ? clientMap.get(q.clientId) : undefined,
      projectName: q.projectId ? projectMap.get(q.projectId) : undefined,
    }));
  },
});

/**
 * Get all clients for selection.
 */
export const getClients = adminQuery({
  args: {
    includeDeactivated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "client"))
      .filter((q) => args.includeDeactivated ? q.neq(q.field("deactivatedAt"), -1) : q.eq(q.field("deactivatedAt"), undefined))
      .collect();
  },
});

/**
 * Get clients for selection in admin wizard.
 * Returns clients with search, projectCount, and lastActivityDate.
 * Optimized for the client selection drawer in admin project creation.
 */
export const getClientsForSelection = adminQuery({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const searchTerm = args.search?.toLowerCase().trim();

    // Get all clients
    let clients = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "client"))
      .order("desc")
      .collect();

    // Apply search filter in memory (search by name, email, company)
    if (searchTerm && searchTerm.length > 0) {
      clients = clients.filter((client) => {
        const name = client.name?.toLowerCase() ?? "";
        const email = client.email?.toLowerCase() ?? "";
        const company = client.company?.toLowerCase() ?? "";
        return (
          name.includes(searchTerm) ||
          email.includes(searchTerm) ||
          company.includes(searchTerm)
        );
      });
    }

    // Get project counts and last activity for each client
    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        // Get projects for this client
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
          .collect();

        // Calculate stats
        const projectCount = projects.length;
        const activeCount = projects.filter(
          (p) => p.status === "active" || p.status === "in_progress"
        ).length;

        // Get last activity date (most recent project update or client update)
        const lastProjectActivity = projects.length > 0
          ? Math.max(...projects.map((p) => p.updatedAt))
          : null;
        const lastActivityDate = lastProjectActivity ?? client.updatedAt;

        return {
          _id: client._id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          onboardingComplete: client.onboardingComplete,
          createdAt: client._creationTime,
          projectCount,
          activeProjectCount: activeCount,
          lastActivityDate,
        };
      })
    );

    // Sort by last activity (most recent first)
    enrichedClients.sort((a, b) => (b.lastActivityDate ?? 0) - (a.lastActivityDate ?? 0));

    // Apply limit (simple pagination for now)
    const paginatedClients = enrichedClients.slice(0, limit);

    return {
      clients: paginatedClients,
      hasMore: enrichedClients.length > limit,
      totalCount: enrichedClients.length,
    };
  },
});

/**
 * Get clients that have at least one project.
 * Used for quotation builder where only clients with projects should be selectable.
 */
export const getClientsWithProjects = adminQuery({
  args: {},
  handler: async (ctx) => {
    // Get all clients with the "client" role
    const allClients = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "client"))
      .collect();

    // Filter to only include clients with at least one project
    const clientsWithProjects = await Promise.all(
      allClients.map(async (client) => {
        const project = await ctx.db
          .query("projects")
          .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
          .first();
        return project ? client : null;
      })
    );

    return clientsWithProjects.filter((c): c is Doc<"profiles"> => c !== null);
  },
});

/**
 * Get simple list of projects for selection.
 */
export const getAdminProjectsSimple = adminQuery({
  args: {
    clientId: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    let projects;

    if (args.clientId) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId!))
        .collect();
    } else {
      projects = await ctx.db.query("projects").order("desc").collect();
    }

    return Promise.all(
      projects.map(async (p) => {
        const type = await ctx.db.get(p.projectTypeId);
        return {
          _id: p._id,
          code: p.code,
          eventName: p.eventName,
          projectTypeName: type?.name ?? "Unknown",
        };
      })
    );
  },
});

/**
 * Get a single client by ID with all their projects.
 * Used for the individual client details page.
 */
export const getClientWithProjects = adminQuery({
  args: {
    clientId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    // Get client profile
    const client = await ctx.db.get(args.clientId);

    if (!client || client.role !== "client") {
      return null;
    }

    // Get all projects for this client
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();

    // Get all project types for enrichment
    const projectTypes: Doc<"projectTypes">[] = await ctx.db.query("projectTypes").collect();
    const projectTypeMap = new Map<Id<"projectTypes">, Doc<"projectTypes">>(
      projectTypes.map((pt) => [pt._id, pt])
    );

    // Enrich projects with type names
    const enrichedProjects = projects.map((project) => {
      const projectType = projectTypeMap.get(project.projectTypeId);
      return {
        _id: project._id,
        code: project.code,
        status: project.status,
        projectTypeName: projectType?.name ?? "Unknown",
        eventName: project.eventName,
        eventDate: project.eventDate,
        venue: project.venue,
        description: project.description,
        createdAt: project._creationTime,
        updatedAt: project.updatedAt,
      };
    });

    // Calculate stats
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === "active" || p.status === "in_progress").length,
      completedProjects: projects.filter(p => p.status === "completed").length,
      pendingProjects: projects.filter(p => p.status === "pending_review" || p.status === "draft").length,
    };

    return {
      client: {
        _id: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        onboardingComplete: client.onboardingComplete,
        createdAt: client._creationTime,
        updatedAt: client.updatedAt,
      },
      projects: enrichedProjects,
      stats,
    };
  },
});

/**
 * DEV ONLY: Delete all quotations for testing.
 * Uses internal mutation (no auth required) - DO NOT USE IN PRODUCTION
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

/**
 * DEV ONLY: Permanently delete all soft-deleted projects.
 */
export const cleanupSoftDeletedProjects = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allProjects = await ctx.db.query("projects").collect();
    const softDeleted = allProjects.filter(p => p.deletedAt !== undefined);
    
    for (const project of softDeleted) {
      // Delete related folders
      const folders = await ctx.db
        .query("folders")
        .withIndex("by_projectId", q => q.eq("projectId", project._id))
        .collect();
      for (const folder of folders) {
        await ctx.db.delete(folder._id);
      }
      
      // Delete related assets
      const assets = await ctx.db
        .query("assets")
        .withIndex("by_projectId", q => q.eq("projectId", project._id))
        .collect();
      for (const asset of assets) {
        await ctx.db.delete(asset._id);
      }
      
      // Delete the project
      await ctx.db.delete(project._id);
    }
    
    return { deleted: softDeleted.length };
  },
});
