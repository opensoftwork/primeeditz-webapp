# Epic 10: Landing Page — Marketing & Conversion

**User Outcome:** Visitors can understand PrimeEditz's value proposition, explore features, view pricing, and sign up for the platform through a premium, conversion-optimized landing page.

**FRs covered:** LFR1 (Hero & Value Prop), LFR2 (Features Showcase), LFR3 (Pricing Display), LFR4 (Social Proof), LFR5 (Conversion CTAs)

**Scope:**

- Premium hero section with dashboard preview
- Problem/Solution showcase
- 4-portal features breakdown (Client, Employee, Admin, SuperAdmin)
- Interactive workflow demonstration
- Pricing tiers display
- FAQ section with accordions
- CTA banners for conversion
- Professional footer with navigation
- Responsive design (mobile-first)
- Scroll animations and micro-interactions
- SEO optimization

**Standalone:** ✅ Landing page is fully functional without authentication.

**Reference:** [Implementation Plan](./landing-page-implementation-plan.md)

---

## Landing Page Requirements

### LFR1: Hero & Value Proposition

- Compelling headline that communicates value
- Subheadline with platform description
- Primary CTA button (Get Started / Contact)
- Dashboard preview image/mockup
- 3D background effects (existing GL canvas)
- Beta badge/pill indicator

### LFR2: Features Showcase

- Problem/Solution comparison cards
- 4-portal feature breakdown
- Visual workflow demonstration
- "Who it's for" audience targeting

### LFR3: Pricing Display

- 4 pricing tiers (Free, Pro, Business, Enterprise)
- Feature comparison table
- Annual/monthly toggle (20% discount)
- Clear CTAs per tier

### LFR4: Social Proof

- Testimonials section (placeholder for beta)
- Trust indicators
- Client logos (future)

### LFR5: Conversion CTAs

- Strategic CTA banners throughout page
- Newsletter signup (optional)
- Contact/demo request links

---

## Stories

### Story 10.0: Landing Page Foundation & Asset Generation

**As a** Developer,
**I want** to set up the landing page infrastructure and generate required assets,
**So that** all landing page sections have the necessary foundation and images.

**Acceptance Criteria:**

- **Given** the existing landing page structure at `src/app/(landing)/`
- **When** I set up the foundation
- **Then** the following must be created:
  - `/public/landing/` directory for assets
  - `src/components/modules/landing/sections/` directory for section components
  - Hero dashboard image generated matching AdminDashboard aesthetic
  - Dashboard preview component updated to use new image

**Tasks:**

- [ ] Create `/public/landing/` directory
- [ ] Create `/src/components/modules/landing/sections/` directory
- [ ] Generate hero dashboard image (1320x800, dark glassmorphic)
- [ ] Update `dashboard-preview.tsx` with new image path
- [ ] Create section component index file

**Implementation Notes:**

- Hero image should match the AdminDashboard design system:
  - Dark glassmorphic cards (`bg-white/2`, `border-white/5`)
  - Stat cards with glow effects (Amber, Cyan, Emerald)
  - Grid pattern backgrounds
  - Rounded corners (`rounded-3xl`)

---

### Story 10.1: Problem/Solution Section

**As a** Visitor,
**I want** to understand the problems PrimeEditz solves,
**So that** I can see the value of the platform for my studio.

**Acceptance Criteria:**

- **Given** I am on the landing page
- **When** I scroll past the hero section
- **Then** I must see a Problem/Solution section showing:

| Problem                 | Solution                      |
| ----------------------- | ----------------------------- |
| Scattered Communication | Unified request portal        |
| File Chaos              | Organized folder structure    |
| Status Anxiety          | Real-time progress tracking   |
| Manual Quotations       | Template-based instant quotes |
| No Accountability       | Complete audit trail          |

- **And** each problem/solution must be displayed as a card with icon
- **And** cards must animate on scroll (fade in with stagger)
- **And** section must be responsive (single column on mobile, 5-column on desktop)

**Component:** `src/components/modules/landing/sections/problem-solution.tsx`

