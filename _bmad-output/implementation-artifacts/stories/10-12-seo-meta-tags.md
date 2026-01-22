# Story 10-12: SEO & Meta Tags

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: backlog  
**Complexity**: Low (1 point)  
**Created**: 2026-01-22  
**Priority**: P1 — Search visibility

---

## 📋 User Story

**As a** Developer,  
**I want** to implement proper SEO meta tags,  
**So that** the landing page ranks well in search engines.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                | Status  | Notes                 |
| ------------------------- | ------- | --------------------- |
| **10-0 - Foundation**     | backlog | Hero image for OG     |
| **10-10 - Page Assembly** | backlog | Page content complete |

### Enables

| Story / Epic        | Notes                |
| ------------------- | -------------------- |
| **10-13 - Testing** | SEO can be validated |

---

## ✅ Acceptance Criteria

### AC1: Meta Tags

- [ ] **Given** search engines crawl the page
- [ ] **Then** the following meta tags must be present:

| Meta        | Value                                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Title       | PrimeEditz — Creative Workflow Platform for Studios                                                                                           |
| Description | Transform chaotic studio operations into a streamlined, professional experience. Manage projects, quotations, and deliveries in one platform. |
| Keywords    | creative studio, workflow management, photography, video production, quotation system                                                         |

### AC2: Open Graph Tags

- [ ] **Given** the page is shared on social media
- [ ] **Then** the following OG tags must be present:

| Tag            | Value                                       |
| -------------- | ------------------------------------------- |
| og:title       | PrimeEditz — Creative Workflow Platform     |
| og:description | From chaos to clarity for creative studios. |
| og:image       | /og-image.png (1200x630)                    |
| og:type        | website                                     |
| og:url         | https://primeeditz.com                      |

### AC3: Twitter Card Tags

- [ ] **Given** the page is shared on Twitter
- [ ] **Then** the following tags must be present:

| Tag                 | Value                                       |
| ------------------- | ------------------------------------------- |
| twitter:card        | summary_large_image                         |
| twitter:title       | PrimeEditz — Creative Workflow Platform     |
| twitter:description | From chaos to clarity for creative studios. |
| twitter:image       | /og-image.png                               |

### AC4: Heading Hierarchy

- [ ] **Given** the page content
- [ ] **Then** there is exactly one `<h1>` tag
- [ ] **And** logical H2-H6 hierarchy in sections

### AC5: Image Alt Text

- [ ] **Given** all images on the page
- [ ] **Then** each has descriptive alt text

### AC6: Canonical URL

- [ ] **Given** the landing page
- [ ] **Then** canonical URL is set to primary domain

---

## 📘 Implementation Tasks

### Task 1: Update Page Metadata

**File**: `src/app/(landing)/page.tsx`

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrimeEditz — Creative Workflow Platform for Studios",
  description:
    "Transform chaotic studio operations into a streamlined, professional experience. Manage projects, quotations, and deliveries in one platform.",
  keywords: [
    "creative studio",
    "workflow management",
    "photography",
    "video production",
  ],
  openGraph: {
    title: "PrimeEditz — Creative Workflow Platform",
    description: "From chaos to clarity for creative studios.",
    url: "https://primeeditz.com",
    siteName: "PrimeEditz",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrimeEditz Dashboard Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrimeEditz — Creative Workflow Platform",
    description: "From chaos to clarity for creative studios.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://primeeditz.com",
  },
};
```

- [ ] 1.1 Add metadata export
- [ ] 1.2 Include all required fields
- [ ] 1.3 Add canonical URL

### Task 2: Create OG Image

- [ ] 2.1 Generate OG image (1200x630)
- [ ] 2.2 Include PrimeEditz branding
- [ ] 2.3 Save to `/public/og-image.png`

### Task 3: Verify Heading Hierarchy

- [ ] 3.1 Ensure single H1 in Hero
- [ ] 3.2 Use H2 for section titles
- [ ] 3.3 Use H3+ for sub-sections

### Task 4: Add Alt Text

- [ ] 4.1 Review all images
- [ ] 4.2 Add descriptive alt text
- [ ] 4.3 Update dashboard preview alt

### Task 5: Add Structured Data (Optional)

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PrimeEditz",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
};
```

- [ ] 5.1 Add JSON-LD structured data
- [ ] 5.2 Include software application schema

---

## 🧪 Testing Checklist

- [ ] Title tag correct
- [ ] Meta description present
- [ ] OG tags present
- [ ] Twitter card tags present
- [ ] OG image loads
- [ ] Single H1 on page
- [ ] All images have alt text
- [ ] Test with Facebook/Twitter debugger
- [ ] Test with Google Rich Results Test

---

## 🚀 Definition of Done

- [ ] All meta tags implemented
- [ ] OG image created and working
- [ ] Heading hierarchy correct
- [ ] Alt text on all images
- [ ] Validated with external tools
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |

---

**Previous Story**: 10-11 - Header Navigation Update  
**Next Story**: 10-13 - Responsive Testing & Polish
