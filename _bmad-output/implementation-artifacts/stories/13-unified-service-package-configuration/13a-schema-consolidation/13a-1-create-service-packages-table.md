# Story 13A.1: Create `servicePackages` Table

**Status**: backlog  
**Points**: 3  
**Epic**: [13A: Schema Consolidation](../../../../planning-artifacts/epics/13a-schema-consolidation.md)

---

## User Story

**As a** Developer,  
**I want** to create the new `servicePackages` table that replaces `quotationTemplates`,  
**So that** we have a clean foundation for the unified service package model.

---

## Acceptance Criteria

### AC1: Table Creation

**Given** the Convex schema in `convex/schema.ts`  
**When** I add the `servicePackages` table definition  
**Then** the table is created with the following fields:

- `name: v.string()` - Package name (required)
- `description: v.optional(v.string())` - Package description
- `categoryId: v.optional(v.id("projectCategories"))` - Category link
- `projectTypeId: v.id("projectTypes")` - What project type spawns (required)
- `folderTemplateId: v.id("folderTemplates")` - Folder structure (required)
- `defaultStorageTierId: v.optional(v.id("storageTiers"))` - Storage allocation
- `lineItems: v.array(servicePackageLineItemValidator)` - Pricing only
- `terms: v.optional(v.string())` - Terms and conditions
- `isActive: v.boolean()` - Active/inactive toggle
- `createdBy: v.optional(v.string())` - Audit field
- `updatedAt: v.optional(v.number())` - Audit timestamp

**And** indexes are created:

- `by_categoryId` on `["categoryId"]`
- `by_isActive` on `["isActive"]`

### AC2: Line Item Validator (Pricing Only)

**Given** line items are for pricing display only  
**When** I define the `servicePackageLineItemValidator`  
**Then** it includes ONLY these fields:

- `id: v.string()` - Unique identifier
- `sectionId: v.optional(v.id("quotationSections"))` - Section grouping
- `description: v.string()` - Item description
- `unit: v.string()` - Unit of measurement (e.g., "per project")
- `rate: v.number()` - Price per unit
- `quantity: v.number()` - Default quantity
- `subItems: v.optional(v.array(...))` - Nested descriptions

**And** the validator does NOT include:

- ❌ `spawnsProject`
- ❌ `projectTypeId`
- ❌ `selectedFolderTemplateId`

### AC3: Remove Old Table

**Given** this is a breaking change (dev mode)  
**When** I update the schema  
**Then** the `quotationTemplates` table definition is REMOVED completely

**And** any validators referencing `quotationTemplates` are updated or removed

### AC4: Schema Compilation

**Given** all schema changes are complete  
**When** I run `pnpm convex dev --once`  
**Then** the schema compiles without errors

**And** TypeScript types are regenerated in `convex/_generated/`

---

## Technical Implementation

### Files to Modify

```
MODIFY: convex/schema.ts
  - Remove quotationTemplates table definition
  - Add servicePackageLineItemValidator
  - Add servicePackages table definition with indexes
```

### Code Example

```typescript
// convex/schema.ts

// Line Item Validator - PRICING ONLY, no spawning config
const servicePackageLineItemValidator = v.object({
  id: v.string(),
  sectionId: v.optional(v.id("quotationSections")),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  subItems: v.optional(
    v.array(
      v.object({
        description: v.string(),
        amount: v.optional(v.number()),
      })
    )
  ),
  // ❌ NO spawnsProject, projectTypeId, selectedFolderTemplateId
});

// Service Packages table - replaces quotationTemplates
servicePackages: defineTable({
  // Identity
  name: v.string(),
  description: v.optional(v.string()),
  categoryId: v.optional(v.id("projectCategories")),

  // PROJECT SPAWNING CONFIG (1 package = 1 project type)
  projectTypeId: v.id("projectTypes"),
  folderTemplateId: v.id("folderTemplates"),
  defaultStorageTierId: v.optional(v.id("storageTiers")),

  // Pricing (line items are JUST for display/pricing)
  lineItems: v.array(servicePackageLineItemValidator),
  terms: v.optional(v.string()),

  // Status
  isActive: v.boolean(),

  // Audit
  createdBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
})
  .index("by_categoryId", ["categoryId"])
  .index("by_isActive", ["isActive"]),
```

---

## ❌ DO NOT

- ❌ Do NOT keep `quotationTemplates` table for backward compatibility
- ❌ Do NOT add `spawnsProject`, `projectTypeId`, or `selectedFolderTemplateId` to line items
- ❌ Do NOT use recursive validators (Convex doesn't support them)
- ❌ Do NOT make `projectTypeId` or `folderTemplateId` optional - they are REQUIRED

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - schema compiles
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Verify `convex/_generated/dataModel.d.ts` contains `servicePackages` type
- [ ] Verify `quotationTemplates` is NOT in generated types

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
