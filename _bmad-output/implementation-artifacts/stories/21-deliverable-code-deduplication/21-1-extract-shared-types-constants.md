# Story 21-1: Extract Shared Types & Constants

**Epic**: Epic 21 - Deliverable Code Deduplication & UI Consistency
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-02-15
**Priority**: MUST — Foundation for all other stories in this epic

---

## 📋 User Story

**As a** developer maintaining the PrimeEditz codebase,
**I want** all deliverable/version/request types and status constants defined in a single shared location,
**So that** I can avoid inline type duplication and ensure consistency when the data model evolves.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On | Status | Notes                        |
| ---------- | ------ | ---------------------------- |
| None       | N/A    | This is the foundation story |

### Enables

| Story / Epic              | Notes                                                          |
| ------------------------- | -------------------------------------------------------------- |
| **21-2** through **21-8** | All stories import from the shared types location created here |

---

## ✅ Acceptance Criteria

### AC1: Shared Types File Created

- [ ] **Given** the project structure
- [ ] **When** I look at `src/components/shared/deliverables/types.ts`
- [ ] **Then** it exports `VersionRequestRow`, `DeliverableVersion`, `DeliverableData`, and version request status type unions
- [ ] **And** all fields match the existing inline definitions exactly

### AC2: Shared Constants File Created

- [ ] **Given** the project structure
- [ ] **When** I look at `src/components/shared/deliverables/constants.ts`
- [ ] **Then** it exports `VERSION_REQUEST_STATUS_CONFIG` — a map from status string to `{ label, icon, bg, border, text }` styling config
- [ ] **And** the config covers `pending`, `in_progress`, and `resolved` statuses

### AC3: Barrel Export

- [ ] **Given** the shared deliverables folder
- [ ] **When** I look at `src/components/shared/deliverables/index.ts`
- [ ] **Then** it re-exports all types and constants for clean import paths

### AC4: Existing Files Updated

- [ ] **Given** the admin `version-requests-list.tsx` (inline `VersionRequestRow`)
- [ ] **Then** it imports `VersionRequestRow` from `@/components/shared/deliverables`
- [ ] **And** the inline interface is removed

- [ ] **Given** the employee `version-requests-list.tsx` (inline `VersionRequestRow`)
- [ ] **Then** it imports `VersionRequestRow` from `@/components/shared/deliverables`
- [ ] **And** the inline interface is removed

- [ ] **Given** the admin `types.ts` (`DeliverableData`, `DeliverableVersion`)
- [ ] **Then** it re-exports from `@/components/shared/deliverables/types.ts` (backward compatible)

### AC5: Build Passes

- [ ] **Given** all imports updated
- [ ] **When** I run `pnpm build`
- [ ] **Then** no TypeScript errors are introduced

---

## 📘 Implementation

### Phase A: Create Shared Files (~1 point)

#### Task A1: Create `types.ts`

**File**: `src/components/shared/deliverables/types.ts`

- [ ] A1.1 Move `VersionRequestRow` interface (currently inline in 2 files)
- [ ] A1.2 Move `DeliverableVersion` interface (currently in `admin/.../detail/types.ts`)
- [ ] A1.3 Move `DeliverableData` interface (currently in `admin/.../detail/types.ts`)
- [ ] A1.4 Export version request status type union: `"pending" | "in_progress" | "resolved"`
- [ ] A1.5 Add a `VersionRequestStatus` type alias

#### Task A2: Create `constants.ts`

**File**: `src/components/shared/deliverables/constants.ts`

- [ ] A2.1 Define `VERSION_REQUEST_STATUS_CONFIG` map:
  ```ts
  export const VERSION_REQUEST_STATUS_CONFIG = {
    pending: {
      label: "Pending",
      icon: Clock,
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
    in_progress: {
      label: "In Progress",
      icon: Play, // or Loader2 for spinner
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
    },
    resolved: {
      label: "Resolved",
      icon: CheckCircle,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
    },
  } as const;
  ```
- [ ] A2.2 Export the config

#### Task A3: Create barrel export

**File**: `src/components/shared/deliverables/index.ts`

- [ ] A3.1 Re-export all types and constants

### Phase B: Update Existing Imports (~1 point)

#### Task B1: Update admin `version-requests-list.tsx`

- [ ] B1.1 Import `VersionRequestRow` from shared, remove inline definition

#### Task B2: Update employee `version-requests-list.tsx`

- [ ] B2.1 Import `VersionRequestRow` from shared, remove inline definition

#### Task B3: Update admin `types.ts`

- [ ] B3.1 Convert to re-export from shared (backward compatible):
  ```ts
  export type {
    DeliverableData,
    DeliverableVersion,
  } from "@/components/shared/deliverables";
  ```

#### Task B4: Verify build

- [ ] B4.1 Run `pnpm build` — confirm zero type errors

---

## 🧪 Testing Checklist

- [ ] `shared/deliverables/types.ts` compiles cleanly
- [ ] `shared/deliverables/constants.ts` exports a valid config object
- [ ] Admin version-requests-list renders identically
- [ ] Employee version-requests-list renders identically
- [ ] Any file importing from `admin/.../detail/types.ts` still works (backward compat)
- [ ] No unused inline type definitions remain in the updated files

---

## 🚀 Definition of Done

- [ ] Shared types and constants files created
- [ ] All inline `VersionRequestRow` definitions removed
- [ ] Admin `types.ts` re-exports from shared
- [ ] `pnpm build` passes with zero errors
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-15 | backlog | Story created |

---

**Previous Story**: N/A (first in epic)
**Next Story**: 21-2 - Signed URL Custom Hooks
