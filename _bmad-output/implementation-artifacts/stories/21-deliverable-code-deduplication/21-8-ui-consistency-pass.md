# Story 21-8: UI Consistency Pass

**Epic**: Epic 21 - Deliverable Code Deduplication & UI Consistency
**Status**: backlog
**Complexity**: Medium (3 points)
**Created**: 2026-02-15
**Priority**: SHOULD — Final polish pass to ensure cross-portal visual consistency

---

## 📋 User Story

**As a** user switching between admin, studio, and employee portals,
**I want** consistent UI patterns (page titles, animations, badges, card layouts, loading states),
**So that** the application feels like a unified product rather than three separate apps.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                | Status  | Notes                                |
| ------------------------- | ------- | ------------------------------------ |
| **21-1** through **21-7** | backlog | All refactoring should be done first |

### Enables

| Story / Epic        | Notes                            |
| ------------------- | -------------------------------- |
| Future feature work | Consistent patterns reduce drift |

### Why This Story Exists

Even after the mechanical deduplication (stories 21-1 through 21-7), there remain **visual inconsistencies** that arise from components being built independently across portals. This story is a focused sweep to normalize:

1. **Page title sizing** — Some pages use `text-3xl`, others `text-4xl xl:text-5xl`
2. **Entrance animations** — Some sections use `motion/react`, others use CSS `animate-in`
3. **Section headers** — Inconsistent label patterns (`text-[10px] font-black uppercase tracking-wider` vs `text-xs font-bold`)
4. **Card styling** — Some use `rounded-2xl`, others `rounded-3xl`; varying border opacity
5. **Loading skeletons** — Different skeleton patterns per portal
6. **`@ts-ignore` cleanup** — Indicates missing Convex function types that could be fixed

---

## ✅ Acceptance Criteria

### AC1: Page Title Consistency

- [ ] **Given** all deliverable-related pages across all 3 portals
- [ ] **Then** page titles use `text-4xl xl:text-5xl font-black uppercase tracking-tighter`
- [ ] **And** subtitles use `text-[10px] font-black uppercase tracking-[0.3em]`

### AC2: Entrance Animation Consistency

- [ ] **Given** all deliverable detail views, lists, and dialogs
- [ ] **Then** page-level entrances use `animate-in fade-in slide-in-from-bottom-4 duration-700`
- [ ] **And** section-level entrances use `motion/react` with `initial={{ opacity: 0, y: 20 }}`
- [ ] **And** there is no mixing of `framer-motion` and `motion/react`

### AC3: Status Badge Consistency

- [ ] **Given** all status indicators across deliverables, version requests, and approval states
- [ ] **Then** they use the `VersionStatusBadge` component (from 21-3) or follow the same styling pattern
- [ ] **And** colors are consistent: amber=pending, blue=in_progress, emerald=resolved

### AC4: Card & Section Styling Consistency

- [ ] **Given** all detail cards (meta cards, stats cards, info sections)
- [ ] **Then** they follow consistent patterns:
  - Cards: `rounded-2xl bg-white/5 border border-white/5`
  - Section headers: `text-[10px] font-black uppercase tracking-widest text-white/30`
  - Stat cards: `rounded-3xl bg-{color}/5 border border-{color}/10`

### AC5: Loading Skeleton Consistency

- [ ] **Given** all loading states
- [ ] **Then** they use `Skeleton` component with `bg-white/5 rounded-*` pattern
- [ ] **And** layout dimensions match the eventual content

### AC6: `@ts-ignore` Audit

- [ ] **Given** all files in the deliverables modules
- [ ] **Then** a list of remaining `@ts-ignore` comments is documented
- [ ] **And** any that can be resolved by adding proper types are fixed

### AC7: Build Passes

- [ ] **Given** all changes
- [ ] **When** I run `pnpm build`
- [ ] **Then** zero TypeScript errors

---

## 📘 Implementation

### Phase A: Audit (~0.5 points)

#### Task A1: Create consistency checklist

- [ ] A1.1 Grep for `text-3xl`, `text-4xl`, `text-5xl` in deliverable files → document which need updating
- [ ] A1.2 Grep for `framer-motion` imports → should be zero
- [ ] A1.3 Grep for `@ts-ignore` → document and categorize
- [ ] A1.4 Grep for `rounded-2xl` vs `rounded-3xl` usage → document inconsistencies
- [ ] A1.5 Check animation patterns (`animate-in` vs `motion`) → document

### Phase B: Page Titles & Layout (~0.5 points)

#### Task B1: Normalize page titles

- [ ] B1.1 Update pages that don't follow the `text-4xl xl:text-5xl` pattern:
  - `studio-deliverable-detail.tsx` if applicable
  - `employee/.../versions-workspace.tsx` if applicable
- [ ] B1.2 Normalize subtitle/breadcrumb label patterns

### Phase C: Animations (~0.5 points)

#### Task C1: Normalize entrance animations

- [ ] C1.1 Ensure all deliverable-related pages use consistent page-level entrance
- [ ] C1.2 Ensure all detail section blocks use `motion` with `initial/whileInView` pattern
- [ ] C1.3 Remove any remaining `framer-motion` imports (should be none after 21-6)

### Phase D: Card & Component Styling (~1 point)

#### Task D1: Normalize card patterns

- [ ] D1.1 Audit and fix meta card styling inconsistencies
- [ ] D1.2 Audit and fix stats card styling
- [ ] D1.3 Ensure section header labels use consistent typography

#### Task D2: Normalize skeleton patterns

- [ ] D2.1 Audit loading skeletons across portals
- [ ] D2.2 Fix any that don't match the established pattern

### Phase E: `@ts-ignore` Cleanup (~0.5 points)

#### Task E1: Fix resolvable ts-ignore comments

- [ ] E1.1 For each `@ts-ignore`, determine if the underlying type issue is fixable
- [ ] E1.2 Fix those that can be resolved (e.g., adding proper Convex function exports)
- [ ] E1.3 Document remaining `@ts-ignore` comments that require schema changes

---

## 🧪 Testing Checklist

### Visual Regression (Cross-Portal)

- [ ] Admin deliverable detail — title, animations, cards consistent
- [ ] Admin version requests list — title, stats, table consistent
- [ ] Admin version request detail — title, badges, images consistent
- [ ] Studio deliverables list — title, cards consistent
- [ ] Studio deliverable detail — title, actions consistent
- [ ] Employee version requests list — title, stats, table consistent
- [ ] Employee versions workspace — title, cards consistent

### Consistency Checks

- [ ] No `framer-motion` imports remain
- [ ] All page titles follow `text-4xl xl:text-5xl` pattern
- [ ] All section headers follow `text-[10px] font-black uppercase tracking-widest` pattern
- [ ] All stat cards use `rounded-3xl` with color-coded backgrounds
- [ ] Status badges are visually identical across all portals

---

## 🚀 Definition of Done

- [ ] Page title consistency verified across all deliverable pages
- [ ] Animation patterns normalized
- [ ] Card and section styling unified
- [ ] `@ts-ignore` audit completed (fixed or documented)
- [ ] `pnpm build` passes with zero errors
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-15 | backlog | Story created |

---

**Previous Story**: 21-7 - Move Image Grid & Upload to Shared
**Next Story**: N/A (last in epic)
