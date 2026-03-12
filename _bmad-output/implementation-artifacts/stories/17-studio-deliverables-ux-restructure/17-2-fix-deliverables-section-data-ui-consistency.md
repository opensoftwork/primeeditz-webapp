# Story 17-2: Fix Deliverables Section Data Issues & UI Consistency

**Epic**: Epic 17 - Studio Deliverables UX & Folder Restructure  
**Status**: review  
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
| **17-1 - Folder Restructure**              | ✅ Done   | File will be at new path after restructure |
| **`shared.tsx` `DetailSection` component** | ✅ Exists | Lines 11-47 of `shared.tsx`                |
| **`StatusBadge` component**                | ✅ Exists | Lines 101-151 of `shared.tsx`              |

### Enables

| Story / Epic      | Notes                              |
| ----------------- | ---------------------------------- |
| **17-5 - Polish** | Builds on consistent UI foundation |

---

## ✅ Acceptance Criteria

### AC1: Fix `uploadedByName` Placeholder

- [x] **Given** a deliverable with actual `uploadedByName` data from the query
- [x] **When** the `DeliverableCard` renders
- [x] **Then** it must show `item.uploadedByName` (the real value)
- [x] **And** fall back to `"PrimeEditz Team"` only when the field is `null`, `undefined`, or empty string

### AC2: Contextual Status Badge

- [x] **Given** the deliverables section header
- [x] **When** `actionState` is `"awaiting_review"`
- [x] **Then** the badge must show **"AWAITING REVIEW"** in amber styling
- [x] **When** `actionState` is `"review_approved"`
- [x] **Then** the badge must show **"APPROVED"** in emerald styling
- [x] **When** `actionState` is any other value or undefined
- [x] **Then** the badge must show **"DELIVERED"** in indigo styling

### AC3: `DetailSection` Wrapper

- [x] **Given** the deliverables section
- [x] **When** it renders
- [x] **Then** it must use the shared `DetailSection` component from `../shared`
- [x] **And** the `title` must be `"Final Deliverables"`
- [x] **And** the `icon` must be `<ShieldCheck className="h-5 w-5" />`
- [x] **And** the `noContainer` prop must be `true` (cards manage their own padding)
- [x] **And** the contextual status badge must be passed as the `action` prop

### AC4: Summary Stats Row

- [x] **Given** the deliverables section with loaded deliverables
- [x] **When** it renders
- [x] **Then** a compact stats row must show `{approved}/{total} Approved` in emerald accent
- [x] **And** if `versionCount > 0`, show `{versionCount} Version Requests` in amber accent
- [x] **And** the stats row must use the project's established micro-label style

### AC5: Contextual Info Banner Text

- [x] **Given** the info banner within the deliverables section
- [x] **When** `actionState` is `"awaiting_review"` (review mode)
- [x] **Then** instructions must say: "Please review each deliverable individually. You can approve them one by one or request changes if needed."
- [x] **When** `actionState` is NOT `"awaiting_review"` (non-review mode)
- [x] **Then** instructions must say: "Review your deliverables below. You can preview them directly in your browser or download them for offline review."

---

## 📘 Implementation

### Phase A: Fix Data Issues (~1 point)

#### Task A1: Fix `uploadedByName`

**File**: `src/components/modules/projects/detail/deliverables/deliverables-section.tsx`  
_(After Story 17-1 moves it)_

- [x] A1.1 Replace hardcoded `uploadedByName` with actual data
- [x] A1.2 Verify the query returns `uploadedByName` field
- [x] A1.3 Update `getClientDeliverables` query to include `uploadedByName` by joining with profiles table

---

### Phase B: Fix Status Badge (~1 point)

#### Task B1: Replace Hardcoded Badge with Contextual Badge

- [x] B1.1 Create `getStatusBadge()` helper function
- [x] B1.2 Remove hardcoded "QC APPROVED" badge from header
- [x] B1.3 Pass badge as `action` prop to `DetailSection`

---

### Phase C: Wrap with `DetailSection` (~1.5 points)

#### Task C1: Replace Custom Header with `DetailSection`

- [x] C1.1 Add `import { DetailSection } from "../shared"`
- [x] C1.2 Remove custom `<h2>` + `<p>` header block (lines 91-103)
- [x] C1.3 Wrap content in `<DetailSection>` with correct props
- [x] C1.4 Use `noContainer` since cards manage their own styling
- [x] C1.5 Pass status badge + count as `action` prop

---

### Phase D: Add Summary Stats (~1 point)

#### Task D1: Compute Approved Count

- [x] D1.1 Add `approvedCount` computation

#### Task D2: Add Stats Row JSX

- [x] D2.1 Add stats row with approved count
- [x] D2.2 Conditionally show version count

---

### Phase E: Verify (~0.5 points)

- [x] E1.1 Run `pnpm build` — must pass ✅
- [x] E1.2 Navigate to studio project detail with deliverables → section renders with `DetailSection` wrapper
- [x] E1.3 Verify `uploadedByName` shows actual value from data
- [x] E1.4 Check project with `actionState: "awaiting_review"` → badge shows "AWAITING REVIEW" (amber)
- [x] E1.5 Check project with `actionState: "review_approved"` → badge shows "APPROVED" (emerald)
- [x] E1.6 Check project with other `actionState` → badge shows "DELIVERED" (indigo)
- [x] E1.7 Verify stats row shows correct `X/Y Approved` count
- [x] E1.8 Verify version count shows when `versionCount > 0`
- [x] E1.9 Verify review mode and non-review mode both render correctly

---

## 🧪 Testing Checklist

### Data Accuracy

- [x] `uploadedByName` shows actual value, not "PrimeEditz Team"
- [x] Fallback to "PrimeEditz Team" works when field is null/undefined

### Visual Consistency

- [x] Header matches other sections using `DetailSection`
- [x] Icon (ShieldCheck) renders in primary accent container
- [x] Title uses `text-[11px] font-black uppercase tracking-[0.4em]` (from `DetailSection`)
- [x] Stats row aligns with section and uses established micro-label pattern

### Status Badge

- [x] "AWAITING REVIEW" badge shows in amber for `awaiting_review` state
- [x] "APPROVED" badge shows in emerald for `review_approved` state
- [x] "DELIVERED" badge shows in indigo for other states
- [x] Badge styling uses `rounded-full text-[9px] tracking-[0.2em] font-black`

---

## 🚀 Definition of Done

- [x] `uploadedByName` shows actual data with fallback
- [x] Status badge contextual (3 states verified)
- [x] `DetailSection` wrapper applied with correct props
- [x] Stats row showing approved count and version count
- [x] Info banner text contextual based on `actionState`
- [x] `pnpm build` passes
- [x] Visual consistency with other sections confirmed

---

## 📁 File List

### Modified Files
- `src/components/modules/projects/detail/deliverables/deliverables-section.tsx` (complete rewrite with DetailSection, contextual badge, stats row, empty state, loading skeleton, staggered animations)
- `convex/functions/deliverables/queries.ts` (added `uploadedByName` to `getClientDeliverables` query)

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-12 | backlog | Story created |
| 2026-02-13 | review  | Implementation complete, all ACs satisfied |

---

**Previous Story**: 17-1 - Reorganize Project Detail Folder Structure  
**Next Story**: 17-3 - Create Studio Deliverable Detail View
