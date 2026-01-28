# Story 13A.5: Update Quotation Mutations

**Status**: done  
**Points**: 2  
**Epic**: [13A: Schema Consolidation](../../../../planning-artifacts/epics/13a-schema-consolidation.md)  
**Depends On**: Story 13A.1, 13A.2

---

## User Story

**As a** Developer,  
**I want** quotation mutations to work with the multi-package model,  
**So that** the complete quotation flow works end-to-end.

---

## Acceptance Criteria

### AC1: Update `requestQuotation` Args

**Given** the studio-side quotation request mutation  
**When** I update the function signature  
**Then** it accepts:

- `selectedPackageIds: Id<"servicePackages">[]` (REPLACE `templateId`)
- `endClientName: string`
- `eventName?: string`
- `eventDate?: number`
- `notes?: string`

### AC2: Aggregate Line Items from Packages

**Given** `selectedPackageIds` contains multiple package IDs  
**When** the mutation processes the request  
**Then** it:

1. Fetches each package from the database
2. Collects all line items from all packages
3. Adds `sourcePackageId` to each line item for tracking
4. Combines into a single `lineItems` array

### AC3: Calculate Combined Pricing

**Given** aggregated line items  
**When** calculating totals  
**Then**:

- `subtotal` = sum of (rate × quantity) for all items
- `gstAmount` = subtotal × 0.18
- `totalAmount` = subtotal + gstAmount

### AC4: Validation

**Given** a quotation request  
**When** `selectedPackageIds` is empty  
**Then** throw an error: "At least one package must be selected"

### AC5: Update Admin Create Mutation (if exists)

**Given** an admin create quotation mutation  
**When** it exists  
**Then** update it to use the same multi-package model

---

## Technical Implementation

### Files to Modify

```
MODIFY: convex/functions/quotations/mutations.ts
  - Update requestQuotation args and handler
  - Add helper function: aggregateLineItemsFromPackages
  - Update any createQuotation admin mutation
```

### Updated Request Mutation

```typescript
// convex/functions/quotations/mutations.ts

import { studioMutation, adminMutation } from "@/lib/customFunctions";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Aggregates line items from multiple service packages.
 * Adds sourcePackageId to each item for tracking.
 */
async function aggregateLineItemsFromPackages(
  ctx: MutationCtx,
  packageIds: Id<"servicePackages">[],
) {
  const allLineItems: Array<{
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
    if (!pkg) {
      throw new Error(`Package not found: ${packageId}`);
    }

    // Add each line item with source tracking
    for (const item of pkg.lineItems) {
      allLineItems.push({
        ...item,
        sourcePackageId: packageId,
      });
    }
  }

  return allLineItems;
}

/**
 * Calculates pricing totals from line items.
 */
function calculateTotals(lineItems: Array<{ rate: number; quantity: number }>) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0,
  );
  const gstAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gstAmount;

  return { subtotal, gstAmount, totalAmount };
}

/**
 * Studio requests a quotation by selecting packages.
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
    if (args.selectedPackageIds.length === 0) {
      throw new Error("At least one package must be selected");
    }

    // Aggregate line items from all packages
    const lineItems = await aggregateLineItemsFromPackages(
      ctx,
      args.selectedPackageIds,
    );

    // Calculate totals
    const { subtotal, gstAmount, totalAmount } = calculateTotals(lineItems);

    // Generate view token for public sharing
    const viewToken = crypto.randomUUID();

    // Create quotation
    const quotationId = await ctx.db.insert("quotations", {
      studioId: ctx.user.studioProfileId,
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
      createdBy: ctx.user.email,
      updatedAt: Date.now(),
    });

    return {
      quotationId,
      packageCount: args.selectedPackageIds.length,
      totalAmount,
    };
  },
});

/**
 * Admin creates a quotation on behalf of a studio.
 */
export const createQuotation = adminMutation({
  args: {
    studioId: v.id("profiles"),
    selectedPackageIds: v.array(v.id("servicePackages")),
    endClientName: v.string(),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    discount: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validation
    if (args.selectedPackageIds.length === 0) {
      throw new Error("At least one package must be selected");
    }

    // Aggregate and calculate
    const lineItems = await aggregateLineItemsFromPackages(
      ctx,
      args.selectedPackageIds,
    );
    const { subtotal, gstAmount, totalAmount } = calculateTotals(lineItems);

    // Apply discount if provided
    const finalTotal = args.discount
      ? totalAmount - args.discount
      : totalAmount;

    // Generate view token
    const viewToken = crypto.randomUUID();

    // Create quotation
    const quotationId = await ctx.db.insert("quotations", {
      studioId: args.studioId,
      endClientName: args.endClientName,
      eventName: args.eventName,
      eventDate: args.eventDate,
      selectedPackageIds: args.selectedPackageIds,
      lineItems,
      subtotal,
      gstAmount,
      totalAmount: finalTotal,
      discount: args.discount,
      status: "draft",
      viewToken,
      createdBy: ctx.user?.email,
      updatedAt: Date.now(),
    });

    return { quotationId };
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT accept single `templateId` anymore (fully replaced)
- ❌ Do NOT accept empty `selectedPackageIds` array
- ❌ Do NOT copy spawning config from packages to quotation
- ❌ Do NOT skip GST calculation
- ❌ Do NOT forget `sourcePackageId` on aggregated line items

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - compiles
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Manual test: Studio requests quotation with 2 packages
- [ ] Manual test: Verify line items are aggregated correctly
- [ ] Manual test: Verify totals are calculated correctly

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
