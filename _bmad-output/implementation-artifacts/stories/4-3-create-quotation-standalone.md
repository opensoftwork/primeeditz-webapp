# Story 4-3: Create Quotation (Standalone)

**Epic**: Epic 4 - Quotation System  
**Status**: in-progress  
**Complexity**: High (8 points)  
**Created**: 2026-01-13  
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

- **Given** I am on `/quotations`
- **When** the page loads
- **Then** I see a list of all quotations
- **And** each quotation shows: Reference #, Client (if linked), Status, Total, Date
- **And** I can filter by status (Draft, Sent, Approved, etc.)
- **And** I can search by reference number or client name
- **And** I see a "New Quotation" button

### Quotation Creation

- **Given** I am creating a new quotation
- **When** I click "New Quotation"
- **Then** a new quotation builder opens
- **And** I can optionally select a template to pre-fill line items
- **And** I can optionally link to a client
- **And** I can optionally link to one or more projects
- **And** a unique reference number is auto-generated (e.g., QT-000024)

### Line Items Management

- **Given** I am in the quotation builder
- **When** I add line items
- **Then** line items are organized by quotation sections
- **And** each line item has:
  - Description (required)
  - Unit (sqft, hr, ls, min, etc.)
  - Length/Width (optional, for sqft calculations)
  - Quantity (required)
  - Rate/Unit Price (required)
  - Total (auto-calculated)
- **And** I can add nested sub-items under a parent line item
- **And** I can reorder line items within a section
- **And** section subtotals are shown

### Totals Calculation

- **Given** I have added line items
- **When** viewing the totals section
- **Then** I see:
  - Subtotal (sum of all line items)
  - Tax Rate field (default 18% GST, configurable)
  - Tax Amount (auto-calculated)
  - Grand Total

### Terms & Conditions

- **Given** I am editing a quotation
- **When** I scroll to terms section
- **Then** I can add/edit terms and conditions
- **And** I can load default terms from a template

### Save & Status

- **Given** I am editing a quotation
- **When** I save
- **Then** the quotation is saved as "Draft" status
- **And** I can continue editing later
- **And** I see a timestamp of last update

---

## 🎨 UX Design Reference

### Route Structure

```
/quotations                      → List all quotations
/quotations/new                  → Create new quotation
/quotations/[id]                 → View/Edit quotation
```

### Quotation Builder Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Quotations                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  QUOTATION #QT-000024                                      📝 Draft     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────────────────────┐ │
│  │ Client (optional)          │  │ Template (optional)                    │ │
│  │ [Select client...       ▼] │  │ [Premium Wedding Package          ▼]  │ │
│  └────────────────────────────┘  └────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Link to Projects (optional)                                              ││
│  │ [Wedding - Priya & Raj ×] [+ Add Project]                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ 🎬 POST-PRODUCTION SERVICES                              [+ Add Item]   ││
│  │ ───────────────────────────────────────────────────────────────────────│││
│  │  #  Description           Unit   L    W   Qty   Rate      Total        ││
│  │ ──────────────────────────────────────────────────────────────────────│││
│  │  1  Video Editing         min    -    -   15   ₹1,000   ₹15,000  [⋮]  ││
│  │     └─ Rough Cut          hr     -    -    2     ₹500    ₹1,000  [⋮]  ││
│  │     └─ Final Cut          hr     -    -    3     ₹800    ₹2,400  [⋮]  ││
│  │  2  Color Grading         ls     -    -    1   ₹8,000    ₹8,000  [⋮]  ││
│  │                                                                         ││
│  │                                           Section Total:    ₹26,400    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ 🔨 PHYSICAL WORK                                         [+ Add Item]   ││
│  │ ───────────────────────────────────────────────────────────────────────│││
│  │  #  Description           Unit   L    W   Qty   Rate      Total        ││
│  │ ──────────────────────────────────────────────────────────────────────│││
│  │  1  Studio Setup          day    -    -    2   ₹5,000   ₹10,000  [⋮]  ││
│  │                                                                         ││
│  │                                           Section Total:    ₹10,000    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │                                        Subtotal:           ₹36,400      ││
│  │                                        GST (18%):           ₹6,552      ││
│  │                                      ─────────────────────────────      ││
│  │                                        GRAND TOTAL:        ₹42,952      ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌────────────────────┐  ┌──────────────────┐  ┌───────────────────────────┐│
│  │   👁️ Preview       │  │  💾 Save Draft   │  │  ✨ Send to Client        ││
│  └────────────────────┘  └──────────────────┘  └───────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Schema Updates (~2 points)

#### Task A1: Update Quotations Schema

**File**: `convex/schema.ts`

