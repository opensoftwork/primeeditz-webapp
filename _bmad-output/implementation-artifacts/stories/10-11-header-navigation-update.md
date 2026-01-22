# Story 10-11: Header Navigation Update

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: backlog  
**Complexity**: Low (2 points)  
**Created**: 2026-01-22  
**Priority**: P1 — Navigation enhancement

---

## 📋 User Story

**As a** Visitor,  
**I want** the header navigation to reflect the landing page sections,  
**So that** I can quickly navigate to specific content.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                | Status    | Notes                                       |
| ------------------------- | --------- | ------------------------------------------- |
| **10-10 - Page Assembly** | backlog   | Section IDs needed                          |
| **Existing Header**       | ✅ Exists | `src/components/modules/landing/header.tsx` |

### Enables

| Story / Epic        | Notes               |
| ------------------- | ------------------- |
| **10-13 - Testing** | Navigation testable |

---

## ✅ Acceptance Criteria

### AC1: Navigation Links

- [ ] **Given** I am viewing the header
- [ ] **Then** I see the following links:
  - Logo (links to /)
  - Features (scrolls to #features)
  - Pricing (scrolls to #pricing)
  - About (links to /about)
  - Contact (links to /contact)
  - Sign In (links to /sign-in)
  - **Get Started** button (links to /sign-up)

### AC2: Smooth Scroll

- [ ] **Given** I click "Features" or "Pricing"
- [ ] **Then** the page smoothly scrolls to that section
- [ ] **And** the URL hash updates

### AC3: Sticky Header

- [ ] **Given** I scroll down the page
- [ ] **Then** the header remains fixed at top
- [ ] **And** has backdrop blur effect

### AC4: Mobile Menu Update

- [ ] **Given** I am on mobile
- [ ] **When** I open the menu
- [ ] **Then** I see all navigation links
- [ ] **And** clicking a link closes the menu and scrolls

### AC5: Active State (Optional)

- [ ] **Given** I scroll to a section
- [ ] **Then** the corresponding nav link highlights

---

## 🎨 Design Specifications

### Header Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  🎬 PRIMEEDITZ    Features  Pricing  About  Contact    [Sign In] [Get Started]
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Styling

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: color-mix(in oklch, var(--background) 80%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-link {
  color: var(--muted-foreground);
  font-size: 0.875rem;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--foreground);
}

.nav-cta {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
```

---

## 📘 Implementation Tasks

### Task 1: Update Header Component

**File**: `src/components/modules/landing/header.tsx`

- [ ] 1.1 Update navigation links array
- [ ] 1.2 Add anchor link handling
- [ ] 1.3 Add "Get Started" CTA button

### Task 2: Implement Smooth Scroll

```typescript
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
    // Update URL hash without jumping
    window.history.pushState(null, "", `#${id}`);
  }
};
```

- [ ] 2.1 Create scroll handler function
- [ ] 2.2 Apply to anchor links
- [ ] 2.3 Test smooth scrolling

### Task 3: Update Mobile Menu

**File**: `src/components/modules/landing/mobile-menu.tsx`

- [ ] 3.1 Add all navigation links
- [ ] 3.2 Close menu on link click
- [ ] 3.3 Trigger smooth scroll from mobile

### Task 4: Active Section Detection (Optional)

- [ ] 4.1 Use IntersectionObserver
- [ ] 4.2 Track current section
- [ ] 4.3 Highlight active nav link

### Task 5: Ensure Sticky Behavior

- [ ] 5.1 Verify fixed positioning
- [ ] 5.2 Check backdrop blur on scroll
- [ ] 5.3 Test on all browsers

---

## 🧪 Testing Checklist

- [ ] All nav links present
- [ ] Logo links to home
- [ ] Features/Pricing scroll to sections
- [ ] About/Contact link to pages
- [ ] Sign In links to /sign-in
- [ ] Get Started links to /sign-up
- [ ] Mobile menu works
- [ ] Sticky header on scroll
- [ ] Backdrop blur visible

---

## 🚀 Definition of Done

- [ ] Header updated with new links
- [ ] Smooth scroll working
- [ ] Mobile menu updated
- [ ] Sticky behavior preserved
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |

---

**Previous Story**: 10-10 - Page Assembly & Animations  
**Next Story**: 10-12 - SEO & Meta Tags
