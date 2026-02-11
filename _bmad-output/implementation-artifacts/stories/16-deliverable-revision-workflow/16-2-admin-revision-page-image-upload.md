# Story 16-2: Admin Revision Page with Image Upload

**Epic**: Epic 16 - Deliverable Revision Workflow  
**Status**: backlog  
**Complexity**: Large (8 points)  
**Created**: 2026-02-11  
**Priority**: MUST — Core admin revision experience

---

## 📋 User Story

**As an** Admin,  
**I want** to request revisions with uploaded reference images and per-image notes,  
**So that** employees can see exactly what needs to be corrected with visual context.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                  | Status     | Notes                            |
| --------------------------- | ---------- | -------------------------------- |
| **16-1 - Schema & Backend** | 📋 Backlog | `createRevisionRequest` mutation |
| **Epic 5 - MinIO Upload**   | ✅ Done    | Signed URL upload pattern        |

### Enables

| Story / Epic                  | Notes                                       |
| ----------------------------- | ------------------------------------------- |
| **16-3 - Employee Workspace** | Employee views what admin created here      |
| **16-4 - Revision Timeline**  | Timeline uses data created by this workflow |

### Current vs. Proposed UX

```
CURRENT:
┌──────────────────────────────────┐
│  Revision Dialog (Modal)         │
│  ┌──────────────────────────┐    │
│  │ Enter revision notes...  │    │  ← Plain textarea only
│  │                          │    │  ← No images
│  └──────────────────────────┘    │  ← No guidance for employee
│  [Cancel]           [Submit]     │
└──────────────────────────────────┘

PROPOSED:
┌────────────────────────────────────────────────────────────────────┐
│  REVISION REQUEST — QUOTATION_QT-000001_V1-1.PDF                   │
│  ──────────────────────────────────────────────────────────────── │
│                                                                    │
│  ┌─────────────────────────┐  ┌──────────────────────────────────┐│
│  │                         │  │  REVISION NOTES                  ││
│  │                         │  │  ┌──────────────────────────────┐││
│  │   PDF / IMAGE PREVIEW   │  │  │ Fix color grading on...     │││
│  │   (Current Deliverable) │  │  │                              │││
│  │                         │  │  └──────────────────────────────┘││
│  │                         │  │                                  ││
│  └─────────────────────────┘  │  REFERENCE IMAGES                ││
│                                │  [📎 Upload Images]             ││
│                                │  ┌───┐ ┌───┐ ┌───┐             ││
│                                │  │ 🖼│ │ 🖼│ │ 🖼│             ││
│                                │  │ref│ │ref│ │ref│             ││
│                                │  └───┘ └───┘ └───┘             ││
│                                │  Each with note: "Fix this..." ││
│                                │                                  ││
│                                │  [Cancel]   [Submit Revision]   ││
│                                └──────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Navigate to Revision Page

- [ ] **Given** I am viewing a deliverable with status `pending_qc`
- [ ] **When** I click the "Revise" button
- [ ] **Then** I am navigated to the revision page (not a small modal)
- [ ] **And** the deliverable preview is shown on the left panel

### AC2: Revision Notes

- [ ] **Given** I am on the revision page
- [ ] **Then** I see a textarea for general revision notes
- [ ] **And** the notes field is required (cannot submit without notes)

### AC3: Upload Reference Images

- [ ] **Given** I am on the revision page
- [ ] **When** I click "Upload Reference Images"
- [ ] **Then** I can select multiple images from my device
- [ ] **And** selected images are uploaded to MinIO via signed URLs
- [ ] **And** upload progress is shown per image
- [ ] **And** uploaded images appear as a thumbnail grid

### AC4: Per-Image Notes

- [ ] **Given** I have uploaded reference images
- [ ] **Then** each image thumbnail has an optional text note field below it
- [ ] **And** I can describe what correction each image refers to
- [ ] **And** I can remove individual images before submission

### AC5: Submit Revision Request

- [ ] **Given** I have entered revision notes (and optionally uploaded images with notes)
- [ ] **When** I click "Submit Revision Request"
- [ ] **Then** the `createRevisionRequest` mutation is called
- [ ] **And** all reference images MinIO keys + notes are saved
- [ ] **And** deliverable status → `revision_requested`
- [ ] **And** project transitions back to `work_in_progress` for employee
- [ ] **And** success toast: "Revision requested! Employee will be notified."
- [ ] **And** I am navigated back to the deliverable detail page

### AC6: Loading & Error States

- [ ] **Given** image uploads are in progress
- [ ] **Then** the submit button is disabled
- [ ] **And** a progress indicator is shown
- [ ] **Given** an upload fails
- [ ] **Then** error toast is shown and the failed image is marked

---

## 📘 Implementation

### Phase A: Route & Page Setup (~1 point)

#### Task A1: Create Revision Page Route

**File**: `src/app/(protected)/@admin/projects/[projectId]/deliverables/[deliverableId]/revise/page.tsx`

```typescript
"use client";

