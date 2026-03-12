# Story 28.5: Internal Project Detail View Adaptations

**Epic**: Epic 28 - Admin Internal Project Flow
**Status**: backlog
**Complexity**: Small (3 points)
**Created**: 2026-02-27
**Priority**: MEDIUM — UX consistency for internal projects

---

## 📋 User Story

**As an** Admin viewing an internal project,
**I want** the detail page to adapt gracefully (no studio info, no quotation link),
**So that** I don't see broken or irrelevant sections.

---

## ✅ Acceptance Criteria

- [ ] **Given** an internal project (no `studioId`)
- [ ] **When** viewing the detail page
- [ ] **Then** Studio Info section shows "Internal Project" badge
- [ ] **And** "View Quotation" link is hidden
- [ ] **And** all lifecycle features (phases, deliverables, status) work normally

---

## 📁 Files to Update

| File                                                    | Change                                      |
| ------------------------------------------------------- | ------------------------------------------- |
| `src/components/modules/admin/projects/project-detail/` | Conditional rendering for internal projects |

---

## 🚀 Definition of Done

- [ ] Detail view renders correctly for internal projects
- [ ] No broken links to non-existent quotations/studios
- [ ] All lifecycle features functional
- [ ] Story marked as `done`

---

**Previous Story**: 28-4 - Employee assignment
**Next Story**: 28-6 - Employee listing shows internal projects
