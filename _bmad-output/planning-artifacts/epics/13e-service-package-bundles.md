# Epic 13E: Service Package Bundles

**Status**: planned  
**Priority**: P2 (Enhancement)  
**Estimated Points**: 15  
**Dependencies**: Epic 13A (servicePackages table must exist)

---

## Epic Summary

Enable admins to create pre-defined bundles of service packages with optional discounts, allowing studios to quickly select common service combinations with promotional pricing.

---

## Business Value

### Problem Statement

Studios often select the same combination of packages (e.g., Photo + Video + Album for weddings). Currently, this requires 3+ individual selections. Additionally, PrimeEditz cannot offer bundle discounts as promotional incentives.

### Solution

Create a **Bundle** abstraction that:

1. Groups multiple packages under one name
2. Enables one-click selection in the studio quotation request
3. Supports optional percentage or fixed discounts
4. Still spawns individual projects (no change to core spawning logic)

### Key Outcomes

- ✅ Faster quotation request for studios (1 click vs 3)
- ✅ Promotional pricing capability for PrimeEditz
- ✅ Increased average order value through bundle incentives
- ✅ No breaking changes to existing flows

---

## Architectural Decision

### Design Principle: Reference, Don't Copy

Bundles **reference** service packages by ID. They do NOT duplicate package data.

```
serviceBundles
    ├── name: "Complete Wedding Bundle"
    ├── packageIds: [photoPackageId, videoPackageId, albumPackageId]  ← References
    └── discountValue: 10  (percentage)
```

**Benefits:**

- Package price changes automatically reflect in bundle pricing
- No data synchronization issues
- Clean separation of concerns

### Schema Addition

```typescript
// NEW TABLE (additive, no migration)
serviceBundles: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  categoryId: v.optional(v.id("projectCategories")),
  packageIds: v.array(v.id("servicePackages")),
  discountType: v.optional(
    v.union(v.literal("percentage"), v.literal("fixed")),
  ),
  discountValue: v.optional(v.number()),
  isActive: v.boolean(),
  createdBy: v.optional(v.string()),
  updatedAt: v.number(),
})
  .index("by_isActive", ["isActive"])
  .index("by_categoryId", ["categoryId"]);
```

---

## User Stories

### 13E.1: Create `serviceBundles` Table (2 points)

**As a** Developer,  
**I want** a `serviceBundles` table in the schema,  
**So that** bundles can be stored and queried.

**Acceptance Criteria:**

- [ ] Table created with all fields from schema above
- [ ] Indexes created for `isActive` and `categoryId`
- [ ] Validators defined for discount types
- [ ] TypeScript types generated correctly

---

### 13E.2: Bundle Builder UI (3 points)

**As an** Admin,  
**I want** to create and edit bundles,  
**So that** I can define package combinations for studios.

**Acceptance Criteria:**

- [ ] Bundle list page at `/admin/settings/bundles`
- [ ] Create bundle form with:
  - Name (required)
  - Description (optional)
  - Category (dropdown)
  - Package selector (multi-select from active packages)
  - Discount type (none / percentage / fixed)
  - Discount value (conditional on type)
  - Is Active toggle
- [ ] Edit existing bundle
- [ ] Delete bundle (with confirmation)
- [ ] Package preview showing combined pricing with discount

---

### 13E.3: Bundle Seed Data (2 points)

**As a** Developer,  
**I want** seed data for common bundles,  
**So that** studios can test the feature immediately.

**Acceptance Criteria:**

- [ ] Seed: "Complete Wedding Bundle" (Photo + Video + Album, 10% discount)
- [ ] Seed: "Photo + Video Combo" (Photo + Video, 5% discount)
- [ ] Seed: "Content Creator Pro" (YouTube + Shorts + Album, 15% discount)
- [ ] Seeds reference existing package seeds from 13A.4

---

### 13E.4: Update Quotation Request UI with Bundle Quick-Select (3 points)

**As a** Studio,  
**I want** to quickly select a bundle when requesting a quote,  
**So that** I save time on common service combinations.

**Acceptance Criteria:**

- [ ] Bundle section appears above package grid (collapsible)
- [ ] Bundle cards show:
  - Bundle name
  - Included packages (list)
  - Original price (struck through if discounted)
  - Discounted price
  - "Save X%" badge (if applicable)
- [ ] Clicking bundle auto-selects its packages
- [ ] User can still modify selection after bundle click
- [ ] User can deselect bundle to go back to à la carte

**UI Mockup:**

```
┌─────────────────────────────────────────────────────────┐
│ 🎁 BUNDLES (Quick Select)                    [Collapse]│
│ ┌─────────────────┐ ┌─────────────────┐                │
│ │ Complete Wedding│ │ Photo + Video   │                │
│ │ Photo+Video+Alb │ │ Photo + Video   │                │
│ │ ₹45,000 →₹40,500│ │ ₹30,000 →₹28,500│                │
│ │ [Save 10%]      │ │ [Save 5%]       │                │
│ └─────────────────┘ └─────────────────┘                │
├─────────────────────────────────────────────────────────┤
│ OR SELECT PACKAGES                                      │
│ [☑] Photo Package  [☑] Video Package  [☑] Album        │
└─────────────────────────────────────────────────────────┘
```

