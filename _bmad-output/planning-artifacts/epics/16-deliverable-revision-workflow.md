# Epic 16: Deliverable Revision Workflow

**Epic Owner**: Admin / Studio / Employee  
**Status**: Planning  
**Created**: 2026-02-11  
**Complexity**: Large  
**Priority**: High  
**Estimated Points**: 47  
**Dependencies**: Epic 6 (Deliverables & QC Workflow), Epic 5A (Project Status Workflow)

---

## 📋 Epic Summary

A **comprehensive revision workflow system** that transforms the deliverable revision process from basic text-only feedback into a rich, multi-media, trackable revision pipeline across all three roles:

- **Admin**: Request revisions with reference images + per-image notes (replaces simple textarea)
- **Studio/Client**: Per-deliverable review with image-based feedback (replaces blanket project-level approve/revise)
- **Employee**: Dedicated revision workspace showing original deliverable alongside revision references for guided corrections
- **Future**: PDF/Image annotation with canvas overlay (draw rectangles, pin comments, save as JSON blob)

**Key Insight**: The current revision system is text-only and loses history on each new request. This epic introduces structured `revisionRequests` records with image attachments, preserving the complete revision back-and-forth as a thread — enabling accountability, clarity, and faster turnaround.

---

## 🎯 User Outcomes

| Role         | Outcome                                                                         |
| ------------ | ------------------------------------------------------------------------------- |
| **Admin**    | Upload reference images showing exactly what needs to change on a deliverable   |
| **Admin**    | Add per-image notes describing specific corrections                             |
| **Admin**    | View full revision history timeline per deliverable                             |
| **Studio**   | Review and provide feedback on individual deliverables (not just project-level) |
| **Studio**   | Upload reference images with revision requests                                  |
| **Studio**   | Track revision status: Submitted → In Progress → Resolved                       |
| **Employee** | See original deliverable + revision reference images side-by-side               |
| **Employee** | Understand exactly what needs fixing with visual references + notes             |
| **Employee** | Upload corrected version directly from revision workspace                       |
| **All**      | Full audit trail of every revision request with images, notes, and resolution   |

---

## 🚨 Current Gaps (Why This Epic Exists)

### Gap 1: No Revision Image Upload

**Current:** Both admin and studio revision dialogs are plain textareas.  
**Impact:** Reviewers can't show _where_ or _what_ needs changing visually.

### Gap 2: No Revision History / Thread

**Current:** `rejectionNotes` is a single string on `deliverables` that gets overwritten each revision.  
**Impact:** No audit trail. Previous feedback is lost permanently.

### Gap 3: No Per-Deliverable Review on Studio Side

**Current:** Studio approves/revises at the project level only. All revision notes go to `handoffLogs`, not attached to specific deliverables.  
**Impact:** Multi-deliverable projects can't get targeted feedback per file.

### Gap 4: No Employee Revision Workspace

**Current:** Employee sees `rejectionNotes` text in the preview area with no visual context.  
**Impact:** Guesswork for corrections. No side-by-side comparison.

### Gap 5: No PDF/Image Annotation

**Current:** No markup capabilities exist.  
**Future:** Draw rectangles, place pin comments, save as JSON blob for admin + employee to review.

---

## 🗂️ User Stories

### Story 16.1: Revision Requests Schema & Backend

**As a** developer,  
**I want** a `revisionRequests` table and associated mutations/queries,  
**So that** revision requests are structured, tracked, and support image attachments.

**Story Points**: 8  
**Status**: 📋 Backlog  
**Priority**: MUST — Foundation for all other stories

---

### Story 16.2: Admin Revision Page with Image Upload

**As an** Admin,  
**I want** to request revisions with uploaded reference images and per-image notes,  
**So that** employees can see exactly what needs to be corrected.

**Story Points**: 8  
**Status**: 📋 Backlog  
**Priority**: MUST — Core admin revision experience

---

### Story 16.3: Employee Revision Workspace

**As an** Employee,  
**I want** a dedicated revision page showing the original deliverable alongside revision reference images and notes,  
**So that** I can understand exactly what corrections are needed and upload a corrected version.

**Story Points**: 10  
**Status**: 📋 Backlog  
**Priority**: MUST — Completes the revision cycle

---

### Story 16.4: Revision History Timeline

**As a** User (Admin, Studio, or Employee),  
**I want** to see a timeline of all revision requests on a deliverable,  
**So that** I can track the full history of feedback and corrections.

**Story Points**: 5  
**Status**: 📋 Backlog  
**Priority**: SHOULD — Provides visibility into revision lifecycle

---

### Story 16.5: Studio Per-Deliverable Review with Image Upload

**As a** Studio/Client,  
**I want** to approve or request changes on individual deliverables with image-based feedback,  
**So that** I can give targeted, visual feedback per file instead of blanket project-level notes.

**Story Points**: 8  
**Status**: 📋 Backlog  
**Priority**: SHOULD — Improves studio review precision

---

### Story 16.6: PDF/Image Annotation Layer (Future)

**As a** User (Admin or Studio),  
**I want** to draw rectangles and pin comments directly on deliverable previews,  
**So that** I can mark exact areas that need correction without leaving the app.