**Design Specs:**

- Section heading: "The chaos we fix"
- Card style: Dark glassmorphic (`glass-subtle`)
- Icons: Lucide React icons
- Animation: Scroll reveal with 100ms stagger

---

### Story 10.2: Features Showcase Section (4 Portals)

**As a** Visitor,
**I want** to see what each user portal offers,
**So that** I understand how PrimeEditz serves different roles.

**Acceptance Criteria:**

- **Given** I am viewing the Features section
- **When** I look at the portal cards
- **Then** I must see 4 portal cards:

| Portal         | Accent Color | Features                              |
| -------------- | ------------ | ------------------------------------- |
| **Client**     | Cyan         | Request, Upload, Track, Approve       |
| **Employee**   | Emerald      | My Tasks, Edit, Submit, Notes         |
| **Admin**      | Amber        | All Projects, Assign, Review, Reports |
| **SuperAdmin** | Purple       | Settings, Templates, Pricing, Users   |

- **And** each card must have:
  - Portal name with icon and accent glow
  - Feature list with checkmarks
  - "Learn more" link (optional, can be placeholder)
- **And** cards must be interactive with hover effects
- **And** layout must be 2x2 grid on tablet, 4-column on desktop

**Component:** `src/components/modules/landing/sections/features.tsx`

**Design Specs:**

- Section heading: "One platform, four experiences"
- Card hover: Lift effect with enhanced shadow
- Accent colors: Use dashboard stat card colors

---

### Story 10.3: Workflow Demo Section

**As a** Visitor,
**I want** to see the complete workflow from request to delivery,
**So that** I understand how the platform works end-to-end.

**Acceptance Criteria:**

- **Given** I am viewing the Workflow section
- **When** I interact with the timeline
- **Then** I must see 6 workflow steps:

| Step | Title   | Description                              |
| ---- | ------- | ---------------------------------------- |
| 1    | Request | Client submits project requirements      |
| 2    | Quote   | Admin generates quotation from templates |
| 3    | Approve | Client reviews and approves quotation    |
| 4    | Upload  | Client uploads raw assets to folders     |
| 5    | Edit    | Team works on deliverables               |
| 6    | Deliver | Final files ready for download           |

- **And** steps must be displayed as a horizontal timeline on desktop
- **And** steps must be displayed as a vertical timeline on mobile
- **And** each step must have an icon and brief description
- **And** (Optional) clicking a step shows a screenshot/illustration

**Component:** `src/components/modules/landing/sections/workflow.tsx`

**Design Specs:**

- Section heading: "From request to delivery"
- Timeline style: Connected dots with progress line
- Active step: Highlighted with primary color
- Mobile: Vertical stack with connecting line

---

### Story 10.4: Target Audience Section ("Who It's For")

**As a** Visitor,
**I want** to see that PrimeEditz is built for creative professionals like me,
**So that** I feel confident the platform meets my specific needs.

**Acceptance Criteria:**

- **Given** I am viewing the "Who It's For" section
- **When** I see the audience cards
- **Then** I must see 3 target audience categories:

| Audience            | Description                        | Key Benefit                      |
| ------------------- | ---------------------------------- | -------------------------------- |
| **Wedding Studios** | Manage 50+ events per year         | Streamlined client communication |
| **Video Agencies**  | Corporate & commercial production  | Organized file management        |
| **Freelancers**     | Solo photographers & videographers | Professional client experience   |

- **And** each card must have relevant icon and description
- **And** cards must be responsive (stack on mobile)

**Component:** `src/components/modules/landing/sections/who-its-for.tsx`

**Design Specs:**

- Section heading: "Built for creative professionals"
- Card style: Subtle gradient backgrounds
- Icons: Camera, Film, User icons from Lucide

---

### Story 10.5: Pricing Section

**As a** Visitor,
**I want** to see transparent pricing tiers,
**So that** I can choose the right plan for my studio size.

**Acceptance Criteria:**

- **Given** I am viewing the Pricing section
- **When** I see the pricing cards
- **Then** I must see 4 pricing tiers:

| Plan       | Monthly Price | Events    | Storage | Users  | CTA               |
| ---------- | ------------- | --------- | ------- | ------ | ----------------- |
| Free       | ₹0            | 5         | 5GB     | 1      | Get Started       |
| Pro        | ₹999          | 50        | 50GB    | 5      | Start Free Trial  |
| Business   | ₹2,499        | Unlimited | 200GB   | 15     | **Popular** badge |
| Enterprise | Custom        | Unlimited | Custom  | Custom | Contact Sales     |

- **And** "Business" tier must be highlighted as "Popular"
- **And** each tier must list key features
- **And** (Optional) annual/monthly toggle showing 20% discount for annual
- **And** all cards must have same height
- **And** CTAs must link to sign-up or contact

**Component:** `src/components/modules/landing/sections/pricing.tsx`

**Design Specs:**

- Section heading: "Simple, transparent pricing"
- Popular badge: Primary accent color with glow
- Price display: Large font with currency symbol
- Feature list: Checkmarks for included features

---

### Story 10.6: FAQ Section

**As a** Visitor,
**I want** to find answers to common questions,
**So that** I can resolve doubts before signing up.

**Acceptance Criteria:**

- **Given** I am viewing the FAQ section
- **When** I click on a question
- **Then** the answer must expand with smooth animation
- **And** clicking another question must close the previous one (accordion behavior)
- **And** the following questions must be included:

| Question                         |
| -------------------------------- |
| How does file storage work?      |
| Can I invite my team?            |
| What file formats are supported? |
| How do quotations work?          |
| Is there a mobile app?           |
| How secure is my data?           |
| Can I cancel anytime?            |
| Do you offer custom solutions?   |

- **And** accordion must be accessible (keyboard navigation, ARIA)

**Component:** `src/components/modules/landing/sections/faq.tsx`

**Design Specs:**

- Section heading: "Frequently asked questions"
- Accordion style: Radix UI Accordion component
- Animation: Smooth expand/collapse (200ms)
- Icons: Plus/Minus or Chevron indicators

---

### Story 10.7: CTA Banner Section

**As a** Visitor,
**I want** to see clear calls-to-action throughout the page,
**So that** I can easily sign up or request a demo.

**Acceptance Criteria:**

- **Given** I am viewing the landing page
- **When** I scroll near the bottom (before footer)
- **Then** I must see a prominent CTA banner with:
  - Compelling headline: "Ready to transform your workflow?"
  - Primary CTA: "Get Started Free" (links to /sign-up)
  - Secondary CTA: "Schedule Demo" (links to /contact)
  - Background with subtle gradient or pattern

- **And** CTAs must have hover states with transitions
- **And** banner must be responsive

**Component:** `src/components/modules/landing/sections/cta-banner.tsx`

**Design Specs:**

- Background: Gradient from primary to accent
- Buttons: Primary filled, Secondary outlined
- Animation: Subtle glow pulse on primary button

---

### Story 10.8: Footer Section

**As a** Visitor,
**I want** to navigate to other pages and find company information,
**So that** I can explore more about PrimeEditz.

**Acceptance Criteria:**

- **Given** I am viewing the footer
- **When** I look at the navigation columns
- **Then** I must see:

| Column        | Links                            |
| ------------- | -------------------------------- |
| **Product**   | Features, Pricing, Changelog     |
| **Resources** | Documentation, Help Center       |
| **Company**   | About, Contact, Careers          |
| **Legal**     | Privacy Policy, Terms of Service |

- **And** footer must include:
  - PrimeEditz logo
  - Copyright notice (© 2026 PrimeEditz)
  - Social media links (Twitter, LinkedIn, Instagram)
- **And** links must have hover states
- **And** footer must be responsive (stack columns on mobile)

**Component:** `src/components/modules/landing/sections/footer.tsx`

**Design Specs:**

- Background: Darker than page background
- Column layout: 4 columns on desktop, 2x2 on tablet, stacked on mobile
- Logo: Same as header logo
- Social icons: Lucide React icons

