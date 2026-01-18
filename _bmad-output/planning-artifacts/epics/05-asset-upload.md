# Epic 5: Asset Upload & Folder Management

**User Outcome:** Clients can upload their photos/videos to organized folders with resumable upload support for large files, and the studio has a structured asset management system.

**FRs covered:** FR7 (Folder Structure), FR8 (Asset Upload)

**Scope:**

- Folder template system
- Automatic folder creation from templates
- Folder listing within sessions
- Direct upload to MinIO via signed URLs (files <100MB)
- **Resumable uploads via tus protocol (files >100MB)**
- Batch upload with progress indicators
- File validation (type, size)
- Storage limit enforcement with upgrade prompts
- Folder status tracking (pending → in_progress → completed)

**Standalone:** ✅ Complete upload and folder management system.

---

## 📘 Technical Stack (Updated 2026-01-18)

**IMPORTANT**: Apply these corrections from Epic 4 retrospective:

| Layer                 | Technology                                  |
| --------------------- | ------------------------------------------- |
| **Framework**         | Next.js 16 (App Router)                     |
| **Forms**             | TanStack Form + Zod                         |
| **State**             | Zustand (upload queue)                      |
| **Storage**           | MinIO (S3-compatible)                       |
| **Resumable Uploads** | @tus/server + @tus/s3-store + tus-js-client |

### Key Files to Reference

- `convex/functions/storage/actions.ts` - MinIO signed URL generation (existing pattern)
- `src/stores/reference-files-store.ts` - Zustand file management pattern
- `src/components/shared/files-vault/drawer.tsx` - File display component
- `_bmad-output/docs/tus/` - tus protocol documentation

### MinIO Configuration (Verified Compatible)

The existing S3 client configuration works with `@tus/s3-store`:

```typescript
{
  endpoint: process.env.MINIO_ENDPOINT,
  region: process.env.MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // Critical for MinIO
}
```

---

## 📊 Story Summary

### Phase A: Core Upload Infrastructure

| Story | Title                          | Priority | Complexity |
| ----- | ------------------------------ | -------- | ---------- |
| 5.1   | View Project Folders           | MUST     | Medium     |
| 5.2   | Gated Upload Enforcement       | MUST     | Low        |
| 5.3   | File Upload with Dual Strategy | MUST     | High       |
| 5.4   | Upload Progress & Validation   | MUST     | Medium     |
| 5.5   | Storage Limit Enforcement      | MUST     | Medium     |

### Phase B: Completion & Admin

| Story | Title                                  | Priority | Complexity |
| ----- | -------------------------------------- | -------- | ---------- |
| 5.6   | Mark Upload Complete                   | SHOULD   | Low        |
| 5.7   | Admin Asset Upload (Internal Projects) | SHOULD   | Medium     |

### Phase C: Enhancements (Backlog)

| Story | Title                               | Priority | Complexity |
| ----- | ----------------------------------- | -------- | ---------- |
| 5.8   | Move/Organize Files Between Folders | COULD    | Medium     |
| 5.9   | File Preview Gallery                | COULD    | Medium     |
| 5.10  | Upload Notifications to Admin       | COULD    | Low        |

---

## 📋 Detailed Stories

### Story 5.1: View Project Folders

**As a** Client,
**I want** to see the folder structure for my project with status indicators,
**So that** I know where to upload my assets and track progress.

**Acceptance Criteria:**

- **Given** my project has status `active` (quotation approved)
- **When** I navigate to my project's Assets tab
- **Then** I must see the folder structure created by the admin (e.g., Ceremony, Reception, Candid).
- **And** each folder must show:
  - Folder name with icon
  - File count badge
  - Status indicator (Empty → Partial → Complete)
  - Visual styling based on status
- **And** I must see the storage usage bar with color coding:
  - Green: <80% used
  - Yellow/Amber: 80-95% used
  - Red: >95% used
- **And** clicking a folder opens its file listing

**UX Enhancements:**

- Folder cards with dashed border when empty, solid when has files
- Hover state shows "Add files" prompt
- Storage bar with `XX GB / YY GB` label

---

### Story 5.2: Gated Upload Enforcement

**As a** System,
**I want** to enforce the upload gate so clients can only upload after quotation approval,
**So that** storage abuse is prevented.

**Acceptance Criteria:**

- **Given** a project with status `pending_review` or `pending_quotation`
- **When** a client tries to access the upload section
- **Then** the upload area must be locked with UI elements:
  - Lock icon overlay on folders
  - Message: "Approve quotation to unlock uploads"
  - CTA button: "View Quotation"
- **And** API calls to `getUploadUrl` must throw an error if quotation is not approved.
- **And** the check must verify `quotation.status === 'approved'`

**Exception:**

- Projects with `source = admin_init` (internal) skip quotation check

---

### Story 5.3: File Upload with Dual Strategy

**As a** Client,
**I want** to upload files with automatic handling of large files,
**So that** my uploads don't fail for large video files.

**Acceptance Criteria:**

**Standard Upload (files ≤100MB):**

- **Given** I select files under 100MB
- **When** I initiate upload
- **Then** the system uses pre-signed MinIO URLs (existing pattern)
- **And** files upload directly to MinIO

**Resumable Upload (files >100MB - using tus):**

- **Given** I select files over 100MB (typically videos)
- **When** I initiate upload
- **Then** the system uses tus protocol via `/api/upload` endpoint
- **And** upload can be paused/resumed
- **And** if browser closes, upload can resume from where it stopped
- **And** progress is tracked in real-time

