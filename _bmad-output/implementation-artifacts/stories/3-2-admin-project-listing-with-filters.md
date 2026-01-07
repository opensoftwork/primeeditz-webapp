# Story 3.2: Admin Project Listing with Filters

**Epic**: Epic 3 - Admin Portal — Project & System Management  
**Status**: in-progress  
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

## 🎯 Implementation Tasks

### Task 1: Create Admin Projects Convex Query

**File**: `convex/admin.ts` (add to existing)

Create `getAdminProjects` query:

- Returns all projects with enriched data (project type name, client name)
- Supports filtering by status, projectTypeId
- Supports sorting by createdAt, status
- Pagination: 20 per page

### Task 2: Create Projects Page for Admin Slot

**File**: `src/app/(protected)/@admin/projects/page.tsx`

- Create new route following parallel routes pattern
- Display projects in a table with columns: Code, Client, Type, Status, Date, Actions
- Add filter controls (dropdowns, search)
- Add sort controls
- Implement pagination

### Task 3: Add Default Route

**File**: `src/app/(protected)/@admin/projects/default.tsx`

- Create default export for parallel route

---

## 📦 Dependencies

- Existing `convex/admin.ts` from Story 3.1
- shadcn/ui components (Table, Select, Input, Button)

---

## 🔗 Routes

- `/projects` → Renders `@admin/projects/page.tsx` for admin users
