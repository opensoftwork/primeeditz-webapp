# Story 23.2: Sub-Item CRUD in Quotation Builder (Add/Edit/Delete)

**Epic**: Epic 23 - Quotation Sub-Items & Table Format
**Status**: completed
**Complexity**: Large (8 points)
**Created**: 2026-02-24
**Priority**: HIGH — Core builder functionality

---

## 📋 User Story

**As an** Admin,
**I want** to add, edit, and delete sub-items within the quotation builder,
**So that** I can create detailed hierarchical breakdowns for complex services.

---

## 🔗 Dependencies

- **Depends on**: Story 23.1 (Unify Sub-Item Schema)
- **Blocks**: Story 23.3 (Editor CRUD), Story 23.4-23.6 (Display)

---

## ⚠️ Current State

### What EXISTS

1. `LineItemDrawer` (`builder/steps/shared/line-item-drawer.tsx`) — Creates/edits parent items only. No sub-item fields.
2. `LineItemRow` (`builder/steps/shared/line-item-row.tsx`) — Renders flat parent items. No expand/collapse, no sub-item rows.
3. `QuotationBuilderContext` — Has `addLineItem`, `updateLineItem`, `removeLineItem` but no sub-item methods.

### What is MISSING

1. **Add Sub-Item** — No button/UI to add a sub-item under a parent
2. **Edit Sub-Item** — No drawer/form to edit sub-item details
3. **Delete Sub-Item** — No ability to remove individual sub-items
4. **Expand/Collapse** — No way to show/hide sub-items under a parent
5. **Sub-item display** in builder table — No indented sub-item rows
6. **Totals calculation** — Parent totals don't include sub-item amounts

---

## ✅ Acceptance Criteria

### Add Sub-Item

- [ ] **Given** I am viewing the line items in the quotation builder
- [ ] **When** I click the "Add Sub-Item" action on a parent item
- [ ] **Then** a drawer opens pre-configured for sub-item creation
- [ ] **And** the sub-item is added under the correct parent item
- [ ] **And** the parent item shows an expand indicator

### Edit Sub-Item

- [ ] **Given** a parent item has sub-items visible
- [ ] **When** I click edit on a sub-item
- [ ] **Then** the drawer opens with sub-item data pre-filled
- [ ] **And** I can modify description, unit, rate, quantity
- [ ] **And** saving updates the correct sub-item in the parent's array

### Delete Sub-Item

- [ ] **Given** a parent item has sub-items
- [ ] **When** I click delete on a sub-item
- [ ] **Then** the sub-item is removed from the parent
- [ ] **And** the parent item total is recalculated
- [ ] **And** if no sub-items remain, the expand indicator is hidden

### Expand/Collapse

- [ ] **Given** a parent item has sub-items
- [ ] **When** I click the expand/collapse toggle
- [ ] **Then** sub-items are shown/hidden with smooth animation
- [ ] **And** the toggle icon rotates (chevron down → right)

### 3-Level Nesting

- [ ] **Given** a sub-item exists at level 1.1
- [ ] **When** I click "Add Sub-Item" on the level 1.1 item
- [ ] **Then** a level 1.1.1 item is created
- [ ] **And** the "Add Sub-Item" action is NOT available on level 1.1.1 items (max 3 levels)

### Totals Calculation

- [ ] **Given** a parent item has sub-items
- [ ] **When** sub-items have rate × quantity values
- [ ] **Then** the parent row shows cumulative total (parent + all sub-items)
- [ ] **And** the section and grand totals include sub-item amounts

---

## 📁 Files to Update

| File                                            | Change                                                                      |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| `builder/quotation-builder-context.tsx`         | Add `addSubItem`, `updateSubItem`, `removeSubItem` methods                  |
| `builder/steps/shared/line-item-drawer.tsx`     | Accept `parentItemId` + `level` props for sub-item mode                     |
| `builder/steps/shared/line-item-row.tsx`        | Add expand/collapse, render nested sub-item rows, add "Add Sub-Item" action |
| `edit/components/editor-line-items-section.tsx` | Update totals calculation to include sub-items                              |

---

## 🛠 Technical Implementation

### Step 1: Add Sub-Item Methods to Context

```typescript
// quotation-builder-context.tsx — new methods

const addSubItem = (
  parentIdx: number,
  subItem: Omit<QuotationSubItem, "id">,
  subParentIdx?: number,
) => {
  const newSubItem = { ...subItem, id: crypto.randomUUID() };
  setFormData("step4", {
    lineItems: formData.step4.lineItems.map((item, idx) => {
      if (idx !== parentIdx) return item;
      if (subParentIdx !== undefined) {
        // Level 3: Add to sub-item's sub-items
        return {
          ...item,
          subItems: item.subItems?.map((sub, sIdx) => {
            if (sIdx !== subParentIdx) return sub;
            return { ...sub, subItems: [...(sub.subItems || []), newSubItem] };
          }),
        };
      }
      // Level 2: Add to parent's sub-items
      return { ...item, subItems: [...(item.subItems || []), newSubItem] };
    }),
  });
};

const updateSubItem = (
  parentIdx: number,
  subIdx: number,
  updates: Partial<QuotationSubItem>,
  subSubIdx?: number,
) => {
  // Similar pattern: locate the correct item and update
};

const removeSubItem = (
  parentIdx: number,
  subIdx: number,
  subSubIdx?: number,
) => {
  // Remove from the nested array
};
```

