# Story 28.6: Employee Listing Shows Internal Projects

**Epic**: Epic 28 - Admin Internal Project Flow
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-02-27
**Priority**: MEDIUM — Employee visibility for assigned internal projects

---

## 📋 User Story

**As an** Employee assigned to an internal project,
**I want** to see the project in my project listing,
**So that** I can access and work on it like any other project.

---

## ✅ Acceptance Criteria

- [ ] **Given** an employee is assigned to an internal project
- [ ] **When** viewing their project listing
- [ ] **Then** the internal project appears with an "Internal" badge
- [ ] **And** they can navigate to the project detail and perform their role

---

## 📁 Files to Verify

| File                                        | Change                                              |
| ------------------------------------------- | --------------------------------------------------- |
| `src/components/modules/employee/projects/` | Verify internal projects appear                     |
| `convex/functions/projects/queries.ts`      | Ensure employee query includes source: "admin_init" |

---

## 🚀 Definition of Done

- [ ] Employees see internal projects in their listing
- [ ] "Internal" badge displayed
- [ ] Navigation to project detail works
- [ ] Story marked as `done`

---

**Previous Story**: 28-5 - Detail view adaptations
**Next Story**: None (last in epic)
