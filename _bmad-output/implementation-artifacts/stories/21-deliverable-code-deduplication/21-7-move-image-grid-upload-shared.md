# Story 21-7: Move Image Grid & Upload to Shared

**Epic**: Epic 21 - Deliverable Code Deduplication & UI Consistency
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-02-15
**Priority**: SHOULD — Formalizes existing cross-module imports; prerequisite for 21-5

---

## 📋 User Story

**As a** developer building any feature that requires image upload/preview grids,
**I want** the `VersionImageGrid` and `VersionImageUpload` components in a shared location,
**So that** I don't import from `admin/...` in studio/employee modules and the dependency graph stays clean.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On | Status | Notes                             |
| ---------- | ------ | --------------------------------- |
| None       | N/A    | Components already exist and work |

### Enables

| Story / Epic | Notes                                               |
| ------------ | --------------------------------------------------- |
| **21-5**     | Consolidated dialog needs shared `VersionImageGrid` |

### Current State

- **`VersionImageGrid`** lives in `admin/.../detail/versions-image-grid.tsx` (118 lines)
  - Already imported by **studio**: `studio/.../studio-versions-dialog.tsx` imports from admin path
  - This creates an `admin → studio` cross-module dependency

- **`VersionImageUpload`** lives in `admin/.../detail/versions-image-upload.tsx` (175 lines)
  - Only imported within admin module currently
  - But studio duplicates the upload logic inline in `studio-versions-dialog.tsx`

---

## ✅ Acceptance Criteria

### AC1: Components Moved to Shared

- [ ] **Given** `src/components/shared/deliverables/version-image-grid.tsx`
- [ ] **Then** it contains the `VersionImageGrid` component (identical to current)
- [ ] **And** it exports the `VersionImage` interface

- [ ] **Given** `src/components/shared/deliverables/version-image-upload.tsx`
- [ ] **Then** it contains the `VersionImageUpload` component (identical to current)

### AC2: Old Files Become Re-Exports

- [ ] **Given** `admin/.../detail/versions-image-grid.tsx`
- [ ] **Then** it re-exports from shared for backward compatibility:
  ```ts
  export {
    VersionImageGrid,
    type VersionImage,
  } from "@/components/shared/deliverables";
  ```
- [ ] **Or** all imports are updated and the old file is deleted

- [ ] **Given** `admin/.../detail/versions-image-upload.tsx`
- [ ] **Then** same treatment — re-export or delete + update imports

### AC3: Cross-Module Imports Fixed

- [ ] **Given** `studio/.../studio-versions-dialog.tsx`
- [ ] **Then** it imports `VersionImageGrid` from `@/components/shared/deliverables`
- [ ] **And** NOT from `@/components/modules/admin/...`

### AC4: Barrel Exports Updated

- [ ] **Given** `src/components/shared/deliverables/index.ts`
- [ ] **Then** it exports `VersionImageGrid`, `VersionImage`, and `VersionImageUpload`

### AC5: Build Passes

- [ ] **Given** all changes
- [ ] **When** I run `pnpm build`
- [ ] **Then** zero errors

---

## 📘 Implementation

### Phase A: Move Components (~1 point)

#### Task A1: Move `VersionImageGrid`

- [ ] A1.1 Copy `admin/.../detail/versions-image-grid.tsx` to `shared/deliverables/version-image-grid.tsx`
- [ ] A1.2 Verify all imports resolve correctly in the new location
- [ ] A1.3 Update barrel export `index.ts`

#### Task A2: Move `VersionImageUpload`

- [ ] A2.1 Copy `admin/.../detail/versions-image-upload.tsx` to `shared/deliverables/version-image-upload.tsx`
- [ ] A2.2 Verify all imports resolve correctly
- [ ] A2.3 Update barrel export `index.ts`

### Phase B: Update Imports (~1 point)

#### Task B1: Update admin consumers

- [ ] B1.1 Find all files importing from old admin paths
- [ ] B1.2 Update imports to `@/components/shared/deliverables`
- [ ] B1.3 Delete or convert old files to re-exports

#### Task B2: Update studio consumers

- [ ] B2.1 Update `studio-versions-dialog.tsx` import from admin to shared
- [ ] B2.2 Verify no other studio files import from admin

#### Task B3: Update employee consumers (if any)

- [ ] B3.1 Check for any employee imports of these components
- [ ] B3.2 Update if found

#### Task B4: Verify build

- [ ] B4.1 Run `pnpm build` — confirm zero errors
- [ ] B4.2 Run `grep -r "versions-image-grid\|versions-image-upload" src/components/modules/` to confirm no stale imports remain

---

## 🧪 Testing Checklist

### Functional

- [ ] Admin version request page — image upload and grid work
- [ ] Studio version request dialog — image upload and grid work
- [ ] Image notes update correctly
- [ ] Image removal works
- [ ] Upload progress shows (if using `VersionImageUpload`)

### Import Verification

- [ ] No files in `src/components/modules/studio/` or `src/components/modules/employee/` import from `src/components/modules/admin/`
- [ ] All imports of `VersionImageGrid` and `VersionImageUpload` come from `@/components/shared/deliverables`

---

## 🚀 Definition of Done

- [ ] Both components moved to `shared/deliverables/`
- [ ] All cross-module imports fixed
- [ ] Old files deleted or converted to re-exports
- [ ] `pnpm build` passes with zero errors
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-15 | backlog | Story created |

---

**Previous Story**: 21-6 - Employee Lightbox → AssetSlider + Animation Fix
**Next Story**: 21-8 - UI Consistency Pass
