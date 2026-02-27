# Epic 26: Public Link & Grouping Consistency

**Epic Owner**: Admin/CEO
**Status**: Planning
**Created**: 2026-02-27
**Complexity**: Medium (Data processing + UI parity)
**Priority**: P1 — Studios see unprofessional flat list instead of grouped packages

---

## 📋 Epic Summary

Ensure the **public quotation view** (share link page) groups service line items **by package**, consistent with the Admin Detail view, Studio Review screen, and PDF Preview. Currently, the public view shows a flat list under a single "STANDARD SERVICES" header, mixing items from different packages together.

### Issue Evidence (Screenshots)

**Public View (QT-000002)** — Flat display:

- All items under one "STANDARD SERVICES" header
- Items 1, 2, 2.1, 3 mixed together from different packages
- No package headers, no per-package subtotals

**PDF Preview (QT-000003)** — Correctly grouped:

- Items grouped under "WEDDING PACKAGE" (P1) and "WEDDING PREMIUM" (P2)
- Each package shows its own subtotal
- Sub-items properly nested

### Current State

| View            | Grouping                | Status                                                            |
| --------------- | ----------------------- | ----------------------------------------------------------------- |
| Admin Detail    | By project → by section | ✅ Uses `use-quotation-data.ts`                                   |
| Builder Step 3  | By package              | ✅ Uses `ProjectSectionItems`                                     |
| Studio Detail   | By project → by section | ✅ Uses `buildSectionGroups`                                      |
| PDF Preview     | By package              | ✅ Uses `quotation-document.tsx` logic                            |
| **Public View** | **Flat by section**     | ❌ Uses simple `sections.map(section => items.filter(sectionId))` |

### Target State

- Public view groups items by package (matching PDF Preview)
- Each package shows header with name, project type, and per-package subtotal
- Sub-items properly nested within their parent items
- Pricing summary remains on the right sidebar

---

## 🎯 User Outcomes

| Role              | Outcome                                                          |
| ----------------- | ---------------------------------------------------------------- |
| **Studio/Client** | See professionally grouped quotation on the public share link    |
| **Studio/Client** | Understand which services belong to which package                |
| **Admin**         | Confidence that the public link matches what they see in preview |

---

## 🗂️ Stories

| Story | Description                                          | Points | Priority |
| ----- | ---------------------------------------------------- | ------ | -------- |
| 26.1  | Port package-grouping logic to public quotation view | 5      | HIGH     |
| 26.2  | Visual parity verification across all views          | 2      | MEDIUM   |

**Total Points**: 7

---

## 📊 Detailed Story Specifications

### Story 26.1: Port package-grouping logic to public quotation view

**File**: `src/components/modules/studio/quotations/public/public-quotation-view.tsx`

**Current grouping** (approximate lines 85-102):

```typescript
const groupedBySection = sections.map((section) => ({
  section,
  items: quotation.lineItems.filter((item) => item.sectionId === section._id),
}));
```

**Target**: Group by `sourcePackageId` first, then by section within each package, using logic similar to what `quotation-document.tsx` and `use-quotation-data.ts` provide.

**Implementation approach**:

1. Group items by `sourcePackageId`
2. For each package group, resolve the package name from `selectedPackageIds` + query
3. Within each package, group by `sectionId`
4. Display with package headers showing name + per-package estimate
5. Standalone items (no `sourcePackageId`) go under "Additional Services"

**Data required**:

- The public view already fetches the quotation via `getQuotationByShareToken`
- Need to also fetch service package details (name, projectType) for the selected packages
- Either extend the query to include package names, or fetch them client-side

**Acceptance Criteria**:

- [ ] Line items grouped by package on the public view
- [ ] Each package group shows: package name, project type badge, per-package subtotal
- [ ] Sub-items displayed nested under their parent items
- [ ] Items without a `sourcePackageId` shown under "Additional Services"
- [ ] Layout matches PDF Preview grouping structure
- [ ] Responsive design maintained for mobile views

---

### Story 26.2: Visual parity verification across all views

Verify all 5 views display the same grouping structure:

| View            | Expected                                   |
| --------------- | ------------------------------------------ |
| Admin Detail    | By project (eventName + code) → by section |
| Builder Step 3  | By package (sourcePackageId) → by section  |
| Studio Detail   | By project → by section                    |
| PDF Preview     | By package → table with sub-items          |
| **Public View** | By package → table with sub-items (NEW)    |

**Acceptance Criteria**:

- [ ] Create side-by-side comparison of all 5 views with identical test data
- [ ] Verify sub-item hierarchical numbering is consistent
- [ ] Verify per-group subtotals are calculated identically

---

## 🧩 Affected Components Map

| File                                                 | Change                                     |
| ---------------------------------------------------- | ------------------------------------------ |
| `studio/quotations/public/public-quotation-view.tsx` | Rewrite grouping logic to group by package |
| `convex/functions/quotations/queries/public.ts`      | May need to add package name resolution    |

---

## 🔗 Dependencies

| This Epic | Depends On | Notes                                                |
| --------- | ---------- | ---------------------------------------------------- |
| 26.1      | None       | Self-contained, can be done in parallel with Epic 24 |

---

## 🔄 Status Updates

| Date       | Status   | Notes                                                                         |
| ---------- | -------- | ----------------------------------------------------------------------------- |
| 2026-02-27 | Planning | Public view flat display confirmed via screenshot comparison with PDF preview |

---

**Previous Epic**: Epic 25 - Quotation ID & Display Fixes
**Next Epic**: Epic 27 - PDF Preview Polish
