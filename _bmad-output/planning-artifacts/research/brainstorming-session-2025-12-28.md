---
stepsCompleted: [1, 2]
inputDocuments: []
session_topic: "PrimeEditz Data Model & Workflow Architecture Pivot"
session_goals: "Design a flexible Project-centric schema and multi-stage workflow"
selected_approach: "AI-Recommended + First Principles"
techniques_used:
  [
    "First Principles Thinking",
    "Morphological Analysis",
    "Decision Tree Mapping",
  ]
ideas_generated:
  [
    "Project-centric model",
    "Per-project role assignment",
    "Configurable project types",
    "Versioned deliverables and quotations",
  ]
context_file: ""
---

# Brainstorming Session: PrimeEditz Data Model Pivot

**Date**: 2025-12-28  
**Facilitator**: BMAD Brainstorming Agent  
**Participant**: Life-design  
**Status**: ✅ Complete

---

## Session Overview

**Topic:** PrimeEditz Data Model & Workflow Architecture Pivot

**Goals:**

1. Design a flexible **Project-centric** data model
2. Define **multi-stage workflow** (Culling → Editing → Final → QC → Client Review)
3. Enable **per-project role assignment** (Editor/QC per project)
4. Support **diverse project types** (photos, videos, albums, posters, YouTube, R&D)
5. Handle **both client-initiated and admin-initiated** projects
6. Integrate **versioning, quotations, billing, and archival**

---

## Key Decisions Made

### 1. Entity Model: Project-Centric

**Decision:** Replace Event → Session → Project hierarchy with **Project as the central entity**

| Old Model                | New Model                      |
| ------------------------ | ------------------------------ |
| Event (client context)   | → Moved to Project fields      |
| Session (work container) | → Merged into Project          |
| Project (work unit)      | → **Project (central entity)** |

**Rationale:**

- Events/Sessions were too rigid
- Always required client initiation
- Couldn't accommodate internal projects

### 2. Project Creation Paths

| Path                 | Quotation Required? | Storage Allocation                 |
| -------------------- | :-----------------: | ---------------------------------- |
| **Client-initiated** |       ✅ Yes        | From approved quotation            |
| **Admin-initiated**  |        ❌ No        | Admin selects tier during creation |

### 3. Team Model: Hybrid Assignment

**Decision:** Per-project role assignment with optional stage-level overrides

```
PROJECT
└── Assignments
    ├── Project-Level: Rahul → [Editor, QC] → All stages
    ├── Project-Level: Priya → [QC] → All stages
    └── Stage-Level Override: Culling → Priya only
```

**Key Points:**

- Same person can be both Editor and QC on same project
- Can assign to whole project OR specific stages
- Multiple people can work on same stage

### 4. Versioning Strategy

| Entity                 | Versioned? | Notes                                           |
| ---------------------- | :--------: | ----------------------------------------------- |
| Culling                |     ❌     | QC overrides (approve/reject), no history       |
| Editing stages         |     ❌     | Done externally, bulk upload                    |
| **Final Deliverables** |     ✅     | Album PDF, video, poster — full version history |
| **Quotations**         |     ✅     | Back-and-forth with client                      |

### 5. Storage Model

- Storage tiers are admin-configurable
- ALL projects require storage allocation (client and admin-initiated)
- Prevents unnecessary uploads
- Usage tracked per project

### 6. Upload Gating

| Upload Type          | Gate                                     |
| -------------------- | ---------------------------------------- |
| Reference files      | Count limit only (10-20), always allowed |
| Asset files (client) | Quotation must be approved               |
| Asset files (admin)  | Storage tier must be selected            |

---

## Final Schema

### Configuration Tables (Admin-Configurable)

```typescript
// Project type templates
projectTypes: {
  code, name, category,
  allowClientRequest, allowAdminCreate,
  assetType, maxAssetCount, allowedFileTypes,
  stageFlow: string[],
  billingType,
  isActive
}

// Stage definitions
stageDefinitions: {
  code, name,
  requiresAssetUpload, producesDeliverable,
  requiresQC, requiresClientApproval, allowsVersioning,
  allowedRoles: string[]
}

// Dynamic form fields per project type
projectTypeFormFields: {
  projectTypeId,
  fieldName, fieldLabel, fieldType, options,
  isRequired, sortOrder
}

// Storage tiers
storageTiers: {
  code, name,
  capacityBytes, displayCapacity,
  price, currency,
  isActive
}

// Quotation templates
quotationTemplates: {
  code, name,
  projectTypeIds: Id[],
  lineItems: LineItem[],
  defaultStorageTierId,
  defaultTaxPercent, defaultValidityDays,
  isActive
}
```

### Core Project Tables

