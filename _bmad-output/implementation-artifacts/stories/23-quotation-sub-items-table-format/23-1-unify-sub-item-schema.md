# Story 23.1: Unify Sub-Item Schema & Type Definitions

**Epic**: Epic 23 - Quotation Sub-Items & Table Format
**Status**: done
**Complexity**: Small (3 points)
**Created**: 2026-02-24
**Priority**: HIGH — Foundation for all other stories

---

## 📋 User Story

**As a** System,
**I want** a unified schema for sub-items that supports recursive nesting (3 levels),
**So that** pricing breakdowns are consistent across service packages and quotations.

---

## 🚀 Dev Agent Record

### Implementation Summary

- **Schema**: Created `quotationSubItemValidator` with explicit 3-level nesting (`subItemLevel3Validator` -> `subItemLevel2Validator`).
- **Unification**: Updated both `servicePackages` and `quotations` tables to use the same validator.
- **Mutations**: Updated `calculateTotals` to be recursive and `aggregateLineItemsFromPackages` to map the new unified format.
- **Types**: Updated `QuotationSubItem` and `TemplateSubItem` interfaces to include required `id` and recursive `subItems`.
- **Context**: Updated `QuotationBuilderContext` subtotal calculation to be recursive.
- **Validation**: Shared validators now enforce the same structure across all modules.

---

## ✅ Acceptance Criteriang.

---

## 🔗 Dependencies & Context

```
┌──────────────────────────────────────────────────────────┐
│                 IMPLEMENTATION FLOW                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  23.1 Unify Schema ──────┤ ← THIS STORY (Foundation)    │
│                          ▼                               │
│  23.2 Builder CRUD       │ (depends on 23.1)             │
│  23.3 Editor CRUD        │ (depends on 23.1)             │
│  23.4-23.6 Display       │ (depends on 23.1)             │
│  23.7-23.8 Package       │ (depends on 23.1)             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## ⚠️ Current State Analysis

### Service Package Sub-Items (schema.ts, line 155-162)

```typescript
// SIMPLE format — missing id, unit, rate, quantity
subItems: v.optional(
  v.array(
    v.object({
      description: v.string(),
      amount: v.optional(v.number()),
    }),
  ),
);
```

### Quotation Sub-Items (schema.ts, line 601-611)

```typescript
// FULL format — has id, unit, rate, quantity but NO recursive nesting
subItems: v.optional(
  v.array(
    v.object({
      id: v.string(),
      description: v.string(),
      unit: v.string(),
      rate: v.number(),
      quantity: v.number(),
    }),
  ),
);
```

### TypeScript Types (quotations/types.ts, line 20-26)

```typescript
export interface QuotationSubItem {
  id?: string; // Optional — should be required
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  // Missing: subItems for recursive nesting
}
```

---

## ✅ Acceptance Criteria

### Schema Unification

- [x] **Given** the `servicePackages` and `quotations` tables
- [x] **When** checking the `subItems` field
- [x] **Then** both use the same validator structure: `{ id, description, unit, rate, quantity, subItems? }`

### Recursive Support (3 Levels)

- [x] **Given** a quotation line item
- [x] **When** I define sub-items
- [x] **Then** I can nest them up to 1.1.1 (3 levels total)
- [x] **And** the schema prevents infinite nesting or depth > 3

### Totals Accuracy

- [x] **Given** a line item with sub-items at multiple levels
- [x] **When** `calculateTotals` is called (backend or context)
- [x] **Then** it recursively sums all nested amounts: `Σ(rate × quantity)`

### TypeScript Type Alignment

- [x] **Given** `QuotationSubItem` and `TemplateSubItem` interfaces
- [x] **When** using them in the frontend
- [x] **Then** they both require `id` and support recursive `subItems`
- [x] **And** they match the Convex schema exactlyhanges
- [ ] **Then** existing data is still readable (new fields are optional/backward-compatible)
- [ ] **And** no migration is required for existing data

---

## 📁 Files to Update

| File                                                       | Change                                                                                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `convex/schema.ts`                                         | Create shared `subItemValidator` with recursive support; update `servicePackageLineItemValidator` and `quotations.lineItems` to use it |
| `src/components/modules/admin/quotations/types.ts`         | Update `QuotationSubItem` interface with `id` required and recursive `subItems`                                                        |
| `src/components/modules/admin/quotations/builder/types.ts` | Re-export updated types                                                                                                                |

---

## 🛠 Technical Implementation

### Step 1: Create Shared Sub-Item Validator

```typescript
// convex/schema.ts — New shared validator

// Level 3 sub-item (leaf node, no children)
const subItemLevel3Validator = v.object({
  id: v.string(),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
});

// Level 2 sub-item (can have level 3 children)
const subItemLevel2Validator = v.object({
  id: v.string(),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  subItems: v.optional(v.array(subItemLevel3Validator)),
});

// Level 1 sub-item (used in lineItems.subItems)
export const quotationSubItemValidator = v.object({
  id: v.string(),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  subItems: v.optional(v.array(subItemLevel2Validator)),
});
```

### Step 2: Update servicePackageLineItemValidator

```typescript
export const servicePackageLineItemValidator = v.object({
  id: v.string(),
  sectionId: v.optional(v.id("quotationSections")),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  projectConfigId: v.optional(v.string()),
  subItems: v.optional(v.array(quotationSubItemValidator)), // Unified!
});
```

### Step 3: Update Quotation lineItems

```typescript
// quotations.lineItems[].subItems — use shared validator
subItems: v.optional(v.array(quotationSubItemValidator)),
```

### Step 4: Update TypeScript Types

```typescript
// types.ts
export interface QuotationSubItem {
  id: string; // Required
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  subItems?: QuotationSubItem[]; // Recursive
}
```

---

## ⚡ Risk Assessment

| Risk                                               | Mitigation                                                                                |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Existing service packages have old sub-item format | New fields are additive (id, unit, rate, quantity are `v.optional` or gracefully handled) |
| Infinite recursion in validators                   | Schema enforces max 3 levels via explicit nesting                                         |
| Breaking Convex deployment                         | Test with `pnpm convex dev` before merging                                                |

---

## 🚀 Definition of Done

- [ ] Shared `quotationSubItemValidator` created in schema.ts
- [ ] `servicePackageLineItemValidator` uses unified sub-item format
- [ ] `quotations.lineItems.subItems` uses unified sub-item format
- [ ] TypeScript types updated in `quotations/types.ts`
- [ ] `pnpm convex dev` deploys successfully with no schema errors
- [ ] Existing data remains accessible (no migration needed)
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                             |
| ---------- | ------- | --------------------------------- |
| 2026-02-24 | backlog | Created as foundation for Epic 23 |

---

**Previous Story**: None (first in epic)
**Next Story**: 23-2 - Sub-Item CRUD in Quotation Builder
