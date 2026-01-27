# Epic 13C: Service Package Builder UI

**Parent Epic**: [13: Unified Service Package Configuration](./13-unified-service-package-configuration.md)  
**Status**: Backlog  
**Created**: 2026-01-27  
**Complexity**: High  
**Estimated Points**: 21

---

## 📋 Epic Summary

This epic creates a unified admin wizard for configuring "Service Packages" (enhanced quotation templates). This replaces the fragmented configuration across 6+ pages with a single, cohesive experience.

**Key UX Principle**: Admin thinks "I'm creating a product to sell" not "I'm linking database tables."

---

## 🎯 User Outcomes

| Role      | Outcome                                         |
| :-------- | :---------------------------------------------- |
| **Admin** | Create complete service packages in ONE wizard  |
| **Admin** | See all configuration in one place              |
| **Admin** | Preview what studios will see before publishing |

---

## 📝 User Stories

### Story 13C.1: Service Package List Page

**Points**: 3

**As an** Admin,  
**I want** to see all my service packages in one place,  
**So that** I can manage my product offerings.

**Acceptance Criteria**:

- [ ] List page at `/admin/settings/service-packages`
- [ ] Package card shows: Name, Category, Price Range, Status (Active/Inactive)
- [ ] Filter by: Category, Status
- [ ] Search by name
- [ ] Quick actions: Edit, Duplicate, Activate/Deactivate
- [ ] "Create New Package" button → opens wizard
- [ ] Empty state with helpful prompt

**UI Design**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SERVICE PACKAGES                                    [+ Create Package]     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [All ▼] [Active ▼]                           🔍 Search packages...         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐       │
│  │ 💍 Silver Wedding │  │ 💍 Gold Wedding   │  │ 🎬 YouTube Basic  │       │
│  │ From ₹8,500       │  │ From ₹18,000       │  │ From ₹5,000       │       │
│  │ ● Active          │  │ ● Active          │  │ ○ Inactive        │       │
│  │ [Edit] [⋮]        │  │ [Edit] [⋮]        │  │ [Edit] [⋮]        │       │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Files**:

- `src/app/(protected)/@admin/settings/service-packages/page.tsx`
- `src/components/modules/admin/service-packages/list/`

---

### Story 13C.2: Package Builder - Step 1: Basic Info

**Points**: 3

**As an** Admin,  
**I want** to enter basic package information,  
**So that** studios understand what they're purchasing.

**Acceptance Criteria**:

- [ ] Step 1 of wizard: "Package Identity"
- [ ] Fields:
  - Package Name (required)
  - Description (rich text, optional)
  - Category (dropdown from `projectCategories`)
  - Icon/Color picker (optional, for visual distinction)
- [ ] Real-time validation
- [ ] Character count for name (max 50)
- [ ] "Next" button to Step 2

**Wizard Shell**:

- Stepper showing: 1. Identity → 2. Configuration → 3. Pricing → 4. Review
- Progress persistence (draft saved automatically)
- Cancel confirmation dialog

---

### Story 13C.3: Package Builder - Step 2: Project Configuration

**Points**: 5

**As an** Admin,  
**I want** to configure what project gets created from this package,  
**So that** I define the delivery structure upfront.

**Acceptance Criteria**:

- [ ] Step 2: "Project Configuration"
- [ ] Project Type selector (from `projectTypes`, grouped by category)
- [ ] Folder Template selector (filtered by selected project type)
  - Shows template variant labels
  - Preview of folder structure on selection
- [ ] Default Storage Tier selector (from `storageTiers`)
  - Shows GB and price
- [ ] Optional: "No project creation" toggle (for service-only packages)
- [ ] Visual preview panel showing:
  - Selected project type badge
  - Folder structure tree
  - Storage allocation

**UI Design**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Project Configuration                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Project Type                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ [Wedding Photography & Video]                                    ▼  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Folder Structure                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Select folder template...                                        ▼  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ South Indian    │ Christian      │ North Indian    │ [Preview]      │   │
│  │ Traditional     │ Wedding        │ Wedding         │                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Default Storage                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ○ 50GB Standard (₹2,000)   ● 100GB Premium (₹3,500)              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                                    [Back]  [Next: Pricing] │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Story 13C.4: Package Builder - Step 3: Pricing

**Points**: 5

**As an** Admin,  
**I want** to configure the pricing structure,  
**So that** I can generate accurate quotations.

**Acceptance Criteria**:

- [ ] Step 3: "Pricing & Terms"
- [ ] Line Items section:
  - Add line item button
  - For each item: Description, Section, Unit, Unit Price, Default Qty
  - Remove item button
  - Drag reorder (COULD)
- [ ] Section selector (from `quotationSections`)
- [ ] Sub-items support (nested line items)
- [ ] Running total display
- [ ] Terms & Conditions text area (rich text)
- [ ] Add from Library (COULD - defer)

**Note**: Line items are NOW purely for pricing. No "spawns project" toggle.

---

### Story 13C.5: Package Builder - Step 4: Review & Publish

**Points**: 3

**As an** Admin,  
**I want** to review and publish my package,  
**So that** studios can start purchasing it.

**Acceptance Criteria**:

- [ ] Step 4: "Review & Publish"
- [ ] Summary view showing:
  - Package name, description, category
  - Project type and folder structure preview
  - Storage tier
  - All line items with pricing
  - Total starting price
- [ ] Edit buttons to jump back to specific steps
- [ ] "Save as Draft" button
- [ ] "Publish" button (sets `isActive: true`)
- [ ] Success confirmation with link to package list

---

### Story 13C.6: Package Detail View

**Points**: 2

**As an** Admin,  
**I want** to view a published package's details,  
**So that** I can review what studios see.

**Acceptance Criteria**:

- [ ] Detail page at `/admin/settings/service-packages/[id]`
- [ ] Read-only view of all configuration
- [ ] "Edit" button → opens wizard with pre-filled data
- [ ] "Duplicate" button → creates copy with "Copy of" prefix
- [ ] "Deactivate" button (toggles `isActive`)
- [ ] Usage stats: How many quotations created from this template

---

## ✅ Definition of Done

- [ ] List page shows all service packages
- [ ] 4-step wizard fully functional
- [ ] Packages can be created, edited, duplicated
- [ ] Preview matches what studios see
- [ ] Draft auto-save working
- [ ] Publish/Deactivate toggle working

---

## 🔗 Dependencies

| Depends On   | Notes                                 |
| :----------- | :------------------------------------ |
| **Epic 13A** | Schema must be updated first          |
| **Epic 13B** | Folder templates needed for selection |

| Blocks       | Notes                                  |
| :----------- | :------------------------------------- |
| **Epic 13D** | Old UIs removed after this is complete |

---

## 📁 File Structure

```
src/components/modules/admin/service-packages/
├── index.ts
├── list/
│   ├── package-list.tsx
│   ├── package-card.tsx
│   └── list-filters.tsx
├── builder/
│   ├── wizard-context.tsx
│   ├── wizard-shell.tsx
│   ├── step-1-identity.tsx
│   ├── step-2-configuration.tsx
│   ├── step-3-pricing.tsx
│   ├── step-4-review.tsx
│   └── components/
│       ├── line-item-row.tsx
│       ├── folder-preview.tsx
│       └── storage-selector.tsx
└── detail/
    ├── package-detail.tsx
    └── package-stats.tsx
```

---

_Document Version: 1.0_  
_Last Updated: 2026-01-27_
