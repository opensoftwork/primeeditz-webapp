# Story 17-3: Create Studio Deliverable Detail View

**Epic**: Epic 17 - Studio Deliverables UX & Folder Restructure  
**Status**: backlog  
**Complexity**: Large (8 points)  
**Created**: 2026-02-12  
**Priority**: MUST — Enables proper deliverable viewing for studio users

---

## 📋 User Story

**As a** studio user,  
**I want** to click on a deliverable card and see a detail page with preview, metadata, and download,  
**So that** I can properly view and access my finalized files.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                      | Status    | Notes                                                                               |
| ------------------------------- | --------- | ----------------------------------------------------------------------------------- |
| **17-1 - Folder Restructure**   | Required  | Components in organized subfolder                                                   |
| **Admin DeliverableDetailView** | ✅ Exists | 488-line component at `admin/.../deliverables/detail/`                              |
| **Route page.tsx**              | ✅ Exists | `@studio/projects/[projectId]/deliverables/[deliverableId]/page.tsx` already exists |
| **Admin sub-components**        | ✅ Exist  | `DeliverablePreview`, `DeliverableMetaCard`, `VersionHistory`                       |

### Enables

| Story / Epic          | Notes                                              |
| --------------------- | -------------------------------------------------- |
| **17-4 - Card Links** | Detail page must exist before cards can link to it |

### ⚠️ Discovery: Route Already Exists

**The studio deliverable route page already exists** at:

```
src/app/(protected)/@studio/projects/[projectId]/deliverables/[deliverableId]/page.tsx
```

**Current content (23 lines):**

```tsx
"use client";

import { use } from "react";
import { DeliverableDetailView } from "@/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-detail-view";

interface DeliverablePageProps {
  params: Promise<{
    projectId: string;
    deliverableId: string;
  }>;
}

export default function StudioDeliverablePage({
  params,
}: DeliverablePageProps) {
  const { projectId, deliverableId } = use(params);

  return (
    <DeliverableDetailView
      projectId={projectId}
      deliverableId={deliverableId}
    />
  );
}
```

**Problem**: This page imports and renders the **admin** `DeliverableDetailView` directly. That component includes admin-only actions:

- ✅ **Approve** button (admin QC action)
- ✅ **Request Revision** with dialog (admin QC action)
- ✅ **Send to Studio** button (admin action)
- ❌ These should NOT be visible to studio users

**Solution**: Create a **studio-specific detail view** (`StudioDeliverableDetailView`) that reuses admin sub-components but removes admin-only actions and adds studio-appropriate behavior (download button, read-only view).

---

## ✅ Acceptance Criteria

### AC1: Studio-Specific Detail View Component

- [ ] **Given** the admin `DeliverableDetailView` at `src/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-detail-view.tsx`
- [ ] **When** I create a studio-specific version
- [ ] **Then** it must be at `src/components/modules/projects/detail/deliverables/studio-deliverable-detail.tsx`
- [ ] **And** it must reuse these admin sub-components:
  - `DeliverablePreview` (file preview — image/video/PDF)
  - `DeliverableMetaCard` (status, submitter info) — without QC info card
  - `VersionHistory` (read-only version list)
- [ ] **And** it must NOT include admin actions (approve, reject, send-to-studio)

### AC2: File Preview

- [ ] **Given** a deliverable with a valid `minioKey`
- [ ] **When** the detail page loads
- [ ] **Then** the file preview must render inline (image, video, or PDF)
- [ ] **And** a signed URL must be fetched using the existing `getSignedFileUrl` action

### AC3: Download Button

- [ ] **Given** a deliverable with a signed URL
- [ ] **When** I click the "Download" button
- [ ] **Then** the file must download with its original filename
- [ ] **And** the button must use the established styling pattern

### AC4: Metadata Display

- [ ] **Given** a deliverable detail page
- [ ] **When** it renders
- [ ] **Then** it must show: file name, version number, file size, upload date, status, uploaded by

### AC5: Version History (Read-Only)

- [ ] **Given** a deliverable with multiple versions
- [ ] **When** the detail page renders
- [ ] **Then** a version history panel must be shown (read-only)
- [ ] **And** clicking a version link must navigate to that version's detail page

### AC6: Breadcrumb Override

