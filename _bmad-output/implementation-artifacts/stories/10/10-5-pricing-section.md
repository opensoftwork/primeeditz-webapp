# Story 10-5: Pricing Section

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: done
**Complexity**: Medium (3 points)  
**Created**: 2026-01-22  
**Priority**: P1 — Conversion critical

---

## 📋 User Story

**As a** Visitor,  
**I want** to see transparent pricing tiers,  
**So that** I can choose the right plan for my studio size.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On            | Status     | Notes                      |
| --------------------- | ---------- | -------------------------- |
| **10-0 - Foundation** | backlog    | Directory structure needed |
| **PRD Pricing**       | ✅ Defined | Tier details from PRD      |

### Enables

| Story / Epic              | Notes                      |
| ------------------------- | -------------------------- |
| **10-10 - Page Assembly** | Section will be integrated |

---

## ✅ Acceptance Criteria

### AC1: Pricing Tiers Display

- [x] **Given** I am viewing the Pricing section
- [x] **When** I see the pricing cards
- [x] **Then** I see 4 pricing tiers:

| Plan       | Monthly Price | Events    | Storage | Users  | CTA                  |
| ---------- | ------------- | --------- | ------- | ------ | -------------------- |
| Free       | ₹0            | 5         | 5GB     | 1      | Get Started          |
| Pro        | ₹999          | 50        | 50GB    | 5      | Start Free Trial     |
| Business   | ₹2,499        | Unlimited | 200GB   | 15     | **Start Free Trial** |
| Enterprise | Custom        | Unlimited | Custom  | Custom | Contact Sales        |

### AC2: Popular Tier Highlight

- [x] **Given** the Business tier
- [x] **Then** it must be highlighted as "Popular" or "Most Popular"
- [x] **And** have a distinct visual style (larger, different border, badge)

### AC3: Feature List

- [x] **Given** each pricing card
- [x] **Then** it shows key features with checkmarks:
  - Number of events
  - Storage amount
  - Number of users
  - Support level
  - Additional features per tier

### AC4: CTA Buttons

- [x] **Given** each tier
- [x] **Then** the CTA button:
  - Free: "Get Started" → /sign-up
  - Pro: "Start Free Trial" → /sign-up?plan=pro
  - Business: "Start Free Trial" → /sign-up?plan=business
  - Enterprise: "Contact Sales" → /contact

### AC5: Annual/Monthly Toggle (Optional)

- [x] **Given** the toggle is implemented
- [x] **When** I switch to annual billing
- [x] **Then** prices update with 20% discount
- [x] **And** savings amount is displayed

### AC6: Responsive Layout

- [x] **Given** different screen sizes
- [x] **Then** layout adapts:
  - Mobile: Single column, scrollable
  - Tablet: 2x2 grid
  - Desktop: 4-column row

---

## 🎨 Design Specifications

### Section Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIMPLE, TRANSPARENT PRICING                                                 │
│  ───────────────────────────                                                 │
│                                                                              │
│           [Monthly]  ○──────○  [Annual - Save 20%]                          │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  ┌─────────────┐     │
│  │ FREE        │  │ PRO         │  │ ⭐ BUSINESS     │  │ ENTERPRISE  │     │
│  │             │  │             │  │ MOST POPULAR    │  │             │     │
│  │ ₹0          │  │ ₹999        │  │ ₹2,499          │  │ Custom      │     │
│  │ /month      │  │ /month      │  │ /month          │  │             │     │
│  │             │  │             │  │                 │  │             │     │
│  │ ✓ 5 events  │  │ ✓ 50 events │  │ ✓ Unlimited     │  │ ✓ Unlimited │     │
│  │ ✓ 5GB       │  │ ✓ 50GB      │  │ ✓ 200GB         │  │ ✓ Custom    │     │
│  │ ✓ 1 user    │  │ ✓ 5 users   │  │ ✓ 15 users      │  │ ✓ Unlimited │     │
│  │ ✓ Email     │  │ ✓ Priority  │  │ ✓ Priority      │  │ ✓ Dedicated │     │
│  │             │  │             │  │ ✓ Analytics     │  │ ✓ Custom    │     │
│  │             │  │             │  │                 │  │             │     │
│  │[Get Started]│  │[Start Trial]│  │ [Start Trial]   │  │[Contact Us] │     │
│  └─────────────┘  └─────────────┘  └─────────────────┘  └─────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Popular Card Styling

```css
.pricing-card--popular {
  border: 2px solid var(--primary);
  transform: scale(1.05);
  box-shadow: 0 0 40px rgba(var(--primary-rgb), 0.2);
  position: relative;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 0.25rem 1rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}
```

---

## 📘 Implementation Tasks

### Task 1: Create Component File

**File**: `src/components/modules/landing/sections/pricing.tsx`

- [x] 1.1 Create base component structure
- [x] 1.2 Define pricing tiers data array
- [x] 1.3 Define features per tier

### Task 2: Build Pricing Card Component

- [x] 2.1 Create PricingCard sub-component
- [x] 2.2 Add tier name and price
- [x] 2.3 Add feature list with checkmarks
- [x] 2.4 Add CTA button with correct link
- [x] 2.5 Add popular badge for Business tier

### Task 3: Implement Toggle (Optional)

- [x] 3.1 Create billing toggle component
- [x] 3.2 Calculate annual prices (20% off)
- [x] 3.3 Animate price change

### Task 4: Create Responsive Grid

- [x] 4.1 Implement 4-column desktop grid
- [x] 4.2 Implement 2x2 tablet grid
- [x] 4.3 Implement single column mobile
- [x] 4.4 Handle popular card scaling

### Task 5: Export from Index

- [x] 5.1 Add export to `sections/index.ts`

---

## 🧪 Testing Checklist

- [x] All 4 tiers render correctly
- [x] Prices display correctly
- [x] Features list complete
- [x] Popular badge visible on Business
- [x] CTA buttons link correctly
- [x] Responsive on all breakpoints
- [x] Toggle works (if implemented)

---

## 🚀 Definition of Done

- [x] Component created at correct path
- [x] All 4 pricing tiers displayed
- [x] Popular tier highlighted
- [x] CTAs link to correct pages
- [x] Responsive layout complete
- [x] Exported from sections index
- [x] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |
| 2026-01-22 | implementation complete | Implemented component, toggle, and responsive grid |

---

**Previous Story**: 10-4 - Who It's For Section  
**Next Story**: 10-6 - FAQ Section

---

## Review Notes

- **Adversarial review completed**
- **Findings**: 4 total
  - Magic numbers in discount calculation (Fixed)
  - Accessibility missing on Switch (Fixed)
  - Loose typing on PricingTier (Fixed)
  - Hardcoded data (Accepted for MVP)
- **Resolution approach**: Auto-fix
- **Status**: done