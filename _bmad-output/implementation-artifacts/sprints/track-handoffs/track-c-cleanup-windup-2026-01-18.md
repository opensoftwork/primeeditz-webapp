# 🎯 Sprint Track Handoff: Track C - Cleanup & Wind-Up

**Assigned To**: Junior Developer  
**Assigned By**: Life-design (Senior Developer)  
**Date**: 2026-01-18  
**Track**: C (Cleanup & Hardening)  
**Estimated Duration**: 1-2 weeks

---

## 🚀 Quick Start

**To begin working on this track:**

1. Open this file and read the Mission Briefing
2. Review the stories in priority order (Critical → High → Medium)
3. Use the `/dev` agent command to start implementation
4. Mark stories as `in-progress` when you start, `done` when complete

---

## 📋 Mission Briefing

### What You're Building

You are implementing **cleanup, hardening, and missing features** that were identified during rapid development across all epics. These are the "wind-up" tasks that ensure production-readiness, proper data handling, and complete feature coverage.

### Why This Matters

```
Your Work (Track C)                    Impact
─────────────────────                  ─────────────────────────────────

[C-1] Project Deletion ────────────────► Data integrity & storage cleanup
      "Proper cascade delete with          MinIO files not orphaned
       soft-delete flow"

[C-2] Client Edit/Delete ─────────────► Complete CRUD operations
      "Missing actions from                Admin can manage all clients
       client list"

[C-3] Project Edit ───────────────────► Admin workflow completion
      "Missing edit action in              Projects can be modified
       project list"

[C-4] Type Consolidation ─────────────► Code maintainability
      "Already done - verify only"         Single source of truth for types
```

**This track ensures the application is production-ready with no loose ends!**

---

## 📁 Your Assigned Stories (In Priority Order)

---

### Story C-1: Enhanced Project Deletion with Soft Delete & Storage Cleanup

**Priority**: 🔴 CRITICAL  
**Points**: 8  
**Epic Reference**: Epic 3 - Admin Portal Management

**Summary**: Implement industry-standard project deletion with soft-delete flow, MinIO cleanup, and quotation handling.

**Background**: Current `deleteProject` mutation only removes database records but:

- Does NOT delete files from MinIO storage
- Does NOT handle linked quotations properly
- Has NO soft-delete/trash phase for recovery

**Key Deliverables**:

#### A. Schema Changes

- [ ] Add `deletedAt?: number` field to `projects` table
- [ ] Add `deletedBy?: Id<"profiles">` field to `projects` table
- [ ] Add `isDeleted?: boolean` field (or use deletedAt presence)

#### B. Backend: Soft Delete Flow

**File**: `convex/functions/projects/mutations.ts`

- [ ] Create `softDeleteProject` mutation:
  ```typescript
  // Sets deletedAt, deletedBy, hides from queries
  // Does NOT actually delete any data yet
  ```
- [ ] Create `restoreProject` mutation:
  ```typescript
  // Clears deletedAt/deletedBy, restores visibility
  // Only works within grace period (e.g., 30 days)
  ```
- [ ] Create `permanentlyDeleteProject` mutation (admin-only):
  ```typescript
  // 1. Unlink quotations (remove projectId, keep quotation record)
  // 2. Queue MinIO file deletion (reference files, assets, deliverables)
  // 3. Delete database records in cascade order
  ```

#### C. Backend: MinIO Storage Cleanup Action

**File**: `convex/functions/storage/cleanup.ts` (NEW)

- [ ] Create `cleanupProjectStorage` action:
  ```typescript
  // Accepts list of MinIO keys
  // Uses S3 DeleteObjects API
  // Handles errors gracefully (log failures, don't block)
  // Returns success/failure counts
  ```

#### D. Backend: Quotation Unlinking

**File**: `convex/functions/quotations/mutations.ts` (or inline)

- [ ] When project is permanently deleted:
  - Remove `projectId` from quotation if single project
  - Remove from `projectIds` array if multi-project
  - Add `deletedProjectNote?: string` to quotation (e.g., "Project PE-202601-001 deleted on 2026-01-18")
  - **NEVER cascade delete quotations** (financial records)

#### E. Frontend Updates

**File**: `src/components/modules/admin/projects/project-list/project-actions.tsx`

- [ ] Update delete dialog to explain soft-delete:
  ```
  "This project will be moved to Trash for 30 days.
   After that, it will be permanently deleted along with all files."
  ```
- [ ] Add "Permanently Delete" option (only for trashed projects)
- [ ] Add "Restore" option for trashed projects

#### F. Query Updates

