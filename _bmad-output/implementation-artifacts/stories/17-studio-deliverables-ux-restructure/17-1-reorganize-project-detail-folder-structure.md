# Story 17-1: Reorganize Project Detail Folder Structure

**Epic**: Epic 17 - Studio Deliverables UX & Folder Restructure  
**Status**: review  
**Complexity**: Small (3 points)  
**Created**: 2026-02-12  
**Priority**: MUST — Foundation for all other stories

---

## 📋 User Story

**As a** developer,  
**I want** the project detail components organized into domain-based subfolders,  
**So that** the codebase is maintainable, consistent with the module pattern, and easy to navigate.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On            | Status    | Notes                                             |
| --------------------- | --------- | ------------------------------------------------- |
| **Pattern Reference** | ✅ Exists | `projects/detail/folder/` already uses subfolders |
| **6-6 Refactor**      | ✅ Done   | Admin deliverables follow `list/detail/` pattern  |

### Enables

| Story / Epic            | Notes                                       |
| ----------------------- | ------------------------------------------- |
| **17-2 - Data Fixes**   | Clean imports from barrel exports           |
| **17-3 - Detail Route** | Components live in organized subfolder      |
| **17-5 - Polish**       | Files are in the right place for refinement |

### Current Problem

```
CURRENT (Flat - 14+ files dumped together):
src/components/modules/projects/detail/
├── approval-actions.tsx              ← Deliverables domain
├── approval-progress-banner.tsx      ← Deliverables domain
├── assets-section.tsx                ← Assets domain
├── deliverable-review-card.tsx       ← Deliverables domain
├── deliverables-section.tsx          ← Deliverables domain
├── folder/                           ← ✅ Already organized
├── header.tsx                        ← Core
├── project-detail-view.tsx           ← Core
├── reference-materials.tsx           ← Core
├── shared.tsx                        ← Core
├── sidebar.tsx                       ← Core
├── specifications.tsx                ← Core
├── studio-versions-dialog.tsx        ← Deliverables domain
├── versions-dialog.tsx               ← Deliverables domain
└── versions-status-tracker.tsx       ← Deliverables domain

PROBLEM: 7 deliverable files are scattered flat — violates module pattern.
The `folder/` subdirectory proves the pattern works (5 files, barrel export).
```

---

## ✅ Acceptance Criteria

### AC1: Deliverables Subfolder

- [x] **Given** the 7 deliverable-related files in `src/components/modules/projects/detail/`
- [x] **When** I move them to a `deliverables/` subfolder
- [x] **Then** the following files must be in `deliverables/`:
  - `deliverables-section.tsx`
  - `deliverable-review-card.tsx`
  - `approval-progress-banner.tsx`
  - `approval-actions.tsx`
  - `versions-dialog.tsx`
  - `studio-versions-dialog.tsx`
  - `versions-status-tracker.tsx`
- [x] **And** a barrel `index.ts` must export all public components

### AC2: Assets Subfolder

- [x] **Given** `assets-section.tsx` in `src/components/modules/projects/detail/`
- [x] **When** I move it to an `assets/` subfolder
- [x] **Then** `assets/assets-section.tsx` must exist
- [x] **And** a barrel `assets/index.ts` must export `AssetsSection`

### AC3: Root Index File

- [x] **Given** the new subfolders exist
- [x] **When** I create a root `index.ts` barrel
- [x] **Then** it must re-export from `./deliverables`, `./assets`, and `./folder`

### AC4: Import Path Updates

- [x] **Given** `project-detail-view.tsx` currently imports from flat paths
- [x] **When** I update the imports to use barrel exports
- [x] **Then** all imports must resolve correctly
- [x] **And** `pnpm build` must pass with zero errors

### AC5: No Functional Changes

- [x] All existing functionality must continue to work identically
- [x] No visual changes to the UI
- [x] All existing routes still work

---

## 📘 Implementation

### Phase A: Create Subfolders (~0.5 points)

#### Task A1: Create Directories

```bash
mkdir -p src/components/modules/projects/detail/deliverables
mkdir -p src/components/modules/projects/detail/assets
```

- [x] A1.1 Create `deliverables/` directory
- [x] A1.2 Create `assets/` directory

---

### Phase B: Move Deliverable Files (~1 point)

#### Task B1: Move Files to `deliverables/`

**Move the following files (no content changes needed):**

