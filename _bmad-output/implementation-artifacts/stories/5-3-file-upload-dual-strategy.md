# Story 5-3: File Upload with Dual Strategy

**Epic**: Epic 5 - Asset Upload & Folder Management  
**Status**: ready-for-dev  
**Complexity**: High (8 points)  
**Created**: 2026-01-18  
**Priority**: MUST — Core upload functionality

---

## 📋 User Story

**As a** Client,  
**I want** to upload files with automatic handling of large video files using resumable uploads,  
**So that** my uploads don't fail for large video files and I can resume interrupted uploads.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                         | Status  | Notes                              |
| ---------------------------------- | ------- | ---------------------------------- |
| **5-1 - View Project Folders**     | Pending | Folder navigation                  |
| **5-2 - Gated Upload Enforcement** | Pending | Upload gate check                  |
| **MinIO Configuration**            | ✅ Done | `storage/actions.ts` pattern       |
| **tus Documentation**              | ✅ Done | `_bmad-output/docs/tus/` reference |

### Enables

| Story / Epic                   | Notes                        |
| ------------------------------ | ---------------------------- |
| **5-4 - Upload Progress**      | Uses upload state from store |
| **5-5 - Storage Limit**        | Pre-flight storage check     |
| **5-6 - Mark Upload Complete** | After successful uploads     |

### Technical Architecture

```
                     Client Browser
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    File ≤100MB      File >100MB      All Files
         │                │                │
         ▼                ▼                ▼
  Pre-signed URL    tus Protocol     Zustand Store
    (Direct S3)      (Resumable)    (Queue Management)
         │                │                │
         ▼                ▼                ▼
    getUploadUrl    /api/upload     uploadStore
    (Convex Action)  (Next.js API)   (Progress/Status)
         │                │                │
         └────────────────┼────────────────┘
                          │
                          ▼
                        MinIO
                   (S3-Compatible)
                          │
                          ▼
                    assets table
                  (Convex Metadata)
```

---

## ✅ Acceptance Criteria

### AC1: File Selection

- [ ] **Given** I am on a folder that allows uploads
- [ ] **When** I click "Upload Files" or drag-and-drop
- [ ] **Then** I can select multiple files (up to 50 per batch)
- [ ] **And** files are added to the upload queue
- [ ] **And** I see a preview of selected files before upload starts

### AC2: Standard Upload (≤100MB)

- [ ] **Given** I select files under 100MB (typically photos)
- [ ] **When** I initiate upload
- [ ] **Then** the system generates pre-signed MinIO URLs
- [ ] **And** files upload directly from browser to MinIO
- [ ] **And** upload progress is tracked per file
- [ ] **And** metadata is recorded in `assets` table after success

### AC3: Resumable Upload (>100MB - tus)

- [ ] **Given** I select files over 100MB (typically videos)
- [ ] **When** I initiate upload
- [ ] **Then** the system uses tus protocol via `/api/upload` endpoint
- [ ] **And** I can pause and resume the upload
- [ ] **And** if browser closes/crashes, upload can resume on return
- [ ] **And** progress is tracked in real-time

### AC4: Drag-and-Drop Targeting

- [ ] **Given** I am dragging files
- [ ] **When** I hover over a folder card
- [ ] **Then** the folder highlights as a drop target
- [ ] **And** dropping files adds them to that folder's upload queue
- [ ] **And** I see visual confirmation of target folder

### AC5: Upload Queue Management

- [ ] **Given** multiple files are queued
- [ ] **Then** maximum 3 files upload concurrently
- [ ] **And** remaining files wait in queue
- [ ] **And** I can remove files from queue before upload
- [ ] **And** I can pause/resume individual uploads (for tus)

### AC6: Metadata Recording

- [ ] **Given** a file uploads successfully
- [ ] **Then** the system records in `assets` table:
  - `projectId` (from folder)
  - `folderId` (target folder)
  - `fileName` (original name)
  - `fileSize` (bytes)
  - `mimeType` (detected)
  - `storageKey` (MinIO path)
  - `uploadedBy` (client/admin ID)
  - `uploadedAt` (timestamp)
- [ ] **And** if metadata recording fails, retry 3 times before showing error

### AC7: Error Handling

