import { v } from "convex/values";
import { adminQuery } from "../../lib/customFunctions";
import { Doc, Id } from "../../_generated/dataModel";

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
 * Get clients for selection optimized for drawers.
 */
export const getClientsForSelection = adminQuery({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const searchTerm = args.search?.toLowerCase().trim();

    let clients = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "client"))
      .order("desc")
      .collect();

    if (searchTerm && searchTerm.length > 0) {
      clients = clients.filter((client) => {
        const name = client.name?.toLowerCase() ?? "";
        const email = client.email?.toLowerCase() ?? "";
        const company = client.company?.toLowerCase() ?? "";
        return name.includes(searchTerm) || email.includes(searchTerm) || company.includes(searchTerm);
      });
    }

    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
          .collect();

        const projectCount = projects.length;
        const activeCount = projects.filter((p) => p.phase !== 'completed' && p.phase !== 'archived' && p.actionState !== 'draft' && p.actionState !== 'cancelled').length;
        const lastProjectActivity = projects.length > 0 ? Math.max(...projects.map((p) => p.updatedAt)) : null;
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

    enrichedClients.sort((a, b) => (b.lastActivityDate ?? 0) - (a.lastActivityDate ?? 0));
    return {
      clients: enrichedClients.slice(0, limit),
      hasMore: enrichedClients.length > limit,
      totalCount: enrichedClients.length,
    };
  },
});

/**
 * Get clients with at least one project.
 */
export const getClientsWithProjects = adminQuery({
  args: {},
  handler: async (ctx) => {
    const allClients = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "client"))
      .collect();

    const clientsWithProjects = await Promise.all(
      allClients.map(async (client) => {
        const project = await ctx.db.query("projects").withIndex("by_clientId", (q) => q.eq("clientId", client._id)).first();
        return project ? client : null;
      })
    );
    return clientsWithProjects.filter((c): c is Doc<"profiles"> => c !== null);
  },
});

/**
 * Get simple list of projects for a client.
 */
export const getAdminProjectsSimple = adminQuery({
  args: { clientId: v.optional(v.id("profiles")) },
  handler: async (ctx, args) => {
    const projects = args.clientId
      ? await ctx.db.query("projects").withIndex("by_clientId", (q) => q.eq("clientId", args.clientId!)).collect()
      : await ctx.db.query("projects").order("desc").collect();

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
 * Get a single client with their projects and stats.
 */
export const getClientWithProjects = adminQuery({
  args: { clientId: v.id("profiles") },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client || client.role !== "client") return null;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();

    const projectTypes = await ctx.db.query("projectTypes").collect();
    const projectTypeMap = new Map(projectTypes.map((pt) => [pt._id, pt]));

    const enrichedProjects = projects.map((project) => ({
      _id: project._id,
      code: project.code,
      phase: project.phase,
      actionState: project.actionState,
      status: project.actionState, // Compatibility
      projectTypeName: projectTypeMap.get(project.projectTypeId)?.name ?? "Unknown",
      eventName: project.eventName,
      eventDate: project.eventDate,
      venue: project.venue,
      description: project.description,
      createdAt: project._creationTime,
      updatedAt: project.updatedAt,
    }));

    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => !['completed', 'archived'].includes(p.phase) && p.actionState !== 'draft').length,
      completedProjects: projects.filter(p => p.phase === "completed").length,
      pendingProjects: projects.filter(p => p.actionState === "awaiting_quotation").length,
    };

    return { client, projects: enrichedProjects, stats };
  },
});
