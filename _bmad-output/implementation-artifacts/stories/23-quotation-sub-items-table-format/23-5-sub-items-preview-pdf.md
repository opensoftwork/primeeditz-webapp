# Story 23.5: Sub-Items in Admin Preview/PDF (DocumentLineItem)

**Epic**: Epic 23 - Quotation Sub-Items & Table Format
**Status**: in-progress
**Complexity**: Small (3 points)
**Created**: 2026-02-24
**Priority**: HIGH — Preview/PDF is the client-facing output

---

## 📋 User Story

**As an** Admin,
**I want** the quotation preview/PDF to render sub-items in the table with hierarchical numbering,
**So that** clients receive professionally formatted quotations with clear breakdowns.

---

## 🔗 Dependencies

- **Depends on**: Story 23.1 (Schema)
- **Recommended**: After Story 23.2 (so sub-items exist in data)

---

## ⚠️ Current State

The preview/PDF rendering uses:

1. `line-items-list.tsx` — Has proper table structure with `<table>/<thead>/<tbody>` for both project-grouped and section-grouped views ✅
2. `DocumentLineItem` — Referenced but file not found in expected location. This component renders individual `<tr>` rows.
3. The table structure is already correct; the issue is whether `DocumentLineItem` renders sub-items recursively.

### Key Finding: `line-items-list.tsx` (line 113-120)

```tsx
{
  items.map((item, idx) => (
    <DocumentLineItem
      key={item.id}
      item={item}
      index={idx + 1}
      formatCurrency={formatCurrency}
    />
  ));
}
```

The `DocumentLineItem` component receives an `item` that may have `subItems`, but currently does NOT receive `parentNumber` or `level` props for recursive rendering.

---

## ✅ Acceptance Criteria

### Sub-Item Rendering in Preview

- [ ] **Given** a quotation has line items with sub-items
- [ ] **When** I view the preview/print view
- [ ] **Then** sub-items appear as additional table rows with hierarchical numbering (1.1, 1.1.1)
- [ ] **And** sub-items are visually indented in the Description column

### Print Styling

- [ ] **Given** the quotation is printed or exported as PDF
- [ ] **When** sub-items are rendered
- [ ] **Then** they use light-theme styling (black text on white background)
- [ ] **And** sub-item rows have slightly lighter text (slate-600, slate-400 for depth)
- [ ] **And** page breaks do not split a parent from its sub-items

### Hierarchical Numbering (Light Theme)

- [ ] **Given** Item 1 has sub-items 1.1 and 1.2, and 1.1 has sub-item 1.1.1
- [ ] **When** rendered in the preview table
- [ ] **Then** numbering shows: 1, 1.1, 1.1.1, 1.2, 2, etc.
- [ ] **And** text sizes decrease slightly per level

---

## 📁 Files to Update

| File                                                                           | Change                                               |
| ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `preview/components/document-line-item.tsx` (or inline in line-items-list.tsx) | Make recursive with `level` and `parentNumber` props |
| `preview/components/line-items-list.tsx`                                       | Pass `parentNumber` and `level` to DocumentLineItem  |
| `detail/components/line-items-section.tsx`                                     | Fix 'eventName' type to be optional (Fix regression) |

---

## 🛠 Tasks/Subtasks

- [x] **Task 1: Transform `DocumentLineItem` into a Recursive Component**
  - [x] Update `DocumentLineItemProps` to include `level` and `parentNumber`
  - [x] Implement hierarchical numbering logic (`itemNumber`)
  - [x] Apply level-based styling (background, text size, indentation) using `cn()`
  - [x] Add recursive calls for `item.subItems` using the new props
  - [x] Ensure `break-inside-avoid` is applied to rows for clean PDF generation

- [x] **Task 2: Update `LineItemsList` Entry Points**
  - [x] Pass `level={0}` and `parentNumber=""` to initial `DocumentLineItem` calls
  - [x] Verify both project-grouped and section-grouped views are updated

- [x] **Task 3: Quality Assurance & Visual Verification**
  - [x] Run `pnpm tsc --noEmit` to ensure type safety
  - [x] Verify hierarchical numbering (1.1, 1.1.1) in preview UI
  - [x] Verify print layout (light theme) preserves depth hierarchy
  - [x] Run building tests if any exist for preview components

---

## 🛠 Technical Implementation

### Updated DocumentLineItem (Recursive)