- [ ] **Given** an upload fails
- [ ] **Then** I see clear error message
- [ ] **And** "Retry" button is available
- [ ] **And** other uploads in queue continue
- [ ] **And** for tus uploads, resume option is available

---

## 🎨 UX Design

### Upload Zone (in Folder View)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📁 CEREMONY                                           📤 Ready         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐│
│    📤                                                                   ││
│                                                                         ││
│           Drag & drop files here                                        ││
│              or click to browse                                         ││
│                                                                         ││
│        Supported: JPG, PNG, RAW, MP4, MOV, AVI                          ││
│        Max: 100MB photos, 2GB videos                                    ││
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘│
│                                                                          │
│                          [📤 Select Files]                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Upload Queue Drawer

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📤 UPLOADS                                     3 of 12 files complete  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 🖼️ ceremony_001.jpg                                                 ││
│  │ ████████████████████████████░░░░ 85%    12.5 MB/s                  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 🎬 highlight_reel.mp4                                  [⏸️ Pause]   ││
│  │ ██████░░░░░░░░░░░░░░░░░░░░░░░░░░ 22%    8.2 MB/s     Resumable     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ✅ couple_portrait_001.jpg                           Complete       ││
│  │ ████████████████████████████████ 100%   15.4 MB                    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ❌ corrupt_file.raw                                  [🔄 Retry]     ││
│  │ Failed: Invalid file format                                        ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ⏳ reception_001.jpg                                   Queued       ││
│  │ Waiting...                                            45.2 MB      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│                    [❌ Cancel All]     [⏸️ Pause All]                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Folder Drop Target State

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Dragging 5 files...                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐  ╔═══════════════════════╗  ┌─────────────────────┐
│  │  📁                 │  ║  📁 ← DROP HERE       ║  │  📁                 │
│  │  Ceremony           │  ║  Reception             ║  │  Candid             │
│  │  124 files          │  ║  Upload 5 files        ║  │  45 files           │
│  └─────────────────────┘  ╚═══════════════════════╝  └─────────────────────┘
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Zustand Upload Store (~1.5 points)

#### Task A1: Create Upload Store

**File**: `src/stores/upload-store.ts`

```typescript
import { create } from "zustand";
import * as tus from "tus-js-client";

interface UploadItem {
  id: string;
  file: File;
  folderId: string;
  projectId: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "failed" | "paused";
  error?: string;
  uploadedUrl?: string;
  tusUpload?: tus.Upload; // For resumable uploads
}

interface UploadStore {
  // Queue
  queue: UploadItem[];
  addToQueue: (files: File[], projectId: string, folderId: string) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;

  // Progress
  updateProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: UploadItem["status"], error?: string) => void;

  // tus management
  setTusUpload: (id: string, upload: tus.Upload) => void;
  pauseUpload: (id: string) => void;
  resumeUpload: (id: string) => void;

  // Computed
  activeUploads: () => number;
  completedCount: () => number;
  totalCount: () => number;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  // Implementation...
}));
```

- [ ] A1.1 Create upload store with queue management
- [ ] A1.2 Implement progress tracking
- [ ] A1.3 Implement status management
- [ ] A1.4 Add tus instance tracking
- [ ] A1.5 Add pause/resume functions
- [ ] A1.6 Add computed getters

---

### Phase B: Standard Upload (Pre-signed URLs) (~1.5 points)

#### Task B1: Get Upload URL Action

**File**: `convex/functions/storage/actions.ts` (extend)

```typescript
export const getUploadUrl = action({
  args: {
    projectId: v.id("projects"),
    folderId: v.id("folders"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Check upload gate
    // 2. Check storage limit (pre-flight)
    // 3. Generate storage key
    // 4. Generate pre-signed PUT URL
    // 5. Return { uploadUrl, storageKey }
  },
});
```

- [ ] B1.1 Extend storage actions with `getUploadUrl`
- [ ] B1.2 Generate pre-signed PUT URL (not just GET)
- [ ] B1.3 Include gate check
- [ ] B1.4 Return storage key for metadata

#### Task B2: Record Asset Mutation

**File**: `convex/functions/assets/mutations.ts`

