# Landing Page Implementation Plan

## PrimeEditz — Premium Creative Workflow Platform

**Document Version**: 1.0  
**Created**: 2026-01-22  
**Author**: Combined PM (John) & Analyst (Mary) Analysis  
**Status**: Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Landing Page Sections](#3-landing-page-sections)
4. [Design System Alignment](#4-design-system-alignment)
5. [Hero Section Redesign](#5-hero-section-redesign)
6. [Section Specifications](#6-section-specifications)
7. [Asset Requirements](#7-asset-requirements)
8. [Implementation Phases](#8-implementation-phases)
9. [File Structure](#9-file-structure)
10. [Acceptance Criteria](#10-acceptance-criteria)

---

## 1. Executive Summary

### 1.1 Purpose

Transform the existing minimal landing page into a **premium, conversion-focused experience** that:

- Communicates PrimeEditz's value proposition clearly
- Showcases the platform's capabilities
- Builds trust with the target audience (creative studios)
- Drives signups and conversions

### 1.2 Target Audience Recap

| Segment       | Description                                                         | Priority |
| ------------- | ------------------------------------------------------------------- | -------- |
| **Primary**   | Small-to-Medium Creative Studios (3-20 employees, ₹10L-2Cr revenue) | High     |
| **Secondary** | Freelance Photographers/Videographers (Solo or 1-2 contractors)     | Medium   |

### 1.3 Key Value Propositions

1. **Unified Workflow** — From request to delivery in one platform
2. **Professional Client Experience** — Make clients feel like royalty
3. **Complete Visibility** — Real-time status tracking eliminates "is my work ready?" calls
4. **Time Savings** — Template-based quotations, automated folder structures

---

## 2. Current State Analysis

### 2.1 What Exists

| Component          | File                                                           | Status                       |
| ------------------ | -------------------------------------------------------------- | ---------------------------- |
| Hero Section       | `src/components/modules/landing/hero.tsx`                      | ✅ Exists (needs update)     |
| Dashboard Preview  | `src/components/modules/landing/modules/dashboard-preview.tsx` | ✅ Exists (needs hero image) |
| Header             | `src/components/modules/landing/header.tsx`                    | ✅ Exists                    |
| 3D Background (GL) | `src/components/modules/landing/gl/`                           | ✅ Exists                    |
| Page Transitions   | `src/components/modules/landing/page-transition.tsx`           | ✅ Exists                    |
| Contact Page       | `src/app/(landing)/contact/`                                   | ✅ Exists                    |
| About Page         | `src/app/(landing)/about/`                                     | ✅ Exists                    |

### 2.2 What's Missing

| Component                | Priority | Description                                             |
| ------------------------ | -------- | ------------------------------------------------------- |
| Hero Image               | P0       | Dashboard screenshot matching current design            |
| Problem/Solution Section | P0       | Pain points and how PrimeEditz solves them              |
| Features Section         | P0       | 4-portal showcase (Client, Employee, Admin, SuperAdmin) |
| Workflow Demo            | P0       | Visual step-by-step of the platform                     |
| Testimonials             | P1       | Social proof (can use placeholder initially)            |
| Pricing Section          | P1       | Free, Pro, Business, Enterprise tiers                   |
| FAQ Section              | P2       | Common questions and answers                            |
| Footer                   | P0       | Links, social, newsletter signup                        |

### 2.3 Dashboard Reference

The current admin dashboard (`src/components/modules/admin/dashboard/index.tsx`) features:

- Premium dark glassmorphic cards
- Stat cards with glow effects (Amber, Cyan, Emerald)
- Grid background patterns (`bg-grid-white/[0.01]`)
- Uppercase mono typography with wide letter-spacing
- Neon accent borders and shadows

---

## 3. Landing Page Sections

### 3.1 Section Flow (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [1] NAVIGATION HEADER                                                       │
│      Logo | Features | Pricing | About | Contact | [Sign In] [Get Started]  │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [2] HERO SECTION                                                            │
│                                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────────────────────┐  │
│  │ "Unlock your        │  │                                              │  │
│  │  Next efficiency    │  │           DASHBOARD PREVIEW                  │  │
│  │  hit"               │  │           (Premium Screenshot)               │  │
│  │                     │  │                                              │  │
│  │ [Contact Us]        │  │                                              │  │
│  └─────────────────────┘  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [3] PROBLEM/SOLUTION SECTION                                                │
│                                                                              │
│  "The chaos we fix"                                                         │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Scattered    │  │ File         │  │ Status       │  │ No           │    │
│  │ Communication│  │ Chaos        │  │ Anxiety      │  │ Accountability   │
│  │              │  │              │  │              │  │              │    │
│  │ → Unified    │  │ → Organized  │  │ → Real-time  │  │ → Complete   │    │
│  │   Portal     │  │   Folders    │  │   Tracking   │  │   Audit Trail│    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [4] FEATURES SHOWCASE (4 Portals)                                           │
│                                                                              │
│  "One platform, four experiences"                                           │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  CLIENT PORTAL          EMPLOYEE PORTAL      ADMIN PORTAL    SUPERADMIN│ │
│  │  • Request              • My Tasks           • All Events    • Settings│ │
│  │  • Upload               • Edit               • Sessions      • Templates│
│  │  • Track                • Submit             • Assign        • Pricing │ │
│  │  • Approve              • Notes              • Review        • Users   │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [5] WORKFLOW DEMO                                                           │
│                                                                              │
│  "From request to delivery"                                                 │
│                                                                              │
│   ① REQUEST  →  ② QUOTE  →  ③ UPLOAD  →  ④ EDIT  →  ⑤ REVIEW  →  ⑥ DELIVER │
│                                                                              │
│  [Interactive timeline with screenshots for each step]                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [6] WHO IT'S FOR                                                            │
│                                                                              │
│  "Built for creative professionals"                                         │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ WEDDING STUDIOS      │  │ VIDEO AGENCIES       │  │ FREELANCERS      │  │
│  │ Manage 50+ events/yr │  │ Corporate production │  │ Look professional│  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [7] PRICING SECTION                                                         │
│                                                                              │
│  "Simple, transparent pricing"                                              │
│                                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐    │
│  │  FREE    │  │    PRO       │  │    BUSINESS      │  │  ENTERPRISE  │    │
│  │  ₹0/mo   │  │  ₹999/mo     │  │   ₹2,499/mo      │  │   Custom     │    │
│  │          │  │              │  │   (POPULAR)      │  │              │    │
│  │ 5 events │  │ 50 events    │  │ Unlimited        │  │ Unlimited    │    │
│  │ 5GB      │  │ 50GB         │  │ 200GB            │  │ Custom       │    │
│  │ 1 user   │  │ 5 users      │  │ 15 users         │  │ Priority     │    │
│  └──────────┘  └──────────────┘  └──────────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [8] TESTIMONIALS (Future)                                                   │
│                                                                              │
│  "Trusted by creative studios"                                              │
│                                                                              │
│  [Cards with client quotes - placeholder for beta]                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [9] FAQ SECTION                                                             │
│                                                                              │
│  "Frequently asked questions"                                               │
│                                                                              │
│  • How does file storage work?                                              │
│  • Can I invite my team?                                                    │
│  • What file formats are supported?                                         │
│  • How do quotations work?                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [10] CTA BANNER                                                             │
│                                                                              │
│  "Ready to transform your workflow?"                                        │
│                                                                              │
│  [Get Started Free]  [Schedule Demo]                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [11] FOOTER                                                                 │
│                                                                              │
│  Logo    Product     Resources    Company    Legal                          │
│          Features    Docs         About      Privacy                        │
│          Pricing     Blog         Contact    Terms                          │
│          Changelog   Help                                                   │
│                                                                              │
│  © 2026 PrimeEditz. All rights reserved.        [Twitter] [LinkedIn]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Design System Alignment

### 4.1 Color Tokens (From `globals.css`)

| Token                | Dark Mode Value                | Purpose         |
| -------------------- | ------------------------------ | --------------- |
| `--background`       | `oklch(0.2046 0 0)`            | Page background |
| `--card`             | `oklch(0.2686 0 0)`            | Card surfaces   |
| `--primary`          | `oklch(0.6231 0.188 259.8145)` | CTAs, links     |
| `--brand-blue`       | `#0093dd`                      | Landing accent  |
| `--foreground`       | `oklch(0.9219 0 0)`            | Primary text    |
| `--muted-foreground` | `oklch(0.7155 0 0)`            | Secondary text  |

### 4.2 Typography

| Element        | Font             | Weight           | Tracking          |
| -------------- | ---------------- | ---------------- | ----------------- |
| Hero Title     | `Sentient`       | 200 (Extralight) | `-0.02em`         |
| Section Titles | `Inter`          | 900 (Black)      | `0.3em` uppercase |
| Body           | `Inter`          | 400              | Normal            |
| Mono Labels    | `JetBrains Mono` | 700              | `0.2em` uppercase |

### 4.3 Visual Effects

```css
/* Premium glassmorphism */
.glass {
  background: color-mix(in oklch, var(--background) 80%, transparent);
  backdrop-filter: blur(12px);
}

/* Glow shadows */
--shadow-glow: 0 0 8px 2px var(--tw-shadow-color);

/* Grid background */
.bg-grid-white/[0.01] {
  /* Used in dashboard cards */
}
```

### 4.4 Dashboard Component Patterns

Reference from `AdminDashboard`:

- Stat cards with colored icons and glow (Amber, Cyan, Emerald)
- Rounded corners: `rounded-3xl` for cards, `rounded-[2.5rem]` for large containers
- Border: `border border-white/5`
- Background: `bg-white/2`

---

## 5. Hero Section Redesign

### 5.1 Current Implementation

```tsx
// Current hero.tsx structure:
<div className="flex flex-col lg:flex-row gap-8">
  {/* Left: Text + CTA (1/3) */}
  {/* Right: Dashboard Preview (2/3) */}
</div>
```

### 5.2 Proposed Changes

1. **Update headline copy** to be more benefit-focused
2. **Generate new hero image** from actual dashboard design
3. **Add subtle animations** on scroll
4. **Improve responsive behavior** for mobile

### 5.3 Hero Copy Options

| Option | Headline                             | Subheadline                              |
| ------ | ------------------------------------ | ---------------------------------------- |
| **A**  | "Unlock your Next efficiency hit"    | (Current)                                |
| **B**  | "From chaos to clarity in one click" | Transform your studio workflow           |
| **C**  | "Your creative studio, organized"    | End file chaos. Start delivering faster. |

**Recommendation:** Keep Option A for now (already implemented), iterate post-launch.

### 5.4 Hero Image Requirements

Generate a dashboard screenshot showing:

- Dark glassmorphic aesthetic
- Stat cards with colored accents
- Data table with sample project data
- Premium shadows and depth
- No personal/real data visible

---

## 6. Section Specifications

### 6.1 Problem/Solution Section

**Component:** `src/components/modules/landing/sections/problem-solution.tsx`

**Content:**

| Problem                     | Visual                   | Solution                      |
| --------------------------- | ------------------------ | ----------------------------- |
| **Scattered Communication** | 💬 WhatsApp icon + chaos | Unified request portal        |
| **File Chaos**              | 📁 Messy folders         | Organized folder structure    |
| **Status Anxiety**          | 😰 Question marks        | Real-time progress tracking   |
| **Manual Quotations**       | 📝 Paper stack           | Template-based instant quotes |
| **No Accountability**       | ⚠️ Warning sign          | Complete audit trail          |

**Animation:** Cards reveal on scroll with staggered delay.

---

### 6.2 Features Showcase Section

**Component:** `src/components/modules/landing/sections/features.tsx`

**Structure:** 4-column grid (2x2 on tablet, 1x4 on desktop)

| Portal         | Icon | Key Features                         |
| -------------- | ---- | ------------------------------------ |
| **Client**     | 👤   | Request, Upload, Track, Approve      |
| **Employee**   | 🎨   | My Tasks, Edit, Submit, Notes        |
| **Admin**      | 📊   | All Events, Sessions, Assign, Review |
| **SuperAdmin** | ⚙️   | Settings, Templates, Pricing, Users  |

**Design:** Each portal card should have:

- Distinctive accent color
- Icon with glow effect
- Feature list with checkmarks
- "Learn more" link

---

### 6.3 Workflow Demo Section

**Component:** `src/components/modules/landing/sections/workflow.tsx`

**Timeline Steps:**

1. **Request** — Client submits project requirements
2. **Quote** — Admin generates quotation from templates
3. **Approve** — Client reviews and approves
4. **Upload** — Client uploads raw assets
5. **Edit** — Team works on deliverables
6. **Deliver** — Final files ready for download

**Design:** Horizontal timeline with:

- Step numbers in circles
- Active step highlighted
- Screenshots/illustrations for each step
- Mobile: Vertical timeline

---

### 6.4 Pricing Section

**Component:** `src/components/modules/landing/sections/pricing.tsx`

**Tiers (from PRD):**

| Plan       | Price            | Events    | Storage | Users  | CTA              |
| ---------- | ---------------- | --------- | ------- | ------ | ---------------- |
| Free       | ₹0/mo            | 5         | 5GB     | 1      | Get Started      |
| Pro        | ₹999/mo (~$12)   | 50        | 50GB    | 5      | Start Free Trial |
| Business   | ₹2,499/mo (~$30) | Unlimited | 200GB   | 15     | **Popular**      |
| Enterprise | Custom           | Unlimited | Custom  | Custom | Contact Sales    |

**Design:**

- Business tier highlighted as "Popular"
- All tiers have same card height
- Feature comparison list below
- Annual billing toggle (20% discount)

---

### 6.5 FAQ Section

**Component:** `src/components/modules/landing/sections/faq.tsx`

**Questions:**

1. How does file storage work?
2. Can I invite my team?
3. What file formats are supported?
4. How do quotations work?
5. Is there a mobile app?
6. How secure is my data?
7. Can I cancel anytime?
8. Do you offer custom solutions?

**Design:** Accordion style with smooth animations (Radix Accordion)

---

### 6.6 Footer Section

**Component:** `src/components/modules/landing/sections/footer.tsx`

**Columns:**

- **Product:** Features, Pricing, Changelog, Roadmap
- **Resources:** Documentation, Help Center, Blog
- **Company:** About, Contact, Careers
- **Legal:** Privacy Policy, Terms of Service

**Bottom:** Copyright + Social links (Twitter, LinkedIn, Instagram)

---

## 7. Asset Requirements

### 7.1 Images to Generate

| Asset                 | Description                | Size     | Priority |
| --------------------- | -------------------------- | -------- | -------- |
| `hero-dashboard.png`  | Admin dashboard screenshot | 1320x800 | P0       |
| `client-portal.png`   | Client dashboard mockup    | 600x400  | P1       |
| `workflow-step-1.png` | Request form screenshot    | 400x300  | P1       |
| `workflow-step-2.png` | Quotation view             | 400x300  | P1       |
| `workflow-step-3.png` | File upload interface      | 400x300  | P1       |
| `workflow-step-4.png` | Delivery confirmation      | 400x300  | P1       |

### 7.2 Icons Needed

From Lucide React (already in project):

- `MessageSquare`, `FolderOpen`, `Clock`, `FileText`, `Shield`
- `Users`, `Camera`, `Video`, `Briefcase`
- `Check`, `Star`, `ArrowRight`

### 7.3 Animations

- **Scroll reveal:** Sections fade in on scroll
- **Hover states:** Cards lift on hover
- **Timeline:** Steps highlight sequentially
- **Pricing toggle:** Smooth price update

---

## 8. Implementation Phases

### Phase 1: Foundation (Day 1)

| Task                                               | Priority | Est. Time |
| -------------------------------------------------- | -------- | --------- |
| Generate hero dashboard image                      | P0       | 30 min    |
| Create `/public/landing/` directory                | P0       | 5 min     |
| Update `dashboard-preview.tsx` with new image      | P0       | 15 min    |
| Create section component structure                 | P0       | 30 min    |
| Update main landing `page.tsx` to include sections | P0       | 20 min    |

### Phase 2: Core Sections (Day 2)

| Task                            | Priority | Est. Time |
| ------------------------------- | -------- | --------- |
| Build Problem/Solution section  | P0       | 1 hr      |
| Build Features Showcase section | P0       | 1.5 hr    |
| Build CTA Banner                | P0       | 30 min    |
| Build Footer                    | P0       | 1 hr      |

### Phase 3: Secondary Sections (Day 3)

| Task                        | Priority | Est. Time |
| --------------------------- | -------- | --------- |
| Build Pricing section       | P1       | 1.5 hr    |
| Build FAQ section           | P2       | 1 hr      |
| Build Workflow Demo section | P1       | 2 hr      |
| Add scroll animations       | P1       | 1 hr      |

### Phase 4: Polish (Day 4)

| Task                         | Priority | Est. Time |
| ---------------------------- | -------- | --------- |
| Responsive testing and fixes | P0       | 2 hr      |
| Performance optimization     | P1       | 1 hr      |
| SEO meta tags                | P1       | 30 min    |
| Cross-browser testing        | P1       | 1 hr      |

---

## 9. File Structure

```
src/
├── app/
│   └── (landing)/
│       ├── page.tsx                    # Main landing page (update)
│       ├── layout.tsx                  # Landing layout (exists)
│       ├── about/
│       ├── contact/
│       └── pricing/                    # NEW - Dedicated pricing page
│           └── page.tsx
│
├── components/
│   └── modules/
│       └── landing/
│           ├── hero.tsx                # Update with new copy
│           ├── header.tsx              # Update navigation
│           ├── sections/               # NEW - Section components
│           │   ├── problem-solution.tsx
│           │   ├── features.tsx
│           │   ├── workflow.tsx
│           │   ├── who-its-for.tsx
│           │   ├── pricing.tsx
│           │   ├── testimonials.tsx
│           │   ├── faq.tsx
│           │   ├── cta-banner.tsx
│           │   └── footer.tsx
│           └── modules/
│               └── dashboard-preview.tsx  # Update image path
│
└── public/
    └── landing/                        # NEW - Landing page assets
        ├── hero-dashboard.png
        ├── client-portal.png
        ├── workflow-step-1.png
        ├── workflow-step-2.png
        └── ...
```

---

## 10. Acceptance Criteria

### 10.1 Visual Requirements

| Criteria                                       | Target |
| ---------------------------------------------- | ------ |
| All sections match dark glassmorphic aesthetic | ✅     |
| Typography uses defined font stack             | ✅     |
| Colors match `globals.css` tokens              | ✅     |
| Animations are smooth (60fps)                  | ✅     |
| Glow effects on key elements                   | ✅     |

### 10.2 Responsive Requirements

| Breakpoint        | Layout                           |
| ----------------- | -------------------------------- |
| Mobile (375px+)   | Single column, stacked sections  |
| Tablet (768px+)   | 2-column grids where appropriate |
| Desktop (1024px+) | Full multi-column layouts        |
| Large (1280px+)   | Max-width container, centered    |

### 10.3 Performance Requirements

| Metric                   | Target |
| ------------------------ | ------ |
| Lighthouse Performance   | > 90   |
| First Contentful Paint   | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift  | < 0.1  |

### 10.4 SEO Requirements

| Element           | Requirement                               |
| ----------------- | ----------------------------------------- |
| Title tag         | "PrimeEditz — Creative Workflow Platform" |
| Meta description  | 160 chars summarizing value prop          |
| OG/Twitter cards  | Hero image + branding                     |
| Heading hierarchy | Single H1, logical H2-H6 structure        |

---

## Document Changelog

| Version | Date       | Author                | Changes                     |
| ------- | ---------- | --------------------- | --------------------------- |
| 1.0     | 2026-01-22 | John (PM) & Mary (BA) | Initial implementation plan |

---

## Next Steps

1. **[APPROVE]** Review and approve this plan
2. **[GEN]** Generate hero dashboard image
3. **[BUILD]** Start Phase 1 implementation
4. **[ITERATE]** Gather feedback and refine

---

_This plan was created using the BMAD methodology by John (PM) and Mary (BA)._  
_Ready to build, Life-design! 🚀_
