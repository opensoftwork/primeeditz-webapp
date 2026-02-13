---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics"]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture/README.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - conversation-context (Reference File Upload UX Rearticulated Plan)
---

# PrimeEditz - Epic 19: File Upload UX Refactor

## Overview

This document provides the epic and story breakdown for the File Upload UX Refactor initiative. The goal is to replace the current single-file, invisible-progress upload in Reference Materials with a robust, multi-file upload experience featuring real-time progress tracking. The solution must be implemented as a **reusable shared component** that can be leveraged across Reference Materials, Folder Detail Views, and Project Onboarding flows.

## Requirements Inventory

### Functional Requirements

- FR1: The system must allow users to select multiple files simultaneously via a file picker or drag-and-drop interface.
- FR2: Selected files must be displayed in a "staged" queue for review before the upload process begins.
- FR3: The system must provide a modal/dialog interface displaying individual file upload progress bars, overall batch completion status/percentage, and success/error indicators for each file.
- FR4: The Reference Materials section must include an "Upload Reference" trigger that opens the new upload dialog.
- FR5: The upload process must utilize the `addReferenceFile` mutation to ensure storage quotas are updated in real-time.
- FR6: The upload modal must be implemented as a generic, reusable component (`FileUploadDialog`) decoupled from specific "folder" or "reference" logic.

### Non-Functional Requirements

- NFR1: The upload dialog design must strictly follow the Premium/Glassmorphic aesthetic established across the PrimeEditz application (dark mode, white/opacity borders, uppercase tracking labels, rounded corners).
- NFR2: The core UI components (DropZone, UploadQueue) must be extracted into `src/components/shared/file-upload/` to prevent code duplication.
- NFR3: Uploads should be handled efficiently, minimizing main thread blocking, and providing smooth animation feedback via `framer-motion`.

### Additional Requirements

- AR1: Leverage existing `shadcn/ui` components (Dialog, Progress, Button, Card).
- AR2: Use `framer-motion` for meaningful transitions (modal entry/exit, list item animations).
- AR3: Use XMLHttpRequest for upload progress tracking (as established in existing `FolderDetailView` pattern).
- AR4: Maintain backward compatibility with single-file uploads where the dialog is not used.

### FR Coverage Map

- FR1: Epic 19, Story 19.1 → Shared DropZone component
- FR2: Epic 19, Story 19.1 → Shared UploadQueue component
- FR3: Epic 19, Story 19.1 → FileUploadDialog component with progress tracking
- FR4: Epic 19, Story 19.2 → Reference Materials integration
- FR5: Epic 19, Story 19.2 → Mutation hookup and storage update verification
- FR6: Epic 19, Story 19.1 → Generic, context-agnostic component architecture

## Epic List

### Epic 19: File Upload UX Refactor

Extract, standardize, and enhance the file upload experience into reusable shared components with proper progress tracking, then integrate into Reference Materials upload flow.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6
**NFRs addressed:** NFR1, NFR2, NFR3

---

## Epic 19: File Upload UX Refactor

**Goal:** Users can upload files (reference materials, folder assets) through a unified, premium dialog interface that provides real-time progress feedback, multi-file support, and staged review — and the underlying components are reusable across the entire application.

---

### Story 19.1: Create Shared File Upload Components

As a **developer**,
I want **reusable file upload components extracted into `src/components/shared/file-upload/`**,
So that **any module in the application can use a consistent, premium upload experience without duplicating code**.

**Description:**

Extract and generalize the existing upload UX patterns from `FolderDetailView` (`FolderDropZone`, `StagedUploadQueue`) into shared, context-agnostic components. Create a new `FileUploadDialog` that wraps these components in a `Dialog` modal with proper progress tracking.

**Components to create:**

1. `src/components/shared/file-upload/drop-zone.tsx` — Generic drag-and-drop file selection area.
2. `src/components/shared/file-upload/upload-queue.tsx` — File list with individual progress bars, status icons, and overall progress.
3. `src/components/shared/file-upload/file-upload-dialog.tsx` — Modal wrapper combining DropZone + UploadQueue, accepting an `onUpload` callback for the actual upload logic.
4. `src/components/shared/file-upload/index.ts` — Barrel export.

**Technical Notes:**

- The `onUpload` callback signature: `(file: File, onProgress: (progress: number) => void) => Promise<void>`. This decouples the upload logic (S3, Convex mutation) from the UI.
- Use `XMLHttpRequest` for progress tracking (matching existing pattern from `folder-detail-view.tsx`).
- The existing `FolderDropZone` and `StagedUploadQueue` should be refactored to import from these shared components to reduce duplication (optional, can be deferred).
- The `StagedFile` interface should be exported from the shared module.