---

### 13E.5: Apply Bundle Discount in Quotation Calculations (2 points)

**As the** System,  
**I want** bundle discounts to be correctly calculated,  
**So that** quotations reflect promotional pricing.

**Acceptance Criteria:**

- [ ] `requestQuotation` mutation accepts optional `bundleId`
- [ ] If `bundleId` provided:
  - Verify all bundle packages are in `selectedPackageIds`
  - Calculate discount based on `discountType` and `discountValue`
  - Store `discountAmount` and `bundleId` on quotation
- [ ] Discount appears as line item: "Bundle Discount (Complete Wedding) -₹4,500"
- [ ] Total reflects discounted price
- [ ] If user modifies package selection, bundle discount is removed

**Pricing Logic:**

```typescript
const packagesSubtotal = lineItems.reduce(
  (sum, item) => sum + item.rate * item.quantity,
  0,
);

let discountAmount = 0;
if (bundle) {
  discountAmount =
    bundle.discountType === "percentage"
      ? Math.round(packagesSubtotal * (bundle.discountValue / 100))
      : (bundle.discountValue ?? 0);
}

const subtotalAfterDiscount = packagesSubtotal - discountAmount;
const gstAmount = Math.round(subtotalAfterDiscount * 0.18);
const totalAmount = subtotalAfterDiscount + gstAmount;
```

---

### 13E.6: Bundle Analytics (3 points)

**As an** Admin,  
**I want** to see bundle usage statistics,  
**So that** I can optimize promotional offerings.

**Acceptance Criteria:**

- [ ] Bundle list shows usage count
- [ ] Bundle detail page shows:
  - Number of quotations using this bundle
  - Total revenue generated
  - Total discount given
  - Conversion rate (quotations approved / total)
- [ ] Dashboard widget: "Top Bundles This Month"

---

## Technical Implementation Notes

### Files to Create

```
convex/
├── schema.ts                           # Add serviceBundles table
├── functions/serviceBundles/
│   ├── queries.ts                      # list, get, getWithPackages
│   └── mutations.ts                    # create, update, delete, toggleActive
└── seeds/serviceBundles.seeds.ts       # Bundle seed data

src/
├── app/(protected)/@admin/settings/bundles/
│   ├── page.tsx                        # List page
│   ├── new/page.tsx                    # Create page
│   └── [id]/
│       ├── page.tsx                    # Detail/edit page
│       └── edit/page.tsx               # Edit page
└── components/modules/
    ├── admin/bundles/
    │   ├── bundle-list.tsx
    │   ├── bundle-form.tsx
    │   ├── bundle-card.tsx
    │   └── index.ts
    └── studio/quotation-request/
        └── bundle-quick-select.tsx     # NEW component
```

### No Breaking Changes

| Existing Component          | Change Required                                  |
| --------------------------- | ------------------------------------------------ |
| `servicePackages` table     | None                                             |
| `quotations` table          | Add optional `bundleId`, `discountAmount` fields |
| `requestQuotation` mutation | Add optional `bundleId` parameter                |
| Package builder UI          | None                                             |
| Quotation spawning logic    | None                                             |

---

## ❌ DO NOT

- ❌ Do NOT duplicate package data inside bundles
- ❌ Do NOT change project spawning logic (still 1 package = 1 project)
- ❌ Do NOT require bundles (à la carte must still work)
- ❌ Do NOT apply discount if user modifies package selection
- ❌ Do NOT start 13E before 13A.1 is complete

---

## Dependency Graph

```
Epic 13A (servicePackages)
    │
    ├── 13A.1 Create servicePackages table
    │       ↓
    └── Epic 13E (serviceBundles)
            ├── 13E.1 Create serviceBundles table
            ├── 13E.2 Bundle Builder UI
            ├── 13E.3 Bundle Seed Data
            ├── 13E.4 Update Quotation Request UI
            ├── 13E.5 Apply Discount in Calculations
            └── 13E.6 Bundle Analytics
```

---

## Success Metrics

| Metric                       | Target                          |
| ---------------------------- | ------------------------------- |
| Bundle adoption rate         | 30% of quotations use bundles   |
| Average order value increase | +15% for bundle orders          |
| Time to create quotation     | Reduced by 40% for bundle users |

---

## Timeline

| Phase                 | Stories    | Status      |
| --------------------- | ---------- | ----------- |
| Phase 1: Epic 13A-13D | 23 stories | In Progress |
| Phase 2: Epic 13E     | 6 stories  | Planned     |

**Start 13E only after 13A.1 (servicePackages table) is complete.**
