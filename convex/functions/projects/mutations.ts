/**
 * Project Mutations
 *
 * Write operations for projects with role-based access.
 */

import { v } from 'convex/values'
import { clientMutation, adminMutation } from '../../lib/customFunctions'
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
// Client Mutations
// ============================================================================

/**
 * Create a new draft project.
 * Called when client starts the project request wizard.
 */
export const createDraft = clientMutation({
  args: {
    projectTypeId: v.optional(v.id('projectTypes')),
  },
  handler: async (ctx, args) => {
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

    const projectId = await ctx.db.insert('projects', {
      code,
      projectTypeId,
      clientId: ctx.profile._id,
      source: 'client_request',
      status: 'draft',
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
export const updateDraft = clientMutation({
  args: {
    projectId: v.id('projects'),
    // Step 1: Basic Info
    projectTypeId: v.optional(v.id('projectTypes')),
    endClientName: v.optional(v.string()),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    venue: v.optional(v.string()),
    // Step 2: Type-specific details
    typeSpecificDetails: v.optional(v.any()),
    // Step 3: Reference files (stored as IDs)
    referenceFiles: v.optional(v.array(v.string())),
    // Step 4: Description
    description: v.optional(v.string()),
    additionalNotes: v.optional(v.string()),
    preferredDeliveryDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { projectId, ...updates } = args

    // Get and verify project
    const project = await ctx.db.get(projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    // Verify ownership
    if (project.clientId !== ctx.profile._id) {
      throw new Error('Access denied')
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

    await ctx.db.patch(projectId, filteredUpdates)

    return { success: true }
  },
})

/**
 * Submit a draft project for review.
 * Changes status from 'draft' to 'pending_review'.
 */
export const submitProject = clientMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    // Verify ownership
    if (project.clientId !== ctx.profile._id) {
      throw new Error('Access denied')
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
      changedBy: ctx.profile._id,
      changedAt: now(),
    })

    return { success: true }
  },
})

/**
 * Delete a draft project.
 * Only drafts can be deleted by clients.
 */
export const deleteDraft = clientMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    // Verify ownership
    if (project.clientId !== ctx.profile._id) {
      throw new Error('Access denied')
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
