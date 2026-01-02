# Component Migration Analysis: PrimeEditz v1 → v2

**Date:** 2026-01-02
**Source Project:** `primeeditz-app` (Next.js)
**Target Project:** `primeeditz-tanstack-webapp` (TanStack Start)

---

## 📊 Overview

This document analyzes which components from the original PrimeEditz Next.js project can be reused in the new TanStack Start project for Epic 2 (Client Portal).

---

## 🔄 Framework Differences

| Aspect           | Next.js (Old)                              | TanStack Start (New)                                      |
| ---------------- | ------------------------------------------ | --------------------------------------------------------- |
| Image Component  | `next/image`                               | Use `@unpic/react` OR `<img>`                             |
| Link Component   | `import Link from "next/link"` with `href` | `import { Link } from "@tanstack/react-router"` with `to` |
| Server Functions | `'use server'`                             | `createServerFn()`                                        |
| UI Library       | shadcn/ui ✅                               | shadcn/ui ✅ (same)                                       |
| State Management | React hooks ✅                             | React hooks ✅ (same)                                     |

---

## 🖼️ Image Component Strategy

### Option 1: Use `@unpic/react` (Recommended)

The migration guide recommends Unpic as a drop-in replacement for `next/image`.

**Installation:**

```bash
pnpm add @unpic/react
```

**Usage:**

```tsx
// OLD (Next.js)
import Image from "next/image";
<Image src={url} alt={name} fill className="object-contain" />;

// NEW (TanStack Start with Unpic)
import { Image } from "@unpic/react";
<Image src={url} alt={name} layout="fullWidth" />;
```

**Benefits:**

- Automatic srcset generation
- Responsive image optimization
- Supports multiple image CDNs
- Similar API to next/image

### Option 2: Use Standard `<img>` with lazy loading

For simpler cases or when optimization isn't critical:

```tsx
<img
  src={url}
  alt={name}
  className="w-full h-full object-contain"
  loading="lazy"
/>
```

### Recommendation

Use **Unpic for the ImageSlider** (where image optimization matters) and **standard `<img>`** for thumbnails in the file uploader (where images are already small).

---

## 📦 Component Analysis

### ✅ DIRECTLY PORTABLE (No changes needed)

| Component              | Path                                        | Lines | Notes                              |
| ---------------------- | ------------------------------------------- | ----- | ---------------------------------- |
| `useFileUploader` hook | `shared/file-uploader/use-file-uploader.ts` | 97    | Pure React hook, zero dependencies |

### ⚠️ ADAPT BEFORE PORTING

| Component              | Path                                                | Lines | Changes Needed                  |
| ---------------------- | --------------------------------------------------- | ----- | ------------------------------- |
| `FileUploader`         | `shared/file-uploader/file-uploader.tsx`            | 234   | Update ImageSlider import path  |
| `ImageSlider`          | `shared/image-viewer/desktop/image-slider.tsx`      | 335   | Replace `next/image` with Unpic |
| `ReferenceFilesDrawer` | `shared/reference-files/reference-files-drawer.tsx` | 61    | Update component imports        |

### ❌ BUILD FRESH (Too coupled to old data model)

| Component            | Path                                              | Lines      | Reason                                 |
| -------------------- | ------------------------------------------------- | ---------- | -------------------------------------- |
| `ReferenceFilesView` | `shared/reference-files/reference-files-view.tsx` | 658        | Uses old Convex API, event-based model |
| Session Folders      | `shared/session-folders/*`                        | 2000+      | Old event/session structure            |
| Quotation Display    | `shared/quotation-display.tsx`                    | 9575 bytes | Old pricing model                      |

---

## 🎨 Reference Files Drawer - What to Keep

The `ReferenceFilesDrawer` component has an excellent UX pattern we should preserve:

### Key UX Features to Preserve:

1. **Right-side drawer** with `direction="right"` and `w-1/2` width
2. **Sticky header** with gradient background
3. **Scrollable content area**
4. **File categorization** (Images, Videos, Documents) with color-coded badges
5. **Image slider modal** for full-screen image viewing
6. **Bulk download with progress** indicator
7. **Individual file actions** (View, Download, Delete)
8. **File type badges** with appropriate colors (primary/orange/blue)

### What to Rebuild:

1. **Data fetching** - Use new Convex schema (`projects` instead of `events`)
2. **File metadata query** - New API endpoint
3. **Delete functionality** - New mutation for projects

---

## 🔧 Migration Checklist for Story 2-0

### Phase 1: Dependencies

```bash
# Install Unpic for optimized images
pnpm add @unpic/react
```

### Phase 2: Copy Pure React Code (No changes)

- [ ] Copy `use-file-uploader.ts` → `src/hooks/useFileUploader.ts`
- [ ] Extract `formatFileSize` utility → `src/utils/file.ts`

### Phase 3: Adapt Components

- [ ] Create `src/components/shared/image-viewer/image-slider.tsx`

  - Copy from old project
  - Replace `import Image from "next/image"` with Unpic
  - Update import paths for UI components

- [ ] Create `src/components/shared/file-uploader/file-uploader.tsx`

  - Copy from old project
  - Update ImageSlider import path

- [ ] Create drawer wrapper structure at `src/components/shared/reference-files/`
  - `reference-files-drawer.tsx` - Adapt drawer shell
  - `reference-files-view.tsx` - Build fresh with new schema

### Phase 4: Test

- [ ] Verify image slider opens and navigates
- [ ] Verify file upload drag & drop works
- [ ] Verify image previews display

---

## 📁 Target Directory Structure

```
src/
├── components/
│   └── shared/
│       ├── file-uploader/
│       │   └── file-uploader.tsx
│       ├── image-viewer/
│       │   ├── image-slider.tsx
│       │   └── index.ts
│       └── reference-files/
│           ├── reference-files-drawer.tsx
│           ├── reference-files-view.tsx (BUILD FRESH)
│           └── index.ts
├── hooks/
│   └── useFileUploader.ts
└── utils/
    └── file.ts (formatFileSize, getFileType, etc.)
```

---

## 🎯 Summary

| Action                 | Component Count               | Effort    |
| ---------------------- | ----------------------------- | --------- |
| **Copy as-is**         | 1 (hook)                      | 5 min     |
| **Adapt (image swap)** | 2 (ImageSlider, FileUploader) | 1 hour    |
| **Build fresh**        | 1 (ReferenceFilesView)        | 2-3 hours |
| **Total**              | 4 components                  | ~4 hours  |

---

## 📝 Notes for Implementation

1. **Unpic vs Standard `<img>`**: Use Unpic for the ImageSlider modal where images are displayed large. Use standard `<img>` for thumbnails since they're already small.

2. **Drawer from shadcn/ui**: We already have Drawer component installed. The `direction="right"` prop requires vaul drawer which is included.

3. **New Data Model**: The old project used `events` with `referenceFiles`. The new project uses `projects` with a different schema. The view component needs to be rebuilt to match.

4. **MinIO/R2 Integration**: File URLs will come from MinIO in the new project instead of Cloudflare R2. The signed URL pattern should be similar.
