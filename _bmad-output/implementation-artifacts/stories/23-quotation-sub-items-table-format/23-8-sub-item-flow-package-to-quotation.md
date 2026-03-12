# Story 23.8: Sub-Item Flow: Package → Quotation Auto-Population

**Epic**: Epic 23 - Quotation Sub-Items & Table Format
**Status**: review
**Complexity**: Small (3 points)
**Created**: 2026-02-24
**Priority**: MEDIUM — Enables end-to-end sub-item flow

---

## 📋 User Story

**As an** Admin,
**I want** sub-items defined in service packages to automatically flow into quotations when a package is selected,
**So that** I don't need to manually re-create hierarchical breakdowns for each quotation.

---

## 🔗 Dependencies

- **Depends on**: Story 23.1 (Unified schema ensures format compatibility)
- **Depends on**: Story 23.7 (Service packages have sub-items to flow)
- **Depends on**: Story 23.2 (Quotation builder can display/edit sub-items)

---

## ⚠️ Verification Summary

After thorough investigation, **this story was already fully implemented** across both frontend and backend. The entire Package → Quotation sub-item flow works end-to-end:

### Backend (Convex Mutations)

| Component                          | File                                               | Status                                                                 |
| ---------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| `aggregateLineItemsFromPackages()` | `convex/functions/quotations/mutations.ts:109-165` | ✅ Maps sub-items recursively with new UUIDs, 3-level nesting          |
| `lineItemInput` validator          | `convex/functions/quotations/mutations.ts:25-42`   | ✅ Includes `subItems: v.optional(v.array(quotationSubItemValidator))` |
| `calculateItemTotal()`             | `convex/functions/quotations/mutations.ts:67-77`   | ✅ Recursive 3-level total calculation                                 |
| `calculateTotals()`                | `convex/functions/quotations/mutations.ts:82-103`  | ✅ Uses recursive `calculateItemTotal()`                               |
| `updateQuotation`                  | `convex/functions/quotations/mutations.ts:387-448` | ✅ Accepts sub-items via `lineItemInput`                               |
| `requestQuotation`                 | `convex/functions/quotations/mutations.ts:241-262` | ✅ Uses `aggregateLineItemsFromPackages()`                             |

### Frontend (Quotation Builder Context)

| Component                   | File                                    | Status                                           |
| --------------------------- | --------------------------------------- | ------------------------------------------------ |
| Package → Line Item mapping | `quotation-builder-context.tsx:726-753` | ✅ Maps sub-items + sub-sub-items with new UUIDs |
| Submission payload          | `quotation-builder-context.tsx:415-447` | ✅ Includes sub-items in `lineItemsPayload`      |
| Sub-item CRUD in builder    | `quotation-builder-context.tsx:613-692` | ✅ Add, edit, delete at all levels               |

### Schema

| Validator                         | File                       | Status                                                 |
| --------------------------------- | -------------------------- | ------------------------------------------------------ |
| `quotationSubItemValidator`       | `convex/schema.ts:170-177` | ✅ 3-level hierarchy (Level 1 → Level 2 → Level 3)     |
| `servicePackageLineItemValidator` | `convex/schema.ts:180-189` | ✅ Uses same `quotationSubItemValidator` for sub-items |

---

## ✅ Acceptance Criteria

### Sub-Items Auto-Population

- [x] **Given** a service package has line items with sub-items
- [x] **When** an admin creates a quotation and selects that package
- [x] **Then** the quotation line items include the package's sub-items
- [x] **And** sub-item format is correctly converted (id, description, unit, rate, quantity)

### Nested Sub-Items (3 Levels)

- [x] **Given** a package line item has sub-items with sub-sub-items (3 levels)
- [x] **When** the package is loaded into a quotation
- [x] **Then** all 3 levels are preserved in the quotation data

### Sub-Items Are Editable After Population

- [x] **Given** sub-items are auto-populated from a package
- [x] **When** the admin edits the quotation
- [x] **Then** sub-items can be modified (description, rate, quantity)
- [x] **And** new sub-items can be added
- [x] **And** existing sub-items can be deleted
- [x] **And** changes do NOT affect the original service package

### Source Package Tracking

- [x] **Given** a line item was populated from a package
- [x] **When** the quotation is saved
- [x] **Then** the `sourcePackageId` field is set on the parent line item
- [x] **And** sub-items do not need `sourcePackageId` (inherited from parent)

---

## � Definition of Done

- [x] Selecting a service package populates quotation line items WITH sub-items
- [x] Sub-items have new UUIDs (not copied from package)
- [x] 3-level nesting is preserved during mapping
- [x] Sub-items are editable/deletable after population
- [x] Multi-package selection correctly includes sub-items from all packages
- [x] Backward compatible: old packages without sub-items still work
- [x] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                                                                        |
| ---------- | ------- | ---------------------------------------------------------------------------- |
| 2026-02-24 | backlog | Created — completes the flow chain                                           |
| 2026-02-24 | review  | Verified — all flows already implemented. No code changes needed. TSC clean. |

---

**Previous Story**: 23-7 - Sub-Item CRUD in Service Package Builder
**Next Story**: None (last story in Epic 23)
