# Epic 13A: Schema Consolidation

**Parent Epic**: [13: Unified Service Package Configuration](./13-unified-service-package-configuration.md)  
**Status**: Backlog  
**Created**: 2026-01-27  
**Complexity**: High  
**Estimated Points**: 13

---

## 📋 Epic Summary

This epic consolidates the fragmented configuration schema into a unified model where:

1. `quotationTemplates` becomes the single source of truth for "Service Packages"
2. Line items are **purely for pricing** (no `spawnsProject`, `projectTypeId`, etc.)
3. Project type and folder template are configured at the **template level**, not line-item level
4. Spawning creates ONE project per quotation, not multiple

---

## 🎯 User Outcomes

| Role       | Outcome                                              |
| :--------- | :--------------------------------------------------- |
| **Admin**  | Simpler mental model: one package = one project type |
| **System** | Cleaner spawning logic, no line-item iteration       |
| **Dev**    | Fewer tables to manage, clearer relationships        |

---

## 📝 User Stories

### Story 13A.1: Enhance `quotationTemplates` Schema

**Points**: 3

**As a** Developer,  
**I want** to add direct project configuration fields to `quotationTemplates`,  
**So that** each template directly specifies what project it creates.

**Acceptance Criteria**:

- [ ] Add `projectTypeId: v.id("projectTypes")` to `quotationTemplates`
- [ ] Add `folderTemplateId: v.id("folderTemplates")` to `quotationTemplates`
- [ ] Add `defaultStorageTierId: v.optional(v.id("storageTiers"))` to `quotationTemplates`
- [ ] These fields define the single project that gets created on approval
- [ ] Existing templates can have these fields as `optional` initially for migration

**Schema Change**:

```typescript
quotationTemplates: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  terms: v.optional(v.string()),
  isActive: v.boolean(),

  // NEW: Direct project configuration
  projectTypeId: v.optional(v.id("projectTypes")),
  folderTemplateId: v.optional(v.id("folderTemplates")),
  defaultStorageTierId: v.optional(v.id("storageTiers")),

  // Line items remain for PRICING ONLY
  lineItems: v.array(
    v.object({
      sectionId: v.id("quotationSections"),
      description: v.string(),
      unit: v.string(),
      unitPrice: v.number(),
      defaultQuantity: v.number(),
      // REMOVED: spawnsProject, projectTypeId, selectedFolderTemplateId
    }),
  ),
  createdBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
}),
```

**Technical Notes**:

- File: `convex/schema.ts`
- Run codegen after schema update

---

### Story 13A.2: Simplify Line Item Schema

**Points**: 2

**As a** Developer,  
**I want** to remove spawning-related fields from line items,  
**So that** line items serve only as pricing elements.

**Acceptance Criteria**:

- [ ] Remove `spawnsProject` from line item objects
- [ ] Remove `projectTypeId` from line item objects
- [ ] Remove `selectedFolderTemplateId` from line item objects
- [ ] Keep: `id`, `sectionId`, `description`, `unit`, `rate`, `quantity`, `subItems`
- [ ] Update seed files to remove spawning fields
- [ ] Update mutations that create/update line items

**Files to Modify**:

- `convex/schema.ts` (quotationTemplates.lineItems)
- `convex/schema.ts` (quotations.lineItems)
- `convex/seeds/quotationTemplates.ts`
- `convex/functions/quotations/mutations.ts`

---

### Story 13A.3: Migrate Existing Quotation Templates

**Points**: 2

**As a** Developer,  
**I want** to migrate existing quotation templates to the new schema,  
**So that** we don't lose existing configuration.

**Acceptance Criteria**:

- [ ] Create migration script: `convex/migrations/migrateQuotationTemplates.ts`
- [ ] For each template with line items that have `spawnsProject`:
  - Extract the first spawning line item's `projectTypeId`
  - Set it as the template's `projectTypeId`
  - Extract `selectedFolderTemplateId` similarly
- [ ] Log migration progress and any conflicts
- [ ] Script can be re-run safely (idempotent)

**Technical Notes**:

- Use internal mutation for migration
- Consider what to do if template has MULTIPLE spawning line items (log warning, use first)

---

### Story 13A.4: Update Project Spawning Logic

**Points**: 3

**As a** System,  
**I want** project spawning to create ONE project per quotation,  
**So that** the system is simpler and aligns with the service package model.

**Acceptance Criteria**:

- [ ] Rename `spawnProjectsFromQuotation` → `spawnProjectFromQuotation`
- [ ] Return `Promise<Id<"projects">>` instead of `Promise<Id<"projects">[]>`
- [ ] Get `projectTypeId` and `folderTemplateId` from template, not line items
- [ ] If template has no `projectTypeId`, skip spawning (service-only quote)
- [ ] Update all callers to handle single project return

**Current Logic** (spawning.ts):

```typescript
// OLD: Iterates line items
for (const item of quotation.lineItems) {
  if (item.spawnsProject && item.projectTypeId) { ... }
}
```

**New Logic**:

```typescript
// NEW: Uses template-level configuration
const template = await ctx.db.get(quotation.templateId);
if (template.projectTypeId) {
  // Create ONE project using template's configuration
}
```

---

### Story 13A.5: Deprecate `projectTypeFields` Table

**Points**: 2

**As a** Developer,  
**I want** to plan deprecation of `projectTypeFields`,  
**So that** we don't maintain unused complexity.

**Acceptance Criteria**:

- [ ] Add deprecation comment to schema
- [ ] Remove UI for managing project type fields (deferred to 13D)
- [ ] Document migration path: fields can move to service package config
- [ ] If any fields are critical, move to `typeSpecificDetails` on project

**Analysis**:

- Current `projectTypeFields` allows per-project-type dynamic fields
- In new model, these could be:
  - A) Stored in `servicePackage.configurationFields` (if needed)
  - B) Always collected during onboarding (simpler)
  - C) Removed entirely if not used

---

### Story 13A.6: Update Quotation Mutations

**Points**: 1

**As a** Developer,  
**I want** to update quotation mutations to use the new schema,  
**So that** creating/updating quotations works correctly.

**Acceptance Criteria**:

- [ ] `requestQuotation` mutation accepts `projectTypeId`, `folderTemplateId`
- [ ] Line item creation removes spawning fields
- [ ] `updateQuotation` handles new template-level fields
- [ ] Approval flow uses template-level configuration for spawning

**Files to Modify**:

- `convex/functions/quotations/mutations.ts`
- `convex/functions/quotations/templates/mutations.ts`

---

## ✅ Definition of Done

- [ ] `quotationTemplates` schema has direct project configuration fields
- [ ] Line items contain only pricing information
- [ ] Migration script successfully migrates development data
- [ ] Spawning creates exactly one project per quotation
- [ ] All mutations updated and working
- [ ] No TypeScript errors

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

_Document Version: 1.0_  
_Last Updated: 2026-01-27_
