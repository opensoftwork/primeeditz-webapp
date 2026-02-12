# Epic 17: Studio Deliverables UX & Folder Restructure

**Epic Owner**: Studio / Admin / Developer  
**Status**: Planning  
**Created**: 2026-02-12  
**Complexity**: Medium  
**Priority**: High  
**Estimated Points**: 29  
**Dependencies**: Epic 6 (Deliverables & QC Workflow), Epic 16 (Deliverable Revision Workflow)

---

## 📋 Epic Summary

A **UX consistency and code architecture overhaul** for the Studio project detail's deliverables experience. The current studio `deliverables-section.tsx` was implemented as a quick integration using admin's `DeliverableCard` component but has critical issues:

1. **Broken navigation** — cards link to routes that don't exist in the studio context
2. **Hardcoded values** — `uploadedByName` is always `"PrimeEditz Team"`, status badge is always `"QC APPROVED"`
3. **UI inconsistency** — doesn't use the shared `DetailSection` pattern that every other section on the same page uses
4. **Flat folder structure** — 6 deliverable-related files are scattered flat alongside unrelated core detail components, violating the codebase's module pattern
5. **No deliverable detail view** — studio users cannot click into a deliverable to preview, download, or see version history

This epic fixes all of these issues while ensuring the finalized delivery experience matches the admin-side quality — **cards with previews, click-through to detail pages, proper stats, and contextual status badges**.

---

## 🎯 User Outcomes

| Role       | Outcome                                                                           |
| ---------- | --------------------------------------------------------------------------------- |
| **Studio** | See deliverables in a proper grid with file previews and contextual status badges |
| **Studio** | Click a deliverable card to navigate to a detail page with preview and download   |
| **Studio** | See summary stats (approved count, total, version requests active)                |
| **Studio** | Consistent visual experience with other sections on the same page                 |
| **Dev**    | Deliverable files organized in a subfolder with barrel exports                    |
| **Dev**    | Asset files organized in a subfolder with barrel exports                          |
| **Dev**    | Root index file for clean imports from `projects/detail`                          |

---

## 🚨 Current Gaps (Why This Epic Exists)

### Gap 1: Broken Card Navigation

**Current:** In non-review mode, `DeliverableCard` (imported from admin) generates links like `/projects/{id}/deliverables/{deliverableId}`. The studio route `@studio/projects/[projectId]/deliverables/[deliverableId]` **exists as a directory** but has no `page.tsx` wired to render a detail view.  
**Impact:** Clicking a deliverable card navigates to a 404 or blank page.

### Gap 2: Hardcoded Placeholder Values

**Current:** `deliverables-section.tsx` line 157 hardcodes `uploadedByName="PrimeEditz Team"` instead of using the actual `item.uploadedByName` from the query. Line 96 hardcodes `"QC APPROVED"` badge regardless of actual project state.  
**Impact:** Misleading information. Every deliverable says "PrimeEditz Team" even if uploaded by a specific employee. Badge is always green even when deliverables may be in different states.

### Gap 3: Missing `DetailSection` Wrapper

**Current:** `deliverables-section.tsx` uses custom header markup (`<h2>`, `<p>`, raw `<div>`) instead of the shared `DetailSection` component from `./shared.tsx`.  
**Impact:** Visual inconsistency with `ProjectSpecifications`, `ReferenceMaterials`, and `AssignedWorkDeliverables` which all use `DetailSection`. Different icon treatment, spacing, container styling.

### Gap 4: No Summary Statistics

**Current:** Only a static info banner. No count of approved/total/versioned deliverables.  
**Impact:** Studio user has to manually count deliverables. Admin gets a rich 3-column stats grid showing Pending QC, Versions, and Ready for Delivery counts — studio gets nothing.

### Gap 5: Flat Folder Structure

**Current:** `src/components/modules/projects/detail/` has 14 files flat, with 6 being deliverable-specific (`deliverables-section.tsx`, `deliverable-review-card.tsx`, `approval-actions.tsx`, `approval-progress-banner.tsx`, `studio-versions-dialog.tsx`, `versions-dialog.tsx`, `versions-status-tracker.tsx`).  
**Impact:** Hard to navigate, violates the established module pattern (see `folder/` subdirectory which correctly groups 5 folder-related files). Makes maintenance harder as the codebase grows.

