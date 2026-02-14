---
id: 19-1
title: Create Shared File Upload Components
epic: 19-file-upload-ux-refactor
status: backlog
priority: high
points: 5
assignee: null
dependencies: []
created: 2026-02-14
updated: 2026-02-14
---

# Story 19-1: Create Shared File Upload Components

**Epic**: Epic 19 - File Upload UX Refactor
**Status**: backlog
**Complexity**: Medium (5 points)
**Created**: 2026-02-14
**Priority**: HIGH — Foundation for all upload UX improvements

---

## 📋 User Story

**As a** developer,
**I want** reusable file upload components extracted into `src/components/shared/file-upload/`,
**So that** any module in the application can use a consistent, premium upload experience without duplicating code.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On | Status | Notes                                            |
| ---------- | ------ | ------------------------------------------------ |
| None       | N/A    | No prerequisites — greenfield component creation |

### Enables

| Story / Epic                              | Notes                                               |
| ----------------------------------------- | --------------------------------------------------- |
| **19-2: Reference Materials Integration** | Uses `FileUploadDialog` as the upload UI            |
| **19-3: Folder Detail Refactor**          | Uses shared `DropZone` and `UploadQueue` components |

---

## ✅ Acceptance Criteria

### AC-1: FileUploadDialog Renders Correctly

- [ ] **Given** a developer imports `FileUploadDialog` from `@/components/shared/file-upload`
- [ ] **When** they render it with an `open` state, `onOpenChange` handler, and `onUpload` callback
- [ ] **Then** a premium-styled dialog opens with a drop zone and staged file queue

### AC-2: Multi-File Selection

- [ ] **Given** the dialog is open
- [ ] **When** a user selects multiple files via click or drag-and-drop
- [ ] **Then** all selected files appear in the staged queue for review
- [ ] **And** each file shows its name, size, and a remove button

### AC-3: Upload Progress Tracking

- [ ] **Given** files are staged in the dialog
- [ ] **When** the user clicks "Start Upload"
- [ ] **Then** each file uploads sequentially, showing individual progress bars
- [ ] **And** an overall progress bar displays batch completion percentage
- [ ] **And** completed files show a green checkmark, failed files show a red error indicator

### AC-4: Completion State

- [ ] **Given** all files have completed uploading
- [ ] **When** the user views the dialog
- [ ] **Then** a "Close" or "Done" button is available to dismiss the dialog
- [ ] **And** a success summary is displayed (e.g., "3 of 3 files uploaded successfully")

### AC-5: Empty State

- [ ] **Given** the dialog is rendered
- [ ] **When** no files are staged
- [ ] **Then** only the drop zone is visible with clear instructions ("Drop files here or click to browse")

### AC-6: Premium Design Aesthetic

- [ ] **Given** the dialog is rendered
- [ ] **When** the user interacts with any element
- [ ] **Then** the design follows the PrimeEditz Premium/Glassmorphic aesthetic (dark mode, white/opacity borders, uppercase tracking labels, rounded corners)
- [ ] **And** all transitions use `framer-motion` for smooth animations (modal entry/exit, list item animations)

---

## 📘 Implementation

### Phase A: Shared Types & Interfaces (~0.5 points)

#### Task A1: Define StagedFile Interface

**File**: `src/components/shared/file-upload/types.ts`

Define the core types used across all file upload components:

```typescript
// src/components/shared/file-upload/types.ts

export type UploadStatus = "staged" | "uploading" | "completed" | "failed";

export interface StagedFile {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number; // 0-100
  error?: string;
}

export type OnUploadCallback = (
  file: File,
  onProgress: (progress: number) => void,
) => Promise<void>;
```

- [ ] A1.1 Create `types.ts` with `StagedFile` interface and `OnUploadCallback` type
- [ ] A1.2 Export `UploadStatus` union type

---

### Phase B: DropZone Component (~1.5 points)

#### Task B1: Create DropZone

**File**: `src/components/shared/file-upload/drop-zone.tsx`

Generic drag-and-drop file selection area. Must handle:

- Drag enter/leave/over events with visual feedback
- File input click fallback
- Multi-file selection
- Optional file type/size restrictions via props

```typescript
// Props interface
interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string; // e.g., "image/*,.pdf"
  maxSizeBytes?: number;
  disabled?: boolean;
  className?: string;
}
```

**Design Requirements:**

- Dashed border container with hover/drag-active state
- Upload icon (from Lucide) centered
- "Drop files here or click to browse" instruction text
- Glassmorphic styling: `bg-white/5`, `border border-white/10`, `rounded-xl`
- Drag-active state: `border-primary`, `bg-primary/10`
- `framer-motion` scale animation on drag enter

- [ ] B1.1 Create `DropZone` component with drag-and-drop event handlers
- [ ] B1.2 Add click-to-browse via hidden `<input type="file" multiple />`
- [ ] B1.3 Implement drag-active visual state with `framer-motion`
- [ ] B1.4 Apply Premium/Glassmorphic design tokens

---

### Phase C: UploadQueue Component (~1.5 points)

#### Task C1: Create UploadQueue

**File**: `src/components/shared/file-upload/upload-queue.tsx`

Displays the list of staged/uploading/completed files with progress.

```typescript
// Props interface
interface UploadQueueProps {
  files: StagedFile[];
  onRemoveFile: (id: string) => void;
  overallProgress: number; // 0-100
  isUploading: boolean;
}
```

**Design Requirements:**

- Each file row: file icon, file name (truncated), file size, progress bar, status icon, remove button
- Overall progress bar at the top or bottom of the queue
- Status icons: `Loader2` (spinning) for uploading, `CheckCircle2` (green) for completed, `XCircle` (red) for failed
- `framer-motion` `AnimatePresence` for file list add/remove animations
- `framer-motion` `layoutId` for smooth reordering
- Scrollable if many files (max-height with overflow)

