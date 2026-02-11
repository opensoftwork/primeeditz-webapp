# Story 13A.6: Deprecate `projectTypeFields` Table

**Status**: done  
**Points**: 1  
**Epic**: [13A: Schema Consolidation](../../../../planning-artifacts/epics/13a-schema-consolidation.md)  
**Depends On**: None (can run in parallel)

---

## User Story

**As a** Developer,  
**I want** to mark `projectTypeFields` as deprecated,  
**So that** we document the intention to remove unused complexity.

---

## Acceptance Criteria

### AC1: Add Deprecation Comment

**Given** the `projectTypeFields` table exists in schema  
**When** I update the schema file  
**Then** I add a deprecation comment above the table definition:

```typescript
/**
 * @deprecated This table is deprecated as of Epic 13.
 * Dynamic project type fields are no longer used.
 * The table will be removed in Epic 13D after migration is complete.
 * DO NOT add new code that references this table.
 */
```

### AC2: Do NOT Delete Yet

**Given** existing code may still reference this table  
**When** updating the schema  
**Then** I do NOT delete the table  
**And** I do NOT delete any existing data

### AC3: Document for Future Cleanup

**Given** the deprecation is added  
**When** Epic 13D is implemented  
**Then** this table will be fully removed  
**And** the story 13D documents which table to remove

---

## Technical Implementation

### Files to Modify

```
MODIFY: convex/schema.ts
  - Add deprecation JSDoc comment to projectTypeFields table
```

### Code Example

```typescript
// convex/schema.ts

/**
 * @deprecated This table is deprecated as of Epic 13.
 *
 * BACKGROUND:
 * Dynamic project type fields were originally designed to allow custom
 * fields per project type. This added complexity without clear user value.
 *
 * NEW APPROACH:
 * - Service Packages define all project configuration at package level
 * - Required info is collected during onboarding with a static form
 * - Type-specific details can use the existing typeSpecificDetails JSON field
 *
 * REMOVAL TIMELINE:
 * - Epic 13A: Mark as deprecated (this story)
 * - Epic 13D: Remove table and all references
 *
 * DO NOT:
 * - Add new code that queries this table
 * - Add new fields to this table
 * - Create UI for managing these fields
 */
projectTypeFields: defineTable({
  projectTypeId: v.id("projectTypes"),
  name: v.string(),
  fieldType: v.union(
    v.literal("text"),
    v.literal("number"),
    v.literal("date"),
    v.literal("select")
  ),
  label: v.string(),
  placeholder: v.optional(v.string()),
  isRequired: v.boolean(),
  options: v.optional(v.array(v.string())),
  order: v.number(),
})
  .index("by_projectTypeId", ["projectTypeId"]),
```

---

## ❌ DO NOT

- ❌ Do NOT delete the table in this story
- ❌ Do NOT delete existing data
- ❌ Do NOT add new features to this table
- ❌ Do NOT create new UI for field management

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - schema compiles
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Verify table still exists (check generated types)
- [ ] Verify existing functionality not broken

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
