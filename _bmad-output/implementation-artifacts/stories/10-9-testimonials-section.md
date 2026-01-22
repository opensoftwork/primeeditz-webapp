# Story 10-9: Testimonials Section (Placeholder)

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: backlog  
**Complexity**: Low (1 point)  
**Created**: 2026-01-22  
**Priority**: P2 — Future social proof

---

## 📋 User Story

**As a** Visitor,  
**I want** to see social proof from other studios,  
**So that** I trust PrimeEditz is a reliable solution.

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

### AC1: Placeholder Display

- [ ] **Given** we are in beta phase
- [ ] **Then** the section shows placeholder testimonials
- [ ] **Or** a "Coming Soon" message

### AC2: Testimonial Card Structure

- [ ] **Given** each testimonial card
- [ ] **Then** it must have:
  - Quote text
  - Avatar (placeholder or initials)
  - Name
  - Company/Role
  - Star rating (optional)

### AC3: Layout

- [ ] **Given** multiple testimonials
- [ ] **Then** they display as a grid or carousel
- [ ] **And** responsive on all screen sizes

---

## 🎨 Design Specifications

### Section Layout (Placeholder)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TRUSTED BY CREATIVE STUDIOS                                                 │
│  ────────────────────────────                                                │
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │ ❝                   │  │ ❝                   │  │ ❝                   │  │
│  │ PrimeEditz has      │  │ Finally, a tool     │  │ Our team loves      │  │
│  │ transformed how we  │  │ that understands    │  │ how organized       │  │
│  │ manage our studio.  │  │ creative studios.   │  │ everything is now.  │  │
│  │                     │  │                     │  │                     │  │
│  │ ⭐⭐⭐⭐⭐           │  │ ⭐⭐⭐⭐⭐           │  │ ⭐⭐⭐⭐⭐           │  │
│  │                     │  │                     │  │                     │  │
│  │ 👤 Priya S.         │  │ 👤 Raj M.           │  │ 👤 Anita K.         │  │
│  │ Wedding Studio      │  │ Video Agency        │  │ Freelancer          │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                                                              │
│  [Note: Placeholder testimonials for beta. Replace with real ones post-launch]│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Card Styling

```css
.testimonial-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  padding: 2rem;
}

.testimonial-quote {
  font-size: 1rem;
  font-style: italic;
  color: var(--foreground);
  margin-bottom: 1rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.testimonial-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 📘 Implementation Tasks

### Task 1: Create Component File

**File**: `src/components/modules/landing/sections/testimonials.tsx`

- [ ] 1.1 Create base component structure
- [ ] 1.2 Define placeholder testimonials data

### Task 2: Build Testimonial Card

- [ ] 2.1 Create TestimonialCard sub-component
- [ ] 2.2 Add quote icon
- [ ] 2.3 Add quote text
- [ ] 2.4 Add star rating (optional)
- [ ] 2.5 Add author info with avatar

### Task 3: Create Grid Layout

- [ ] 3.1 Implement 3-column grid
- [ ] 3.2 Make responsive
- [ ] 3.3 Center on mobile

### Task 4: Add Placeholder Note

- [ ] 4.1 Add subtle "Beta - real testimonials coming soon" note
- [ ] 4.2 Style as muted text

### Task 5: Export from Index

- [ ] 5.1 Add export to `sections/index.ts`

---

## 📝 Placeholder Testimonials

```typescript
const testimonials = [
  {
    quote:
      "PrimeEditz has transformed how we manage our studio. No more WhatsApp chaos!",
    name: "Priya S.",
    role: "Wedding Studio Owner",
    rating: 5,
  },
  {
    quote:
      "Finally, a tool that understands creative studios. The quotation system alone saves us hours.",
    name: "Raj M.",
    role: "Video Production Head",
    rating: 5,
  },
  {
    quote:
      "Our team loves how organized everything is now. Clients are impressed too!",
    name: "Anita K.",
    role: "Freelance Photographer",
    rating: 5,
  },
];
```

---

## 🧪 Testing Checklist

- [ ] All 3 testimonials render
- [ ] Quotes display correctly
- [ ] Author info visible
- [ ] Stars display (if implemented)
- [ ] Responsive layout works
- [ ] Placeholder note visible

---

## 🚀 Definition of Done

- [ ] Component created at correct path
- [ ] Placeholder testimonials displayed
- [ ] Card design complete
- [ ] Responsive layout working
- [ ] Exported from sections index
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |

---

**Previous Story**: 10-8 - Footer Section  
**Next Story**: 10-10 - Page Assembly & Animations
