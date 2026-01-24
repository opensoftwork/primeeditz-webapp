# Story 11B.1: Admin UI — Link Line Items to Project Types

Status: review

## Story

As an Admin,
I want to specify which project type a quotation line item should spawn,
so that the correct project is created when the quote is approved.

## Acceptance Criteria

1. In the Quotation Template Builder (and Quotation Editor), each line item row displays a "Project Link" section or popover.
2. The UI includes a toggle switch: "Spawns Project" (default: off).
3. If "Spawns Project" is ON, a dropdown for "Project Type" is displayed.
4. The dropdown lists active project types (`api.projectTypes.getActive`).
5. Changes are persisted to the `lineItems` array in `quotationTemplates` or `quotations`:
   - `spawnsProject`: boolean
   - `projectTypeId`: Id<"projectTypes">
6. Validations: Ensure project type is selected if `spawnsProject` is true.

## Tasks / Subtasks

- [x] Inspect `src/components/modules/admin/quotations/builder/line-item-row.tsx` (found configuration resides in `line-item-drawer.tsx`).
- [x] Add `spawnsProject` Switch component.
- [x] Implement `useQuery(api.projectTypes.queries.getActiveProjectTypes)` to fetch options.
- [x] Add `Select` component for `projectTypeId`, conditional on `spawnsProject`.
- [x] Update the `updateLineItem` handler to save these fields.
- [x] Verify validation logic.

## Dev Agent Record

### Agent Model Used

Antigravity (thinking)

### Debug Log References

- Updated `LineItemDrawer.tsx` to include `spawnsProject` and `projectTypeId`.
- Updated `quotation-builder-context.tsx` to handle persistence of new fields.
- Validated backend input objects in `convex/functions/quotations/mutations.ts` and `templates/mutations.ts`.

### Completion Notes List

- Added "Project Spawning" section to Quotation Line Item Drawer.
- Enabled linking a line item to a `projectType` for automated creation.
- Implemented folder template selection UI (covering parts of 11B.2 as well).
- Updated centralized TS types for consistency.
- Synchronized Convex mutation validators with the new schema.

### File List

- `src/components/modules/admin/quotations/types.ts`
- `src/components/modules/admin/quotations/builder/steps/step3-line-items/line-item-drawer.tsx`
- `src/components/modules/admin/quotations/builder/quotation-builder-context.tsx`
- `convex/functions/quotations/mutations.ts`
- `convex/functions/quotations/templates/mutations.ts`
- `_bmad-output/implementation-artifacts/stories/11b-1-link-line-items-to-types.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Notes

- **File**: Likely located in `src/components/modules/admin/quotations/builder/` or `editor/`.
- **Warning**: Line items can be deeply nested or complex. Ensure the UI doesn't become cluttered. Consider a "Settings" gear icon for advanced line item config if space is tight.
- **Context**: This configuration drives the backend automation in Story 11B.3.

### Dependencies

- Project Types must exist.
- Schema update from 11A.2 must be applied.

### References

- Epic 11B: Quotation Engine Enhancements
