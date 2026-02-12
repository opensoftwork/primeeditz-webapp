# Story 17-2: Fix Deliverables Section Data Issues & UI Consistency

**Epic**: Epic 17 - Studio Deliverables UX & Folder Restructure  
**Status**: backlog  
**Complexity**: Medium (5 points)  
**Created**: 2026-02-12  
**Priority**: MUST — Fixes incorrect data display and visual inconsistency

---

## 📋 User Story

**As a** studio user,  
**I want** the deliverables section to show accurate data and match the visual pattern of other sections on the page,  
**So that** I see correct information and have a consistent experience.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                                 | Status    | Notes                                      |
| ------------------------------------------ | --------- | ------------------------------------------ |
| **17-1 - Folder Restructure**              | Required  | File will be at new path after restructure |
| **`shared.tsx` `DetailSection` component** | ✅ Exists | Lines 11-47 of `shared.tsx`                |
| **`StatusBadge` component**                | ✅ Exists | Lines 101-151 of `shared.tsx`              |

### Enables

| Story / Epic      | Notes                              |
| ----------------- | ---------------------------------- |
| **17-5 - Polish** | Builds on consistent UI foundation |

### Current Problems

```
PROBLEM 1 — Hardcoded uploadedByName (Line 157):
┌──────────────────────────────────────────────────────────┐
│  uploadedByName="PrimeEditz Team"   ← ALWAYS this string │
│                                                           │
│  SHOULD BE:                                               │
│  uploadedByName={item.uploadedByName || "PrimeEditz Team"}│
└──────────────────────────────────────────────────────────┘

PROBLEM 2 — Hardcoded "QC APPROVED" badge (Lines 95-97):
┌──────────────────────────────────────────────────────────┐
│  <span className="...bg-emerald-500/10...">              │
│    QC APPROVED                  ← ALWAYS green, always   │
│  </span>                           this label            │
│                                                           │
│  SHOULD BE: Contextual based on actionState              │
│  awaiting_review → "AWAITING REVIEW" (amber)             │
│  review_approved → "APPROVED" (emerald)                  │
│  Other → "DELIVERED" (indigo) or no badge                │
└──────────────────────────────────────────────────────────┘

PROBLEM 3 — Missing DetailSection wrapper (Lines 91-103):
┌──────────────────────────────────────────────────────────┐
│  Current: Raw <h2> + <p> + <div>                         │
│                                                           │
│  Every other section uses:                                │
│  <DetailSection title="..." icon={...}>                  │
│    children                                               │
│  </DetailSection>                                         │
│                                                           │
│  Used by: ProjectSpecifications, ReferenceMaterials,     │
│  AssignedWorkDeliverables, AssetsSection                  │
└──────────────────────────────────────────────────────────┘

PROBLEM 4 — No summary stats:
┌──────────────────────────────────────────────────────────┐
│  Admin has: 3-column stats (Pending QC, Versions, Ready) │
│  Studio has: Nothing — just a static info banner         │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Fix `uploadedByName` Placeholder

- [ ] **Given** a deliverable with actual `uploadedByName` data from the query
- [ ] **When** the `DeliverableCard` renders
- [ ] **Then** it must show `item.uploadedByName` (the real value)
- [ ] **And** fall back to `"PrimeEditz Team"` only when the field is `null`, `undefined`, or empty string

### AC2: Contextual Status Badge

- [ ] **Given** the deliverables section header
- [ ] **When** `actionState` is `"awaiting_review"`
- [ ] **Then** the badge must show **"AWAITING REVIEW"** in amber styling
- [ ] **When** `actionState` is `"review_approved"`
- [ ] **Then** the badge must show **"APPROVED"** in emerald styling
- [ ] **When** `actionState` is any other value or undefined
- [ ] **Then** the badge must show **"DELIVERED"** in indigo styling

### AC3: `DetailSection` Wrapper

- [ ] **Given** the deliverables section
- [ ] **When** it renders
- [ ] **Then** it must use the shared `DetailSection` component from `../shared`
- [ ] **And** the `title` must be `"Final Deliverables"`
- [ ] **And** the `icon` must be `<ShieldCheck className="h-5 w-5" />`
- [ ] **And** the `noContainer` prop must be `true` (cards manage their own padding)
- [ ] **And** the contextual status badge must be passed as the `action` prop

### AC4: Summary Stats Row

- [ ] **Given** the deliverables section with loaded deliverables
- [ ] **When** it renders
- [ ] **Then** a compact stats row must show `{approved}/{total} Approved` in emerald accent
- [ ] **And** if `versionCount > 0`, show `{versionCount} Version Requests` in amber accent
- [ ] **And** the stats row must use the project's established micro-label style

### AC5: Contextual Info Banner Text

- [ ] **Given** the info banner within the deliverables section
- [ ] **When** `actionState` is `"awaiting_review"` (review mode)
- [ ] **Then** instructions must say: "Please review each deliverable individually. You can approve them one by one or request changes if needed."
- [ ] **When** `actionState` is NOT `"awaiting_review"` (non-review mode)
- [ ] **Then** instructions must say: "Review your deliverables below. You can preview them directly in your browser or download them for offline review."

---

## 📘 Implementation

### Phase A: Fix Data Issues (~1 point)

#### Task A1: Fix `uploadedByName`

**File**: `src/components/modules/projects/detail/deliverables/deliverables-section.tsx`  
_(After Story 17-1 moves it)_

**Current code (line 157):**

```typescript
uploadedByName = "PrimeEditz Team";
```

**Fix:**

```typescript
uploadedByName={item.uploadedByName || "PrimeEditz Team"}
```

> **Note**: The `getClientDeliverables` query returns deliverables with `uploadedByName` populated. Check the query at `convex/functions/deliverables/queries.ts` to verify the field is included in the response. If it's not, the query needs to be updated to join with the `profiles` table.

- [ ] A1.1 Replace hardcoded `uploadedByName` with actual data
- [ ] A1.2 Verify the query returns `uploadedByName` field
- [ ] A1.3 If query doesn't return it, update `getClientDeliverables` to include it

---

### Phase B: Fix Status Badge (~1 point)

#### Task B1: Replace Hardcoded Badge with Contextual Badge

**Current code (lines 93-98):**

```tsx
<h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
  Final Deliverables
  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] tracking-[0.2em] font-black uppercase">
    QC APPROVED
  </span>
