# Story 11A.2: Enhance Quotation Template Line Items

Status: review

## Story

As an Admin,
I want quotation template line items to specify project creation rules,
so that the system knows which items should spawn projects.

## Acceptance Criteria

1. Update `quotationPatterns.lineItems` validator in `convex/schema.ts` (or wherever `quotationTemplates` are defined).
2. New optional fields added to the line item object:
   - `spawnsProject: v.optional(v.boolean())`
   - `projectTypeId: v.optional(v.id('projectTypes'))`
   - `selectedFolderTemplateId: v.optional(v.id('folderTemplates'))`
3. Update `convex/seeds/quotationTemplates.ts` to include these fields in at least one template for testing (e.g., set `spawnsProject: true` for a main service).
4. Identify if `quotations` table line items also need this update (likely yes, they usually mirror the template).

## Tasks / Subtasks

- [x] Locate `quotationTemplates` definition in `convex/schema.ts`
- [x] Add `spawnsProject`, `projectTypeId`, `selectedFolderTemplateId` to the line item validator
- [x] Check `quotations` table schema - if it copies the structure, update it too
- [x] Update `convex/seeds/quotationTemplates.ts` to use new fields
- [x] Verify with `npx convex dev`

## Dev Agent Record

### Agent Model Used

Antigravity (thinking)

### Debug Log References

- Step 7: `npx convex dev --once` verified schema and seed mapping logic.

### Completion Notes List

- Added `spawnsProject`, `projectTypeId`, `selectedFolderTemplateId` to `quotationTemplates.lineItems` and `quotations.lineItems` in `convex/schema.ts`.
- Updated `seedQuotationTemplates` loop in `convex/seeds/quotationTemplates.ts` to map new fields.
- Seeded "Silver Package" with example spawning rules for Photo, Album, and Video items.

### File List

- `convex/schema.ts`
- `convex/seeds/quotationTemplates.ts`
- `_bmad-output/implementation-artifacts/stories/11a-2-enhance-quotation-templates.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Notes

- **File**: `convex/schema.ts`
- **File**: `convex/seeds/quotationTemplates.ts`
- **Context**: Quotation templates define the default structure. When a quote is created, these are copied to `quotations`.
  - Check if `quotations` table stores a snapshot of line items or references. If snapshot (standard), update `quotations` schema too!
  - Check `quotationTemplates` schema definition.
- **Logic**: These fields are metadata for the _next_ step (project spawning), used by the backend trigger.

### Project Structure Notes

- Standard schema update.

### References

- Epic 11A: Schema & Data Foundation
