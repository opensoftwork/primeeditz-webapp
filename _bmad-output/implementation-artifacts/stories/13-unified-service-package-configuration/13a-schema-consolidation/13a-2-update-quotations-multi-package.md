# Story 13A.2: Update `quotations` Table for Multi-Package Selection

**Status**: done  
**Points**: 2  
**Epic**: [13A: Schema Consolidation](../../../../planning-artifacts/epics/13a-schema-consolidation.md)  
**Depends On**: Story 13A.1

---

## User Story

**As a** Developer,  
**I want** quotations to reference multiple service packages,  
**So that** studios can combine packages for different project types in a single quote.

---

## Acceptance Criteria

### AC1: Schema Field Change

**Given** the `quotations` table in `convex/schema.ts`  
**When** I update the table definition  
**Then** I replace the single template reference with an array:

- REMOVE: `templateId: v.optional(v.id("quotationTemplates"))`
- ADD: `selectedPackageIds: v.array(v.id("servicePackages"))`

**And** the array can contain 1 or more package IDs

### AC2: Line Items Remain as Snapshot

**Given** line items are aggregated from selected packages  
**When** a quotation is created  
**Then** `lineItems` still stores a SNAPSHOT of the pricing  
**And** the snapshot is copied from all selected packages at creation time

### AC3: Index Updates

**Given** the new field `selectedPackageIds`  
**When** I need to query quotations by package  
**Then** I verify if an index is needed (Convex may not support array indexes)

**Note**: If array indexes aren't supported, we can query by iteration

### AC4: Type Generation

**Given** schema changes are complete  
**When** I run `pnpm convex dev --once`  
**Then** TypeScript types are regenerated correctly  
**And** `Doc<"quotations">` includes `selectedPackageIds: Id<"servicePackages">[]`

---

## Technical Implementation

### Files to Modify

```
MODIFY: convex/schema.ts
  - Update quotations table definition
  - Change templateId to selectedPackageIds array
  - Verify lineItems validator still works
```

### Code Example

```typescript
// convex/schema.ts

quotations: defineTable({
  // Studio context
  studioId: v.id("profiles"),
  endClientName: v.string(),
  eventName: v.optional(v.string()),
  eventDate: v.optional(v.number()),

  // CHANGED: Multiple packages instead of single template
  // OLD: templateId: v.optional(v.id("quotationTemplates")),
  selectedPackageIds: v.array(v.id("servicePackages")),

  // Aggregated pricing snapshot from all selected packages
  lineItems: v.array(quotationLineItemValidator),

  // Pricing calculations
  subtotal: v.number(),
  gstAmount: v.number(),
  totalAmount: v.number(),
  discount: v.optional(v.number()),

  // Workflow
  status: quotationStatusValidator,
  viewToken: v.optional(v.string()),
  sentAt: v.optional(v.number()),
  approvedAt: v.optional(v.number()),
  rejectedAt: v.optional(v.number()),

  // Assignments
  assignedEmployeeId: v.optional(v.id("profiles")),

  // Audit
  createdBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
})
  .index("by_studioId", ["studioId"])
  .index("by_status", ["status"])
  .index("by_assignedEmployeeId", ["assignedEmployeeId"]),
```

### Quotation Line Item Validator (unchanged structure)

The line item validator for quotations should match the service package validator:

```typescript
const quotationLineItemValidator = v.object({
  id: v.string(),
  sectionId: v.optional(v.id("quotationSections")),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  subItems: v.optional(
    v.array(
      v.object({
        description: v.string(),
        amount: v.optional(v.number()),
      }),
    ),
  ),
  // Optional: Track which package this item came from
  sourcePackageId: v.optional(v.id("servicePackages")),
});
```

---

## ❌ DO NOT

- ❌ Do NOT keep `templateId` field (fully replace it)
- ❌ Do NOT make `selectedPackageIds` optional - it's required (can be empty array for admin-created quotes)
- ❌ Do NOT add spawning config to quotation line items
- ❌ Do NOT try to create index on array field (not supported)

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - schema compiles
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Verify `Doc<"quotations">` has `selectedPackageIds: Id<"servicePackages">[]`
- [ ] Verify old `templateId` field is NOT in generated types

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
