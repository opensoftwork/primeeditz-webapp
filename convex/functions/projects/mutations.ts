/**
 * Project Mutations
 *
 * Write operations for projects with role-based access.
 */

import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { authComponent } from '../../auth'
import {
  clientMutation,
  adminMutation,
  authenticatedMutation,
  staffMutation,
} from '../../lib/customFunctions'
import { now } from '../../lib/helpers'

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

// ============================================================================
// Shared Project Mutations (Client & Admin)
// ============================================================================

/**
 * Create a new draft project.
 * Called when client or admin starts the project request wizard.
 */
export const createDraft = mutation({
  args: {
    projectTypeId: v.optional(v.id('projectTypes')),
    clientId: v.optional(v.id('profiles')),
  },
  handler: async (ctx, args) => {
    // 1. Get authenticated user
    const authUser = await authComponent.getAuthUser(ctx)
    if (!authUser) {
      throw new Error('Not authenticated')
    }

    // 2. Get profile
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', authUser._id))
      .first()

    if (!profile) {
      throw new Error('Profile not found. Please complete onboarding.')
    }

    // Determine source
    const source = (profile.role === 'admin' || profile.role === 'employee')
      ? 'admin_init'
      : 'client_request'

    // 3. Enforce "one draft" rule to prevent duplicates (especially in Strict Mode)
    // For admin, we find any admin_init draft (global for admin scope)
    // For client, we find any draft for this specific client
    if (source === 'admin_init') {
      const existingAdminDraft = await ctx.db
        .query('projects')
        .filter((q) =>
          q.and(
            q.eq(q.field('status'), 'draft'),
            q.eq(q.field('source'), 'admin_init')
          )
        )
        .first()

      if (existingAdminDraft) {
        return { projectId: existingAdminDraft._id, code: existingAdminDraft.code }
      }
    } else {
      const existingClientDraft = await ctx.db
        .query('projects')
        .withIndex('by_clientId', (q) => q.eq('clientId', profile._id))
        .filter((q) => q.eq(q.field('status'), 'draft'))
        .first()

      if (existingClientDraft) {
        return { projectId: existingClientDraft._id, code: existingClientDraft.code }
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
        throw new Error('No active project types configured')
      }
    }

    // Determine clientId:
    // 1. If provided (admin mode), use it
    // 2. If not provided and caller is client, use caller's profileId
    // 3. Otherwise null (internal project)
    let clientId = args.clientId
    if (!clientId && profile.role === 'client') {
      clientId = profile._id
    }

    const projectId = await ctx.db.insert('projects', {
      code,
      projectTypeId,
      clientId,
      source,
      status: 'draft',
      lastStep: 1,
      storageUsed: 0,
      updatedAt: now(),
    })

    return { projectId, code }
  },
})

// I need to make these accessible to both clients and admins. 
// I'll define a 'staffOrClientMutation' or just use authenticatedMutation and check.
// Looking at customFunctions.ts, there isn't a staffOrClientMutation.
// I'll use authenticatedMutation and manually verify projects.

/**
 * Update a draft project.
 * Used by wizard to save progress on each step.
 */
export const updateDraft = authenticatedMutation({
  args: {
    projectId: v.id('projects'),
    clientId: v.optional(v.id('profiles')),
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
    const { projectId, clientId: newClientId, ...updates } = args

    // Get profile
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.authUser._id))
      .first()

    if (!profile) throw new Error("Profile not found")

    // Get and verify project
    const project = await ctx.db.get(projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    // Verify ownership/permissions
    // Admin can update any draft
    // Client can only update their own draft
    if (profile.role !== 'admin' && profile.role !== 'employee') {
      if (project.clientId !== profile._id) {
        throw new Error('Access denied')
      }
    }

    // Only allow updates to drafts
    if (project.status !== 'draft') {
      throw new Error('Cannot update a submitted project')
    }

    // Filter out undefined values
    const filteredUpdates: Record<string, unknown> = { updatedAt: now() }
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value
      }
    }

    // Handle clientId update (only for admins)
    if (newClientId !== undefined && profile.role === 'admin') {
      filteredUpdates.clientId = newClientId
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

    if (!profile) throw new Error("Profile not found")

    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    // Verify ownership/permissions
    if (profile.role !== 'admin' && profile.role !== 'employee') {
      if (project.clientId !== profile._id) {
        throw new Error('Access denied')
      }
    }

    // Only drafts can be submitted
    if (project.status !== 'draft') {
      throw new Error('Project already submitted')
    }

    // Validate required fields
    if (!project.eventName) {
      throw new Error('Event name is required')
    }

    await ctx.db.patch(args.projectId, {
      status: 'pending_review',
      updatedAt: now(),
    })

    // Record status change
    await ctx.db.insert('statusHistory', {
      projectId: args.projectId,
      previousStatus: 'draft',
      newStatus: 'pending_review',
      changedBy: profile._id,
      changedAt: now(),
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

    if (!profile) throw new Error("Profile not found")

    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    // Verify ownership
    if (profile.role !== 'admin' && profile.role !== 'employee') {
      if (project.clientId !== profile._id) {
        throw new Error('Access denied')
      }
    }

    // Only drafts can be deleted
    if (project.status !== 'draft') {
      throw new Error('Cannot delete a submitted project')
    }

    await ctx.db.delete(args.projectId)

    return { success: true }
  },
})

