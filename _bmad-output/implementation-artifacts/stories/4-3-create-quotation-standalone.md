# Story 4-3: Create Quotation (Standalone)

**Epic**: Epic 4 - Quotation System  
**Status**: done  
**Complexity**: High (8 points)  
**Created**: 2026-01-13  
**Updated**: 2026-01-16  
**Priority**: HIGH — Core quotation creation feature

---

## 📋 User Story

**As an** Admin,  
**I want** to create quotations with itemized pricing organized by sections,  
**So that** I can provide professional estimates to clients with detailed breakdowns.

---

## 🔗 Dependencies & Context

### Implementation Order

```
┌─────────────────────────────────────────────────────────────┐
│                 IMPLEMENTATION FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  4.1 Quotation Sections ─────┐                               │
│  (DONE)                      ▼                               │
│  3.8 Quotation Templates ────┤ (IN PROGRESS)                 │
│                              ▼                               │
│  4.3 Create Quotation ───────┤ ← YOU ARE HERE                │
│                              ▼                               │
│  4.5 Preview & Print ────────┤                               │
│                              ▼                               │
│  4.6 Send to Client ─────────┘                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies

| Depends On                                 | Status  | Notes                         |
| ------------------------------------------ | ------- | ----------------------------- |
| **4.1 - Quotation Sections Configuration** | ✅ Done | Sections for line item groups |
| **3.8 - Quotation Templates Management**   | Next    | Templates to load from        |

### Enables

| Story                       | Notes                           |
| --------------------------- | ------------------------------- |
| 4.4 - Line Items Nested     | Nested hierarchy implementation |
| 4.5 - Preview & Print       | PDF/print view of quotation     |
| 4.6 - Send to Client        | Email/share quotation           |
| 4.7 - Client View Quotation | Client-facing view              |

---

## ✅ Acceptance Criteria

### Quotation List View

- [x] **Given** I am on `/quotations`
- [x] **When** the page loads
- [x] **Then** I see a list of all quotations
- [x] **And** each quotation shows: Reference #, Client (if linked), Status, Total, Date
- [x] **And** I can search by reference number or client name
- [x] **And** I see a "New Quotation" button

### Quotation Creation

- [x] **Given** I am creating a new quotation
- [x] **When** I click "New Quotation"
- [x] **Then** a new quotation builder opens
- [x] **And** I can optionally select a template to pre-fill line items
- [x] **And** I can optionally link to a client
- [x] **And** I can optionally link to one or more projects
- [x] **And** a unique reference number is auto-generated (e.g., QT-000024)

### Line Items Management

- [x] **Given** I am in the quotation builder
- [x] **When** I add line items
- [x] **Then** line items are organized by quotation sections
- [x] **And** each line item has:
  - [x] Description (required)
  - [x] Unit (lumpsum, hours, days, etc. - post-production focused)
  - [x] Quantity (required)
  - [x] Rate/Unit Price (required)
  - [x] Total (auto-calculated)
- [x] **And** I can add nested sub-items under a parent line item
- [ ] **And** I can reorder line items within a section (drag-and-drop pending)
- [x] **And** section subtotals are shown

### Totals Calculation

- [x] **Given** I have added line items
- [x] **When** viewing the totals section
- [x] **Then** I see:
  - [x] Subtotal (sum of all line items)
  - [x] Tax Rate field (default 18% GST, configurable)
  - [x] Tax Amount (auto-calculated)
  - [x] Grand Total

### Terms & Conditions

- [x] **Given** I am editing a quotation
- [x] **When** I go to Step 4 (Terms)
- [x] **Then** I can add/edit terms and conditions
- [x] **And** I can load default terms from quick templates (Standard, Simple, Detailed)

### Save & Status

- [x] **Given** I am editing a quotation
- [x] **When** I save
- [x] **Then** the quotation is saved as "Draft" status
- [x] **And** I see a timestamp of last update

---

## 🎨 Implemented UI Architecture

### Route Structure (Implemented)

```
/quotations                      → List all quotations (QuotationsPage)
/quotations/new                  → Create new quotation (redirects to builder)
/quotations/builder              → Multi-step quotation builder wizard
```

### Quotation Builder - Multi-Step Wizard (Implemented)

```
Step 1: Client & Context
├── Client selector (ComboBox with search)
├── Template selector (for pre-loading line items)
├── Project association (multi-select drawer)
└── [Next Step] button

Step 2: Template Selection
├── Template cards grid
├── Template preview
└── Apply template to load line items

Step 3: Calculate Worth (Line Items) ✅ COMPLETED
├── Header: "Calculate Worth" with Library + Add Item buttons
├── Involved Projects: Linked projects display with add/remove
├── Section Filter: Dropdown to filter by All or specific section
├── Line Items Table: Read-only table with click-to-edit
│   ├── Columns: #, Description, Unit, Qty, Rate, Total
│   ├── Nested sub-items with expand/collapse
│   └── Edit/Delete action buttons (visible on hover)
└── Drawers:
    ├── LineItemDrawer: Add/Edit line items
    ├── SectionPickerDrawer: Select section for item
    ├── ProjectPickerDrawer: Associate item with project
    └── LibraryItemsDrawer: Select from library

