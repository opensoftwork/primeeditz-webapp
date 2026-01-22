# Story 10-8: Footer Section

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: backlog  
**Complexity**: Low (2 points)  
**Created**: 2026-01-22  
**Priority**: P0 — Essential page element

---

## 📋 User Story

**As a** Visitor,  
**I want** to navigate to other pages and find company information,  
**So that** I can explore more about PrimeEditz.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On            | Status    | Notes                                     |
| --------------------- | --------- | ----------------------------------------- |
| **10-0 - Foundation** | backlog   | Directory structure needed                |
| **Logo Component**    | ✅ Exists | `src/components/modules/landing/logo.tsx` |

### Enables

| Story / Epic              | Notes                      |
| ------------------------- | -------------------------- |
| **10-10 - Page Assembly** | Section will be integrated |

---

## ✅ Acceptance Criteria

### AC1: Navigation Columns

- [ ] **Given** I am viewing the footer
- [ ] **Then** I see 4 navigation columns:

| Column        | Links                            |
| ------------- | -------------------------------- |
| **Product**   | Features, Pricing, Changelog     |
| **Resources** | Documentation, Help Center       |
| **Company**   | About, Contact, Careers          |
| **Legal**     | Privacy Policy, Terms of Service |

### AC2: Footer Elements

- [ ] **Given** the footer
- [ ] **Then** it must include:
  - PrimeEditz logo
  - Navigation columns
  - Copyright notice: "© 2026 PrimeEditz. All rights reserved."
  - Social media links (Twitter, LinkedIn, Instagram)

### AC3: Link Behavior

- [ ] **Given** I click a footer link
- [ ] **Then** it navigates to the correct page
- [ ] **And** external links open in new tab

### AC4: Responsive Layout

- [ ] **Given** different screen sizes
- [ ] **Then** layout adapts:
  - Mobile: 2x2 grid, stacked logo/copyright
  - Tablet: 4-column row
  - Desktop: Full footer layout

---

## 🎨 Design Specifications

### Section Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │  🎬 PRIMEEDITZ                                                          ││
│  │                                                                         ││
│  │  Product        Resources       Company         Legal                   ││
│  │  ─────────      ─────────       ─────────       ─────────               ││
│  │  Features       Documentation   About           Privacy Policy          ││
│  │  Pricing        Help Center     Contact         Terms of Service        ││
│  │  Changelog                      Careers                                 ││
│  │                                                                         ││
│  │  ─────────────────────────────────────────────────────────────────────  ││
│  │                                                                         ││
│  │  © 2026 PrimeEditz. All rights reserved.        [𝕏] [in] [📷]          ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Styling

```css
.footer {
  background: oklch(0.12 0 0); /* Darker than page bg */
  padding: 4rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-columns {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-column-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--foreground);
  margin-bottom: 1rem;
}

.footer-link {
  display: block;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  padding: 0.25rem 0;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--foreground);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.social-links a {
  color: var(--muted-foreground);
  margin-left: 1rem;
  transition: color 0.2s;
}

.social-links a:hover {
  color: var(--primary);
}
```

---

## 📘 Implementation Tasks

### Task 1: Create Component File

**File**: `src/components/modules/landing/sections/footer.tsx`

- [ ] 1.1 Create base component structure
- [ ] 1.2 Import Logo component
- [ ] 1.3 Import Link from Next.js

### Task 2: Define Navigation Data

```typescript
const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Help Center", href: "/help" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};
```

- [ ] 2.1 Define link structure
- [ ] 2.2 Include anchor links for same-page navigation

### Task 3: Build Footer Columns

- [ ] 3.1 Create column heading component
- [ ] 3.2 Create link list component
- [ ] 3.3 Map over footerLinks data

### Task 4: Add Footer Bottom

- [ ] 4.1 Add copyright text with dynamic year
- [ ] 4.2 Add social media icons (Twitter, LinkedIn, Instagram)
- [ ] 4.3 Import icons from Lucide

### Task 5: Responsive Layout

- [ ] 5.1 Implement 5-column desktop (logo + 4 nav columns)
- [ ] 5.2 Implement 2x2 mobile grid
- [ ] 5.3 Stack logo and bottom on mobile

### Task 6: Export from Index

- [ ] 6.1 Add export to `sections/index.ts`

---

## 🧪 Testing Checklist

- [ ] Logo displays correctly
- [ ] All 4 navigation columns render
- [ ] All links functional
- [ ] External links open in new tab
- [ ] Copyright shows current year
- [ ] Social icons display and link
- [ ] Responsive on mobile/tablet/desktop

---

## 🚀 Definition of Done

- [ ] Component created at correct path
- [ ] All navigation columns populated
- [ ] Links functional
- [ ] Social links working
- [ ] Copyright with dynamic year
- [ ] Responsive layout complete
- [ ] Exported from sections index
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |

---

**Previous Story**: 10-7 - CTA Banner Section  
**Next Story**: 10-9 - Testimonials Section
