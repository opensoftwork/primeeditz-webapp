# Story 21-3: Promote VersionStatusBadge to Shared

**Epic**: Epic 21 - Deliverable Code Deduplication & UI Consistency
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-02-15
**Priority**: MUST — UI consistency foundation; status badges are the most visible inconsistency

---

## 📋 User Story

**As a** user viewing version requests across admin, studio, or employee portals,
**I want** consistent status badges (colors, icons, labels) for pending/in_progress/resolved states,
**So that** I immediately understand the status without learning different visual languages per portal.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On | Status  | Notes                                                      |
| ---------- | ------- | ---------------------------------------------------------- |
| **21-1**   | backlog | Uses `VERSION_REQUEST_STATUS_CONFIG` from shared constants |

### Enables

| Story / Epic | Notes                                                        |
| ------------ | ------------------------------------------------------------ |
| **21-4**     | Unified VersionRequestsList will use this badge              |
| **21-8**     | UI consistency pass references this as the canonical pattern |

### Current Duplication

Status badge rendering is currently implemented in 4 separate locations:

1. **`studio/versions-status-tracker.tsx`** (55 lines) — ✅ Best implementation, uses `Badge` component
2. **`admin/version-request-detail-view.tsx`** (~25 lines) — Inline `statusConfig` object + manual `Badge`
3. **`admin/version-requests-list.tsx`** (~25 lines) — Inline conditional `cn()` classes + manual `div`
4. **`employee/version-requests-list.tsx`** (~25 lines) — Identical to admin version

---

## ✅ Acceptance Criteria

### AC1: Shared Component Created

- [ ] **Given** `src/components/shared/deliverables/version-status-badge.tsx`
- [ ] **Then** it exports a `VersionStatusBadge` component
- [ ] **And** it accepts `status: VersionRequestStatus` and optional `className?: string`
- [ ] **And** it renders the same `Badge` variant="outline" pattern as the existing studio tracker

### AC2: Uses Shared Constants

- [ ] **Given** the `VersionStatusBadge` component
- [ ] **Then** it imports `VERSION_REQUEST_STATUS_CONFIG` from `./constants`
- [ ] **And** does NOT define its own color/icon mappings inline

### AC3: Existing Implementations Replaced

- [ ] **Given** `studio/versions-status-tracker.tsx`
- [ ] **Then** it is replaced with a re-export from shared (or deleted and imports updated)

- [ ] **Given** `admin/version-request-detail-view.tsx`
- [ ] **Then** the inline `statusConfig` object is removed
- [ ] **And** `VersionStatusBadge` is used instead

- [ ] **Given** `admin/version-requests-list.tsx` status column cell
- [ ] **Then** the inline conditional rendering is replaced with `VersionStatusBadge`

- [ ] **Given** `employee/version-requests-list.tsx` status column cell
- [ ] **Then** the inline conditional rendering is replaced with `VersionStatusBadge`

### AC4: Visual Parity

- [ ] **Given** all four locations
- [ ] **Then** the status badges render with identical colors, icons, and typography

### AC5: Build Passes

- [ ] **Given** all changes
- [ ] **When** I run `pnpm build`
- [ ] **Then** zero errors

---

## 📘 Implementation

### Phase A: Create Shared Badge (~1 point)

#### Task A1: Create `VersionStatusBadge`

**File**: `src/components/shared/deliverables/version-status-badge.tsx`

- [ ] A1.1 Create component using `Badge` from `@/components/ui/badge`
- [ ] A1.2 Import `VERSION_REQUEST_STATUS_CONFIG` from `./constants`
- [ ] A1.3 Map status to config → render `Badge` with icon, label, and classes
- [ ] A1.4 Support `className` override for sizing in different contexts (table cells vs detail views)
- [ ] A1.5 Handle `undefined` status gracefully (return null)

#### Task A2: Export from barrel

- [ ] A2.1 Add `VersionStatusBadge` export to `index.ts`

### Phase B: Replace Existing Implementations (~1 point)

#### Task B1: Update `studio/versions-status-tracker.tsx`

- [ ] B1.1 Option A: Convert to re-export: `export { VersionStatusBadge as VersionStatusTracker } from "@/components/shared/deliverables"`
- [ ] B1.2 Option B: Update all imports to use shared directly (preferred if few consumers)

#### Task B2: Update `admin/version-request-detail-view.tsx`

- [ ] B2.1 Remove inline `statusConfig` object (~lines 203-228)
- [ ] B2.2 Import and use `VersionStatusBadge` component
- [ ] B2.3 Remove now-unused status icon imports (if applicable)

#### Task B3: Update `admin/version-requests-list.tsx`

- [ ] B3.1 Replace status column `cell` function with `<VersionStatusBadge status={row.original.status} />`
- [ ] B3.2 Remove inline conditional `cn()` classes

#### Task B4: Update `employee/version-requests-list.tsx`

- [ ] B4.1 Replace status column `cell` function with `<VersionStatusBadge status={row.original.status} />`
- [ ] B4.2 Remove inline conditional `cn()` classes

#### Task B5: Update `studio/deliverable-review-card.tsx`

- [ ] B5.1 Verify it already imports from `versions-status-tracker.tsx` — update import path if B1 changes it

#### Task B6: Verify build

- [ ] B6.1 Run `pnpm build` — confirm zero errors

---

## 🧪 Testing Checklist

### Visual Regression

- [ ] Admin version requests list — status column badges render correctly
- [ ] Admin version request detail — header status badge renders correctly
- [ ] Employee version requests list — status column badges render correctly
- [ ] Studio deliverable review card — status tracker renders correctly
- [ ] All statuses tested: pending (amber), in_progress (blue), resolved (emerald)

### Edge Cases

- [ ] Undefined status → returns null (no crash)
- [ ] Custom className applied → overrides sizing appropriately

---

## 🚀 Definition of Done

- [ ] `VersionStatusBadge` shared component created
- [ ] All 4 inline status badge implementations replaced
- [ ] Visual parity confirmed across all portals
- [ ] `pnpm build` passes with zero errors
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-15 | backlog | Story created |

---

**Previous Story**: 21-2 - Signed URL Custom Hooks
**Next Story**: 21-4 - Unify VersionRequestsList Component