- [ ] **Given** a deliverable detail page
- [ ] **When** it loads
- [ ] **Then** the breadcrumb must show the deliverable name (not the ID)
- [ ] **And** the breadcrumb must use `useBreadcrumbStore().setOverride()`

### AC7: Loading and Error States

- [ ] **Given** the deliverable is loading (`undefined`)
- [ ] **Then** a skeleton loader must be shown
- [ ] **Given** the deliverable is not found (`null`)
- [ ] **Then** a "Not Found" state must be shown with a back link

### AC8: Route Page Update

- [ ] **Given** the existing route page at `@studio/projects/[projectId]/deliverables/[deliverableId]/page.tsx`
- [ ] **When** updated to use the new component
- [ ] **Then** it must import `StudioDeliverableDetailView` from the studio deliverables barrel
- [ ] **And** the route page must remain thin (<30 lines)

---

## 📘 Implementation

### Phase A: Create Studio Detail View (~5 points)

#### Task A1: Create `StudioDeliverableDetailView` Component

**File**: `src/components/modules/projects/detail/deliverables/studio-deliverable-detail.tsx`

This component is a simplified version of the admin's `DeliverableDetailView` (488 lines). It keeps the preview and metadata but removes all admin actions.

**Structure Reference — Admin's `DeliverableDetailView` layout:**

```
┌─────────────────────────────────────────────────┐
│  Header (Back button + Name + Version + Meta)    │
├─────────────────────┬───────────────────────────┤
│                     │  Meta Card (Status, By)    │
│  Preview            │  Actions (ADMIN ONLY)      │
│  (2/3 width)        │  (Approve/Revise/Send)     │
│                     │  QC Info Card              │
├─────────────────────┴───────────────────────────┤
│  Version History (expandable)                    │
└─────────────────────────────────────────────────┘
```

**Studio version (REMOVE admin actions, ADD download):**

```
┌─────────────────────────────────────────────────┐
│  Header (Back button + Name + Version + Meta)    │
├─────────────────────┬───────────────────────────┤
│                     │  Meta Card (Status, By)    │
│  Preview            │  Download Button           │
│  (2/3 width)        │  File Info Card            │
│                     │                             │
├─────────────────────┴───────────────────────────┤
│  Version History (read-only)                     │
└─────────────────────────────────────────────────┘
```

**Full component implementation:**