**Acceptance Criteria:**

**Given** a developer imports `FileUploadDialog` from `@/components/shared/file-upload`
**When** they render it with an `open` state, `onOpenChange` handler, and `onUpload` callback
**Then** a premium-styled dialog opens with a drop zone and staged file queue
**And** users can select multiple files via click or drag-and-drop

**Given** files are staged in the dialog
**When** the user clicks "Start Upload"
**Then** each file uploads sequentially, showing individual progress bars
**And** an overall progress bar displays batch completion percentage
**And** completed files show a green checkmark, failed files show a red error indicator

**Given** all files have completed uploading
**When** the user views the dialog
**Then** a "Close" or "Done" button is available to dismiss the dialog
**And** a success summary is displayed (e.g., "3 of 3 files uploaded successfully")

**Given** the dialog is rendered
**When** no files are staged
**Then** only the drop zone is visible with clear instructions ("Drop files here or click to browse")

---

### Story 19.2: Integrate File Upload Dialog into Reference Materials

As a **studio user or admin**,
I want **the "Upload Reference" button to open a proper upload dialog with progress tracking**,
So that **I can upload multiple reference files at once and see exactly what's happening during the upload**.

**Description:**

Replace the current hidden `<input type="file">` + simple spinner approach in `ReferenceMaterials` with the new `FileUploadDialog`. The `onUpload` callback will:

1. Call `generateUploadUrl` to get a pre-signed S3 URL.
2. Upload the file to S3 using `XMLHttpRequest` (with progress tracking).
3. Call `addReferenceFile` mutation to register the file in the project's `referenceFiles` array and update `storageUsed`.

**Technical Notes:**

- Remove the existing `fileInputRef`, `handleFileChange`, and `isUploading` state from `reference-materials.tsx`.
- Add `isDialogOpen` state to control the `FileUploadDialog`.
- The `onUpload` callback is project-specific and uses `projectId` to generate URLs and call mutations.
- After all uploads complete, the Convex reactive query will automatically refresh the file list.

**Acceptance Criteria:**

**Given** the user is viewing a project's Reference Materials section
**When** they click the "Upload Reference" button in the section header
**Then** the `FileUploadDialog` modal opens

**Given** the dialog is open
**When** the user selects one or more files and clicks "Start Upload"
**Then** each file is uploaded to S3 with visible progress
**And** each file is registered via the `addReferenceFile` mutation
**And** the project's `storageUsed` is incremented by each file's size

**Given** the upload completes
**When** the user closes the dialog
**Then** the Reference Materials grid refreshes to show the newly uploaded files
**And** the storage usage widget in the sidebar reflects the updated usage

**Given** the upload fails for a specific file
**When** the user views the dialog
**Then** the failed file shows an error indicator with the error message
**And** other files continue uploading normally

---

### Story 19.3: Refactor Folder Detail View to Use Shared Upload Components (Optional/Deferred)

As a **developer**,
I want **the `FolderDetailView` to use the shared file upload components from `@/components/shared/file-upload/`**,
So that **upload UX is consistent across the application and code duplication is eliminated**.

**Description:**

Replace `FolderDropZone` and `StagedUploadQueue` in `FolderDetailView` with the shared equivalents. This is an optional refactor that can be deferred if timelines are tight, since the folder view already has a working implementation. The shared components were extracted _from_ this view, so the behavior should be identical.

**Technical Notes:**

- The folder view uses an inline upload pattern (not a dialog). The shared `DropZone` and `UploadQueue` components should work standalone outside of the `FileUploadDialog` wrapper.
- The `StagedFile` type should be imported from the shared module.
- Tests should verify that the folder upload behavior remains identical after refactoring.

**Acceptance Criteria:**

**Given** a user navigates to a folder detail page
**When** they drag and drop files onto the drop zone
**Then** files are staged in the upload queue using the shared component
**And** the visual appearance and behavior is identical to the previous implementation

**Given** the user starts an upload in the folder view
**When** files are uploading
**Then** individual and overall progress is displayed using the shared `UploadQueue`
**And** the upload completes successfully with file records created in the database

---

## Implementation Priority

| Story | Priority | Effort | Dependencies |
| ----- | -------- | ------ | ------------ |
| 19.1  | **High** | Medium | None         |
| 19.2  | **High** | Low    | Story 19.1   |
| 19.3  | Low      | Low    | Story 19.1   |

**Recommended Sprint Plan:**

- **Sprint 1:** Story 19.1 + Story 19.2 (core value delivery)
- **Backlog:** Story 19.3 (deferred refactor, no user-facing impact)
