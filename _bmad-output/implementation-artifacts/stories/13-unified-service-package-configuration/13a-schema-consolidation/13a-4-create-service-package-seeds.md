# Story 13A.4: Create Service Package Seed Data

**Status**: done  
**Points**: 2  
**Epic**: [13A: Schema Consolidation](../../../../planning-artifacts/epics/13a-schema-consolidation.md)  
**Depends On**: Story 13A.1

---

## User Story

**As a** Developer,  
**I want** seeded service packages for testing,  
**So that** I can validate the new model works correctly end-to-end.

---

## Acceptance Criteria

### AC1: Seed File Creation

**Given** the new `servicePackages` table exists  
**When** I create the seed file  
**Then** `convex/seeds/servicePackages.ts` is created with proper exports

### AC2: Minimum Seed Packages

**Given** we need to test multi-package scenarios  
**When** the seed runs  
**Then** at least 4 packages are created:

1. **Wedding Photography Package** → Links to Wedding Photo project type
2. **Wedding Cinema Package** → Links to Wedding Video project type
3. **Premium Album Package** → Links to Album project type
4. **YouTube Video Editing** → Links to YouTube project type

### AC3: Complete Package Data

**Given** each seeded package  
**When** the data is inserted  
**Then** each package has:

- `name`: Descriptive package name
- `description`: What the package includes
- `categoryId`: Link to appropriate project category
- `projectTypeId`: Link to appropriate project type
- `folderTemplateId`: Link to appropriate folder template
- `lineItems`: At least 2-3 pricing items
- `isActive`: `true`

### AC4: Seed Function Integration

**Given** the service packages seed exists  
**When** I update the main seed function  
**Then** `convex/functions/seed.ts` imports and calls `seedServicePackages`  
**And** service packages are seeded AFTER:

- projectCategories
- projectTypes
- folderTemplates
- quotationSections

---

## Technical Implementation

### Files to Create

```
CREATE: convex/seeds/servicePackages.ts
  - Define seed data for 4+ packages

MODIFY: convex/functions/seed.ts
  - Import seedServicePackages
  - Add to seed function after dependencies
```

### Seed File Example