---

### Story 10.9: Testimonials Section (Placeholder)

**As a** Visitor,
**I want** to see social proof from other studios,
**So that** I trust PrimeEditz is a reliable solution.

**Acceptance Criteria:**

- **Given** I am viewing the Testimonials section
- **When** I see the testimonial cards
- **Then** I must see placeholder testimonials (for beta):
  - Quote text
  - Avatar (placeholder image or initials)
  - Name and company
  - Star rating (optional)

- **And** section can be hidden or show "Coming soon" for beta launch
- **And** testimonials must be displayed as a carousel or grid

**Component:** `src/components/modules/landing/sections/testimonials.tsx`

**Design Specs:**

- Section heading: "Trusted by creative studios"
- Card style: Glassmorphic with quote icon
- Avatar: Rounded, with fallback to initials
- Status: Can be marked as "BETA" or "Coming Soon"

---

### Story 10.10: Main Page Assembly & Scroll Animations

**As a** Developer,
**I want** to assemble all landing page sections with smooth scroll animations,
**So that** the landing page feels premium and cohesive.

**Acceptance Criteria:**

- **Given** all section components are built
- **When** I update the main landing page at `src/app/(landing)/page.tsx`
- **Then** sections must be rendered in order:
  1. Hero (existing)
  2. Problem/Solution
  3. Features (4 Portals)
  4. Workflow Demo
  5. Who It's For
  6. Pricing
  7. Testimonials (placeholder)
  8. FAQ
  9. CTA Banner
  10. Footer

- **And** each section must animate on scroll (fade in, slide up)
- **And** animations must be performant (60fps)
- **And** sections must have consistent vertical spacing
- **And** page must be responsive across all breakpoints

**Implementation Notes:**

- Use CSS animations with Intersection Observer or a library like `framer-motion`
- Existing animations in `globals.css`: `animate-fadeIn`, `animate-slideUp`
- Stagger delay between elements within sections

---

### Story 10.11: Header Navigation Update

**As a** Visitor,
**I want** the header navigation to reflect the landing page sections,
**So that** I can quickly navigate to specific content.

**Acceptance Criteria:**

