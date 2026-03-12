# Story 26.1: Port Package-Grouping Logic to Public Quotation View

**Epic**: Epic 26 - Public Link & Grouping Consistency
**Status**: backlog
**Complexity**: Medium (5 points)
**Created**: 2026-02-27
**Priority**: HIGH — Studios see unprofessional flat list

---

## 📋 User Story

**As a** Studio/Client viewing a public quotation link,
**I want** the line items grouped by service package (matching the PDF preview),
**So that** I can understand which services belong to which package.

---

## ⚠️ Current State Analysis

### Public View (`public-quotation-view.tsx`, lines 85-102)

```typescript
// CURRENT: Flat section grouping — mixes items from different packages
const groupedBySection = sections.map((section) => ({
  section,
  items: quotation.lineItems.filter((item) => item.sectionId === section._id),
}));
```

### Screenshot Evidence

**Public View (QT-000002)**: All items under one "STANDARD SERVICES" header — items from Wedding Package and Wedding Premium mixed together.

**PDF Preview (QT-000003)**: Correctly shows "WEDDING PACKAGE" (P1, ₹6,500) and "WEDDING PREMIUM" (P2, ₹10,000) as separate groups with per-package subtotals.

---

## ✅ Acceptance Criteria

### Package Grouping

- [ ] **Given** a quotation with items from multiple packages
- [ ] **When** viewing the public share link
- [ ] **Then** items are grouped by `sourcePackageId`
- [ ] **And** each group has a header showing: package name, project type badge, per-package subtotal

### Package Headers

- [ ] **Given** a package group
- [ ] **When** viewing the header
- [ ] **Then** it shows the package name (e.g., "WEDDING PACKAGE")
- [ ] **And** the project type (e.g., "WEDDING PHOTOGRAPHY")
- [ ] **And** the package subtotal (e.g., "₹6,500")

### Sub-Items

- [ ] **Given** a line item with sub-items
- [ ] **When** viewing the public page
- [ ] **Then** sub-items are displayed nested under the parent with indentation
- [ ] **And** hierarchical numbering is used (1, 2, 2.1, etc.)

### Standalone Items

- [ ] **Given** items without a `sourcePackageId`
- [ ] **When** viewing the public page
- [ ] **Then** they appear under an "Additional Services" section

### Data Resolution

- [ ] **Given** the public view needs package names
- [ ] **When** the page loads
- [ ] **Then** package names are resolved (either from the query or embedded in the quotation data)

---

## 📁 Files to Update

| File                                                                        | Change                                                    |
| --------------------------------------------------------------------------- | --------------------------------------------------------- |
| `src/components/modules/studio/quotations/public/public-quotation-view.tsx` | Rewrite grouping logic to group by `sourcePackageId`      |
| `convex/functions/quotations/queries/public.ts`                             | May need to return package names alongside quotation data |

---

## 🛠 Technical Implementation

### Step 1: Group Items by Package

```typescript
// Build package groups from line items
const packageGroups = useMemo(() => {
  const groups = new Map<
    string,
    {
      packageId: string;
      packageName: string;
      projectTypeName?: string;
      items: typeof quotation.lineItems;
      subtotal: number;
    }
  >();

  for (const item of quotation.lineItems) {
    const pkgId = item.sourcePackageId || "__no_package__";
    if (!groups.has(pkgId)) {
      groups.set(pkgId, {
        packageId: pkgId,
        packageName: resolvePackageName(pkgId), // From query or embedded data
        items: [],
        subtotal: 0,
      });
    }
    const group = groups.get(pkgId)!;
    group.items.push(item);
    group.subtotal += calculateItemTotal(item);
  }

  return Array.from(groups.values());
}, [quotation.lineItems]);
```

### Step 2: Render Package Groups

```tsx
{
  packageGroups.map((group, idx) => (
    <div key={group.packageId}>
      <PackageHeader
        name={group.packageName}
        projectType={group.projectTypeName}
        subtotal={group.subtotal}
        index={idx + 1}
      />
      <LineItemsTable items={group.items} />
    </div>
  ));
}
```

### Step 3: Resolve Package Names

Option A: Extend the `getQuotationByShareToken` query to include package details.

Option B: Use `selectedPackageIds` to fetch package names client-side.

---

## 🚀 Definition of Done

- [ ] Public view groups items by package
- [ ] Package headers with name, type, and subtotal
- [ ] Sub-items nested with hierarchical numbering
- [ ] Standalone items under "Additional Services"
- [ ] Layout matches PDF Preview structure
- [ ] Responsive design maintained
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                                 |
| ---------- | ------- | ------------------------------------- |
| 2026-02-27 | backlog | Flat display confirmed via screenshot |

---

**Previous Story**: None (first in epic)
**Next Story**: 26-2 - Visual parity verification