**Story Points**: 8  
**Status**: 📋 Backlog  
**Priority**: COULD — Future enhancement, low UX priority per user

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REVISION REQUEST LIFECYCLE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐     ┌────────────────────┐     ┌──────────────────┐  │
│  │  Admin/  │──►  │  revisionRequest   │──►  │    Employee     │  │
│  │  Studio  │     │  status: pending   │     │  Sees request   │  │
│  │ Creates  │     │  + images[] + notes│     │  in workspace   │  │
│  │ Request  │     └────────────────────┘     └──────────────────┘  │
│  └──────────┘              │                        │              │
│       │                    │                        │              │
│       │                    ▼                        ▼              │
│  ┌──────────┐     ┌────────────────────┐     ┌──────────────────┐  │
│  │  Admin/  │◄──  │  revisionRequest   │◄──  │    Employee     │  │
│  │  Studio  │     │ status: resolved   │     │  Uploads new    │  │
│  │ Reviews  │     │ + resolvedVersion  │     │  version (v2)   │  │
│  │ New Ver  │     └────────────────────┘     └──────────────────┘  │
│  └──────────┘                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Key: Each revision request preserves full history (images + notes)  │
│ Multiple requests per deliverable create a threaded timeline        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Status Workflow Integration

This epic extends the existing Phase + ActionState model from Epic 5A/6:

| Action                             | Status Transition                                |
| ---------------------------------- | ------------------------------------------------ |
| Admin creates revision request     | Deliverable: `pending_qc` → `revision_requested` |
| Employee starts revision           | RevisionRequest: `pending` → `in_progress`       |
| Employee uploads corrected version | RevisionRequest: `in_progress` → `resolved`      |
| New version created                | New deliverable version at `pending_qc`          |
| Studio creates revision request    | Per-deliverable: `approved` → `revision_needed`  |
| Revision resolved                  | Links to new deliverable version                 |

---

## 🎨 UI Components

### Admin Side

```
src/components/modules/admin/projects/project-detail/deliverables/
├── detail/
│   ├── revision-page.tsx              # Full revision request page (NEW)
│   ├── revision-image-upload.tsx      # Multi-image upload for revisions (NEW)
│   ├── revision-image-grid.tsx        # Thumbnail grid with per-image notes (NEW)
│   └── revision-history-timeline.tsx  # Timeline of all revision requests (NEW)
```

### Employee Side

```
src/components/modules/employee/assigned-work/details/
├── revision-workspace.tsx             # Side-by-side: original + references (NEW)
├── revision-reference-viewer.tsx      # Shows revision images + notes (NEW)
└── corrected-upload.tsx               # Upload corrected version (NEW)
```

### Studio/Client Side

```
src/components/modules/projects/detail/
├── deliverable-review-card.tsx        # Per-deliverable approve/revise (NEW)
├── studio-revision-dialog.tsx         # Enhanced revision dialog with images (NEW)
└── revision-status-tracker.tsx        # Submitted → In Progress → Resolved (NEW)
```

### Shared

```
src/components/shared/
├── revision-timeline.tsx              # Reusable timeline component (NEW)
└── image-annotation-canvas.tsx        # Future: Canvas overlay for markup (NEW)
```

---

## 🔗 Integration Points

| Component           | Integration                                                   |
| ------------------- | ------------------------------------------------------------- |
| Admin Deliverable   | "Revise" button navigates to revision page instead of dialog  |
| Employee Assigned   | New "Revision Workspace" route for guided corrections         |
| Studio Deliverables | Per-deliverable action buttons replace blanket approve/revise |
| Status Banners      | Show revision request details with image thumbnails           |
| Handoff Logs        | Link to `revisionRequests` for richer audit trail             |

---

## ✅ Acceptance Criteria Summary

### MVP (Stories 16.1–16.3)

- [ ] `revisionRequests` table with image attachments and per-image notes
- [ ] Admin can create revision requests with uploaded reference images
- [ ] Employee sees revision references in dedicated workspace
- [ ] Employee can upload corrected version that resolves the revision request
- [ ] Revision history preserved (not overwritten)

### Enhanced (Stories 16.4–16.5)

- [ ] Revision history timeline visible on deliverable detail pages
- [ ] Studio can approve/revise individual deliverables with image feedback
- [ ] Revision status tracking: Submitted → In Progress → Resolved

### Future (Story 16.6)

- [ ] Canvas annotation on PDF/image previews
- [ ] Rectangle, pin, freeform drawing tools
- [ ] Annotations saved as JSON blob and viewable by all roles

---

## 📈 Story Points Summary

| Story | Description                           | Points | Priority |
| ----- | ------------------------------------- | ------ | -------- |
| 16.1  | Schema & Backend (revisionRequests)   | 8      | MUST     |
| 16.2  | Admin Revision Page with Image Upload | 8      | MUST     |
| 16.3  | Employee Revision Workspace           | 10     | MUST     |
| 16.4  | Revision History Timeline             | 5      | SHOULD   |
| 16.5  | Studio Per-Deliverable Review         | 8      | SHOULD   |
| 16.6  | PDF/Image Annotation Layer            | 8      | COULD    |

**Total**: 47 Story Points

---

## 📦 Dependencies

| Dependency                       | Status  | Notes                        |
| -------------------------------- | ------- | ---------------------------- |
| Epic 6: Deliverables & QC        | ✅ Done | Base deliverable mutations   |
| Epic 5A: Project Status Workflow | ✅ Done | Status transitions           |
| Epic 5: Asset Upload             | ✅ Done | MinIO upload patterns reused |
| MinIO Configuration              | ✅ Done | S3-compatible storage        |

---

## 🔄 Status Updates

| Date       | Status   | Notes                                             |
| ---------- | -------- | ------------------------------------------------- |
| 2026-02-11 | Planning | Epic created from deliverable revision brainstorm |

---

**Previous Epic**: Epic 15 — Quotation Review Notification System  
**Next Epic**: TBD
