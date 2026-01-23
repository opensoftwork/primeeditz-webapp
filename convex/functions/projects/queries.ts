/**
 * Project Queries
 *
 * Read operations for projects with role-based access.
 * Uses clientQuery for client-owned project access.
 */

import { v, ConvexError } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { query } from '../../_generated/server'
import {
  clientQuery,
  adminQuery,
  staffQuery,
  authenticatedWithProfileQuery,
} from '../../lib/customFunctions'
import { enrichReferenceFilesWithUrls } from '../../lib/storageUtils'
import { checkUploadEligibility } from '../../lib/uploadGate'
import type { Doc } from '../../_generated/dataModel'
import { projectPhaseValidator, projectActionStateValidator } from '../../schema'

// ============================================================================
// Client Queries
// ============================================================================

/**
 * Get all projects for the current client.
 * Excludes drafts - only shows submitted projects.
 */
export const getMyProjects = clientQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_clientId', (q) => q.eq('clientId', ctx.profile._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .collect()

    return projects
  },
})

/**
 * Get a draft project for the current client.
 * Used by the wizard to resume a draft.
 */
export const getDraft = clientQuery({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new ConvexError('Project not found')
    }

    // Verify ownership
    if (project.clientId !== ctx.profile._id) {
      throw new ConvexError('Access denied')
    }

    // Only return if it's a draft
    if (project.actionState !== 'draft') {
      throw new ConvexError('Project is not a draft')
    }

    return project
  },
})

/**
 * Get the current active draft project for the current client.
 * Used to resume a draft without knowing its ID.
 */
export const getMyActiveDraft = clientQuery({
  args: {},
  handler: async (ctx) => {
    const draft = await ctx.db
      .query('projects')
      .withIndex('by_clientId', (q) => q.eq('clientId', ctx.profile._id))
      .filter((q) => q.eq(q.field('actionState'), 'draft'))
      .first()

    return draft
  },
})

/**
 * Get a single project by ID.
 * Verifies ownership for clients.
 * Enriches reference files with proper MinIO public URLs.
 */
export const getProject = clientQuery({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new ConvexError('Project not found')
    }

    // Verify ownership
    if (project.clientId !== ctx.profile._id) {
      throw new ConvexError('Access denied')
    }

    // Enrich with project type
    const projectType = await ctx.db.get(project.projectTypeId)

    // Enrich reference files with proper URLs
    const enrichedFiles = enrichReferenceFilesWithUrls(project.referenceFiles)

    // Enrich with upload eligibility
    const uploadEligibility = await checkUploadEligibility(ctx, args.projectId);

    return {
      ...project,
      projectTypeName: projectType?.name ?? 'Unknown',
      referenceFiles: enrichedFiles,
      uploadEligibility,
    }
  },
})

/**
 * Internal query for upload eligibility check.
 * Used by storage actions to verify permissions with user context.
 */
export const getProjectUploadEligibility = authenticatedWithProfileQuery({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) {
      return { isAllowed: false, reason: "Project not found", canOverride: false };
    }
    
    // Use the upload gate logic directly
    return await checkUploadEligibility(ctx, args.projectId);
  },
})

/**
 * Get projects for the current client with their project type and category info.
 * Returns enriched project data for dashboard display.
 */
export const getMyProjectsWithType = clientQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_clientId', (q) => q.eq('clientId', ctx.profile._id))
      .filter((q) => 
          q.eq(q.field('deletedAt'), undefined)
      )
      .order('desc')
      .collect()

    // Enrich with project type and category
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const projectType = await ctx.db.get(project.projectTypeId)
        let categoryName = 'Other'
        const pt = projectType as Doc<"projectTypes"> | null;
        if (pt && pt.categoryId) {
          const category = await ctx.db.get(pt.categoryId)
          categoryName = (category as any)?.name || 'Other'
        }
        return {
          ...project,
          projectTypeName: projectType?.name ?? 'Unknown',
          projectTypeCategory: categoryName,
          createdAt: project._creationTime,
        }
      })
    )

    return enriched
  },
})

