
# Story 17-5: Empty State, Loading Polish, and Motion Consistency

**Epic**: Epic 17 - Studio Deliverables UX & Folder Restructure  
**Status**: backlog  
**Complexity**: Small (3 points)  
**Created**: 2026-02-12  
**Priority**: SHOULD — Polish and consistency

---

## 📋 User Story

**As a** studio user,  
**I want** the deliverables section to have polished empty states, loading skeletons, and smooth animations,  
**So that** every state of the UI feels intentional and premium.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                    | Status   | Notes                            |
| ----------------------------- | -------- | -------------------------------- |
| **17-1 - Folder Restructure** | Required | Files in organized location      |
| **17-2 - Data Fixes & UI**    | Required | `DetailSection` wrapper in place |

### Pattern References

**Empty State — Used in admin deliverables list:**

```
src/components/modules/admin/projects/project-detail/deliverables/list/deliverables-list.tsx
```

Lines 244-268 show the admin empty state:

```tsx
// Admin pattern: Full-width empty state with icon, heading, and description
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
    <FileIcon className="h-7 w-7 text-white/20" />
  </div>
  <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">
    No Deliverables Yet
  </h3>
  <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest max-w-md">
    Approved deliverables will appear here once uploaded
  </p>
</div>
```

**Loading Skeleton — Used in `reference-materials.tsx` (lines 9-20):**

```tsx
<div className="space-y-6">
  <Skeleton className="h-12 w-48 rounded-2xl bg-white/5" />
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />
    ))}
  </div>
</div>
```

**Motion — Used in `project-detail-view.tsx` (lines 104-110):**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
  // Staggered entrance: each card delayed by 0.1s * index
>
```

---

## ✅ Acceptance Criteria

### AC1: Styled Empty State

- [ ] **Given** a project with zero deliverables
- [ ] **When** the `DeliverablesSection` component renders
- [ ] **Then** it must show a styled empty state (not `null`)
- [ ] **And** the empty state must include:
  - A large icon in a circular/rounded container
  - A heading: "No Deliverables Yet"
  - A description: "Your finalized media files will appear here once uploaded and approved"
  - The whole block must be centered within its container

### AC2: Enhanced Loading Skeleton

- [ ] **Given** the deliverables data is loading (`deliverables === undefined`)
- [ ] **When** the skeleton renders
- [ ] **Then** it must match the `DetailSection` shape:
  - Section header skeleton (icon placeholder + title bar)
  - 2-3 card skeletons in a grid matching the actual card layout
  - Use `bg-white/5` and `rounded-2xl` (project convention)
- [ ] **And** the skeleton must NOT be a simple rectangle

### AC3: Staggered Card Animations

- [ ] **Given** the deliverables have loaded
- [ ] **When** the cards render
- [ ] **Then** each card must animate in with a staggered delay:
  - `initial={{ opacity: 0, y: 20 }}`
  - `animate={{ opacity: 1, y: 0 }}`
  - `transition={{ delay: index * 0.1 }}`
- [ ] **And** the stagger must apply to BOTH review cards and non-review cards

### AC4: Loading State on Detail Page

- [ ] **Given** the studio deliverable detail page skeleton (from Story 17-3)
- [ ] **When** it renders
- [ ] **Then** it must include a pulsing animation (`animate-pulse`)
- [ ] **And** the shape must match the detail layout (header + preview + sidebar)

---

## 📘 Implementation

### Phase A: Styled Empty State (~1 point)

#### Task A1: Replace `return null` with Styled Empty State

**File**: `src/components/modules/projects/detail/deliverables/deliverables-section.tsx`

**Current code (lines 78-80):**

```tsx
if (deliverables.length === 0) {
  return null;
}
```

**Replace with:**

```tsx
if (deliverables.length === 0) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <DetailSection
        title="Final Deliverables"
        icon={<ShieldCheck className="h-5 w-5" />}
        noContainer
      >
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl bg-white/3 border border-white/5">
          <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <ShieldCheck className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">
            No Deliverables Yet
          </h3>
          <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest max-w-md leading-relaxed">
            Your finalized media files will appear here once uploaded and
            approved by the quality control team
          </p>
        </div>
      </DetailSection>
    </motion.div>
  );
}
```

**Why not `return null`:** Returning null creates a jarring gap in the page layout where a section should be. Other sections (like Specifications, Reference Materials) always show their container shape even when empty. The deliverables section should be consistent.

- [ ] A1.1 Replace `return null` with styled empty state
- [ ] A1.2 Wrap in `DetailSection` for consistent header
- [ ] A1.3 Use centered icon + heading + description pattern
- [ ] A1.4 Match bg/border styling (`bg-white/3 border-white/5 rounded-3xl`)

---

### Phase B: Enhanced Loading Skeleton (~1 point)

#### Task B1: Upgrade Skeleton to Match Layout

**File**: `src/components/modules/projects/detail/deliverables/deliverables-section.tsx`

**Current skeleton (lines 69-76):**

```tsx
if (deliverables === undefined) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full rounded-2xl bg-white/5" />
      <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
    </div>
  );
}
```

**Replace with:**

```tsx
if (deliverables === undefined) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Section Header Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
        <Skeleton className="h-3 w-36 rounded bg-white/5" />
      </div>

      {/* Stats Row Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-28 rounded bg-white/5" />
        <Skeleton className="h-3 w-36 rounded bg-white/5" />
      </div>

      {/* Card Skeletons */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/5"
          >
            <Skeleton className="h-12 w-12 rounded-xl bg-white/5 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 rounded bg-white/5" />
              <Skeleton className="h-3 w-32 rounded bg-white/5" />
            </div>
            <div className="text-right">
              <Skeleton className="h-3 w-20 rounded bg-white/5 mb-2" />
              <Skeleton className="h-3 w-16 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Design rationale:**

- The skeleton mimics the exact layout of the actual content: header (icon + title), stats row, then cards.
- Each "card skeleton" matches the `DeliverableCard` structure: thumbnail placeholder (left), title + meta (center), submitter info (right).
- `animate-pulse` applied to the container for the standard shimmer effect.
- 3 skeleton cards is a reasonable preview without being excessive.

- [ ] B1.1 Replace simple skeleton with layout-matching skeleton
- [ ] B1.2 Include header skeleton (icon + title shape)
- [ ] B1.3 Include stats row skeleton
- [ ] B1.4 Include 3 card skeletons matching `DeliverableCard` layout
- [ ] B1.5 Use `animate-pulse` on container

---

### Phase C: Staggered Card Animations (~0.5 points)

#### Task C1: Wrap Cards with Motion Stagger

**File**: `src/components/modules/projects/detail/deliverables/deliverables-section.tsx`

**Current card rendering (lines 139-161):**

```tsx
{deliverables.map((item) =>
  isReviewMode ? (
    <DeliverableReviewCard key={item._id} ... />
  ) : (
    <DeliverableCard key={item._id} ... />
  ),
)}
```

**Wrap each card with stagger:**

```tsx
{
  deliverables.map((item, index) =>
    isReviewMode ? (
      <motion.div
        key={item._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
      >
        <DeliverableReviewCard
          deliverable={item}
          projectId={projectId as Id<"projects">}
          signedUrl={signedUrls[item.minioKey]}
        />
      </motion.div>
    ) : (
      <motion.div
        key={item._id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
      >
        <DeliverableCard
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
      </motion.div>
    ),
  );
}
```

**Animation values:**

- Review cards: `y: 20` / delay `0.08s` per card (larger cards, more prominent entrance)
- Non-review cards: `y: 12` / delay `0.06s` per card (list items, subtler entrance)
- Both use `opacity: 0` → `opacity: 1` for fade-in

> **Note**: The `motion.div` wrapper can't replace the `DeliverableCard` root element (it's a `Link` component), so we wrap it externally. This is the same pattern used in `project-detail-view.tsx` for staggering sections.

