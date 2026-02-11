/**
 * Project Queries
 *
 * Read operations for projects with role-based access.
 * Uses studioQuery for studio-owned project access.
 */

import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import {
  adminQuery,
  authenticatedWithProfileQuery,
  staffQuery,
  studioQuery,
} from "../../lib/customFunctions";
import { enrichReferenceFilesWithUrls } from "../../lib/storageUtils";
import { checkUploadEligibility } from "../../lib/uploadGate";
import {
  projectActionStateValidator,
  projectPhaseValidator,
} from "../../schema";

// ============================================================================
// Studio Queries
// ============================================================================

/**
 * Get all projects for the current studio.
 * Excludes drafts - only shows submitted projects.
 */
export const getMyProjects = studioQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_studioId", (q) => q.eq("studioId", ctx.profile._id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();

    return projects;
  },
});

/**
 * Get a draft project for the current studio.
 * Used by the wizard to resume a draft.
 */
export const getDraft = studioQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new ConvexError("Project not found");
    }

    // Verify ownership
    if (project.studioId !== ctx.profile._id) {
      throw new ConvexError("Access denied");
    }

    // Only return if it's a draft
    if (project.actionState !== "draft") {
      throw new ConvexError("Project is not a draft");
    }

    return project;
  },
});

/**
 * Get the current active draft project for the current studio.
 * Used to resume a draft without knowing its ID.
 */
export const getMyActiveDraft = studioQuery({
  args: {},
  handler: async (ctx) => {
    const draft = await ctx.db
      .query("projects")
      .withIndex("by_studioId", (q) => q.eq("studioId", ctx.profile._id))
      .filter((q) => q.eq(q.field("actionState"), "draft"))
      .first();

    return draft;
  },
});

/**
 * Get a single project by ID.
 * Verifies ownership for studios.
 * Enriches reference files with proper MinIO public URLs.
 */
export const getProject = authenticatedWithProfileQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new ConvexError("Project not found");
    }

    // Verify access based on role
    if (ctx.profile.role === "studio") {
      // Studios can only see their own projects
      if (project.studioId !== ctx.profile._id) {
        throw new ConvexError("Access denied");
      }
    } else if (
      ctx.profile.role !== "admin" &&
      ctx.profile.role !== "employee"
    ) {
      // Unknown role
      throw new ConvexError("Access denied");
    }
    // Admins and Employees can view all projects

    // Enrich with project type
    const projectType = await ctx.db.get(project.projectTypeId);

    // Enrich reference files with proper URLs
    const enrichedFiles = enrichReferenceFilesWithUrls(project.referenceFiles);

    // Enrich with upload eligibility
    const uploadEligibility = await checkUploadEligibility(ctx, args.projectId);

    return {
      ...project,
      projectTypeName: projectType?.name ?? "Unknown",
      referenceFiles: enrichedFiles,
      uploadEligibility,
    };
  },
});

/**
 * Internal query for upload eligibility check.
 * Used by storage actions to verify permissions with user context.
 */
export const getProjectUploadEligibility = authenticatedWithProfileQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return {
        isAllowed: false,
        reason: "Project not found",
        canOverride: false,
      };
    }

    // Use the upload gate logic directly
    return await checkUploadEligibility(ctx, args.projectId);
  },
});

/**
 * Get projects for the current studio grouped by end studio name.
 * Used for the revamped studio dashboard (Story 11C.3).
 */
export const getMyProjectsGroupedByEndClient = studioQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_studioId", (q) => q.eq("studioId", ctx.profile._id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();

    // Map to group projects
    const groups: Record<string, any[]> = {};

    for (const project of projects) {
      const endClient = project.endClientName || "Direct Engagements";
      if (!groups[endClient]) {
        groups[endClient] = [];
      }

      const projectType = await ctx.db.get(project.projectTypeId);
      groups[endClient].push({
        ...project,
        projectTypeName: projectType?.name ?? "Unknown",
        createdAt: project._creationTime,
      });
    }

    // Convert to sorted array of groups
    return Object.entries(groups)
      .map(([name, projects]) => ({
        name,
        projects,
        count: projects.length,
        lastUpdated: Math.max(...projects.map((p) => p.updatedAt)),
      }))
      .sort((a, b) => b.lastUpdated - a.lastUpdated);
  },
});

/**
 * Get projects for the current studio with their project type and category info.
 * Returns enriched project data for dashboard display.
 */
export const getMyProjectsWithType = studioQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_studioId", (q) => q.eq("studioId", ctx.profile._id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();

    // Enrich with project type and category
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const projectType = await ctx.db.get(project.projectTypeId);
        let categoryName = "Other";
        const pt = projectType as Doc<"projectTypes"> | null;
        if (pt && pt.categoryId) {
          const category = await ctx.db.get(pt.categoryId);
          categoryName = (category as any)?.name || "Other";
        }
        return {
          ...project,
          projectTypeName: projectType?.name ?? "Unknown",
          projectTypeCategory: categoryName,
          createdAt: project._creationTime,
        };
      }),
    );

    return enriched;
  },
});

/**
 * Get all projects for the current studio with cursor-based pagination.
 * Compatible with useSimplePaginatedQuery for infinite scroll or page navigation.
 */