### Step 2: Update LineItemRow for Expand/Collapse

```tsx
// line-item-row.tsx — enhanced with sub-items

function LineItemRow({ item, idx, ... }) {
  const [expanded, setExpanded] = useState(true);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <>
      {/* Parent row with expand toggle */}
      <motion.div className="...">
        {hasSubItems && (
          <button onClick={() => setExpanded(!expanded)}>
            <ChevronRight className={cn("transition-transform", expanded && "rotate-90")} />
          </button>
        )}
        {/* ... existing fields ... */}
        <button onClick={() => openSubItemDrawer(idx)}>
          <Plus className="h-3 w-3" /> Sub-Item
        </button>
      </motion.div>

      {/* Sub-item rows (indented) */}
      <AnimatePresence>
        {expanded && item.subItems?.map((sub, sIdx) => (
          <SubItemRow
            key={sub.id}
            subItem={sub}
            parentIdx={idx}
            subIdx={sIdx}
            level={1}
            onEdit={openEditSubItemDrawer}
            onDelete={removeSubItem}
            onAddChild={openSubItemDrawer} // For level 3
          />
        ))}
      </AnimatePresence>
    </>
  );
}
```

### Step 3: Update LineItemDrawer for Sub-Item Mode

```tsx
// line-item-drawer.tsx — new props

interface LineItemDrawerProps {
  // ... existing props ...
  mode?: "parent" | "sub-item";
  parentItemDescription?: string; // Show "Sub-item of: Wedding Video"
  level?: number; // 1 = sub-item of parent, 2 = sub-sub-item
  onSaveSubItem?: (subItem: Omit<QuotationSubItem, "id">) => void;
}
```

When `mode === 'sub-item'`:

- Hide section selector (inherits parent's section)
- Hide project spawning config
- Hide project association
- Show "Parent Item: {description}" badge
- Simplified fields: description, unit, rate, quantity only

### Step 4: Totals Calculation Update

```typescript
// Calculate item total recursively
const calculateItemTotal = (item: QuotationLineItem): number => {
  const selfTotal = item.rate * item.quantity;
  const subTotal = (item.subItems || []).reduce((sum, sub) => {
    const subSelf = sub.rate * sub.quantity;
    const subSubTotal = (sub.subItems || []).reduce(
      (s, ss) => s + ss.rate * ss.quantity,
      0,
    );
    return sum + subSelf + subSubTotal;
  }, 0);
  return selfTotal + subTotal;
};
```

---

## 🎨 UI Design

### Sub-Item Row Design

```
┌─────────────────────────────────────────────────────────────────────┐
│ ▼  1  Wedding Highlight Video     per project   ₹50,000   1   ₹50,000 │ ← Parent
│    ├─ 1.1  Color Grading           per video    ₹10,000   1   ₹10,000 │ ← Sub-item
│    ├─ 1.2  Audio Mixing            per video     ₹5,000   1    ₹5,000 │
│    │  └─ 1.2.1  Voiceover Mix      per track     ₹2,000   1    ₹2,000 │ ← Sub-sub
│    └─ 1.3  Thumbnail Design        per design    ₹3,000   2    ₹6,000 │
├─────────────────────────────────────────────────────────────────────┤
│ ▼  2  Photo Album Design           per album    ₹25,000   1   ₹25,000 │
└─────────────────────────────────────────────────────────────────────┘
```

### Visual Hierarchy

- **Level 0 (Parent)**: Full opacity, bold text, normal background
- **Level 1 (Sub-item)**: 80% opacity, medium text, indented 20px, subtle `└` connector
- **Level 2 (Sub-sub-item)**: 60% opacity, smaller text, indented 40px, double `└` connector

### Hover Actions

- Parent row hover: Edit | Delete | **Add Sub-Item**
- Sub-item row hover: Edit | Delete | **Add Sub-Item** (only if level < 2)
- Sub-sub-item row hover: Edit | Delete (no "Add Sub-Item" — max depth)

---

## ⚡ Risk Assessment

| Risk                                       | Mitigation                                             |
| ------------------------------------------ | ------------------------------------------------------ |
| Complex state management for nested arrays | Use helper functions that handle path-based updates    |
| Performance with many sub-items            | Collapse by default if >5 sub-items, virtualize if >20 |
| Drag-drop reordering complexity            | Defer reordering to a future story (23.9)              |

---

## 🚀 Definition of Done

- [ ] "Add Sub-Item" button appears on parent items in builder
- [ ] Sub-item drawer opens in simplified mode
- [ ] Sub-items render as indented rows with `└` connectors
- [ ] Edit sub-item via drawer works correctly
- [ ] Delete sub-item with confirmation works
- [ ] Expand/collapse animation is smooth
- [ ] 3-level nesting works (1 → 1.1 → 1.1.1)
- [ ] "Add Sub-Item" disabled at level 3 (max depth)
- [ ] Totals correctly include sub-item amounts
- [ ] Context methods: addSubItem, updateSubItem, removeSubItem work
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                            |
| ---------- | ------- | -------------------------------- |
| 2026-02-24 | backlog | Created with full technical spec |

---

**Previous Story**: 23-1 - Unify Sub-Item Schema
**Next Story**: 23-3 - Sub-Item CRUD in Quotation Editor
