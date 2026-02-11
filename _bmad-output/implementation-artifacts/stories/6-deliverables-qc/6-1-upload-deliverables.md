# Story 6-1: Upload Deliverables (Admin/Employee)

**Epic**: Epic 6 - Deliverables & QC Workflow  
**Status**: done  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-18  
**Updated**: 2026-02-04  
**Priority**: MUST — Foundation for QC workflow

---

## 📋 User Story

**As an** Admin or Employee,  
**I want** to upload final deliverables for a project,  
**So that** they can be reviewed before showing to the client.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                       | Status  | Notes                   |
| -------------------------------- | ------- | ----------------------- |
| **5A - Project Status Workflow** | ✅ Done | Status transitions used |
| **5 - Asset Upload**             | ✅ Done | Upload patterns reused  |
| **MinIO Configuration**          | ✅ Done | S3-compatible storage   |

### Enables

| Story / Epic          | Notes                           |
| --------------------- | ------------------------------- |
| **6-2 - QC Review**   | Deliverables created for review |
| **6-3 - Client View** | Approved deliverables visible   |

### Data Flow

```
Employee Portal
      │
      ↓ Navigate to Project
      │
Project Detail Page
      │
      ↓ "Deliverables" Tab
      │
┌─────────────────────────────────────┐
│  📤 UPLOAD DELIVERABLE              │
│  ─────────────────────────────────  │
│  Name: [Album Preview v1          ] │
│  Description: [First draft...     ] │
│  File: [Browse...]                  │
│                     [Upload]        │
├─────────────────────────────────────┤
│  📁 UPLOADED DELIVERABLES           │
│  ┌────────────────────────────────┐ │
│  │ Album Preview v1               │ │
│  │ pending_qc • 15.2 MB • v1      │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Upload Form

- [x] **Given** a project with `actionState: 'assigned'` or `work_in_progress`
- [x] **When** I navigate to the Deliverables section
- [x] **Then** I see an upload form with:
  - Deliverable name input
  - Description textarea (optional)
  - File upload button
- [x] **And** I can select and upload files via signed URLs

### AC2: Auto Versioning

- [x] **Given** I upload a deliverable with a name that already exists
- [x] **When** the upload completes
- [x] **Then** the new deliverable is created as version N+1
- [x] **And** previous versions are preserved

### AC3: Initial Status

- [x] **Given** a new deliverable is uploaded
- [x] **Then** it has status `pending_qc`
- [x] **And** it appears in the deliverables list

### AC4: Rejection Notes Display

- [x] **Given** a previous version was rejected
- [x] **When** I view the deliverables section
- [x] **Then** the rejection notes are displayed prominently
- [x] **And** I understand what needs to be fixed

---

## 📘 Implementation (COMPLETED)

### Backend Implementation

**File**: `convex/functions/deliverables/mutations.ts`

```typescript
export const uploadDeliverable = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    minioKey: v.string(),
    sizeBytes: v.number(),
    mimeType: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Get current version for this deliverable name
    const existing = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .order("desc")
      .first();

    const version = existing ? existing.version + 1 : 1;

    // Create the deliverable
    const deliverableId = await ctx.db.insert("deliverables", {
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      version: version,
      status: "pending_qc",
      minioKey: args.minioKey,
      sizeBytes: args.sizeBytes,
      mimeType: args.mimeType,
      uploadedBy: profile._id,
    });

    return deliverableId;
  },
});
```

### Schema

**File**: `convex/schema.ts`

```typescript
deliverables: defineTable({
  projectId: v.id("projects"),
  name: v.string(),
  description: v.optional(v.string()),
  version: v.number(),
  status: deliverableStatusValidator, // pending_qc | approved | revision_needed | revision_requested
  minioKey: v.string(),
  sizeBytes: v.number(),
  mimeType: v.optional(v.string()),
  uploadedBy: v.id("profiles"),
  qcReviewedBy: v.optional(v.id("profiles")),
  qcNotes: v.optional(v.string()),
  rejectionNotes: v.optional(v.string()),
})
  .index("by_projectId", ["projectId"])
  .index("by_status", ["status"]),
```

---

## 🚀 Definition of Done

- [x] `uploadDeliverable` mutation created
- [x] Auto-versioning implemented
- [x] Initial status set to `pending_qc`
- [x] Schema with proper indexes
- [x] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                           |
| ---------- | ------------- | ------------------------------- |
| 2026-01-18 | ready-for-dev | Story created                   |
| 2026-02-04 | done          | Backend implementation complete |

---

**Previous Story**: Epic 5A complete  
**Next Story**: 6-2 - QC Review & Approval
