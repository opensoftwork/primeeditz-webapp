# Story 28.1: Create `createInternalProject` Admin Mutation

**Epic**: Epic 28 - Admin Internal Project Flow
**Status**: backlog
**Complexity**: Medium (5 points)
**Created**: 2026-02-27
**Priority**: HIGH — Backend foundation for internal projects

---

## 📋 User Story

**As an** Admin,
**I want** to create projects directly without a studio or quotation,
**So that** I can manage internal projects for in-house work.

---

## ✅ Acceptance Criteria

- [ ] **Given** an admin calls `createInternalProject`
- [ ] **When** the mutation completes
- [ ] **Then** a project is created with `source: "admin_init"` and no `studioId`
- [ ] **And** the project starts in `onboarding` phase with `draft` action state
- [ ] **And** a sequential project code is generated
- [ ] **And** optional folder template is applied
- [ ] **And** optional employees are assigned
- [ ] **And** a status history entry is created

---

## 📁 Files to Create/Update

| File                                     | Change                               |
| ---------------------------------------- | ------------------------------------ |
| `convex/functions/projects/mutations.ts` | Add `createInternalProject` mutation |

---

## 🚀 Definition of Done

- [ ] `createInternalProject` mutation works
- [ ] Project created with correct source and no studioId
- [ ] Folder template optionally applied
- [ ] Employees optionally assigned
- [ ] `pnpm convex dev` deploys successfully
- [ ] Story marked as `done`

---

**Previous Story**: None (first in epic)
**Next Story**: 28-2 - Project listing includes internal projects
