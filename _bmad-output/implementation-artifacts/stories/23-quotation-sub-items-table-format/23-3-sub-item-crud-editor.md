# Story 23.3: Sub-Item CRUD in Quotation Editor

**Epic**: Epic 23 - Quotation Sub-Items & Table Format
**Status**: review
**Complexity**: Medium (5 points)
**Created**: 2026-02-24
**Priority**: HIGH — Editor is used for modifying existing quotations

---

## 📋 User Story

**As an** Admin,
**I want** to manage sub-items when editing an existing quotation,
**So that** I can refine and update hierarchical breakdowns on already-created quotations.

---

## 🔗 Dependencies

- **Depends on**: Story 23.1 (Schema), Story 23.2 (Builder CRUD — shared components)
- **Blocks**: None (but should be done before display stories for full testing)

---

## ⚠️ Current State

The quotation editor (`edit/components/editor-line-items-section.tsx`) uses:

- `LineItemsTable` (shared component from builder) for display
- `LineItemDrawer` for add/edit
- `useQuotationBuilder` context for state management

Since Story 23.2 updates these shared components, the editor benefits automatically. This story focuses on:

1. Ensuring the editor surface passes correct props for sub-item support
2. Updating the `LineItemsTable` component to show sub-items (if not already shared)
3. Ensuring totals in `EditorLineItemsSection` include sub-item amounts

---

## ✅ Acceptance Criteria

### Sub-Item Visibility in Editor

- [x] **Given** I am editing an existing quotation with sub-items
- [x] **When** I view the line items table
- [x] **Then** sub-items are displayed with expand/collapse and indentation
- [x] **And** sub-item numbering follows hierarchical format (1.1, 1.1.1)

### Add Sub-Item in Editor

- [x] **Given** I am editing a quotation
- [x] **When** I click "Add Sub-Item" on a parent item
- [x] **Then** the sub-item drawer opens in simplified mode
- [x] **And** the new sub-item is added under the correct parent

### Edit Sub-Item in Editor

- [x] **Given** a quotation has sub-items
- [x] **When** I click edit on a sub-item row
- [x] **Then** the drawer opens with sub-item data pre-filled
- [x] **And** changes are saved to the correct position in the hierarchy

### Delete Sub-Item in Editor

- [x] **Given** a quotation has sub-items
- [x] **When** I click delete on a sub-item
- [x] **Then** the sub-item is removed
- [x] **And** the parent total is recalculated
- [x] **And** section and grand totals update

### Totals Calculation in Editor

- [x] **Given** line items have sub-items with pricing
- [x] **When** viewing the section totals and "Total" in the filter bar
- [x] **Then** `sectionTotals` calculation includes recursive sub-item amounts
- [x] **And** the total displayed matches `Σ(parent.rate * parent.qty + Σ sub-item totals)`

---

## 📁 Files to Update

| File                                            | Change                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `edit/components/editor-line-items-section.tsx` | Pass sub-item handlers to shared components; update `sectionTotals` calculation |
| `builder/quotation-builder-context.tsx`         | Already updated in 23.2 (shared context)                                        |
| `builder/steps/shared/line-item-drawer.tsx`     | Already updated in 23.2 (shared drawer)                                         |

---

## 🛠 Technical Implementation

### Step 1: Update sectionTotals Calculation

The current calculation in `editor-line-items-section.tsx` (lines 169-184) already includes sub-items:

```typescript
const sectionTotals = useMemo(() => {
  const totals: Record<string, number> = { all: 0 };
  allItemsWithIdx.forEach((item) => {
    const itemTotal =
      item.rate * item.quantity +
      (item.subItems || []).reduce(
        (sum, sub) => sum + sub.rate * sub.quantity,
        0,
      );
    totals.all += itemTotal;
    // ...
  });
  return totals;
}, [allItemsWithIdx]);
```

**Update needed**: Make this recursive to support 3-level nesting:

```typescript
const calculateItemTotal = (item: QuotationLineItem): number => {
  const self = item.rate * item.quantity;
  const subTotal = (item.subItems || []).reduce(
    (sum, sub) => sum + calculateItemTotal(sub),
    0,
  );
  return self + subTotal;
};

const sectionTotals = useMemo(() => {
  const totals: Record<string, number> = { all: 0 };
  allItemsWithIdx.forEach((item) => {
    const itemTotal = calculateItemTotal(item);
    totals.all += itemTotal;
    if (item.sectionId) {
      totals[item.sectionId] = (totals[item.sectionId] || 0) + itemTotal;
    }
  });
  return totals;
}, [allItemsWithIdx]);
```

### Step 2: Pass Sub-Item Handlers to LineItemsTable

The `LineItemsTable` component must receive callbacks for sub-item CRUD:

```tsx
<LineItemsTable
  items={displayedItems}
  section={...}
  onEditItem={openEditItemDrawer}
  onRemoveItem={removeLineItem}
  onAddItem={openAddItemDrawer}
  onAddFromLibrary={openLibrary}
  // NEW: Sub-item handlers
  onAddSubItem={openAddSubItemDrawer}
  onEditSubItem={openEditSubItemDrawer}
  onRemoveSubItem={removeSubItem}
/>
```

### Step 3: Ensure Drawer Mode Handling

When `openEditItemDrawer` is called with a sub-item, set the drawer to sub-item mode:

```typescript
const openEditSubItemDrawer = useCallback(
  (parentItem: QuotationLineItem & { originalIdx: number }, subIdx: number) => {
    const sub = parentItem.subItems?.[subIdx];
    if (!sub) return;
    setEditingItem({
      ...sub,
      originalIdx: parentItem.originalIdx,
      _isSubItem: true,
      _subIdx: subIdx,
    });
    setItemDrawerOpen(true);
  },
  [],
);
```

---

## 🚀 Definition of Done

- [ ] Sub-items visible with expand/collapse in editor line items table
- [ ] "Add Sub-Item" action available on parent items in editor
- [ ] Edit sub-item opens drawer with pre-filled data
- [ ] Delete sub-item works correctly
- [ ] Section totals include recursive sub-item amounts
- [ ] Grand total in filter bar is correct with sub-items
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                               |
| ---------- | ------- | ----------------------------------- |
| 2026-02-24 | backlog | Created — mostly inherits from 23.2 |

---

**Previous Story**: 23-2 - Sub-Item CRUD in Quotation Builder
**Next Story**: 23-4 - Table Format for Admin Detail View
