# Story 5-4: Upload Progress & Validation

**Epic**: Epic 5 - Asset Upload & Folder Management  
**Status**: ready-for-dev  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-18  
**Priority**: MUST — Core UX requirement

---

## 📋 User Story

**As a** Client,  
**I want** to see upload progress and validation feedback with retry options,  
**So that** I know the status of my uploads and can recover from failures.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                          | Status  | Notes                     |
| ----------------------------------- | ------- | ------------------------- |
| **5-3 - File Upload Dual Strategy** | Pending | Upload mechanism          |
| **Zustand Upload Store**            | In 5-3  | Progress state management |

### Enables

| Story / Epic            | Notes                 |
| ----------------------- | --------------------- |
| **5-5 - Storage Limit** | Pre-flight validation |
| **5-6 - Mark Complete** | After uploads finish  |

---

## ✅ Acceptance Criteria

### AC1: Individual File Progress

- [ ] **Given** a file is uploading
- [ ] **Then** I see:
  - File name (truncated if long)
  - File type icon (image/video)
  - Progress bar (0-100%)
  - Upload speed indicator (e.g., "12.5 MB/s")
  - Status badge (Uploading, Complete, Failed, Paused)

### AC2: Batch Progress

- [ ] **Given** multiple files in queue
- [ ] **Then** I see batch summary:
  - "X of Y files complete"
  - Total progress bar (aggregate)
  - Estimated time remaining

### AC3: Pre-Upload Validation

- [ ] **Given** I select files to upload
- [ ] **Then** validation occurs BEFORE upload starts:
  - File type check: `image/*` → photo, `video/*` → video
  - Size limits: photos <100MB, videos <2GB
  - Unknown MIME types rejected
- [ ] **And** invalid files show error immediately
- [ ] **And** valid files proceed to queue

### AC4: Thumbnail Preview

- [ ] **Given** an image file is uploading/queued
- [ ] **Then** I see a thumbnail preview
- [ ] **And** video files show video icon (no preview)

### AC5: Error Handling & Retry

- [ ] **Given** an upload fails
- [ ] **Then** I see:
  - Error message explaining failure
  - "Retry" button
  - Option to remove from queue
- [ ] **And** clicking retry attempts upload again
- [ ] **And** retry uses exponential backoff (0, 3s, 5s, 10s, 20s)

### AC6: Pause/Resume for Resumable Uploads

- [ ] **Given** a large file (>100MB) using tus
- [ ] **Then** I see "Pause" button
- [ ] **And** clicking pause stops upload
- [ ] **And** "Resume" button appears
- [ ] **And** clicking resume continues from where it stopped

---

## 🎨 UX Design

### Upload Item States

```
┌─────────────────────────────────────────────────────────────────────────┐
│ UPLOADING                                                               │
├─────────────────────────────────────────────────────────────────────────┤
│ 🖼️ ceremony_001.jpg                                                    │
│ ████████████████████████░░░░░░░░ 72%    12.5 MB/s                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ UPLOADING (RESUMABLE)                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ 🎬 highlight_reel.mp4                                    [⏸️ Pause]     │
│ ██████░░░░░░░░░░░░░░░░░░░░░░░░░░ 22%    8.2 MB/s         Resumable     │
│ 450 MB / 2.1 GB                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ PAUSED                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ 🎬 highlight_reel.mp4                                    [▶️ Resume]    │
│ ██████░░░░░░░░░░░░░░░░░░░░░░░░░░ 22%    Paused                          │
│ 450 MB / 2.1 GB                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ✅ COMPLETE                                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ 🖼️ couple_portrait_001.jpg                              ✅ Complete     │
│ ████████████████████████████████ 100%   15.4 MB                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ❌ FAILED                                                               │
├─────────────────────────────────────────────────────────────────────────┤
│ 🖼️ corrupt_file.raw                     [🔄 Retry]  [✕ Remove]         │
│ ❌ Failed: File format not supported                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ⏳ QUEUED                                                               │
├─────────────────────────────────────────────────────────────────────────┤
│ 🖼️ reception_001.jpg                                    ⏳ Queued       │
│ Waiting...                                              45.2 MB        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Validation Error States

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️ VALIDATION FAILED                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ 🖼️ massive_image.tiff                                   ⚠️ Too Large    │
│ 156 MB exceeds 100MB limit for photos                                   │
│                                              [Remove from selection]    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️ VALIDATION FAILED                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ 📄 document.pdf                                          ⚠️ Invalid     │
│ File type not supported. Use JPG, PNG, RAW, MP4, MOV                    │
│                                              [Remove from selection]    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Validation Layer (~1.5 points)

#### Task A1: File Validation Utility

**File**: `src/lib/file-validation.ts`

```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  type: 'image' | 'video' | 'unknown';
}