```typescript
export const recordAssetUpload = clientMutation({
  args: {
    projectId: v.id("projects"),
    folderId: v.id("folders"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    storageKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Record in assets table after successful upload
  },
});
```

- [ ] B2.1 Create `recordAssetUpload` mutation
- [ ] B2.2 Insert into assets table
- [ ] B2.3 Update folder file count

#### Task B3: Standard Upload Hook

**File**: `src/hooks/use-standard-upload.ts`

- [ ] B3.1 Create hook for pre-signed URL upload
- [ ] B3.2 Fetch pre-signed URL
- [ ] B3.3 Upload via fetch/XMLHttpRequest with progress
- [ ] B3.4 Call recordAssetUpload on success
- [ ] B3.5 Handle retries on failure

---

### Phase C: Resumable Upload (tus Protocol) (~2.5 points)

#### Task C1: Next.js API Route for tus Server

**File**: `src/app/api/upload/[...file]/route.ts`

```typescript
import { Server } from "@tus/server";
import { S3Store } from "@tus/s3-store";
import { NextRequest, NextResponse } from "next/server";

const tusServer = new Server({
  path: "/api/upload",
  datastore: new S3Store({
    partSize: 8 * 1024 * 1024, // 8MB chunks
    s3ClientConfig: {
      bucket: process.env.MINIO_BUCKET!,
      region: process.env.MINIO_REGION || "us-east-1",
      endpoint: process.env.MINIO_ENDPOINT,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!,
        secretAccessKey: process.env.MINIO_SECRET_KEY!,
      },
      forcePathStyle: true,
    },
  }),
  onUploadFinish: async (req, res, upload) => {
    // Record metadata in Convex via internal API
    // Extract projectId, folderId from upload metadata
  },
});

export async function POST(req: NextRequest) {
  // Handle tus upload creation
}

export async function PATCH(req: NextRequest) {
  // Handle tus chunk upload
}

export async function HEAD(req: NextRequest) {
  // Handle tus resume check
}
```

- [ ] C1.1 Create API route with tus server
- [ ] C1.2 Configure S3Store for MinIO
- [ ] C1.3 Handle POST (create)
- [ ] C1.4 Handle PATCH (upload chunk)
- [ ] C1.5 Handle HEAD (resume check)
- [ ] C1.6 Implement `onUploadFinish` hook

#### Task C2: Install tus Dependencies

```bash
npm install @tus/server @tus/s3-store tus-js-client
```

- [ ] C2.1 Install server-side tus packages
- [ ] C2.2 Install client-side tus package

#### Task C3: Resumable Upload Hook

**File**: `src/hooks/use-resumable-upload.ts`

```typescript
import * as tus from "tus-js-client";

export function useResumableUpload() {
  const startUpload = (
    file: File,
    projectId: string,
    folderId: string,
    onProgress: (progress: number) => void,
    onSuccess: (url: string) => void,
    onError: (error: string) => void,
  ) => {
    const upload = new tus.Upload(file, {
      endpoint: "/api/upload",
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: 8 * 1024 * 1024, // 8MB
      metadata: {
        filename: file.name,
        filetype: file.type,
        projectId,
        folderId,
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        onProgress((bytesUploaded / bytesTotal) * 100);
      },
      onSuccess: () => {
        onSuccess(upload.url!);
      },
      onError: (error) => {
        onError(error.message);
      },
    });

    // Check for previous uploads
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    });

    return upload;
  };

  return { startUpload };
}
```

- [ ] C3.1 Create resumable upload hook
- [ ] C3.2 Configure tus client options
- [ ] C3.3 Include metadata (projectId, folderId)
- [ ] C3.4 Handle previous upload resume
- [ ] C3.5 Progress callback integration

---

### Phase D: UI Components (~2 points)

#### Task D1: Upload Zone Component

**File**: `src/components/modules/client/assets/upload-zone.tsx`

- [ ] D1.1 Create drag-and-drop zone
- [ ] D1.2 Handle file selection (click + drag)
- [ ] D1.3 File type filtering
- [ ] D1.4 Visual feedback on drag over
- [ ] D1.5 Connect to upload orchestrator

#### Task D2: Upload Queue Drawer

**File**: `src/components/modules/client/assets/upload-queue-drawer.tsx`

