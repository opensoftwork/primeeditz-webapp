---
id: 19-2
title: Integrate File Upload Dialog into Reference Materials
epic: 19-file-upload-ux-refactor
status: backlog
priority: high
points: 3
assignee: null
dependencies: ["19-1"]
created: 2026-02-14
updated: 2026-02-14
---

# Story 19-2: Integrate File Upload Dialog into Reference Materials

**Epic**: Epic 19 - File Upload UX Refactor
**Status**: backlog
**Complexity**: Low (3 points)
**Created**: 2026-02-14
**Priority**: HIGH — Core user-facing value delivery

---

## 📋 User Story

**As a** studio user or admin,
**I want** the "Upload Reference" button to open a proper upload dialog with progress tracking,
**So that** I can upload multiple reference files at once and see exactly what's happening during the upload.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                         | Status  | Notes                                          |
| ---------------------------------- | ------- | ---------------------------------------------- |
| **19-1: Shared Upload Components** | backlog | `FileUploadDialog` must be available           |
| **Reference Materials component**  | ✅ Done | Existing `reference-materials.tsx` component   |
| **addReferenceFile mutation**      | ✅ Done | Existing Convex mutation for registering files |
| **generateUploadUrl action**       | ✅ Done | Existing Convex action for S3 pre-signed URLs  |

### Enables

| Story / Epic | Notes                                        |
| ------------ | -------------------------------------------- |
| End users    | Multi-file reference upload with progress UX |

---

## ✅ Acceptance Criteria

### AC-1: Upload Button Opens Dialog

- [ ] **Given** the user is viewing a project's Reference Materials section
- [ ] **When** they click the "Upload Reference" button in the section header
- [ ] **Then** the `FileUploadDialog` modal opens

### AC-2: Upload Process

- [ ] **Given** the dialog is open
- [ ] **When** the user selects one or more files and clicks "Start Upload"
- [ ] **Then** each file is uploaded to S3 with visible progress
- [ ] **And** each file is registered via the `addReferenceFile` mutation
- [ ] **And** the project's `storageUsed` is incremented by each file's size

### AC-3: Post-Upload Refresh

- [ ] **Given** the upload completes
- [ ] **When** the user closes the dialog
- [ ] **Then** the Reference Materials grid refreshes to show the newly uploaded files
- [ ] **And** the storage usage widget in the sidebar reflects the updated usage

### AC-4: Error Handling

- [ ] **Given** the upload fails for a specific file
- [ ] **When** the user views the dialog
- [ ] **Then** the failed file shows an error indicator with the error message
- [ ] **And** other files continue uploading normally

### AC-5: Legacy Code Cleanup

- [ ] **Given** the new dialog is integrated
- [ ] **When** the code is reviewed
- [ ] **Then** the old `fileInputRef`, `handleFileChange`, and `isUploading` state have been removed
- [ ] **And** the component is cleaner with less local state

---

## 📘 Implementation

### Phase A: Modify Reference Materials Component (~2 points)

#### Task A1: Replace Hidden File Input with Dialog

**File**: Locate and modify the existing `reference-materials.tsx` component.

**Changes:**

1. Remove the existing upload mechanism:
   - Remove `fileInputRef` (useRef for hidden file input)
   - Remove `handleFileChange` function
   - Remove `isUploading` state
   - Remove the hidden `<input type="file" />` element

2. Add dialog state and import:

   ```typescript
   import { FileUploadDialog } from "@/components/shared/file-upload";

   const [isDialogOpen, setIsDialogOpen] = useState(false);
   ```