- [ ] Update `getAdminProjectsPaginated` to exclude `deletedAt != null` by default
- [ ] Add `includeTrashed?: boolean` parameter for admin trash view
- [ ] Create `getTrashedProjects` query for trash management page

**Acceptance Criteria**:

- [ ] Soft delete moves project to "trash" state
- [ ] Project can be restored within 30 days
- [ ] Permanent delete removes all MinIO files
- [ ] Quotations are unlinked, not deleted
- [ ] Status history is preserved (or archived)
- [ ] No orphaned files in MinIO after permanent delete

---

### Story C-2: Client Edit & Delete Actions

**Priority**: 🟠 HIGH  
**Points**: 3  
**Epic Reference**: Epic 3 - Admin Portal Management

**Summary**: Implement the missing Edit and Delete actions in the client list.

**Background**: The client list has TODO comments at lines 132 and 141 in `columns.tsx`:

```typescript
// TODO: Implement edit
// TODO: Implement delete
```

**Key Deliverables**:

#### A. Client Edit

**File**: `src/components/modules/admin/clients/` (new drawer or modal)

- [ ] Create `client-edit-drawer.tsx`:
  - Form fields: name, email, phone, company
  - Uses React Hook Form + Zod validation
  - Calls update mutation

**File**: `convex/functions/profiles/mutations.ts` (or similar)

- [ ] Create `updateClientProfile` mutation:
  - Only admins can update client profiles
  - Updates: name, phone, company (email may be read-only depending on auth)

#### B. Client Delete (Soft Delete)

- [ ] Create `deactivateClient` mutation:
  - Adds `deactivatedAt`, `deactivatedBy` to profile
  - Does NOT delete - clients may have project history
  - Prevents login (check in auth flow)
- [ ] Create `reactivateClient` mutation for restoration

#### C. UI Updates

**File**: `src/components/modules/admin/clients/client-list/columns.tsx`

- [ ] Replace TODO comments with actual implementations:

  ```typescript
  // Edit: Open ClientEditDrawer
  onClick: () => openEditDrawer(client);

  // Delete: Show confirmation, call deactivateClient
  onClick: () => openDeactivateDialog(client);
  ```

**Acceptance Criteria**:

- [ ] Admin can edit client profile details
- [ ] Admin can deactivate (soft-delete) clients
- [ ] Admin can reactivate deactivated clients
- [ ] Deactivated clients cannot log in
- [ ] Client project history is preserved

---

### Story C-3: Project Edit Action

**Priority**: 🟠 HIGH  
**Points**: 3  
**Epic Reference**: Epic 3 - Admin Portal Management

**Summary**: Implement the missing Edit action in the project list.

**Background**: The project actions has a TODO at line 87:

```typescript
// TODO: Implement edit - navigate to edit page or open modal
```

**Key Deliverables**:

#### A. Edit Options (Choose One)

**Option 1: Navigate to Edit Page** (Recommended for complex edits)

- [ ] Create `/admin/projects/[projectId]/edit/page.tsx`
- [ ] Reuse wizard components in "edit mode"
- [ ] Pre-populate form with existing project data

**Option 2: Edit Drawer** (For simpler edits)

- [ ] Create `project-edit-drawer.tsx`
- [ ] Allow editing: eventName, eventDate, venue, description, notes, deliveryDate
- [ ] Some fields may be read-only after certain statuses

#### B. Backend

**File**: `convex/functions/projects/mutations.ts`

