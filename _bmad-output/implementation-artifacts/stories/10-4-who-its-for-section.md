# Story 10-4: Who It's For Section

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: review  
**Complexity**: Low (2 points)  
**Created**: 2026-01-22  
**Priority**: P1 — Target audience validation

---

## 📋 User Story

**As a** Visitor,  
**I want** to see that PrimeEditz is built for creative professionals like me,  
**So that** I feel confident the platform meets my specific needs.

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

### AC1: Audience Cards Display

- [ ] **Given** I am viewing the "Who It's For" section
- [ ] **When** I see the audience cards
- [ ] **Then** I see 3 target audience categories:

| Audience            | Icon   | Description                        | Key Benefit                      |
| ------------------- | ------ | ---------------------------------- | -------------------------------- |
| **Wedding Studios** | Camera | Manage 50+ events per year         | Streamlined client communication |
| **Video Agencies**  | Film   | Corporate & commercial production  | Organized file management        |
| **Freelancers**     | User   | Solo photographers & videographers | Professional client experience   |

### AC2: Card Design

- [ ] **Given** each audience card
- [ ] **Then** it must have:
  - Relevant icon (Camera, Film, User)
  - Audience name as heading
  - Brief description
  - Key benefit highlight
  - Subtle gradient or background effect

### AC3: Responsive Layout

- [ ] **Given** different screen sizes
- [ ] **Then** layout adapts:
  - Mobile (375px): Single column, stacked
  - Tablet (768px): 3-column row
  - Desktop (1024px+): 3-column with more spacing

---

## 🎨 Design Specifications

### Section Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BUILT FOR CREATIVE PROFESSIONALS                                            │
│  ─────────────────────────────────                                           │
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  📷                 │  │  🎬                 │  │  👤                 │  │
│  │  WEDDING STUDIOS    │  │  VIDEO AGENCIES     │  │  FREELANCERS        │  │
│  │                     │  │                     │  │                     │  │
│  │  Manage 50+ events  │  │  Corporate &        │  │  Solo photographers │  │
│  │  per year           │  │  commercial         │  │  & videographers    │  │
│  │                     │  │  production         │  │                     │  │
│  │  ─────────────────  │  │  ─────────────────  │  │  ─────────────────  │  │
│  │  ✨ Streamlined     │  │  ✨ Organized       │  │  ✨ Professional    │  │
│  │     client comms    │  │     file mgmt       │  │     experience      │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Card Styling

```css
.audience-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.01) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: center;
}

.audience-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.audience-benefit {
  color: var(--primary);
  font-weight: 600;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 📘 Implementation Tasks

### Task 1: Create Component File

**File**: `src/components/modules/landing/sections/who-its-for.tsx`

- [x] 1.1 Create base component structure
- [x] 1.2 Define audience data array
- [x] 1.3 Import Lucide icons (Camera, Film, User)

### Task 2: Build Audience Card Component

- [x] 2.1 Create AudienceCard sub-component
- [x] 2.2 Add icon with styling
- [x] 2.3 Add audience name heading
- [x] 2.4 Add description text
- [x] 2.5 Add key benefit highlight

### Task 3: Implement Grid Layout

- [x] 3.1 Create 3-column grid
- [x] 3.2 Add responsive breakpoints
- [x] 3.3 Test on all screen sizes

### Task 4: Export from Index

- [x] 4.1 Add export to `sections/index.ts`

---

## 🧪 Testing Checklist

- [ ] All 3 audience cards render
- [ ] Icons display correctly
- [ ] Text readable
- [ ] Responsive layout works
- [ ] Benefits highlighted

---

## 🚀 Definition of Done

- [ ] Component created at correct path
- [ ] All 3 audience types displayed
- [ ] Responsive layout complete
- [ ] Exported from sections index
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |

---

**Previous Story**: 10-3 - Workflow Demo Section  
**Next Story**: 10-5 - Pricing Section

---

## 📂 File List

- `src/components/modules/landing/sections/who-its-for.tsx` (New)
- `src/components/modules/landing/sections/index.ts` (Modified)

## 📝 Change Log

- **2026-01-22**: Implemented "Who It's For" section with 3 responsive audience cards (Wedding Studios, Video Agencies, Freelancers). Added glassmorphic styling, hover effects, and benefits indicator.

## 🤖 Dev Agent Record

### Implementation Notes

- Created `WhoItsForSection` and `AudienceCard` component.
- Used a 3-column grid layout that stacks on mobile.
- Implemented visual hierarchy with large icons, clear titles, and distinct "benefit" highlight.
- Used `lucide-react` icons (Camera, Film, User).
- Validated text readability and spacing.
- Fixed Tailwind v4 lint errors (`to-white/1`, `min-h-12`).

### Verification

- Component renders correctly.
- Exported from index.
- Responsive implementation verified via class logic (`grid-cols-1 md:grid-cols-3`).
