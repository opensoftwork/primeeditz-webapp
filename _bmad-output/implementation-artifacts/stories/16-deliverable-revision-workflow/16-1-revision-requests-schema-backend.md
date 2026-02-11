# Story 16-1: Revision Requests Schema & Backend

**Epic**: Epic 16 - Deliverable Revision Workflow  
**Status**: backlog  
**Complexity**: Medium-Large (8 points)  
**Created**: 2026-02-11  
**Priority**: MUST — Foundation for all revision workflow stories

---

## 📋 User Story

**As a** developer,  
**I want** a `revisionRequests` table with associated mutations and queries,  
**So that** revision requests are structured, support image attachments, and preserve full history.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                     | Status  | Notes                       |
| ------------------------------ | ------- | --------------------------- |
| **Epic 6 - Deliverables & QC** | ✅ Done | Base deliverable system     |
| **Epic 5A - Status Workflow**  | ✅ Done | Status transitions          |
| **MinIO Storage**              | ✅ Done | Image upload infrastructure |

### Enables

| Story / Epic                   | Notes                                       |
| ------------------------------ | ------------------------------------------- |
| **16-2 - Admin Revision Page** | Uses createRevisionRequest mutation         |
| **16-3 - Employee Workspace**  | Uses getRevisionRequests query              |
| **16-4 - Revision History**    | Uses getRevisionHistory query               |
| **16-5 - Studio Review**       | Uses createRevisionRequest (studio variant) |

### Current Problem

```
CURRENT (Text-Only, No History):
┌──────────────────────────────────┐
│ deliverables.rejectionNotes      │  ← Single string, overwritten each time
│ = "Please fix the color grading" │  ← Previous feedback LOST forever
└──────────────────────────────────┘

PROPOSED (Structured, Full History):
┌──────────────────────────────────────────────────────┐
│ revisionRequests                                       │
│ ├─ Request #1 (admin, 2 images, 3 notes) → resolved  │
│ ├─ Request #2 (studio, 1 image, 1 note)  → resolved  │
│ └─ Request #3 (admin, 0 images, 1 note)  → pending   │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Schema Definition

- [ ] **Given** the Convex schema
- [ ] **When** I define the `revisionRequests` table
- [ ] **Then** it includes all required fields (see schema below)
- [ ] **And** proper indexes exist for `by_deliverableId` and `by_projectId`

### AC2: Create Revision Request Mutation

- [ ] **Given** a deliverable with status `pending_qc` (admin) or `approved` (studio)
- [ ] **When** I call `createRevisionRequest` with notes and optional reference images
- [ ] **Then** a new `revisionRequests` record is created
- [ ] **And** the deliverable status is updated to `revision_requested` (admin) or `revision_needed` (studio)
- [ ] **And** the revision number auto-increments based on existing requests for that deliverable
- [ ] **And** the project state transitions appropriately

### AC3: Get Revision Requests Query

- [ ] **Given** a deliverable ID
- [ ] **When** I call `getRevisionRequests`
- [ ] **Then** I receive all revision requests for that deliverable, ordered by creation time
- [ ] **And** each request includes reference image signed URLs (if images exist)
- [ ] **And** the response includes the requester's profile name

### AC4: Resolve Revision Request Mutation

- [ ] **Given** a pending or in_progress revision request
- [ ] **When** the employee uploads a corrected deliverable version
- [ ] **Then** the revision request status → `resolved`
- [ ] **And** `resolvedDeliverableId` links to the new version
- [ ] **And** `resolvedAt` timestamp is set

### AC5: Update Revision Status Mutation

- [ ] **Given** an employee viewing a pending revision request
- [ ] **When** they start working on it
- [ ] **Then** revision request status → `in_progress`

### AC6: Backward Compatibility

- [ ] **Given** existing deliverables with `rejectionNotes`
- [ ] **Then** existing functionality continues to work
- [ ] **And** new revision requests are created alongside (not replacing) `rejectionNotes`

---

## 📘 Implementation

### Phase A: Schema Definition (~2 points)

#### Task A1: Add `revisionRequests` Table

**File**: `convex/schema.ts`

```typescript
// Revision request status validator
export const revisionRequestStatusValidator = v.union(
  v.literal("pending"),       // Awaiting employee action
  v.literal("in_progress"),   // Employee working on corrections
  v.literal("resolved"),      // New version uploaded, request fulfilled
);