- [ ] A1.1 Update `quotations` table with new architecture:

  ```typescript
  quotations: defineTable({
    // Reference
    referenceNumber: v.string(), // e.g., "QT-000024"
    version: v.number(),
    parentQuotationId: v.optional(v.id("quotations")), // For versioning

    // Linking (all optional)
    clientId: v.optional(v.id("profiles")),
    projectIds: v.optional(v.array(v.id("projects"))),

    // Status
    status: quotationStatusValidator,

    // Line Items (with section structure)
    lineItems: v.array(
      v.object({
        sectionId: v.id("quotationSections"),
        description: v.string(),
        unit: v.string(),
        length: v.optional(v.number()),
        width: v.optional(v.number()),
        quantity: v.number(),
        rate: v.number(),
        total: v.number(),
        subItems: v.optional(
          v.array(
            v.object({
              description: v.string(),
              unit: v.string(),
              quantity: v.number(),
              rate: v.number(),
              total: v.number(),
            })
          )
        ),
      })
    ),

    // Totals
    subtotal: v.number(),
    taxRate: v.number(), // e.g., 18 for 18%
    taxAmount: v.number(),
    total: v.number(),

    // Terms
    terms: v.optional(v.string()),

    // Metadata
    createdBy: v.id("profiles"),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_clientId", ["clientId"])
    .index("by_referenceNumber", ["referenceNumber"]);
  ```

### Phase B: Backend Queries & Mutations (~2 points)

#### Task B1: Queries

**File**: `convex/functions/quotations/queries.ts`

- [ ] B1.1 Create `getQuotations` query (list with filters)
- [ ] B1.2 Create `getQuotation` query (single by ID)
- [ ] B1.3 Create `getNextReferenceNumber` query

#### Task B2: Mutations

**File**: `convex/functions/quotations/mutations.ts`

- [ ] B2.1 Create `createQuotation` mutation
- [ ] B2.2 Create `updateQuotation` mutation
- [ ] B2.3 Create `addLineItem` mutation
- [ ] B2.4 Create `updateLineItem` mutation
- [ ] B2.5 Create `deleteLineItem` mutation
- [ ] B2.6 Create `reorderLineItems` mutation
- [ ] B2.7 Create `calculateTotals` helper function

### Phase C: UI Components (~4 points)

#### Task C1: Quotation List Page

**File**: `src/app/(protected)/@admin/quotations/page.tsx`

- [ ] C1.1 Create list page with filters
- [ ] C1.2 Quotation cards with status badges
- [ ] C1.3 Search and filter functionality
- [ ] C1.4 Loading and empty states

#### Task C2: Quotation Builder Page

**File**: `src/app/(protected)/@admin/quotations/[id]/page.tsx`

- [ ] C2.1 Create new quotation page
- [ ] C2.2 Header with reference number and status
- [ ] C2.3 Client and template selectors
- [ ] C2.4 Project linking multi-select

#### Task C3: Line Items Section Component

**File**: `src/components/modules/quotation/builder/line-items-section.tsx`

- [ ] C3.1 Section header with icon and title
- [ ] C3.2 Line item rows with inline editing
- [ ] C3.3 Nested sub-items support
- [ ] C3.4 Add item button
- [ ] C3.5 Section subtotal display

#### Task C4: Line Item Row Component

**File**: `src/components/modules/quotation/builder/line-item-row.tsx`

- [ ] C4.1 Inline editable fields
- [ ] C4.2 Auto-calculate total
- [ ] C4.3 Action menu (edit, delete, add sub-item)
- [ ] C4.4 Drag handle for reordering

#### Task C5: Totals Footer Component

**File**: `src/components/modules/quotation/builder/totals-footer.tsx`

- [ ] C5.1 Subtotal display
- [ ] C5.2 Tax rate input
- [ ] C5.3 Tax amount calculation
- [ ] C5.4 Grand total display

---

## 🧩 Component Structure

```
src/components/modules/quotation/
├── index.ts                      # Barrel exports
├── builder/
│   ├── quotation-builder.tsx     # Main editor
│   ├── line-item-row.tsx         # Single line item
│   ├── line-items-section.tsx    # Section container
│   ├── section-header.tsx
│   └── totals-footer.tsx
├── list/
│   ├── quotation-list.tsx
│   ├── quotation-card.tsx
│   └── quotation-filters.tsx
└── shared/
    ├── status-badge.tsx
    └── reference-number.tsx
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Navigate to `/quotations` → page loads with list
- [ ] Click "New Quotation" → builder opens with auto-generated reference
- [ ] Select template → line items pre-filled
- [ ] Add line item → appears in correct section
- [ ] Edit line item → total recalculates
- [ ] Add nested sub-item → indented under parent
- [ ] Change tax rate → totals update
- [ ] Save draft → quotation saved
- [ ] Reload page → quotation restored

### Edge Cases

- [ ] No sections exist → error message shown
- [ ] Empty quotation → can still save as draft
- [ ] Very large numbers → formatted correctly
- [ ] Long descriptions → truncated/wrapped

---

## 🚀 Definition of Done

- [ ] Schema updated with new quotation structure
- [ ] All queries and mutations working
- [ ] Quotation list page functional
- [ ] Quotation builder fully working
- [ ] Line items with nested sub-items
- [ ] Auto-calculation of totals
- [ ] Save draft functionality
- [ ] Matches premium dark theme aesthetic
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status      | Notes                  |
| ---------- | ----------- | ---------------------- |
| 2026-01-13 | in-progress | Implementation started |

---

**Previous Story**: 3-8 - Quotation Templates Management  
**Next Story**: 4-4 - Quotation Line Items Nested