---

## 🗂️ User Stories

### Story 17.1: Reorganize Project Detail Folder Structure

**As a** developer,  
**I want** the project detail components organized into domain-based subfolders,  
**So that** the codebase is maintainable, consistent with the module pattern, and easy to navigate.

**Story Points**: 3  
**Status**: 📋 Backlog  
**Priority**: MUST — Foundation for all other stories

---

#### Context & Implementation Details

**Current flat structure** at `src/components/modules/projects/detail/`:

```
├── approval-actions.tsx              ← Deliverables domain
├── approval-progress-banner.tsx      ← Deliverables domain
├── assets-section.tsx                ← Assets domain
├── deliverable-review-card.tsx       ← Deliverables domain
├── deliverables-section.tsx          ← Deliverables domain
├── folder/                           ← Already organized ✅
├── header.tsx                        ← Core detail (stays)
├── project-detail-view.tsx           ← Core orchestrator (stays)
├── reference-materials.tsx           ← Core detail (stays)
├── shared.tsx                        ← Core shared (stays)
├── sidebar.tsx                       ← Core detail (stays)
├── specifications.tsx                ← Core detail (stays)
├── studio-versions-dialog.tsx        ← Deliverables domain
├── versions-dialog.tsx               ← Deliverables domain
└── versions-status-tracker.tsx       ← Deliverables domain
```

**Target structure:**

```
src/components/modules/projects/detail/
├── index.ts                              ← NEW barrel export
├── project-detail-view.tsx               ← Stays
├── header.tsx                            ← Stays
├── sidebar.tsx                           ← Stays
├── shared.tsx                            ← Stays
├── specifications.tsx                    ← Stays
├── reference-materials.tsx               ← Stays
├── deliverables/                         ← NEW subfolder
│   ├── index.ts                          ← NEW barrel export
│   ├── deliverables-section.tsx          ← Moved
│   ├── deliverable-review-card.tsx       ← Moved
│   ├── approval-progress-banner.tsx      ← Moved
│   ├── approval-actions.tsx              ← Moved
│   ├── versions-dialog.tsx               ← Moved
│   ├── studio-versions-dialog.tsx        ← Moved
│   └── versions-status-tracker.tsx       ← Moved
├── assets/                               ← NEW subfolder
│   ├── index.ts                          ← NEW barrel export
│   └── assets-section.tsx                ← Moved
└── folder/                               ← Unchanged ✅
    ├── index.ts
    ├── folder-asset-list.tsx
    ├── folder-detail-view.tsx
    ├── folder-drop-zone.tsx
    └── staged-upload-queue.tsx
```

#### Acceptance Criteria

**Given** the current flat folder structure with 14+ files  
**When** I reorganize following the target structure above  
**Then** all deliverable-related files must be in `deliverables/` subfolder  
**And** `assets-section.tsx` must be in `assets/` subfolder  
**And** each new subfolder must have an `index.ts` barrel export  
**And** a root `index.ts` must re-export from all subfolders  
**And** `project-detail-view.tsx` import paths must be updated to use the new barrel exports  
**And** the app must build without errors (`pnpm build` passes)  
**And** all existing functionality must work identically (no behavior changes)

#### Import Update Reference

**Before (in `project-detail-view.tsx`):**

```tsx
import { DeliverablesSection } from "./deliverables-section";
import { AssetsSection } from "./assets-section";
import { ApprovalProgressBanner } from "./approval-progress-banner";
```

**After:**

```tsx
import { DeliverablesSection } from "./deliverables";
import { AssetsSection } from "./assets";
```

**Before (in `deliverables-section.tsx`):**

```tsx
import { ApprovalProgressBanner } from "./approval-progress-banner";
import { DeliverableReviewCard } from "./deliverable-review-card";
```

**After:**