```tsx
"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useAction } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileIcon,
  Download,
  ShieldCheck,
  Calendar,
  HardDrive,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { DeliverablePreview } from "@/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-preview";
import { VersionHistory } from "@/components/modules/admin/projects/project-detail/deliverables/detail/version-history";
import Link from "next/link";

interface StudioDeliverableDetailViewProps {
  projectId: string;
  deliverableId: string;
}

export function StudioDeliverableDetailView({
  projectId,
  deliverableId,
}: StudioDeliverableDetailViewProps) {
  const router = useRouter();
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Queries
  const deliverable = useQuery(
    // @ts-ignore - getDeliverable may have type issues
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const versions = useQuery(
    api.functions.deliverables.queries.getDeliverableVersions,
    deliverable
      ? { deliverableId: deliverableId as Id<"deliverables"> }
      : "skip",
  );

  // Signed URL
  const getSignedUrlAction = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );

  // Breadcrumb override
  useEffect(() => {
    if (deliverable) {
      setOverride(deliverableId, deliverable.name);
    }
    return () => removeOverride(deliverableId);
  }, [deliverableId, deliverable, setOverride, removeOverride]);

  // Fetch signed URL
  useEffect(() => {
    async function fetchUrl() {
      if (deliverable?.minioKey && !fileUrl) {
        try {
          const url = await getSignedUrlAction({
            storageKey: deliverable.minioKey,
          });
          setFileUrl(url);
        } catch (error) {
          console.error("Error fetching signed URL:", error);
        }
      }
    }
    fetchUrl();
  }, [deliverable?.minioKey, getSignedUrlAction]);

  // Loading state
  if (deliverable === undefined) {
    return <StudioDeliverableDetailSkeleton />;
  }

  // Not found
  if (deliverable === null) {
    return (
      <div className="p-8 md:p-12 text-center space-y-4">
        <p className="text-white/40 text-sm uppercase tracking-widest font-bold">
          Deliverable not found
        </p>
        <Button variant="outline" className="rounded-xl" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
        </Button>
      </div>
    );
  }

  const formattedSize = (deliverable.sizeBytes / (1024 * 1024)).toFixed(2);
  const hasMultipleVersions = versions && versions.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-12 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 border-white/10 shrink-0"
        >
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <FileIcon className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-white">
              {deliverable.name}
            </h1>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <span className="bg-white/5 px-2 py-0.5 rounded-md">
                v{deliverable.version}
              </span>
              <span>•</span>
              <span>{formattedSize} MB</span>
              <span>•</span>
              <span>{format(deliverable._creationTime, "PPP")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview — 2/3 width */}
        <div className="lg:col-span-2">
          <DeliverablePreview
            url={fileUrl}
            fileName={deliverable.name}
            mimeType={deliverable.mimeType}
          />
        </div>

        {/* Sidebar — 1/3 width */}
        <div className="space-y-6">
          {/* Download Button */}
          {fileUrl && (
            <a
              href={fileUrl}
              download={deliverable.name}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Download className="h-4 w-4" />
              Download File
            </a>
          )}

          {/* File Metadata Card */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-5">
            <MetaItem
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Status"
              value={
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                    deliverable.status === "approved"
                      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                      : "text-amber-400 border-amber-500/20 bg-amber-500/10",
                  )}
                >
                  {deliverable.status.replace(/_/g, " ")}
                </span>
              }
            />
            <MetaItem
              icon={<User className="h-4 w-4" />}
              label="Submitted By"
              value={
                <span className="text-sm font-bold text-white">
                  {deliverable.uploadedByName || "PrimeEditz Team"}
                </span>
              }
            />
            <MetaItem
              icon={<HardDrive className="h-4 w-4" />}
              label="File Size"
              value={
                <span className="text-sm font-bold text-white">
                  {formattedSize} MB
                </span>
              }
            />
            <MetaItem
              icon={<Calendar className="h-4 w-4" />}
              label="Uploaded"
              value={
                <span className="text-sm font-bold text-white">
                  {format(deliverable._creationTime, "PPP p")}
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* Version History */}
      {hasMultipleVersions && (
        <VersionHistory
          versions={versions!}
          currentId={deliverableId as Id<"deliverables">}
          projectId={projectId}
          hrefPrefix={`/projects/${projectId}/deliverables`}
        />
      )}
    </motion.div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-white/30">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div>{value}</div>
    </div>
  );
}

function StudioDeliverableDetailSkeleton() {
  return (
    <div className="p-6 md:p-12 space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded bg-white/5" />
          <Skeleton className="h-3 w-32 rounded bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="lg:col-span-2 h-[500px] rounded-3xl bg-white/5" />
        <div className="space-y-6">
          <Skeleton className="h-12 rounded-xl bg-white/5" />
          <Skeleton className="h-64 rounded-3xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
```

> **IMPORTANT — Sub-component reuse**: This component reuses `DeliverablePreview` and `VersionHistory` from the admin path via absolute imports (`@/components/modules/admin/...`). This is intentional — these are view-only components that don't contain admin logic. The admin-specific logic (approve, reject, send) lives in `DeliverableActions` which we deliberately DO NOT import.

- [ ] A1.1 Create `studio-deliverable-detail.tsx` component
- [ ] A1.2 Implement header with back button and metadata
- [ ] A1.3 Load deliverable query with signed URL
- [ ] A1.4 Render `DeliverablePreview` for file preview
- [ ] A1.5 Add download button with signed URL
- [ ] A1.6 Add metadata card (status, submitter, size, date)
- [ ] A1.7 Add read-only `VersionHistory` panel
- [ ] A1.8 Implement breadcrumb override
- [ ] A1.9 Add loading skeleton
- [ ] A1.10 Add not-found state with back link

---

### Phase B: Update Route Page (~0.5 points)

#### Task B1: Update Existing Route Page

**File**: `src/app/(protected)/@studio/projects/[projectId]/deliverables/[deliverableId]/page.tsx`

**Current (imports admin component):**

```tsx
import { DeliverableDetailView } from "@/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-detail-view";
```

**Replace with:**

```tsx
import { StudioDeliverableDetailView } from "@/components/modules/projects/detail/deliverables/studio-deliverable-detail";
// Or after barrel export is set up:
// import { StudioDeliverableDetailView } from "@/components/modules/projects/detail/deliverables";
```

**Updated route page:**

