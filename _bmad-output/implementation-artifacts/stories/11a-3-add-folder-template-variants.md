# Story 11A.3: Add Variant Metadata to Folder Templates

Status: ready-for-dev

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

- [ ] Update `folderTemplates` definition in `convex/schema.ts`
- [ ] Run `npx convex dev` to apply/verify

## Dev Notes

- **File**: `convex/schema.ts`
- **Purpose**: Better UI selection for admins. Instead of just a name, they can see "Variant: South Indian" and a description.
- **Future usage**: The frontend will group templates by `projectTypeId` and then list variants.

### Project Structure Notes

- Standard schema update.

### References

- Epic 11A: Schema & Data Foundation