```tsx
import { ApprovalProgressBanner } from "./approval-progress-banner";
import { DeliverableReviewCard } from "./deliverable-review-card";
// No change needed — these are now in the same subfolder
```

#### Internal Cross-Reference Updates

The following internal imports within the moved files need updating:

1. `deliverables-section.tsx` line 12: `import { ApprovalProgressBanner } from "./approval-progress-banner"` → stays same (same folder)
2. `deliverables-section.tsx` line 13: `import { DeliverableReviewCard } from "./deliverable-review-card"` → stays same
3. `deliverable-review-card.tsx` line 12: `import { StudioVersionsDialog } from "./studio-versions-dialog"` → stays same
4. `deliverable-review-card.tsx` line 13: `import { VersionStatusTracker } from "./versions-status-tracker"` → stays same
5. `approval-actions.tsx` line 10: `import { ClientVersionDialog } from "./versions-dialog"` → stays same

**Key insight:** Since all deliverable files move together to the same subfolder, their internal relative imports don't change. Only the parent (`project-detail-view.tsx`) needs its imports updated.

---

### Story 17.2: Fix Deliverables Section Data Issues & UI Consistency

**As a** studio user,  
**I want** the deliverables section to show accurate data and match the visual pattern of other sections on the page,  
**So that** I see correct information and have a consistent experience.

**Story Points**: 5  
**Status**: 📋 Backlog  
**Priority**: MUST — Fixes incorrect data display  
**Depends On**: Story 17.1

---

#### Context & Implementation Details

**File to modify:** `src/components/modules/projects/detail/deliverables/deliverables-section.tsx` (after Story 17.1 moves it)

**Issue 1: Hardcoded `uploadedByName`**

Line 157 currently passes `uploadedByName="PrimeEditz Team"` as a static string. The `deliverables` query returns `item.uploadedByName` as actual data.

**Fix:** Replace `uploadedByName="PrimeEditz Team"` with `uploadedByName={item.uploadedByName || "PrimeEditz Team"}` — use the real data with a fallback.

**Issue 2: Hardcoded "QC APPROVED" badge**

Lines 95-97 always show a green "QC APPROVED" badge regardless of `actionState`. This should be contextual:

- `awaiting_review` → Show "AWAITING REVIEW" (amber)
- `review_approved` → Show "APPROVED" (emerald)
- Other states → Show "DELIVERED" (indigo) or no badge

**Fix:** Use the `getStatusConfig()` utility from `@/lib/status-display` (already used by the `ProjectHeader` component on the same page) to get the correct label and colors based on `actionState`.

**Issue 3: Not using `DetailSection` wrapper**

The current section uses raw HTML (`<div>`, `<h2>`, `<p>`) instead of the shared `DetailSection` component from `./shared.tsx`. Every other section uses it:

- `ProjectSpecifications` uses `<DetailSection title="Production Specifications" icon={...}>`
- `ReferenceMaterials` uses `<DetailSection title="Reference Materials" icon={...}>`
- Employee's `AssignedWorkDeliverables` uses `<DetailSection title="Sent Deliverables" icon={...}>`

**Fix:** Wrap the section content in `<DetailSection title="Final Deliverables" icon={<ShieldCheck className="h-5 w-5" />}>` and remove the custom header. Set `noContainer` to `true` if the inner cards should manage their own padding.

**Issue 4: No summary stats**

The admin deliverables list shows a 3-column stats grid (Pending QC, Versions, Ready for Delivery). The studio section shows only a static info banner.

**Fix:** Add a compact stats row showing:

- `{approved}/{total} Approved` (emerald accent)
- `{versionCount} Version Requests Active` (amber accent, only if > 0)

Use the same styling pattern as the admin stats cards but in a more compact inline format:

```
text-[10px] font-black uppercase tracking-widest
```

#### Acceptance Criteria

