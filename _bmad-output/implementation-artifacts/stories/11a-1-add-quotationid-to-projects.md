# Story 11A.1: Add `quotationId` to Projects Schema

Status: review

## Story

As a Developer,
I want the `projects` table to have an optional `quotationId` field,
so that spawned projects can reference their parent quotation.

## Acceptance Criteria

1. `projects` schema in `convex/schema.ts` must include `quotationId: v.optional(v.id('quotations'))`.
2. An index `by_quotationId` must be added to the `projects` table definition sorting by `quotationId`.
3. The change must be backward compatible (existing projects will have `undefined` quotationId).
4. `npx convex dev` must run without errors after the change.

## Tasks / Subtasks

- [x] Update `convex/schema.ts` to add `quotationId` field
- [x] Add `by_quotationId` index to `projects` table
- [x] Verify schema validity with `npx convex dev` (dry run or local)

## Dev Notes

- **File**: `convex/schema.ts`
- **Context**: The `projects` table is the core entity. We are linking it back to `quotations`.
- **Schema Pattern**:
  ```typescript
  projects: defineTable({
    // ... existing fields
    quotationId: v.optional(v.id("quotations")),
  }).index("by_quotationId", ["quotationId"]);
  // ... existing indexes
  ```
- **Testing**: No data migration needed as the field is optional.

## Dev Agent Record

### Agent Model Used

Antigravity (thinking)

### Debug Log References

- Step 7: `npx convex dev --once` verified schema and added index `by_quotationId`.

### Completion Notes List

- Added `quotationId` optional field to `projects` table in `convex/schema.ts`.
- Added index `by_quotationId` to `projects` table in `convex/schema.ts`.
- Verified change with local Convex deployment.
  x
