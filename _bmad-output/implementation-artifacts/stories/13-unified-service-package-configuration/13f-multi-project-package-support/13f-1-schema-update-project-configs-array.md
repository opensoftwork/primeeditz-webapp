# Story 13F.1: Schema Update - Add `projectConfigs` Array

**Status**: done  
**Points**: 3  
**Epic**: [13F: Multi-Project Package Support](../../../../planning-artifacts/epics/13f-multi-project-package-support.md)

---

## User Story

**As a** Developer,  
**I want** the `servicePackages` schema to support multiple project configurations,  
**So that** a single package can spawn multiple projects when selected.

---

## Business Context

Studios frequently order combo packages like "Complete Wedding Package" that require:

- Photo Post-Production (1 project)
- Video Production (1 project)
- Album Design (1 project)

Currently, each package can only spawn ONE project type. This story enables multi-project spawning.

---

## Acceptance Criteria

### AC1: Add `projectConfigValidator`

**Given** the Convex schema in `convex/schema.ts`  
**When** I add a new validator for project configurations  
**Then** it includes these fields:

```typescript
export const projectConfigValidator = v.object({
  id: v.string(), // Unique ID for referencing
  label: v.optional(v.string()), // e.g., "Photo Editing", "Video Editing"
  projectTypeId: v.id("projectTypes"),
  folderTemplateId: v.id("folderTemplates"),
  defaultStorageTierId: v.optional(v.id("storageTiers")),
});
```

### AC2: Update `servicePackages` Table

**Given** the existing `servicePackages` table  
**When** I update the schema  
**Then** the following changes are made:

1. **ADD** `projectConfigs: v.array(projectConfigValidator)` - Array of project configurations
2. **KEEP** (but deprecate) `projectTypeId`, `folderTemplateId`, `defaultStorageTierId` for backward compat
3. **ADD** `applyGST: v.optional(v.boolean())` if not already present

**Note**: Old fields are kept temporarily for migration. They will be removed in a later story.

### AC3: Update `servicePackageLineItemValidator`

**Given** the existing line item validator  
**When** I add the project config reference  
**Then** it includes:

```typescript
projectConfigId: v.optional(v.string()), // Links to projectConfigs.id
```

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
  - Add projectConfigValidator export
  - Add projectConfigs to servicePackages table
  - Add projectConfigId to servicePackageLineItemValidator
  - Add deprecation comments to old single fields
```

### Current Schema (Before)

```typescript
// convex/schema.ts (lines 429-452)
servicePackages: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  categoryId: v.optional(v.id("projectCategories")),

  // Project Spawning Config (1 package = 1 project type)
  projectTypeId: v.id("projectTypes"), // ❌ SINGLE
  folderTemplateId: v.id("folderTemplates"), // ❌ SINGLE
  defaultStorageTierId: v.optional(v.id("storageTiers")),

  lineItems: v.array(servicePackageLineItemValidator),
  terms: v.optional(v.string()),
  isActive: v.boolean(),
  createdBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
});
```

### Target Schema (After)

```typescript
// Project Config Validator (NEW)
export const projectConfigValidator = v.object({
  id: v.string(),
  label: v.optional(v.string()),
  projectTypeId: v.id("projectTypes"),
  folderTemplateId: v.id("folderTemplates"),
  defaultStorageTierId: v.optional(v.id("storageTiers")),
});

// Service Package Line Item Validator (UPDATED)
export const servicePackageLineItemValidator = v.object({
  id: v.string(),
  sectionId: v.optional(v.id("quotationSections")),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  projectConfigId: v.optional(v.string()),  // NEW: Links to projectConfigs.id
  subItems: v.optional(v.array(v.object({
    description: v.string(),
    amount: v.optional(v.number()),
  }))),
});

// Service Packages table (UPDATED)
servicePackages: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  categoryId: v.optional(v.id("projectCategories")),

  // NEW: Multiple project configurations
  projectConfigs: v.optional(v.array(projectConfigValidator)),  // Optional for migration

  // @deprecated - Use projectConfigs instead. Kept for backward compat during migration.
  projectTypeId: v.optional(v.id("projectTypes")),      // Made optional
  folderTemplateId: v.optional(v.id("folderTemplates")), // Made optional
  defaultStorageTierId: v.optional(v.id("storageTiers")),

  lineItems: v.array(servicePackageLineItemValidator),
  terms: v.optional(v.string()),
  applyGST: v.optional(v.boolean()),
  isActive: v.boolean(),
  createdBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
})
  .index("by_categoryId", ["categoryId"])
  .index("by_isActive", ["isActive"]),
```

---

## Migration Notes

This story adds `projectConfigs` as OPTIONAL to maintain backward compatibility with existing packages. A separate migration task should:

1. Query all existing servicePackages
2. For each package with `projectTypeId` but no `projectConfigs`:
   - Create a single-item `projectConfigs` array from existing fields
   - Assign `projectConfigId` to all line items
3. Once all data is migrated, a future story can make `projectConfigs` required

---

## ❌ DO NOT

- ❌ Do NOT delete existing `projectTypeId`, `folderTemplateId` fields yet (migration first)
- ❌ Do NOT make `projectConfigs` required yet (breaks existing data)
- ❌ Do NOT change any mutation handlers in this story (that's 13F.4)
- ❌ Do NOT update UI components in this story (that's 13F.2)

---

## Tasks/Subtasks

- [x] **Implementation**
  - [x] Add `projectConfigValidator` export to `convex/schema.ts`
  - [x] Add `projectConfigId` to `servicePackageLineItemValidator`
  - [x] Add `projectConfigs` array to `servicePackages` table (optional)
  - [x] Add deprecation comments to old single fields
  - [x] Make `projectTypeId` and `folderTemplateId` optional for migration
- [x] **Validation**
  - [x] Run `pnpm convex dev --once` to verify schema compilation
  - [x] Run `pnpm tsc --noEmit` to check for TypeScript errors
  - [x] Verify generated types in `convex/_generated/dataModel.d.ts`

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - schema compiles without errors
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors in convex functions
- [ ] Verify `convex/_generated/dataModel.d.ts` contains updated types
- [ ] Existing servicePackages data still loads correctly (no breaking changes)

---

## Dev Agent Record

### Agent Model Used

### Agent Model Used

Antigravity (Claude 3.5 Sonnet)

### Completion Notes

- Successfully updated `convex/schema.ts` with `projectConfigValidator`.
- Added `projectConfigId` to `servicePackageLineItemValidator`.
- Added `projectConfigs` array to `servicePackages` table.
- Made `projectTypeId` and `folderTemplateId` optional in `servicePackages` for backward compatibility.
- Schema compiled successfully with `pnpm convex dev --once`.
- Noticed TypeScript errors in existing components using `servicePackages`; these will be addressed in subsequent stories (13f.2, 13f.5, etc.) as we update the UI and logic to handle the new array-based config.

### Files Changed

- `convex/schema.ts`
