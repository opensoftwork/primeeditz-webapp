# Story 13E.4: Quotation Bundle Quick-Select UI

**Status**: planned  
**Points**: 3  
**Epic**: [13E: Service Package Bundles](../../../../planning-artifacts/epics/13e-service-package-bundles.md)  
**Depends On**: Story 13E.1, Story 13D.4 (studio quotation request)

---

## User Story

**As a** Studio,  
**I want** to quickly select a bundle when requesting a quote,  
**So that** I save time on common service combinations.

---

## Acceptance Criteria

### AC1: Bundle Section

**Given** the quotation request page  
**When** it loads  
**Then** I see a "Bundles (Quick Select)" section above packages

### AC2: Bundle Cards

**Given** active bundles exist  
**When** viewing the bundle section  
**Then** each card shows:

- Bundle name
- Included packages (list)
- Original price (struck through if discounted)
- Discounted price
- "Save X%" badge

### AC3: One-Click Select

**Given** I click a bundle card  
**When** the click registers  
**Then** all packages in the bundle are selected  
**And** the bundle ID is stored for discount tracking

### AC4: Modify After Select

**Given** I've selected a bundle  
**When** I add/remove packages  
**Then** the bundle selection is cleared  
**And** discount is no longer applied

### AC5: Visual Indication

**Given** a bundle is selected  
**When** viewing packages  
**Then** included packages show "Part of bundle" indicator

---

## Technical Implementation

### Component

```tsx
// src/components/modules/studio/quotation-request/bundle-quick-select.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface BundleQuickSelectProps {
  selectedBundleId: string | null;
  onBundleSelect: (bundleId: string, packageIds: string[]) => void;
  onBundleClear: () => void;
}

export function BundleQuickSelect({
  selectedBundleId,
  onBundleSelect,
  onBundleClear,
}: BundleQuickSelectProps) {
  const bundles = useQuery(api.serviceBundles.listActiveWithPricing);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">🎁 Bundles (Quick Select)</h3>
        {selectedBundleId && (
          <Button variant="ghost" size="sm" onClick={onBundleClear}>
            Clear Bundle
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundles?.map((bundle) => (
          <BundleCard
            key={bundle._id}
            bundle={bundle}
            isSelected={selectedBundleId === bundle._id}
            onSelect={() => onBundleSelect(bundle._id, bundle.packageIds)}
          />
        ))}
      </div>
    </div>
  );
}
```

### Backend Query

```typescript
// convex/functions/serviceBundles/queries.ts

export const listActiveWithPricing = query({
  args: {},
  handler: async (ctx) => {
    const bundles = await ctx.db
      .query("serviceBundles")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // Calculate pricing for each bundle
    return Promise.all(
      bundles.map(async (bundle) => {
        const packages = await Promise.all(
          bundle.packageIds.map((id) => ctx.db.get(id)),
        );

        const originalPrice = packages.filter(Boolean).reduce((sum, pkg) => {
          const pkgTotal = pkg.lineItems.reduce(
            (s, item) => s + item.rate * item.quantity,
            0,
          );
          return sum + pkgTotal;
        }, 0);

        const discountAmount =
          bundle.discountType === "percentage"
            ? Math.round((originalPrice * (bundle.discountValue ?? 0)) / 100)
            : (bundle.discountValue ?? 0);

        return {
          ...bundle,
          originalPrice,
          discountAmount,
          finalPrice: originalPrice - discountAmount,
          discountPercent:
            bundle.discountType === "percentage"
              ? bundle.discountValue
              : Math.round((discountAmount / originalPrice) * 100),
        };
      }),
    );
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT apply discount if user modifies selection
- ❌ Do NOT select inactive bundles
- ❌ Do NOT store discount in line items (apply at calculation time)

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Click bundle → packages auto-selected
- [ ] Manual test: Modify packages → bundle cleared

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
