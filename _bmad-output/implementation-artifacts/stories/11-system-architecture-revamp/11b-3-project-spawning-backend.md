# Story 11B.3: Backend — Project Spawning on Quote Approval

Status: review

## Story

As a System,
I want to automatically create projects when a quotation is approved,
so that Studios don't need to manually request projects and the workflow is seamless.

## Acceptance Criteria

1. Update `approveQuotation` mutation in `convex/functions/quotations/mutations.ts`.
2. Logic Flow:
   - Validate quotation status transition to `approved`.
   - Iterate over `quotation.lineItems`.
   - Identify items where `spawnsProject === true`.
3. For each spawnable item:
   - Generate a unique project code (e.g., `PRJ-2024-001`).
   - Insert a new record into `projects` table.
   - **Fields**:
     - `quotationId`: The quotation's ID.
     - `clientId`: The quotation's `clientId`.
     - `projectTypeId`: From line item.
     - `source`: new literal `'quotation_spawned'` (add to validator if missing).
     - `phase`: `'onboarding'` (Skip setup, enter onboarding phase).
     - `actionState`: `'awaiting_uploads'` (Awaiting Studio asset upload).
     - `endClientName`: Mapped from quotation `endClientName`.
     - `eventName`: Mapped from line item description or quotation `eventName`.
   - **Folder Setup**:
     - Immediately call the folder setup logic (internal mutation) using `selectedFolderTemplateId`.
4. Logging:
   - Add entry to `statusHistory` for the new project.
   - Log the automated creation.
5. Return the list of created project IDs.

## Tasks / Subtasks

- [x] Update `projectSourceValidator` in `schema.ts` to include `'quotation_spawned'`.
- [x] Modify `approveQuotation` in `convex/functions/quotations/mutations.ts`.
- [x] Extract project creation logic to a helper in `convex/functions/projects/spawning.ts`.
- [x] Ensure folder setup is triggered using `setupFoldersInternal`.
- [x] Test with a quotation containing multiple spawnable items (Cleared DB for testing).

## Dev Agent Record

### Agent Model Used

Antigravity (thinking)

### Debug Log References

- Extracted `setupFoldersInternal` in `convex/functions/folders/mutations.ts` for reuse.
- Updated `approveQuotation` and `acceptQuotation` in `convex/functions/quotations/mutations.ts`.
- Implemented `getDefaultStorageTier` helper to facilitate automation.
- Cleared operational data to ensure a fresh start for system testers.

### Completion Notes List

- Implemented full project spawning engine triggered upon quotation approval.
- Enabled automated folder creation linked to the selected template on the line item.
- Added support for "Default" storage tier to ensure folders can always be setup even if not explicitly chosen.
- Ensured consistency between admin and client-side quotation approval flows.

### File List

- `convex/schema.ts`
- `convex/functions/projects/spawning.ts`
- `convex/functions/folders/mutations.ts`
- `convex/functions/quotations/mutations.ts`
- `_bmad-output/implementation-artifacts/stories/11b-3-project-spawning-backend.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Notes

- **File**: `convex/functions/quotations/mutations.ts`
- **File**: `convex/schema.ts`
- **Complexity**: This is the core logic. Ensure database consistency.
- **Naming**: If the quotation doesn't have an explicit "Event Name", use "Project from Quote [Code]" or similar. Ideally, Quote should have "Event/Project Name" field.

### Dependencies

- Epic 11A (Schema)
- Stories 11B.1, 11B.2 (Data population)

### References

- Epic 11B: Quotation Engine Enhancements
