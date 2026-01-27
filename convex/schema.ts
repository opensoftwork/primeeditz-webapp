import { defineSchema, defineTable } from "convex/server";
import { type Infer, v } from "convex/values";

/**
 * INFERRED TYPES
 */
export type Role = Infer<typeof roleValidator>;
export type ProjectPhase = Infer<typeof projectPhaseValidator>;
export type ActionState = Infer<typeof projectActionStateValidator>;

// ============================================================================
// Reusable Validators
// ============================================================================

// Role validator for profiles
export const roleValidator = v.union(
  v.literal("studio"),
  v.literal("employee"),
  v.literal("admin"),
);

// Project phases: high-level lifecycle stages
export const projectPhaseValidator = v.union(
  v.literal("setup"), // Project creation and quotation
  v.literal("onboarding"), // Asset upload and preparation
  v.literal("production"), // Employee work on deliverables
  v.literal("review"), // Client/Admin review cycle
  v.literal("delivery"), // Final delivery preparation
  v.literal("completed"), // Project finished
  v.literal("archived"), // Historical record
);

// Project action states: granular workflow steps
export const projectActionStateValidator = v.union(
  // Setup Phase
  v.literal("draft"),
  v.literal("awaiting_quotation"),
  v.literal("quotation_sent"),
  v.literal("quotation_approved"),
  v.literal("quotation_rejected"),
  v.literal("storage_allocated"),

  // Onboarding Phase
  v.literal("awaiting_uploads"),
  v.literal("uploads_complete"),
  v.literal("awaiting_assignment"),

  // Production Phase
  v.literal("assigned"),
  v.literal("work_in_progress"),
  v.literal("deliverables_ready"),

  // Review Phase
  v.literal("awaiting_review"),
  v.literal("revisions_requested"),
  v.literal("review_approved"),

  // Delivery Phase
  v.literal("preparing_delivery"),
  v.literal("ready_for_delivery"),

  // Terminal States
  v.literal("delivered"),
  v.literal("completed"),
  v.literal("cancelled"),
  v.literal("archived"),
);

// Project source: studio_request vs admin_init
export const projectSourceValidator = v.union(
  v.literal("studio_request"),
  v.literal("admin_init"),
  v.literal("quotation_spawned"),
);

// Folder status flow: pending_upload → in_progress → completed
export const folderStatusValidator = v.union(
  v.literal("pending_upload"),
  v.literal("in_progress"),
  v.literal("completed"),
);

// Deliverable status flow: pending_qc → approved / revision_needed / revision_requested
export const deliverableStatusValidator = v.union(
  v.literal("pending_qc"),
  v.literal("approved"),
  v.literal("revision_needed"),
  v.literal("revision_requested"),
);

