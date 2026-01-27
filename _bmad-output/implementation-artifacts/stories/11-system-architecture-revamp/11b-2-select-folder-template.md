# Story 11B.2: Admin UI — Select Folder Template per Spawnable Item

Status: review

## Story

As an Admin,
I want to select a folder template for each project-spawning line item,
so that the created project has the correct folder structure initialized.

## Acceptance Criteria

1. In the Quotation Builder line item config (where "Spawns Project" is enabled), display a "Folder Template" dropdown.
2. The dropdown options are filtered to show only templates compatible with the selected `projectTypeId`.
   - Use `api.folderTemplates.getByProjectType` (you might need to create this query if it doesn't exist).
3. If the selected folder template has a `variant`, display it (e.g., "Wedding - South Indian").
4. Selection saves to `lineItems[].selectedFolderTemplateId`.
5. Default behavior: Auto-select the template marked `isDefault: true` for that project type if available.

## Tasks / Subtasks

- [x] Create/Verify query `api.folderTemplates.getByProjectType(projectTypeId)` (Implemented via `listFolderTemplates` with frontend filtering for better performance in the drawer).
- [x] Add `Select` component for Folder Template in the line item UI.
- [x] Implement filtering logic (re-filter when Project Type changes).
- [x] Implement default selection logic (auto-select `isDefault` on project type change).
- [x] Persist `selectedFolderTemplateId`.

## Dev Agent Record

### Agent Model Used

Antigravity (thinking)

### Debug Log References

- Implemented in `LineItemDrawer.tsx` alongside Story 11B.1.
- Updated `quotation-builder-context.tsx` to handle persistence of new fields.

### Completion Notes List

- Added Folder Template selection dropdown, visible only when Project Spawning is enabled.
- Implemented intelligent filtering that shows only templates matching the selected Project Type.
- Added support for displaying template variants in the selection list.
- Configured automated default template selection when a Project Type is picked.

### File List

- `src/components/modules/admin/quotations/builder/steps/step3-line-items/line-item-drawer.tsx`
- `src/components/modules/admin/quotations/builder/quotation-builder-context.tsx`
- `_bmad-output/implementation-artifacts/stories/11b-2-select-folder-template.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Notes

- **File**: `src/components/modules/admin/quotations/builder/line-item-row.tsx`
- **UX**: This depends on Story 11B.1 being functional.
- **Data**: Ensure the query returns `variant` and `description` to help the user choose.

### Dependencies

- Story 11B.1 (Project Type matching)
- Epic 11A (Schema)

### References

- Epic 11B: Quotation Engine Enhancements
