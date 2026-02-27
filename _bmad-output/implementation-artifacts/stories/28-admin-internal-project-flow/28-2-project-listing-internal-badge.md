# Story 28.2: Project Listing Includes Internal Projects with Badge

**Epic**: Epic 28 - Admin Internal Project Flow
**Status**: backlog
**Complexity**: Small (3 points)
**Created**: 2026-02-27
**Priority**: HIGH — Internal projects must be visible

---

## 📋 User Story

**As an** Admin,
**I want** internal projects to appear in the "All Projects" listing with an "Internal" badge,
**So that** I can distinguish them from studio-originated projects.

---

## ✅ Acceptance Criteria

- [ ] **Given** internal projects exist
- [ ] **When** viewing the All Projects listing
- [ ] **Then** internal projects appear alongside studio projects
- [ ] **And** they show an "Internal" badge in the Studio column
- [ ] **And** filtering by project source is available (optional)

---

## 📁 Files to Update

| File                                                             | Change                                             |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| `src/components/modules/admin/projects/project-list/columns.tsx` | Add "Internal" badge for projects without studioId |
| `convex/functions/projects/queries.ts`                           | Verify no studioId exclusion filter                |

---

## 🚀 Definition of Done

- [ ] Internal projects appear in admin listing
- [ ] "Internal" badge visible for studio-less projects
- [ ] No regression in existing project listing
- [ ] Story marked as `done`

---

**Previous Story**: 28-1 - Create mutation
**Next Story**: 28-3 - Create Internal Project button + drawer
