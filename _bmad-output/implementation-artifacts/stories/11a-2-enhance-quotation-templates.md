# Story 11A.2: Enhance Quotation Template Line Items

Status: ready-for-dev

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

- [ ] Locate `quotationTemplates` definition in `convex/schema.ts`
- [ ] Add `spawnsProject`, `projectTypeId`, `selectedFolderTemplateId` to the line item validator
- [ ] Check `quotations` table schema - if it copies the structure, update it too
- [ ] Update `convex/seeds/quotationTemplates.ts` to use new fields
- [ ] Verify with `npx convex dev`

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
