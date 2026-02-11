# Epic 13A: Schema Consolidation

**Parent Epic**: [13: Unified Service Package Configuration](./13-unified-service-package-configuration.md)  
**Status**: Backlog  
**Created**: 2026-01-27  
**Updated**: 2026-01-28  
**Complexity**: High  
**Estimated Points**: 13

---

## 📋 Epic Summary

This epic consolidates the fragmented schema into a unified model:

1. **RENAME**: `quotationTemplates` → `servicePackages` (breaking change)
2. **MULTI-SELECT**: Quotations link to MULTIPLE packages via `selectedPackageIds[]`
3. **LINE ITEMS = PRICING ONLY**: Remove all spawning config from line items
4. **PACKAGE-LEVEL SPAWNING**: Each package defines ONE project type

---

## 🎯 User Outcomes

| Role       | Outcome                                                  |
| :--------- | :------------------------------------------------------- |
| **Admin**  | Configure packages with clear 1:1 project mapping        |
| **Studio** | Select multiple packages for different project timelines |
| **System** | Simple N-packages = N-projects spawning                  |

---

## 📐 Schema Changes

### NEW: `servicePackages` Table (replaces `quotationTemplates`)

```typescript
// convex/schema.ts

servicePackages: defineTable({
  // Identity
  name: v.string(),
  description: v.optional(v.string()),
  categoryId: v.optional(v.id("projectCategories")),

  // PROJECT SPAWNING CONFIG (1 package = 1 project type)
  projectTypeId: v.id("projectTypes"),
  folderTemplateId: v.id("folderTemplates"),
  defaultStorageTierId: v.optional(v.id("storageTiers")),

  // PRICING ONLY - no spawning config in line items!
  lineItems: v.array(
    v.object({
      id: v.string(),
      sectionId: v.optional(v.id("quotationSections")),
      description: v.string(),
      unit: v.string(),
      rate: v.number(),
      quantity: v.number(),
      subItems: v.optional(v.array(v.object({
        description: v.string(),
        amount: v.optional(v.number()),
      }))),
      // REMOVED: spawnsProject, projectTypeId, selectedFolderTemplateId
    }),
  ),

  terms: v.optional(v.string()),
  isActive: v.boolean(),
  createdBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
})
  .index("by_categoryId", ["categoryId"])
  .index("by_isActive", ["isActive"]),
```

### UPDATED: `quotations` Table

```typescript
quotations: defineTable({
  // Client context
  studioId: v.id("profiles"),
  endClientName: v.string(),
  eventName: v.optional(v.string()),
  eventDate: v.optional(v.number()),

  // CHANGE: Multiple packages instead of single template
  selectedPackageIds: v.array(v.id("servicePackages")), // Array!

  // Aggregated from all selected packages
  lineItems: v.array(quotationLineItemValidator),

  // Pricing (calculated from all packages)
  subtotal: v.number(),
  gstAmount: v.number(),
  totalAmount: v.number(),
  discount: v.optional(v.number()),

  // Workflow
  status: quotationStatusValidator,
  viewToken: v.optional(v.string()),
  sentAt: v.optional(v.number()),
  approvedAt: v.optional(v.number()),
  rejectedAt: v.optional(v.number()),

  // Audit
  createdBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
}),
```

---

## 📝 User Stories

### Story 13A.1: Create `servicePackages` Table

**Points**: 3

**As a** Developer,  
**I want** to create the new `servicePackages` table structure,  
**So that** we have a clean foundation for the new model.

**Acceptance Criteria**:

- [ ] Create `servicePackages` table with schema above
- [ ] Add indexes: `by_categoryId`, `by_isActive`
- [ ] Run `pnpm convex dev` to validate schema
- [ ] Remove old `quotationTemplates` table (breaking change OK)

**Technical Pattern**:

- **File**: `convex/schema.ts`
- **Auth Wrapper**: N/A (schema definition)
- **Validator Location**: Define `servicePackageLineItemValidator` in schema

**❌ DO NOT**:

- Do NOT keep `quotationTemplates` for backward compatibility
- Do NOT add `spawnsProject` or `projectTypeId` to line items
- Do NOT use recursive validators (Convex doesn't support them)

**Files to Modify**:

```
MODIFY: convex/schema.ts
  - Remove quotationTemplates table definition
  - Add servicePackages table definition
  - Update any validators that reference quotationTemplates
```

---

### Story 13A.2: Update `quotations` Table for Multi-Package

**Points**: 2

**As a** Developer,  
**I want** quotations to reference multiple packages,  
**So that** studios can combine packages for different project types.

**Acceptance Criteria**:

- [ ] Change `quotations.templateId` → `quotations.selectedPackageIds: v.array(v.id("servicePackages"))`
- [ ] Ensure `lineItems` in quotations still store the pricing snapshot
- [ ] Add index `by_studioId` if not present
- [ ] Update TypeScript types in `_generated/`

**Technical Pattern**:

- **File**: `convex/schema.ts`
- **Migration**: Clear dev data, no migration needed

**❌ DO NOT**:

- Do NOT try to migrate old quotations
- Do NOT keep `templateId` field

**Files to Modify**:

```
MODIFY: convex/schema.ts
  - Update quotations table definition
  - Change templateId to selectedPackageIds array
```

---

### Story 13A.3: Update Spawning Logic for Multi-Package

**Points**: 3

**As a** System,  
**I want** project spawning to iterate through selected packages,  
**So that** each package creates exactly one project.

**Acceptance Criteria**:

- [ ] Rename function: `spawnProjectsFromQuotation` (keep plural, but different logic)
- [ ] Return `Promise<Id<"projects">[]>` (array of created project IDs)
- [ ] For each package in `quotation.selectedPackageIds`:
  - Get package from DB
  - If `package.projectTypeId` exists:
    - Generate unique project code
    - Create project with package's `projectTypeId`, `folderTemplateId`, `storageTierId`
    - Setup folders using `setupFoldersInternal`
    - Log to `statusHistory`
- [ ] Update `approveQuotation` mutation to use new logic

**Technical Pattern**:

- **File**: `convex/functions/projects/spawning.ts`
- **Auth Wrapper**: This is an internal function, called from `approveQuotation`
- **Error Handling**: Throw on any failure, rollback handled by Convex

**New Logic**:

```typescript
// convex/functions/projects/spawning.ts

export async function spawnProjectsFromQuotation(
  ctx: MutationCtx,
  quotationId: Id<"quotations">,
): Promise<Id<"projects">[]> {
  const quotation = await ctx.db.get(quotationId);
  if (!quotation) throw new Error("Quotation not found");

  const projectIds: Id<"projects">[] = [];

  // Iterate packages, NOT line items
  for (const packageId of quotation.selectedPackageIds) {
    const pkg = await ctx.db.get(packageId);
    if (!pkg || !pkg.projectTypeId) continue;

    // Create project from package config
    const projectId = await ctx.db.insert("projects", {
      quotationId: quotation._id,
      studioId: quotation.studioId,
      projectTypeId: pkg.projectTypeId,
      source: "quotation_spawned",
      phase: "onboarding",
      actionState: "awaiting_uploads",
      endClientName: quotation.endClientName,
      eventName: quotation.eventName,
      code: await generateProjectCode(ctx),
    });

    // Setup folders
    await setupFoldersInternal(ctx, projectId, pkg.folderTemplateId);

    // Log status
    await ctx.db.insert("statusHistory", {
      entityType: "project",
      entityId: projectId,
      fromStatus: null,
      toStatus: "onboarding",
      changedBy: null,
      reason: `Auto-created from quotation approval (package: ${pkg.name})`,
    });

    projectIds.push(projectId);
  }

  return projectIds;
}
```

**❌ DO NOT**:

- Do NOT iterate through `quotation.lineItems` for spawning
- Do NOT check `lineItem.spawnsProject` (removed)
- Do NOT create project if package has no `projectTypeId`

**Files to Modify**:

```
MODIFY: convex/functions/projects/spawning.ts
  - Rewrite spawnProjectsFromQuotation logic
  - Use selectedPackageIds instead of lineItems

MODIFY: convex/functions/quotations/mutations.ts
  - Update approveQuotation to use new spawning logic
```

---

### Story 13A.4: Create Service Package Seeds

**Points**: 2

**As a** Developer,  
**I want** seeded service packages for testing,  
**So that** I can validate the new model works correctly.

**Acceptance Criteria**:

- [ ] Create `convex/seeds/servicePackages.ts`
- [ ] Seed at least 3 packages:
  - "Wedding Photography Package" → Wedding Photo project type
  - "Wedding Cinema Package" → Wedding Video project type
  - "Premium Album Package" → Album project type
- [ ] Each package has proper line items for pricing
- [ ] Update `convex/functions/seed.ts` to include service packages

**Technical Pattern**:

- **File**: `convex/seeds/servicePackages.ts`
- **Pattern**: Follow existing seed file patterns

**Files to Create/Modify**:

```
CREATE: convex/seeds/servicePackages.ts
  - Define seed data for 3+ packages

MODIFY: convex/functions/seed.ts
  - Import and call seedServicePackages
  - Ensure correct ordering (projectTypes before servicePackages)
```

---

### Story 13A.5: Update Quotation Mutations

**Points**: 2

**As a** Developer,  
**I want** quotation mutations to work with multi-package model,  
**So that** the complete flow works end-to-end.

**Acceptance Criteria**:

- [ ] Update `requestQuotation` to accept `selectedPackageIds: Id<"servicePackages">[]`
- [ ] Aggregate line items from all selected packages
- [ ] Calculate combined `subtotal`, `gstAmount`, `totalAmount`
- [ ] Update `createQuotation` (admin) to use same model

**Technical Pattern**:

- **File**: `convex/functions/quotations/mutations.ts`
- **Auth Wrapper**: `studioMutation` for request, `adminMutation` for create
- **Validation**: Use Zod for args validation

**❌ DO NOT**:

- Do NOT accept single `templateId` anymore
- Do NOT copy spawning config from packages to quotation

**Files to Modify**:

```
MODIFY: convex/functions/quotations/mutations.ts
  - Update requestQuotation args and handler
  - Update createQuotation args and handler
  - Add helper: aggregateLineItemsFromPackages()
```

---

### Story 13A.6: Deprecate `projectTypeFields` Table

**Points**: 1

**As a** Developer,  
**I want** to mark `projectTypeFields` as deprecated,  
**So that** we don't maintain unused complexity.

**Acceptance Criteria**:

- [ ] Add deprecation comment to `projectTypeFields` in schema
- [ ] DO NOT delete the table yet (may be used by existing code)
- [ ] Document in epic that UI removal is in 13D
- [ ] If any fields are critical, move to `typeSpecificDetails` on project

**Technical Pattern**:

- **File**: `convex/schema.ts`

**Files to Modify**:

```
MODIFY: convex/schema.ts
  - Add comment: // @deprecated - Remove in Epic 13D
```

---

## ✅ Definition of Done

- [ ] `servicePackages` table exists with correct schema
- [ ] `quotations` uses `selectedPackageIds` (array)
- [ ] Line items contain NO spawning configuration
- [ ] Spawning creates 1 project per selected package
- [ ] Seed data includes 3+ packages
- [ ] All mutations updated for new model
- [ ] `pnpm convex dev` runs without errors
- [ ] `pnpm tsc` has no type errors

---

## 🧪 Testing Requirements

For each story, the implementing agent MUST:

- [ ] Verify schema compiles: `pnpm convex dev --once`
- [ ] Verify types: `pnpm tsc --noEmit`
- [ ] Seed database: Run seed function
- [ ] Manual test: Create quotation with 2 packages, approve, verify 2 projects spawn

---

## 🔗 Dependencies

| Depends On | Notes                       |
| :--------- | :-------------------------- |
| None       | This is the foundation epic |

| Blocks       | Notes                       |
| :----------- | :-------------------------- |
| **Epic 13B** | Folder template enhancement |
| **Epic 13C** | Service Package Builder UI  |
| **Epic 13D** | Legacy cleanup              |

---

_Document Version: 2.0_  
_Last Updated: 2026-01-28 12:35 IST_