</h2>
```

**Replace with contextual status:**

```tsx
// Add a helper function inside the component (or above the return)
const getStatusBadge = () => {
  if (actionState === "awaiting_review") {
    return {
      label: "AWAITING REVIEW",
      className: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    };
  }
  if (actionState === "review_approved") {
    return {
      label: "APPROVED",
      className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    };
  }
  return {
    label: "DELIVERED",
    className: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  };
};

const statusBadge = getStatusBadge();
```

**Badge JSX (used in `DetailSection` `action` prop):**

```tsx
<span
  className={cn(
    "px-3 py-1 rounded-full text-[9px] tracking-[0.2em] font-black uppercase border",
    statusBadge.className,
  )}
>
  {statusBadge.label}
</span>
```

- [ ] B1.1 Create `getStatusBadge()` helper function
- [ ] B1.2 Remove hardcoded "QC APPROVED" badge from header
- [ ] B1.3 Pass badge as `action` prop to `DetailSection`

---

### Phase C: Wrap with `DetailSection` (~1.5 points)

#### Task C1: Replace Custom Header with `DetailSection`

**Current structure (lines 84-163):**

```tsx
<motion.div className="space-y-8">
  {/* Custom header with raw <h2> */}
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
        Final Deliverables
        <span>QC APPROVED</span>
      </h2>
      <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">
        Review and approve your finalized media files
      </p>
    </div>
  </div>

  {/* Info Banner */}
  {/* Cards Grid */}
</motion.div>
```

**Replace with `DetailSection`:**

```tsx
import { DetailSection } from "../shared";

// ... inside the component:

const approvedCount = deliverables.filter((d) => d.status === "approved").length;
const statusBadge = getStatusBadge();

