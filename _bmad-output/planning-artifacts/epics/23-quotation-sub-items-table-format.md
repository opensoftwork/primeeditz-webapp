# Epic 23: Quotation Sub-Items & Table Format

**Epic Owner**: Admin/CEO
**Status**: Planning
**Created**: 2026-02-24
**Complexity**: High (Multi-surface implementation)
**Priority**: HIGH — Core quotation UX gap preventing real-world usage

---

## 📋 Epic Summary

Implement **hierarchical sub-item CRUD** (e.g., Item 1 → 1.1, 1.2 → 1.1.1) and ensure **consistent table-format display** for quotation line items across all surfaces in the PrimeEditz platform.

### Current State

| Capability                 | Status     | Notes                                                                                        |
| -------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| Sub-item schema            | ✅ Done    | Both `servicePackageLineItemValidator` and `quotations.lineItems.subItems` support sub-items |
| Sub-item display (client)  | ✅ Done    | `quotation-line-items-view.tsx` has recursive 3-level rendering                              |
| Sub-item display (preview) | ⚠️ Partial | `line-items-list.tsx` has table format but `DocumentLineItem` may not render sub-items       |
| Sub-item CRUD (builder)    | ❌ Missing | No UI to add/edit/delete sub-items in quotation builder                                      |
| Sub-item CRUD (editor)     | ❌ Missing | No UI to manage sub-items in the quotation edit view                                         |
| Sub-item CRUD (packages)   | ❌ Missing | Service package builder has no sub-item support                                              |
| Table format consistency   | ⚠️ Partial | Client view uses tables; admin detail view uses card layout                                  |

### Target State

- Admin can create hierarchical line items with up to 3 levels (1 → 1.1 → 1.1.1)
- Sub-items are fully manageable (add, edit, delete, reorder) in all builder surfaces
- All quotation views (admin detail, preview/PDF, client view, studio view) display line items in **table format** with hierarchical numbering
- Service package builder supports sub-items that flow through to quotations

---

## 🎯 User Outcomes

| Role          | Outcome                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| **Admin/CEO** | Create detailed, hierarchical quotation breakdowns for complex services     |
| **Admin/CEO** | Add/edit/delete sub-items directly within the quotation builder and editor  |
| **Admin/CEO** | See consistent table-format display across preview, detail, and print views |
| **Admin/CEO** | Define sub-items in service packages that auto-populate into quotations     |
| **Studio**    | View professionally formatted quotations with indented sub-item hierarchies |
| **Client**    | See clear, organized quotation breakdowns in table format                   |

---

## 🗂️ Stories

### Phase A: Schema Alignment & Shared Components

| Story | Description                                          | Points | Priority |
| ----- | ---------------------------------------------------- | ------ | -------- |
| 23.1  | Unify Sub-Item Schema & Type Definitions             | 3      | HIGH     |
| 23.2  | Sub-Item CRUD in Quotation Builder (Add/Edit/Delete) | 8      | HIGH     |
| 23.3  | Sub-Item CRUD in Quotation Editor                    | 5      | HIGH     |

### Phase B: Display Consistency

| Story | Description                                       | Points | Priority |
| ----- | ------------------------------------------------- | ------ | -------- |
| 23.4  | Table Format for Admin Quotation Detail View      | 5      | HIGH     |
| 23.5  | Sub-Items in Admin Preview/PDF (DocumentLineItem) | 3      | HIGH     |
| 23.6  | Table Format for Studio Quotation Detail View     | 3      | MEDIUM   |

### Phase C: Service Package Integration

| Story | Description                                        | Points | Priority |
| ----- | -------------------------------------------------- | ------ | -------- |
| 23.7  | Sub-Item CRUD in Service Package Builder (Step 3)  | 5      | MEDIUM   |
| 23.8  | Sub-Item Flow: Package → Quotation Auto-Population | 3      | MEDIUM   |

**Total Points**: 35

---

## 📊 Data Architecture Analysis

### Current Schema: `servicePackageLineItemValidator` (line 147-163 in schema.ts)

```typescript
// Service Package sub-items — SIMPLE format (description + optional amount)
subItems: v.optional(
  v.array(
    v.object({
      description: v.string(),
      amount: v.optional(v.number()),
    }),
  ),
);
```

### Current Schema: `quotations.lineItems.subItems` (line 601-611 in schema.ts)

