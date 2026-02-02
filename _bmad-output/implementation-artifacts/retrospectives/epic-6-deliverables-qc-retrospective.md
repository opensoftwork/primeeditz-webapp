# Epic 6: Deliverables & QC Workflow - Retrospective & Enhancement Plan

## 📍 Current State Analysis (2026-02-02)

### What Exists Today

#### Schema (`convex/schema.ts`)

```typescript
deliverables: defineTable({
  projectId: v.id("projects"),
  name: v.string(),
  description: v.optional(v.string()),
  version: v.number(), // Auto-incremented per file name
  status: deliverableStatusValidator, // pending_qc | approved | revision_needed | revision_requested
  minioKey: v.string(),
  sizeBytes: v.number(),
  mimeType: v.optional(v.string()), // Added 2026-02-02
  uploadedBy: v.id("profiles"),
  qcReviewedBy: v.optional(v.id("profiles")),
  qcNotes: v.optional(v.string()),
  rejectionNotes: v.optional(v.string()),
});
```

#### Backend Functions

1. **`uploadDeliverable`** (mutation): Creates deliverable record after employee uploads
2. **`getProjectDeliverables`** (query): Lists all deliverables for a project
3. **`getDeliverable`** (query): Gets single deliverable with uploader name

#### Frontend Components

1. **`FinalizeWorkDrawer`** (`employee/assigned-work/details/`): Employee uploads final deliverable
2. **`ProjectDeliverables`** (`admin/projects/project-detail/`): Admin views deliverable list
3. **`DeliverableDetailPage`** (`admin/projects/project-detail/individual-delivrable.tsx`): Admin views single deliverable

### Current Gaps Identified

| Gap                                       | Impact                                       | Priority |
| ----------------------------------------- | -------------------------------------------- | -------- |
| PDF files show "Preview Not Available"    | Users can't review PDFs inline               | P0       |
| No version history UI                     | Can't see/compare revisions                  | P1       |
| No revision workflow actions              | Admin can't approve/reject/request revisions | P0       |
| No "Send to Studio" action                | No notification flow to client               | P1       |
| Image gallery missing for multiple images | Single image only                            | P2       |
| Video player basic                        | No fullscreen, no playback controls          | P2       |
| No revision notes/feedback input          | Admin can't provide feedback                 | P0       |

---

## 🎯 Enhanced Epic 6 Scope

### User Stories (Updated)

#### Story 6-1: Upload Deliverables (PARTIALLY COMPLETE)

- [x] Employee can upload final work files
- [x] Deliverable record created with version tracking
- [x] mimeType captured for preview logic
- [ ] **NEW**: Support multiple file upload in single submission
- [ ] **NEW**: Show upload history for this project

#### Story 6-2: Enhanced File Preview Component (NEW)

**As an admin, I want to preview deliverables inline so I can review without downloading.**

Acceptance Criteria:

- [ ] PDF files render using `@react-pdf-viewer/core` or `react-pdf`
- [ ] Images render with zoom/pan capability
- [ ] Videos render with full controls (fullscreen, volume, playback speed)
- [ ] Audio files render with audio player
- [ ] Other file types show icon + download button
- [ ] Screenshot capability hint for PDFs (browser native)

#### Story 6-3: QC Review & Approval Flow (NEW)

**As an admin, I want to approve, reject, or request revisions on deliverables.**

Acceptance Criteria:

- [ ] "Approve" action updates status to `approved`, records `qcReviewedBy`
- [ ] "Request Revision" action updates status to `revision_requested`, captures `rejectionNotes`
- [ ] Revision request notifies employee (handoff transition)
- [ ] "Reject" action marks as `revision_needed` with notes
- [ ] Status history tracked for auditing

#### Story 6-4: Version History & Comparison (NEW)

**As an admin, I want to see all versions of a deliverable and compare them.**

Acceptance Criteria:

- [ ] Version history panel shows all versions of same-named deliverable
- [ ] Click to switch between versions
- [ ] Version badge shows current vs previous
- [ ] Optional: Side-by-side comparison for images

#### Story 6-5: Send to Studio/Client Flow (NEW)

**As an admin, I want to send approved deliverables to the studio for final review.**

Acceptance Criteria:

- [ ] "Send to Studio" action available for approved deliverables
- [ ] Records `sentAt` timestamp, `sentTo` studio profile
- [ ] Studio receives notification (dashboard + optional email)
- [ ] Deliverable status can track `sent_to_client` state
- [ ] Studio can view and download from their portal

#### Story 6-6: Studio Deliverable Review (NEW)

**As a studio, I want to review deliverables sent to me and provide feedback.**

Acceptance Criteria:

- [ ] Studio sees "Deliverables for Review" section in project detail
- [ ] Can approve (marks as final)
- [ ] Can request revision (loops back to employee)
- [ ] Feedback captured and visible to admin/employee

---

