# Story 5-1: View Project Folders

**Epic**: Epic 5 - Asset Upload & Folder Management  
**Status**: ready-for-dev  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-18  
**Priority**: MUST — Foundation for upload flow

---

## 📋 User Story

**As a** Client,  
**I want** to see the folder structure for my project with status indicators and storage usage,  
**So that** I know where to upload my assets and track my progress.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                       | Status  | Notes                             |
| -------------------------------- | ------- | --------------------------------- |
| **3-10 - Folder Templates**      | ✅ Done | Folder structure created by admin |
| **3-15 - Storage Pool Tracking** | ✅ Done | Quota data available              |
| **4-8 - Quotation Approval**     | ✅ Done | Gates folder visibility           |
| **Epic 2 - Client Dashboard**    | ✅ Done | Navigation structure exists       |

### Enables

| Story / Epic              | Notes                           |
| ------------------------- | ------------------------------- |
| **5-2 - Gated Upload**    | Uses folder view as base        |
| **5-3 - File Upload**     | Upload targets specific folders |
| **5-4 - Upload Progress** | Progress shown in folder view   |

### Data Flow

```
Client Dashboard
      │
      ↓ Click Project
      │
Project Detail Page
      │
      ↓ "Assets" Tab
      │
┌─────────────────────────────────────┐
│  📊 STORAGE BAR                     │
│  ████████░░ 78GB / 100GB            │
├─────────────────────────────────────┤
│  📁 Ceremony   📁 Reception         │
│   124 files     0 files             │
│   ✅ Complete   ⏳ Empty             │
│                                     │
│  📁 Candid     📁 Portraits         │
│   45 files      12 files            │
│   ⏳ Partial    ✅ Complete          │
└─────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Project Assets Tab

- [ ] **Given** I am viewing a project detail page
- [ ] **When** I click on the "Assets" tab
- [ ] **Then** I see the folder grid layout
- [ ] **And** each folder from the project's folder template is displayed

### AC2: Storage Usage Bar

- [ ] **Given** the project has a storage quota
- [ ] **Then** I see a storage usage bar showing:
  - Current usage in GB
  - Total allocation in GB
  - Visual progress bar
- [ ] **And** color coding based on usage:
  - Green: <80% used
  - Amber: 80-95% used
  - Red: >95% used

### AC3: Folder Cards

- [ ] **Given** folders exist for the project
- [ ] **Then** each folder card displays:
  - Folder icon (based on folder type)
  - Folder name
  - File count badge (e.g., "124 files")
  - Status indicator
- [ ] **And** folder status styling:
  - Empty: Dashed border, muted colors, "Add files" prompt
  - Partial: Solid border, amber indicator
  - Complete: Solid border, green checkmark

### AC4: Folder Status Logic

- [ ] **Given** folder file counts
- [ ] **Then** status is determined as:
  - `empty`: 0 files
  - `partial`: 1+ files, not marked complete
  - `complete`: Marked complete by user or admin

### AC5: Folder Click Navigation

- [ ] **Given** I click on a folder card
- [ ] **Then** I navigate to the folder detail view
- [ ] **And** I see the list of files in that folder

### AC6: Empty State

- [ ] **Given** no folders exist (edge case - no template applied)
- [ ] **Then** I see a message: "No folders have been set up for this project yet."
- [ ] **And** if I'm admin: "Apply a folder template" button

---

## 🎨 UX Design

### Storage Usage Bar

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 STORAGE USAGE                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││
│  └─────────────────────────────────────────────────────────────────────┘│
│  78 GB used of 100 GB                                         78%       │
└─────────────────────────────────────────────────────────────────────────┘

// Warning state (80-95%):
│  ⚠️ 92 GB used of 100 GB                                      92%       │

// Critical state (>95%):
│  🔴 98 GB used of 100 GB — Consider upgrading                 98%       │
```

### Folder Card Grid

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  │  📁                 │  │  📁                 │  │  📁                 │
│  │  CEREMONY           │  │  RECEPTION          │  │  CANDID             │
│  │  ─────────────────  │  │  ─────────────────  │  │  ─────────────────  │
│  │  📷 124 files       │  │  📷 0 files         │  │  📷 45 files        │
│  │  ✅ Complete        │  │  ⏳ Empty           │  │  🔄 Partial         │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘
│                                                                          │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  ┌─────────────────────┐                       │
│    📁                     │  📁                 │                       │
│    PORTRAITS              │  HIGHLIGHTS         │                       │
│    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │  ─────────────────  │                       │
│    + Add files            │  📷 12 files        │                       │
│    ⏳ Empty               │  ✅ Complete        │                       │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  └─────────────────────┘                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Folder Card States

```css
/* Empty State - Dashed border */
.folder-card--empty {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

/* Partial State - Solid, amber accent */
.folder-card--partial {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

/* Complete State - Green accent */
.folder-card--complete {
  border: 1px solid rgba(34, 197, 94, 0.2);
  background: rgba(34, 197, 94, 0.05);
}
```

---

## 📘 Implementation Phases

### Phase A: Data Layer (~1 point)

#### Task A1: Extend Existing Query for Client Access

**File**: `convex/functions/folders/queries.ts`

**EXISTING**: `getProjectFolders` query already exists and works for admin!

We need to either:

