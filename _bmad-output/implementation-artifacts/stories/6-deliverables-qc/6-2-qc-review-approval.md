# Story 6-2: QC Review & Approval

**Epic**: Epic 6 - Deliverables & QC Workflow  
**Status**: done  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-18  
**Updated**: 2026-02-04  
**Priority**: MUST — Core QC gate functionality

---

## 📋 User Story

**As an** Admin (QC role),  
**I want** to review and approve/reject deliverables,  
**So that** only quality work is shown to clients.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                       | Status  | Notes                        |
| -------------------------------- | ------- | ---------------------------- |
| **6-1 - Upload Deliverables**    | ✅ Done | Deliverables exist to review |
| **5A - Project Status Workflow** | ✅ Done | Status transitions           |

### Enables

| Story / Epic           | Notes                                |
| ---------------------- | ------------------------------------ |
| **6-3 - Client View**  | Approved deliverables become visible |
| **6-5 - UI Reactions** | Real-time feedback on approve/reject |

### Data Flow

```
Admin Portal
      │
      ↓ Navigate to Project → Deliverables
      │
┌─────────────────────────────────────────────────────────────┐
│  📋 DELIVERABLE DETAIL                                      │
│  ─────────────────────────────────────────────────────────  │
│  ┌───────────────────────────────┐  ┌─────────────────────┐ │
│  │                               │  │ STATUS              │ │
│  │     PREVIEW NOT AVAILABLE     │  │ ⏳ PENDING QC       │ │
│  │     [ Download File ]         │  │                     │ │
│  │                               │  │ SUBMITTED BY        │ │
│  │                               │  │ 👤 John (Employee)  │ │
│  └───────────────────────────────┘  │                     │ │
│                                     │ ─────────────────── │ │
│                                     │ [✅ Approve] [↩ Revise] │ │
│                                     └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Deliverable Preview

- [x] **Given** a project with `actionState: 'deliverables_ready'`
- [x] **And** a deliverable with status `pending_qc`
- [x] **When** I navigate to the deliverable detail
- [x] **Then** I see a preview (if supported) or download button
- [x] **And** I see file metadata (name, size, version, upload date)

### AC2: Approve Action

- [x] **Given** I am viewing a `pending_qc` deliverable
- [x] **When** I click "Approve"
- [x] **Then** deliverable status → `approved`
- [x] **And** project → `awaiting_review`
- [x] **And** `awaitingActorRole` → `studio`

### AC3: Revise/Reject Action

- [x] **Given** I am viewing a `pending_qc` deliverable
- [x] **When** I click "Revise" with notes
- [x] **Then** deliverable status → `revision_requested`
- [x] **And** project → `work_in_progress`
- [x] **And** `awaitingActorRole` → `employee`
- [x] **And** handoff log is created

### AC4: Send to Studio

- [x] **Given** an `approved` deliverable
- [x] **When** I click "Send to Studio"
- [x] **Then** project transitions to `awaiting_review`
- [x] **And** studio is notified (real-time)

---

## 📘 Implementation (COMPLETED)

### Backend Mutations

**File**: `convex/functions/deliverables/mutations.ts`

#### approveDeliverable

```typescript
export const approveDeliverable = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    qcNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    if (profile.role !== "admin") {
      throw new Error("Only admin can approve deliverables");
    }

    await ctx.db.patch(args.deliverableId, {
      status: "approved",
      qcReviewedBy: profile._id,
      qcNotes: args.qcNotes,
    });

    // Update project state
    const deliverable = await ctx.db.get(args.deliverableId);
    const project = await ctx.db.get(deliverable.projectId);
    if (project?.actionState === "deliverables_ready") {
      await ctx.db.patch(deliverable.projectId, {
        actionState: "awaiting_review",
        awaitingActorRole: "studio",
        updatedAt: now(),
      });
    }

    return { success: true };
  },
});
```

#### requestRevision

```typescript
export const requestRevision = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    rejectionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    if (profile.role !== "admin") {
      throw new Error("Only admin can request revisions");
    }

    await ctx.db.patch(args.deliverableId, {
      status: "revision_requested",
      qcReviewedBy: profile._id,
      rejectionNotes: args.rejectionNotes,
    });

    // Transition project back to work_in_progress
    const deliverable = await ctx.db.get(args.deliverableId);
    const project = await ctx.db.get(deliverable.projectId);

    await ctx.db.patch(deliverable.projectId, {
      actionState: "work_in_progress",
      awaitingActorRole: "employee",
      awaitingActorId: project.assignedEmployeeId,
      updatedAt: now(),
    });

    // Record handoff log
    await ctx.db.insert("handoffLogs", {
      projectId: deliverable.projectId,
      fromProfileId: profile._id,
      toProfileId: project.assignedEmployeeId,
      fromActionState: "deliverables_ready",
      toActionState: "work_in_progress",
      notes: `Revision requested: ${args.rejectionNotes}`,
      createdAt: now(),
    });

    return { success: true };
  },
});
```

#### sendToStudio

```typescript
export const sendToStudio = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify admin, deliverable approved, project has studio
    // Update project to awaiting_review with actor = studio
    // Create handoff log
  },
});
```

### Frontend Component

**File**: `src/components/modules/admin/projects/project-detail/individual-delivrable.tsx`

- ✅ Deliverable detail view with preview
- ✅ Approve/Revise buttons
- ✅ Revision dialog with notes
- ✅ Version history panel
- ✅ Send to Studio action

---

## 🚀 Definition of Done

- [x] `approveDeliverable` mutation complete
- [x] `requestRevision` mutation complete
- [x] `sendToStudio` mutation complete
- [x] Handoff logging on transitions
- [x] Admin UI for review actions
- [x] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status        | Notes                       |
| ---------- | ------------- | --------------------------- |
| 2026-01-18 | ready-for-dev | Story created               |
| 2026-02-04 | done          | Backend + Admin UI complete |

---

**Previous Story**: 6-1 - Upload Deliverables  
**Next Story**: 6-3 - Client View Approved Deliverables
