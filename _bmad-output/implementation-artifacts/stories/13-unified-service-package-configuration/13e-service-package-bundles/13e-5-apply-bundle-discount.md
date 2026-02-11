# Story 13E.5: Apply Bundle Discount in Calculations

**Status**: planned  
**Points**: 2  
**Epic**: [13E: Service Package Bundles](../../../../planning-artifacts/epics/13e-service-package-bundles.md)  
**Depends On**: Story 13E.4

---

## User Story

**As the** System,  
**I want** bundle discounts to be correctly calculated,  
**So that** quotations reflect promotional pricing.

---

## Acceptance Criteria

### AC1: Accept Bundle ID

**Given** `requestQuotation` mutation  
**When** called with `bundleId`  
**Then** it accepts the optional parameter

### AC2: Verify Bundle Match

**Given** a bundleId is provided  
**When** the mutation runs  
**Then** it verifies ALL bundle packages are in `selectedPackageIds`  
**And** throws error if mismatch

### AC3: Calculate Discount

**Given** valid bundle selection  
**When** calculating totals  
**Then**:

- Percentage: `discount = subtotal × (discountValue / 100)`
- Fixed: `discount = discountValue`

### AC4: Store Discount

**Given** quotation is created  
**When** bundle is applied  
**Then** quotation includes:

- `bundleId` reference
- `discountAmount` value
- `discountDescription` string

### AC5: Show as Line Item

**Given** quotation with bundle  
**When** displaying line items  
**Then** show: "Bundle Discount (Complete Wedding) -₹4,500"

---

## Technical Implementation

### Updated Quotations Schema

```typescript
// Add to quotations table
bundleId: v.optional(v.id("serviceBundles")),
discountAmount: v.optional(v.number()),
discountDescription: v.optional(v.string()),
```

### Updated Mutation

```typescript
// convex/functions/quotations/mutations.ts

export const requestQuotation = studioMutation({
  args: {
    selectedPackageIds: v.array(v.id("servicePackages")),
    bundleId: v.optional(v.id("serviceBundles")), // NEW
    endClientName: v.string(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    let discountAmount = 0;
    let discountDescription: string | undefined;
    let bundleId: Id<"serviceBundles"> | undefined;

    // Validate bundle if provided
    if (args.bundleId) {
      const bundle = await ctx.db.get(args.bundleId);
      if (!bundle) throw new Error("Bundle not found");

      // Verify all bundle packages are selected
      const bundlePackagesSelected = bundle.packageIds.every((id) =>
        args.selectedPackageIds.includes(id),
      );

      if (!bundlePackagesSelected) {
        throw new Error("Bundle packages don't match selection");
      }

      bundleId = args.bundleId;

      // Calculate discount
      const subtotal = await calculateSubtotal(ctx, args.selectedPackageIds);

      if (bundle.discountType === "percentage") {
        discountAmount = Math.round(
          (subtotal * (bundle.discountValue ?? 0)) / 100,
        );
      } else {
        discountAmount = bundle.discountValue ?? 0;
      }

      discountDescription = `Bundle Discount (${bundle.name})`;
    }

    // Calculate final totals
    const grossSubtotal = await calculateSubtotal(ctx, args.selectedPackageIds);
    const netSubtotal = grossSubtotal - discountAmount;
    const gstAmount = Math.round(netSubtotal * 0.18);
    const totalAmount = netSubtotal + gstAmount;

    // Create quotation
    return await ctx.db.insert("quotations", {
      // ... other fields
      bundleId,
      discountAmount,
      discountDescription,
      subtotal: netSubtotal,
      gstAmount,
      totalAmount,
    });
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT apply discount if packages modified
- ❌ Do NOT allow invalid bundle/package combinations
- ❌ Do NOT calculate GST before discount

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Manual test: Create quotation with bundle → discount applied
- [ ] Manual test: Create quotation without bundle → no discount
- [ ] Manual test: Bundle discount shows in line items

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