- [ ] C1.1 Create `UploadQueue` component with file list rendering
- [ ] C1.2 Add individual file progress bars using shadcn `Progress` component
- [ ] C1.3 Add overall batch progress bar
- [ ] C1.4 Implement status icons (uploading spinner, success checkmark, error X)
- [ ] C1.5 Add remove button for staged files (hidden during upload)
- [ ] C1.6 Add `framer-motion` `AnimatePresence` for list animations

---

### Phase D: FileUploadDialog Component (~1.5 points)

#### Task D1: Create FileUploadDialog

**File**: `src/components/shared/file-upload/file-upload-dialog.tsx`

Modal wrapper that combines DropZone + UploadQueue with upload orchestration logic.

```typescript
// Props interface
interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: OnUploadCallback;
  title?: string;
  description?: string;
  accept?: string;
  maxSizeBytes?: number;
}
```

**Internal State:**

- `stagedFiles: StagedFile[]` — managed via `useState`
- `isUploading: boolean` — true while batch upload is in progress
- `overallProgress: number` — computed from individual file progress

**Upload Logic:**

1. User stages files via DropZone → files added to `stagedFiles` with status `"staged"`
2. User clicks "Start Upload" → iterate files sequentially:
   a. Set file status to `"uploading"`
   b. Call `onUpload(file, onProgress)` where `onProgress` updates the file's `progress`
   c. On success: set status to `"completed"`, progress to 100
   d. On error: set status to `"failed"`, store error message
3. After all files processed, show completion summary

**Design Requirements:**

- Uses shadcn `Dialog` component
- Dialog content: max-width `lg`, rounded corners, glassmorphic background
- Header with title + description
- Footer with action buttons: "Start Upload" (primary), "Cancel" (ghost)
- After completion: "Done" button replaces action buttons
- Summary text: "X of Y files uploaded successfully"

- [ ] D1.1 Create `FileUploadDialog` with shadcn `Dialog` wrapper
- [ ] D1.2 Integrate `DropZone` for file selection
- [ ] D1.3 Integrate `UploadQueue` for file list display
- [ ] D1.4 Implement sequential upload orchestration with `onUpload` callback
- [ ] D1.5 Compute overall progress from individual file progress values
- [ ] D1.6 Handle completion state with summary and "Done" button
- [ ] D1.7 Prevent dialog close during active upload (or show confirmation)

---

### Phase E: Barrel Export (~0 points)

#### Task E1: Create Index File

**File**: `src/components/shared/file-upload/index.ts`

```typescript
export { DropZone } from "./drop-zone";
export { UploadQueue } from "./upload-queue";
export { FileUploadDialog } from "./file-upload-dialog";
export type { StagedFile, OnUploadCallback, UploadStatus } from "./types";
```

- [ ] E1.1 Create barrel export with all components and types

---

## 🧪 Testing Checklist

### DropZone

- [ ] Renders with correct placeholder text
- [ ] Accepts files via click (file input opens)
- [ ] Accepts files via drag-and-drop
- [ ] Visual state changes on drag enter/leave
- [ ] Calls `onFilesSelected` with correct file array
- [ ] Disabled state prevents interaction

### UploadQueue

- [ ] Renders file list with names and sizes
- [ ] Shows correct status icon per file state
- [ ] Progress bars update in real-time
- [ ] Remove button hidden during upload
- [ ] Overall progress bar reflects batch status
- [ ] AnimatePresence animations fire on add/remove

### FileUploadDialog

- [ ] Opens and closes via `open` / `onOpenChange` props
- [ ] Files can be staged and reviewed before upload
- [ ] "Start Upload" triggers sequential upload via `onUpload` callback
- [ ] Individual and overall progress bars update during upload
- [ ] Completed files show checkmark, failed files show error
- [ ] Completion summary displays correct counts
- [ ] Dialog cannot be accidentally closed during upload

---

## 🚀 Definition of Done

- [ ] `src/components/shared/file-upload/types.ts` — StagedFile & callback types created
- [ ] `src/components/shared/file-upload/drop-zone.tsx` — DropZone component created
- [ ] `src/components/shared/file-upload/upload-queue.tsx` — UploadQueue component created
- [ ] `src/components/shared/file-upload/file-upload-dialog.tsx` — FileUploadDialog component created
- [ ] `src/components/shared/file-upload/index.ts` — Barrel export created
- [ ] All components follow Premium/Glassmorphic design aesthetic
- [ ] `framer-motion` animations applied for transitions
- [ ] All files compile without TypeScript errors
- [ ] All files under 200 lines

---

## Estimated Effort

- Types & interfaces: 15 min
- DropZone component: 45 min
- UploadQueue component: 1 hour
- FileUploadDialog component: 1.5 hours
- Barrel export & cleanup: 5 min
- Testing & validation: 30 min
- **Total: ~3.5 hours**

---

## 📂 File Summary

| File                                                       | Action | Lines (Est.) |
| ---------------------------------------------------------- | ------ | ------------ |
| `src/components/shared/file-upload/types.ts`               | Create | ~20          |
| `src/components/shared/file-upload/drop-zone.tsx`          | Create | ~120         |
| `src/components/shared/file-upload/upload-queue.tsx`       | Create | ~150         |
| `src/components/shared/file-upload/file-upload-dialog.tsx` | Create | ~180         |
| `src/components/shared/file-upload/index.ts`               | Create | ~5           |

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-14 | backlog | Story created |

---

**Previous Story**: N/A (first story in Epic 19)
**Next Story**: 19-2 - Integrate File Upload Dialog into Reference Materials