```typescript
// Quotation sub-items — FULL format (id, description, unit, rate, quantity)
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

### Gap Analysis

1. **Service package sub-items** are simpler (description + amount only) while **quotation sub-items** are richer (id, unit, rate, qty). Story 23.1 must align these.
2. The quotation sub-items schema supports **one level of nesting only** (parent → child). To support 3-level nesting (1 → 1.1 → 1.1.1), sub-items themselves need optional `subItems`. Story 23.1 addresses this.
3. The `QuotationSubItem` TypeScript interface in `types.ts` already has `id?, description, unit, rate, quantity` — aligned with the quotation schema.

---

## 🧩 Affected Components Map

### Quotation Builder (Admin creates new quotation)

| File                                        | Change Needed                       |
| ------------------------------------------- | ----------------------------------- |
| `builder/steps/shared/line-item-drawer.tsx` | Add sub-items management section    |
| `builder/steps/shared/line-item-row.tsx`    | Show expand/collapse, sub-item rows |
| `builder/quotation-builder-context.tsx`     | Add sub-item CRUD methods           |

### Quotation Editor (Admin edits existing quotation)

| File                                            | Change Needed                              |
| ----------------------------------------------- | ------------------------------------------ |
| `edit/components/editor-line-items-section.tsx` | Add sub-item CRUD via table inline editing |

### Quotation Preview/PDF

| File                                     | Change Needed                      |
| ---------------------------------------- | ---------------------------------- |
| `preview/components/line-items-list.tsx` | Render sub-items within table rows |

### Admin Detail View

| File                                    | Change Needed                             |
| --------------------------------------- | ----------------------------------------- |
| `detail/quotation-detail.tsx`           | Ensure LineItemsSection uses table format |
| `detail/components/` (LineItemsSection) | Convert to table format with sub-items    |

### Client View

| File                                                                | Change Needed          |
| ------------------------------------------------------------------- | ---------------------- |
| `client/quotations/detail/components/quotation-line-items-view.tsx` | Already implemented ✅ |

### Studio View

| File                                                   | Change Needed                     |
| ------------------------------------------------------ | --------------------------------- |
| `studio/quotations/detail/studio-quotation-detail.tsx` | Use shared QuotationLineItemsView |

### Service Package Builder

| File                                                      | Change Needed                        |
| --------------------------------------------------------- | ------------------------------------ |
| `service-packages/builder/steps/step-3-pricing/index.tsx` | Add sub-item support to LineItemCard |
| `service-packages/builder/components/pricing-sidebar.tsx` | Include sub-item totals in summary   |

### Public Quotation View

| File                                                 | Change Needed                      |
| ---------------------------------------------------- | ---------------------------------- |
| `studio/quotations/public/public-quotation-view.tsx` | Ensure table format with sub-items |
| `client/quotations/public/public-quotation-view.tsx` | Ensure table format with sub-items |

---

## ✅ Acceptance Criteria Summary

### Sub-Item CRUD Success

- [ ] Admin can add a sub-item (level 1.1) to any parent line item
- [ ] Admin can add a sub-sub-item (level 1.1.1) under a sub-item
- [ ] Admin can edit any sub-item's description, unit, rate, and quantity
- [ ] Admin can delete individual sub-items without affecting the parent
- [ ] Sub-items auto-calculate amount (rate × quantity)
- [ ] Parent item totals include cumulative sub-item amounts

### Table Format Success

- [ ] Admin detail view shows line items in a proper HTML table
- [ ] Preview/PDF view renders sub-items in table rows with indentation
- [ ] Client view displays 3-level hierarchical numbering (1, 1.1, 1.1.1)
- [ ] Studio detail view uses consistent table format
- [ ] All table views show columns: #, Description, Unit, Qty, Rate, Amount

### Service Package Success

- [ ] Package builder allows adding sub-items to line items
- [ ] Sub-items from packages flow into quotation when package is selected
- [ ] Package pricing sidebar reflects sub-item totals correctly

---

## 🔗 Dependencies

| This Epic | Depends On     | Notes                                                 |
| --------- | -------------- | ----------------------------------------------------- |
| 23.x      | Epic 4 (Done)  | Quotation system foundation                           |
| 23.x      | Epic 13 (Done) | Service package builder                               |
| 23.1      | None           | Schema-level change, foundation for all other stories |

---

## 🔄 Status Updates

| Date       | Status   | Notes                                                |
| ---------- | -------- | ---------------------------------------------------- |
| 2026-02-24 | planning | Epic created from codebase analysis of sub-item gaps |

---

**Previous Epic**: Epic 22 - Profile Settings
**Next Epic**: TBD