/**
 * Get all projects for the current client with cursor-based pagination.
 * Compatible with useSimplePaginatedQuery for infinite scroll or page navigation.
 */
export const getClientProjectsPaginated = clientQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    phase: v.optional(projectPhaseValidator),
    actionState: v.optional(projectActionStateValidator),
    projectTypeId: v.optional(v.id("projectTypes")),
  },
  handler: async (ctx, args) => {
    // Execute pagination - conditionally use index for status filtering
    // Clients only see their own projects and non-draft projects
    let query = ctx.db
      .query("projects")
      .withIndex("by_clientId", (q) => q.eq("clientId", ctx.profile._id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined));

    if (args.phase) {
      query = query.filter((q) => q.eq(q.field("phase"), args.phase!));
    }
    
    if (args.actionState) {
      query = query.filter((q) => q.eq(q.field("actionState"), args.actionState!));
    }

    const results = await query.order("desc").paginate(args.paginationOpts);

    // Get all project types for enrichment
    const projectTypes: Doc<"projectTypes">[] = await ctx.db.query("projectTypes").collect();
    const projectTypeMap = new Map(
      projectTypes.map((pt) => [pt._id, pt])
    );

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
 * Get all project types for filter dropdown (Client View).
 */
export const getProjectTypes = clientQuery({
  args: {},
  handler: async (ctx) => {
    const projectTypes = await ctx.db.query("projectTypes").collect();
    const enriched = await Promise.all(
      projectTypes.map(async (pt) => {
        const category = pt.categoryId ? await ctx.db.get(pt.categoryId) : null;
        return {
          _id: pt._id,
          name: pt.name,
          categoryName: (category as any)?.name || 'Uncategorized',
          isActive: pt.isActive,
        };
      })
    )
    return enriched.filter(pt => pt.isActive);
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
      .query('projects')
      .filter((q) =>
        q.and(
          q.eq(q.field('actionState'), 'draft'),
          q.eq(q.field('source'), 'admin_init')
        )
      )
      .first()

    if (!draft) {
      return null
    }

    // Enrich with project type name
    const projectType = await ctx.db.get(draft.projectTypeId)

    // Get client info if exists
    const client = draft.clientId ? await ctx.db.get(draft.clientId) : null

    return {
      ...draft,
      projectTypeName: projectType?.name ?? 'Unknown',
      clientName: client?.name ?? null,
    }
  },
})

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
      query = ctx.db.query('projects').withIndex('by_phase', (q) => q.eq('phase', args.phase!));
    } else if (args.actionState) {
      query = ctx.db.query('projects').withIndex('by_actionState', (q) => q.eq('actionState', args.actionState!));
    } else {
      query = ctx.db.query('projects');
    }

    const projects = await query.order('desc').collect();

    // Enrich with client and project type info
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const [client, projectType] = await Promise.all([
          project.clientId ? ctx.db.get(project.clientId) : null,
          ctx.db.get(project.projectTypeId),
        ])
        return {
          ...project,
          clientName: client?.name ?? 'Unknown',
          projectTypeName: projectType?.name ?? 'Unknown',
        }
      })
    )

    return enriched
  },
})

/**
 * Get pending review projects (admin dashboard).
 */
export const getPendingProjects = adminQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_actionState', (q) => q.eq('actionState', 'awaiting_quotation'))
      .order('desc')
      .collect()

    // Enrich with client info (clientId is optional for admin-initiated projects)
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const client = project.clientId
          ? await ctx.db.get(project.clientId)
          : null
        return {
          ...project,
          clientName: client?.name ?? 'Unknown',
        }
      })
    )

    return enriched
  },
})

// ============================================================================
// Internal Queries
// ============================================================================

/**
 * Get a project by ID without role-based access checks.
 * FOR INTERNAL USE BY ACTIONS ONLY.
 */
export const internalGetProject = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId)
  },
})
