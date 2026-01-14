# Story 3-8: Quotation Templates Management

**Epic**: Epic 3 - Admin Portal — Project & System Management  
**Status**: done  
**Complexity**: Medium (8 points)  
**Created**: 2026-01-12  
**Priority**: HIGH — Enables Epic 4 Quotation Flow

---

## 📋 User Story

**As an** Admin,  
**I want** to create and manage quotation templates,  
**So that** I can quickly generate quotations for common project types.

---

## 🔗 Dependencies & Context

### Architecture Alignment

**Updated 2026-01-13** per brainstorming session:

- `analysis/brainstorming-session-2026-01-13-quotation-architecture.md`
- `epics/04-quotation-system.md` (revised)

Key changes:

- Templates now use **sectionId** to organize line items
- Templates are **independent** of project types (optional hint only)
- Line items support **nested hierarchy** (subItems)

### Why This Story is Priority

Per decision record `planning-artifacts/decisions/2026-01-12-quotation-folder-sequencing.md`:

- Quotation templates are required BEFORE quotation creation (Epic 4)
- Folder setup (Story 3.4) is blocked until quotation is approved
- This story unblocks the entire quotation → folder → upload flow

### Implementation Order

```
4.1 Quotation Sections ──► 3.8 Quotation Templates ──► 4.3 Create Quotation
        │                         │                          │
        │                         │                          ▼
        │                         │                   4.8 Client Approve
        │                         │                          │
        └─────────────────────────┴──────────────────────────┼─────────────►
                                                             ▼
                                                   3.4 Folder Setup
```

### Dependencies

| Depends On                                 | Status  | Notes                    |
| ------------------------------------------ | ------- | ------------------------ |
| **4.1 - Quotation Sections Configuration** | ✅ Done | Templates use sectionId  |
| 3.7 - Project Types Management             | ✅ Done | Optional projectTypeHint |

### Enables

| Story                             | Epic   | Notes                   |
| --------------------------------- | ------ | ----------------------- |
| 4.3 - Create Quotation Standalone | Epic 4 | Uses templates          |
| 4.4 - Quotation Line Items Nested | Epic 4 | Uses template structure |

---

## ✅ Acceptance Criteria

### Template List View

- **Given** I am on `/settings/quotation-templates`
- **When** the page loads
- **Then** I see a list/grid of all quotation templates
- **And** each template shows: Name, Base Price, Associated Project Type, Status
- **And** I can filter by project type or search by name
- **And** I can add a new template via drawer

### Template Creation/Editing

- **Given** I am creating/editing a template
- **When** I fill out the form
- **Then** I can set:
  - Template Name (required)
  - Associated Project Type (optional, dropdown)
  - Line Items (repeater pattern):
    - Description (required)
    - Unit Price (required, number)
    - Default Quantity (required, number)
  - Terms & Conditions (textarea, optional)
  - Active/Inactive toggle
- **And** the form shows a live preview of calculated totals:
  - Subtotal (sum of line item × quantity)
  - GST (18%)
  - Grand Total

### Template Deletion/Deactivation

- **Given** I want to remove a template
- **When** I click deactivate/delete
- **Then** the template is soft-deleted (isActive = false)
- **And** it no longer appears in quotation creation dropdowns
- **And** existing quotations using this template are not affected

---

## 🎨 UX Design Reference

### Route Structure

```
/settings/quotation-templates           → List all templates
/settings/quotation-templates/[id]      → View/edit specific template (optional - can use drawer)
```

### Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Quotation Templates                        [+ New Template] │
├─────────────────────────────────────────────────────────────┤
│  [Search...] [Filter by Project Type ▼]                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Premium Wedding Package              ₹50,000            ││
│  │ Project Type: Wedding Photography    ●Active     [Edit] ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ YouTube Video Edit                   ₹15,000            ││
│  │ Project Type: Video Editing          ●Active     [Edit] ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Template Drawer