**Common Behavior:**

- **And** drag-and-drop targets specific folders
- **And** file type validation occurs before upload
- **And** metadata is recorded in `assets` table after successful upload
- **And** upload queue is managed in Zustand store
- **And** concurrent upload limit: 3 files at a time

**Technical Implementation:**

- Next.js API Route: `/api/upload/[...file]/route.ts`
- Uses `@tus/server` with `@tus/s3-store` for MinIO
- Same env vars as existing MinIO config
- Client uses `tus-js-client` for files >100MB

---

### Story 5.4: Upload Progress & Validation

**As a** Client,
**I want** to see upload progress and validation feedback,
**So that** I know the status of my uploads.

**Acceptance Criteria:**

- **Given** I have initiated uploads
- **When** files are uploading
- **Then** I must see:
  - Individual progress bar per file
  - File name and thumbnail (for images)
  - Upload speed indicator
  - Batch progress: "X of Y files complete"
- **And** file validation must occur BEFORE upload:
  - File type: `image/*` = photo, `video/*` = video
  - Size limits: photos <100MB, videos <2GB
  - Unknown MIME types rejected with clear error
- **And** failed uploads show:
  - Error message explaining failure
  - Retry button with exponential backoff
- **And** successful uploads show:
  - Checkmark with "Complete" status
  - Thumbnail preview (images only)

**UX States:**

```
 📁 ceremony_photo.jpg   ████████░░ 80%   12.5 MB/s
 🎬 highlight_reel.mp4   ██░░░░░░░░ 20%   Resumable
 ✅ couple_portrait.jpg  Complete
 ❌ corrupt_file.raw     Failed - Retry
```

---

### Story 5.5: Storage Limit Enforcement

**As a** System,
**I want** to enforce storage limits based on the quotation storage pool,
**So that** clients do not exceed their allocated storage.

**Acceptance Criteria:**

- **Given** a project with storage limit of 100GB and 98GB used
- **When** a client tries to upload 5GB more
- **Then** the system must:
  - Calculate `currentUsage + fileSize` BEFORE generating signed URL
  - Reject immediately if exceeds limit
  - Show error: "Storage limit exceeded. You have 2GB remaining."
- **And** the UI must show:
  - Current usage bar: `98GB / 100GB` with red styling
  - Warning when >80% used
  - Upgrade CTA when >95% used: "Need more space? Contact us."

**Pre-flight Check:**

- Before starting any upload, sum all pending file sizes
- Validate total won't exceed limit
- If exceeds, highlight which files won't fit

---

### Story 5.6: Mark Upload Complete

**As a** Client,
**I want** to mark my asset upload as complete,
**So that** the studio knows they can start working on my project.

**Acceptance Criteria:**

- **Given** I have uploaded files to at least one folder
- **When** I click "Mark Upload Complete"
- **Then** confirmation dialog appears: "Are you sure? You can still upload more later."
- **And** if confirmed:
  - Project status changes to `in_progress`
  - Admin receives notification
  - `uploadCompletedAt` timestamp recorded
- **And** I can still upload more files after marking complete

---

### Story 5.7: Admin Asset Upload for Internal Projects

**As an** Admin,
**I want** to upload assets directly to internal projects,
**So that** I can manage projects that don't have a client.

**Acceptance Criteria:**

- **Given** a project with `source = admin_init` (internal project)
- **When** I navigate to the project's Assets section
- **Then** the upload section is unlocked WITHOUT quotation approval
- **And** I can upload files using the same flow as clients
- **And** storage limits are based on the storage tier selected during project creation
- **And** I can mark the project as "Assets Ready" to move to `in_progress`

---

## 🔗 Dependencies

| Dependency                       | Status  | Notes                   |
| -------------------------------- | ------- | ----------------------- |
| Epic 4: Quotation Approval (4-8) | ✅ Done | Gates folder activation |
| Epic 3: Storage Pool (3-15)      | ✅ Done | Quota enforcement       |
| Epic 3: Folder Templates (3-10)  | ✅ Done | Folder structure        |
| MinIO Configuration              | ✅ Done | S3-compatible storage   |

---

## 🏗️ Technical Architecture

### Upload Flow Diagram

```
Client Browser
     │
     ├─── Files ≤100MB ──→ getUploadUrl (Convex Action)
     │                          │
     │                          ↓
     │                     Pre-signed URL
     │                          │
     │                          ↓
     │                     Direct to MinIO
     │
     └─── Files >100MB ──→ /api/upload (Next.js)
                               │
                               ↓
                          @tus/server
                               │
                               ↓
                          @tus/s3-store
                               │
                               ↓
                             MinIO
```

### Zustand Upload Store

```typescript
interface UploadStore {
  // Queue management
  queue: UploadItem[];
  addToQueue: (files: File[], folderId: string) => void;
  removeFromQueue: (id: string) => void;

  // Progress tracking
  progress: Record<string, number>;
  updateProgress: (id: string, progress: number) => void;

  // Status
  status: Record<string, "pending" | "uploading" | "complete" | "failed">;
  setStatus: (id: string, status: UploadStatus) => void;

  // tus instance tracking (for resumable)
  tusInstances: Record<string, tus.Upload>;
  pauseUpload: (id: string) => void;
  resumeUpload: (id: string) => void;
}
```

---

## 📝 Notes

- **Priority:** Epic 5 is now unblocked after Epic 4 completion
- **Risk:** tus integration is new but low-risk (same MinIO config)
- **Testing:** Include large file upload tests (500MB+)