## 🛠 Technical Implementation Plan

### Phase 1: File Preview Enhancement (P0)

#### 1.1 Install PDF Viewer Library

```bash
pnpm add react-pdf pdfjs-dist
```

Alternative (lighter): `@react-pdf-viewer/core` + `@react-pdf-viewer/default-layout`

#### 1.2 Create Universal FilePreview Component

Location: `src/components/shared/file-preview/`

```
file-preview/
├── index.tsx           # Main FilePreview component
├── pdf-viewer.tsx      # PDF preview using react-pdf
├── image-viewer.tsx    # Image with zoom (use react-zoom-pan-pinch)
├── video-player.tsx    # Enhanced video player
├── audio-player.tsx    # Audio visualization
└── fallback.tsx        # Generic file icon + download
```

#### 1.3 MIME Type Detection Logic

```typescript
const getPreviewType = (mimeType?: string): PreviewType => {
  if (!mimeType) return "unknown";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "other";
};
```

### Phase 2: QC Workflow Backend (P0)

#### 2.1 New Mutations

```typescript
// convex/functions/deliverables/mutations.ts

export const approveDeliverable = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    qcNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify admin role
    // Update status to 'approved'
    // Set qcReviewedBy, qcNotes
    // Record status history
  },
});

export const requestRevision = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    rejectionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin role
    // Update status to 'revision_requested'
    // Set rejectionNotes
    // Transition project back to 'work_in_progress'
    // Create handoff log back to employee
  },
});

export const sendToStudio = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    studioId: v.id("profiles"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Mark deliverable as sent
    // Create notification for studio
    // Update project actionState if needed
  },
});
```

#### 2.2 Schema Enhancement (Optional)

Add to `deliverables` table:

```typescript
sentToStudioAt: v.optional(v.number()),
sentToStudioBy: v.optional(v.id("profiles")),
studioApprovedAt: v.optional(v.number()),
studioRejectionNotes: v.optional(v.string()),
```

### Phase 3: Version History UI (P1)

#### 3.1 Query for Version History

```typescript
export const getDeliverableVersions = query({
  args: {
    projectId: v.id("projects"),
    name: v.string(), // Group by name
  },
  handler: async (ctx, args) => {
    // Get all versions with same name
    // Order by version descending
  },
});
```

#### 3.2 VersionHistoryPanel Component

- Shows timeline of all versions
- Current version highlighted
- Click to navigate to specific version

---

## 📋 Updated Sprint Status

```yaml
# Epic 6 - Updated 2026-02-02
epic-6: in-progress

# Existing (Partially Done)
6-1-upload-deliverables-admin-employee: in-progress # Core done, multi-upload pending

# New Stories
6-2-enhanced-file-preview: ready-for-dev # P0 - PDF/Video/Image viewers
6-3-qc-review-approval-flow: ready-for-dev # P0 - Approve/Reject/Revise actions
6-4-version-history-comparison: backlog # P1 - Version timeline
6-5-send-to-studio-flow: backlog # P1 - Notification to studio
6-6-studio-deliverable-review: backlog # P2 - Studio accepts/rejects
```

---

## 🚀 Recommended Implementation Order

1. **Story 6-2: Enhanced File Preview** (2-3 hours)
   - Install react-pdf
   - Create FilePreview component
   - Integrate into DeliverableDetailPage

2. **Story 6-3: QC Review Flow** (2-3 hours)
   - Create approve/requestRevision mutations
   - Wire up buttons in DeliverableDetailPage
   - Add revision notes dialog

3. **Story 6-4: Version History** (1-2 hours)
   - Add version query
   - Create VersionHistoryPanel

4. **Story 6-5 & 6-6: Studio Flow** (3-4 hours)
   - Extend schema with sent fields
   - Create studio-side deliverable view
   - Notification system integration

---

## 📚 Library Recommendations

| Purpose       | Library                                      | Why                               |
| ------------- | -------------------------------------------- | --------------------------------- |
| PDF Viewer    | `react-pdf` + `pdfjs-dist`                   | Most stable, good Next.js support |
| Image Zoom    | `react-zoom-pan-pinch`                       | Lightweight, touch-friendly       |
| Video Player  | Native HTML5 (or `react-player`)             | Full controls, no dependency      |
| Light Gallery | `lightgallery` or `react-photoswipe-gallery` | For multi-image preview           |

---

## 💡 Notes from Retrospective

### What Went Well

- Basic deliverable upload flow works end-to-end
- Schema supports versioning out of the box
- mimeType now captured (fixed today)

### What Could Be Improved

- Preview handling was incomplete (fixed: optional chaining)
- No admin actions beyond viewing
- No feedback loop to employees

### Action Items

1. ✅ Fix mimeType schema and frontend (DONE)
2. 🔜 Implement PDF preview
3. 🔜 Implement QC workflow actions
4. 🔜 Add version history UI
