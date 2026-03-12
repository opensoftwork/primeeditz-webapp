# Story 21-6: Employee Lightbox → AssetSlider + Animation Fix

**Epic**: Epic 21 - Deliverable Code Deduplication & UI Consistency
**Status**: backlog
**Complexity**: Small (1 point)
**Created**: 2026-02-15
**Priority**: SHOULD — Quick win for UI consistency and library correctness

---

## 📋 User Story

**As an** employee viewing version request reference images,
**I want** the same premium full-screen image viewer (AssetSlider) used by the admin portal,
**So that** I get zoom, pan, navigation, and download capabilities instead of a basic lightbox.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On | Status | Notes                                                  |
| ---------- | ------ | ------------------------------------------------------ |
| None       | N/A    | `AssetSlider` already exists in `shared/asset-viewer/` |

### Enables

| Story / Epic | Notes                                           |
| ------------ | ----------------------------------------------- |
| **21-8**     | UI consistency — same viewer across all portals |

### Current Issues

1. **Custom lightbox in employee viewer**: `versions-reference-viewer.tsx` has a 30-line custom `AnimatePresence` lightbox that only shows a single `<img>` with no zoom, pan, navigation, or download.
2. **Wrong animation library import**: The same file imports `from "framer-motion"` instead of `from "motion/react"`. The project uses `motion/react` (Framer Motion v12) everywhere else.

---

## ✅ Acceptance Criteria

### AC1: Animation Import Fixed

- [ ] **Given** `employee/.../versions-reference-viewer.tsx`
- [ ] **Then** it imports `{ motion, AnimatePresence }` from `"motion/react"` (not `"framer-motion"`)
- [ ] **And** the animation behavior is identical

### AC2: AssetSlider Integration

- [ ] **Given** the employee reference viewer component
- [ ] **When** a user clicks on a reference image
- [ ] **Then** the `AssetSlider` opens (not the old custom lightbox)
- [ ] **And** all reference images are navigable within the slider
- [ ] **And** zoom, pan, and download controls are available

### AC3: Custom Lightbox Removed

- [ ] **Given** `versions-reference-viewer.tsx`
- [ ] **Then** the `selectedImage` state is removed
- [ ] **And** the `AnimatePresence` lightbox block (~lines 170-210) is removed
- [ ] **And** replaced with `AssetSlider` component + `isSliderOpen` / `currentAssetIndex` state

### AC4: ViewerAssets Constructed

- [ ] **Given** reference images with signed URLs
- [ ] **Then** a `viewerAssets: ViewerAsset[]` array is built from the images
- [ ] **And** each asset has `url`, `fileName`, `fileId`, and `type: "image"`

### AC5: Build Passes

- [ ] **Given** all changes
- [ ] **When** I run `pnpm build`
- [ ] **Then** zero TypeScript errors

---

## 📘 Implementation

### Phase A: Fix Import (~0 effort)

#### Task A1: Fix animation import

**File**: `src/components/modules/employee/assigned-work/detail/versions-reference-viewer.tsx`

- [ ] A1.1 Change `import { motion, AnimatePresence } from "framer-motion"` to `import { motion, AnimatePresence } from "motion/react"`

### Phase B: Replace Lightbox with AssetSlider (~1 point)

#### Task B1: Add AssetSlider state

- [ ] B1.1 Add `import { AssetSlider, type ViewerAsset } from "@/components/shared/asset-viewer"`
- [ ] B1.2 Replace `selectedImage` state with `isSliderOpen` and `currentAssetIndex`
- [ ] B1.3 Build `viewerAssets` with `useMemo`:
  ```ts
  const viewerAssets: ViewerAsset[] = useMemo(() => {
    if (!referenceImages) return [];
    return referenceImages
      .filter((img) => imageUrls[img.minioKey])
      .map((img) => ({
        url: imageUrls[img.minioKey],
        fileName: img.fileName,
        fileId: img.minioKey,
        type: "image" as const,
      }));
  }, [referenceImages, imageUrls]);
  ```

#### Task B2: Replace click handlers

- [ ] B2.1 Update image thumbnail `onClick` to call `handleOpenAsset(idx)` instead of `setSelectedImage`
- [ ] B2.2 Update the expand button `onClick` similarly

#### Task B3: Replace lightbox with AssetSlider

- [ ] B3.1 Remove the `AnimatePresence` + `motion.div` lightbox block
- [ ] B3.2 Add `<AssetSlider>` component:
  ```tsx
  <AssetSlider
    assets={viewerAssets}
    isOpen={isSliderOpen}
    onClose={() => setIsSliderOpen(false)}
    initialIndex={currentAssetIndex}
  />
  ```

#### Task B4: Verify build

- [ ] B4.1 Run `pnpm build` — confirm zero errors

---

## 🧪 Testing Checklist

### Functional

- [ ] Click reference image thumbnail → AssetSlider opens at correct image
- [ ] Navigate between images in slider (arrow keys / buttons)
- [ ] Zoom and pan works
- [ ] Download button works
- [ ] Close slider → returns to reference viewer
- [ ] No animation errors in console

### Edge Cases

- [ ] Zero reference images — no slider, no crash
- [ ] Single reference image — slider opens, no navigation arrows
- [ ] Images still loading (URLs pending) — graceful handling

---

## 🚀 Definition of Done

- [ ] `framer-motion` import replaced with `motion/react`
- [ ] Custom lightbox removed
- [ ] `AssetSlider` integrated with proper `viewerAssets`
- [ ] `pnpm build` passes with zero errors
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-15 | backlog | Story created |

---

**Previous Story**: 21-5 - Consolidate Version Request Dialogs
**Next Story**: 21-7 - Move Image Grid & Upload to Shared
