# Story 4-1: Quotation Sections Configuration

**Epic**: Epic 4 - Quotation System  
**Status**: done  
**Complexity**: Low (3 points)  
**Created**: 2026-01-13  
**Priority**: HIGH — Foundation for all quotation features

---

## 📋 User Story

**As an** Admin,  
**I want** to configure quotation sections (e.g., "Post-Production", "Physical Work", "Design Services"),  
**So that** I can organize quotation line items into logical groups that match my business.

---

## 🔗 Dependencies & Context

### Why This Story First

Per brainstorming session (`analysis/brainstorming-session-2026-01-13-quotation-architecture.md`):

- Sections are **user-configurable**, not hardcoded
- All quotation templates and line items reference sections
- This enables portability — different businesses have different sections

### Implementation Order Rationale

```
┌─────────────────────────────────────────────────────────────┐
│                 WHY THIS ORDER?                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  4.1 Quotation Sections ─────┐                               │
│                              ▼                               │
│  3.8 Quotation Templates ────┤ (uses sections)               │
│                              ▼                               │
│  4.3 Create Quotation ───────┤ (uses templates + sections)   │
│                              ▼                               │
│  4.8 Client Approve ─────────┤ (approval gate)               │
│                              ▼                               │
│  3.4 Folder Setup ───────────┘ (blocked until approval)      │
│                                                              │
│  Note: 3.4 (Folder Setup) depends on quotation approval     │
│  because folders should only be created after client        │
│  commits to the project via quotation approval.             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies

| Depends On              | Status  | Notes                       |
| ----------------------- | ------- | --------------------------- |
| Epic 1 (Auth)           | ✅ Done | User profiles for createdBy |
| Epic 0 (Infrastructure) | ✅ Done | Convex mutations/queries    |

### Enables

| Story                     | Notes                                |
| ------------------------- | ------------------------------------ |
| 3.8 - Quotation Templates | Templates use sectionId              |
| 4.3 - Create Quotation    | Quotations organized by sections     |
| 4.12 - Item Library       | Library items categorized by section |

---

## ✅ Acceptance Criteria

### Sections List View

- **Given** I am on `/settings/quotation-sections`
- **When** the page loads
- **Then** I see a list of all quotation sections
- **And** each section shows: Name, Icon, Display Order, Status (Active/Inactive)
- **And** I can add a new section
- **And** I can reorder sections via drag-drop or arrows

### Section Creation/Editing

- **Given** I am creating/editing a section
- **When** I fill out the form
- **Then** I can set:
  - Section Name (required, e.g., "Post-Production Services")
  - Icon (optional, Lucide icon picker)
  - Color accent (optional, for visual distinction)
  - Active/Inactive toggle
- **And** display order is auto-assigned (end of list)

### Section Deletion

- **Given** I want to remove a section
- **When** I click deactivate/delete
- **Then** the section is soft-deleted (isActive = false)
- **And** it no longer appears in quotation forms
- **And** existing quotations with this section are not affected

### Seed Data

- **Given** a fresh installation
- **When** the system initializes
- **Then** default sections are created:
  - "Post-Production Services" (icon: Film)
  - "Physical Work" (icon: Hammer)
  - "Design Services" (icon: PenTool)

---

## 🎨 UX Design Reference

### Route Structure

```
/settings/quotation-sections           → List all sections
```

### Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Quotation Sections                         [+ New Section]  │
├─────────────────────────────────────────────────────────────┤
│  Organize line items into logical groups                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ≡  🎬  Post-Production Services        ●Active   [Edit] ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ≡  🔨  Physical Work                   ●Active   [Edit] ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ≡  ✏️  Design Services                 ●Active   [Edit] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  📝 Drag to reorder. Sections organize quotation line items. │
└─────────────────────────────────────────────────────────────┘
```

### Section Form (Drawer/Modal)

