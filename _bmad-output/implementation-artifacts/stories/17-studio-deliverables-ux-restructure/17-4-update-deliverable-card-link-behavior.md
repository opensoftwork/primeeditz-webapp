# Story 17-4: Update DeliverableCard Link Behavior for Studio Context

**Epic**: Epic 17 - Studio Deliverables UX & Folder Restructure  
**Status**: backlog  
**Complexity**: Small (3 points)  
**Created**: 2026-02-12  
**Priority**: MUST — Fixes broken navigation from card clicks

---

## 📋 User Story

**As a** studio user,  
**I want** clicking a deliverable card to navigate me to the correct studio detail page,  
**So that** I can view and access my files without getting a 404 error.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                            | Status    | Notes                                                 |
| ------------------------------------- | --------- | ----------------------------------------------------- |
| **17-3 - Studio Detail View**         | Required  | Route and component must exist first                  |
| **Admin `DeliverableCard` component** | ✅ Exists | At `admin/.../deliverables/list/deliverable-card.tsx` |

### Enables

| Story / Epic        | Notes                                           |
| ------------------- | ----------------------------------------------- |
| **End-to-end flow** | Cards → Detail → Back button → Cards (complete) |

### Root Cause Analysis

**The `DeliverableCard` component generates its `href` like this (line 43):**

```typescript
// deliverable-card.tsx line 43:
const cardHref = href || `/projects/${projectId}/deliverables/${id}`;
```

**This default `href` is correct for the studio context** because:

- Studio routes are: `/@studio/projects/[projectId]/deliverables/[deliverableId]`
- Next.js parallel routes resolve `/projects/...` within the `@studio` slot
- The generated relative path `/projects/${projectId}/deliverables/${id}` maps correctly

**So what's actually broken?**

Let's trace the code flow in `deliverables-section.tsx` (lines 147-159):

```tsx
// NON-REVIEW MODE — uses DeliverableCard from admin:
<DeliverableCard
  key={item._id}
  id={item._id}
  projectId={projectId}
  name={item.name}
  version={item.version}
  sizeBytes={item.sizeBytes}
  status={item.status}
  createdAt={item._creationTime}
  uploadedByName="PrimeEditz Team" // ← Bug (fixed in 17-2)
  signedUrl={signedUrls[item.minioKey]}
  // ❌ NO `href` prop → uses default `/projects/${projectId}/deliverables/${id}`
  // ❌ NO `disableLink` prop → defaults to enabled (Link wrapper)
/>
```

**The navigation actually WORKS** with the default href because:

1. Default href = `/projects/${projectId}/deliverables/${id}`
2. Studio parallel route exists at `@studio/projects/[projectId]/deliverables/[deliverableId]/page.tsx`
3. Next.js resolves correctly within the `@studio` slot

**However, REVIEW MODE has no navigation at all (also correct):**

```tsx
// REVIEW MODE — uses DeliverableReviewCard:
<DeliverableReviewCard
  key={item._id}
  deliverable={item}
  projectId={projectId as Id<"projects">}
  signedUrl={signedUrls[item.minioKey]}
/>
```

Review cards don't navigate — they have inline approve/request-version actions instead.

### What DOES Need Fixing

After investigating the actual code, the real issue is more nuanced:

1. **Missing `href` explicitly set** — While the default works NOW, it's fragile. An explicit `href` makes the intent clear and avoids breaking if `DeliverableCard`'s default changes.

2. **Missing link in skeleton/loading state** — The loading skeleton returns static cards with no interactivity.

3. **Non-review mode should have visual navigation affordance** — The card doesn't visually indicate it's clickable in the studio context. The admin card default styling works but the studio could benefit from a clearer "View details" call-to-action.

---

## ✅ Acceptance Criteria

### AC1: Explicit `href` on Non-Review Cards

- [ ] **Given** a deliverable in non-review mode
- [ ] **When** the `DeliverableCard` renders
- [ ] **Then** the `href` prop must explicitly be set to `/projects/${projectId}/deliverables/${item._id}`
- [ ] **And** clicking the card must navigate to the studio deliverable detail page

### AC2: Review Mode Cards — No Navigation

- [ ] **Given** a deliverable in review mode (`actionState === "awaiting_review"`)
- [ ] **When** `DeliverableReviewCard` renders
- [ ] **Then** it must NOT navigate (no link wrapper)
- [ ] **And** inline actions (approve/request version) must still work
- [ ] **And** this behavior must remain unchanged

### AC3: Visual Navigation Affordance

- [ ] **Given** a deliverable card in non-review mode
- [ ] **When** the user hovers over the card
- [ ] **Then** the card must visually indicate it's clickable (hover effect, cursor pointer)
- [ ] **And** optionally, a small "View →" or chevron indicator can appear on hover

### AC4: Navigation Verification

- [ ] **Given** a deliverable card in non-review mode
- [ ] **When** the user clicks on it
- [ ] **Then** the browser must navigate to `/@studio/projects/[projectId]/deliverables/[deliverableId]`
- [ ] **And** the studio deliverable detail page must load correctly
- [ ] **And** the back button on the detail page must return to the project detail page

---

## 📘 Implementation

### Phase A: Set Explicit `href` (~1 point)

#### Task A1: Update `deliverables-section.tsx`