return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-0"
  >
    <DetailSection
      title="Final Deliverables"
      icon={<ShieldCheck className="h-5 w-5" />}
      noContainer
      action={
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
            {deliverables.length} Deliverables
          </span>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[9px] tracking-[0.2em] font-black uppercase border",
              statusBadge.className
            )}
          >
            {statusBadge.label}
          </span>
        </div>
      }
    >
      {/* Stats Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
            {approvedCount}/{deliverables.length} Approved
          </span>
        </div>
        {versionCount && versionCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/60">
              {versionCount} Version Request{versionCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Info Banner (keep existing) */}
      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4 mb-6">
        {/* ... existing info banner content ... */}
      </div>

      {/* Approval Progress Banner (keep existing) */}
      {isReviewMode && (
        <ApprovalProgressBanner ... />
      )}

      {/* Cards Grid (keep existing) */}
      <div className={cn("grid gap-6", ...)}>
        {deliverables.map((item) => ...)}
      </div>
    </DetailSection>
  </motion.div>
);
```

**Key import to add:**

```typescript
import { DetailSection } from "../shared";
// Note: "../shared" because after Story 17-1, this file is in deliverables/ subfolder
```

- [ ] C1.1 Add `import { DetailSection } from "../shared"`
- [ ] C1.2 Remove custom `<h2>` + `<p>` header block (lines 91-103)
- [ ] C1.3 Wrap content in `<DetailSection>` with correct props
- [ ] C1.4 Use `noContainer` since cards manage their own styling
- [ ] C1.5 Pass status badge + count as `action` prop

---

### Phase D: Add Summary Stats (~1 point)

#### Task D1: Compute Approved Count

Add computation inside the component, before the return:

```typescript
const approvedCount = deliverables.filter(
  (d) => d.status === "approved",
).length;
```

- [ ] D1.1 Add `approvedCount` computation

#### Task D2: Add Stats Row JSX

Insert between `DetailSection` wrapper and info banner:

```tsx
<div className="flex flex-wrap items-center gap-4 mb-6 mt-2">
  <div className="flex items-center gap-2">
    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
      {approvedCount}/{deliverables.length} Approved
    </span>
  </div>
  {versionCount != null && versionCount > 0 && (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/60">
        {versionCount} Version Request{versionCount > 1 ? "s" : ""}
      </span>
    </div>
  )}
</div>
```

**Styling rationale:**

- `text-[10px] font-black uppercase tracking-widest` — matches the project's micro-label convention used in sidebar items, meta cards, and stats labels across admin and studio views.
- `w-1.5 h-1.5 rounded-full bg-emerald-500` — small dot indicator matching the status dots used in `StatusBadge` component.
- `animate-pulse` on amber dot — draws attention to active version requests.

- [ ] D2.1 Add stats row with approved count
- [ ] D2.2 Conditionally show version count

---

### Phase E: Verify (~0.5 points)

- [ ] E1.1 Run `pnpm build` — must pass
- [ ] E1.2 Navigate to studio project detail with deliverables → section renders with `DetailSection` wrapper
- [ ] E1.3 Verify `uploadedByName` shows actual value from data
- [ ] E1.4 Check project with `actionState: "awaiting_review"` → badge shows "AWAITING REVIEW" (amber)
- [ ] E1.5 Check project with `actionState: "review_approved"` → badge shows "APPROVED" (emerald)
- [ ] E1.6 Check project with other `actionState` → badge shows "DELIVERED" (indigo)
- [ ] E1.7 Verify stats row shows correct `X/Y Approved` count
- [ ] E1.8 Verify version count shows when `versionCount > 0`
- [ ] E1.9 Verify review mode and non-review mode both render correctly

---

## 🧪 Testing Checklist

### Data Accuracy

- [ ] `uploadedByName` shows actual value, not "PrimeEditz Team"
- [ ] Fallback to "PrimeEditz Team" works when field is null/undefined

### Visual Consistency

- [ ] Header matches other sections using `DetailSection`
- [ ] Icon (ShieldCheck) renders in primary accent container
- [ ] Title uses `text-[11px] font-black uppercase tracking-[0.4em]` (from `DetailSection`)
- [ ] Stats row aligns with section and uses established micro-label pattern

### Status Badge

- [ ] "AWAITING REVIEW" badge shows in amber for `awaiting_review` state
- [ ] "APPROVED" badge shows in emerald for `review_approved` state
- [ ] "DELIVERED" badge shows in indigo for other states
- [ ] Badge styling uses `rounded-full text-[9px] tracking-[0.2em] font-black`

---

## 🚀 Definition of Done

- [ ] `uploadedByName` shows actual data with fallback
- [ ] Status badge contextual (3 states verified)
- [ ] `DetailSection` wrapper applied with correct props
- [ ] Stats row showing approved count and version count
- [ ] Info banner text contextual based on `actionState`
- [ ] `pnpm build` passes
- [ ] Visual consistency with other sections confirmed

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-12 | backlog | Story created |

---

**Previous Story**: 17-1 - Reorganize Project Detail Folder Structure  
**Next Story**: 17-3 - Create Studio Deliverable Detail View