import { use } from "react";
import { RevisionPage } from "@/components/modules/admin/projects/project-detail/deliverables/detail/revision-page";

interface RevisePageProps {
  params: Promise<{
    projectId: string;
    deliverableId: string;
  }>;
}

export default function AdminRevisionPage({ params }: RevisePageProps) {
  const { projectId, deliverableId } = use(params);
  return <RevisionPage projectId={projectId} deliverableId={deliverableId} />;
}
```

- [ ] A1.1 Create route file for admin revision page
- [ ] A1.2 Import and render `RevisionPage` component

---

### Phase B: Revision Page Component (~3 points)

#### Task B1: Main Revision Page Container

**File**: `src/components/modules/admin/projects/project-detail/deliverables/detail/revision-page.tsx`

```typescript
"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery, useAction } from "convex/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/shared/file-preview";
import { RevisionImageUpload } from "./revision-image-upload";
import { RevisionImageGrid } from "./revision-image-grid";

interface RevisionPageProps {
  projectId: string;
  deliverableId: string;
}

interface UploadedImage {
  fileName: string;
  fileSize: number;
  mimeType: string;
  minioKey: string;
  note: string;
  previewUrl: string; // local blob URL for preview
}

export function RevisionPage({ projectId, deliverableId }: RevisionPageProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const deliverable = useQuery(
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const createRevisionRequest = useMutation(
    api.functions.deliverables.mutations.createRevisionRequest,
  );

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error("Please provide revision notes");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRevisionRequest({
        deliverableId: deliverableId as Id<"deliverables">,
        notes: notes.trim(),
        referenceImages: uploadedImages.map(
          ({ fileName, fileSize, mimeType, minioKey, note }) => ({
            fileName,
            fileSize,
            mimeType,
            minioKey,
            note: note || undefined,
          }),
        ),
      });

      toast.success("Revision requested! Employee will be notified.");
      router.back();
    } catch (error: any) {
      toast.error(error.message || "Failed to create revision request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... render split-pane layout
}
```

- [ ] B1.1 Create `RevisionPage` component with split layout
- [ ] B1.2 Left panel: deliverable preview (reuse `FilePreview`)
- [ ] B1.3 Right panel: revision notes + image upload + submit
- [ ] B1.4 Handle submission with `createRevisionRequest` mutation
- [ ] B1.5 Navigate back on success

#### Task B2: Revision Image Upload

**File**: `src/components/modules/admin/projects/project-detail/deliverables/detail/revision-image-upload.tsx`

```typescript
// Handles:
// - File picker for multiple images
// - Upload to MinIO via signed URLs
// - Progress tracking per image
// - Returns uploaded image metadata to parent
```

- [ ] B2.1 Create `RevisionImageUpload` component
- [ ] B2.2 Multi-file input (images only: jpg, png, gif, webp)
- [ ] B2.3 Upload via signed URLs using existing MinIO upload pattern
- [ ] B2.4 Progress bar per image
- [ ] B2.5 Error handling for failed uploads

#### Task B3: Revision Image Grid

**File**: `src/components/modules/admin/projects/project-detail/deliverables/detail/revision-image-grid.tsx`

```typescript
// Handles:
// - Display uploaded images as thumbnail grid
// - Per-image note input field
// - Remove image button
// - Image preview on click (lightbox)
```

- [ ] B3.1 Create `RevisionImageGrid` component
- [ ] B3.2 Thumbnail grid display (responsive: 2-3 columns)
- [ ] B3.3 Per-image note textarea below each thumbnail
- [ ] B3.4 Remove button (X icon) on each thumbnail
- [ ] B3.5 Click to preview in lightbox/expanded view

---

### Phase C: Update Existing Components (~1 point)

#### Task C1: Update "Revise" Button Navigation

**File**: `src/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-detail-view.tsx`

Change the "Revise" button behavior from opening a small modal to navigating to the revision page:

```typescript
// BEFORE:
const handleReviseClick = () => setShowRevisionDialog(true);

// AFTER:
const handleReviseClick = () => {
  router.push(`/projects/${projectId}/deliverables/${deliverableId}/revise`);
};
```

- [ ] C1.1 Update `onRequestRevision` to navigate instead of opening dialog
- [ ] C1.2 Keep old `RevisionDialog` as fallback (feature flag or remove)
- [ ] C1.3 Clean up unused state variables if dialog is removed

#### Task C2: Signed URL Generation for Revision Images

**File**: `convex/functions/storage/actions.ts`

Ensure the existing `getSignedUploadUrl` action works for revision images, or create a dedicated variant:

> **⚠️ GAP FIX**: The MinIO key path for revision reference images must be explicitly defined to keep storage organized and avoid collisions.

**MinIO Key Convention**:

```
projects/{projectId}/revisions/{deliverableId}/{timestamp}_{filename}

Example:
projects/jd72k3nf8s/revisions/k8m4p2q1r7/1707612345000_color_reference.png
```

**Why this structure**:

- Groups revision images under the project → easy bulk cleanup
- Separates from main deliverable files (`projects/{id}/deliverables/...`)
- Includes timestamp to prevent filename collisions
- Deliverable-scoped subdirectory for per-deliverable image grouping

- [ ] C2.1 Verify revision images can be uploaded via existing upload pattern
- [ ] C2.2 Define MinIO key prefix: `projects/{projectId}/revisions/{deliverableId}/`
- [ ] C2.3 Update `getSignedUploadUrl` to accept revision image paths (or verify it already handles arbitrary key prefixes)
- [ ] C2.4 Ensure `getSignedFileUrls` can generate read URLs for revision keys

---

### Phase D: Styling & Polish (~1 point)

#### Task D1: Revision Page Layout Styling

- [ ] D1.1 Split-pane layout: Preview (left, 60%) + Form (right, 40%)
- [ ] D1.2 Responsive: Stack vertically on mobile
- [ ] D1.3 Consistent dark theme with existing deliverable pages
- [ ] D1.4 Smooth transitions and loading states
- [ ] D1.5 Upload progress uses ring/bar animations matching app style

---

## 🧪 Testing Checklist

### Navigation

- [ ] "Revise" button navigates to revision page
- [ ] Back button returns to deliverable detail
- [ ] Breadcrumbs show correct hierarchy

### Image Upload

- [ ] Can upload 1 image
- [ ] Can upload multiple images (up to 10)
- [ ] Progress shown during upload
- [ ] Failed upload shows error, others continue
- [ ] Can remove images before submission

### Per-Image Notes

- [ ] Each image has a note field
- [ ] Notes are optional (can submit without per-image notes)
- [ ] Notes are saved correctly in `referenceImages` array

### Submission

- [ ] Cannot submit without general notes
- [ ] Cannot submit while images are uploading
- [ ] Successful submission creates `revisionRequests` record
- [ ] Reference images array includes all uploaded images with notes
- [ ] Deliverable status transitions to `revision_requested`
- [ ] Project state transitions correctly
- [ ] Success toast shown
- [ ] Navigated back to deliverable detail

### Edge Cases

- [ ] Submit with notes only (no images) — works
- [ ] Submit with images but no per-image notes — works
- [ ] Large image file (10MB+) — uploads with progress
- [ ] Non-image file selected — rejected with error

---

## 🚀 Definition of Done

- [ ] Revision page route exists at `@admin/.../revise/page.tsx`
- [ ] `RevisionPage` component with split layout (preview + form)
- [ ] `RevisionImageUpload` component with multi-file upload
- [ ] `RevisionImageGrid` component with per-image notes
- [ ] "Revise" button navigates to revision page
- [ ] Successful submission creates structured revision request
- [ ] Responsive layout and consistent dark theme
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-11 | backlog | Story created |

---

**Previous Story**: 16-1 - Revision Requests Schema & Backend  
**Next Story**: 16-3 - Employee Revision Workspace