```typescript
// The central entity
projects: {
  projectCode, name,
  projectTypeId,
  source: "client_request" | "admin_created",
  clientId?, // Optional for internal projects
  endClientName?, endClientEvent?, eventDate?,
  formData?, // Dynamic form data
  status,
  currentStageCode, stagesCompleted: string[],
  priority, dueDate,
  storageTierId, storageAllocatedBytes, storageUsedBytes,
  quotationId?, // Only for client projects
  internalNotes
}

// Stage instances per project
projectStages: {
  projectId, stageCode, stageName,
  sortOrder,
  status: "pending" | "in_progress" | "pending_qc" | "completed" | "skipped",
  totalItems?, completedItems?,
  startedAt?, completedAt?
}

// Team assignments
projectAssignments: {
  projectId, userId,
  roles: ("editor" | "qc" | "designer" | "lead")[],
  scope: "project" | "stages",
  assignedStages?: string[],
  isActive
}
```

### Assets & Deliverables

```typescript
// Organize uploaded assets
projectFolders: {
  projectId, name, description,
  status, fileCount, totalSize
}

// Raw uploaded files
projectAssets: {
  projectId, folderId,
  fileName, fileType, fileSize, storageKey,
  status: "pending" | "approved" | "rejected" | "edited"
}

// Reference files (no gate)
projectReferenceFiles: {
  projectId,
  fileName, fileType, fileSize, storageKey,
  category?, notes?
}

// Final outputs (WITH VERSIONING)
projectDeliverables: {
  projectId,
  name, type, description,
  currentVersion,
  status
}

// Version history
deliverableVersions: {
  deliverableId, projectId,
  versionNumber,
  fileName, fileSize, storageKey,
  status: "current" | "superseded" | "rejected",
  reviewedBy?, reviewNotes?
}
```

### Quotation & Billing

```typescript
// Quotations (WITH VERSIONING)
quotations: {
  projectId, clientId,
  quotationNumber,
  currentVersion,
  status,
  validUntil
}

// Version history
quotationVersions: {
  quotationId,
  versionNumber,
  lineItems: LineItem[],
  subtotal, taxPercent, taxAmount, total,
  terms?, notes?,
  status,
  clientResponse?, clientNotes?
}

// Revision requests
revisionRequests: {
  targetType: "deliverable" | "quotation",
  targetId, projectId,
  referenceVersion,
  requestedBy, notes,
  status
}
```

---

## Project Types (Initial Set)

### Category: Wedding & Events

- `WEDDING_PHOTO` — Wedding Photography
- `WEDDING_VIDEO` — Wedding Cinematography
- `WEDDING_COMBO` — Wedding Photo + Video
- `PRE_WEDDING` — Pre-Wedding Shoot
- `ENGAGEMENT` — Engagement Ceremony
- `RECEPTION` — Reception Party

### Category: Corporate & Commercial

- `CORP_EVENT` — Corporate Event Coverage
- `PRODUCT_SHOOT` — Product Photography
- `HEADSHOTS` — Corporate Headshots
- `BRAND_VIDEO` — Brand/Promo Video

### Category: Social Media & Digital

- `YOUTUBE_LONG` — YouTube Long-form
- `YOUTUBE_SHORT` — YouTube Shorts/Reels
- `INSTAGRAM_REEL` — Instagram Reel
- `THUMBNAIL` — Video Thumbnail
- `SOCIAL_GRAPHICS` — Social Media Graphics

### Category: Design & Creative

- `POSTER` — Poster Design
- `ALBUM_DESIGN` — Album Design Only
- `INVITATION` — Wedding/Event Invitation
- `LOGO` — Logo Design
- `BANNER` — Banner/Hoarding

### Category: Internal & R&D

- `INTERNAL_RND` — R&D / Experimentation
- `TEMPLATE_CREATION` — Template/Preset Creation
- `PORTFOLIO_UPDATE` — Portfolio Update
- `TRAINING_PROJECT` — Staff Training

---

## Upload Flow Decision Tree

```
                           UPLOAD REQUEST
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            Reference File?               Asset File?
                    │                         │
                    ▼                         ▼
         Count < maxReferenceFiles?    ┌──────────────────┐
                    │                  │ Is quotation     │
              ┌─────┴─────┐           │ approved? OR     │
              │           │           │ Is admin-created │
           Yes           No           │ with storage?    │
              │           │           └────────┬─────────┘
              ▼           ▼                    │
          ✅ Allow    ❌ Reject          ┌─────┴─────┐
                                        │           │
                                       Yes          No
                                        │            │
                                        ▼            ▼
                                Within storage?    ❌ Reject
                                        │
                                  ┌─────┴─────┐
                                  │           │
                                 Yes          No
                                  │            │
                                  ▼            ▼
                              ✅ Allow     ❌ Reject
```

---

## Next Steps

1. **Update PRD** with new Project-centric model
2. **Create new user flows** reflecting pivot
3. **Update database schema** in Convex
4. **Implement project type configuration UI**
5. **Migrate existing code** from Event/Session to Project

---

## Session Metrics

- **Duration**: ~45 minutes
- **Techniques Used**: First Principles, Morphological Analysis, Decision Tree
- **Major Decisions**: 6
- **Tables Defined**: 16
- **Project Types Defined**: 21

---

_Session completed successfully. Ready for implementation!_ ✅
