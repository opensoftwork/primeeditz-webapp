# Story 2.4: Wizard Step 3 — Reference Files Upload

Status: backlog

## Story

As a **Client**,
I want to upload reference files (mood boards, examples) during my project request,
so that the studio has visual context for my expectations.

## Acceptance Criteria

1. **AC-1:** Step 3 form must be accessible at `/client/projects/new?step=3`
2. **AC-2:** Support drag-and-drop and file selection (up to 10 files, 50MB each)
3. **AC-3:** Files must upload to MinIO via signed URLs to path `/projects/{projectId}/reference/`
4. **AC-4:** Progress indicator must show upload status for each file
5. **AC-5:** Successfully uploaded files must show green checkmark
6. **AC-6:** User must be able to remove files before final submission
7. **AC-7:** Reference files do NOT count against storage tier
8. **AC-8:** "Back" and "Next" buttons for navigation
9. **AC-9:** File metadata must be stored in Convex

## Tasks / Subtasks

### Task 1: Create Step 3 Component (AC: 1)

- [ ] 1.1 Create `src/components/modules/projects/wizard/step-3-reference-upload.tsx`
- [ ] 1.2 Integrate with wizard container
- [ ] 1.3 Add step indicator showing "Step 3 of 5"

### Task 2: File Upload UI (AC: 2)

- [ ] 2.1 Use `useFileUploader` hook from Story 2.0
- [ ] 2.2 Create drag-and-drop zone using shadcn/ui
- [ ] 2.3 Add file selection button as alternative to drag-drop
- [ ] 2.4 Show file type restrictions: images (jpg, png, gif) and videos (mp4, mov)
- [ ] 2.5 Validate file size (max 50MB per file)
- [ ] 2.6 Validate file count (max 10 files)
- [ ] 2.7 Show error messages for invalid files

### Task 3: MinIO Upload with Signed URLs (AC: 3)

- [ ] 3.1 Create Convex action `generateReferenceUploadUrl`:
  ```typescript
  export const generateReferenceUploadUrl = action({
    args: {
      projectId: v.id("projects"),
      filename: v.string(),
      contentType: v.string(),
    },
    handler: async (ctx, args) => {
      // Generate signed URL for MinIO
      const key = `projects/${args.projectId}/reference/${args.filename}`;
      const signedUrl = await generateSignedUploadUrl(key, args.contentType);
      return { signedUrl, key };
    },
  });
  ```
- [ ] 3.2 Implement direct upload to MinIO from browser
- [ ] 3.3 Handle upload errors gracefully

### Task 4: Upload Progress Tracking (AC: 4, 5)

- [ ] 4.1 Track upload progress for each file (0-100%)
- [ ] 4.2 Show progress bar for each uploading file
- [ ] 4.3 Show green checkmark on successful upload
- [ ] 4.4 Show red error icon on failed upload
- [ ] 4.5 Allow retry for failed uploads

### Task 5: File Management (AC: 6)

- [ ] 5.1 Display list of uploaded files with thumbnails
- [ ] 5.2 Add "Remove" button for each file
- [ ] 5.3 On remove: Delete from MinIO and remove from Convex
- [ ] 5.4 Create Convex mutation `removeReferenceFile`

### Task 6: Store File Metadata (AC: 9)

- [ ] 6.1 Create `referenceFiles` table in schema (or use existing `assets` table)
- [ ] 6.2 Store metadata after successful upload:
  ```typescript
  {
    projectId: Id<"projects">,
    filename: string,
    mimeType: string,
    sizeBytes: number,
    minioKey: string,
    uploadedAt: number,
  }
  ```
- [ ] 6.3 Link reference files to project in `projects.referenceFiles` array

### Task 7: Image Preview (AC: 5)

- [ ] 7.1 Use `ImageSlider` component from Story 2.0 for image previews
- [ ] 7.2 Show thumbnails for uploaded images
- [ ] 7.3 Click thumbnail to view full-size image
- [ ] 7.4 For videos, show video icon (no preview for MVP)

### Task 8: Navigation (AC: 8)

- [ ] 8.1 Add "Back" button → navigate to `?step=2`
- [ ] 8.2 Add "Next" button → navigate to `?step=4`
- [ ] 8.3 Allow navigation even if no files uploaded (optional step)
- [ ] 8.4 Warn if uploads are in progress

### Task 9: Testing & Validation (AC: All)

- [ ] 9.1 Test: Drag-and-drop files → uploads start
- [ ] 9.2 Test: File selection button works
- [ ] 9.3 Test: File size validation (reject > 50MB)
- [ ] 9.4 Test: File count validation (max 10 files)
- [ ] 9.5 Test: Progress indicators update correctly
- [ ] 9.6 Test: Successful uploads show checkmark
- [ ] 9.7 Test: Remove file works
- [ ] 9.8 Test: Image thumbnails display correctly
- [ ] 9.9 Test: Navigation preserves uploaded files

## Dev Notes

### File Upload Flow

```
1. User selects/drops files
2. Validate file size and count
3. For each file:
   a. Request signed URL from Convex action
   b. Upload directly to MinIO using signed URL
   c. Track progress
   d. On success: Store metadata in Convex
   e. Update UI with checkmark
```

### MinIO Path Structure

```
/projects/{projectId}/reference/{filename}
```

Reference files are separate from project assets and don't count against storage tier.

### useFileUploader Hook

Already ported in Story 2.0. Usage:

```typescript
const { uploadFiles, uploadProgress, uploadedFiles, removeFile } =
  useFileUploader({
    maxFiles: 10,
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    onUploadComplete: (file) => {
      // Store metadata in Convex
    },
  });
```

### References

- [Story 2.0: Wizard Infrastructure](./2-0-wizard-infrastructure-draft-project.md) - useFileUploader hook
- [Architecture: File Storage](../planning-artifacts/architecture/03-core-decisions.md#file-storage)

## Dependencies

- Story 2.0: Complete (useFileUploader hook, ImageSlider)
- MinIO: Configured and running
- Convex: Actions for signed URL generation
- shadcn/ui: Button, Progress, Card

## Definition of Done

- [ ] Step 3 component created and integrated
- [ ] Drag-and-drop file upload works
- [ ] File selection button works
- [ ] File validation (size, count, type) works
- [ ] Upload progress tracking works
- [ ] Successful uploads show checkmark
- [ ] Remove file functionality works
- [ ] File metadata stored in Convex
- [ ] Image thumbnails display correctly
- [ ] Navigation (Back/Next) works
- [ ] TypeScript compiles clean
- [ ] No console errors

## Dev Agent Record

### Agent Model Used

(To be filled after implementation)

### Completion Notes

(To be filled after implementation)

### File List

(To be filled after implementation)
