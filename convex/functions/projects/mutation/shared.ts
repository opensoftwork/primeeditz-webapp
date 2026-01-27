import { v, ConvexError } from 'convex/values'
import { mutation } from '../../../_generated/server'
import { authComponent } from '../../../auth'
import {
  authenticatedMutation,
} from '../../../lib/customFunctions'
import { now } from '../../../lib/helpers'

// ============================================================================
// Project Code Generation
// ============================================================================

/**
 * Generate a unique project code.
 * Format: PE-YYYYMM-XXX (XXX = sequential within month)
 */
async function generateProjectCode(
  db: {
    query: (table: 'projects') => {
      collect: () => Promise<{ code: string }[]>
    }
  }
): Promise<string> {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const prefix = `PE-${year}${month}`

  // Get all projects to find max code for this month
  const allProjects = await db.query('projects').collect()

  // Find max sequence number for this month
  let maxSeq = 0
  for (const project of allProjects) {
    if (project.code.startsWith(prefix)) {
      const parts = project.code.split('-')
      if (parts.length === 3) {
        const seq = parseInt(parts[2], 10)
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq
        }
      }
    }
  }

  const newSeq = String(maxSeq + 1).padStart(3, '0')
  return `${prefix}-${newSeq}`
}

/**
 * Create a new draft project.
 * Called when studio or admin starts the project request wizard.
 */
export const createDraft = mutation({
  args: {
    projectTypeId: v.optional(v.id('projectTypes')),
    studioId: v.optional(v.id('profiles')),
  },
  handler: async (ctx, args) => {
    // 1. Get authenticated user
    const authUser = await authComponent.getAuthUser(ctx)
    if (!authUser) {
      throw new ConvexError('Not authenticated')
    }

    // 2. Get profile
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', authUser._id))
      .first()

    if (!profile) {
      throw new ConvexError('Profile not found. Please complete onboarding.')
    }

    // Determine source
    const source = (profile.role === 'admin' || profile.role === 'employee')
      ? 'admin_init'
      : 'studio_request'

    // 3. Enforce "one draft" rule to prevent duplicates (especially in Strict Mode)
    // For admin, we find any admin_init draft (global for admin scope)
    // For studio, we find any draft for this specific studio
    if (source === 'admin_init') {
      const existingAdminDraft = await ctx.db
        .query('projects')
        .filter((q) =>
          q.and(
            q.eq(q.field('actionState'), 'draft'),
            q.eq(q.field('source'), 'admin_init')
          )
        )
        .first()

      if (existingAdminDraft) {
        return { projectId: existingAdminDraft._id, code: existingAdminDraft.code }
      }
    } else {
      const existingStudioDraft = await ctx.db
        .query('projects')
        .withIndex('by_studioId', (q) => q.eq('studioId', profile._id))
        .filter((q) => q.eq(q.field('actionState'), 'draft'))
        .first()

      if (existingStudioDraft) {
        return { projectId: existingStudioDraft._id, code: existingStudioDraft.code }
      }
    }

    const code = await generateProjectCode(ctx.db)

    // If no projectTypeId provided, we'll need a default or first one
    let projectTypeId = args.projectTypeId
    if (!projectTypeId) {
      // Get first active project type as default
      const defaultType = await ctx.db
        .query('projectTypes')
        .filter((q) => q.eq(q.field('isActive'), true))
        .first()

      if (defaultType) {
        projectTypeId = defaultType._id
      } else {
        throw new ConvexError('No active project types configured')
      }
    }

    // Determine studioId:
    // 1. If provided (admin mode), use it
    // 2. If not provided and caller is studio, use caller's profileId
    // 3. Otherwise null (internal project)
    let studioId = args.studioId
    if (!studioId && profile.role === 'studio') {
      studioId = profile._id
    }

    const projectId = await ctx.db.insert('projects', {
      code,
      projectTypeId,
      studioId,
      source,
      phase: 'setup',
      actionState: 'draft',
      awaitingActorRole: 'studio',
      lastStep: 1,
      storageUsed: 0,
      updatedAt: now(),
    })

    return { projectId, code }
  },
})

/**
 * Update a draft project.
 * Used by wizard to save progress on each step.
 */
export const updateDraft = authenticatedMutation({
  args: {
    projectId: v.id('projects'),
    studioId: v.optional(v.id('profiles')),
    // Step 1: Basic Info
    projectTypeId: v.optional(v.id('projectTypes')),
    endClientName: v.optional(v.string()),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    venue: v.optional(v.string()),
    // Step 2: Type-specific details
    typeSpecificDetails: v.optional(v.any()),
    // Step 3: Reference files (stored as IDs)
    referenceFiles: v.optional(
      v.array(
        v.object({
          fileId: v.string(),
          fileName: v.string(),
          fileSize: v.number(),
          fileType: v.string(),
          storageKey: v.optional(v.string()),
          previewUrl: v.optional(v.string()),
        })
      )
    ),
    // Step 4: Description
    description: v.optional(v.string()),
    additionalNotes: v.optional(v.string()),
    preferredDeliveryDate: v.optional(v.number()),
    lastStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { projectId, studioId: newStudioId, ...updates } = args

    // Get profile
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.authUser._id))
      .first()

    if (!profile) throw new ConvexError("Profile not found")

    // Get and verify project
    const project = await ctx.db.get(projectId)
    if (!project) {
      throw new ConvexError('Project not found')
    }

    // Verify ownership/permissions
    // Admin can update any draft
    // Studio can only update their own draft
    if (profile.role !== 'admin' && profile.role !== 'employee') {
      if (project.studioId !== profile._id) {
        throw new ConvexError('Access denied')
      }
    }

    // Only allow updates to drafts
    if (project.actionState !== 'draft') {
      throw new ConvexError('Cannot update a submitted project')
    }

    // Filter out undefined values
    const filteredUpdates: Record<string, unknown> = { updatedAt: now() }
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value
      }
    }

    // Handle studioId update (only for admins)
    if (newStudioId !== undefined && profile.role === 'admin') {
      filteredUpdates.studioId = newStudioId
    }

    await ctx.db.patch(projectId, filteredUpdates)

    return { success: true }
  },
})

