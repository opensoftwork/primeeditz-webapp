import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// ============================================================================
// Reusable Validators
// ============================================================================

// Role validator for profiles
export const roleValidator = v.union(
  v.literal('client'),
  v.literal('employee'),
  v.literal('admin')
)

// Project status flow: draft → pending_review → active → in_progress → completed → archived
export const projectStatusValidator = v.union(
  v.literal('draft'),
  v.literal('pending_review'),
  v.literal('active'),
  v.literal('in_progress'),
  v.literal('completed'),
  v.literal('archived')
)

// Project source: client_request vs admin_init
export const projectSourceValidator = v.union(
  v.literal('client_request'),
  v.literal('admin_init')
)

// Folder status flow: pending_upload → in_progress → completed
export const folderStatusValidator = v.union(
  v.literal('pending_upload'),
  v.literal('in_progress'),
  v.literal('completed')
)

// Deliverable status flow: pending_qc → approved / revision_needed / revision_requested
export const deliverableStatusValidator = v.union(
  v.literal('pending_qc'),
  v.literal('approved'),
  v.literal('revision_needed'),
  v.literal('revision_requested')
)

// Quotation status flow
export const quotationStatusValidator = v.union(
  v.literal('draft'),
  v.literal('sent'),
  v.literal('viewed'),
  v.literal('approved'),
  v.literal('changes_requested'),
  v.literal('rejected'),
  v.literal('expired'),
  v.literal('superseded')
)

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
    email: v.string(), // User's email address
    role: roleValidator,
    name: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    updatedAt: v.number(),
    deactivatedAt: v.optional(v.number()),
    deactivatedBy: v.optional(v.id('profiles')),
  })
    .index('by_userId', ['userId'])
    .index('by_role', ['role']),

  // --------------------------------------------------------------------------
  // Project Types & Dynamic Fields
  // --------------------------------------------------------------------------
  projectCategories: defineTable({
    name: v.string(),
    isActive: v.boolean(),
    displayOrder: v.optional(v.number()),
  }).index('by_isActive', ['isActive']),

  projectTypes: defineTable({
    name: v.string(),
    categoryId: v.id('projectCategories'),
    isActive: v.boolean(),
    displayOrder: v.optional(v.number()), // For ordering in UI
    defaultFolderTemplateId: v.optional(v.id('folderTemplates')),
  })
    .index('by_categoryId', ['categoryId'])
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
    clientId: v.optional(v.id('profiles')), // Optional for admin-initiated "No Client" projects
    source: projectSourceValidator,
    status: projectStatusValidator,
    lastStep: v.optional(v.number()), // To track wizard progress (1-5)
    // Event/project details
    endClientName: v.optional(v.string()),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    venue: v.optional(v.string()),
    description: v.optional(v.string()),
    additionalNotes: v.optional(v.string()),
    preferredDeliveryDate: v.optional(v.number()),
    // Reference files (uploaded during wizard)
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
    // Dynamic project-type-specific fields
    typeSpecificDetails: v.optional(v.any()),
    // Storage
    storageAllocated: v.optional(v.number()), // in bytes
    storageUsed: v.number(), // in bytes, default 0
    // Assignment
    assignedEmployeeId: v.optional(v.id('profiles')),
    // Archive tracking
    archivedAt: v.optional(v.number()),
    archivedBy: v.optional(v.id('profiles')),
    // Soft delete tracking
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id('profiles')),
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

  // --------------------------------------------------------------------------
  // Folder Templates, Folders & Assets
  // --------------------------------------------------------------------------
  folderTemplates: defineTable({
    name: v.string(),
    folders: v.array(v.string()),
    projectTypeId: v.optional(v.id("projectTypes")),
    isDefault: v.optional(v.boolean()),
    isActive: v.boolean(),
  }).index("by_projectTypeId", ["projectTypeId"]),

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

  // --------------------------------------------------------------------------
  // Quotation Management (Migrated from Component)
  // --------------------------------------------------------------------------
  quotationSections: defineTable({
    name: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index('by_isActive', ['isActive'])
    .index('by_displayOrder', ['displayOrder']),

  quotationTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    projectTypeHint: v.optional(v.string()),
    terms: v.optional(v.string()),
    isActive: v.boolean(),
    lineItems: v.array(
      v.object({
        sectionId: v.id('quotationSections'),
        description: v.string(),
        unit: v.string(),
        unitPrice: v.number(),
        defaultQuantity: v.number(),
        subItems: v.optional(
          v.array(
            v.object({
              description: v.string(),
              unit: v.string(),
              unitPrice: v.number(),
              defaultQuantity: v.number(),
            })
          )
        ),
      })
    ),
    createdBy: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }).index('by_isActive', ['isActive']),

  quotationLibraryItems: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    sectionId: v.id('quotationSections'),
    unit: v.string(),
    unitPrice: v.number(),
    isActive: v.boolean(),
    projectTypeHint: v.optional(v.id('projectTypes')),
  })
    .index('by_isActive', ['isActive'])
    .index('by_sectionId', ['sectionId']),

  quotations: defineTable({
    code: v.string(),
    version: v.number(),
    parentQuotationId: v.optional(v.id('quotations')),
    clientId: v.optional(v.string()), // Profile ID
    projectId: v.optional(v.string()), // Project ID
    projectIds: v.optional(v.array(v.string())),
    templateId: v.optional(v.id('quotationTemplates')),
    status: quotationStatusValidator,
    lineItems: v.array(
      v.object({
        id: v.string(),
        sectionId: v.id('quotationSections'),
        projectId: v.optional(v.string()), // Associated project for this line item
        description: v.string(),
        unit: v.string(),
        rate: v.number(),
        quantity: v.number(),
        length: v.optional(v.string()),
        width: v.optional(v.string()),
        image: v.optional(v.string()),
        subItems: v.optional(
          v.array(
            v.object({
              id: v.string(),
              description: v.string(),
              unit: v.string(),
              rate: v.number(),
              quantity: v.number(),
            })
          )
        ),
      })
    ),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    discountAmount: v.optional(v.number()),
    total: v.number(),
    terms: v.optional(v.string()),
    validUntil: v.optional(v.number()),
    clientNotes: v.optional(v.string()),
    createdBy: v.string(),
    sentAt: v.optional(v.number()),
    sentTo: v.optional(v.string()), // Email address sent to
    shareToken: v.optional(v.string()), // Unique token for public access
    shareTokenExpiresAt: v.optional(v.number()), // Expiry timestamp
    viewedAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    rejectedAt: v.optional(v.number()),
    clientSignature: v.optional(v.string()),
    changeReasons: v.optional(v.array(v.string())),
    changeRequestedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index('by_code', ['code'])
    .index('by_clientId', ['clientId'])
    .index('by_status', ['status'])
    .index('by_shareToken', ['shareToken']),
});