```tsx
"use client";

import { use } from "react";
import { StudioDeliverableDetailView } from "@/components/modules/projects/detail/deliverables/studio-deliverable-detail";

interface DeliverablePageProps {
  params: Promise<{
    projectId: string;
    deliverableId: string;
  }>;
}

export default function StudioDeliverablePage({
  params,
}: DeliverablePageProps) {
  const { projectId, deliverableId } = use(params);

  return (
    <StudioDeliverableDetailView
      projectId={projectId}
      deliverableId={deliverableId}
    />
  );
}
```

- [ ] B1.1 Update route page import to use `StudioDeliverableDetailView`
- [ ] B1.2 Verify route page remains thin (<30 lines)

---

### Phase C: Update Barrel Export (~0.5 points)

#### Task C1: Add to Deliverables Barrel

**File**: `src/components/modules/projects/detail/deliverables/index.ts`

Add export:

```typescript
export { StudioDeliverableDetailView } from "./studio-deliverable-detail";
```

- [ ] C1.1 Add `StudioDeliverableDetailView` to barrel export

---

### Phase D: Verify Sub-Component Compatibility (~2 points)

#### Task D1: Verify `DeliverablePreview` Reusability

**File**: `src/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-preview.tsx`

Check the component's props interface. It should accept:

```typescript
interface DeliverablePreviewProps {
  url: string | null;
  fileName: string;
  mimeType?: string;
  description?: string;
  rejectionNotes?: string;
}
```

The studio version only needs `url`, `fileName`, and `mimeType`. The `description` and `rejectionNotes` props are optional, so this works without modification.

- [ ] D1.1 Verify `DeliverablePreview` works with minimal props
- [ ] D1.2 Test with image deliverable
- [ ] D1.3 Test with video deliverable
- [ ] D1.4 Test with PDF deliverable
- [ ] D1.5 Test with unsupported file type (fallback icon)

#### Task D2: Verify `VersionHistory` Reusability

**File**: `src/components/modules/admin/projects/project-detail/deliverables/detail/version-history.tsx`

Check that it accepts `hrefPrefix` prop for correct link generation:

```typescript
interface VersionHistoryProps {
  versions: DeliverableVersion[];
  currentId: Id<"deliverables">;
  projectId: string;
  hrefPrefix?: string; // Must support this for studio context
}
```

Studio needs `hrefPrefix="/projects/${projectId}/deliverables"` to generate correct links.

- [ ] D2.1 Verify `VersionHistory` accepts `hrefPrefix` prop
- [ ] D2.2 If `hrefPrefix` is not supported, add it with backward-compatible default
- [ ] D2.3 Test version links navigate correctly in studio context

---

## 🧪 Testing Checklist

### Navigation

- [ ] Navigate from project detail → click deliverable card → detail page loads
- [ ] Back button returns to project detail page
- [ ] Breadcrumb shows deliverable name (not ID)
- [ ] Version history links navigate to correct version detail page

### Preview

- [ ] Image deliverables show inline preview
- [ ] Video deliverables show inline player
- [ ] PDF deliverables show inline viewer
- [ ] Unsupported types show file icon fallback

### Download

- [ ] Download button appears when signed URL is available
- [ ] Click downloads the file
- [ ] Filename is preserved in download

### Metadata

- [ ] Status badge shows correct state
- [ ] Submitted by name is accurate
- [ ] File size is formatted correctly
- [ ] Upload date is formatted correctly

### States

- [ ] Loading skeleton shows during data fetch
- [ ] Not found state shows for invalid deliverable ID
- [ ] Smooth entrance animation on load

---

## 🚀 Definition of Done

- [ ] `StudioDeliverableDetailView` component created and working
- [ ] Route page updated to use new component
- [ ] Barrel export includes new component
- [ ] File preview working for all types
- [ ] Download button functional
- [ ] Metadata card shows accurate data
- [ ] Version history shows (read-only) when multiple versions exist
- [ ] Breadcrumb shows deliverable name
- [ ] Loading and error states implemented
- [ ] No admin actions visible (approve, reject, send)
- [ ] `pnpm build` passes

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-12 | backlog | Story created |

---

**Previous Story**: 17-2 - Fix Deliverables Section Data Issues & UI Consistency  
**Next Story**: 17-4 - Update DeliverableCard Link Behavior for Studio Context
