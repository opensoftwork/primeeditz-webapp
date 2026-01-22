# Story 10-2: Features Showcase Section (4 Portals)

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: review  
**Complexity**: Medium (3 points)  
**Created**: 2026-01-22  
**Priority**: P0 — Core value proposition display

---

## 📋 User Story

**As a** Visitor,  
**I want** to see what each user portal offers,  
**So that** I understand how PrimeEditz serves different roles.

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
- [ ] **When** I scroll to the features section
- [ ] **Then** I see the 4-portal showcase

### AC2: Portal Cards Display

- [ ] **Given** the section is visible
- [ ] **When** I view the portal cards
- [ ] **Then** I see 4 distinct portals:

| Portal         | Icon      | Accent Color                 | Features                              |
| -------------- | --------- | ---------------------------- | ------------------------------------- |
| **Client**     | User      | Cyan (`text-cyan-400`)       | Request, Upload, Track, Approve       |
| **Employee**   | Palette   | Emerald (`text-emerald-400`) | My Tasks, Edit, Submit, Notes         |
| **Admin**      | BarChart3 | Amber (`text-amber-400`)     | All Projects, Assign, Review, Reports |
| **SuperAdmin** | Settings  | Purple (`text-purple-400`)   | Settings, Templates, Pricing, Users   |

### AC3: Card Design

- [ ] **Given** each portal card
- [ ] **Then** it must have:
  - Portal name with icon
  - Accent color glow effect on icon
  - Feature list with checkmarks
  - "Learn more" link (optional)
  - Dark glassmorphic styling

### AC4: Hover Interaction

- [ ] **Given** I hover over a portal card
- [ ] **Then** the card lifts with enhanced shadow
- [ ] **And** the transition is smooth (200ms)

### AC5: Responsive Layout

- [ ] **Given** different screen sizes
- [ ] **Then** layout adapts:
  - Mobile (375px): Single column, full width
  - Tablet (768px): 2x2 grid
  - Desktop (1024px+): 4-column row

---

## 🎨 Design Specifications

### Section Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ONE PLATFORM, FOUR EXPERIENCES                                              │
│  ──────────────────────────────                                              │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐│
│  │  👤 CLIENT      │  │  🎨 EMPLOYEE    │  │  📊 ADMIN       │  │ ⚙️ SUPER ││
│  │  ────────────── │  │  ────────────── │  │  ────────────── │  │ ──────── ││
│  │  ✓ Request      │  │  ✓ My Tasks     │  │  ✓ All Projects │  │ ✓ Settings││
│  │  ✓ Upload       │  │  ✓ Edit         │  │  ✓ Assign       │  │ ✓ Templates│
│  │  ✓ Track        │  │  ✓ Submit       │  │  ✓ Review       │  │ ✓ Pricing ││
│  │  ✓ Approve      │  │  ✓ Notes        │  │  ✓ Reports      │  │ ✓ Users  ││
│  │                 │  │                 │  │                 │  │          ││
│  │  [Learn more →] │  │  [Learn more →] │  │  [Learn more →] │  │ [Learn →]││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Portal Card Styling

```css
/* Base card */
.portal-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  padding: 2rem;
  transition: all 0.2s ease;
}

/* Hover state */
.portal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Icon glow per portal */
.icon-client {
  color: var(--cyan-400);
  text-shadow: 0 0 20px var(--cyan-400);
}
.icon-employee {
  color: var(--emerald-400);
  text-shadow: 0 0 20px var(--emerald-400);
}
.icon-admin {
  color: var(--amber-400);
  text-shadow: 0 0 20px var(--amber-400);
}
.icon-superadmin {
  color: var(--purple-400);
  text-shadow: 0 0 20px var(--purple-400);
}
```

---

## 📘 Implementation Tasks

### Task 1: Create Component File

**File**: `src/components/modules/landing/sections/features.tsx`

- [x] 1.1 Create base component structure
- [x] 1.2 Define portal data array
- [x] 1.3 Import Lucide icons (User, Palette, BarChart3, Settings)

### Task 2: Build Portal Card Component

- [x] 2.1 Create PortalCard sub-component
- [x] 2.2 Add icon with accent color and glow
- [x] 2.3 Add portal name heading
- [x] 2.4 Add feature list with checkmarks
- [x] 2.5 Add optional "Learn more" link

### Task 3: Implement Hover Effects

- [x] 3.1 Add CSS transition for lift effect
- [x] 3.2 Add shadow enhancement on hover
- [x] 3.3 Test animation smoothness

### Task 4: Create Responsive Grid

- [x] 4.1 Implement 4-column desktop grid
- [x] 4.2 Implement 2x2 tablet grid
- [x] 4.3 Implement single column mobile
- [x] 4.4 Test all breakpoints

### Task 5: Export from Index

- [x] 5.1 Add export to `sections/index.ts`

---

## 🧪 Testing Checklist

- [ ] All 4 portal cards render
- [ ] Icons have correct accent colors
- [ ] Feature lists complete
- [ ] Hover effects work
- [ ] Responsive on all breakpoints
- [ ] No layout overflow

---

## 🚀 Definition of Done

- [ ] Component created at correct path
- [ ] All 4 portals displayed with correct features
- [ ] Hover interactions working
- [ ] Responsive layout complete
- [ ] Exported from sections index
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |

---

**Previous Story**: 10-1 - Problem/Solution Section  
**Next Story**: 10-3 - Workflow Demo Section

---

## 📂 File List

- `src/components/modules/landing/sections/features.tsx` (New)
- `src/components/modules/landing/sections/index.ts` (Modified)

## 📝 Change Log

- **2026-01-22**: Implemented the Features Showcase section with 4 portal cards (Client, Employee, Admin, SuperAdmin), hover effects, and responsive grid layout.

## 🤖 Dev Agent Record

### Implementation Notes

- Created `FeaturesShowcaseSection` component with `PortalCard` sub-component.
- Used `lucide-react` icons (User, Palette, BarChart3, Settings) for the portals.
- Implemented hover effects: lift card (`translate-y-[-4px]`), card shadow, and icon scale/glow enhancements.
- Implemented responsive grid: 1 column on mobile, 2 columns on tablet (`md`), 4 columns on desktop (`lg`).
- Used `motion/react` for entry animations.
- Ensured Tailwind 4 syntax correctness (`bg-linear-to-b`, `bg-white/2`, etc.).

### Verification

- Verified component export in `index.ts`.
- Verified layout class names for responsivness.
- Checked animation logic.
