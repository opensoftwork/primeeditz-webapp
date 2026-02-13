# Story 17-3: Create Studio Deliverable Detail View

**Epic**: Epic 17 - Studio Deliverables UX & Folder Restructure  
**Status**: review  
**Complexity**: Large (8 points)  
**Created**: 2026-02-12  
**Priority**: MUST — Enables proper deliverable viewing for studio users

---

## 📋 User Story

**As a** studio user,  
**I want** to click on a deliverable card and see a detail page with preview, metadata, and download,  
**So that** I can properly view and access my finalized files.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                      | Status    | Notes                                                                               |
| ------------------------------- | --------- | ----------------------------------------------------------------------------------- |
| **17-1 - Folder Restructure**   | ✅ Done   | Components in organized subfolder                                                   |
| **Admin DeliverableDetailView** | ✅ Exists | 488-line component at `admin/.../deliverables/detail/`                              |
| **Route page.tsx**              | ✅ Exists | `@studio/projects/[projectId]/deliverables/[deliverableId]/page.tsx` already exists |
| **Admin sub-components**        | ✅ Exists | `DeliverablePreview`, `DeliverableMetaCard`, `VersionHistory`                       |

### Enables

| Story / Epic          | Notes                                              |
| --------------------- | -------------------------------------------------- |
| **17-4 - Card Links** | Detail page must exist before cards can link to it |

---

## ✅ Acceptance Criteria

### AC1: Studio-Specific Detail View Component

- [x] **Given** the admin `DeliverableDetailView` at `src/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-detail-view.tsx`
- [x] **When** I create a studio-specific version
- [x] **Then** it must be at `src/components/modules/projects/detail/deliverables/studio-deliverable-detail.tsx`
- [x] **And** it must reuse these admin sub-components:
  - `DeliverablePreview` (file preview — image/video/PDF)
  - `VersionHistory` (read-only version list)
- [x] **And** it must NOT include admin actions (approve, reject, send-to-studio)

### AC2: File Preview

- [x] **Given** a deliverable with a valid `minioKey`
- [x] **When** the detail page loads
- [x] **Then** the file preview must render inline (image, video, or PDF)
- [x] **And** a signed URL must be fetched using the existing `getSignedFileUrl` action

### AC3: Download Button

- [x] **Given** a deliverable with a signed URL
- [x] **When** I click the "Download" button
- [x] **Then** the file must download with its original filename
- [x] **And** the button must use the established styling pattern

### AC4: Metadata Display

- [x] **Given** a deliverable detail page
- [x] **When** it renders
- [x] **Then** it must show: file name, version number, file size, upload date, status, uploaded by

### AC5: Version History (Read-Only)

- [x] **Given** a deliverable with multiple versions
- [x] **When** the detail page renders
- [x] **Then** a version history panel must be shown (read-only)
- [x] **And** clicking a version link must switch to that version's preview

### AC6: Breadcrumb Override

- [x] **Given** a deliverable detail page
- [x] **When** it loads
- [x] **Then** the breadcrumb must show the deliverable name (not the ID)
- [x] **And** the breadcrumb must use `useBreadcrumbStore().setOverride()`

### AC7: Loading and Error States

- [x] **Given** the deliverable is loading (`undefined`)
- [x] **Then** a skeleton loader must be shown
- [x] **Given** the deliverable is not found (`null`)
- [x] **Then** a "Not Found" state must be shown with a back link

### AC8: Route Page Update

- [x] **Given** the existing route page at `@studio/projects/[projectId]/deliverables/[deliverableId]/page.tsx`
- [x] **When** updated to use the new component
- [x] **Then** it must import `StudioDeliverableDetailView` from the studio deliverables barrel
- [x] **And** the route page must remain thin (<30 lines)

---

## 📁 File List

### New Files
- `src/components/modules/projects/detail/deliverables/studio-deliverable-detail.tsx`

### Modified Files
- `src/components/modules/projects/detail/deliverables/index.ts` (added export)
- `src/app/(protected)/@studio/projects/[projectId]/deliverables/[deliverableId]/page.tsx` (updated to use new component)

---

## 🚀 Definition of Done

- [x] `StudioDeliverableDetailView` component created
- [x] File preview with `DeliverablePreview` working
- [x] Download button with signed URL working
- [x] Metadata card showing status, submitter, size, date
- [x] Version history (read-only) working
- [x] Breadcrumb override implemented
- [x] Loading skeleton and not-found state implemented
- [x] Route page updated to use new component
- [x] `pnpm build` passes

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-12 | backlog | Story created |
| 2026-02-13 | review  | Implementation complete, all ACs satisfied |

---

**Previous Story**: 17-2 - Fix Deliverables Section Data Issues & UI Consistency  
**Next Story**: 17-4 - Update DeliverableCard Link Behavior for Studio Context
