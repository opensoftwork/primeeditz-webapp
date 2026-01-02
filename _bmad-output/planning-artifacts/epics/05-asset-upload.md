# Epic 5: Asset Upload & Folder Management

**User Outcome:** Clients can upload their photos/videos to organized folders, and the studio has a structured asset management system.

**FRs covered:** FR7 (Folder Structure), FR8 (Asset Upload)

**Scope:**

- Folder template system
- Automatic folder creation from templates
- Folder listing within sessions
- Direct upload to MinIO via signed URLs
- Batch upload with progress indicators
- File validation (type, size)
- Folder status tracking (pending → in_progress → completed)

**Standalone:** ✅ Complete upload and folder management system.

---

### Story 5.1: View Project Folders

**As a** Client,
**I want** to see the folder structure for my project,
**So that** I know where to upload my assets.

**Acceptance Criteria:**

- **Given** my project has status `active` (quotation approved)
- **When** I navigate to my project's Assets tab
- **Then** I must see the folder structure created by the admin (e.g., Ceremony, Reception, Candid).
- **And** each folder must show: Name, File Count, Status badge.
- **And** I must see the storage usage (used / allocated).

### Story 5.2: Gated Upload Enforcement

**As a** System,
**I want** to enforce the upload gate so clients can only upload after quotation approval,
**So that** storage abuse is prevented.

**Acceptance Criteria:**

- **Given** a project with status `pending_review` or `pending_quotation`
- **When** a client tries to access the upload section
- **Then** the upload area must be locked with a message: "Approve quotation to unlock uploads."
- **And** API calls to `getUploadUrl` must throw an error if quotation is not approved.

### Story 5.3: File Upload with Signed URLs

**As a** Client,
**I want** to upload files directly to storage using secure signed URLs,
**So that** my assets are uploaded efficiently without going through the server.

**Acceptance Criteria:**

- **Given** I am on a project with unlocked uploads
- **When** I drag-and-drop or select files (up to 50 per batch)
- **Then** the system must generate signed upload URLs from MinIO.
- **And** files must be uploaded directly from my browser to storage.
- **And** metadata must be recorded in the `assets` table after successful upload.
- **And** if metadata recording fails after successful upload, the system must retry 3 times before showing an error with 'Retry' option.

### Story 5.4: Upload Progress & Validation

**As a** Client,
**I want** to see upload progress and validation feedback,
**So that** I know the status of my uploads.

**Acceptance Criteria:**

- **Given** I have initiated a batch upload
- **When** files are uploading
- **Then** I must see a progress bar per file.
- **And** file validation must occur before upload:
  - File type determined by MIME type: `image/*` = photo, `video/*` = video
  - Size limits: photos < 100MB, videos < 2GB
  - Unknown MIME types must be rejected with error
- **And** failed uploads must show an error message with retry option.

### Story 5.5: Storage Limit Enforcement

**As a** System,
**I want** to enforce storage limits based on the selected tier,
**So that** clients do not exceed their allocated storage.

**Acceptance Criteria:**

- **Given** a project with a storage tier of 100GB and 98GB used
- **When** a client tries to upload 5GB more
- **Then** the system must calculate `currentUsage + fileSize` BEFORE generating the signed URL.
- **And** if calculation exceeds limit, reject immediately with error: "Storage limit exceeded."
- **And** the UI must show current usage (98/100 GB) with a warning indicator.

### Story 5.6: Mark Upload Complete

**As a** Client,
**I want** to mark my asset upload as complete,
**So that** the studio knows they can start working on my project.

**Acceptance Criteria:**

- **Given** I have uploaded files to at least one folder
- **When** I click "Mark Upload Complete"
- **Then** the project status must change to `in_progress`.
- **And** the admin must be notified that assets are ready for editing.

### Story 5.7: Admin Asset Upload for Internal Projects

**As an** Admin,
**I want** to upload assets directly to internal projects,
**So that** I can manage projects that don't have a client (portfolio, internal work).

**Acceptance Criteria:**

- **Given** a project with `source = admin_init` (internal project)
- **When** I navigate to the project's Assets section
- **Then** the upload section must be unlocked WITHOUT requiring quotation approval.
- **And** I can upload files using the same signed URL flow as clients.
- **And** storage limits are based on the storage tier selected during project creation.
- **And** I can mark the project as "Assets Ready" to move to `in_progress` status.

**Note:** Internal projects skip the quotation workflow entirely.
