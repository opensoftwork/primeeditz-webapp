
# Story 17-5: Empty State, Loading Polish, and Motion Consistency

**Epic**: Epic 17 - Studio Deliverables UX & Folder Restructure  
**Status**: review  
**Complexity**: Small (3 points)  
**Created**: 2026-02-12  
**Priority**: SHOULD — Polish and consistency

---

## 📋 User Story

**As a** studio user,  
**I want** the deliverables section to have polished empty states, loading skeletons, and smooth animations,  
**So that** every state of the UI feels intentional and premium.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                    | Status   | Notes                            |
| ----------------------------- | -------- | -------------------------------- |
| **17-1 - Folder Restructure** | ✅ Done  | Files in organized location      |
| **17-2 - Data Fixes & UI**    | ✅ Done  | `DetailSection` wrapper in place |

---

## ✅ Acceptance Criteria

### AC1: Styled Empty State

- [x] **Given** a project with zero deliverables
- [x] **When** the `DeliverablesSection` component renders
- [x] **Then** it must show a styled empty state (not `null`)
- [x] **And** the empty state must include:
  - A large icon in a circular/rounded container
  - A heading: "No Deliverables Yet"
  - A description: "Your finalized media files will appear here once uploaded and approved"
  - The whole block must be centered within its container

### AC2: Enhanced Loading Skeleton

- [x] **Given** the deliverables data is loading (`deliverables === undefined`)
- [x] **When** the skeleton renders
- [x] **Then** it must match the `DetailSection` shape:
  - Section header skeleton (icon placeholder + title bar)
  - 2-3 card skeletons in a grid matching the actual card layout
  - Use `bg-white/5` and `rounded-2xl` (project convention)
- [x] **And** the skeleton must NOT be a simple rectangle

### AC3: Staggered Card Animations

- [x] **Given** the deliverables have loaded
- [x] **When** the cards render
- [x] **Then** each card must animate in with a staggered delay:
  - `initial={{ opacity: 0, y: 20 }}`
  - `animate={{ opacity: 1, y: 0 }}`
  - `transition={{ delay: index * 0.1 }}`
- [x] **And** the stagger must apply to BOTH review cards and non-review cards

### AC4: Loading State on Detail Page

- [x] **Given** the studio deliverable detail page skeleton (from Story 17-3)
- [x] **When** it renders
- [x] **Then** it must include a pulsing animation (`animate-pulse`)
- [x] **And** the shape must match the detail layout (header + preview + sidebar)

---

## 📁 File List

### Modified Files
- `src/components/modules/projects/detail/deliverables/deliverables-section.tsx` (empty state, loading skeleton, staggered animations)
- `src/components/modules/projects/detail/deliverables/studio-deliverable-detail.tsx` (loading skeleton with animate-pulse)

---

## 🚀 Definition of Done

- [x] Empty state renders for 0 deliverables (not `null`)
- [x] Loading skeleton matches actual layout shape
- [x] Card animations staggered with `motion.div`
- [x] All three states feel polished and intentional
- [x] Visual consistency with reference materials / specs sections
- [x] `pnpm build` passes

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-12 | backlog | Story created |
| 2026-02-13 | review  | Implementation complete (done as part of Story 17-2) |

---

**Previous Story**: 17-4 - Update DeliverableCard Link Behavior for Studio Context  
**Next Story**: N/A (Last story in Epic 17)
