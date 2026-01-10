# Story 3.2: Admin Project Listing with Filters

**Epic**: Epic 3 - Admin Portal — Project & System Management  
**Status**: done  
**Complexity**: Medium  
**Created**: 2026-01-07

---

## 📋 User Story

**As an** Admin,  
**I want** to view all projects with filtering and search capabilities,  
**So that** I can find specific projects quickly.

---

## ✅ Acceptance Criteria

- **Given** I am on `/projects` (via @admin parallel route)
- **When** the page loads
- **Then** I must see a table/list of all projects (paginated if >20)
- **And** I can filter by: Status (dropdown), Project Type (dropdown), Client (search)
- **And** I can sort by: Date (newest/oldest), Status

---

## 📘 Framework Notes (Epic 2 Learnings)

- **Route**: `src/app/(protected)/@admin/projects/page.tsx`
- **Form Library**: React Hook Form + Zod (if forms needed)
- **Data Fetching**: Convex `useQuery` with `getAdminProjects` query
- **Styling**: Premium studio aesthetic with motion animations

---

## 🎯 Implementation Tasks

### Task 1: Create Admin Projects Convex Query

**File**: `convex/functions/admin/queries.ts`

Create `getAdminProjects` query:

- [x] Returns all projects with enriched data (project type name, client name)
- [x] Supports filtering by status, projectTypeId
- [x] Supports sorting by createdAt, status
- [x] Pagination: 20 per page

### Task 2: Create Projects Page for Admin Slot

**File**: `src/app/(protected)/@admin/projects/page.tsx`

- [x] Create new route following parallel routes pattern
- [x] Display projects in a table with columns: Code, Client, Type, Status, Date, Actions
- [x] Add filter controls (dropdowns, search)
- [x] Add sort controls
- [x] Implement pagination

### Task 3: Add Default Route

**File**: `src/app/(protected)/@admin/projects/default.tsx`

- [x] Create default export for parallel route

---

## 📦 Dependencies

- [x] Existing `convex/functions/admin/queries.ts`
- [x] shadcn/ui components (Table, Select, Input, Button)
- [x] DataTable component (from Epic 2)

---

## 🚀 Definition of Done

- [x] Admin projects query created and tested
- [x] Projects page displays with real data
- [x] Filter controls work
- [x] Sort controls work
- [x] Row click navigates to project detail
- [x] No TypeScript errors
- [x] Responsive design verified
- [x] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                                            |
| ---------- | ------------- | ------------------------------------------------ |
| 2026-01-07 | ready-for-dev | Story created                                    |
| 2026-01-07 | done          | Implemented with DataTable, filters, and sorting |

---

**Next Story**: 3.3 - Admin Project Detail View
