# Story 10-7: CTA Banner Section

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: backlog  
**Complexity**: Low (1 point)  
**Created**: 2026-01-22  
**Priority**: P0 — Conversion critical

---

## 📋 User Story

**As a** Visitor,  
**I want** to see clear calls-to-action throughout the page,  
**So that** I can easily sign up or request a demo.

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

### AC1: Banner Content

- [ ] **Given** I am viewing the CTA banner
- [ ] **Then** I see:
  - Compelling headline: "Ready to transform your workflow?"
  - Subheadline (optional): "Join creative studios saving hours every week"
  - Primary CTA: "Get Started Free"
  - Secondary CTA: "Schedule Demo"

### AC2: CTA Links

- [ ] **Given** I click "Get Started Free"
- [ ] **Then** I navigate to `/sign-up`
- [ ] **Given** I click "Schedule Demo"
- [ ] **Then** I navigate to `/contact`

### AC3: Visual Design

- [ ] **Given** the banner
- [ ] **Then** it must have:
  - Eye-catching background (gradient or pattern)
  - Centered content
  - Clear button hierarchy (primary vs secondary)
  - Subtle animation (glow pulse on primary button)

### AC4: Responsive

- [ ] **Given** mobile screens
- [ ] **Then** buttons stack vertically
- [ ] **And** text remains readable

---

## 🎨 Design Specifications

### Section Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │         READY TO TRANSFORM YOUR WORKFLOW?                               ││
│  │                                                                         ││
│  │     Join creative studios saving hours every week                       ││
│  │                                                                         ││
│  │         [Get Started Free]    [Schedule Demo]                           ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Styling

```css
.cta-banner {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    oklch(0.45 0.2 265) 100%
  );
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
}

.cta-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
}

.cta-headline {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.cta-subheadline {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

.cta-primary {
  background: white;
  color: var(--primary);
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  animation: pulse-glow 2s infinite;
}

.cta-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(255, 255, 255, 0.2);
  }
}
```

---

## 📘 Implementation Tasks

### Task 1: Create Component File

**File**: `src/components/modules/landing/sections/cta-banner.tsx`

- [ ] 1.1 Create base component structure
- [ ] 1.2 Add headline and subheadline
- [ ] 1.3 Import Button from shadcn/ui

### Task 2: Add CTA Buttons

- [ ] 2.1 Create primary button with Link to /sign-up
- [ ] 2.2 Create secondary button with Link to /contact
- [ ] 2.3 Style button hierarchy

### Task 3: Add Background Effects

- [ ] 3.1 Add gradient background
- [ ] 3.2 Add radial highlight overlay
- [ ] 3.3 Add pulse animation to primary button

### Task 4: Responsive Layout

- [ ] 4.1 Stack buttons on mobile
- [ ] 4.2 Adjust padding for mobile
- [ ] 4.3 Test all breakpoints

### Task 5: Export from Index

- [ ] 5.1 Add export to `sections/index.ts`

---

## 🧪 Testing Checklist

- [ ] Headline and subheadline render
- [ ] Primary button links to /sign-up
- [ ] Secondary button links to /contact
- [ ] Gradient background displays
- [ ] Pulse animation works
- [ ] Responsive on mobile

---

## 🚀 Definition of Done

- [ ] Component created at correct path
- [ ] CTA buttons functional
- [ ] Visual styling complete
- [ ] Animation working
- [ ] Exported from sections index
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |

---

**Previous Story**: 10-6 - FAQ Section  
**Next Story**: 10-8 - Footer Section
