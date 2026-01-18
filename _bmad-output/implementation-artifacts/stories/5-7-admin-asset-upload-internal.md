# Story 5-7: Admin Asset Upload for Internal Projects

**Epic**: Epic 5 - Asset Upload & Folder Management  
**Status**: ready-for-dev  
**Complexity**: Medium (3 points)  
**Created**: 2026-01-18  
**Priority**: SHOULD — Portfolio and internal work support

---

## 📋 User Story

**As an** Admin,  
**I want** to upload assets directly to internal projects,  
**So that** I can manage projects that don't have a client (portfolio work, internal projects).

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                    | Status  | Notes                              |
| ----------------------------- | ------- | ---------------------------------- |
| **5-1 to 5-5**                | Pending | Core upload flow                   |
| **Internal project creation** | 3-x     | Admin can create internal projects |

### Special Consideration

Internal projects (`source = 'admin_init'`) skip the quotation workflow entirely. This story ensures:

1. Folder setup works without quotation
2. Upload works without quotation approval gate
3. Storage limits still apply (from project creation)

---

## ✅ Acceptance Criteria

### AC1: Upload Unlocked Without Quotation

- [ ] **Given** a project with `source = 'admin_init'` (internal)
- [ ] **When** admin navigates to project's Assets section
- [ ] **Then** upload is unlocked WITHOUT quotation approval
- [ ] **And** no "quotation required" gate is shown

### AC2: Storage from Project Settings

- [ ] **Given** internal project with storage tier from creation
- [ ] **Then** storage limits apply from project settings
- [ ] **And** storage bar shows allocated space
- [ ] **And** enforcement works same as client uploads

### AC3: Same Upload Flow

- [ ] **Given** admin is uploading to internal project
- [ ] **Then** same dual-strategy upload works:
  - Pre-signed URLs for <100MB
  - tus resumable for >100MB
- [ ] **And** progress tracking works
- [ ] **And** validation works

### AC4: Mark Assets Ready

- [ ] **Given** admin has uploaded files to internal project
- [ ] **When** admin clicks "Mark Assets Ready"
- [ ] **Then** project status changes to `in_progress`
- [ ] **And** no client notification (internal project)

### AC5: Admin Folder View

- [ ] **Given** internal project with folders
- [ ] **Then** admin sees same folder UI as client view
- [ ] **And** can upload to any folder
- [ ] **And** can view file counts and status

---

## 🎨 UX Design

### Admin Project Detail - Internal Project Notice

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PROJECT: PRIME-INT-2026-001                           📁 INTERNAL      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  📌 INTERNAL PROJECT                                                ││
│  │     This project doesn't have an external client.                   ││
│  │     Uploads are enabled without quotation approval.                 ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  [Rest of project detail...]                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Admin Assets Section

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ASSETS                                               📤 Upload Ready   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📊 STORAGE: ████░░░░░░ 25GB / 100GB                                    │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  │  📁 Raw Footage     │  │  📁 Audio           │  │  📁 Graphics        │
│  │  45 files           │  │  0 files            │  │  12 files           │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘
│                                                                          │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐│
│    📤 DRAG FILES HERE TO UPLOAD                                        ││
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘│
│                                                                          │
│                         [✅ MARK ASSETS READY]                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Gate Exception Logic (~1 point)

#### Task A1: Update Upload Gate Check

**File**: `convex/lib/uploadGate.ts` (from 5-2)

The gate check ALREADY has this exception (per 5-2 spec):

```typescript
// Exception: Internal projects skip quotation
if (project.source === "admin_init") {
  return { unlocked: true };
}
```

- [ ] A1.1 Verify gate exception works for admin_init
- [ ] A1.2 Test with internal project

#### Task A2: Storage Source for Internal Projects

**File**: `convex/functions/storage/queries.ts` (extend)

```typescript
// For internal projects, storage comes from project.storageAllocated
// Not from quotation (since no quotation exists)

export const getInternalProjectStorage = adminQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (project?.source === "admin_init") {
      return {
        allocated: project.storageAllocated || 100 * 1024 * 1024 * 1024, // Default 100GB
        used: await calculateUsedStorage(ctx, args.projectId),
      };
    }
    // Fall back to quotation-based storage
  },
});
```

- [ ] A2.1 Handle storage source for internal projects
- [ ] A2.2 Default storage if not specified

---

### Phase B: Admin Upload UI (~1.5 points)

#### Task B1: Internal Project Badge

**File**: `src/components/modules/admin/projects/project-detail/project-header.tsx` (extend)

- [ ] B1.1 Add "INTERNAL" badge for admin_init projects
- [ ] B1.2 Distinct styling (different color)

#### Task B2: Admin Assets Section

The admin project detail already has `ProjectFoldersList` component.

**File**: `src/components/modules/admin/projects/project-detail/admin-assets-section.tsx`

- [ ] B2.1 Create admin assets section
- [ ] B2.2 Include upload zone (reuse from client)
- [ ] B2.3 Include storage bar
- [ ] B2.4 Include folder grid
- [ ] B2.5 Include "Mark Assets Ready" button

#### Task B3: Admin Upload Hooks

- [ ] B3.1 Reuse client upload hooks (same mechanism)
- [ ] B3.2 Pass admin context to mutations
- [ ] B3.3 Verify admin mutations accept uploads

---

### Phase C: Mark Assets Ready (~0.5 points)

#### Task C1: Admin Mark Ready Mutation

**File**: `convex/functions/projects/mutations.ts` (extend)

```typescript
export const markAssetsReady = adminMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Verify at least 1 file uploaded
    // 2. Update project status to 'in_progress'
    // 3. Set timestamp
    // 4. NO client notification (internal project)
  },
});
```

- [ ] C1.1 Create admin mutation for marking ready
- [ ] C1.2 Skip client notification for internal projects

---

## 🧪 Testing Checklist

### Internal Project Detection

- [ ] Projects with `source = 'admin_init'` detected
- [ ] Badge shows "INTERNAL"
- [ ] Upload unlocked without quotation

### Upload Flow

- [ ] Pre-signed URL upload works
- [ ] tus resumable upload works
- [ ] Progress tracking works
- [ ] Storage limits enforced

### Storage Source

- [ ] Uses project.storageAllocated (not quotation)
- [ ] Default 100GB if not specified
- [ ] Bar shows correct values

### Mark Ready

- [ ] Button appears for admin
- [ ] Status changes to `in_progress`
- [ ] No client notification for internal

---

## 🚀 Definition of Done

- [ ] Upload gate bypassed for admin_init projects
- [ ] Storage sourced from project settings
- [ ] Admin can upload with same flow as client
- [ ] Mark Assets Ready works for admin
- [ ] Internal project badge displayed
- [ ] No client notifications for internal projects
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                          |
| ---------- | ------------- | ------------------------------ |
| 2026-01-18 | ready-for-dev | Story created from Epic 5 plan |

---

**Previous Story**: 5-6 - Mark Upload Complete  
**Next Story**: Epic 6 - Deliverables & QC Workflow