// Quotation status flow
export const quotationStatusValidator = v.union(
  v.literal("draft"),
  v.literal("initiated"), // NEW: Studio-side request
  v.literal("sent"),
  v.literal("viewed"),
  v.literal("requested"),
  v.literal("approved"),
  v.literal("changes_requested"),
  v.literal("rejected"),
  v.literal("expired"),
  v.literal("superseded"),
);

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
    designation: v.optional(v.string()), // Employee job title/role
    onboardingComplete: v.boolean(),
    image: v.optional(v.string()), // Profile picture from auth provider
    updatedAt: v.number(),
    deactivatedAt: v.optional(v.number()),
    deactivatedBy: v.optional(v.id("profiles")),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),

  // --------------------------------------------------------------------------
  // Project Types & Dynamic Fields
  // --------------------------------------------------------------------------
  projectCategories: defineTable({
    name: v.string(),
    isActive: v.boolean(),
    displayOrder: v.optional(v.number()),
  }).index("by_isActive", ["isActive"]),

  projectTypes: defineTable({
    name: v.string(),
    categoryId: v.id("projectCategories"),
    isActive: v.boolean(),
    displayOrder: v.optional(v.number()), // For ordering in UI
    defaultFolderTemplateId: v.optional(v.id("folderTemplates")),
    // Delivery configuration for customizing the 'delivery' phase labels/behavior
    deliveryConfig: v.optional(
      v.object({
        hasPhysicalDelivery: v.boolean(), // Album, prints, USB
        physicalDeliveryLabel: v.optional(v.string()), // e.g., "Album Production"
        hasDigitalDelivery: v.boolean(), // Download links
        digitalDeliveryLabel: v.optional(v.string()), // e.g., "Video Rendering"
        requiresSignoff: v.boolean(), // Client must sign for delivery
      }),
    ),
  })
    .index("by_categoryId", ["categoryId"])
    .index("by_isActive", ["isActive"]),

  // Dynamic field definitions for each project type
  // Allows admins to configure what fields appear in Step 2 of the wizard
  projectTypeFields: defineTable({
    projectTypeId: v.id("projectTypes"),
    name: v.string(), // Field key (e.g., 'albumCount')
    label: v.string(), // Display label (e.g., 'Number of Albums')
    type: v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("select"),
      v.literal("checkbox"),
      v.literal("textarea"),
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
    .index("by_projectTypeId", ["projectTypeId"])
    .index("by_projectTypeId_active", ["projectTypeId", "isActive"]),

  projects: defineTable({
    code: v.string(),
    projectTypeId: v.id("projectTypes"),
    studioId: v.optional(v.id("profiles")), // Optional for admin-initiated "No Studio" projects
    quotationId: v.optional(v.id("quotations")), // NEW: Link to parent quotation
    source: projectSourceValidator,
    // NEW: Multi-dimensional status
    phase: projectPhaseValidator,
    actionState: projectActionStateValidator,
    awaitingActorRole: v.optional(roleValidator), // studio | admin | employee
    awaitingActorId: v.optional(v.id("profiles")), // Specific person assigned for next action
    lastStep: v.optional(v.number()), // To track wizard progress (1-5)
    // Event/project details
    endClientName: v.optional(v.string()),
    venue: v.optional(v.string()),
    description: v.optional(v.string()),
    additionalNotes: v.optional(v.string()),
    preferredDeliveryDate: v.optional(v.number()),
    // NEW: Key milestone timestamps
    quotationApprovedAt: v.optional(v.number()),
    storageAllocatedAt: v.optional(v.number()),
    uploadsCompletedAt: v.optional(v.number()),
    assignedAt: v.optional(v.number()),
    deliverablesReadyAt: v.optional(v.number()),
    reviewApprovedAt: v.optional(v.number()),
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
        }),
      ),
    ),
    // Dynamic project-type-specific fields
    typeSpecificDetails: v.optional(v.any()),
    // Storage
    storageAllocated: v.optional(v.number()), // in bytes
    storageUsed: v.number(), // in bytes, default 0
    // Assignment
    assignedEmployeeId: v.optional(v.id("profiles")),
    // Archive tracking
    archivedAt: v.optional(v.number()),
    archivedBy: v.optional(v.id("profiles")),
    // Soft delete tracking
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id("profiles")),
    // Timestamp (uses _creationTime for created)
    updatedAt: v.number(),
  })
    .index("by_studioId", ["studioId"])
    .index("by_phase", ["phase"])
    .index("by_actionState", ["actionState"])
    .index("by_awaitingActorRole", ["awaitingActorRole"])
    .index("by_code", ["code"])
    .index("by_projectTypeId", ["projectTypeId"])
    .index("by_quotationId", ["quotationId"])
    .index("by_assignedEmployeeId", ["assignedEmployeeId"]),

  // --------------------------------------------------------------------------
  // Quotation & Storage Tiers
  // --------------------------------------------------------------------------
  storageTiers: defineTable({
    name: v.string(),
    sizeGB: v.number(),
    priceINR: v.number(),
    isActive: v.boolean(),
    isDefault: v.optional(v.boolean()),
  }),

  // --------------------------------------------------------------------------
  // Folder Templates, Folders & Assets
  // --------------------------------------------------------------------------
  folderTemplates: defineTable({
    name: v.string(),
    variant: v.optional(v.string()), // NEW: e.g. "South Indian", "Christian", etc.
    description: v.optional(v.string()), // NEW: Detailed info about this structure
    folders: v.array(v.string()),
    projectTypeId: v.optional(v.id("projectTypes")),
    isDefault: v.optional(v.boolean()),
    isActive: v.boolean(),
  }).index("by_projectTypeId", ["projectTypeId"]),

  folders: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    path: v.string(),
    status: folderStatusValidator,
    // Uses _creationTime
  }).index("by_projectId", ["projectId"]),

  assets: defineTable({
    folderId: v.id("folders"),
    projectId: v.id("projects"),
    filename: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    minioKey: v.string(),
    uploadedBy: v.id("profiles"),
    // Uses _creationTime as upload timestamp
  })
    .index("by_projectId", ["projectId"])
    .index("by_folderId", ["folderId"]),

  // --------------------------------------------------------------------------
  // Deliverables
  // --------------------------------------------------------------------------
  deliverables: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    version: v.number(),
    status: deliverableStatusValidator,
    minioKey: v.string(),
    sizeBytes: v.number(),
    uploadedBy: v.id("profiles"),
    qcReviewedBy: v.optional(v.id("profiles")),
    qcNotes: v.optional(v.string()),
    rejectionNotes: v.optional(v.string()),
    // Uses _creationTime
  })
    .index("by_projectId", ["projectId"])
    .index("by_status", ["status"]),

  // --------------------------------------------------------------------------
  // Audit Trail
  // --------------------------------------------------------------------------
  statusHistory: defineTable({
    projectId: v.id("projects"),
    // Enhanced status history tracking
    previousPhase: v.optional(projectPhaseValidator),
    newPhase: projectPhaseValidator,
    previousActionState: v.optional(projectActionStateValidator),
    newActionState: projectActionStateValidator,
    previousAwaitingActorRole: v.optional(roleValidator),
    newAwaitingActorRole: v.optional(roleValidator),
    changedBy: v.id("profiles"),
    changedAt: v.number(),
    notes: v.optional(v.string()),
  }).index("by_projectId", ["projectId"]),

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
    .index("by_isActive", ["isActive"])
    .index("by_displayOrder", ["displayOrder"]),

  quotationTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    projectTypeHint: v.optional(v.string()),
    terms: v.optional(v.string()),
    isActive: v.boolean(),
    lineItems: v.array(
      v.object({
        sectionId: v.id("quotationSections"),
        description: v.string(),
        unit: v.string(),
        unitPrice: v.number(),
        defaultQuantity: v.number(),
        spawnsProject: v.optional(v.boolean()), // NEW: Spawns a project on approval
        projectTypeId: v.optional(v.id("projectTypes")), // NEW: Link to project type
        selectedFolderTemplateId: v.optional(v.id("folderTemplates")), // NEW: Link to folder template
        subItems: v.optional(
          v.array(
            v.object({
              description: v.string(),
              unit: v.string(),
              unitPrice: v.number(),
              defaultQuantity: v.number(),
            }),
          ),
        ),
      }),
    ),
    createdBy: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }).index("by_isActive", ["isActive"]),

  quotationLibraryItems: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    sectionId: v.id("quotationSections"),
    unit: v.string(),
    unitPrice: v.number(),
    isActive: v.boolean(),
    projectTypeHint: v.optional(v.id("projectTypes")),
  })
    .index("by_isActive", ["isActive"])
    .index("by_sectionId", ["sectionId"]),

  quotations: defineTable({
    code: v.string(),
    version: v.number(),
    parentQuotationId: v.optional(v.id("quotations")),
    studioId: v.optional(v.string()), // Profile ID
    projectId: v.optional(v.string()), // Project ID
    projectIds: v.optional(v.array(v.string())),
    templateId: v.optional(v.id("quotationTemplates")),
    status: quotationStatusValidator,
    // Event details for Studio-initiated requests (links to spawned projects)
    endClientName: v.string(),
    lineItems: v.array(
      v.object({
        id: v.string(),
        sectionId: v.id("quotationSections"),
        projectId: v.optional(v.string()), // Associated project for this line item
        spawnsProject: v.optional(v.boolean()), // NEW: Spawns a project on approval
        projectTypeId: v.optional(v.id("projectTypes")), // NEW: Link to project type
        selectedFolderTemplateId: v.optional(v.id("folderTemplates")), // NEW: Link to folder template
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
            }),
          ),
        ),
      }),
    ),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    discountAmount: v.optional(v.number()),
    total: v.number(),
    terms: v.optional(v.string()),
    validUntil: v.optional(v.number()),
    studioNotes: v.optional(v.string()),
    createdBy: v.string(),
    sentAt: v.optional(v.number()),
    sentTo: v.optional(v.string()), // Email address sent to
    shareToken: v.optional(v.string()), // Unique token for public access
    shareTokenExpiresAt: v.optional(v.number()), // Expiry timestamp
    viewedAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    rejectedAt: v.optional(v.number()),
    studioSignature: v.optional(v.string()),
    changeReasons: v.optional(v.array(v.string())),
    changeRequestedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    assignedEmployeeId: v.optional(v.id("profiles")),
    updatedAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_studioId", ["studioId"])
    .index("by_status", ["status"])
    .index("by_shareToken", ["shareToken"]),

  // --------------------------------------------------------------------------
  // Project Squads (Teams) - Phase 2 Implementation
  // --------------------------------------------------------------------------
  projectSquads: defineTable({
    projectId: v.id("projects"),
    profileId: v.id("profiles"),
    role: v.optional(v.string()), // e.g., "Lead Editor", "Colorist", "QC"
    isLead: v.boolean(),
    assignedAt: v.number(),
    dissolvedAt: v.optional(v.number()), // For historical tracking of ephemeral teams
  })
    .index("by_projectId", ["projectId"])
    .index("by_profileId", ["profileId"])
    .index("by_project_profile", ["projectId", "profileId"]),

  // --------------------------------------------------------------------------
  // Handoff Logs (Baton Pass) - Phase 2 Implementation
  // --------------------------------------------------------------------------
  handoffLogs: defineTable({
    projectId: v.id("projects"),
    fromProfileId: v.id("profiles"),
    toProfileId: v.optional(v.id("profiles")), // Could be null if handed back to admin/pool
    fromActionState: projectActionStateValidator,
    toActionState: projectActionStateValidator,
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_projectId", ["projectId"]),
});
