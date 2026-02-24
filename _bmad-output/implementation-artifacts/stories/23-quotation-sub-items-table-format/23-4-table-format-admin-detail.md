# Story 23.4: Table Format for Admin Quotation Detail View

**Epic**: Epic 23 - Quotation Sub-Items & Table Format
**Status**: review
**Complexity**: Medium (5 points)
**Created**: 2026-02-24
**Priority**: HIGH — Primary view used by admins to review quotations

---

## 📋 User Story

**As an** Admin,
**I want** to see quotation line items in a professional table format with proper sub-item hierarchy,
**So that** I can quickly review pricing breakdowns and approve quotations.

---

## 🔗 Dependencies

- **Depends on**: Story 23.1 (Schema)
- **Recommended**: After Story 23.2 (ensures sub-items exist to display)

---

## ⚠️ Current State

The admin quotation detail view (`detail/quotation-detail.tsx`) uses:

- `LineItemsSection` component from `detail/components/`
- Currently this component likely uses card-based or list-based layout

The **client view** (`client/quotations/detail/components/quotation-line-items-view.tsx`) already has:

- Full table format with `<table><thead><tbody>`
- Recursive `LineItemRow` component supporting 3-level nesting (1, 1.1, 1.1.1)
- Proper indentation with `└` connectors
- Section and project grouping

**Goal**: Bring the admin detail view to parity with the client view's table format.

---

## ✅ Acceptance Criteria

### Table Layout

- [x] **Given** I am viewing a quotation detail page as Admin
- [x] **When** line items are displayed
- [x] **Then** they render in an HTML table format with columns: #, Description, Unit, Qty, Rate, Amount
- [x] **And** table headers use consistent typography (uppercase tracking-widest)

### Sub-Item Display

- [x] **Given** a line item has sub-items
- [x] **When** I view the admin detail page
- [x] **Then** sub-items appear as nested rows with hierarchical numbering (1.1, 1.1.1)
- [x] **And** sub-items are visually indented with `└` connector symbols
- [x] **And** sub-item rows have reduced opacity for visual hierarchy

### Section Grouping

- [x] **Given** line items are organized by sections
- [x] **When** displayed in the detail view
- [x] **Then** each section has a header with icon, name, and divider line
- [x] **And** a table appears under each section

### Project Grouping (when applicable)

- [x] **Given** a quotation has project-associated line items
- [x] **When** displayed in the detail view
- [x] **Then** items are grouped by project first, then by section within each project
- [x] **And** each project group shows a header with project name and total

### Dark Theme

- [x] **Given** the admin portal uses a dark theme
- [x] **When** the table renders
- [x] **Then** it uses dark-theme colors (bg-white/3, text-white, border-white/5)
- [x] **And** visual hierarchy is maintained through opacity levels

---

## 📁 Files to Create/Update

| File                                        | Change                                                  |
| ------------------------------------------- | ------------------------------------------------------- |
| `detail/components/line-items-section.tsx`  | Replace card/list layout with table format              |
| `detail/components/line-item-table-row.tsx` | NEW: Recursive table row component (dark theme version) |
| `detail/components/index.ts`                | Update exports if needed                                |

---

## 🛠 Technical Implementation

### Approach: Create a Dark-Theme Table Component

The client view (`quotation-line-items-view.tsx`) uses a light/dark theme. The admin view needs a dark-theme version. We can either:

1. **Option A**: Make the existing `QuotationLineItemsView` accept a `theme` prop (light/dark)
2. **Option B**: Create a dedicated admin `LineItemsSection` with the same table structure but dark styling

**Recommended**: Option A — Create a shared `QuotationLineItemsTable` component that accepts theme/styling props.

### Component Structure

```tsx
// detail/components/line-items-section.tsx

export function LineItemsSection({
  groupedByProject,
  groupedBySection,
  projects,
  formatCurrency,
}: LineItemsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Layers className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-black tracking-tight uppercase text-white">
          Line Items
        </h2>
      </div>

      {/* Use shared table rendering */}
      <QuotationLineItemsView
        groupedByProject={groupedByProject}
        groupedBySection={groupedBySection}
        projects={projects}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
```