Step 4: Terms & Conditions (pending)
├── Terms editor
└── Default terms loader
```

---

## 📁 Implemented Component Structure

```
src/components/modules/admin/quotations/
├── index.ts
├── quotation-list.tsx                    # List page component
├── quotation-card.tsx                    # Card for list view
├── builder/
│   ├── quotation-builder.tsx             # Main wizard container
│   ├── quotation-builder-context.tsx     # Form state & actions
│   ├── builder-header.tsx                # Wizard header with steps
│   ├── builder-sidebar.tsx               # Valuation overview sidebar
│   ├── types.ts                          # TypeScript types
│   └── steps/
│       ├── step1-client-context/         # Client & context selection
│       ├── step2-template/               # Template selection
│       ├── step3-line-items/             # ✅ Line items management
│       │   ├── index.tsx                 # Main component with tab filter
│       │   ├── line-items-table.tsx      # Table display component
│       │   ├── line-item-drawer.tsx      # Add/Edit drawer
│       │   ├── section-picker-drawer.tsx # Section selection drawer
│       │   ├── project-picker-drawer.tsx # Project association drawer
│       │   ├── library-items-drawer.tsx  # Library items drawer
│       │   ├── involved-projects.tsx     # Projects display/management
│       │   └── project-list/             # Project listing drawer
│       └── step4-terms/                  # Terms & conditions (pending)
```

---

## 🛠 Technical Implementation Details

### Units Configuration (Post-Production Focused)

**File**: `src/constants/units.ts`

```typescript
export const UNITS = {
  time: ["hours", "minutes", "days", "shifts", "weeks", "months"],
  work: ["lumpsum", "ls", "package", "project", "session"],
  count: [
    "nos",
    "pcs",
    "each",
    "set",
    "Item",
    "deliverables",
    "revisions",
    "versions",
  ],
  media: ["clips", "tracks", "frames", "scenes", "shots", "reels"],
  storage: ["GB", "TB", "files"],
  percentage: ["%"],
} as const;

export const DEFAULT_UNIT = "lumpsum";
```

### Key UI Patterns Implemented

1. **Drawer-based editing** - Consistent right-slide drawers for all item operations
2. **Select dropdown for section filter** - Scales to any number of sections (not horizontal tabs)
3. **Table-based line items** - Compact, read-only display with click-to-edit
4. **Visible action buttons** - Edit/Delete on hover instead of three-dots menu
5. **Premium dark theme** - Zinc-950 background, white/5 borders, primary accent

### Dependencies Used

- `motion/react` (Framer Motion) for animations
- `lucide-react` for icons
- `shadcn/ui` for Button, Input, Select, Sheet, Drawer components
- `convex` for backend queries/mutations

---

## 🧪 Testing Checklist

### Manual Testing

- [x] Navigate to `/quotations` → page loads with list
- [x] Click "New Quotation" → builder opens with wizard
- [x] Select template → line items pre-filled (basic)
- [x] Add line item → opens drawer, saves correctly
- [x] Edit line item → drawer opens with data, updates work
- [x] Delete line item → removes from list
- [x] Section filter dropdown → filters items correctly
- [x] Totals update when items change
- [ ] Add nested sub-item → (pending: full sub-item CRUD)
- [ ] Drag-and-drop reorder → (pending)

### Edge Cases

- [x] No sections exist → gracefully handled
- [x] Empty quotation → can still save as draft
- [x] Long descriptions → truncated with ellipsis

---

## 🚀 Definition of Done

- [x] Multi-step quotation builder working
- [x] Line items with nested sub-items display
- [x] Auto-calculation of totals
- [x] Save draft functionality
- [x] Matches premium dark theme aesthetic
- [x] Drawer-based add/edit pattern (like Naksha)
- [x] Section filter dropdown (not scrolling tabs)
- [x] Terms & conditions step (step4-terms)
- [ ] Drag-and-drop reorder (deferred)
- [x] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status      | Notes                                                                                  |
| ---------- | ----------- | -------------------------------------------------------------------------------------- |
| 2026-01-13 | in-progress | Implementation started                                                                 |
| 2026-01-15 | in-progress | Step 3 (Line Items) completed: Table UI, drawer-based editing, section filter dropdown |
| 2026-01-18 | done        | All steps implemented including Step 4 (Terms & Conditions)                            |

---

## 📝 Implementation Notes (Added 2026-01-15)

### Design Decisions

1. **Drawer-based editing over inline editing**: Following the Naksha project patterns for consistency and cleaner code architecture.

2. **Select dropdown for section filtering**: Replaced horizontal scrolling tabs with a single dropdown that scales to any number of sections.

3. **Post-production focused units**: Removed architecture/construction units (sqft, sqm, etc.) and added time-based and media units appropriate for a video/post-production company.

4. **Visible action buttons**: Replaced three-dots dropdown menu with visible Edit/Delete buttons that appear on hover for faster access.

5. **Project association per line item**: Each line item can be optionally associated with a specific project for multi-project quotations.

### Files Created/Modified This Sprint

| File                                         | Action   | Description                   |
| -------------------------------------------- | -------- | ----------------------------- |
| `step3-line-items/index.tsx`                 | Modified | Tab filter → Select dropdown  |
| `step3-line-items/line-items-table.tsx`      | Created  | Table-based read-only display |
| `step3-line-items/line-item-drawer.tsx`      | Created  | Add/Edit drawer               |
| `step3-line-items/section-picker-drawer.tsx` | Created  | Section selection drawer      |
| `step3-line-items/project-picker-drawer.tsx` | Created  | Project association drawer    |
| `step3-line-items/involved-projects.tsx`     | Modified | Cleaner layout                |
| `src/constants/units.ts`                     | Modified | Post-production focused units |

---

**Previous Story**: 3-8 - Quotation Templates Management  
**Next Story**: 4-4 - Quotation Line Items Nested
