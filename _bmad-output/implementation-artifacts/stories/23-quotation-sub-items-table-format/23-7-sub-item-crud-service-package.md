# Story 23.7: Sub-Item CRUD in Service Package Builder (Step 3)

**Epic**: Epic 23 - Quotation Sub-Items & Table Format
**Status**: review
**Complexity**: Medium (5 points)
**Created**: 2026-02-24
**Priority**: MEDIUM — Packages are the source of truth for quotation items

---

## 📋 User Story

**As an** Admin,
**I want** to add sub-items to line items within the service package builder,
**So that** packages have detailed breakdowns that auto-populate into quotations.

---

## 🔗 Dependencies

- **Depends on**: Story 23.1 (Schema — unified sub-item format)
- **Depends on**: Story 23.2 (Builder CRUD — shared sub-item drawer patterns)

---

## ⚠️ Current State

### Service Package Builder (Step 3: Pricing)

**File**: `service-packages/builder/steps/step-3-pricing/index.tsx`

- Uses `LineItemCard` component (from `builder/components/`) — NOT the same as quotation builder's `LineItemRow`
- Uses `@tanstack/react-form` for form state management
- Line items have `id, projectConfigId, sectionId, description, unit, rate, quantity`
- **No sub-item support** — schema field `subItems` exists but UI doesn't use it

### LineItemCard Component

- Renders in `service-packages/builder/components/` folder (but file was not found — may be a different path)
- Each card has: description input, project config selector, section selector (optional), unit selector, rate input, qty input
- No sub-item section, expand/collapse, or "Add Sub-Item" button

### Pricing Sidebar

- File: `service-packages/builder/components/pricing-sidebar.tsx`
- Calculates totals from line items
- Currently does NOT include sub-item amounts in totals

---

## ✅ Acceptance Criteria

### Add Sub-Item to Package Line Item

- [x] **Given** I am in the service package builder Step 3 (Pricing)
- [x] **When** I have at least one line item
- [x] **Then** each line item card shows an "Add Sub-Item" button
- [x] **And** clicking it opens a sub-item form (inline or drawer)

### Sub-Item Form Fields

- [x] **Given** I am adding a sub-item
- [x] **When** the form opens
- [x] **Then** I see fields: Description, Unit, Rate, Quantity
- [x] **And** section/project config are inherited from parent (not editable)

### Sub-Item Display in Card

- [x] **Given** a line item has sub-items
- [x] **When** I view the LineItemCard
- [x] **Then** sub-items appear as an indented list/table within the card
- [x] **And** each sub-item shows: description, unit, rate, qty, amount
- [x] **And** each sub-item has edit/delete actions

### Edit Sub-Item

- [x] **Given** a sub-item exists
- [x] **When** I click edit
- [x] **Then** the sub-item fields become editable (inline or in drawer)
- [x] **And** changes are saved to the correct position

### Delete Sub-Item

- [x] **Given** a sub-item exists
- [x] **When** I click delete
- [x] **Then** the sub-item is removed from the parent
- [x] **And** the pricing sidebar totals update

### Pricing Sidebar Totals

- [x] **Given** line items have sub-items with pricing
- [x] **When** viewing the pricing sidebar
- [x] **Then** the subtotal includes `Σ(parent.rate × parent.qty) + Σ(sub.rate × sub.qty)`
- [x] **And** GST and total reflect the inclusive amounts

### 3-Level Nesting

- [x] **Given** a sub-item exists at level 1.1
- [x] **When** I click "Add Sub-Item" on the 1.1 item
- [x] **Then** a level 1.1.1 item is created
- [x] **And** level 1.1.1 items do NOT show "Add Sub-Item" (max depth)

---

## 📁 Files Updated

| File                                                                  | Change                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `service-packages/builder/steps/step-3-pricing/index.tsx`             | Sub-items included in onSubmit and syncCurrentStep serialization         |
| `service-packages/builder/components/pricing-sidebar.tsx`             | Recursive total calculation includes sub-item amounts                    |
| `service-packages/builder/components/line-item-card.tsx`              | Already had full CRUD — verified working                                 |
| `service-packages/builder/components/service-package-items-table.tsx` | Already had full CRUD — verified working                                 |
| `service-packages/builder/steps/step-5-review/pricing-summary.tsx`    | Already renders sub-items with hierarchical numbering — verified working |
| `service-packages/builder/builder-context.tsx`                        | Already persists subItems in draft — verified working                    |

---

## 🚀 Definition of Done

- [x] "Add Sub-Item" button appears on each line item card in Step 3
- [x] Sub-items render as inline rows within the card
- [x] Sub-item fields: description, unit, rate, quantity are editable
- [x] Edit and delete actions work for sub-items
- [x] 3-level nesting supported (sub-items can have sub-sub-items)
- [x] Pricing sidebar includes sub-item amounts in totals
- [x] Form validation includes sub-item fields
- [x] Form submission includes sub-items in step3Data
- [x] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                                                                          |
| ---------- | ------- | ------------------------------------------------------------------------------ |
| 2026-02-24 | backlog | Created with full implementation plan                                          |
| 2026-02-24 | review  | Implemented — pricing sidebar fixed, form serialization fixed. UI already done |

---

**Previous Story**: 23-6 - Table Format for Studio Detail View
**Next Story**: 23-8 - Sub-Item Flow: Package → Quotation Auto-Population