```bash
# From src/components/modules/projects/detail/
# To   src/components/modules/projects/detail/deliverables/

mv deliverables-section.tsx       deliverables/
mv deliverable-review-card.tsx    deliverables/
mv approval-progress-banner.tsx   deliverables/
mv approval-actions.tsx           deliverables/
mv versions-dialog.tsx            deliverables/
mv studio-versions-dialog.tsx     deliverables/
mv versions-status-tracker.tsx    deliverables/
```

- [x] B1.1 Move `deliverables-section.tsx`
- [x] B1.2 Move `deliverable-review-card.tsx`
- [x] B1.3 Move `approval-progress-banner.tsx`
- [x] B1.4 Move `approval-actions.tsx`
- [x] B1.5 Move `versions-dialog.tsx`
- [x] B1.6 Move `studio-versions-dialog.tsx`
- [x] B1.7 Move `versions-status-tracker.tsx`

**⚠️ CRITICAL INSIGHT — Internal imports DON'T change:**

All 7 files import from each other using relative paths like `./approval-progress-banner`. Since they all move to the same subfolder together, these internal relative paths remain valid. No content changes are needed in the moved files themselves.

**Proof — current internal imports:**

- `deliverables-section.tsx` imports `./approval-progress-banner` ✅ (stays same)
- `deliverables-section.tsx` imports `./deliverable-review-card` ✅ (stays same)
- `deliverable-review-card.tsx` imports `./studio-versions-dialog` ✅ (stays same)
- `deliverable-review-card.tsx` imports `./versions-status-tracker` ✅ (stays same)
- `approval-actions.tsx` imports `./versions-dialog` ✅ (stays same)

**One import that DOES need Updating:**

- `deliverables-section.tsx` line 10 imports from `@/components/modules/admin/projects/project-detail/deliverables/list/deliverable-card` — this is an absolute import and stays unchanged.

#### Task B2: Move `assets-section.tsx`

```bash
mv assets-section.tsx assets/
```

- [x] B2.1 Move `assets-section.tsx` to `assets/`

**Import check for `assets-section.tsx`:**

- Imports `./folder` → NOW needs to be `../folder` (moved one level deeper)
- This is the ONE content change needed in this file

**Note:** Upon inspection, `assets-section.tsx` uses `FolderGrid` from `@/components/shared/project-folders`, not `./folder`. No import change was needed.

- [x] B2.2 Update `../folder` import in `assets-section.tsx` (N/A - not used)

---

### Phase C: Create Barrel Exports (~0.5 points)

#### Task C1: Deliverables Barrel

**File**: `src/components/modules/projects/detail/deliverables/index.ts`

```typescript
export { DeliverablesSection } from "./deliverables-section";
export { DeliverableReviewCard } from "./deliverable-review-card";
export { ApprovalProgressBanner } from "./approval-progress-banner";
export { ApprovalActions } from "./approval-actions";
export { ClientVersionDialog } from "./versions-dialog";
export { StudioVersionsDialog } from "./studio-versions-dialog";
export { VersionStatusTracker } from "./versions-status-tracker";
```

- [x] C1.1 Create `deliverables/index.ts`

#### Task C2: Assets Barrel

**File**: `src/components/modules/projects/detail/assets/index.ts`

```typescript
export { AssetsSection } from "./assets-section";
```

- [x] C2.1 Create `assets/index.ts`

#### Task C3: Root Barrel

**File**: `src/components/modules/projects/detail/index.ts`

```typescript
export * from "./deliverables";
export * from "./assets";
export * from "./folder";
export { DetailSection, DetailItem, SidebarItem, StatusBadge } from "./shared";
```

- [x] C3.1 Create root `index.ts`

---

### Phase D: Update Parent Imports (~0.5 points)

#### Task D1: Update `project-detail-view.tsx`

**File**: `src/components/modules/projects/detail/project-detail-view.tsx`

This is the ONLY file that needs import path changes:

```typescript
// BEFORE:
import { DeliverablesSection } from "./deliverables-section";
import { AssetsSection } from "./assets-section";
import { ApprovalProgressBanner } from "./approval-progress-banner";

// AFTER:
import { DeliverablesSection } from "./deliverables";
import { AssetsSection } from "./assets";
import { ApprovalProgressBanner } from "./deliverables";
```

- [x] D1.1 Update `DeliverablesSection` import
- [x] D1.2 Update `AssetsSection` import
- [x] D1.3 Update `ApprovalProgressBanner` import (if used directly) - N/A, not used
- [x] D1.4 Verify `pnpm build` passes

#### Task D2: Check for External Consumers

Search for any other files importing from the old flat paths:

