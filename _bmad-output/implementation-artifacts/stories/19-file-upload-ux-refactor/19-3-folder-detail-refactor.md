---
id: 19-3
title: Refactor Folder Detail View to Use Shared Upload Components
epic: 19-file-upload-ux-refactor
status: backlog
priority: low
points: 2
assignee: null
dependencies: ["19-1"]
created: 2026-02-14
updated: 2026-02-14
---

# Story 19-3: Refactor Folder Detail View to Use Shared Upload Components (Optional/Deferred)

**Epic**: Epic 19 - File Upload UX Refactor
**Status**: backlog
**Complexity**: Low (2 points)
**Created**: 2026-02-14
**Priority**: LOW — Code quality refactor, no user-facing impact

---

## 📋 User Story

**As a** developer,
**I want** the `FolderDetailView` to use the shared file upload components from `@/components/shared/file-upload/`,
**So that** upload UX is consistent across the application and code duplication is eliminated.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                         | Status  | Notes                                               |
| ---------------------------------- | ------- | --------------------------------------------------- |
| **19-1: Shared Upload Components** | backlog | `DropZone` and `UploadQueue` must be available      |
| **FolderDetailView**               | ✅ Done | Existing component with local upload implementation |

### Enables

| Story / Epic | Notes                                                     |
| ------------ | --------------------------------------------------------- |
| N/A          | Internal quality improvement — consistent upload patterns |

---

## ✅ Acceptance Criteria

### AC-1: Shared DropZone Integration

- [ ] **Given** a user navigates to a folder detail page
- [ ] **When** they drag and drop files onto the drop zone
- [ ] **Then** files are staged in the upload queue using the shared `DropZone` component
- [ ] **And** the visual appearance and behavior is identical to the previous implementation

### AC-2: Shared UploadQueue Integration

- [ ] **Given** the user starts an upload in the folder view
- [ ] **When** files are uploading
- [ ] **Then** individual and overall progress is displayed using the shared `UploadQueue`
- [ ] **And** the upload completes successfully with file records created in the database

### AC-3: Local Components Removed

- [ ] **Given** the refactor is complete
- [ ] **When** the codebase is reviewed
- [ ] **Then** the local `FolderDropZone` and `StagedUploadQueue` components are removed or deprecated
- [ ] **And** all imports point to `@/components/shared/file-upload/`

### AC-4: Type Consistency

- [ ] **Given** the shared `StagedFile` type is used
- [ ] **When** the folder upload logic references staged files
- [ ] **Then** the `StagedFile` type is imported from `@/components/shared/file-upload/types`
- [ ] **And** no local duplicate type definitions exist

---

## 📘 Implementation

### Phase A: Replace Local DropZone (~1 point)

#### Task A1: Swap FolderDropZone for Shared DropZone

**File**: Locate and modify `folder-detail-view.tsx` (or equivalent).

**Changes:**

1. Replace import of local `FolderDropZone` with shared `DropZone`:

   ```typescript
   // Before
   import { FolderDropZone } from "./folder-drop-zone";

   // After
   import { DropZone } from "@/components/shared/file-upload";
   ```

2. Update JSX to use `DropZone` with matching props.

3. Verify the inline upload pattern (not dialog) still works — the folder view uses DropZone + UploadQueue directly in the page, not inside a dialog.

- [ ] A1.1 Replace `FolderDropZone` import with shared `DropZone`
- [ ] A1.2 Map existing props to shared component props
- [ ] A1.3 Verify inline rendering (no dialog wrapper needed)

---

### Phase B: Replace Local UploadQueue (~0.5 points)

#### Task B1: Swap StagedUploadQueue for Shared UploadQueue

1. Replace import of local `StagedUploadQueue` with shared `UploadQueue`.
2. Update props mapping.
3. Import `StagedFile` type from shared module.

- [ ] B1.1 Replace `StagedUploadQueue` import with shared `UploadQueue`
- [ ] B1.2 Import `StagedFile` type from `@/components/shared/file-upload`
- [ ] B1.3 Remove local `StagedFile` type definition

---

### Phase C: Cleanup (~0.5 points)

#### Task C1: Remove Local Components

- [ ] C1.1 Delete or deprecate `folder-drop-zone.tsx` (local component file)
- [ ] C1.2 Delete or deprecate `staged-upload-queue.tsx` (local component file)
- [ ] C1.3 Update any barrel exports that referenced the old local components

---

## 🧪 Testing Checklist

### Functional Regression

- [ ] Drag-and-drop files onto folder detail → files staged correctly
- [ ] Click-to-browse → file picker opens, files staged
- [ ] Upload starts → individual progress bars shown
- [ ] Upload completes → files appear in folder file list
- [ ] Failed upload → error indicator shown, other files unaffected
- [ ] Remove staged file before upload → file removed from queue
- [ ] Visual appearance identical to previous implementation

### Code Quality

- [ ] No local `FolderDropZone` or `StagedUploadQueue` components remain
- [ ] No local `StagedFile` type definition remains
- [ ] All imports point to `@/components/shared/file-upload/`
- [ ] No TypeScript errors

---

## 🚀 Definition of Done

- [ ] `FolderDetailView` uses shared `DropZone` and `UploadQueue` components
- [ ] `StagedFile` type imported from shared module
- [ ] Local upload components removed or deprecated
- [ ] Folder upload behavior identical to previous implementation
- [ ] All files compile without TypeScript errors
- [ ] No visual regressions

---

## Estimated Effort

- Swap DropZone: 20 min
- Swap UploadQueue: 15 min
- Cleanup & barrel exports: 10 min
- Testing & regression: 30 min
- **Total: ~1.25 hours**

---

## 📂 File Summary

| File                      | Action | Lines (Est.) |
| ------------------------- | ------ | ------------ |
| `folder-detail-view.tsx`  | Modify | ~±15 lines   |
| `folder-drop-zone.tsx`    | Delete | —            |
| `staged-upload-queue.tsx` | Delete | —            |

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-14 | backlog | Story created |

---

**Previous Story**: 19-2 - Integrate File Upload Dialog into Reference Materials
**Next Story**: N/A (last story in Epic 19)
