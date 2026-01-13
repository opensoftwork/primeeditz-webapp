# Quotation System Architecture - Brainstorming Session

**Date**: 2026-01-12 to 2026-01-13  
**Participants**: Life-design (Product Owner), PM Agent (John), Brainstorming Facilitator  
**Session Duration**: ~90 minutes

---

## 🎯 Session Goals

1. **Architecture Decision**: How to structure quotation system for scale
2. **Modularity**: Make it copy-pastable to other projects via Convex Components
3. **Feature Prioritization**: What goes in MVP vs. future phases
4. **UI/UX Design**: "Clinical Workspace" aesthetic for professional ERP feel

---

## 🔍 Key Decisions Made

### 1. Component Architecture

**Decision**: Split into TWO independent Convex Components

```
convex/components/
├── quotation/        # Quotation management
│   ├── sections      # User-defined groupings
│   ├── templates     # Reusable blueprints
│   └── quotations    # First-class entities with versioning
│
└── library/          # Items catalog (independent)
    ├── categories    # User-defined groups
    └── items         # Reusable catalog items
```

**Rationale**:

- Library can be used by quotations, invoices, inventory, etc.
- Each component is 100% portable - copy folder + register in `convex.config.ts`

### 2. Quotation as First-Class Entity

**Decision**: Quotation is NOT a child of Project

**Rationale**:

- Enables standalone internal estimates
- Supports multi-project quotations
- Enables future ERP capabilities (recurring clients, invoicing)

### 3. User-Configurable Sections

**Decision**: Sections are user-defined, not hardcoded categories

**Examples**: "Design Services", "Post-Production", "Interior Works"

**Rationale**: Different studios have different service categories

### 4. UI Form Factor

**Decision**: Full-page "Clinical Workspace" instead of drawer

**Specs**:

- Zero/minimal border radius (2-4px max)
- Monospace fonts for numbers
- 32-40px row heights
- High data density
- Sticky headers/footers

### 5. Migration Strategy

**Decision**: Keep main app schema tables temporarily, migrate UI to component API

**Phase 1 (Now)**: Wire `quotationSections` UI to component
**Phase 2 (Later)**: Full migration of templates and quotations

---

## 📊 Component API Summary

### Quotation Component

| Module     | Queries                                                                                                  | Mutations                                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sections   | `getSections`, `getSection`                                                                              | `createSection`, `updateSection`, `toggleSectionActive`, `reorderSections`, `deleteSection`                                                                                         |
| templates  | `getTemplates`, `getTemplate`, `getTemplatesByProjectType`                                               | `createTemplate`, `updateTemplate`, `toggleTemplateActive`, `deleteTemplate`, `duplicateTemplate`                                                                                   |
| quotations | `getQuotations`, `getQuotation`, `getQuotationByCode`, `getQuotationHistory`, `getQuotationWithSections` | `createQuotation`, `updateQuotation`, `sendQuotation`, `markQuotationViewed`, `approveQuotation`, `requestChanges`, `rejectQuotation`, `createQuotationRevision`, `deleteQuotation` |

### Library Component

| Queries                                                                                           | Mutations                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getCategories`, `getCategory`, `getItems`, `getItem`, `searchItems`, `getItemsGroupedByCategory` | `createCategory`, `updateCategory`, `reorderCategories`, `deleteCategory`, `createItem`, `updateItem`, `reorderItems`, `deleteItem`, `duplicateItem`, `bulkImportItems` |

---

## 🗂️ Files Created

### Convex Components

```
convex/components/quotation/
├── convex.config.ts
├── schema.ts
├── sections/
│   ├── queries.ts
│   └── mutations.ts
├── templates/
│   ├── queries.ts
│   └── mutations.ts
└── quotations/
    ├── queries.ts
    └── mutations.ts

convex/components/library/
├── convex.config.ts
├── schema.ts
├── queries.ts
└── mutations.ts
```

### Planning Artifacts

```
_bmad-output/planning-artifacts/
├── decisions/
│   └── 2026-01-12-quotation-folder-sequencing.md
└── epics/
    └── 04-quotation-system.md (existing, updated)
```

---

## 🔜 Next Steps

1. [ ] Wire `section-list.tsx` to use component API
2. [ ] Create wrapper functions in main app for component calls
3. [ ] Build "Clinical Workspace" UI for quotation builder
4. [ ] Migrate `quotationTemplates` UI to component
5. [ ] Full quotation creation workflow

---

## 📝 Constraints Discovered

### Convex Component Limitations

| Constraint                       | Workaround                          |
| -------------------------------- | ----------------------------------- |
| No `ctx.auth` in components      | Pass `createdBy` as string argument |
| IDs become strings at boundary   | Use `v.string()` for external links |
| No direct table access from host | Expose all needed queries/mutations |
| No cross-component joins         | Fetch and join in host app          |

---

## 🎨 UI Design Notes

### "Clinical/Surgical" Aesthetic

- **Not rounded** - Sharp, precise (2-4px radius max)
- **Data-dense** - Spreadsheet-like row heights
- **Monospace numbers** - Perfect column alignment
- **Minimal chrome** - Full workspace, no wasted space
- **Sticky elements** - Headers, footers, totals always visible

### Reference Component

`_bmad-output/implementation-artifacts/references/quotation-design.tsx` - 795 lines reference implementation with:

- Nested line items
- Section grouping
- Item library drawer
- GST calculation
- Print/preview modes
- Dark/light theme

---

**Status**: Architecture complete, implementation in progress
