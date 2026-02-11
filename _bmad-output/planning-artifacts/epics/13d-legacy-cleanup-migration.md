# Epic 13D: Legacy Cleanup & Migration

**Parent Epic**: [13: Unified Service Package Configuration](./13-unified-service-package-configuration.md)  
**Status**: Backlog  
**Created**: 2026-01-27  
**Updated**: 2026-01-28  
**Complexity**: Medium  
**Estimated Points**: 13

---

## 📋 Epic Summary

This epic removes deprecated configuration UIs and updates the system for the new model. This is the **FINAL** cleanup phase - only run after 13A, 13B, and 13C are complete and tested.

**Key Actions**:

1. Remove old `quotation-templates` UI (replaced by `service-packages`)
2. Remove old `project-types` detailed config UI (keep basic type selection)
3. Update Studio quotation request flow for multi-package selection
4. Clear development data for clean slate

---

## ⚠️ CRITICAL: Execution Order

**This epic MUST be the LAST to execute!**

```
✅ 13A: Schema Consolidation     → DONE
✅ 13B: Folder Enhancement       → DONE
✅ 13C: Service Package UI       → DONE
🔄 13D: Legacy Cleanup           → NOW SAFE TO RUN
```

Running 13D before 13A-13C are complete will break the application!

---

## 📝 User Stories

### Story 13D.1: Remove Old Quotation Templates UI

**Points**: 2

**As a** Developer,  
**I want** to remove the old quotation templates configuration UI,  
**So that** admins use the new Service Package Builder instead.

**Acceptance Criteria**:

- [ ] Delete directory: `src/components/modules/admin/quotation-templates/`
- [ ] Delete routes:
  - `src/app/(protected)/@admin/settings/quotation-templates/page.tsx`
  - `src/app/(protected)/@admin/settings/quotation-templates/new/page.tsx`
  - `src/app/(protected)/@admin/settings/quotation-templates/[id]/page.tsx`
  - `src/app/(protected)/@admin/settings/quotation-templates/[id]/edit/page.tsx`
- [ ] Update sidebar navigation to remove "Quotation Templates" link
- [ ] Add redirect from `/admin/settings/quotation-templates` → `/admin/settings/service-packages`
- [ ] Verify no import errors after deletion

**Verification Command**:

```bash
pnpm tsc --noEmit
pnpm build
```

**❌ DO NOT**:

- Do NOT delete until Epic 13C is fully working
- Do NOT delete backend functions yet (may need for reference)
- Do NOT remove `quotationSections` (still used in pricing)

**Files to Delete**:

```
DELETE: src/components/modules/admin/quotation-templates/
  - components/ (3 files)
  - index.ts
  - price-preview.tsx
  - template-card.tsx
  - template-detail.tsx
  - template-editor.tsx
  - template-list.tsx

DELETE: src/app/(protected)/@admin/settings/quotation-templates/ (entire directory)
```

**Files to Modify**:

```
MODIFY: src/lib/sidebar-config.ts (or wherever nav is defined)
  - Remove "Quotation Templates" nav item
  - OR redirect to "Service Packages"
```

---

### Story 13D.2: Simplify Project Types UI

**Points**: 2

**As a** Developer,  
**I want** to simplify the project types configuration,  
**So that** it only shows basic type info without dynamic fields.

**Acceptance Criteria**:

- [ ] Keep basic project types list (name, category, active status)
- [ ] Remove project type FIELDS management UI entirely
- [ ] Delete: `src/components/modules/admin/project-types/fields/`
- [ ] Simplify project type detail view (remove fields tab)
- [ ] Keep mutations for create/update project type (minimal fields)

**Rationale**: Dynamic fields (`projectTypeFields`) added complexity. In the new model:

- Required project info is collected during onboarding
- Package-specific config is in the service package
- No need for per-type dynamic fields

**Files to Delete**:

```
DELETE: src/components/modules/admin/project-types/fields/ (entire directory)
```

**Files to Modify**:

```
MODIFY: src/components/modules/admin/project-types/detail/
  - Remove fields tab/section
  - Simplify to show: name, category, active status only
```

---

### Story 13D.3: Remove Quotation Sections Standalone UI

**Points**: 2

**As a** Developer,  
**I want** to remove the standalone quotation sections page,  
**So that** sections are managed inline during package creation.

**Acceptance Criteria**:

- [ ] Delete route: `src/app/(protected)/@admin/settings/quotation-sections/page.tsx`
- [ ] Delete directory: `src/components/modules/admin/quotation-sections/`
- [ ] Update sidebar navigation to remove "Quotation Sections" link
- [ ] Keep `quotationSections` table (still used for categorizing line items)
- [ ] Sections can be created inline in Package Builder or via seed

**Alternative**: If inline section creation is complex, defer and keep the page.

**Files to Delete**:

```
DELETE: src/components/modules/admin/quotation-sections/
  - section-card.tsx
  - section-drawer.tsx
  - section-list.tsx
  - types.ts
  - index.ts

DELETE: src/app/(protected)/@admin/settings/quotation-sections/page.tsx
```

---

### Story 13D.4: Update Studio Quotation Request Flow

**Points**: 3

**As a** Studio,  
**I want** to select multiple service packages when requesting a quotation,  
**So that** I can get Photo + Video + Album as separate projects.

**Acceptance Criteria**:

- [ ] Update Step 1 of studio quotation request to show Service Packages
- [ ] Allow selecting MULTIPLE packages (checkbox or multi-select)
- [ ] Display combined pricing from all selected packages
- [ ] Show what projects will be created (e.g., "This will create 3 projects")
- [ ] Mobile-friendly package selection

**Technical Pattern**:

- **File**: `src/components/modules/studio/quotations/request-flow/steps/step-1-packages.tsx`
- **Query**: `useQuery(api.servicePackages.listActive)`

**UI Change**:

```
BEFORE:
┌─────────────────────────────────────┐
│  Select a Package:                  │
│  ○ Silver Package                   │
│  ○ Gold Package                     │
│  ○ Premium Package                  │
└─────────────────────────────────────┘

AFTER:
┌─────────────────────────────────────┐
│  Select Packages (one or more):     │
│  ☐ Wedding Photography  ₹8,500     │
│  ☐ Wedding Cinema       ₹15,000    │
│  ☐ Premium Album        ₹12,000    │
│                                     │
│  Selected: 2 packages               │
│  Estimated Total: ₹23,500           │
│  Projects to create: 2              │
└─────────────────────────────────────┘
```

**❌ DO NOT**:

- Do NOT require exactly one package (allow 1 to N)
- Do NOT hide the combined total
- Do NOT forget to show project count

**Files to Modify**:

```
MODIFY: src/components/modules/studio/quotations/request-flow/steps/step-1-packages.tsx
  - Change from single select to multi-select
  - Update to use servicePackages instead of quotationTemplates

MODIFY: src/components/modules/studio/quotations/request-flow/request-wizard-context.tsx
  - Change templateId to selectedPackageIds[]
```

---

### Story 13D.5: Update Quotation Request Mutation

**Points**: 2

**As a** Developer,  
**I want** the quotation request mutation to accept multiple packages,  
**So that** the backend correctly processes multi-package requests.

**Acceptance Criteria**:

- [ ] Update `requestQuotation` mutation args:
  - Change `templateId` → `selectedPackageIds: v.array(v.id("servicePackages"))`
- [ ] Aggregate line items from all selected packages
- [ ] Calculate combined subtotal, GST, total
- [ ] Store all package IDs on the quotation
- [ ] Return created quotation ID

**Technical Pattern**:

- **File**: `convex/functions/quotations/mutations.ts`
- **Auth Wrapper**: `studioMutation`

**Implementation**:

```typescript
export const requestQuotation = studioMutation({
  args: {
    endClientName: v.string(),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    selectedPackageIds: v.array(v.id("servicePackages")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.selectedPackageIds.length === 0) {
      throw new Error("At least one package must be selected");
    }

    // Aggregate line items from all packages
    const allLineItems: LineItem[] = [];
    for (const packageId of args.selectedPackageIds) {
      const pkg = await ctx.db.get(packageId);
      if (!pkg) throw new Error(`Package not found: ${packageId}`);

      allLineItems.push(
        ...pkg.lineItems.map((item) => ({
          ...item,
          packageId, // Track which package this came from
        })),
      );
    }

    // Calculate totals
    const subtotal = allLineItems.reduce(
      (sum, item) => sum + item.rate * item.quantity,
      0,
    );
    const gstAmount = subtotal * 0.18;
    const totalAmount = subtotal + gstAmount;

    // Create quotation
    const quotationId = await ctx.db.insert("quotations", {
      studioId: ctx.user.studioProfileId,
      endClientName: args.endClientName,
      eventName: args.eventName,
      eventDate: args.eventDate,
      selectedPackageIds: args.selectedPackageIds,
      lineItems: allLineItems,
      subtotal,
      gstAmount,
      totalAmount,
      status: "pending_review",
    });

    return quotationId;
  },
});
```