const VALID_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/raw', 'image/heic'],
  video: ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'],
};

const SIZE_LIMITS = {
  image: 100 * 1024 * 1024, // 100MB
  video: 2 * 1024 * 1024 * 1024, // 2GB
};

export function validateFile(file: File): ValidationResult { ... }
```

- [ ] A1.1 Create validation utility
- [ ] A1.2 MIME type detection
- [ ] A1.3 Size limit checks
- [ ] A1.4 Return detailed error messages

#### Task A2: Pre-Upload Validation in Upload Store

**File**: `src/stores/upload-store.ts` (extend from 5-3)

- [ ] A2.1 Validate files when adding to queue
- [ ] A2.2 Separate valid/invalid files
- [ ] A2.3 Emit validation errors for display

---

### Phase B: Progress Components (~2 points)

#### Task B1: Upload Item Component

**File**: `src/components/modules/client/assets/upload-item.tsx`

- [ ] B1.1 Create base upload item layout
- [ ] B1.2 State-based styling (uploading/complete/failed/paused/queued)
- [ ] B1.3 Progress bar with percentage
- [ ] B1.4 Upload speed display
- [ ] B1.5 Pause/Resume buttons for tus uploads
- [ ] B1.6 Retry/Remove buttons for failed uploads

#### Task B2: Thumbnail Preview Component

**File**: `src/components/modules/client/assets/upload-thumbnail.tsx`

- [ ] B2.1 Generate thumbnail for images
- [ ] B2.2 Use FileReader + canvas for preview
- [ ] B2.3 Default icons for video/other

#### Task B3: Batch Progress Header

**File**: `src/components/modules/client/assets/batch-progress-header.tsx`

- [ ] B3.1 "X of Y complete" display
- [ ] B3.2 Aggregate progress bar
- [ ] B3.3 Estimated time remaining
- [ ] B3.4 "Cancel All" / "Pause All" buttons

#### Task B4: Validation Error List

**File**: `src/components/modules/client/assets/validation-errors.tsx`

- [ ] B4.1 List invalid files with reasons
- [ ] B4.2 Remove individual files
- [ ] B4.3 Visual separation from upload queue

---

### Phase C: Retry Logic (~1 point)

#### Task C1: Exponential Backoff Retry

**File**: `src/hooks/use-upload-retry.ts`

- [ ] C1.1 Implement retry delays: [0, 3000, 5000, 10000, 20000]
- [ ] C1.2 Track retry count per file
- [ ] C1.3 Max retries limit (5)
- [ ] C1.4 Update store on retry attempts

---

### Phase D: Integration (~0.5 points)

#### Task D1: Integrate in Upload Queue Drawer

**File**: `src/components/modules/client/assets/upload-queue-drawer.tsx` (from 5-3)

- [ ] D1.1 Add validation error section
- [ ] D1.2 Add batch progress header
- [ ] D1.3 Render upload items with all states
- [ ] D1.4 Wire up retry/pause/resume actions

---

## 🧪 Testing Checklist

### Progress Display

- [ ] Progress bar updates in real-time
- [ ] Speed calculation is accurate
- [ ] Percentage is correct

### Validation

- [ ] Valid images accepted
- [ ] Valid videos accepted
- [ ] Oversized photos rejected (>100MB)
- [ ] Oversized videos rejected (>2GB)
- [ ] Invalid MIME types rejected
- [ ] Error messages are clear

### Retry

- [ ] Retry button appears on failure
- [ ] Retry attempts with backoff
- [ ] Max retries enforced

### Pause/Resume

- [ ] Pause stops tus uploads
- [ ] Resume continues from position
- [ ] Works across page refresh (tus benefit)

---

## 🚀 Definition of Done

- [ ] File validation utility working
- [ ] Pre-upload validation in store
- [ ] Upload item component with all states
- [ ] Thumbnail preview for images
- [ ] Batch progress header
- [ ] Retry with exponential backoff
- [ ] Pause/Resume for tus uploads
- [ ] Validation errors displayed
- [ ] Premium dark theme UI
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                          |
| ---------- | ------------- | ------------------------------ |
| 2026-01-18 | ready-for-dev | Story created from Epic 5 plan |

---

**Previous Story**: 5-3 - File Upload with Dual Strategy  
**Next Story**: 5-5 - Storage Limit Enforcement