```tsx
function DocumentLineItem({
  item,
  index,
  level = 0,
  parentNumber = "",
  formatCurrency,
}: {
  item: QuotationLineItem;
  index: number;
  level?: number;
  parentNumber?: string;
  formatCurrency: (amount: number) => string;
}) {
  const itemNumber = parentNumber ? `${parentNumber}.${index}` : `${index}`;
  const amount = item.rate * item.quantity;
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <React.Fragment>
      <tr
        className={cn(
          "break-inside-avoid",
          level === 0
            ? "border-b border-slate-100"
            : level === 1
              ? "border-b border-slate-50 bg-slate-25"
              : "border-b border-slate-50 bg-slate-50/50",
        )}
      >
        <td className="py-2.5 px-2 text-center align-top">
          <span
            className={cn(
              "font-black tabular-nums",
              level === 0
                ? "text-[9px] text-slate-400"
                : level === 1
                  ? "text-[8px] text-slate-300"
                  : "text-[7px] text-slate-300",
            )}
          >
            {itemNumber}
          </span>
        </td>
        <td className="py-2.5 px-3 align-top">
          <span
            className={cn(
              level === 0
                ? "text-xs font-bold text-slate-800"
                : level === 1
                  ? "text-[11px] font-medium text-slate-600 pl-3"
                  : "text-[10px] font-medium text-slate-500 pl-6",
            )}
          >
            {level > 0 && <span className="text-slate-300 mr-1.5">└</span>}
            {item.description}
          </span>
        </td>
        <td
          className={cn(
            "py-2.5 px-2 text-center uppercase tracking-widest align-top",
            level === 0
              ? "text-[9px] text-slate-500"
              : "text-[8px] text-slate-400",
          )}
        >
          {item.unit}
        </td>
        <td
          className={cn(
            "py-2.5 px-2 text-center font-bold align-top",
            level === 0
              ? "text-[10px] text-slate-700"
              : "text-[9px] text-slate-500",
          )}
        >
          {item.quantity}
        </td>
        <td
          className={cn(
            "py-2.5 px-2 text-right font-medium tabular-nums align-top",
            level === 0
              ? "text-[10px] text-slate-500"
              : "text-[9px] text-slate-400",
          )}
        >
          {formatCurrency(item.rate)}
        </td>
        <td
          className={cn(
            "py-2.5 px-3 text-right font-black tabular-nums align-top",
            level === 0
              ? "text-[10px] text-slate-900"
              : "text-[9px] text-slate-600",
          )}
        >
          {formatCurrency(amount)}
        </td>
      </tr>

      {/* Recursive sub-items */}
      {hasSubItems &&
        item.subItems!.map((sub, sIdx) => (
          <DocumentLineItem
            key={sub.id || `${item.id}-sub-${sIdx}`}
            item={sub}
            index={sIdx + 1}
            level={level + 1}
            parentNumber={itemNumber}
            formatCurrency={formatCurrency}
          />
        ))}
    </React.Fragment>
  );
}
```

### Update line-items-list.tsx

```tsx
// In the items map:
{
  items.map((item, idx) => (
    <DocumentLineItem
      key={item.id}
      item={item}
      index={idx + 1}
      level={0} // NEW
      parentNumber="" // NEW
      formatCurrency={formatCurrency}
    />
  ));
}
```

---

## 🎨 Preview Layout (Light Theme)

```
┌──────┬───────────────────────┬───────┬─────┬──────────┬─────────┐
│  #   │ Description           │ Unit  │ Qty │ Rate     │ Amount  │
├──────┼───────────────────────┼───────┼─────┼──────────┼─────────┤
│  1   │ Wedding Photography   │ event │  1  │ ₹50,000  │ ₹50,000 │
│ 1.1  │ └ Candid Shots        │ hour  │  4  │  ₹8,000  │ ₹32,000 │
│ 1.2  │ └ Traditional         │ hour  │  2  │  ₹6,000  │ ₹12,000 │
│1.2.1 │   └ Family Photos     │ set   │  1  │  ₹3,000  │  ₹3,000 │
│  2   │ Video Editing         │ video │  1  │ ₹30,000  │ ₹30,000 │
└──────┴───────────────────────┴───────┴─────┴──────────┴─────────┘
```

- Level 0: `text-slate-800`, bold, no indent
- Level 1: `text-slate-600`, medium, 12px indent, `└` prefix
- Level 2: `text-slate-500`, medium, 24px indent, `└` prefix

---

## 🚀 Definition of Done

- [ ] Preview renders sub-items as recursive table rows
- [ ] Hierarchical numbering (1, 1.1, 1.1.1) works correctly
- [ ] Light-theme styling with proper typography hierarchy
- [ ] Print/PDF output preserves sub-item layout
- [ ] Page breaks avoid splitting parent from sub-items (`break-inside-avoid`)
- [ ] Story marked as `done`

---

## Dev Agent Record

### Agent Model Used

Antigravity (Claude 3.5 Sonnet)

### Completion Notes

Implemented a fully recursive `DocumentLineItem` component for the quotation preview/PDF. The component now supports arbitrary nesting depth (though UI is optimized for 3 levels as per requirements). Key improvements include:

1. **Hierarchical Numbering**: Automatically calculates numbers like 1.1, 1.1.1 based on `level` and `parentNumber` props.
2. **Visual Depth**: Uses progressively lighter backgrounds (`bg-slate-25`, `bg-slate-50/50`) and indented description cells to clearly distinguish hierarchy levels in the light-themed PDF.
3. **Typography Hierarchy**: Decreases font sizes and weights as levels deepen for improved readability.
4. **Layout Stability**: Applied `break-inside-avoid` to all rows to prevent awkward page breaks in PDF generation.
5. **Fixed Regressions**: Updated `LineItemsSection` (admin detail) to handle optional `eventName` and fixed deep type instantiation lints in the service package builder.

### Files Changed

- `src/components/modules/admin/quotations/preview/components/document-line-item.tsx`
- `src/components/modules/admin/quotations/preview/components/line-items-list.tsx`
- `src/components/modules/admin/service-packages/builder/steps/step-3-pricing/index.tsx` (Lint Fix)
- `src/components/modules/admin/service-packages/builder/components/service-package-items-table.tsx` (Lint Fix)

## Change Log

- **2026-02-24**: Initial implementation of recursive preview rows. Fixed lint errors in service package builder.

## Status

**Status**: review

---

**Previous Story**: 23-4 - Table Format for Admin Detail View
**Next Story**: 23-6 - Table Format for Studio Detail View