3. Create the `onUpload` callback:

   ```typescript
   const handleUpload = async (
     file: File,
     onProgress: (progress: number) => void,
   ) => {
     // 1. Get pre-signed S3 URL
     const uploadUrl = await generateUploadUrl();

     // 2. Upload to S3 with XMLHttpRequest for progress tracking
     const storageId = await new Promise<string>((resolve, reject) => {
       const xhr = new XMLHttpRequest();
       xhr.upload.addEventListener("progress", (e) => {
         if (e.lengthComputable) {
           onProgress(Math.round((e.loaded / e.total) * 100));
         }
       });
       xhr.addEventListener("load", () => {
         if (xhr.status === 200) {
           const { storageId } = JSON.parse(xhr.responseText);
           resolve(storageId);
         } else {
           reject(new Error(`Upload failed: ${xhr.statusText}`));
         }
       });
       xhr.addEventListener("error", () => reject(new Error("Upload failed")));
       xhr.open("POST", uploadUrl);
       xhr.send(file);
     });

     // 3. Register with Convex mutation
     await addReferenceFile({
       projectId,
       storageId,
       fileName: file.name,
       fileSize: file.size,
       mimeType: file.type,
     });
   };
   ```

4. Wire the "Upload Reference" button:

   ```tsx
   <Button onClick={() => setIsDialogOpen(true)}>
     <Upload className="h-4 w-4 mr-2" />
     Upload Reference
   </Button>

   <FileUploadDialog
     open={isDialogOpen}
     onOpenChange={setIsDialogOpen}
     onUpload={handleUpload}
     title="Upload Reference Files"
     description="Upload reference materials for this project"
   />
   ```

- [ ] A1.1 Remove `fileInputRef`, `handleFileChange`, `isUploading`, and hidden `<input />`
- [ ] A1.2 Add `isDialogOpen` state
- [ ] A1.3 Import `FileUploadDialog` from shared module
- [ ] A1.4 Create `handleUpload` callback with S3 upload + `addReferenceFile` mutation
- [ ] A1.5 Wire "Upload Reference" button to open dialog
- [ ] A1.6 Render `FileUploadDialog` with correct props

---

### Phase B: Verify Reactive Updates (~0.5 points)

#### Task B1: Verify Convex Reactivity

After upload completes and dialog closes, the Convex reactive query should automatically refresh the file list without manual refetch.

- [ ] B1.1 Verify reference materials grid updates automatically after upload
- [ ] B1.2 Verify storage usage widget reflects new usage

---

### Phase C: Edge Cases (~0.5 points)

#### Task C1: Handle Edge Cases

- [ ] C1.1 Verify large file uploads show smooth progress (not jumpy from S3 chunking)
- [ ] C1.2 Verify duplicate file names are handled (Convex uses storageId, not name)
- [ ] C1.3 Verify file type restrictions match Reference Materials requirements (if any)

---

## 🧪 Testing Checklist

### Integration

- [ ] "Upload Reference" button opens `FileUploadDialog`
- [ ] Single file upload completes successfully
- [ ] Multi-file upload shows individual + overall progress
- [ ] Files appear in Reference Materials grid after upload
- [ ] Storage usage updates after upload
- [ ] Failed upload shows error in dialog, other files continue
- [ ] Dialog can be closed after all uploads complete
- [ ] Old upload mechanism fully removed (no hidden file input in DOM)

### Regression

- [ ] Existing reference file display unchanged
- [ ] Reference file download still works
- [ ] Reference file delete still works
- [ ] Storage quota enforcement still works

---

## 🚀 Definition of Done

- [ ] `reference-materials.tsx` updated to use `FileUploadDialog`
- [ ] Old file input mechanism removed
- [ ] `handleUpload` callback implements S3 upload + mutation registration
- [ ] Reactive updates work (file list + storage widget)
- [ ] Error handling for individual file failures
- [ ] All files compile without TypeScript errors
- [ ] Premium design aesthetic maintained

---

## Estimated Effort

- Remove old upload mechanism: 15 min
- Create `handleUpload` callback: 30 min
- Wire dialog and button: 15 min
- Test and validate: 30 min
- **Total: ~1.5 hours**

---

## 📂 File Summary

| File                      | Action | Lines (Est.) |
| ------------------------- | ------ | ------------ |
| `reference-materials.tsx` | Modify | ~±30 lines   |

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-14 | backlog | Story created |

---

**Previous Story**: 19-1 - Create Shared File Upload Components
**Next Story**: 19-3 - Refactor Folder Detail View to Use Shared Upload Components
