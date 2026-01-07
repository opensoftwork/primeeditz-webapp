import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// ============================================================================
// Reusable Validators
// ============================================================================

// Role validator for profiles
const roleValidator = v.union(
  v.literal('client'),
  v.literal('employee'),
  v.literal('admin')
)

// Project status flow: draft → pending_review → active → in_progress → completed → archived
const projectStatusValidator = v.union(
  v.literal('draft'),
  v.literal('pending_review'),
  v.literal('active'),
  v.literal('in_progress'),
  v.literal('completed'),
  v.literal('archived')
)

// Project source: client_request vs admin_init
const projectSourceValidator = v.union(
  v.literal('client_request'),
  v.literal('admin_init')
)

// Quotation status flow: draft → sent → approved / revision_requested
const quotationStatusValidator = v.union(
  v.literal('draft'),
  v.literal('sent'),
  v.literal('approved'),
  v.literal('revision_requested')
)

// Folder status flow: pending_upload → in_progress → completed
const folderStatusValidator = v.union(
  v.literal('pending_upload'),
  v.literal('in_progress'),
  v.literal('completed')
)

// Deliverable status flow: pending_qc → approved / revision_needed / revision_requested
const deliverableStatusValidator = v.union(
  v.literal('pending_qc'),
  v.literal('approved'),
  v.literal('revision_needed'),
  v.literal('revision_requested')
)

// Line item for quotations
const lineItemValidator = v.object({
  description: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
})

// ============================================================================
// Schema Definition
// ============================================================================

export default defineSchema({
  // --------------------------------------------------------------------------
  // Auth Tables - MANAGED BY BETTER AUTH COMPONENT
  // --------------------------------------------------------------------------
  // Note: users, sessions, accounts, and verifications tables are managed
  // by the Better Auth component (see convex/convex.config.ts).
  // Do NOT define them here - the component handles its own schema.

  // --------------------------------------------------------------------------
  // Profile Table (uses _creationTime for created timestamp)
  // Note: userId is a string referencing Better Auth component's user ID
  // --------------------------------------------------------------------------
  profiles: defineTable({
    userId: v.string(), // Better Auth user ID (component isolation)
    role: roleValidator,
    name: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_role', ['role']),

  // --------------------------------------------------------------------------
  // Project Types & Dynamic Fields
  // --------------------------------------------------------------------------
  projectTypes: defineTable({
    name: v.string(),
    category: v.string(),
    isActive: v.boolean(),
    displayOrder: v.optional(v.number()), // For ordering in UI
    defaultFolderTemplateId: v.optional(v.id('folderTemplates')),
  })
    .index('by_category', ['category'])
    .index('by_isActive', ['isActive']),

  // Dynamic field definitions for each project type
  // Allows admins to configure what fields appear in Step 2 of the wizard
  projectTypeFields: defineTable({
    projectTypeId: v.id('projectTypes'),
    name: v.string(), // Field key (e.g., 'albumCount')
    label: v.string(), // Display label (e.g., 'Number of Albums')
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
    // For select type: JSON array of { value, label }
    options: v.optional(v.string()), // JSON string of options array
    // Validation
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    // Ordering
    displayOrder: v.number(),
    isActive: v.boolean(),
  })
    .index('by_projectTypeId', ['projectTypeId'])
    .index('by_projectTypeId_active', ['projectTypeId', 'isActive']),

  projects: defineTable({
    code: v.string(),
  projectTypeId: v.id('projectTypes'),
    clientId: v.id('profiles'),
    source: projectSourceValidator,
    status: projectStatusValidator,
    // Event/project details
    endClientName: v.optional(v.string()),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    venue: v.optional(v.string()),
    description: v.optional(v.string()),
    additionalNotes: v.optional(v.string()),
    preferredDeliveryDate: v.optional(v.number()),
    // Reference files (uploaded during wizard)
    referenceFiles: v.optional(v.array(v.string())),
    // Dynamic project-type-specific fields
    typeSpecificDetails: v.optional(v.any()),
    // Storage
    storageAllocated: v.optional(v.number()), // in bytes
    storageUsed: v.number(), // in bytes, default 0
    // Assignment
    assignedEmployeeId: v.optional(v.id('profiles')),
    // Timestamp (uses _creationTime for created)
    updatedAt: v.number(),
  })
    .index('by_clientId', ['clientId'])
    .index('by_status', ['status'])
    .index('by_code', ['code'])
    .index('by_projectTypeId', ['projectTypeId'])
    .index('by_assignedEmployeeId', ['assignedEmployeeId']),

  // --------------------------------------------------------------------------
  // Quotation & Storage Tiers
  // --------------------------------------------------------------------------
  storageTiers: defineTable({
    name: v.string(),
    sizeGB: v.number(),
    priceINR: v.number(),
    isActive: v.boolean(),
  }),

  quotations: defineTable({
    projectId: v.id('projects'),
    version: v.number(),
    status: quotationStatusValidator,
    lineItems: v.array(lineItemValidator),
    subtotal: v.number(),
    gstAmount: v.number(),
    total: v.number(),
    storageTierId: v.optional(v.id('storageTiers')),
    terms: v.optional(v.string()),
    // Uses _creationTime for created
    updatedAt: v.number(),
  })
    .index('by_projectId', ['projectId'])
    .index('by_status', ['status']),

  // --------------------------------------------------------------------------
  // Folder Templates, Folders & Assets
  // --------------------------------------------------------------------------
  folderTemplates: defineTable({
    name: v.string(),
    folders: v.array(v.string()),
  }),

  folders: defineTable({
    projectId: v.id('projects'),
    name: v.string(),
    path: v.string(),
    status: folderStatusValidator,
    // Uses _creationTime
  }).index('by_projectId', ['projectId']),

  assets: defineTable({
    folderId: v.id('folders'),
    projectId: v.id('projects'),
    filename: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    minioKey: v.string(),
    // Uses _creationTime as upload timestamp
  })
    .index('by_projectId', ['projectId'])
    .index('by_folderId', ['folderId']),

  // --------------------------------------------------------------------------
  // Deliverables
  // --------------------------------------------------------------------------
  deliverables: defineTable({
    projectId: v.id('projects'),
    name: v.string(),
    description: v.optional(v.string()),
    version: v.number(),
    status: deliverableStatusValidator,
    minioKey: v.string(),
    sizeBytes: v.number(),
    uploadedBy: v.id('profiles'),
    qcReviewedBy: v.optional(v.id('profiles')),
    qcNotes: v.optional(v.string()),
    rejectionNotes: v.optional(v.string()),
    // Uses _creationTime
  })
    .index('by_projectId', ['projectId'])
    .index('by_status', ['status']),

  // --------------------------------------------------------------------------
  // Audit Trail
  // --------------------------------------------------------------------------
  statusHistory: defineTable({
    projectId: v.id('projects'),
    previousStatus: v.optional(v.string()),
    newStatus: v.string(),
    changedBy: v.id('profiles'),
    changedAt: v.number(),
  }).index('by_projectId', ['projectId']),
})