export const getStudioProjectsPaginated = studioQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    phase: v.optional(projectPhaseValidator),
    actionState: v.optional(projectActionStateValidator),
    projectTypeId: v.optional(v.id("projectTypes")),
  },
  handler: async (ctx, args) => {
    // Execute pagination - conditionally use index for status filtering
    // Studios only see their own projects and non-draft projects
    let query = ctx.db
      .query("projects")
      .withIndex("by_studioId", (q) => q.eq("studioId", ctx.profile._id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined));

    if (args.phase) {
      query = query.filter((q) => q.eq(q.field("phase"), args.phase!));
    }

    if (args.actionState) {
      query = query.filter((q) =>
        q.eq(q.field("actionState"), args.actionState!),
      );
    }

    const results = await query.order("desc").paginate(args.paginationOpts);

    // Get all project types for enrichment
    const projectTypes: Doc<"projectTypes">[] = await ctx.db
      .query("projectTypes")
      .collect();
    const projectTypeMap = new Map(projectTypes.map((pt) => [pt._id, pt]));

    // Filter by projectTypeId in memory and enrich
    const enrichedPage = results.page
      .filter(
        (p) => !args.projectTypeId || p.projectTypeId === args.projectTypeId,
      )
      .map((project) => {
        const projectType = projectTypeMap.get(project.projectTypeId);

        return {
          _id: project._id,
          code: project.code,
          phase: project.phase,
          actionState: project.actionState,
          source: project.source,
          awaitingActorRole: project.awaitingActorRole,
          projectTypeName: projectType?.name ?? "Unknown",
          eventName: project.endClientName,
          eventDate: project.preferredDeliveryDate,
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
 * Get all project types for filter dropdown (Studio View).
 */
export const getProjectTypes = studioQuery({
  args: {},
  handler: async (ctx) => {
    const projectTypes = await ctx.db.query("projectTypes").collect();
    const enriched = await Promise.all(
      projectTypes.map(async (pt) => {
        const category = pt.categoryId ? await ctx.db.get(pt.categoryId) : null;
        return {
          _id: pt._id,
          name: pt.name,
          categoryName: (category as any)?.name || "Uncategorized",
          isActive: pt.isActive,
        };
      }),
    );
    return enriched.filter((pt) => pt.isActive);
  },
});

// ============================================================================
// Admin Queries
// ============================================================================

/**
 * Get the current active draft project for admin.
 * Used to enforce "one draft at a time" rule for admin-initiated projects.
 */
export const getAdminActiveDraft = adminQuery({
  args: {},
  handler: async (ctx) => {
    // Find any draft project created by admin (source: admin_init)
    const draft = await ctx.db
      .query("projects")
      .filter((q) =>
        q.and(
          q.eq(q.field("actionState"), "draft"),
          q.eq(q.field("source"), "admin_init"),
        ),
      )
      .first();

    if (!draft) {
      return null;
    }

    // Enrich with project type name
    const projectType = await ctx.db.get(draft.projectTypeId);

    // Get studio info if exists
    const studio = draft.studioId ? await ctx.db.get(draft.studioId) : null;

    return {
      ...draft,
      projectTypeName: projectType?.name ?? "Unknown",
      studioName: studio?.name ?? null,
    };
  },
});

/**
 * Get all projects (admin view).
 */
export const getAllProjects = adminQuery({
  args: {
    phase: v.optional(projectPhaseValidator),
    actionState: v.optional(projectActionStateValidator),
  },
  handler: async (ctx, args) => {
    let query;

    if (args.phase) {
      query = ctx.db
        .query("projects")
        .withIndex("by_phase", (q) => q.eq("phase", args.phase!));
    } else if (args.actionState) {
      query = ctx.db
        .query("projects")
        .withIndex("by_actionState", (q) =>
          q.eq("actionState", args.actionState!),
        );
    } else {
      query = ctx.db.query("projects");
    }

    const projects = await query.order("desc").collect();

    // Enrich with studio and project type info
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const [studio, projectType] = await Promise.all([
          project.studioId ? ctx.db.get(project.studioId) : null,
          ctx.db.get(project.projectTypeId),
        ]);
        return {
          ...project,
          studioName: studio?.name ?? "Unknown",
          projectTypeName: projectType?.name ?? "Unknown",
        };
      }),
    );

    return enriched;
  },
});

/**
 * Get pending review projects (admin dashboard).
 */
export const getPendingProjects = adminQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_actionState", (q) =>
        q.eq("actionState", "awaiting_quotation"),
      )
      .order("desc")
      .collect();

    // Enrich with studio info (studioId is optional for admin-initiated projects)
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const studio = project.studioId
          ? await ctx.db.get(project.studioId)
          : null;
        return {
          ...project,
          studioName: studio?.name ?? "Unknown",
        };
      }),
    );

    return enriched;
  },
});

// ============================================================================
// Shared Queries (Admin & Studio/Studio)
// ============================================================================

/**
 * Get all projects spawned from a specific quotation.
 * Returns enriched data with project type names.
 */
export const getByQuotationId = authenticatedWithProfileQuery({
  args: { quotationId: v.id("quotations") },
  handler: async (ctx, args) => {
    // 1. Fetch the quotation to check permissions
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return [];

    // 2. Permission check: Admin can see everything,
    // Studios/Studios only see their own quotations
    if (
      ctx.profile.role !== "admin" &&
      quotation.studioId !== ctx.profile._id
    ) {
      return [];
    }

    // 3. Fetch projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_quotationId", (q) => q.eq("quotationId", args.quotationId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // 4. Enrich with project type info
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const projectType = await ctx.db.get(project.projectTypeId);
        return {
          ...project,
          projectTypeName: projectType?.name || "Unknown",
        };
      }),
    );

    return enriched;
  },
});

// ============================================================================
// Internal Queries
// ============================================================================

/**
 * Get a project by ID without role-based access checks.
 * FOR INTERNAL USE BY ACTIONS ONLY.
 */
export const internalGetProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});