**Given** the studio deliverables section is displayed  
**When** deliverables are loaded  
**Then** each card must show the actual `uploadedByName` from the deliverable data, with "PrimeEditz Team" as fallback only when the field is empty/null  
**And** the section header badge must reflect the actual `actionState` (not hardcoded "QC APPROVED")  
**And** the section must use the shared `DetailSection` component wrapper for visual consistency  
**And** a compact stats row must show approved count vs total count  
**And** if any version requests are active, their count must be displayed  
**And** the info banner must show contextual instructions based on `actionState`  
**And** the section must use `motion/react` entrance animations consistent with other sections

#### Design Reference — Shared `DetailSection` Pattern

```tsx
// From src/components/modules/projects/detail/shared.tsx
<DetailSection
  title="Final Deliverables"
  icon={<ShieldCheck className="h-5 w-5" />}
  action={
    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
      {deliverables.length} Deliverables
    </span>
  }
>
  {/* Stats row + cards grid here */}
</DetailSection>
```

#### Codebase Conventions to Follow

- **Section label**: `text-[10px] font-black uppercase tracking-[0.3em] text-primary/40`
- **Card container**: `rounded-2xl bg-white/5 border border-white/10`
- **Status badge active**: `bg-green-500/10 text-green-500 border-green-500/20`
- **Muted text**: `text-[10px] font-black uppercase tracking-widest text-white/30`
- **Stats color schema** — Emerald for approved, Amber for pending/versions, Indigo for info

---

### Story 17.3: Wire Studio Deliverable Detail Route & View

**As a** studio user,  
**I want** to click on a deliverable card and see a detail page with preview, metadata, and download,  
**So that** I can properly view and access my finalized files.

**Story Points**: 8  
**Status**: 📋 Backlog  
**Priority**: MUST — Fixes broken click-through navigation  
**Depends On**: Story 17.1

---

#### Context & Implementation Details

**The admin already has a complete deliverable detail system** at:

```
src/components/modules/admin/projects/project-detail/deliverables/detail/
├── deliverable-detail-view.tsx   # 488 lines — Full detail with preview, sidebar, actions
├── deliverable-actions.tsx       # Approve/Revise/Send action buttons
├── deliverable-meta-card.tsx     # Status card + metadata display
├── deliverable-preview.tsx       # File preview component
├── version-history.tsx           # Version history panel
├── versions-dialog.tsx           # Version request dialog
└── index.ts                      # Barrel exports
```

The admin's `DeliverableDetailView` uses `useParams()` to get `projectId` and `deliverableId`, fetches the deliverable via query, and displays a 2-column layout (preview left, sidebar right).

**For the studio side, we need:**

1. **A route page** at `src/app/(protected)/@studio/projects/[projectId]/deliverables/[deliverableId]/page.tsx`
2. **A studio-specific detail view** that reuses what it can from admin but is read-only (no approve/reject/send actions)

**Existing route structure:**

```
src/app/(protected)/@studio/projects/[projectId]/
├── deliverables/
│   └── [deliverableId]/           ← Directory exists but has NO page.tsx!
├── folders/
├── onboarding/
├── layout.tsx
└── page.tsx
```

**What the studio detail view should show:**

- File preview (reuse `DeliverablePreview` from admin)
- File metadata: name, version, size, upload date, status, uploaded by
- Download button (using signed URL)
- Version history (read-only, if multiple versions exist)
- No admin actions (no approve, reject, send-to-studio buttons)

**Approach:** Create a new `StudioDeliverableDetailView` component at `src/components/modules/projects/detail/deliverables/studio-deliverable-detail.tsx` that:

- Uses the same `deliverable` query as admin
- Reuses `DeliverablePreview` from admin (`@/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-preview`)
- Reuses `DeliverableMetaCard` from admin with a `readOnly` prop
- Shows a download button using the signed URL
- Follows the same header pattern with back button (see admin's `DeliverableDetailView` header)
- Uses breadcrumb override for deliverable name (same pattern as admin)

#### Acceptance Criteria

**Given** I am on the studio project detail page viewing deliverables  
**When** I click on a deliverable card  
**Then** I must navigate to `/projects/{projectId}/deliverables/{deliverableId}`  
**And** the page must show the deliverable preview (image/video/PDF rendered inline)  
**And** the page must show metadata: file name, version number, file size, upload date, status, uploaded by  
**And** the page must have a working download button that downloads the file  
**And** if multiple versions exist, a read-only version history panel must be shown  
**And** the breadcrumb must show the deliverable name (not the ID)  
**And** a back button must navigate back to the project detail page  
**And** the page must follow the codebase's detail page pattern (loading skeleton, not-found state, motion animations)  
**And** the route page must be thin (<30 lines) per the project conventions

#### Route Page Pattern (from SKILL.md)

```tsx
// src/app/(protected)/@studio/projects/[projectId]/deliverables/[deliverableId]/page.tsx
"use client";

import { use } from "react";
import { StudioDeliverableDetailView } from "@/components/modules/projects/detail/deliverables";

interface PageProps {
  params: Promise<{
    projectId: string;
    deliverableId: string;
  }>;
}

export default function StudioDeliverableDetailPage({ params }: PageProps) {
  const { projectId, deliverableId } = use(params);
  return (
    <StudioDeliverableDetailView
      projectId={projectId}
      deliverableId={deliverableId}
    />
  );
}
```

#### Header Pattern Reference (from existing detail views)

The header should follow the compact pattern used in `header.tsx`:

```tsx
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
  {/* Icon + Title + Metadata */}
</div>
```

#### Query to Use

The admin uses this query (it works for any authenticated user):

```tsx
const deliverable = useQuery(
  api.functions.deliverables.queries.getDeliverable,
  { deliverableId: deliverableId as Id<"deliverables"> },
);
```

#### Signed URL Pattern

Same pattern as used in `deliverables-section.tsx`:

```tsx
const getSignedUrlAction = useAction(
  api.functions.storage.actions.getSignedFileUrl,
);
// In useEffect:
const url = await getSignedUrlAction({ storageKey: deliverable.minioKey });
```

---

### Story 17.4: Update DeliverableCard Link Behavior for Studio Context

**As a** studio user,  
**I want** deliverable cards to navigate to the correct studio route,  
**So that** clicking a card doesn't lead to a broken page.

**Story Points**: 3  
**Status**: 📋 Backlog  
**Priority**: MUST — Critical bug fix  
**Depends On**: Story 17.1, Story 17.3

---

#### Context & Implementation Details

**The problem:** The `DeliverableCard` component at `src/components/modules/admin/projects/project-detail/deliverables/list/deliverable-card.tsx` generates links via:

```tsx
const cardHref = href || `/projects/${projectId}/deliverables/${id}`;
```

This default path works for admin (`@admin/projects/...`) but is also used by the studio `deliverables-section.tsx` which imports the same `DeliverableCard`. Since studio routes are under `@studio/projects/...`, the default link resolves correctly due to Next.js parallel routes — **BUT only if a `page.tsx` exists at that route** (which Story 17.3 creates).

**After Story 17.3 creates the route, verify that:**

1. The default `href` resolves correctly in the studio context
2. The `DeliverableCard` component's `Link` navigation works as expected

**If the default doesn't resolve correctly** (parallel routes may not map), provide an explicit `href` prop from `deliverables-section.tsx`:

```tsx
<DeliverableCard
  key={item._id}
  id={item._id}
  projectId={projectId}
  name={item.name}
  // ... other props
  href={`/projects/${projectId}/deliverables/${item._id}`}
/>
```

**Additionally:** In review mode, the `DeliverableReviewCard` doesn't link anywhere — it's a self-contained card with approve/version buttons. This is correct behavior and should not change.

#### Acceptance Criteria

**Given** I am viewing the studio project detail page with deliverables in non-review mode  
**When** I click on a deliverable card  
**Then** I must navigate to the studio deliverable detail page (Story 17.3)  
**And** the URL must be `/projects/{projectId}/deliverables/{deliverableId}`  
**And** the page must load the `StudioDeliverableDetailView` component  
**And** clicking the back button on the detail page must return to the project detail page  
**And** in review mode (`actionState === "awaiting_review"`), cards must NOT navigate (they show inline approve/version buttons instead)

---

### Story 17.5: Add Empty State, Loading Polish, and Motion Consistency

**As a** studio user,  
**I want** a polished empty state, consistent loading skeletons, and smooth animations in the deliverables section,  
**So that** the experience feels premium and informative even when there's no content.

**Story Points**: 3  
**Status**: 📋 Backlog  
**Priority**: SHOULD — Polish and UX quality  
**Depends On**: Story 17.2

---

#### Context & Implementation Details

**Issue 1: No empty state**

`deliverables-section.tsx` currently returns `null` when `deliverables.length === 0` (line 78-80). Other sections show a styled empty state:

```tsx
// From reference-materials.tsx empty state pattern:
<div className="py-12 text-center border-2 border-dashed border-white/5 rounded-4xl bg-white/1">
  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
    No deliverables available yet
  </p>
</div>
```

**Fix:** Replace `return null` with a styled empty state inside the `DetailSection` wrapper showing "No deliverables available yet" with a subtle description like "Finalized deliverables will appear here once the production team completes their work."

**Issue 2: Loading skeleton consistency**

Current skeleton is basic (`Skeleton className="h-12 w-full"` and `"h-24 w-full"`). The rest of the page uses more detailed skeleton layouts.

**Fix:** Match the skeleton style used in `ProjectDetailSkeleton` at the bottom of `project-detail-view.tsx` — use `rounded-3xl` and contextual heights.

**Issue 3: Motion animation consistency**

The section uses `motion.div` with `initial={{ opacity: 0, y: 20 }}` which is correct but the inner cards don't have staggered animations. Other sections (like `ProjectSpecifications` and `ReferenceMaterials`) use staggered `delay` values for child items.

**Fix:** Add staggered entrance to deliverable cards:

```tsx
<motion.div
  key={item._id}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: idx * 0.05 + 0.2, duration: 0.3 }}
>
  <DeliverableCard ... />
</motion.div>
```

#### Acceptance Criteria

**Given** no deliverables exist for the project  
**When** the deliverables section renders  
**Then** a styled empty state must be shown (not `null`/hidden)  
**And** the empty state must use the dashed-border pattern: `border-2 border-dashed border-white/5 rounded-4xl bg-white/1`  
**And** it must show a message like "No finalized deliverables yet" with a subtitle

**Given** deliverables are loading (`undefined`)  
**When** the section renders  
**Then** loading skeletons must use `rounded-3xl` to match other sections  
**And** at least 2 skeleton cards must be shown to indicate grid content

**Given** deliverables have loaded  
**When** they render into the grid  
**Then** each card must have a staggered entrance animation with `delay: idx * 0.05`  
**And** the outer section must animate with `opacity: 0, y: 20` → `opacity: 1, y: 0`

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│              STUDIO DELIVERABLE DETAIL NAVIGATION                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐     ┌────────────────────┐     ┌──────────────┐  │
│  │  Project     │──►  │  Deliverables      │──►  │ Deliverable  │  │
│  │  Detail View │     │  Section (grid)    │     │ Detail View  │  │
│  │  /projects/  │     │  Shows cards with  │     │ /projects/   │  │
│  │  [projectId] │     │  preview + status  │     │ [id]/deliv/  │  │
│  └──────────────┘     └────────────────────┘     │ [delivId]    │  │
│                               │                   └──────────────┘  │
│                               │ (review mode)          │            │
│                               ▼                        │            │
│                       ┌────────────────────┐           │            │
│                       │ DeliverableReview  │           │            │
│                       │ Card (inline)      │     ┌─────┴──────┐    │
│                       │ Approve / Version  │     │  Preview   │    │
│                       │ No navigation      │     │  Download  │    │
│                       └────────────────────┘     │  Metadata  │    │
│                                                  │  Versions  │    │
│                                                  └────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│ Key: Non-review mode → Card click navigates to detail              │
│      Review mode → Card shows inline approve/version buttons       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Components

### Files to Create

```
src/components/modules/projects/detail/
├── deliverables/
│   ├── index.ts                              ← NEW barrel
│   └── studio-deliverable-detail.tsx         ← NEW detail view
├── assets/
│   └── index.ts                              ← NEW barrel

src/app/(protected)/@studio/projects/[projectId]/deliverables/
└── [deliverableId]/
    └── page.tsx                              ← NEW route page
```

### Files to Move (Story 17.1)

```
deliverables-section.tsx          → deliverables/deliverables-section.tsx
deliverable-review-card.tsx       → deliverables/deliverable-review-card.tsx
approval-progress-banner.tsx      → deliverables/approval-progress-banner.tsx
approval-actions.tsx              → deliverables/approval-actions.tsx
versions-dialog.tsx               → deliverables/versions-dialog.tsx
studio-versions-dialog.tsx        → deliverables/studio-versions-dialog.tsx
versions-status-tracker.tsx       → deliverables/versions-status-tracker.tsx
assets-section.tsx                → assets/assets-section.tsx
```

### Files to Modify

```
project-detail-view.tsx           → Update import paths
deliverables-section.tsx          → Fix data, add DetailSection, add stats
```

---

## 🔗 Integration Points

| Component                 | Integration                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `project-detail-view.tsx` | Update imports to use new barrel exports from subfolders      |
| `DeliverableCard`         | Verify/fix href generation for studio context                 |
| Breadcrumb Store          | Override deliverable ID with name in studio detail view       |
| `DeliverablePreview`      | Reuse from admin path for studio detail view                  |
| `DeliverableMetaCard`     | Reuse from admin path for studio detail view (read-only mode) |

---

## ✅ Acceptance Criteria Summary

### Foundation (Story 17.1)

- [ ] All deliverable-related files organized in `deliverables/` subfolder
- [ ] `assets-section.tsx` in `assets/` subfolder
- [ ] All barrel `index.ts` files created
- [ ] All imports updated and app builds without errors

### Data Fixes (Story 17.2)

- [ ] Actual `uploadedByName` shown instead of hardcoded "PrimeEditz Team"
- [ ] Status badge contextual instead of hardcoded "QC APPROVED"
- [ ] `DetailSection` wrapper used for visual consistency
- [ ] Summary stats row showing approved/total/versions count

### Navigation (Stories 17.3 + 17.4)

- [ ] Studio deliverable detail route exists and renders
- [ ] Detail page shows preview, metadata, download, version history
- [ ] Card click navigation works correctly in studio context
- [ ] Breadcrumb shows deliverable name

### Polish (Story 17.5)

- [ ] Empty state shown when no deliverables (not hidden)
- [ ] Loading skeletons match other section patterns
- [ ] Staggered card entrance animations

---

## 📈 Story Points Summary

| Story | Description                                     | Points | Priority |
| ----- | ----------------------------------------------- | ------ | -------- |
| 17.1  | Reorganize folder structure                     | 3      | MUST     |
| 17.2  | Fix data issues & UI consistency                | 5      | MUST     |
| 17.3  | Wire studio deliverable detail route & view     | 8      | MUST     |
| 17.4  | Update DeliverableCard link behavior for studio | 3      | MUST     |
| 17.5  | Empty state, loading polish, motion consistency | 3      | SHOULD   |

**Total**: 29 Story Points

---

## 📦 Dependencies

| Dependency                       | Status  | Notes                                    |
| -------------------------------- | ------- | ---------------------------------------- |
| Epic 6: Deliverables & QC        | ✅ Done | Base deliverable queries, mutations, UI  |
| Epic 16: Revision Workflow       | ✅ Done | Version request schema, review cards     |
| Epic 5A: Project Status Workflow | ✅ Done | Status transitions, actionState model    |
| Admin Deliverable Detail         | ✅ Done | Components to reuse (preview, meta card) |

---

## 🔄 Status Updates

| Date       | Status   | Notes                                                     |
| ---------- | -------- | --------------------------------------------------------- |
| 2026-02-12 | Planning | Epic created from studio deliverables UX analysis session |

---

**Previous Epic**: Epic 16 — Deliverable Revision Workflow  
**Next Epic**: TBD
