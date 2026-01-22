# Story 10-1: Problem/Solution Section

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: backlog  
**Complexity**: Low (2 points)  
**Created**: 2026-01-22  
**Priority**: P0 — Core conversion section

---

## 📋 User Story

**As a** Visitor,  
**I want** to understand the problems PrimeEditz solves,  
**So that** I can see the value of the platform for my studio.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On            | Status  | Notes                      |
| --------------------- | ------- | -------------------------- |
| **10-0 - Foundation** | backlog | Directory structure needed |

### Enables

| Story / Epic              | Notes                      |
| ------------------------- | -------------------------- |
| **10-10 - Page Assembly** | Section will be integrated |

---

## ✅ Acceptance Criteria

### AC1: Section Visibility

- [ ] **Given** I am on the landing page
- [ ] **When** I scroll past the hero section
- [ ] **Then** I see the Problem/Solution section

### AC2: Problem/Solution Cards

- [ ] **Given** the section is visible
- [ ] **When** I view the content
- [ ] **Then** I see 5 problem/solution pairs:

| Problem                 | Icon          | Solution                      |
| ----------------------- | ------------- | ----------------------------- |
| Scattered Communication | MessageSquare | Unified request portal        |
| File Chaos              | FolderOpen    | Organized folder structure    |
| Status Anxiety          | Clock         | Real-time progress tracking   |
| Manual Quotations       | FileText      | Template-based instant quotes |
| No Accountability       | Shield        | Complete audit trail          |

### AC3: Card Design

- [ ] **Given** each problem/solution card
- [ ] **Then** it must have:
  - Problem icon with subtle background
  - Problem title (what's broken)
  - Arrow or transition indicator
  - Solution title (what PrimeEditz provides)
  - Dark glassmorphic styling (`glass-subtle` class)

### AC4: Scroll Animation

- [ ] **Given** the cards are not in viewport
- [ ] **When** I scroll them into view
- [ ] **Then** they animate in with:
  - Fade in effect
  - Staggered delay (100ms between cards)
  - Slide up motion

### AC5: Responsive Layout

- [ ] **Given** different screen sizes
- [ ] **Then** layout adapts:
  - Mobile (375px): Single column, stacked
  - Tablet (768px): 2-3 column grid
  - Desktop (1024px+): 5-column single row

---

## 🎨 Design Specifications

### Section Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  THE CHAOS WE FIX                                                            │
│  ─────────────────                                                           │
│                                                                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  │
│  │ 💬        │  │ 📁        │  │ ⏰        │  │ 📝        │  │ 🛡️        │  │
│  │ Scattered │  │ File      │  │ Status    │  │ Manual    │  │ No        │  │
│  │ Comms     │  │ Chaos     │  │ Anxiety   │  │ Quotes    │  │ Audit     │  │
│  │     ↓     │  │     ↓     │  │     ↓     │  │     ↓     │  │     ↓     │  │
│  │ Unified   │  │ Organized │  │ Real-time │  │ Template  │  │ Complete  │  │
│  │ Portal    │  │ Folders   │  │ Tracking  │  │ Quotes    │  │ Trail     │  │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Styling

```css
/* Section heading */
.section-heading {
  font-size: 0.625rem; /* 10px */
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.6);
}

/* Card styling */
.problem-card {
  background: color-mix(in oklch, var(--background) 60%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  padding: 1.5rem;
}
```

---

## 📘 Implementation Tasks

### Task 1: Create Component File

**File**: `src/components/modules/landing/sections/problem-solution.tsx`

- [ ] 1.1 Create base component structure
- [ ] 1.2 Define problem/solution data array
- [ ] 1.3 Import Lucide icons

### Task 2: Build Card Component

- [ ] 2.1 Create ProblemSolutionCard sub-component
- [ ] 2.2 Add icon display with background
- [ ] 2.3 Add problem/solution text layout
- [ ] 2.4 Add transition indicator (arrow)

### Task 3: Implement Grid Layout

- [ ] 3.1 Create responsive grid container
- [ ] 3.2 Implement breakpoint adjustments
- [ ] 3.3 Test on all screen sizes

### Task 4: Add Scroll Animations

- [ ] 4.1 Add Intersection Observer or CSS animation
- [ ] 4.2 Implement staggered reveal
- [ ] 4.3 Test animation performance

### Task 5: Export from Index

- [ ] 5.1 Add export to `sections/index.ts`

---

## 🧪 Testing Checklist

- [ ] All 5 cards render correctly
- [ ] Icons display properly
- [ ] Text is readable
- [ ] Animation triggers on scroll
- [ ] Stagger effect works
- [ ] Responsive on mobile, tablet, desktop
- [ ] No horizontal overflow

---

## 🚀 Definition of Done

- [ ] Component created at correct path
- [ ] All 5 problem/solution pairs displayed
- [ ] Scroll animation working
- [ ] Responsive layout complete
- [ ] Exported from sections index
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |

---

**Previous Story**: 10-0 - Foundation & Assets  
**Next Story**: 10-2 - Features Showcase Section
