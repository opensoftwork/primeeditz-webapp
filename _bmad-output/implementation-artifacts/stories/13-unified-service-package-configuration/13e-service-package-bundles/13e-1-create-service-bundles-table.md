# Story 13E.1: Create `serviceBundles` Table

**Status**: planned  
**Points**: 2  
**Epic**: [13E: Service Package Bundles](../../../../planning-artifacts/epics/13e-service-package-bundles.md)  
**Depends On**: Story 13A.1 (servicePackages table must exist)

---

## User Story

**As a** Developer,  
**I want** a `serviceBundles` table in the schema,  
**So that** bundles can be stored and queried.

---

## Acceptance Criteria

### AC1: Table Created

**Given** the schema file  
**When** I add the serviceBundles table  
**Then** it includes:

- `name: v.string()` (required)
- `description: v.optional(v.string())`
- `categoryId: v.optional(v.id("projectCategories"))`
- `packageIds: v.array(v.id("servicePackages"))`
- `discountType: v.optional(v.union(v.literal("percentage"), v.literal("fixed")))`
- `discountValue: v.optional(v.number())`
- `isActive: v.boolean()`
- `createdBy: v.optional(v.string())`
- `updatedAt: v.number()`

### AC2: Indexes Created

**Given** the table  
**When** I check indexes  
**Then** these exist:

- `by_isActive` on `isActive`
- `by_categoryId` on `categoryId`

### AC3: TypeScript Types

**Given** schema changes pushed  
**When** I run `pnpm convex dev --once`  
**Then** `Doc<"serviceBundles">` type is generated correctly

---

## Technical Implementation

### Schema Addition

```typescript
// convex/schema.ts

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

## ❌ DO NOT

- ❌ Do NOT copy package data into bundles (use references)
- ❌ Do NOT add discountValue without discountType
- ❌ Do NOT start until 13A.1 is complete

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - schema pushes successfully
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Verify `Doc<"serviceBundles">` type works

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