// ============================================================================
// Admin Mutations
// ============================================================================

/**
 * Update project status (admin only).
 */
export const updateStatus = adminMutation({
  args: {
    projectId: v.id('projects'),
    status: v.union(
      v.literal('pending_review'),
      v.literal('active'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('archived')
    ),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    const previousStatus = project.status

    await ctx.db.patch(args.projectId, {
      status: args.status,
      updatedAt: now(),
    })

    // Record status change
    await ctx.db.insert('statusHistory', {
      projectId: args.projectId,
      previousStatus,
      newStatus: args.status,
      changedBy: ctx.profile._id,
      changedAt: now(),
    })

    return { success: true }
  },
})

/**
 * Assign employee to project (admin only).
 */
export const assignEmployee = adminMutation({
  args: {
    projectId: v.id('projects'),
    employeeId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    // Verify employee exists and has employee role
    const employee = await ctx.db.get(args.employeeId)
    if (!employee || employee.role !== 'employee') {
      throw new Error('Invalid employee')
    }

    await ctx.db.patch(args.projectId, {
      assignedEmployeeId: args.employeeId,
      updatedAt: now(),
    })

    return { success: true }
  },
})

/**
 * Archive a project (admin only).
 * Sets the project status to 'archived' - data is preserved but not accessible.
 */
export const archiveProject = adminMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    // Cannot archive already archived projects
    if (project.status === 'archived') {
      throw new Error('Project is already archived')
    }

    const previousStatus = project.status

    await ctx.db.patch(args.projectId, {
      status: 'archived',
      archivedAt: now(),
      archivedBy: ctx.profile._id,
      updatedAt: now(),
    })

    // Record status change
    await ctx.db.insert('statusHistory', {
      projectId: args.projectId,
      previousStatus,
      newStatus: 'archived',
      changedBy: ctx.profile._id,
      changedAt: now(),
    })

    return { success: true }
  },
})

/**
 * Unarchive a project (admin only).
 * Restores an archived project to 'active' status.
 */
export const unarchiveProject = adminMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    // Can only unarchive archived projects
    if (project.status !== 'archived') {
      throw new Error('Project is not archived')
    }

    await ctx.db.patch(args.projectId, {
      status: 'active',
      archivedAt: undefined,
      archivedBy: undefined,
      updatedAt: now(),
    })

    // Record status change
    await ctx.db.insert('statusHistory', {
      projectId: args.projectId,
      previousStatus: 'archived',
      newStatus: 'active',
      changedBy: ctx.profile._id,
      changedAt: now(),
    })

    return { success: true }
  },
})

/**
 * Soft delete a project (move to trash).
 * Sets deletedAt and deletedBy, making it invisible to standard queries.
 */
export const softDeleteProject = adminMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    if (project.deletedAt) {
      throw new Error('Project is already in trash')
    }

    const previousStatus = project.status

    await ctx.db.patch(args.projectId, {
      deletedAt: now(),
      deletedBy: ctx.profile._id,
      updatedAt: now(),
    })

    // Record status change (optional but good for audit)
    await ctx.db.insert('statusHistory', {
      projectId: args.projectId,
      previousStatus,
      newStatus: 'deleted' as any, // Not a formal status, but useful for history
      changedBy: ctx.profile._id,
      changedAt: now(),
    })

    return { success: true }
  },
})

/**
 * Restore a soft-deleted project from trash.
 */
export const restoreProject = adminMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    if (!project.deletedAt) {
      throw new Error('Project is not in trash')
    }

    await ctx.db.patch(args.projectId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now(),
    })

    // Record status change
    await ctx.db.insert('statusHistory', {
      projectId: args.projectId,
      previousStatus: 'deleted' as any,
      newStatus: project.status,
      changedBy: ctx.profile._id,
      changedAt: now(),
    })

    return { success: true }
  },
})

/**
 * Permanently delete a project (admin only).
 * This removes the project and all related data, and unlinks quotations.
 */
