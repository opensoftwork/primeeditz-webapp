# Story 3-5: Update Project Status

**Epic**: Epic 3 - Admin Portal & System Management  
**Status**: ready-for-dev  
**Complexity**: Medium (3 points)  
**Created**: 2026-01-17  
**Priority**: HIGH — Core workflow management
**Track**: B (Parallel development)

---

## 📋 User Story

**As an** Admin,  
**I want** to manually update a project's status,  
**So that** I can move projects through the workflow.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                    | Status | Notes                                     |
| ----------------------------- | ------ | ----------------------------------------- |
| **3-3: Admin Project Detail** | done   | Page where status update is triggered     |
| **Convex `updateStatus`**     | done   | Mutation already exists in `mutations.ts` |

### Enables

| Story                       | Notes                                   |
| --------------------------- | --------------------------------------- |
| **Epic 5: Asset Upload**    | Moves project to `active`/`in_progress` |
| **Epic 7: Status Tracking** | Provides history for tracking           |

---

## ✅ Acceptance Criteria

### AC1: Status Update Trigger

- [ ] "Update Status" button in Project Detail Header opens a drawer/modal
- [ ] Drawer shows "Update Project Status" title and project info
- [ ] Current status is displayed prominently

### AC2: Status Selection

- [ ] Dropdown displays available status transitions
- [ ] Statuses: `pending_review`, `active`, `in_progress`, `completed`, `archived`
- [ ] Selection is clear with consistent snake_case formatting but human-readable labels

### AC3: State Persistance

- [ ] Confirming the update triggers the `api.functions.projects.mutations.updateStatus` mutation
- [ ] Mutation correctly patches the `projects` table
- [ ] Mutation correctly inserts a record into `statusHistory` table

### AC4: Real-time Updates

- [ ] Successful update closes drawer and shows success toast
- [ ] UI reflects new status immediately via Convex subscription
- [ ] "Update Status History" list on project detail page reflects the new entry

---

## 📘 Implementation Tasks

### Phase A: UI Components (~2 points)

**File**: `src/components/modules/admin/projects/status-update/`

- [ ] Create `status-update-drawer.tsx`:
  - Receives `projectId` and `currentStatus`
  - Uses `updateStatus` mutation
  - Implements status selection list
  - Handles loading and success states

**File**: `src/components/modules/admin/projects/project-detail/`

- [ ] Update `index.tsx`:
  - Add `isStatusUpdateOpen` state
  - Pass toggle handler to `ProjectHeader`
  - Render `StatusUpdateDrawer`
- [ ] Update `project-header.tsx`:
  - Receive `onUpdateStatus` prop
  - Connect "UPDATE STATUS" button to the handler

### Phase B: Refine Mutation (Optional) (~1 point)

**File**: `convex/functions/projects/mutations.ts`

- [ ] Verify `updateStatus` mutation:
  - Ensure it validates permissions (Admin-only)
  - Ensure it correctly captures `changedBy` (logged-in user ID)
  - Ensure it triggers a timestamp update

---

## 🎨 UX Design

### Status Update Drawer

```
┌─────────────────────────────────────────────────────────────────┐
│  Update Project Status                                     [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📁 PROJECT: Wedding of Rahul & Priya                           │
│  📋 CODE: PRJ-2026-00042                                        │
│  📊 CURRENT: Pending Review                                     │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SELECT NEW STATUS                                              │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  ○ Pending Review                                                │
│  ● Active (Confirmed / Ready)                                    │
│  ○ In Progress (Editing Started)                                 │
│  ○ Completed (Ready for QC)                                      │
│  ○ Archived                                                      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Cancel]                          [✓ Update Status]            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧟 Legacy Checklist (Technical Guardrails)

- [ ] Use **Next.js 15 App Router** patterns
- [ ] Use **React Hook Form + Zod** for input validation
- [ ] Use **Convex subscriptions** for real-time state
- [ ] Use **shadcn/ui** components (Drawer, Dropdown, Button)
- [ ] Follow **OKLCH-based theming**

---

## 🚀 Definition of Done

- [ ] Status update drawer functional
- [ ] Status history correctly recorded in database
- [ ] UI reflects changes in real-time
- [ ] Success/Error feedback provided via Sonner toasts
- [ ] Story marked as `done` in `sprint-status.yaml`

---

**Previous Story**: 3-4 - Project Stage/Folder Setup  
**Next Story**: 3-6 - Employee Management CRUD