- [ ] D2.1 Create drawer with queue list
- [ ] D2.2 Individual file progress bars
- [ ] D2.3 Status indicators per file
- [ ] D2.4 Pause/Resume buttons for tus uploads
- [ ] D2.5 Retry button for failed uploads
- [ ] D2.6 Cancel individual/all functionality

#### Task D3: Upload Orchestrator

**File**: `src/components/modules/client/assets/upload-orchestrator.tsx`

- [ ] D3.1 Determine upload strategy based on file size
- [ ] D3.2 Manage concurrent upload limit (3)
- [ ] D3.3 Process queue sequentially
- [ ] D3.4 Update store with progress/status

#### Task D4: Folder Drop Target Enhancement

**File**: `src/components/modules/client/assets/folder-card.tsx` (update)

- [ ] D4.1 Add drag-over detection
- [ ] D4.2 Highlight folder on drag over
- [ ] D4.3 Handle drop event
- [ ] D4.4 Pass files to upload queue

---

### Phase E: Integration (~0.5 points)

#### Task E1: Integrate in Folder View

- [ ] E1.1 Add UploadZone to folder detail page
- [ ] E1.2 Global upload queue drawer (floating)
- [ ] E1.3 Queue badge in header showing active uploads

---

## 🧩 Component & File Structure

```
src/
├── stores/
│   └── upload-store.ts              # Zustand upload state
├── hooks/
│   ├── use-standard-upload.ts       # Pre-signed URL upload
│   └── use-resumable-upload.ts      # tus resumable upload
├── app/
│   └── api/
│       └── upload/
│           └── [...file]/
│               └── route.ts         # tus server endpoint
└── components/
    └── modules/
        └── client/
            └── assets/
                ├── upload-zone.tsx
                ├── upload-queue-drawer.tsx
                ├── upload-orchestrator.tsx
                ├── upload-item.tsx
                └── upload-progress-bar.tsx

convex/
└── functions/
    ├── storage/
    │   └── actions.ts               # getUploadUrl (extended)
    └── assets/
        └── mutations.ts             # recordAssetUpload
```

---

## 🧪 Testing Checklist

### Standard Upload (<100MB)

- [ ] Single photo upload works
- [ ] Multiple photos upload works
- [ ] Progress bar updates correctly
- [ ] Metadata recorded in assets table

### Resumable Upload (>100MB)

- [ ] Large video file uploads via tus
- [ ] Pause button stops upload
- [ ] Resume button continues upload
- [ ] Browser refresh allows resume
- [ ] Browser close allows resume on return

### Queue Management

- [ ] Max 3 concurrent uploads enforced
- [ ] Queue processes correctly
- [ ] Remove from queue works
- [ ] Cancel all works

### Error Handling

- [ ] Failed upload shows error message
- [ ] Retry button works
- [ ] Other uploads continue on failure

### Drag and Drop

- [ ] Drag detection works
- [ ] Folder highlights on hover
- [ ] Drop triggers upload to correct folder
- [ ] Multiple files via drag-drop works

---

## 🚀 Definition of Done

- [ ] Zustand upload store working
- [ ] `getUploadUrl` action working (pre-signed PUT)
- [ ] `recordAssetUpload` mutation working
- [ ] Standard upload hook working
- [ ] tus API route working with MinIO
- [ ] Resumable upload hook working
- [ ] Upload zone component complete
- [ ] Upload queue drawer complete
- [ ] Drag-and-drop folder targeting working
- [ ] Concurrent upload limit (3) enforced
- [ ] Pause/Resume for tus uploads working
- [ ] Error handling and retry working
- [ ] Premium dark theme styling
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                                   |
| ---------- | ------------- | --------------------------------------- |
| 2026-01-18 | ready-for-dev | Story created with dual upload strategy |

---

## 📚 References

- tus-node-server docs: `_bmad-output/docs/tus/tus-node-server.md`
- tus-js-client docs: `_bmad-output/docs/tus/tus-js-client.md`
- MinIO S3 config: `convex/functions/storage/actions.ts`

---

**Previous Story**: 5-2 - Gated Upload Enforcement  
**Next Story**: 5-4 - Upload Progress & Validation
