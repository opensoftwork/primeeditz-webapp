import { v } from "convex/values";
import { type Doc, Id } from "../../_generated/dataModel";
import { adminQuery } from "../../lib/customFunctions";

/**
 * Get all clients for selection.
 */
export const getStudios = adminQuery({
  args: {
    includeDeactivated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const studios = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "studio"))
      .collect();

    if (args.includeDeactivated) {
      return studios;
    }

    return studios.filter((s) => s.deactivatedAt === undefined);
  },
});

/**
 * Get clients for selection optimized for drawers.
 */
export const getStudiosForSelection = adminQuery({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const searchTerm = args.search?.toLowerCase().trim();

    let clients = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "studio"))
      .order("desc")
      .collect();

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

    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_studioId", (q) => q.eq("studioId", client._id))
          .collect();

        const projectCount = projects.length;
        const activeCount = projects.filter(
          (p) =>
            p.phase !== "completed" &&
            p.phase !== "archived" &&
            p.actionState !== "draft" &&
            p.actionState !== "cancelled",
        ).length;
        const lastProjectActivity =
          projects.length > 0
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
      }),
    );

    enrichedClients.sort(
      (a, b) => (b.lastActivityDate ?? 0) - (a.lastActivityDate ?? 0),
    );
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
export const getStudiosWithProjects = adminQuery({
  args: {},
  handler: async (ctx) => {
    const allClients = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "studio"))
      .collect();

    const clientsWithProjects = await Promise.all(
      allClients.map(async (client) => {
        const project = await ctx.db
          .query("projects")
          .withIndex("by_studioId", (q) => q.eq("studioId", client._id))
          .first();
        return project ? client : null;
      }),
    );
    return clientsWithProjects.filter((c): c is Doc<"profiles"> => c !== null);
  },
});

/**
 * Get simple list of projects for a client.
 */
export const getAdminProjectsSimple = adminQuery({
  args: { studioId: v.optional(v.id("profiles")) },
  handler: async (ctx, args) => {
    let projects = args.studioId
      ? await ctx.db
          .query("projects")
          .withIndex("by_studioId", (q) => q.eq("studioId", args.studioId!))
          .collect()
      : await ctx.db.query("projects").order("desc").collect();

    // Filter out projects that already have an approved quotation or are past the setup/quotation phase
    const allowedStates = [
      "draft",
      "awaiting_quotation",
      "quotation_sent",
      "quotation_rejected",
    ];
    projects = projects.filter(
      (p) => allowedStates.includes(p.actionState) && !p.deletedAt,
    );

    return Promise.all(
      projects.map(async (p) => {
        const type = await ctx.db.get(p.projectTypeId);
        return {
          _id: p._id,
          code: p.code,
          eventName: p.endClientName,
          projectTypeName: type?.name ?? "Unknown",
        };
      }),
    );
  },
});

/**
 * Get a single client with their projects and stats.
 */
export const getStudioWithProjects = adminQuery({
  args: { studioId: v.id("profiles") },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.studioId);
    if (!client || client.role !== "studio") return null;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_studioId", (q) => q.eq("studioId", args.studioId))
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
      projectTypeName:
        projectTypeMap.get(project.projectTypeId)?.name ?? "Unknown",
      eventName: project.endClientName,
      eventDate: project.preferredDeliveryDate,
      venue: project.venue,
      description: project.description,
      createdAt: project._creationTime,
      updatedAt: project.updatedAt,
    }));

    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(
        (p) =>
          !["completed", "archived"].includes(p.phase) &&
          p.actionState !== "draft",
      ).length,
      completedProjects: projects.filter((p) => p.phase === "completed").length,
      pendingProjects: projects.filter(
        (p) => p.actionState === "awaiting_quotation",
      ).length,
    };

    return { client, projects: enrichedProjects, stats };
  },
});
