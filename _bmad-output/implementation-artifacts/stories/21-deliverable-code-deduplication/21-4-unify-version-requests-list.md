# Story 21-4: Unify VersionRequestsList Component

**Epic**: Epic 21 - Deliverable Code Deduplication & UI Consistency
**Status**: backlog
**Complexity**: Medium (5 points)
**Created**: 2026-02-15
**Priority**: MUST — Eliminates the largest single piece of duplication (~300+ lines)

---

## 📋 User Story

**As a** developer maintaining the version requests feature,
**I want** a single `VersionRequestsList` component used by both admin and employee portals,
**So that** bug fixes, column additions, and UI changes are made in one place instead of two.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On | Status  | Notes                                                         |
| ---------- | ------- | ------------------------------------------------------------- |
| **21-1**   | backlog | Shared `VersionRequestRow` type                               |
| **21-2**   | backlog | `useSignedUrls` hook (optional, for future thumbnail support) |
| **21-3**   | backlog | `VersionStatusBadge` for status column                        |

### Enables

| Story / Epic | Notes                                              |
| ------------ | -------------------------------------------------- |
| **21-8**     | UI consistency pass can rely on this being unified |

### Current Duplication Analysis

**Admin version**: `admin/.../version-requests-list.tsx` (359 lines)
**Employee version**: `employee/.../version-requests-list.tsx` (317 lines)

Differences between the two files:

| Feature                      | Admin                                     | Employee                                       |
| ---------------------------- | ----------------------------------------- | ---------------------------------------------- |
| Link href prefix             | `/projects/${projectId}/deliverables/...` | `/assigned-work/${projectId}/deliverables/...` |
| "New Version Request" button | ✅ Present                                | ❌ Absent                                      |
| `@ts-ignore` on query        | ✅ Has                                    | ❌ Doesn't                                     |
| Not-found state              | Full UI with "Go Back" button             | Simple `return null`                           |
| Date format                  | `"MMM dd, yyyy • HH:mm"`                  | `"MMM dd, yyyy"`                               |
| Filename property on Row     | `fileName: string`                        | Not present                                    |

Everything else (column definitions, stats cards, DataTable config, styling) is **identical**.

---

## ✅ Acceptance Criteria

### AC1: Shared Component Created

- [ ] **Given** `src/components/shared/deliverables/version-requests-list.tsx`
- [ ] **Then** it exports a `VersionRequestsList` component
- [ ] **And** it accepts the following props:
  ```ts
  interface VersionRequestsListProps {
    projectId: string;
    deliverableId: string;
    hideHeader?: boolean;
    hrefPrefix: string; // e.g. "/projects" or "/assigned-work"
    showCreateButton?: boolean; // admin-only button
    createButtonHref?: string; // where "New Version Request" navigates
    dateFormat?: string; // default "MMM dd, yyyy"
  }
  ```

### AC2: Admin Module Updated

- [ ] **Given** the admin page that renders `VersionRequestsList`
- [ ] **Then** it imports from `@/components/shared/deliverables`
- [ ] **And** passes `hrefPrefix="/projects"`, `showCreateButton={true}`
- [ ] **And** the old `admin/.../version-requests-list.tsx` file is deleted

### AC3: Employee Module Updated

- [ ] **Given** the employee page that renders `VersionRequestsList`
- [ ] **Then** it imports from `@/components/shared/deliverables`
- [ ] **And** passes `hrefPrefix="/assigned-work"`, `showCreateButton={false}`
- [ ] **And** the old `employee/.../version-requests-list.tsx` file is deleted

### AC4: Rendering Parity

- [ ] **Given** the admin version requests page
- [ ] **Then** it renders identically to before (with "New Version Request" button)

- [ ] **Given** the employee version requests page
- [ ] **Then** it renders identically to before (without the button)

### AC5: Build Passes

- [ ] **Given** all changes
- [ ] **When** I run `pnpm build`
- [ ] **Then** zero TypeScript errors are introduced

---

## 📘 Implementation

### Phase A: Create Shared Component (~2.5 points)

#### Task A1: Create unified `VersionRequestsList`

**File**: `src/components/shared/deliverables/version-requests-list.tsx`

- [ ] A1.1 Define the `VersionRequestsListProps` interface with role-aware props
- [ ] A1.2 Import `VersionRequestRow` from `./types`
- [ ] A1.3 Import `VersionStatusBadge` from `./version-status-badge`
- [ ] A1.4 Build the column definitions (using `hrefPrefix` for the actions column link)
- [ ] A1.5 Build the header section (conditionally show "New Version Request" button via `showCreateButton`)
- [ ] A1.6 Build the stats cards section
- [ ] A1.7 Build the not-found state (generic, with "Go Back" button)
- [ ] A1.8 Render `DataTable` with the same configuration
- [ ] A1.9 Use `dateFormat` prop with default `"MMM dd, yyyy"`

#### Task A2: Update barrel export

- [ ] A2.1 Add `VersionRequestsList` to `index.ts`

### Phase B: Replace Module-Specific Lists (~2.5 points)

#### Task B1: Update admin page(s)

- [ ] B1.1 Find all admin pages that import `VersionRequestsList` from the module-specific path
- [ ] B1.2 Update imports to `@/components/shared/deliverables`
- [ ] B1.3 Pass `hrefPrefix="/projects"` and `showCreateButton={true}`
- [ ] B1.4 Pass `createButtonHref={/projects/${projectId}/deliverables/${deliverableId}/versions/new}`
- [ ] B1.5 Pass `dateFormat="MMM dd, yyyy • HH:mm"` to preserve admin's time-included format

#### Task B2: Update employee page(s)

- [ ] B2.1 Find all employee pages that import `VersionRequestsList`
- [ ] B2.2 Update imports to `@/components/shared/deliverables`
- [ ] B2.3 Pass `hrefPrefix="/assigned-work"` and `showCreateButton={false}`

#### Task B3: Delete old files

- [ ] B3.1 Delete `admin/.../version-requests-list.tsx`
- [ ] B3.2 Delete `employee/.../version-requests-list.tsx`

#### Task B4: Verify build

- [ ] B4.1 Run `pnpm build` — confirm zero errors
- [ ] B4.2 Test admin version requests page renders correctly
- [ ] B4.3 Test employee version requests page renders correctly

---

## 🧪 Testing Checklist

### Admin Portal

- [ ] Version requests list loads and displays data
- [ ] "New Version Request" button visible and navigates correctly
- [ ] Status badges render correctly (pending, in_progress, resolved)
- [ ] Stats cards show correct counts
- [ ] Row click navigates to correct admin detail URL
- [ ] Search toolbar works
- [ ] Date format includes time (HH:mm)

### Employee Portal

- [ ] Version requests list loads and displays data
- [ ] "New Version Request" button is NOT visible
- [ ] Status badges render correctly
- [ ] Stats cards show correct counts
- [ ] Row click navigates to correct employee detail URL
- [ ] Search toolbar works
- [ ] Date format is date-only

### Edge Cases

- [ ] Zero version requests — empty state renders
- [ ] Deliverable not found — not-found state renders
- [ ] Loading state — skeleton renders

---

## 🚀 Definition of Done

- [ ] Shared `VersionRequestsList` component created
- [ ] Admin and employee both use the shared component
- [ ] Old module-specific files deleted
- [ ] Visual parity confirmed on both portals
- [ ] `pnpm build` passes with zero errors
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-15 | backlog | Story created |

---

**Previous Story**: 21-3 - Promote VersionStatusBadge to Shared
**Next Story**: 21-5 - Consolidate Version Request Dialogs
