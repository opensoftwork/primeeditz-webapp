# Story 13D.5: Update Quotation Request Mutation

**Status**: backlog  
**Points**: 2  
**Epic**: [13D: Legacy Cleanup & Migration](../../../../planning-artifacts/epics/13d-legacy-cleanup-migration.md)  
**Depends On**: Story 13A.5

---

## User Story

**As a** Developer,  
**I want** the studio quotation request mutation to work seamlessly,  
**So that** the complete multi-package flow is functional.

---

## Acceptance Criteria

### AC1: Accept selectedPackageIds

**Given** the mutation is called  
**When** I pass `selectedPackageIds` array  
**Then** the quotation is created with all package IDs stored

### AC2: Aggregate Line Items

**Given** 3 packages are selected  
**When** the mutation runs  
**Then** line items from ALL packages are combined  
**And** each line item has `sourcePackageId` for tracking

### AC3: Calculate Combined Totals

**Given** aggregated line items  
**When** calculating pricing  
**Then**:

- `subtotal` = sum of all items
- `gstAmount` = subtotal × 0.18
- `totalAmount` = subtotal + gstAmount

### AC4: Validation

**Given** empty `selectedPackageIds`  
**When** the mutation runs  
**Then** it throws: "At least one package must be selected"

### AC5: Status Defaults

**Given** a studio requests a quotation  
**When** the quotation is created  
**Then** `status` = `"pending_review"`  
**And** `viewToken` is generated for sharing

---

## Technical Implementation

### Location

```
convex/functions/quotations/mutations.ts
```

### Updated Mutation

```typescript
// convex/functions/quotations/mutations.ts

import { studioMutation } from "@/lib/customFunctions";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Aggregates line items from multiple service packages.
 */
async function aggregateLineItems(
  ctx: any,
  packageIds: Id<"servicePackages">[],
) {
  const lineItems: Array<{
    id: string;
    sectionId?: Id<"quotationSections">;
    description: string;
    unit: string;
    rate: number;
    quantity: number;
    subItems?: Array<{ description: string; amount?: number }>;
    sourcePackageId: Id<"servicePackages">;
  }> = [];

  for (const packageId of packageIds) {
    const pkg = await ctx.db.get(packageId);
    if (!pkg) continue;

    for (const item of pkg.lineItems) {
      lineItems.push({
        ...item,
        sourcePackageId: packageId,
      });
    }
  }

  return lineItems;
}

/**
 * Calculates pricing totals.
 */
function calculatePricing(
  lineItems: Array<{ rate: number; quantity: number }>,
) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0,
  );
  const gstAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gstAmount;

  return { subtotal, gstAmount, totalAmount };
}

/**
 * Studio requests a quotation by selecting multiple packages.
 */
export const requestQuotation = studioMutation({
  args: {
    selectedPackageIds: v.array(v.id("servicePackages")),
    endClientName: v.string(),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validation
    if (!args.selectedPackageIds || args.selectedPackageIds.length === 0) {
      throw new Error("At least one package must be selected");
    }

    // Validate all packages exist
    for (const packageId of args.selectedPackageIds) {
      const pkg = await ctx.db.get(packageId);
      if (!pkg) {
        throw new Error(`Package not found: ${packageId}`);
      }
      if (!pkg.isActive) {
        throw new Error(`Package "${pkg.name}" is not active`);
      }
    }

    // Aggregate line items from all packages
    const lineItems = await aggregateLineItems(ctx, args.selectedPackageIds);

    // Calculate totals
    const { subtotal, gstAmount, totalAmount } = calculatePricing(lineItems);

    // Generate view token for public sharing
    const viewToken = crypto.randomUUID();

    // Create quotation
    const quotationId = await ctx.db.insert("quotations", {
      studioId: ctx.studioId,
      endClientName: args.endClientName,
      eventName: args.eventName,
      eventDate: args.eventDate,
      selectedPackageIds: args.selectedPackageIds,
      lineItems,
      subtotal,
      gstAmount,
      totalAmount,
      status: "pending_review",
      viewToken,
      createdBy: ctx.user?.email,
      updatedAt: Date.now(),
    });

    return {
      quotationId,
      packageCount: args.selectedPackageIds.length,
      totalAmount,
    };
  },
});
```

### Validation Tests

Ensure these scenarios work correctly:

```typescript
// Test 1: Empty packages array
try {
  await requestQuotation({ selectedPackageIds: [], ... });
} catch (e) {
  expect(e.message).toBe("At least one package must be selected");
}

// Test 2: Non-existent package
try {
  await requestQuotation({ selectedPackageIds: ["nonexistent_id"], ... });
} catch (e) {
  expect(e.message).toContain("Package not found");
}

// Test 3: Inactive package
try {
  await requestQuotation({ selectedPackageIds: [inactivePackageId], ... });
} catch (e) {
  expect(e.message).toContain("is not active");
}
```

---

## ❌ DO NOT

- ❌ Do NOT accept empty `selectedPackageIds`
- ❌ Do NOT allow inactive packages
- ❌ Do NOT forget `sourcePackageId` on line items
- ❌ Do NOT skip GST calculation

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - compiles
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Manual test: Request with 2 active packages → success
- [ ] Manual test: Request with 0 packages → error
- [ ] Manual test: Request with inactive package → error
- [ ] Manual test: Line items show in quotation with sourcePackageId

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