// Reference image object validator
const revisionReferenceImageValidator = v.object({
  fileName: v.string(),
  fileSize: v.number(),
  mimeType: v.string(),
  minioKey: v.string(),
  note: v.optional(v.string()),  // Per-image note describing what's wrong
});

// Table definition
revisionRequests: defineTable({
  deliverableId: v.id("deliverables"),
  projectId: v.id("projects"),
  requestedBy: v.id("profiles"),
  requestedByRole: v.union(v.literal("admin"), v.literal("studio")),
  revisionNumber: v.number(),          // Auto-incremented: 1, 2, 3...
  notes: v.string(),                   // General revision description
  referenceImages: v.optional(v.array(revisionReferenceImageValidator)),
  annotations: v.optional(v.string()), // Future: JSON blob for PDF/image annotations
  status: revisionRequestStatusValidator,
  resolvedDeliverableId: v.optional(v.id("deliverables")), // Link to corrected version
  resolvedAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_deliverableId", ["deliverableId"])
  .index("by_projectId", ["projectId"])
  .index("by_status", ["status"]),
```

- [ ] A1.1 Define `revisionRequestStatusValidator`
- [ ] A1.2 Define `revisionReferenceImageValidator`
- [ ] A1.3 Add `revisionRequests` table with indexes
- [ ] A1.4 Verify schema pushes successfully

#### Task A2: Add `parentDeliverableId` to Deliverables Table

**File**: `convex/schema.ts`

> **⚠️ GAP FIX**: The current `deliverables` table has no way to link a corrected version back to the original deliverable. Versioning works by name-matching only, but for revision resolution we need an explicit parent link.

```typescript
// ADD to existing deliverables table definition:
deliverables: defineTable({
  // ... existing fields ...
  parentDeliverableId: v.optional(v.id("deliverables")), // Links corrected version to original
})
  .index("by_projectId", ["projectId"])
  .index("by_status", ["status"])
  .index("by_parentDeliverableId", ["parentDeliverableId"]), // NEW index
```

**Why needed**: When an employee uploads a corrected version of a deliverable, the system needs to know _which_ deliverable was being corrected so it can auto-resolve all pending `revisionRequests` on that original. Without this, we'd have to rely on fragile name-matching.

- [ ] A2.1 Add `parentDeliverableId` optional field to `deliverables` table
- [ ] A2.2 Add `by_parentDeliverableId` index
- [ ] A2.3 Verify existing deliverables are unaffected (field is optional)

---

### Phase B: Mutations (~3.5 points)

#### Task B1: Create Revision Request

**File**: `convex/functions/deliverables/mutations.ts`

```typescript
export const createRevisionRequest = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    notes: v.string(),
    referenceImages: v.optional(
      v.array(
        v.object({
          fileName: v.string(),
          fileSize: v.number(),
          mimeType: v.string(),
          minioKey: v.string(),
          note: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) throw new Error("Deliverable not found");

    // Determine role-based behavior
    const isAdmin = profile.role === "admin";
    const isStudio = profile.role === "studio";

    if (!isAdmin && !isStudio) {
      throw new Error("Only admin or studio can create revision requests");
    }

    // Validate deliverable is in a revisable state
    if (isAdmin && deliverable.status !== "pending_qc") {
      throw new Error(
        "Admin can only revise deliverables in pending_qc status",
      );
    }
    if (isStudio && deliverable.status !== "approved") {
      throw new Error("Studio can only revise approved deliverables");
    }

    // Auto-increment revision number
    const existingRequests = await ctx.db
      .query("revisionRequests")
      .withIndex("by_deliverableId", (q) =>
        q.eq("deliverableId", args.deliverableId),
      )
      .collect();
    const revisionNumber = existingRequests.length + 1;

    // Create the revision request
    const requestId = await ctx.db.insert("revisionRequests", {
      deliverableId: args.deliverableId,
      projectId: deliverable.projectId,
      requestedBy: profile._id,
      requestedByRole: isAdmin ? "admin" : "studio",
      revisionNumber,
      notes: args.notes,
      referenceImages: args.referenceImages,
      status: "pending",
      createdAt: now(),
    });

    // Update deliverable status
    const newStatus = isAdmin ? "revision_requested" : "revision_needed";
    await ctx.db.patch(args.deliverableId, {
      status: newStatus,
      rejectionNotes: args.notes, // Backward compat
    });

    // Transition project state (same as existing requestRevision logic)
    const project = await ctx.db.get(deliverable.projectId);
    if (project) {
      if (isAdmin) {
        await ctx.db.patch(deliverable.projectId, {
          actionState: "work_in_progress",
          awaitingActorRole: "employee",
          awaitingActorId: project.assignedEmployeeId,
          updatedAt: now(),
        });
      } else if (isStudio) {
        await ctx.db.patch(deliverable.projectId, {
          actionState: "revisions_requested",
          awaitingActorRole: "employee",
          awaitingActorId: project.assignedEmployeeId,
          revisionCount: (project.revisionCount || 0) + 1,
          updatedAt: now(),
        });
      }

      // Create handoff log
      await ctx.db.insert("handoffLogs", {
        projectId: deliverable.projectId,
        fromProfileId: profile._id,
        toProfileId: project.assignedEmployeeId,
        fromActionState: project.actionState,
        toActionState: isAdmin ? "work_in_progress" : "revisions_requested",
        notes: `Revision #${revisionNumber}: ${args.notes}`,
        createdAt: now(),
      });
    }

    return { requestId, revisionNumber };
  },
});
```

- [ ] B1.1 Create `createRevisionRequest` mutation
- [ ] B1.2 Validate role and deliverable status
- [ ] B1.3 Auto-increment revision number
- [ ] B1.4 Backward-compatible `rejectionNotes` update
- [ ] B1.5 Project state transition
- [ ] B1.6 Handoff log creation

#### Task B2: Update Revision Request Status

**File**: `convex/functions/deliverables/mutations.ts`

```typescript
export const updateRevisionRequestStatus = mutation({
  args: {
    requestId: v.id("revisionRequests"),
    status: v.union(v.literal("in_progress"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Revision request not found");

    const updates: any = { status: args.status };
    if (args.status === "resolved") {
      updates.resolvedAt = now();
    }

    await ctx.db.patch(args.requestId, updates);

    return { success: true };
  },
});
```

- [ ] B2.1 Create `updateRevisionRequestStatus` mutation
- [ ] B2.2 Handle `in_progress` and `resolved` transitions

#### Task B3: New `uploadCorrectedVersion` Mutation

**File**: `convex/functions/deliverables/mutations.ts`

> **⚠️ GAP FIX**: Rather than modifying `uploadDeliverable` (which is a simple, general-purpose upload), we create a **dedicated** mutation for corrected versions. This mutation handles the full cycle: creates the new deliverable with `parentDeliverableId`, resolves pending revision requests, and transitions the deliverable back to `pending_qc`.

```typescript
export const uploadCorrectedVersion = mutation({
  args: {
    parentDeliverableId: v.id("deliverables"),
    name: v.string(),
    minioKey: v.string(),
    sizeBytes: v.number(),
    mimeType: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);

    // Get the parent deliverable
    const parent = await ctx.db.get(args.parentDeliverableId);
    if (!parent) throw new Error("Parent deliverable not found");

    // Verify the parent has a pending revision
    if (
      parent.status !== "revision_requested" &&
      parent.status !== "revision_needed"
    ) {
      throw new Error("Parent deliverable does not have a pending revision");
    }

    // Auto-increment version based on name
    const existing = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", parent.projectId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .order("desc")
      .first();
    const version = existing ? existing.version + 1 : 1;

    // 1. Create the new corrected deliverable
    const newDeliverableId = await ctx.db.insert("deliverables", {
      projectId: parent.projectId,
      name: args.name,
      description: args.description,
      version,
      status: "pending_qc", // Goes back for QC review
      minioKey: args.minioKey,
      sizeBytes: args.sizeBytes,
      mimeType: args.mimeType,
      uploadedBy: profile._id,
      parentDeliverableId: args.parentDeliverableId, // Link to original
    });

    // 2. Resolve all pending revision requests on the parent
    const pendingRequests = await ctx.db
      .query("revisionRequests")
      .withIndex("by_deliverableId", (q) =>
        q.eq("deliverableId", args.parentDeliverableId),
      )
      .filter((q) => q.neq(q.field("status"), "resolved"))
      .collect();

    for (const request of pendingRequests) {
      await ctx.db.patch(request._id, {
        status: "resolved",
        resolvedDeliverableId: newDeliverableId,
        resolvedAt: now(),
      });
    }

    // 3. Transition project state back to deliverables_ready
    const project = await ctx.db.get(parent.projectId);
    if (project) {
      await ctx.db.patch(parent.projectId, {
        actionState: "deliverables_ready",
        awaitingActorRole: "admin",
        updatedAt: now(),
      });

      // Create handoff log
      await ctx.db.insert("handoffLogs", {
        projectId: parent.projectId,
        fromProfileId: profile._id,
        toProfileId: undefined, // Goes to admin pool
        fromActionState: project.actionState,
        toActionState: "deliverables_ready",
        notes: `Corrected version v${version} uploaded for "${args.name}"`,
        createdAt: now(),
      });
    }

    return { newDeliverableId, version };
  },
});
```

**Why a separate mutation instead of modifying `uploadDeliverable`**:

- `uploadDeliverable` is simple and general-purpose — used for initial deliverable uploads during production
- `uploadCorrectedVersion` is revision-aware — handles parent linking, auto-resolving requests, and project state transition
- Keeps concerns cleanly separated; `uploadDeliverable` remains unchanged

- [ ] B3.1 Create `uploadCorrectedVersion` mutation
- [ ] B3.2 Accept `parentDeliverableId` to link corrected version
- [ ] B3.3 Auto-resolve all pending revision requests on parent
- [ ] B3.4 Set `resolvedDeliverableId` on resolved requests
- [ ] B3.5 Transition project state to `deliverables_ready` for admin re-review
- [ ] B3.6 Create handoff log

#### Task B4: Deprecation Plan for Legacy Mutations

**File**: `convex/functions/deliverables/mutations.ts`

> **⚠️ GAP FIX**: The codebase currently has TWO admin rejection mutations that overlap with the new `createRevisionRequest`:
>
> - `requestRevision` → sets `revision_requested`, transitions project to `work_in_progress`
> - `rejectDeliverable` → sets `revision_needed`, does NOT transition project
>
> These must be handled carefully to avoid breaking existing UI while transitioning.

**Strategy**: Phase-in deprecation

```
Phase 1 (This Story):
├─ Create new `createRevisionRequest` mutation
├─ Mark `requestRevision` as @deprecated in JSDoc
├─ Mark `rejectDeliverable` as @deprecated in JSDoc
├─ Both old mutations continue working (no breaking changes)
└─ New frontend code uses `createRevisionRequest` only

Phase 2 (Story 16-2 / 16-5):
├─ Admin revision page calls `createRevisionRequest`
├─ Studio revision dialog calls `createRevisionRequest`
└─ Old `RevisionDialog` component updated to call new mutation

Phase 3 (Cleanup - after all stories done):
├─ Remove `requestRevision` mutation
├─ Remove `rejectDeliverable` mutation
├─ Remove all frontend references to old mutations
└─ Clean up any unused code
```

```typescript
// ADD deprecation markers to existing mutations:

/**
 * @deprecated Use `createRevisionRequest` instead.
 * Kept for backward compatibility during migration.
 * Request revision on a deliverable. Sends it back to employee for rework.
 */
export const requestRevision = mutation({ ... }); // KEEP AS-IS

/**
 * @deprecated Use `createRevisionRequest` instead.
 * Kept for backward compatibility during migration.
 * Reject a deliverable entirely.
 */
export const rejectDeliverable = mutation({ ... }); // KEEP AS-IS
```

- [ ] B4.1 Add `@deprecated` JSDoc to `requestRevision` mutation
- [ ] B4.2 Add `@deprecated` JSDoc to `rejectDeliverable` mutation
- [ ] B4.3 Ensure both old mutations still work (no breaking changes yet)
- [ ] B4.4 Document cleanup plan for Phase 3 in epic tracker

---

### Phase C: Queries (~1.5 points)

#### Task C1: Get Revision Requests for Deliverable

**File**: `convex/functions/deliverables/queries.ts`

```typescript
export const getRevisionRequests = query({
  args: {
    deliverableId: v.id("deliverables"),
  },
  handler: async (ctx, args) => {
    await getAuthUserWithProfile(ctx);

    const requests = await ctx.db
      .query("revisionRequests")
      .withIndex("by_deliverableId", (q) =>
        q.eq("deliverableId", args.deliverableId),
      )
      .order("asc")
      .collect();

    // Enrich with requester names
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const requester = await ctx.db.get(r.requestedBy);
        return {
          ...r,
          requestedByName: requester
            ? `${requester.firstName} ${requester.lastName}`
            : "Unknown",
        };
      }),
    );

    return enriched;
  },
});
```

- [ ] C1.1 Create `getRevisionRequests` query
- [ ] C1.2 Enrich with requester profile names
- [ ] C1.3 Order by creation time ascending

#### Task C2: Get Revision History for Project

**File**: `convex/functions/deliverables/queries.ts`

```typescript
export const getProjectRevisionHistory = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await getAuthUserWithProfile(ctx);

    const requests = await ctx.db
      .query("revisionRequests")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    // Enrich with deliverable names and requester names
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const deliverable = await ctx.db.get(r.deliverableId);
        const requester = await ctx.db.get(r.requestedBy);
        return {
          ...r,
          deliverableName: deliverable?.name || "Unknown",
          requestedByName: requester
            ? `${requester.firstName} ${requester.lastName}`
            : "Unknown",
        };
      }),
    );

    return enriched;
  },
});
```

- [ ] C2.1 Create `getProjectRevisionHistory` query
- [ ] C2.2 Enrich with deliverable names
- [ ] C2.3 Order by creation time descending

---

## 🧪 Testing Checklist

### Schema

- [ ] `revisionRequests` table deploys without errors
- [ ] Indexes `by_deliverableId`, `by_projectId`, `by_status` are functional

### Create Revision Request

**Note**: There are two separate approval gates — Admin QC reviews `pending_qc` deliverables, and Studio/Client reviews deliverables that already passed QC (`approved`). Studio revisions happen _after_ the deliverable has been QC-approved and sent to the client.

- [ ] Admin can create revision for `pending_qc` deliverable (QC rejection → `revision_requested`)
- [ ] Studio can create revision for `approved` deliverable (client-side change request → `revision_needed`)
- [ ] Admin CANNOT revise an `approved` deliverable (must go through studio flow)
- [ ] Studio CANNOT revise a `pending_qc` deliverable (hasn't passed QC yet)
- [ ] Employee cannot create revision requests
- [ ] Revision number auto-increments correctly
- [ ] Reference images array stored correctly
- [ ] Deliverable status transitions correctly:
  - Admin revise: `pending_qc` → `revision_requested`
  - Studio revise: `approved` → `revision_needed`
- [ ] Project state transitions correctly:
  - Admin revise: project → `work_in_progress`, actor → `employee`
  - Studio revise: project → `revisions_requested`, actor → `employee`
- [ ] Handoff log is created

### Queries

- [ ] `getRevisionRequests` returns all for a deliverable
- [ ] `getProjectRevisionHistory` returns all for a project
- [ ] Requester names are enriched
- [ ] Empty results return empty arrays

### Upload Corrected Version

- [ ] `uploadCorrectedVersion` creates new deliverable with `parentDeliverableId`
- [ ] New deliverable starts at `pending_qc` status
- [ ] All pending revision requests on parent are auto-resolved
- [ ] `resolvedDeliverableId` correctly links to new version
- [ ] Project transitions back to `deliverables_ready` for admin re-review
- [ ] Handoff log created
- [ ] Version auto-increments correctly

### Legacy Mutation Compatibility

- [ ] `requestRevision` still works (backward compat)
- [ ] `rejectDeliverable` still works (backward compat)
- [ ] Both marked as `@deprecated` in code
- [ ] No existing frontend functionality broken

### Edge Cases

- [ ] Multiple revision requests for same deliverable
- [ ] Revision request with 0 images (notes-only)
- [ ] Resolving request when new version uploaded via `uploadCorrectedVersion`
- [ ] Cannot revise a deliverable that's already been revised (status guard)
- [ ] `parentDeliverableId` is optional — existing deliverables without it continue to work
- [ ] Uploading corrected version for a deliverable with no revision requests — should still work (just no auto-resolution)

---

## 🚀 Definition of Done

- [ ] `revisionRequests` table in schema with indexes
- [ ] `parentDeliverableId` field added to `deliverables` table with index
- [ ] `createRevisionRequest` mutation with role-based validation
- [ ] `updateRevisionRequestStatus` mutation
- [ ] `uploadCorrectedVersion` mutation with parent linking + auto-resolve
- [ ] `requestRevision` and `rejectDeliverable` marked `@deprecated`
- [ ] `getRevisionRequests` query (by deliverable)
- [ ] `getProjectRevisionHistory` query (by project)
- [ ] All existing tests pass (no regressions)
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-11 | backlog | Story created |

---

**Previous Story**: N/A (First story in Epic 16)  
**Next Story**: 16-2 - Admin Revision Page with Image Upload
