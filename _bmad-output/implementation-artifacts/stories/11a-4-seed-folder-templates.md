# Story 11A.4: Event-Based Folder Template Seeding

Status: review

## Story

As a Developer,
I want seed data to reflect event-based folder naming,
so that the system starts with realistic templates.

## Acceptance Criteria

1. Update `convex/seeds/folderTemplates.ts`.
2. Add/Update templates with the following event structures:
   - **Hindu Wedding - Brahmin**: `["Naandi", "Muhurtham", "Grihapravesham", "Reception", "Candid", "Traditional"]`
   - **Christian Wedding**: `["Church Ceremony", "Reception", "Couple Portraits", "Getting Ready"]`
   - **YouTube Content**: `["A-Roll", "B-Roll", "Audio", "Assets", "Thumbnails", "Project Files"]`
   - **General Project**: `["Raw", "Selects", "Finals"]` (Fallback)
3. Use the new `variant` and `description` fields from Story 11A.3.
4. Ensure the seed function (`convex/seed.ts` or similar) correctly invokes this.

## Tasks / Subtasks

- [x] Modify `convex/seeds/folderTemplates.ts` with new data structure
- [x] Ensure `variant` field is populated
- [x] Run `npx convex dev` to trigger seed (if auto-seed is enabled) or run the seed function manually via dashboard/CLI

## Dev Agent Record

### Agent Model Used

Antigravity (thinking)

### Debug Log References

- Step 7: `npx convex dev --once` verified seed execution for new fields and templates.

### Completion Notes List

- Updated `convex/seeds/folderTemplates.ts` with new event-based structures:
  - Hindu Wedding - Brahmin (South Indian variant)
  - Christian Wedding (General variant)
  - YouTube Content (Social Media variant)
- Applied `variant` and `description` to all existing templates.
- Verified successful seeding with Convex.

### File List

- `convex/seeds/folderTemplates.ts`
- `_bmad-output/implementation-artifacts/stories/11a-4-seed-folder-templates.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Notes

- **File**: `convex/seeds/folderTemplates.ts`
- **Logic**: This is purely data entry but critical for the "Event-Based" architecture shift.
- **Dependencies**: Depends on the schema update from 11A.3 being applied first.

### Project Structure Notes

- Seed file update.

### References

- Epic 11A: Schema & Data Foundation