```
┌─────────────────────────────────────────┐
│  Create Section                    [X]   │
├─────────────────────────────────────────┤
│  Section Name*                           │
│  [Post-Production Services         ]     │
│                                          │
│  Icon                                    │
│  [🎬 Film                         ▼]     │
│                                          │
│  Accent Color                            │
│  [● Blue  ● Purple  ● Green  ...]        │
│                                          │
│  Status                                  │
│  [●] Active                              │
│                                          │
│  [Cancel]              [Save Section]    │
└─────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Schema & Backend (~1.5 points)

#### Task A1: Convex Schema

**File**: `convex/schema.ts`

- [x] A1.1 Add `quotationSections` table:
  ```typescript
  quotationSections: defineTable({
    name: v.string(),
    icon: v.optional(v.string()), // Lucide icon name
    color: v.optional(v.string()), // Accent color (hex or preset)
    displayOrder: v.number(),
    isActive: v.boolean(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_displayOrder", ["displayOrder"]);
  ```

#### Task A2: Convex Queries

**File**: `convex/functions/quotationSections/queries.ts`

- [x] A2.1 Create `getQuotationSections` query (all, admin only)
- [x] A2.2 Create `getActiveSections` query (for dropdowns)

#### Task A3: Convex Mutations

**File**: `convex/functions/quotationSections/mutations.ts`

- [x] A3.1 Create `createQuotationSection` mutation
- [x] A3.2 Create `updateQuotationSection` mutation
- [x] A3.3 Create `reorderQuotationSections` mutation
- [x] A3.4 Create `toggleQuotationSectionActive` mutation

#### Task A4: Seed Data

**File**: `convex/functions/quotationSections/seed.ts`

- [x] A4.1 Create seed function for default sections

---

### Phase B: UI Components (~1.5 points)

#### Task B1: Sections List Page

**File**: `src/app/(protected)/@admin/settings/quotation-sections/page.tsx`

- [x] B1.1 Create route and page component
- [x] B1.2 Display sortable list of section cards
- [x] B1.3 Add "New Section" button
- [x] B1.4 Loading skeleton state
- [x] B1.5 Empty state

#### Task B2: Section Card Component

**File**: `src/components/modules/admin/quotation-sections/section-card.tsx`

- [x] B2.1 Card with section info (icon, name, status)
- [x] B2.2 Drag handle for reordering
- [x] B2.3 Action buttons: Edit, Toggle Active, Delete

#### Task B3: Section Form (Drawer)

**File**: `src/components/modules/admin/quotation-sections/section-drawer.tsx`

- [x] B3.1 Drawer component (create/edit modes)
- [x] B3.2 Form fields: name, icon picker, color picker
- [x] B3.3 Active toggle
- [x] B3.4 Form validation

---

## 🧩 Component Structure

```
src/components/modules/admin/quotation-sections/
├── index.ts                      # Barrel exports
├── section-card.tsx              # Card for list view
├── section-drawer.tsx            # Create/Edit drawer
├── section-list.tsx              # Sortable list container
└── icon-picker.tsx               # Lucide icon selection
```

---

## 📦 Seed Data

```typescript
const sectionSeeds = [
  {
    name: "Post-Production Services",
    icon: "Film",
    color: "blue",
    displayOrder: 1,
    isActive: true,
  },
  {
    name: "Physical Work",
    icon: "Hammer",
    color: "amber",
    displayOrder: 2,
    isActive: true,
  },
  {
    name: "Design Services",
    icon: "PenTool",
    color: "purple",
    displayOrder: 3,
    isActive: true,
  },
];
```

---

## 🧪 Testing Checklist

### Manual Testing

- [x] Navigate to `/settings/quotation-sections` → page loads
- [x] Add new section → appears in list
- [x] Edit section → changes saved
- [x] Reorder sections → order persists
- [x] Toggle active → status updates
- [ ] Inactive sections not shown in quotation dropdowns (verify after templates done)

### Edge Cases

- [x] Very long section name → truncated
- [x] All sections inactive → no warning (acceptable for MVP)
- [x] Duplicate name → allowed (no unique constraint)

---

## 🚀 Definition of Done

- [x] Schema updated with `quotationSections` table
- [x] All queries and mutations working
- [x] Seed data creates default sections
- [x] UI shows sortable section list
- [x] Create/Edit drawer working
- [x] Loading and empty states implemented
- [x] Matches premium dark theme aesthetic
- [x] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status | Notes                                                  |
| ---------- | ------ | ------------------------------------------------------ |
| 2026-01-13 | done   | Implementation complete: schema, backend, seed, and UI |

---

**Previous Story**: 3-7 - Project Types Management  
**Next Story**: 3-8 - Quotation Templates Management
