/**
 * Project Wizard Schemas
 *
 * Zod schemas for validating each step of the project wizard.
 * These match the Convex schema definitions.
 */

import { z } from 'zod'

// ============================================================================
// Step 1: Basic Info
// ============================================================================

export const step1Schema = z.object({
  projectTypeId: z.string().min(1, 'Project type is required'),
  eventName: z.string().min(3, 'Event name must be at least 3 characters'),
  endClientName: z.string().min(2, 'Client name is required'),
  eventDate: z.coerce.number().optional(), // Timestamp
  venue: z.string().optional(),
})

// ============================================================================
// Step 2: Details (Dynamic)
// ============================================================================
// This schema is loose because it depends on project type
export const step2Schema = z.object({
  typeSpecificDetails: z.record(z.string(), z.unknown()).optional(),
})

// ============================================================================
// Step 3: Files
// ============================================================================

export const step3Schema = z.object({
  referenceFiles: z.array(z.string()).default([]), // Array of file IDs
})

// ============================================================================
// Step 4: Description
// ============================================================================

export const step4Schema = z.object({
  description: z.string().optional(),
  additionalNotes: z.string().optional(),
  preferredDeliveryDate: z.coerce.number().optional(),
})

// ============================================================================
// Combined Schema (for full form state)
// ============================================================================

export const projectWizardSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
})

export type ProjectWizardFormData = z.infer<typeof projectWizardSchema>