- **Given** I am viewing the landing page header
- **When** I look at the navigation links
- **Then** I must see:
  - Logo (links to /)
  - Features (scrolls to #features)
  - Pricing (scrolls to #pricing)
  - About (links to /about)
  - Contact (links to /contact)
  - Sign In (links to /sign-in)
  - **Get Started** button (links to /sign-up)

- **And** smooth scroll must be enabled for anchor links
- **And** header must be sticky with glass effect
- **And** mobile menu must be updated with same links

**Component:** Update `src/components/modules/landing/header.tsx`

**Design Specs:**

- Sticky header: Fixed at top with backdrop blur
- Active section: Highlight current section in nav (optional)
- Mobile: Hamburger menu with slide-out panel

---

### Story 10.12: SEO & Meta Tags

**As a** Developer,
**I want** to implement proper SEO meta tags,
**So that** the landing page ranks well in search engines.

**Acceptance Criteria:**

- **Given** the landing page is complete
- **When** search engines crawl the page
- **Then** the following meta tags must be present:

| Meta           | Value                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Title          | PrimeEditz — Creative Workflow Platform for Studios                                                                                           |
| Description    | Transform chaotic studio operations into a streamlined, professional experience. Manage projects, quotations, and deliveries in one platform. |
| OG:Title       | PrimeEditz — Creative Workflow Platform                                                                                                       |
| OG:Description | From chaos to clarity for creative studios.                                                                                                   |
| OG:Image       | /og-image.png (hero dashboard screenshot)                                                                                                     |
| Twitter:Card   | summary_large_image                                                                                                                           |

- **And** proper heading hierarchy must be maintained (single H1)
- **And** all images must have alt text
- **And** canonical URL must be set

**Implementation:**

- Use Next.js `generateMetadata` in `src/app/(landing)/page.tsx`
- Create `/public/og-image.png` (1200x630)

---

### Story 10.13: Responsive Testing & Polish

**As a** Developer,
**I want** to ensure the landing page works perfectly on all devices,
**So that** visitors have a great experience regardless of screen size.

**Acceptance Criteria:**

- **Given** the landing page is built
- **When** I test on different breakpoints
- **Then** the following must pass:

| Breakpoint       | Layout                             | Target |
| ---------------- | ---------------------------------- | ------ |
| Mobile (375px)   | Single column, full-width sections | ✅     |
| Tablet (768px)   | 2-column grids where appropriate   | ✅     |
| Desktop (1024px) | Full multi-column layouts          | ✅     |
| Large (1280px)   | Max-width container, centered      | ✅     |

- **And** no horizontal scrolling on any breakpoint
- **And** all interactive elements are touch-friendly (44x44px min)
- **And** text remains readable without zooming

**Testing:**

- Test on Chrome DevTools device presets
- Test on real iOS Safari and Android Chrome
- Verify Lighthouse scores: Performance > 90, Accessibility > 90

---

## Epic Summary

| Story | Title                      | Priority | Est. Time |
| ----- | -------------------------- | -------- | --------- |
| 10.0  | Foundation & Assets        | P0       | 1 hr      |
| 10.1  | Problem/Solution           | P0       | 1 hr      |
| 10.2  | Features (4 Portals)       | P0       | 1.5 hr    |
| 10.3  | Workflow Demo              | P1       | 2 hr      |
| 10.4  | Who It's For               | P1       | 1 hr      |
| 10.5  | Pricing                    | P1       | 1.5 hr    |
| 10.6  | FAQ                        | P2       | 1 hr      |
| 10.7  | CTA Banner                 | P0       | 30 min    |
| 10.8  | Footer                     | P0       | 1 hr      |
| 10.9  | Testimonials (Placeholder) | P2       | 30 min    |
| 10.10 | Page Assembly & Animations | P0       | 1.5 hr    |
| 10.11 | Header Navigation          | P1       | 1 hr      |
| 10.12 | SEO & Meta Tags            | P1       | 30 min    |
| 10.13 | Responsive Testing         | P0       | 2 hr      |

**Total Estimated Time:** ~15 hours (2-3 days)

---

## Dependency Graph

```
Story 10.0: Foundation & Assets
    ↓
    ├─────────────────────────────────────────────────────┐
    ↓                                                     ↓
Story 10.1: Problem/Solution    Story 10.2: Features    ...
    ↓                                 ↓
    └─────────────────────────────────┘
                    ↓
            Story 10.10: Page Assembly
                    ↓
    ├─────────────────────────────────┐
    ↓                                 ↓
Story 10.11: Header Nav      Story 10.12: SEO
    ↓                                 ↓
    └─────────────────────────────────┘
                    ↓
            Story 10.13: Testing & Polish
```

---

## Definition of Done

- [ ] All sections are visually complete matching design system
- [ ] Responsive on mobile, tablet, and desktop
- [ ] Animations are smooth (60fps)
- [ ] Lighthouse Performance score > 90
- [ ] Lighthouse Accessibility score > 90
- [ ] All links functional
- [ ] Meta tags and SEO complete
- [ ] Cross-browser tested (Chrome, Safari, Firefox)
- [ ] Code follows Clean Architecture patterns

---

## Phase 2 Enhancements (Post-MVP)

| Feature                            | Description                                    |
| ---------------------------------- | ---------------------------------------------- |
| **Real Testimonials**              | Replace placeholders with actual client quotes |
| **Video Demo**                     | Embed product walkthrough video                |
| **Interactive Pricing Calculator** | Estimate costs based on usage                  |
| **Blog/Resources Section**         | SEO content hub                                |
| **Localization**                   | Multi-language support (Hindi, Tamil)          |
| **A/B Testing**                    | Test different headlines and CTAs              |

---

_This epic was created following the BMAD methodology._
_Ready for implementation, Life-design! 🚀_