### Recursive LineItemRow (Dark Theme)

```tsx
function LineItemRow({
  item,
  index,
  level = 0,
  parentNumber = "",
  formatCurrency,
}) {
  const itemNumber = parentNumber ? `${parentNumber}.${index}` : `${index}`;
  const amount = item.rate * item.quantity;
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <React.Fragment>
      <tr
        className={cn(
          "group transition-colors",
          level === 0
            ? "hover:bg-white/3"
            : level === 1
              ? "bg-black/20 hover:bg-black/30"
              : "bg-black/10 hover:bg-black/20",
        )}
      >
        <td className="py-4 px-6 text-center">
          <span
            className={cn(
              "font-black tabular-nums",
              level === 0
                ? "text-[10px] text-white/20"
                : level === 1
                  ? "text-[9px] text-white/15"
                  : "text-[8px] text-white/10",
            )}
          >
            {itemNumber}
          </span>
        </td>
        <td className="py-4 px-6">
          <div
            className={cn(
              "flex items-center",
              level === 0
                ? "font-bold text-sm text-white"
                : level === 1
                  ? "font-medium text-xs text-white/60 pl-4"
                  : "font-medium text-[11px] text-white/40 pl-8",
            )}
          >
            {level > 0 && (
              <span className="font-black mr-2 text-white/10">└</span>
            )}
            {item.description}
          </div>
        </td>
        <td className="py-4 px-4 text-center uppercase tracking-widest text-[10px]">
          {item.unit}
        </td>
        <td className="py-4 px-4 text-center font-black">{item.quantity}</td>
        <td className="py-4 px-6 text-right font-medium tabular-nums">
          {formatCurrency(item.rate)}
        </td>
        <td className="py-4 px-8 text-right font-black tabular-nums">
          {formatCurrency(amount)}
        </td>
      </tr>

      {/* Recursive sub-items */}
      {hasSubItems &&
        item.subItems.map((sub, sIdx) => (
          <LineItemRow
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

---

## 🎨 Visual Design (Dark Theme Table)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ■ PHOTOGRAPHY SERVICES                                    — — —   │
├──────┬───────────────────────────┬───────┬─────┬──────────┬─────────┤
│   #  │ Description               │ Unit  │ Qty │ Rate     │ Amount  │
├──────┼───────────────────────────┼───────┼─────┼──────────┼─────────┤
│  1   │ Pre-Wedding Photography   │ day   │  1  │ ₹50,000  │ ₹50,000 │
│ 1.1  │ └ Candid Photography      │ hour  │  4  │  ₹8,000  │ ₹32,000 │
│ 1.2  │ └ Traditional Photography │ hour  │  2  │  ₹6,000  │ ₹12,000 │
│1.2.1 │   └ Family Group Photos   │ set   │  1  │  ₹3,000  │  ₹3,000 │
│  2   │ Wedding Day Coverage      │ event │  1  │ ₹80,000  │ ₹80,000 │
└──────┴───────────────────────────┴───────┴─────┴──────────┴─────────┘
```

- Background: `bg-white/2`, `border border-white/5`
- Headers: `bg-white/2`, `text-white/20`, uppercase tracking
- Rows: hover `bg-white/3`
- Sub-items: progressively dimmer opacity, left-padded

---

## 🚀 Definition of Done

- [x] Admin detail view shows line items in proper HTML table format
- [x] Sub-items render recursively with hierarchical numbering (1.1, 1.1.1)
- [x] Visual hierarchy maintained through indentation and opacity
- [x] Section grouping with headers and dividers
- [x] Project grouping with project headers and totals (when applicable)
- [x] Dark theme styling consistent with rest of admin portal
- [x] Responsive: table scrolls horizontally on small screens
- [x] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status | Notes                           |
| ---------- | ------ | ------------------------------- |
| 2026-02-24 | review | Implemented recursive table row |

---

**Previous Story**: 23-3 - Sub-Item CRUD in Quotation Editor
**Next Story**: 23-5 - Sub-Items in Admin Preview/PDF
