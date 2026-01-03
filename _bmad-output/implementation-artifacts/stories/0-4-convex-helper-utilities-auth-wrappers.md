# Story 0.4: Convex Helper Utilities & Auth Wrappers (Migrated)

Status: done

## Story

As a **Developer**,
I want to migrate the custom Convex wrappers and utility functions,
so that I can enforce security patterns and reuse logic in the Next.js backend.

## Acceptance Criteria

1. **AC-1:** `authenticatedQuery` and `authenticatedMutation` wrappers functional in the new project.
2. **AC-2:** RBAC wrappers (`adminQuery`, `clientMutation`, etc.) verified.
3. **AC-3:** Helper utilities (`generateCode`, timestamps, storage helpers) migrated and tested.
4. **AC-4:** Reusable validators for schema enums migrated.

## Tasks / Subtasks

- [x] **Task 1: Utility Migration**

  - [x] 1.1 Copy `convex/lib/customFunctions.ts`
  - [x] 1.2 Copy `convex/lib/helpers.ts`
  - [x] 1.3 Copy `convex/lib/validators.ts`

- [x] **Task 2: Verification**
  - [x] 2.1 Verify `convex-helpers` dependency is installed
  - [x] 2.2 confirm TypeScript validity of all migrated files

## Dev Notes

### Portability

Convex helper functions are framework-agnostic. They work identically in Next.js as they did in TanStack Start. The only difference is how the _client_ calls them (using `fetchAuthQuery` or `useQuery`).

## Dependencies

- **Story 0.2** (Schema)

## Definition of Done

- [x] All 3 files migrated to `convex/lib/`.
- [x] No TypeScript errors.
