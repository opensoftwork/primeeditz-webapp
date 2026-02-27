# Story 28.4: Employee Assignment During Project Creation

**Epic**: Epic 28 - Admin Internal Project Flow
**Status**: backlog
**Complexity**: Small (3 points)
**Created**: 2026-02-27
**Priority**: HIGH — Core capability for internal projects

---

## 📋 User Story

**As an** Admin creating an internal project,
**I want** to assign employees during the project creation step,
**So that** the team is set up from the start.

---

## ✅ Acceptance Criteria

- [ ] **Given** the creation drawer
- [ ] **When** selecting employees
- [ ] **Then** a multi-select picker shows all available employees
- [ ] **And** selected employees are passed to the `createInternalProject` mutation
- [ ] **And** assigned employees can see the project in their dashboard

---

## 📁 Files to Update

| File                                                                       | Change                          |
| -------------------------------------------------------------------------- | ------------------------------- |
| `src/components/modules/admin/projects/create-internal-project-drawer.tsx` | Employee multi-select component |
| Reuse existing employee selection patterns from quotation/project modules  |                                 |

---

## 🚀 Definition of Done

- [ ] Multi-select employee picker in creation drawer
- [ ] Employees assigned at project creation
- [ ] Assigned employees see project in their dashboard
- [ ] Story marked as `done`

---

**Previous Story**: 28-3 - Creation drawer
**Next Story**: 28-5 - Internal project detail view adaptations