```typescript
// convex/seeds/servicePackages.ts

import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

interface ServicePackageSeed {
  name: string;
  description: string;
  categorySlug: string; // To look up categoryId
  projectTypeSlug: string; // To look up projectTypeId
  folderTemplateSlug: string; // To look up folderTemplateId
  lineItems: Array<{
    id: string;
    description: string;
    unit: string;
    rate: number;
    quantity: number;
    subItems?: Array<{ description: string; amount?: number }>;
  }>;
  terms?: string;
  isActive: boolean;
}

const SERVICE_PACKAGES: ServicePackageSeed[] = [
  {
    name: "Wedding Photography Package",
    description:
      "Complete wedding photography editing service including color correction, retouching, and album layout",
    categorySlug: "wedding",
    projectTypeSlug: "wedding-photo",
    folderTemplateSlug: "wedding-photo-standard",
    lineItems: [
      {
        id: "wpkg-1",
        description: "Photo Editing & Color Correction",
        unit: "per project",
        rate: 8500,
        quantity: 1,
        subItems: [
          { description: "Up to 500 photos" },
          { description: "Basic skin retouching" },
          { description: "Color grading to match preferences" },
        ],
      },
      {
        id: "wpkg-2",
        description: "Album Layout Design",
        unit: "per album",
        rate: 2500,
        quantity: 1,
      },
    ],
    terms:
      "Delivery within 15 business days. Unlimited revisions for 7 days after delivery.",
    isActive: true,
  },
  {
    name: "Wedding Cinema Package",
    description:
      "Cinematic wedding video editing with professional color grading and sound design",
    categorySlug: "wedding",
    projectTypeSlug: "wedding-video",
    folderTemplateSlug: "wedding-video-standard",
    lineItems: [
      {
        id: "wcpkg-1",
        description: "Full Video Editing",
        unit: "per project",
        rate: 15000,
        quantity: 1,
        subItems: [
          { description: "Up to 4 hours raw footage" },
          { description: "Trailer (2-3 min)" },
          { description: "Full film (15-20 min)" },
        ],
      },
      {
        id: "wcpkg-2",
        description: "Drone Footage Integration",
        unit: "per project",
        rate: 3000,
        quantity: 1,
      },
    ],
    terms: "Delivery within 30 business days. 2 revision rounds included.",
    isActive: true,
  },
  {
    name: "Premium Album Package",
    description:
      "High-end album design with premium templates and unlimited revisions",
    categorySlug: "wedding",
    projectTypeSlug: "album-design",
    folderTemplateSlug: "album-standard",
    lineItems: [
      {
        id: "apkg-1",
        description: "Premium Album Design",
        unit: "per album",
        rate: 12000,
        quantity: 1,
        subItems: [
          { description: "40 spreads" },
          { description: "Premium templates" },
          { description: "Unlimited revisions" },
        ],
      },
    ],
    terms: "Delivery within 10 business days.",
    isActive: true,
  },
  {
    name: "YouTube Video Editing",
    description:
      "Professional YouTube video editing with transitions, graphics, and audio sync",
    categorySlug: "content-creation",
    projectTypeSlug: "youtube-video",
    folderTemplateSlug: "youtube-standard",
    lineItems: [
      {
        id: "ytpkg-1",
        description: "Video Editing",
        unit: "per video",
        rate: 3000,
        quantity: 1,
        subItems: [
          { description: "Up to 20 min final video" },
          { description: "Transitions & effects" },
          { description: "Audio sync" },
        ],
      },
      {
        id: "ytpkg-2",
        description: "Thumbnail Design",
        unit: "per thumbnail",
        rate: 500,
        quantity: 1,
      },
    ],
    terms: "Delivery within 3 business days.",
    isActive: true,
  },
];

export async function seedServicePackages(ctx: MutationCtx): Promise<void> {
  console.log("🌱 Seeding service packages...");

  for (const pkg of SERVICE_PACKAGES) {
    // Look up related IDs
    const category = await ctx.db
      .query("projectCategories")
      .filter((q) => q.eq(q.field("slug"), pkg.categorySlug))
      .first();

    const projectType = await ctx.db
      .query("projectTypes")
      .filter((q) => q.eq(q.field("slug"), pkg.projectTypeSlug))
      .first();

    const folderTemplate = await ctx.db
      .query("folderTemplates")
      .filter((q) => q.eq(q.field("name"), pkg.folderTemplateSlug))
      .first();

    if (!projectType) {
      console.warn(
        `⚠️ Project type not found: ${pkg.projectTypeSlug}, skipping ${pkg.name}`,
      );
      continue;
    }

    if (!folderTemplate) {
      console.warn(
        `⚠️ Folder template not found: ${pkg.folderTemplateSlug}, skipping ${pkg.name}`,
      );
      continue;
    }

    // Check if package already exists
    const existing = await ctx.db
      .query("servicePackages")
      .filter((q) => q.eq(q.field("name"), pkg.name))
      .first();

    if (existing) {
      console.log(`  ✓ ${pkg.name} (already exists)`);
      continue;
    }

    // Insert package
    await ctx.db.insert("servicePackages", {
      name: pkg.name,
      description: pkg.description,
      categoryId: category?._id,
      projectTypeId: projectType._id,
      folderTemplateId: folderTemplate._id,
      lineItems: pkg.lineItems,
      terms: pkg.terms,
      isActive: pkg.isActive,
      updatedAt: Date.now(),
    });

    console.log(`  ✓ ${pkg.name}`);
  }

  console.log("✅ Service packages seeded");
}
```

---

## ❌ DO NOT

- ❌ Do NOT add `spawnsProject` or `projectTypeId` to line items
- ❌ Do NOT seed without linking to projectType (required field!)
- ❌ Do NOT seed without linking to folderTemplate (required field!)
- ❌ Do NOT forget to update main seed function

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - compiles
- [ ] Run seed function: `npx convex run functions/seed:seed`
- [ ] Verify 4 packages exist in database
- [ ] Verify each package has valid `projectTypeId` and `folderTemplateId`

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