**File**: `src/components/modules/projects/detail/deliverables/deliverables-section.tsx`
_(Post-Story 17-1 path)_

**Current code (lines 147-159):**

```tsx
<DeliverableCard
  key={item._id}
  id={item._id}
  projectId={projectId}
  name={item.name}
  version={item.version}
  sizeBytes={item.sizeBytes}
  status={item.status}
  createdAt={item._creationTime}
  uploadedByName="PrimeEditz Team"
  signedUrl={signedUrls[item.minioKey]}
/>
```

**Updated code:**

```tsx
<DeliverableCard
  key={item._id}
  id={item._id}
  projectId={projectId}
  name={item.name}
  version={item.version}
  sizeBytes={item.sizeBytes}
  status={item.status}
  createdAt={item._creationTime}
  uploadedByName={item.uploadedByName || "PrimeEditz Team"}
  signedUrl={signedUrls[item.minioKey]}
  href={`/projects/${projectId}/deliverables/${item._id}`}
/>
```

**Key changes:**

1. Added explicit `href` prop — makes intent clear, eliminates default-dependency
2. `uploadedByName` already fixed in Story 17-2 — keep the fix here too

- [ ] A1.1 Add explicit `href` prop to `DeliverableCard` in non-review mode
- [ ] A1.2 Verify the generated href matches the studio route

---

### Phase B: Verify Review Mode is Unchanged (~0.5 points)

#### Task B1: Confirm Review Card Isolation

The `DeliverableReviewCard` component (used in review mode) does NOT extend with any link wrapper. It has inline approve/version-request actions. Verify this remains the case.

**Current behavior (from `deliverable-review-card.tsx`):**

- Renders a card with thumbnail, version badge, and approve button
- No `Link` wrapper, no `href` prop
- Actions are inline (approve, open versions dialog)

- [ ] B1.1 Verify `DeliverableReviewCard` has no link/navigation behavior
- [ ] B1.2 Test review mode — card click does NOT navigate
- [ ] B1.3 Test approve action works in review mode
- [ ] B1.4 Test version request action works in review mode

---

### Phase C: Visual Affordance (Optional Enhancement) (~0.5 points)

#### Task C1: Add Hover Indicator for Non-Review Cards

The `DeliverableCard` from admin already has hover effects (line 49):

```tsx
className={cn(
  "group flex flex-col sm:flex-row sm:items-center justify-between transition-all gap-4 cursor-pointer",
  variant === "card"
    ? "p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30"
    : "p-2 rounded-xl border border-transparent hover:bg-white/5",
)}
```

This already includes:

- `cursor-pointer` ✅
- `hover:border-indigo-500/30` ✅
- `group-hover:text-indigo-400` on title (line 66) ✅

**No additional changes needed** — the admin card already has proper hover affordances.

- [ ] C1.1 Verify existing hover effects work in studio context
- [ ] C1.2 Verify `cursor-pointer` shows on hover
- [ ] C1.3 Verify border accent appears on hover

---

### Phase D: End-to-End Navigation Test (~1 point)

#### Task D1: Full Navigation Flow

Test the complete navigation cycle:

```
Project Detail Page
  → Click deliverable card (non-review mode)
    → Studio Deliverable Detail Page loads
      → Verify preview, metadata, download button
      → Click "Back" button
        → Returns to Project Detail Page
```

- [ ] D1.1 Navigate from card to detail page
- [ ] D1.2 Verify detail page loads correctly
- [ ] D1.3 Click back button — returns to project
- [ ] D1.4 Verify breadcrumb shows deliverable name
- [ ] D1.5 Browser back button works
- [ ] D1.6 Direct URL navigation works (`/projects/[id]/deliverables/[did]`)

#### Task D2: Review Mode Isolation

```
Project Detail Page (actionState = "awaiting_review")
  → Click deliverable card (review mode)
    → NO navigation occurs
    → Approve button functional
    → Version request button functional
```

- [ ] D2.1 Click review card — no navigation
- [ ] D2.2 Approve action works
- [ ] D2.3 Version request action works

---

## 🧪 Testing Checklist

### Non-Review Mode

- [ ] Card renders with link wrapper
- [ ] Card click navigates to `/projects/[id]/deliverables/[did]`
- [ ] Hover shows cursor-pointer and border accent
- [ ] Title highlights on hover (indigo-400)
- [ ] Signed URL thumbnail renders in card

### Review Mode

- [ ] Card renders WITHOUT link wrapper
- [ ] Card click does NOT navigate
- [ ] Approve button works
- [ ] Version request button works

### Navigation

- [ ] Back button on detail page works
- [ ] Browser back button works
- [ ] Breadcrumb shows deliverable name on detail page
- [ ] Direct URL loads correctly

---

## 🚀 Definition of Done

- [ ] Explicit `href` set on non-review mode `DeliverableCard`
- [ ] Review mode remains unchanged (no navigation)
- [ ] Full navigation flow tested (card → detail → back)
- [ ] Hover affordances verified
- [ ] `pnpm build` passes

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-12 | backlog | Story created |

---

**Previous Story**: 17-3 - Create Studio Deliverable Detail View  
**Next Story**: 17-5 - Empty State, Loading Polish, and Motion Consistency