export const permanentlyDeleteProject = adminMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    // 1. Unlink quotations (Story C-1 Requirement D)
    // NEVER cascade delete quotations (financial records)
    const quotations = await ctx.db
      .query('quotations')
      .withIndex('by_clientId', (q) => q.eq('clientId', project.clientId as string))
      .collect()

    for (const quotation of quotations) {
      const projectIdString = args.projectId as string
      const projectIds = quotation.projectIds || []
      
      if (quotation.projectId === projectIdString || projectIds.includes(projectIdString)) {
        const updatedProjectIds = projectIds.filter(id => id !== projectIdString)
        const note = `Project ${project.code} deleted on ${new Date().toISOString()}`
        
        await ctx.db.patch(quotation._id, {
          projectIds: updatedProjectIds,
          projectId: quotation.projectId === projectIdString 
            ? (updatedProjectIds[0] || undefined)
            : quotation.projectId,
          clientNotes: quotation.clientNotes 
            ? `${quotation.clientNotes}\n[System Note: ${note}]`
            : `[System Note: ${note}]`,
        })
      }
    }

    // 2. Collect MinIO keys for cleanup (to be used by action later)
    // We'll return these for the caller to handle or we can queue a background action if supported.
    // Since Convex actions are separate, the pattern usually involves returning them or 
    // having the frontend call the action after the mutation succeeds.
    const fileKeys: string[] = []

    // 3. Delete related data in order (children first)

    // A. Delete assets (belongs to folders and projects)
    const assets = await ctx.db
      .query('assets')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .collect()

    for (const asset of assets) {
      if (asset.minioKey) fileKeys.push(asset.minioKey)
      await ctx.db.delete(asset._id)
    }

    // B. Delete reference files
    if (project.referenceFiles) {
      for (const file of project.referenceFiles) {
        if (file.storageKey) fileKeys.push(file.storageKey)
      }
    }

    // C. Delete folders
    const folders = await ctx.db
      .query('folders')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .collect()

    for (const folder of folders) {
      await ctx.db.delete(folder._id)
    }

    // D. Delete deliverables
    const deliverables = await ctx.db
      .query('deliverables')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .collect()

    for (const deliverable of deliverables) {
      if (deliverable.minioKey) fileKeys.push(deliverable.minioKey)
      await ctx.db.delete(deliverable._id)
    }

    // E. Delete status history
    const statusHistory = await ctx.db
      .query('statusHistory')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .collect()

    for (const record of statusHistory) {
      await ctx.db.delete(record._id)
    }

    // F. Delete the project itself
    await ctx.db.delete(args.projectId)

    return { success: true, fileKeys }
  },
})

/**
 * Link a project to an existing approved quotation.
 * Story: 3-12
 * This enables folder setup to use the quotation's storage pool.
 */
export const linkProjectToQuotation = adminMutation({
  args: {
    projectId: v.id('projects'),
    quotationId: v.id('quotations'),
  },
  handler: async (ctx, args) => {
    // 1. Get the project
    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    // 2. Get the quotation
    const quotation = await ctx.db.get(args.quotationId)
    if (!quotation) {
      throw new Error('Quotation not found')
    }

    // 3. Validate quotation is approved
    if (quotation.status !== 'approved') {
      throw new Error('Quotation must be approved to link')
    }

    // 4. Validate client match
    const projectClientId = project.clientId as string | undefined
    const quotationClientId = quotation.clientId as string | undefined
    
    if (projectClientId && quotationClientId && projectClientId !== quotationClientId) {
      throw new Error('Quotation belongs to a different client')
    }

    // 5. Update the quotation to include this project
    // We use projectIds array for multi-project quotations
    const projectIdString = args.projectId as string
    const existingProjectIds = quotation.projectIds || []
    
    if (!existingProjectIds.includes(projectIdString)) {
      // Add to projectIds array
      await ctx.db.patch(args.quotationId, {
        projectIds: [...existingProjectIds, projectIdString],
        // Also set single projectId for backward compatibility if not set
        projectId: quotation.projectId || projectIdString,
      })
    }

    return { 
      success: true,
      quotationCode: quotation.code,
      quotationTotal: quotation.total,
    }
  },
})

/**
 * Unlink a project from a quotation.
 * Story: 3-12
 */
export const unlinkProjectFromQuotation = adminMutation({
  args: {
    projectId: v.id('projects'),
    quotationId: v.id('quotations'),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId)
    if (!quotation) {
      throw new Error('Quotation not found')
    }

    const projectIdString = args.projectId as string
    const existingProjectIds = quotation.projectIds || []
    
    // Remove from projectIds array
    const updatedProjectIds = existingProjectIds.filter(id => id !== projectIdString)
    
    await ctx.db.patch(args.quotationId, {
      projectIds: updatedProjectIds,
      // Clear single projectId if it matches
      projectId: quotation.projectId === projectIdString 
        ? (updatedProjectIds[0] || undefined)
        : quotation.projectId,
    })

    // Also reset project's storage allocation if it was from this quotation
    const project = await ctx.db.get(args.projectId)
    if (project && project.storageAllocated) {
      await ctx.db.patch(args.projectId, {
        storageAllocated: undefined,
        updatedAt: now(),
      })
    }

    return { success: true }
  },
})


