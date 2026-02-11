# Story 11A.5: Introduce `studio` Role

Status: review

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

- [x] Update `convex/schema.ts`: `roleValidator`
- [x] Update `convex/lib/customFunctions.ts`: Allow `studio` in `clientMutation`/`clientQuery`
- [x] Check frontend `lib/auth.ts` or similar for client-side usage of role strings
- [x] Ensure layout/sidebar logic handles `studio` role (map it to Client view for now)

## Dev Agent Record

### Agent Model Used

Antigravity (thinking)

### Debug Log References

- Step 7: `npx convex dev --once` verified role extension.
- Grep: Found and updated `src/utils/auth.ts`, `src/components/modules/projects/wizard/types.ts`, and `src/components/modules/sidebar/navigation-config.ts`.

### Completion Notes List

- Added `'studio'` to `roleValidator` in `convex/schema.ts`.
- Updated API wrappers in `convex/lib/customFunctions.ts` to support both `client` and `studio` roles.
- Updated frontend auth utilities in `src/utils/auth.ts` to recognize `studio` as a client-equivalent role.
- Updated project wizard types to include `studio` mode.
- Updated sidebar configuration to provide client navigation for users with the `studio` role.

### File List

- `convex/schema.ts`
- `convex/lib/customFunctions.ts`
- `src/utils/auth.ts`
- `src/components/modules/projects/wizard/types.ts`
- `src/components/modules/sidebar/navigation-config.ts`
- `_bmad-output/implementation-artifacts/stories/11a-5-introduce-studio-role.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Notes

- **File**: `convex/schema.ts`
- **File**: `convex/lib/customFunctions.ts`
- **Important**: This is a non-breaking additive change.
- **Frontend**: Search for `role === 'client'` in the codebase. You might need to update to `role === 'client' || role === 'studio'` temporarily until full rename in Epic 11D.

### Project Structure Notes

- Core auth logic update.

### References

- Epic 11A: Schema & Data Foundation
