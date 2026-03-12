# Epic 21: Deliverable Code Deduplication & UI Consistency

**Status**: Draft
**Owner**: Antigravity
**Created**: 2026-02-15
**Priority**: HIGH — Technical debt reduction, consistency, and maintainability

---

## 📋 Overview

The deliverables/versions/requests implementation is spread across three role modules (admin, studio, employee) with **~2,200+ lines of duplicated or near-duplicated code**. Components are copy-pasted between modules with only minor differences (URL paths, button visibility), shared types are defined inline in multiple files, the same `useEffect` pattern for fetching signed URLs is repeated 8+ times, and status badge configurations are hardcoded in 4 separate locations.

This epic extracts reusable shared components, creates custom hooks, unifies duplicate views, and ensures UI consistency across all three portals. **No new features are introduced** — this is purely a refactoring & consolidation effort.

### Origin

This epic was generated from a **codebase code review** (not from a PRD). The findings are based on direct analysis of the files in `src/components/modules/{admin,projects,employee}/` relating to deliverables, versions, and version requests.

---

## 🎯 Objectives

- [ ] Eliminate ~2,200+ lines of duplicated code across admin, studio, and employee modules.
- [ ] Create reusable custom hooks (`useSignedUrl`, `useSignedUrls`) to replace 8+ duplicated `useEffect` blocks.
- [ ] Promote shared types (`VersionRequestRow`, `DeliverableVersion`, `DeliverableData`) to a single `shared/deliverables/types.ts`.
- [ ] Unify the `VersionRequestsList` component (admin 359 lines + employee 317 lines → 1 shared component).
- [ ] Consolidate 3 separate version request dialog implementations into 1 shared component.
- [ ] Move orphaned/cross-imported components to `shared/deliverables/` for clean import paths.
- [ ] Fix animation library inconsistency (`framer-motion` vs `motion/react`).
- [ ] Replace the employee custom lightbox with the shared `AssetSlider` component.
- [ ] Ensure UI consistency (status colors, badge patterns, font sizes, animation patterns) between all three portals.

---

## 🏗️ Technical Architecture

### New Shared Folder Structure

```
src/components/shared/deliverables/
├── types.ts                          # VersionRequestRow, DeliverableVersion, DeliverableData, status type unions
├── constants.ts                      # VERSION_REQUEST_STATUS_CONFIG (colors, icons, labels)
├── version-status-badge.tsx          # Promoted from studio's versions-status-tracker.tsx
├── version-requests-list.tsx         # Unified list with role-aware hrefs
├── version-request-dialog.tsx        # Consolidated dialog (notes + optional image upload)
├── version-image-grid.tsx            # Moved from admin/detail
├── version-image-upload.tsx          # Moved from admin/detail
└── hooks/
    ├── use-signed-url.ts             # Single file signed URL hook
    └── use-signed-urls.ts            # Batch signed URL hook (for image arrays)
```

### Key Patterns Being Replaced

| Duplicated Pattern                        | Current Count               | Replacement                                                     |
| ----------------------------------------- | --------------------------- | --------------------------------------------------------------- |
| `useEffect → getSignedFileUrl → setState` | 8+ copies                   | `useSignedUrl(key)` / `useSignedUrls(keys)`                     |
| Status color/icon config objects          | 4 inline copies             | `VERSION_REQUEST_STATUS_CONFIG` constant + `VersionStatusBadge` |
| `VersionRequestRow` interface             | 2 inline copies             | `shared/deliverables/types.ts`                                  |
| `VersionRequestsList` component           | 2 copies (admin + employee) | 1 shared with `hrefPrefix` prop                                 |
| Version request dialog                    | 3 implementations           | 1 shared with optional `showImageUpload` prop                   |
| Custom image lightbox                     | 1 (employee)                | Use existing `AssetSlider`                                      |

### Cross-Module Import Cleanup

Currently several files import across module boundaries (e.g., employee importing from admin). This epic cleans those import chains by moving shared code to `shared/deliverables/`.

---

## 📝 Stories

- [ ] **21-1: Extract Shared Types & Constants** — Move types and status configs to shared location
- [ ] **21-2: Signed URL Custom Hooks** — Create `useSignedUrl` and `useSignedUrls` hooks
- [ ] **21-3: Promote VersionStatusBadge to Shared** — Unify the 4 inline status badge patterns
- [ ] **21-4: Unify VersionRequestsList Component** — Merge admin + employee duplicates
- [ ] **21-5: Consolidate Version Request Dialogs** — Merge 3 dialog implementations into 1
- [ ] **21-6: Employee Lightbox → AssetSlider + Animation Fix** — Replace custom lightbox & fix import
- [ ] **21-7: Move Image Grid & Upload to Shared** — Formalize cross-module component locations
- [ ] **21-8: UI Consistency Pass** — Ensure uniform styling, animations, and patterns across all portals

---

## 📊 Impact Metrics

| Metric                                | Before  | After (Estimated)                  |
| ------------------------------------- | ------- | ---------------------------------- |
| Total duplicated lines                | ~2,200+ | ~200 (role-specific wrappers only) |
| Status config definitions             | 4       | 1                                  |
| Signed URL `useEffect` blocks         | 8+      | 0 (hooks)                          |
| Dialog implementations                | 3       | 1                                  |
| Version requests list copies          | 2       | 1                                  |
| Cross-module imports (admin→employee) | 3       | 0                                  |

---

## 🔄 Status History

| Date       | Status | Notes                                           |
| ---------- | ------ | ----------------------------------------------- |
| 2026-02-15 | Draft  | Epic created from codebase code review findings |
