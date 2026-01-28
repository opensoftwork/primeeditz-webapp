# Story 13E.3: Bundle Seed Data

**Status**: planned  
**Points**: 2  
**Epic**: [13E: Service Package Bundles](../../../../planning-artifacts/epics/13e-service-package-bundles.md)  
**Depends On**: Story 13E.1, Story 13A.4 (servicePackage seeds)

---

## User Story

**As a** Developer,  
**I want** seed data for common bundles,  
**So that** studios can test the feature immediately.

---

## Acceptance Criteria

### AC1: Complete Wedding Bundle

**Given** seed runs  
**When** checking bundles  
**Then** "Complete Wedding Bundle" exists with:

- Photo + Video + Album packages
- 10% discount
- Active

### AC2: Photo + Video Combo

**Given** seed runs  
**When** checking bundles  
**Then** "Photo + Video Combo" exists with:

- Photo + Video packages (no album)
- 5% discount
- Active

### AC3: Content Creator Pro

**Given** seed runs  
**When** checking bundles  
**Then** "Content Creator Pro" exists with:

- YouTube + Shorts + Album packages
- 15% discount
- Active

---

## Technical Implementation

### Seed File

```typescript
// convex/seeds/serviceBundles.seeds.ts

import { internalMutation } from "../_generated/server";

export const seedServiceBundles = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get package IDs from previous seeds
    const packages = await ctx.db.query("servicePackages").collect();

    const getPackageId = (name: string) =>
      packages.find((p) => p.name.includes(name))?._id;

    const bundles = [
      {
        name: "Complete Wedding Bundle",
        description: "Photo, Video, and Album - everything for your wedding",
        packageIds: [
          getPackageId("Photography"),
          getPackageId("Cinema"),
          getPackageId("Album"),
        ].filter(Boolean),
        discountType: "percentage" as const,
        discountValue: 10,
        isActive: true,
        updatedAt: Date.now(),
      },
      {
        name: "Photo + Video Combo",
        description: "Photography and videography coverage",
        packageIds: [
          getPackageId("Photography"),
          getPackageId("Cinema"),
        ].filter(Boolean),
        discountType: "percentage" as const,
        discountValue: 5,
        isActive: true,
        updatedAt: Date.now(),
      },
      {
        name: "Content Creator Pro",
        description: "Full content creation package",
        packageIds: [
          getPackageId("YouTube"),
          getPackageId("Shorts"),
          getPackageId("Album"),
        ].filter(Boolean),
        discountType: "percentage" as const,
        discountValue: 15,
        isActive: true,
        updatedAt: Date.now(),
      },
    ];

    for (const bundle of bundles) {
      await ctx.db.insert("serviceBundles", bundle);
    }

    console.log(`✅ Seeded ${bundles.length} service bundles`);
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT run before servicePackages are seeded
- ❌ Do NOT hardcode package IDs
- ❌ Do NOT create bundles with missing packages

---

## Testing Requirements

- [ ] Run seed function successfully
- [ ] Verify 3 bundles created
- [ ] Verify package references are valid

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