- [ ] Enhance `updateDraft` or create `updateProject` mutation:
  - Allow editing more fields for non-draft projects
  - Restrict certain fields based on status (e.g., can't change projectType after folders created)

#### C. UI Integration

**File**: `src/components/modules/admin/projects/project-list/project-actions.tsx`

- [ ] Replace TODO with navigation or drawer open:
  ```typescript
  onClick: () => router.push(`/projects/${project._id}/edit`);
  // OR
  onClick: () => setEditDrawerOpen(true);
  ```

**Acceptance Criteria**:

- [ ] Admin can edit project details
- [ ] Appropriate fields are locked based on project status
- [ ] Edit history is tracked (optional: add to statusHistory)
- [ ] Changes reflect immediately in UI

---

### Story C-4: Type Consolidation Verification

**Priority**: 🟢 MEDIUM (Already Implemented - Verify Only)  
**Points**: 1  
**Epic Reference**: Cross-Epic Cleanup

**Summary**: Verify the type consolidation implemented on 2026-01-18 is working correctly.

**Background**: We consolidated duplicate quotation types into a single source of truth at:
`src/components/modules/admin/quotations/types.ts`

**Verification Checklist**:

- [ ] Run `npx tsc --noEmit` - should have no quotation-related type errors
- [ ] Verify `builder/types.ts` re-exports correctly
- [ ] Verify `preview/` components use centralized types
- [ ] Verify `client/quotations/` uses centralized types
- [ ] Verify `quotation-templates/price-preview.tsx` uses centralized types
- [ ] Test quotation PDF download still works
- [ ] Test quotation preview still works

**No code changes needed** - just verification and testing.

---

## 🏗️ Technical Context

### Schema Reference

Current project deletion related fields:

```typescript
// convex/schema.ts

projects: defineTable({
  // ... existing fields ...

  // Archive tracking (exists)
  archivedAt: v.optional(v.number()),
  archivedBy: v.optional(v.id("profiles")),

  // ADD these for soft delete:
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.id("profiles")),
});
```

### Related Tables (Cascade Delete Order)

```
projects (parent)
  ├── assets (by projectId) - has minioKey
  ├── folders (by projectId)
  ├── deliverables (by projectId) - has minioKey
  ├── statusHistory (by projectId)
  └── quotations (via projectId/projectIds) - UNLINK ONLY
```

### MinIO Cleanup Reference

```typescript
// Use existing S3 client pattern from:
// convex/functions/projects/storage.ts

import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

// Delete multiple objects in one call
const command = new DeleteObjectsCommand({
  Bucket: process.env.MINIO_BUCKET,
  Delete: {
    Objects: keys.map((key) => ({ Key: key })),
  },
});
```

### Existing Patterns to Follow

| Purpose             | Reference File                        |
| ------------------- | ------------------------------------- |
| Soft delete pattern | `archiveProject` mutation             |
| S3 client setup     | `convex/functions/storage/actions.ts` |
| Admin mutations     | `convex/lib/customFunctions.ts`       |
| Action patterns     | `DataTableRowActions` component       |
| Drawer patterns     | Any existing drawer component         |

---

## ✅ Definition of Done (Per Story)

For each story, ensure:

- [ ] Backend queries and mutations work correctly
- [ ] UI matches existing premium design aesthetic
- [ ] Form validation with Zod where applicable
- [ ] Loading and error states handled
- [ ] Toast notifications for success/error
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Manual testing completed
- [ ] This handoff file updated with progress

---

## 📞 Communication Protocol

### When to Sync with Senior

1. **Before starting C-1** — Confirm soft-delete approach
2. **After C-1 backend complete** — Review before building UI
3. **If blocked** — Don't wait more than 30 minutes
4. **When done** — Final review before merging

### Questions to Ask Before Starting

- Should soft-deleted projects be visible in any "trash" UI?
- What's the grace period for restoration? (Suggested: 30 days)
- Should we send notifications when projects are deleted?

---

## 💬 Initialization Prompt for AI Assistant

```
I am working on Track C (Cleanup & Wind-Up) of the PrimeEditz sprint. Please read:
1. This handoff file: _bmad-output/implementation-artifacts/sprints/track-handoffs/track-c-cleanup-windup-2026-01-18.md
2. The current deleteProject mutation: convex/functions/projects/mutations.ts (lines 482-540)
3. The schema: convex/schema.ts

Help me implement Story C-1: Enhanced Project Deletion with Soft Delete & Storage Cleanup.
Start with the schema changes, then the soft delete mutation.
```

---

## 📊 Progress Tracker

| Story                  | Priority    | Status         | Started | Completed | Notes                     |
| ---------------------- | ----------- | -------------- | ------- | --------- | ------------------------- |
| C-1 Project Deletion   | 🔴 Critical | ⬜ Not Started |         |           | Most complex - start here |
| C-2 Client Edit/Delete | 🟠 High     | ⬜ Not Started |         |           |                           |
| C-3 Project Edit       | 🟠 High     | ⬜ Not Started |         |           |                           |
| C-4 Type Verification  | 🟢 Medium   | ⬜ Not Started |         |           | Quick verification only   |

**Update this table as you progress!**

---

## 📋 Reference: Industry Best Practices Applied

This track follows industry-standard patterns used by Salesforce, Notion, Linear, etc.:

1. **Soft Delete First**: User action = move to trash, not permanent delete
2. **Grace Period**: 30-day window for recovery
3. **Cascade with Care**: Child records cascade, financial records unlink
4. **Async Storage Cleanup**: File deletion is backgrounded, not blocking
5. **Audit Trail**: Keep history even after delete (or archive to cold storage)

---

**Good luck! 🚀**

_— Life-design_
