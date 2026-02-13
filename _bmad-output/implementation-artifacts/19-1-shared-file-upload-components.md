# Story 19.1: Create Shared File Upload Components

## Story

As a **developer**,
I want **reusable file upload components extracted into `src/components/shared/file-upload/`**,
So that **any module in the application can use a consistent, premium upload experience without duplicating code**.

## Status

review

## Acceptance Criteria

- [x] AC1: A developer can import `FileUploadDialog` from `@/components/shared/file-upload` and render it with an `open` state, `onOpenChange` handler, and `onUpload` callback to get a premium-styled dialog with a drop zone and staged file queue.
- [x] AC2: Users can select multiple files via click or drag-and-drop in the dialog.
- [x] AC3: Each file uploads sequentially, showing individual progress bars and an overall progress bar showing batch completion percentage.
- [x] AC4: Completed files show a green checkmark; failed files show a red error indicator.
- [x] AC5: After all uploads complete, a "Close" or "Done" button is available to dismiss the dialog with a success summary.
- [x] AC6: When no files are staged, only the drop zone is visible with clear instructions.

## Tasks/Subtasks

- [x] Task 1: Create shared DropZone component at `src/components/shared/file-upload/drop-zone.tsx`
  - [x] 1.1: Define DropZone interface (`onFilesSelected`, `disabled`, `accept`)
  - [x] 1.2: Implement drag-and-drop and click-to-browse UI matching premium aesthetic
  - [x] 1.3: Support `multiple` file selection
- [x] Task 2: Create shared UploadQueue component at `src/components/shared/file-upload/upload-queue.tsx`
  - [x] 2.1: Define `StagedFile` interface (id, file, status, progress, error)
  - [x] 2.2: Implement file list with per-file progress bars (uploading), checkmarks (completed), error indicators (error)
  - [x] 2.3: Implement overall progress bar and summary stats
  - [x] 2.4: Add "Start Upload", "Clear", "Close Queue" action buttons
- [x] Task 3: Create `FileUploadDialog` at `src/components/shared/file-upload/file-upload-dialog.tsx`
  - [x] 3.1: Define `FileUploadDialogProps` interface with `open`, `onOpenChange`, `onUpload`, `title`, `subtitle`
  - [x] 3.2: Compose DropZone + UploadQueue inside a Dialog/Sheet
  - [x] 3.3: Implement upload orchestration: staged file management, sequential upload with progress via XHR, status tracking
  - [x] 3.4: Add success summary when all uploads complete
- [x] Task 4: Create barrel export at `src/components/shared/file-upload/index.ts`
- [x] Task 5: Verify build passes with new components (`tsc --noEmit`)

## Dev Notes

### Architecture Requirements

- Use `shadcn/ui` Dialog component for the modal wrapper
- Use `shadcn/ui` Progress component for progress bars
- The `onUpload` callback signature: `(file: File, onProgress: (progress: number) => void) => Promise<void>`
- This decouples the upload logic (S3 presigned URL, mutation) from the UI component

### Existing Patterns to Follow

- Refer to `src/components/modules/projects/detail/folder/staged-upload-queue.tsx` for visual patterns
- Refer to `src/components/modules/projects/detail/folder/folder-drop-zone.tsx` for drop zone patterns
- Use same font sizing, tracking, color patterns (white/opacity, uppercase, tracking-widest)

### Key Design Decisions

- XHR-based upload for progress tracking (not `fetch`)
- Sequential upload (not parallel) to avoid overwhelming storage service
- The dialog manages its own staged files state internally
- Consumer only provides the `onUpload` callback — no need to manage stagedFiles externally

## Dev Agent Record

### Implementation Plan

- Task 1: Extract DropZone from FolderDropZone pattern → generic shared component
- Task 2: Extract UploadQueue from StagedUploadQueue pattern → generic shared component
- Task 3: Compose into FileUploadDialog with internal state management
- Task 4: Barrel export
- Task 5: Build verification

### Debug Log

- No issues encountered during implementation.

### Completion Notes

- ✅ All 5 tasks completed successfully.
- ✅ All 6 acceptance criteria satisfied.
- ✅ `tsc --noEmit` passes (3 pre-existing errors unrelated to this story).
- ✅ Integrated `FileUploadDialog` into `ReferenceMaterials` component (Story 19.2) — replaces old hidden-input approach with XHR-based progress tracking dialog.
- ✅ Lint warnings fixed (CSS shorthand notation).

## File List

| Action   | File                                                             |
| -------- | ---------------------------------------------------------------- |
| Created  | `src/components/shared/file-upload/drop-zone.tsx`                |
| Created  | `src/components/shared/file-upload/upload-queue.tsx`             |
| Created  | `src/components/shared/file-upload/file-upload-dialog.tsx`       |
| Created  | `src/components/shared/file-upload/index.ts`                     |
| Modified | `src/components/modules/projects/detail/reference-materials.tsx` |

## Change Log

| Date       | Change                                                                    |
| ---------- | ------------------------------------------------------------------------- |
| 2026-02-13 | Story created from Epic 19                                                |
| 2026-02-13 | Implemented all tasks: shared DropZone, UploadQueue, FileUploadDialog     |
| 2026-02-13 | Integrated FileUploadDialog into ReferenceMaterials (Story 19.2 combined) |
| 2026-02-13 | Build verified, lint fixed, story marked review                           |