- Create `clientQuery` wrapper: `getClientProjectFolders`
- OR extend existing query with role-based access

```typescript
export const getClientProjectFolders = clientQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Verify client owns project (clientId from ctx)
    // 2. Reuse existing folder fetch logic
    // 3. Return same enriched folder data
  },
});
```

- [ ] A1.1 Create `getClientProjectFolders` clientQuery
- [ ] A1.2 Verify client ownership via ctx.clientId
- [ ] A1.3 Reuse existing folder aggregation logic

#### Task A2: Convex Query - Get Project Storage Usage

**File**: `convex/functions/storage/queries.ts` (extend)

```typescript
export const getProjectStorageUsage = clientQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Get project's storage pool/quotation
    // 2. Sum all asset sizes
    // 3. Return { used, allocated, percentage }
  },
});
```

- [ ] A2.1 Create `getProjectStorageUsage` query
- [ ] A2.2 Sum asset sizes from `assets` table
- [ ] A2.3 Get allocation from quotation storage tier

---

### Phase B: UI Components (~2 points)

#### Task B1: Create Shared Folder Components

**EXISTING PATTERN**: `src/components/modules/admin/projects/folder-setup/project-folders-list.tsx`

This component already has:

- Folder grid layout
- Status badges (pending_upload, in_progress, completed)
- File count + size display
- Premium styling

**Approach**: Create a **shared** version that works for all roles:

**File**: `src/components/shared/project-folders/` (new shared location)

- [ ] B1.1 Create `src/components/shared/project-folders/folder-card.tsx` (extract from admin)
- [ ] B1.2 Create `src/components/shared/project-folders/folder-grid.tsx`
- [ ] B1.3 Create `src/components/shared/project-folders/index.ts` exports
- [ ] B1.4 Update admin component to use shared version

#### Task B2: Storage Usage Bar Component

**File**: `src/components/shared/storage-usage-bar.tsx`

- [ ] B2.1 Create progress bar component
- [ ] B2.2 Implement color coding logic (green/amber/red)
- [ ] B2.3 Add "used/allocated" label
- [ ] B2.4 Add warning message when >95%
- [ ] B2.5 Premium dark theme styling

#### Task B3: Client Assets Section

**File**: `src/components/modules/projects/detail/assets-section.tsx`

Following client detail pattern (see `sidebar.tsx`, `specifications.tsx`):

- [ ] B3.1 Create AssetsSection component
- [ ] B3.2 Integrate StorageUsageBar
- [ ] B3.3 Integrate shared FolderGrid
- [ ] B3.4 Add to ProjectDetailView (between ReferenceMaterials and Sidebar)
- [ ] B3.5 Conditionally show based on project status (only if quotation approved)

---

### Phase C: Page Integration (~1 point)

#### Task C1: Update Project Detail Page

**File**: `src/app/(protected)/@client/projects/[id]/page.tsx`

- [ ] C1.1 Add "Assets" tab to project detail
- [ ] C1.2 Conditionally show based on project status
- [ ] C1.3 Add folder detail route

#### Task C2: Folder Detail Page

**File**: `src/app/(protected)/@client/projects/[id]/folders/[folderId]/page.tsx`

- [ ] C2.1 Create folder detail page
- [ ] C2.2 List files in folder
- [ ] C2.3 Back navigation to assets tab
- [ ] C2.4 Prepare for upload component (Story 5.3)

---

## 🧩 Component Structure

```
src/components/modules/client/assets/
├── storage-usage-bar.tsx      # Storage quota visualization
├── folder-card.tsx            # Individual folder card
├── folder-grid.tsx            # Grid of folder cards
├── folder-status-badge.tsx    # Empty/Partial/Complete badge
└── index.ts                   # Exports

src/components/modules/client/projects/detail/
├── assets-tab.tsx             # Assets tab container
├── folder-detail.tsx          # Folder detail view
└── file-list.tsx              # List of files in folder
```

---

## 🧪 Testing Checklist

### Folder Display

- [ ] Folders from template are displayed
- [ ] Folder names and icons correct
- [ ] File counts accurate
- [ ] Status badges reflect actual state

### Storage Bar

- [ ] Shows correct usage/allocation
- [ ] Green color when <80%
- [ ] Amber color when 80-95%
- [ ] Red color when >95%
- [ ] Warning message when near limit

### Navigation

- [ ] Click folder → navigate to folder detail
- [ ] Back button returns to assets tab
- [ ] Tab switching works correctly

### Edge Cases

- [ ] Project with no folders (empty state)
- [ ] Project with 0 storage used
- [ ] Project at exactly 100% storage

---

## 🚀 Definition of Done

- [ ] `getProjectFolders` query working
- [ ] `getProjectStorageUsage` query working
- [ ] StorageUsageBar component complete
- [ ] FolderCard with status states complete
- [ ] FolderGrid responsive layout working
- [ ] Assets tab integrated in project detail
- [ ] Folder click navigation working
- [ ] Empty state handled
- [ ] Premium dark theme UI
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                          |
| ---------- | ------------- | ------------------------------ |
| 2026-01-18 | ready-for-dev | Story created from Epic 5 plan |

---

**Previous Story**: Epic 4 complete  
**Next Story**: 5-2 - Gated Upload Enforcement
