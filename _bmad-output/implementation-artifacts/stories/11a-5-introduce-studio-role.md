# Story 11A.5: Introduce `studio` Role

Status: ready-for-dev

## Story

As a Developer,
I want to add `studio` to the role validator,
so that we can migrate users gradually from 'client' to 'studio'.

## Acceptance Criteria

1. Update `roleValidator` in `convex/schema.ts` to include `v.literal('studio')`.
2. Keep `v.literal('client')` for now (backward compatibility).
3. Update `clientMutation` and `clientQuery` wrappers in `convex/lib/customFunctions.ts` (or equivalent auth helpers) to accept BOTH `client` AND `studio` roles.
4. Update `roleCheck` logic in `src/middleware.ts` (if any) or frontend route guards to treat `studio` same as `client`.

## Tasks / Subtasks

- [ ] Update `convex/schema.ts`: `roleValidator`
- [ ] Update `convex/lib/customFunctions.ts`: Allow `studio` in `clientMutation`/`clientQuery`
- [ ] Check frontend `lib/auth.ts` or similar for client-side usage of role strings
- [ ] Ensure layout/sidebar logic handles `studio` role (map it to Client view for now)

## Dev Notes

- **File**: `convex/schema.ts`
- **File**: `convex/lib/customFunctions.ts`
- **Important**: This is a non-breaking additive change.
- **Frontend**: Search for `role === 'client'` in the codebase. You might need to update to `role === 'client' || role === 'studio'` temporarily until full rename in Epic 11D.

### Project Structure Notes

- Core auth logic update.

### References

- Epic 11A: Schema & Data Foundation