**❌ DO NOT**:

- Do NOT accept empty `selectedPackageIds` array
- Do NOT forget to aggregate line items
- Do NOT skip GST calculation

**Files to Modify**:

```
MODIFY: convex/functions/quotations/mutations.ts
  - Update requestQuotation args and handler
```

---

### Story 13D.6: Clear Development Data

**Points**: 2

**As a** Developer,  
**I want** to clear old development data,  
**So that** we have a clean slate for testing the new model.

**Acceptance Criteria**:

- [ ] Create data clearing script: `convex/scripts/clearDevData.ts`
- [ ] Clear: quotations (old format), quotationTemplates (deprecated)
- [ ] Keep: profiles, projectCategories, projectTypes, storageTiers, quotationSections
- [ ] Run re-seed for: servicePackages, folderTemplates
- [ ] Document the clearing process

**Script**:

```typescript
// convex/scripts/clearDevData.ts (run via npx convex run)
import { internalMutation } from "../_generated/server";

export const clearOldData = internalMutation({
  handler: async (ctx) => {
    // Clear old quotations
    const quotations = await ctx.db.query("quotations").collect();
    for (const q of quotations) {
      await ctx.db.delete(q._id);
    }

    // Clear projects spawned from old quotations
    const projects = await ctx.db.query("projects").collect();
    for (const p of projects) {
      await ctx.db.delete(p._id);
    }

    // Clear folders
    const folders = await ctx.db.query("folders").collect();
    for (const f of folders) {
      await ctx.db.delete(f._id);
    }

    console.log("Old data cleared. Run seed to populate new data.");
  },
});
```

**Run Command**:

```bash
npx convex run scripts/clearDevData:clearOldData
npx convex run functions/seed:seed
```

**❌ DO NOT**:

- Do NOT run on production (dev only!)
- Do NOT delete profiles/users
- Do NOT delete base config tables

---

## 📊 Files Summary

### Files to DELETE (34 files)

```
src/components/modules/admin/quotation-templates/    (9 files)
src/components/modules/admin/quotation-sections/     (5 files)
src/components/modules/admin/project-types/fields/   (2 files)

src/app/(protected)/@admin/settings/quotation-templates/  (4 pages)
src/app/(protected)/@admin/settings/quotation-sections/   (1 page)
```

### Files to MODIFY

```
convex/functions/quotations/mutations.ts
  - requestQuotation: multi-package support

src/components/modules/studio/quotations/request-flow/
  - step-1-packages.tsx: multi-select
  - request-wizard-context.tsx: selectedPackageIds[]

src/lib/sidebar-config.ts (or navigation)
  - Remove old nav items
  - Add redirects
```

### Files to CREATE

```
convex/scripts/clearDevData.ts
```

---

## ✅ Definition of Done

- [ ] All deprecated UI directories deleted
- [ ] All deprecated routes removed
- [ ] Sidebar navigation updated
- [ ] Studio can select multiple packages
- [ ] Quotation request works with multi-package
- [ ] Development data cleared
- [ ] Fresh seed data added
- [ ] `pnpm tsc` has no errors
- [ ] `pnpm build` succeeds
- [ ] No 404s on admin settings pages

---

## 🧪 Testing Requirements

- [ ] Types pass: `pnpm tsc --noEmit`
- [ ] Build passes: `pnpm build`
- [ ] Manual test: Studio selects 2 packages → quotation created
- [ ] Manual test: Admin approves → 2 projects spawn
- [ ] Manual test: Admin settings navigation works
- [ ] Manual test: Old URLs redirect properly

---

## 🔗 Dependencies

| Depends On   | Notes                              |
| :----------- | :--------------------------------- |
| **Epic 13A** | Schema must be finalized           |
| **Epic 13B** | Folder templates must be working   |
| **Epic 13C** | New UI must be complete and tested |

| Blocks | Notes                     |
| :----- | :------------------------ |
| None   | This is the final cleanup |

---

## ⚠️ Risk Mitigation

1. **Don't delete until replacement is proven**
   - Verify Epic 13C is fully working
   - Test new flow end-to-end first

2. **Staged deletion**
   - Delete one directory at a time
   - Run `pnpm tsc` after each deletion
   - Commit after successful verification

3. **Data clearing**
   - Always backup before clearing
   - Verify you're on DEV environment
   - Have seed script ready to run

---

_Document Version: 2.0_  
_Last Updated: 2026-01-28 12:50 IST_
