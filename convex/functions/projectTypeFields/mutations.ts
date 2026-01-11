import { v } from 'convex/values'
import { adminMutation } from '../../lib/customFunctions'

/**
 * Create a new field for a project type.
 */
export const createField = adminMutation({
  args: {
    projectTypeId: v.id('projectTypes'),
    name: v.string(),
    label: v.string(),
    type: v.union(
      v.literal('text'),
      v.literal('number'),
      v.literal('select'),
      v.literal('checkbox'),
      v.literal('textarea')
    ),
    required: v.boolean(),
    placeholder: v.optional(v.string()),
    description: v.optional(v.string()),
    options: v.optional(v.string()), // JSON string
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    displayOrder: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const fieldId = await ctx.db.insert('projectTypeFields', {
      ...args,
    })
    return fieldId
  },
})

/**
 * Update an existing field.
 */
export const updateField = adminMutation({
  args: {
    id: v.id('projectTypeFields'),
    name: v.optional(v.string()),
    label: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal('text'),
        v.literal('number'),
        v.literal('select'),
        v.literal('checkbox'),
        v.literal('textarea')
      )
    ),
    required: v.optional(v.boolean()),
    placeholder: v.optional(v.string()),
    description: v.optional(v.string()),
    options: v.optional(v.string()),
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
    return id
  },
})

/**
 * Reorder fields for a project type.
 */
export const reorderFields = adminMutation({
  args: {
    fields: v.array(
      v.object({
        id: v.id('projectTypeFields'),
        displayOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.fields.map((field) =>
        ctx.db.patch(field.id, { displayOrder: field.displayOrder })
      )
    )
  },
})

/**
 * Delete a field (soft delete).
 */
export const deleteField = adminMutation({
  args: {
    id: v.id('projectTypeFields'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false })
    return args.id
  },
})

/**
 * Toggle field active status.
 */
export const toggleFieldActive = adminMutation({
  args: {
    id: v.id('projectTypeFields'),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive })
    return args.id
  },
})

/**
 * Permanently delete a field.
 */
export const hardDeleteField = adminMutation({
  args: {
    id: v.id('projectTypeFields'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
