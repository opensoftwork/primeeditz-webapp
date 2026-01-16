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
      source: (profile.role === 'admin' || profile.role === 'employee')
        ? 'admin_init'
        : 'client_request',
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