- [ ] C1.1 Wrap review cards with `motion.div` and stagger
- [ ] C1.2 Wrap non-review cards with `motion.div` and stagger
- [ ] C1.3 Use `index` for stagger delay calculation

---

### Phase D: Verify and Polish (~0.5 points)

- [ ] D1.1 Run `pnpm build` — must pass
- [ ] D1.2 Navigate to project with zero deliverables → empty state shows
- [ ] D1.3 Navigate to project with deliverables loading → skeleton shows
- [ ] D1.4 Navigate to project with loaded deliverables → cards animate in sequence
- [ ] D1.5 Navigate in review mode → review cards animate in sequence
- [ ] D1.6 Verify animations feel natural (not too fast, not too slow)
- [ ] D1.7 Test with 1 deliverable → single card, no stagger needed
- [ ] D1.8 Test with 10+ deliverables → stagger is noticeable but not excessive

---

## 🧪 Testing Checklist

### Empty State

- [ ] Shows for project with 0 deliverables
- [ ] Uses `DetailSection` wrapper with icon and title
- [ ] Centered icon, heading, description
- [ ] Styling matches (`bg-white/3`, `border-white/5`, `rounded-3xl`)
- [ ] Does NOT return `null` (always renders something)

### Loading Skeleton

- [ ] Shows while `deliverables === undefined`
- [ ] Header skeleton matches icon + title layout
- [ ] Card skeletons match `DeliverableCard` layout
- [ ] `animate-pulse` creates shimmer effect
- [ ] Transitions smoothly to actual content

### Card Animations

- [ ] Review cards stagger with 80ms delay per card
- [ ] Non-review cards stagger with 60ms delay per card
- [ ] Fade-in + slide-up animation on each card
- [ ] Smooth and not janky
- [ ] Works with 1 card, 3 cards, and 10+ cards

---

## 🚀 Definition of Done

- [ ] Empty state renders for 0 deliverables (not `null`)
- [ ] Loading skeleton matches actual layout shape
- [ ] Card animations staggered with `motion.div`
- [ ] All three states feel polished and intentional
- [ ] Visual consistency with reference materials / specs sections
- [ ] `pnpm build` passes

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-12 | backlog | Story created |

---

**Previous Story**: 17-4 - Update DeliverableCard Link Behavior for Studio Context  
**Next Story**: N/A (Last story in Epic 17)
