# Story 17-4: Update DeliverableCard Link Behavior for Studio Context

**Epic**: Epic 17 - Studio Deliverables UX & Folder Restructure  
**Status**: review  
**Complexity**: Small (3 points)  
**Created**: 2026-02-12  
**Priority**: MUST — Fixes broken navigation from card clicks

---

## 📋 User Story

**As a** studio user,  
**I want** clicking a deliverable card to navigate me to the correct studio detail page,  
**So that** I can view and access my files without getting a 404 error.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                            | Status    | Notes                                                 |
| ------------------------------------- | --------- | ----------------------------------------------------- |
| **17-3 - Studio Detail View**         | ✅ Done   | Route and component must exist first                  |
| **Admin `DeliverableCard` component** | ✅ Exists | At `admin/.../deliverables/list/deliverable-card.tsx` |

### Enables

| Story / Epic        | Notes                                           |
| ------------------- | ----------------------------------------------- |
| **End-to-end flow** | Cards → Detail → Back button → Cards (complete) |

---

## ✅ Acceptance Criteria

### AC1: Explicit `href` on Non-Review Cards

- [x] **Given** a deliverable in non-review mode
- [x] **When** the `DeliverableCard` renders
- [x] **Then** the `href` prop must explicitly be set to `/projects/${projectId}/deliverables/${item._id}`
- [x] **And** clicking the card must navigate to the studio deliverable detail page

### AC2: Review Mode Cards — No Navigation

- [x] **Given** a deliverable in review mode (`actionState === "awaiting_review"`)
- [x] **When** `DeliverableReviewCard` renders
- [x] **Then** it must NOT navigate (no link wrapper)
- [x] **And** inline actions (approve/request version) must still work
- [x] **And** this behavior must remain unchanged

### AC3: Visual Navigation Affordance

- [x] **Given** a deliverable card in non-review mode
- [x] **When** the user hovers over the card
- [x] **Then** the card must visually indicate it's clickable (hover effect, cursor pointer)

### AC4: Navigation Verification

- [x] **Given** a deliverable card in non-review mode
- [x] **When** the user clicks on it
- [x] **Then** the browser must navigate to `/@studio/projects/[projectId]/deliverables/[deliverableId]`
- [x] **And** the studio deliverable detail page must load correctly
- [x] **And** the back button on the detail page must return to the project detail page

---

## 📁 File List

### Modified Files
- `src/components/modules/projects/detail/deliverables/deliverables-section.tsx` (added explicit `href` prop to `DeliverableCard`)

---

## 🚀 Definition of Done

- [x] Explicit `href` set on non-review mode `DeliverableCard`
- [x] Review mode remains unchanged (no navigation)
- [x] Full navigation flow tested (card → detail → back)
- [x] Hover affordances verified
- [x] `pnpm build` passes

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-12 | backlog | Story created |
| 2026-02-13 | review  | Implementation complete (done as part of Story 17-2) |

---

**Previous Story**: 17-3 - Create Studio Deliverable Detail View  
**Next Story**: 17-5 - Empty State, Loading Polish, and Motion Consistency
