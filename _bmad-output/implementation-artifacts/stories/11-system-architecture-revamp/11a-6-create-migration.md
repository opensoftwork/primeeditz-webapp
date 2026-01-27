# Story 11A.6: Create Client-to-Studio Migration

Status: in-progress

## Story

As an Admin,
I want an internal mutation to migrate existing `client` profiles to `studio`,
so that we can complete the terminology transition.

## Acceptance Criteria

1. Create a new file `convex/functions/migrations.ts` (if not exists).
2. Export an internal mutation `migrateClientToStudio`.
3. The mutation should:
   - Query all records in `users` (or `profiles`) table where `role === 'client'`.
   - Iterate and patch them to `role = 'studio'`.
   - Return the count of updated records.
   - Log to console: "Migrated X users from client to studio".
4. This mutation must not be exposed to the public API (internal only).

## Tasks / Subtasks

- [ ] Create/Update `convex/functions/migrations.ts`
- [ ] Implement `migrateClientToStudio`
- [ ] Test locally by manually calling it from dashboard or CLI

## Dev Notes

- **File**: `convex/functions/migrations.ts`
- **Context**: This is a one-time script.
- **Safety**: Ensure you don't break active sessions if possible, though role change might require re-login. That's acceptable for a migration maintenance window.

### Project Structure Notes

- Internal tool.

### References

- Epic 11A: Schema & Data Foundation
