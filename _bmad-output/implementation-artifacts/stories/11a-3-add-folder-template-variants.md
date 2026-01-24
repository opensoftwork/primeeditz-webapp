# Story 11A.3: Add Variant Metadata to Folder Templates

Status: review

## Story

As an Admin,
I want folder templates to have `variant` and `description` fields,
so that I can distinguish between "Hindu Wedding", "Christian Wedding", etc.

## Acceptance Criteria

1. Update `folderTemplates` schema in `convex/schema.ts`.
2. Add `variant: v.optional(v.string())`.
3. Add `description: v.optional(v.string())`.
4. Ensure backward compatibility (optional fields).

## Tasks / Subtasks

- [x] Update `folderTemplates` definition in `convex/schema.ts`
- [x] Run `npx convex dev` to apply/verify

## Dev Agent Record

### Agent Model Used

Antigravity (thinking)

### Debug Log References

- Step 7: `npx convex dev --once` verified schema addition of variant and description.

### Completion Notes List

- Added `variant` (optional string) to `folderTemplates` in `convex/schema.ts`.
- Added `description` (optional string) to `folderTemplates` in `convex/schema.ts`.
- Verified schema update with local deployment.

### File List

- `convex/schema.ts`
- `_bmad-output/implementation-artifacts/stories/11a-3-add-folder-template-variants.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Notes

- **File**: `convex/schema.ts`
- **Purpose**: Better UI selection for admins. Instead of just a name, they can see "Variant: South Indian" and a description.
- **Future usage**: The frontend will group templates by `projectTypeId` and then list variants.

### Project Structure Notes

- Standard schema update.

### References

- Epic 11A: Schema & Data Foundation