```
┌─────────────────────────────────────────┐
│  Create Quotation Template        [X]   │
├─────────────────────────────────────────┤
│  Template Name*                         │
│  [Premium Wedding Package          ]    │
│                                         │
│  Project Type                           │
│  [Wedding Photography           ▼]      │
│                                         │
│  ─── Line Items ────────────────────    │
│  ┌─────────────────────────────────┐    │
│  │ Base Photography Package        │    │
│  │ ₹40,000  × 1  = ₹40,000    [×]  │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Extra Hours                     │    │
│  │ ₹5,000   × 2  = ₹10,000    [×]  │    │
│  └─────────────────────────────────┘    │
│  [+ Add Line Item]                      │
│                                         │
│  ─── Preview ───────────────────────    │
│  Subtotal:           ₹50,000            │
│  GST (18%):          ₹9,000             │
│  Total:              ₹59,000            │
│                                         │
│  Terms & Conditions                     │
│  [________________________________]     │
│  [________________________________]     │
│                                         │
│  [Cancel]              [Save Template]  │
└─────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Database & Backend (~3 points)

#### Task A1: Convex Schema Update

**File**: `convex/schema.ts`

- [x] A1.1 Update `quotationTemplates` table with new architecture:
  ```typescript
  quotationTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    // Line items now use sectionId from quotationSections table
    lineItems: v.array(
      v.object({
        sectionId: v.id("quotationSections"), // NEW: Links to sections
        description: v.string(),
        unit: v.string(), // NEW: sqft, hr, ls, etc.
        unitPrice: v.number(),
        defaultQuantity: v.number(),
        // Optional nested sub-items
        subItems: v.optional(
          v.array(
            v.object({
              description: v.string(),
              unit: v.string(),
              unitPrice: v.number(),
              defaultQuantity: v.number(),
            })
          )
        ),
      })
    ),
    terms: v.optional(v.string()),
    projectTypeHint: v.optional(v.id("projectTypes")), // Renamed: soft filter only
    isActive: v.boolean(),
    createdBy: v.id("profiles"),
    updatedAt: v.number(),
  })
    .index("by_projectTypeHint", ["projectTypeHint"])
    .index("by_isActive", ["isActive"]);
  ```

#### Task A2: Convex Queries

**File**: `convex/functions/quotationTemplates/queries.ts`

- [x] A2.1 Create `getQuotationTemplates` query (list all, admin only)
- [x] A2.2 Create `getQuotationTemplate` query (single by ID)
- [x] A2.3 Create `getActiveTemplates` query (for dropdown in quotation creation)

#### Task A3: Convex Mutations

**File**: `convex/functions/quotationTemplates/mutations.ts`

- [x] A3.1 Create `createQuotationTemplate` mutation
- [x] A3.2 Create `updateQuotationTemplate` mutation
- [x] A3.3 Create `toggleQuotationTemplateActive` mutation
- [x] A3.4 Create `deleteQuotationTemplate` mutation (soft delete)

---

### Phase B: UI Components (~3 points)

#### Task B1: Template List Page

**File**: `src/app/(protected)/@admin/settings/quotation-templates/page.tsx`

- [x] B1.1 Create route and page component
- [x] B1.2 Display grid/list of template cards
- [x] B1.3 Show: name, base price (calculated), project type, status
- [x] B1.4 Add search and filter by project type
- [x] B1.5 Loading skeleton state
- [x] B1.6 Empty state

#### Task B2: Template Card Component

**File**: `src/components/modules/admin/quotation-templates/template-card.tsx`

- [x] B2.1 Card with template info
- [x] B2.2 Action buttons: Edit, Toggle Active, Delete
- [x] B2.3 Calculated base price display

#### Task B3: Template Drawer

**File**: `src/components/modules/admin/quotation-templates/template-drawer.tsx`

- [x] B3.1 Drawer component (create/edit modes)
- [x] B3.2 Form fields: name, project type dropdown
- [x] B3.3 Line items repeater (add/remove)
- [x] B3.4 Terms textarea
- [x] B3.5 Live total calculation preview (subtotal + GST)
- [x] B3.6 Form validation (name required, at least 1 line item)

---

### Phase C: Line Items Builder (~2 points)

#### Task C1: Line Items Component

**File**: `src/components/modules/admin/quotation-templates/line-items-builder.tsx`

- [x] C1.1 Repeater pattern for line items
- [x] C1.2 Each row: description, unit price, default quantity
- [x] C1.3 Row total calculation
- [x] C1.4 Add item button
- [x] C1.5 Delete item button per row
- [ ] C1.6 Drag to reorder (optional for MVP - not implemented)

#### Task C2: Price Preview Component

**File**: `src/components/modules/admin/quotation-templates/price-preview.tsx`

- [x] C2.1 Accepts line items array
- [x] C2.2 Calculates subtotal
- [x] C2.3 Calculates GST (18%)
- [x] C2.4 Shows grand total
- [x] C2.5 Formatted currency display (₹)

---

## 🧩 Component Structure

```
src/components/modules/admin/quotation-templates/
├── index.ts                      # Barrel exports
├── template-card.tsx             # Card for list view
├── template-drawer.tsx           # Create/Edit drawer
├── template-list.tsx             # List container with filters
├── line-items-builder.tsx        # Repeater for line items
└── price-preview.tsx             # Total calculation display
```

---

## 🔁 Reuse Opportunities

| Existing Component                  | Reuse For                           |
| ----------------------------------- | ----------------------------------- |
| `OptionsBuilder` (from 3.7)         | Inspiration for line items repeater |
| `Drawer` (shadcn)                   | Template drawer                     |
| `Button`, `Input`, `Select`         | Form controls                       |
| Motion animations                   | Card/list transitions               |
| Toast notifications                 | Success/error feedback              |
| `adminQuery/adminMutation` wrappers | Auth-protected backend              |

---

## 📦 Seed Data (For Testing)

```typescript
const templateSeeds = [
  {
    name: "Premium Wedding Photography",
    projectTypeId: null, // Link to Wedding Photography type
    lineItems: [
      {
        description: "Base Photography Package",
        unitPrice: 40000,
        defaultQuantity: 1,
      },
      { description: "Extra Hours", unitPrice: 5000, defaultQuantity: 2 },
    ],
    terms: "50% advance payment required. Balance due before delivery.",
    isActive: true,
  },
  {
    name: "YouTube Video Edit",
    projectTypeId: null, // Link to YouTube Video type
    lineItems: [
      {
        description: "Video Editing (per minute)",
        unitPrice: 1000,
        defaultQuantity: 15,
      },
      { description: "Color Grading", unitPrice: 3000, defaultQuantity: 1 },
    ],
    terms: "Revisions limited to 2 rounds.",
    isActive: true,
  },
];
```

---

## 🧪 Testing Checklist

### Manual Testing

- [x] Navigate to `/settings/quotation-templates` → page loads
- [x] Add new template → appears in list
- [x] Edit template → changes saved
- [x] Line items builder → add/remove works
- [x] Price preview → calculates correctly with GST
- [x] Toggle active → status updates
- [x] Delete template → soft-deleted, hidden from list
- [x] Filter by project type → works correctly
- [x] Empty state → shows when no templates

### Edge Cases

- [x] Template with 0 line items → validation error (button disabled)
- [x] Very long template name → truncated in card (line-clamp-1)
- [x] Many line items (10+) → scrollable in drawer
- [x] Large prices → formatted correctly with INR format

---

## 🚀 Definition of Done

- [x] All Phase A tasks complete (Database & Backend)
- [x] All Phase B tasks complete (UI Components)
- [x] All Phase C tasks complete (Line Items Builder)
- [x] Loading states implemented
- [x] Empty states implemented
- [x] Error handling with toast notifications
- [x] No TypeScript errors
- [x] Responsive design (mobile-friendly)
- [x] Matches premium dark theme aesthetic
- [x] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                                                  |
| ---------- | ------------- | ------------------------------------------------------ |
| 2026-01-12 | ready-for-dev | Story created per quotation-first sequencing decision  |
| 2026-01-13 | in-progress   | Implementation started                                 |
| 2026-01-13 | review        | Full implementation complete - schema, backend, and UI |

---

**Previous Story**: 3-7 - Project Types Management  
**Next Story**: 4-3 - Create Quotation Standalone (Epic 4)