```bash
grep -r "from.*projects/detail/deliverables-section" src/
grep -r "from.*projects/detail/assets-section" src/
grep -r "from.*projects/detail/approval-" src/
grep -r "from.*projects/detail/deliverable-review" src/
grep -r "from.*projects/detail/versions-" src/
grep -r "from.*projects/detail/studio-versions" src/
```

- [x] D2.1 Search for and update any external consumers - None found
- [x] D2.2 Update route files if they import directly - N/A

---

### Phase E: Verify (~0.5 points)

#### Task E1: Build Verification

- [x] E1.1 Run `pnpm build` — must pass with zero errors ✅
- [x] E1.2 Run dev server — all pages load correctly
- [x] E1.3 Navigate to studio project detail — all sections render
- [x] E1.4 Check deliverables section in review mode — cards render
- [x] E1.5 Check deliverables section in non-review mode — cards render
- [x] E1.6 Check assets section — uploads and folders work

---

## 🔍 Final Target Structure

```
src/components/modules/projects/detail/
├── index.ts                              ← NEW root barrel
├── project-detail-view.tsx               ← Updated imports
├── header.tsx                            ← Unchanged
├── sidebar.tsx                           ← Unchanged
├── shared.tsx                            ← Unchanged
├── specifications.tsx                    ← Unchanged
├── reference-materials.tsx               ← Unchanged
├── deliverables/                         ← NEW subfolder
│   ├── index.ts                          ← NEW barrel
│   ├── deliverables-section.tsx          ← Moved (no changes)
│   ├── deliverable-review-card.tsx       ← Moved (no changes)
│   ├── approval-progress-banner.tsx      ← Moved (no changes)
│   ├── approval-actions.tsx              ← Moved (no changes)
│   ├── versions-dialog.tsx               ← Moved (no changes)
│   ├── studio-versions-dialog.tsx        ← Moved (no changes)
│   └── versions-status-tracker.tsx       ← Moved (no changes)
├── assets/                               ← NEW subfolder
│   ├── index.ts                          ← NEW barrel
│   └── assets-section.tsx                ← Moved (no import changes needed)
└── folder/                               ← Unchanged ✅
    ├── index.ts
    ├── folder-asset-list.tsx
    ├── folder-detail-view.tsx
    ├── folder-drop-zone.tsx
    └── staged-upload-queue.tsx
```

---

## 🚀 Definition of Done

- [x] All 7 deliverable files in `deliverables/` subfolder
- [x] `assets-section.tsx` in `assets/` subfolder
- [x] All 3 barrel `index.ts` files created
- [x] Root `index.ts` created
- [x] `project-detail-view.tsx` imports updated
- [x] `assets-section.tsx` `../folder` import updated (N/A - not used)
- [x] `pnpm build` passes with zero errors
- [x] All pages load correctly in dev server
- [x] No visual changes to the UI

---

## 📁 File List

### New Files
- `src/components/modules/projects/detail/index.ts`
- `src/components/modules/projects/detail/deliverables/index.ts`
- `src/components/modules/projects/detail/assets/index.ts`

### Moved Files
- `src/components/modules/projects/detail/deliverables-section.tsx` → `src/components/modules/projects/detail/deliverables/deliverables-section.tsx`
- `src/components/modules/projects/detail/deliverable-review-card.tsx` → `src/components/modules/projects/detail/deliverables/deliverable-review-card.tsx`
- `src/components/modules/projects/detail/approval-progress-banner.tsx` → `src/components/modules/projects/detail/deliverables/approval-progress-banner.tsx`
- `src/components/modules/projects/detail/approval-actions.tsx` → `src/components/modules/projects/detail/deliverables/approval-actions.tsx`
- `src/components/modules/projects/detail/versions-dialog.tsx` → `src/components/modules/projects/detail/deliverables/versions-dialog.tsx`
- `src/components/modules/projects/detail/studio-versions-dialog.tsx` → `src/components/modules/projects/detail/deliverables/studio-versions-dialog.tsx`
- `src/components/modules/projects/detail/versions-status-tracker.tsx` → `src/components/modules/projects/detail/deliverables/versions-status-tracker.tsx`
- `src/components/modules/projects/detail/assets-section.tsx` → `src/components/modules/projects/detail/assets/assets-section.tsx`

### Modified Files
- `src/components/modules/projects/detail/project-detail-view.tsx` (import paths updated)

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-12 | backlog | Story created |
| 2026-02-13 | review  | Implementation complete, all ACs satisfied |

---

**Previous Story**: N/A (First story in Epic 17)  
**Next Story**: 17-2 - Fix Deliverables Section Data Issues & UI Consistency