/**
 * Submit a draft project for review.
 * Changes status from 'draft' to 'pending_review'.
 */
export const submitProject = authenticatedMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    // Get profile
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.authUser._id))
      .first()

    if (!profile) throw new ConvexError("Profile not found")

    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new ConvexError('Project not found')
    }

    // Verify ownership/permissions
    if (profile.role !== 'admin' && profile.role !== 'employee') {
      if (project.studioId !== profile._id) {
        throw new ConvexError('Access denied')
      }
    }

    // Only drafts can be submitted
    if (project.actionState !== 'draft') {
      throw new ConvexError('Project already submitted')
    }

    // Validate required fields
    if (!project.eventName) {
      throw new ConvexError('Event name is required')
    }

    await ctx.db.patch(args.projectId, {
      actionState: 'awaiting_quotation',
      awaitingActorRole: 'admin',
      updatedAt: now(),
    })

    // Record status change
    await ctx.db.insert('statusHistory', {
      projectId: args.projectId,
      previousPhase: 'setup',
      newPhase: 'setup',
      previousActionState: 'draft',
      newActionState: 'awaiting_quotation',
      previousAwaitingActorRole: 'studio',
      newAwaitingActorRole: 'admin',
      changedBy: profile._id,
      changedAt: now(),
      notes: 'Project request submitted',
    })

    return { success: true }
  },
})

/**
 * Delete a draft project.
 */
export const deleteDraft = authenticatedMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    // Get profile
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.authUser._id))
      .first()

    if (!profile) throw new ConvexError("Profile not found")

    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new ConvexError('Project not found')
    }

    // Verify ownership
    if (profile.role !== 'admin' && profile.role !== 'employee') {
      if (project.studioId !== profile._id) {
        throw new ConvexError('Access denied')
      }
    }

    // Only drafts can be deleted
    if (project.actionState !== 'draft') {
      throw new ConvexError('Cannot delete a submitted project')
    }

    await ctx.db.delete(args.projectId)

    return { success: true }
  },
})

/**
 * Update project onboarding data.
 * Used by wizard in 'onboarding' mode.
 */
export const updateOnboarding = authenticatedMutation({
  args: {
    projectId: v.id('projects'),
    // Step 3: Reference files
    referenceFiles: v.optional(
      v.array(
        v.object({
          fileId: v.string(),
          fileName: v.string(),
          fileSize: v.number(),
          fileType: v.string(),
          storageKey: v.optional(v.string()),
          previewUrl: v.optional(v.string()),
        })
      )
    ),
    // Step 4: Description
    description: v.optional(v.string()),
    additionalNotes: v.optional(v.string()),
    preferredDeliveryDate: v.optional(v.number()),
    lastStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { projectId, ...updates } = args

    // Get profile
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.authUser._id))
      .first()

    if (!profile) throw new ConvexError("Profile not found")

    // Get and verify project
    const project = await ctx.db.get(projectId)
    if (!project) throw new ConvexError('Project not found')

    // Verify ownership/permissions
    if (profile.role !== 'admin' && profile.role !== 'employee') {
      if (project.studioId !== profile._id) throw new ConvexError('Access denied')
    }

    // Only allow in onboarding phase
    if (project.actionState !== 'awaiting_uploads') {
      throw new ConvexError('Project is not in onboarding phase')
    }

    // Filter out undefined values
    const filteredUpdates: Record<string, unknown> = { updatedAt: now() }
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value
      }
    }

    await ctx.db.patch(projectId, filteredUpdates)

    return { success: true }
  },
})

/**
 * Finalize project onboarding.
 * Moves project from 'awaiting_uploads' to 'uploads_complete'.
 */
export const completeOnboarding = authenticatedMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    // Get profile
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.authUser._id))
      .first()

    if (!profile) throw new ConvexError("Profile not found")

    const project = await ctx.db.get(args.projectId)
    if (!project) throw new ConvexError('Project not found')

    // Verify ownership/permissions
    if (profile.role !== 'admin' && profile.role !== 'employee') {
      if (project.studioId !== profile._id) throw new ConvexError('Access denied')
    }

    // Only allow finalizing if in awaiting_uploads
    if (project.actionState !== 'awaiting_uploads') {
      throw new ConvexError('Project is not in onboarding phase')
    }

    await ctx.db.patch(args.projectId, {
      actionState: 'uploads_complete',
      awaitingActorRole: 'admin',
      updatedAt: now(),
    })

    // Record status change
    await ctx.db.insert('statusHistory', {
      projectId: args.projectId,
      previousPhase: project.phase,
      newPhase: project.phase, // Stays in current phase (usually 'onboarding' or 'setup')
      previousActionState: 'awaiting_uploads',
      newActionState: 'uploads_complete',
      previousAwaitingActorRole: 'studio',
      newAwaitingActorRole: 'admin',
      changedBy: profile._id,
      changedAt: now(),
      notes: 'Project onboarding completed by studio',
    })

    return { success: true }
  },
})
