# Story 10-10: Page Assembly & Scroll Animations

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: backlog  
**Complexity**: Medium (3 points)  
**Created**: 2026-01-22  
**Priority**: P0 — Integrates all sections

---

## 📋 User Story

**As a** Developer,  
**I want** to assemble all landing page sections with smooth scroll animations,  
**So that** the landing page feels premium and cohesive.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On            | Status  | Notes                  |
| --------------------- | ------- | ---------------------- |
| **10-0 through 10-9** | backlog | All section components |

### Enables

| Story / Epic           | Notes                    |
| ---------------------- | ------------------------ |
| **10-11 - Header Nav** | Page structure complete  |
| **10-12 - SEO**        | Page ready for meta tags |

---

## ✅ Acceptance Criteria

### AC1: Section Order

- [ ] **Given** the landing page
- [ ] **When** I scroll down
- [ ] **Then** sections appear in this order:
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

### AC2: Section Spacing

- [ ] **Given** each section
- [ ] **Then** consistent vertical spacing between sections (4rem - 6rem)
- [ ] **And** each section has a unique ID for anchor navigation

### AC3: Scroll Animations

- [ ] **Given** a section is not in viewport
- [ ] **When** I scroll it into view
- [ ] **Then** it animates in with:
  - Fade in effect
  - Slide up motion (20px)
  - Duration: 400-600ms
  - Ease-out timing

### AC4: Animation Performance

- [ ] **Given** scroll animations
- [ ] **Then** they run at 60fps
- [ ] **And** no jank or stuttering
- [ ] **And** uses CSS transforms (not top/left)

### AC5: Responsive Layout

- [ ] **Given** any screen size
- [ ] **Then** all sections render correctly
- [ ] **And** no horizontal overflow

---

## 🎨 Design Specifications

### Page Structure

```tsx
<main>
  <Hero />

  <section id="problems">
    <ProblemSolution />
  </section>

  <section id="features">
    <Features />
  </section>

  <section id="workflow">
    <Workflow />
  </section>

  <section id="audience">
    <WhoItsFor />
  </section>

  <section id="pricing">
    <Pricing />
  </section>

  <section id="testimonials">
    <Testimonials />
  </section>

  <section id="faq">
    <FAQ />
  </section>

  <CTABanner />

  <Footer />
</main>
```

### Animation CSS

```css
/* Base state - before animation */
.section-animate {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
}

/* Animated state - when in view */
.section-animate.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children within sections */
.section-animate.is-visible > * {
  animation: fade-in-up 0.4s ease-out both;
}

.section-animate.is-visible > *:nth-child(1) {
  animation-delay: 0ms;
}
.section-animate.is-visible > *:nth-child(2) {
  animation-delay: 100ms;
}
.section-animate.is-visible > *:nth-child(3) {
  animation-delay: 200ms;
}
```

---

## 📘 Implementation Tasks

### Task 1: Update Main Page

**File**: `src/app/(landing)/page.tsx`

- [ ] 1.1 Import all section components
- [ ] 1.2 Arrange in correct order
- [ ] 1.3 Add section IDs for anchor links
- [ ] 1.4 Add consistent spacing classes

### Task 2: Implement Scroll Animation Hook

**File**: `src/hooks/use-scroll-animation.ts`

```typescript
export function useScrollAnimation(
  ref: RefObject<HTMLElement>,
  options?: {
    threshold?: number;
    rootMargin?: string;
  },
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      {
        threshold: options?.threshold || 0.1,
        rootMargin: options?.rootMargin || "0px",
      },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}
```

- [ ] 2.1 Create custom hook
- [ ] 2.2 Use IntersectionObserver API
- [ ] 2.3 Add threshold configuration

### Task 3: Create Animated Section Wrapper

**File**: `src/components/modules/landing/sections/animated-section.tsx`

- [ ] 3.1 Create wrapper component
- [ ] 3.2 Apply animation classes
- [ ] 3.3 Use scroll animation hook
- [ ] 3.4 Support stagger delay prop

### Task 4: Wrap Each Section

- [ ] 4.1 Wrap ProblemSolution in AnimatedSection
- [ ] 4.2 Wrap Features in AnimatedSection
- [ ] 4.3 Wrap Workflow in AnimatedSection
- [ ] 4.4 Repeat for all sections

### Task 5: Performance Optimization

- [ ] 5.1 Use CSS transforms only
- [ ] 5.2 Add `will-change` where needed
- [ ] 5.3 Test on mobile devices
- [ ] 5.4 Verify 60fps in DevTools

### Task 6: Section Spacing

- [ ] 6.1 Add consistent padding/margin
- [ ] 6.2 Use spacing scale from design system
- [ ] 6.3 Verify on all breakpoints

---

## 🧪 Testing Checklist

- [ ] All 10 sections render in order
- [ ] Sections have correct IDs
- [ ] Scroll animations trigger
- [ ] Animations are smooth (60fps)
- [ ] No layout shifts
- [ ] Works on mobile
- [ ] Works in all browsers

---

## 🚀 Definition of Done

- [ ] All sections integrated into page
- [ ] Scroll animations working
- [ ] Performance at 60fps
- [ ] Section IDs for navigation
- [ ] Consistent spacing
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |

---

**Previous Story**: 10-9 - Testimonials Section  
**Next Story**: 10-11 - Header Navigation Update
