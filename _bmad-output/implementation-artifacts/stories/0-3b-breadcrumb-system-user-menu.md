# Story 0.3b: Breadcrumb System & User Menu

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **User**,
I want breadcrumb navigation and a user profile menu,
so that I always know where I am and can access my account settings.

## Acceptance Criteria

1. **AC-1:** The Breadcrumb must display the current route hierarchy using TanStack Router's route matching.
2. **AC-2:** The User Menu must show: User Name, Role Badge, and Sign Out option.
3. **AC-3:** Clicking Sign Out must clear the session and redirect to `/auth/sign-in`.

## Tasks / Subtasks

- [x] **Task 1: Breadcrumb Component** (AC: #1)

  - [x] 1.1 Create `src/components/layout/breadcrumbs.tsx`
  - [x] 1.2 Use TanStack Router's `useMatches()` hook to get route hierarchy
  - [x] 1.3 Map route matches to breadcrumb items with labels
  - [x] 1.4 Implement clickable links for parent routes
  - [x] 1.5 Add proper separators between items (ChevronRight)
  - [x] 1.6 Handle routes with `crumb` in context

- [x] **Task 2: User Menu Component** (AC: #2)

  - [x] 2.1 Create `src/components/layout/user-menu.tsx`
  - [x] 2.2 Use shadcn `DropdownMenu` component
  - [x] 2.3 Display user avatar with initials fallback
  - [x] 2.4 Display user name in dropdown header
  - [x] 2.5 Add role badge (Client, Employee, Admin) with colors
  - [x] 2.6 Add menu items: Profile Settings, Settings, Sign Out

- [x] **Task 3: Sign Out Functionality** (AC: #3)

  - [x] 3.1 Implement sign out handler (placeholder until Better Auth ready)
  - [x] 3.2 Handler logs and redirects for now
  - [ ] 3.3 Integrate with Better Auth when available (deferred to Epic 1)
  - [ ] 3.4 Show toast notification on successful sign out (needs toast component)

- [x] **Task 4: Integration with Header** (AC: #1, #2)

  - [x] 4.1 Add Breadcrumbs to header (left/center area)
  - [x] 4.2 Add User Menu to header (right area)
  - [x] 4.3 Ensure proper spacing and alignment
  - [x] 4.4 Added showUserMenu prop for flexibility

- [ ] **Task 5: Auth Context Integration** (AC: #2, #3)
  - [ ] 5.1 Create `src/hooks/use-auth.ts` (deferred to Epic 1)
  - [x] 5.2 Using mock user data for development
  - [x] 5.3 UserMenu accepts user prop for when auth is ready
  - [x] 5.4 Loading state skeleton implemented

## Dev Notes

### Components Created

**Breadcrumbs Component:**

- Uses `useMatches()` from TanStack Router
- Filters routes with `crumb` in context
- Shows Home icon + breadcrumb trail
- Uses shadcn/ui Breadcrumb component

**UserMenu Component:**

- Shows avatar with initials fallback
- Displays name, email, and role badge
- Role badges color-coded (red=admin, blue=employee, green=client)
- Profile Settings, Settings, Sign Out actions
- Loading skeleton state supported

### Route Breadcrumb Pattern

Routes can define breadcrumbs via context:

```typescript
export const Route = createFileRoute("/projects/")({
  context: () => ({ crumb: "Projects" }),
  component: ProjectsPage,
});
```

### Role Badge Colors

- **Admin**: Red (`bg-red-500/10 text-red-500`)
- **Employee**: Blue (`bg-blue-500/10 text-blue-500`)
- **Client**: Green (`bg-green-500/10 text-green-500`)

### shadcn Components Installed

- `breadcrumb` - breadcrumb navigation
- `badge` - role badges
- `avatar` - user avatar with fallback

## Dependencies

- **Story 0.3a** (App Shell) — Header component must exist ✓
- **Story 1.1c** (Auth Context) — For real user data (using mock for now)

## Definition of Done

- [x] Breadcrumbs show current route hierarchy
- [x] User menu displays name and role
- [x] Sign out action implemented (placeholder)
- [x] Components integrated into header
- [x] Responsive on all screen sizes

## Dev Agent Record

### Agent Model Used

Claude (Gemini Antigravity)

### Debug Log References

- Installed shadcn components: `breadcrumb`, `badge`, `avatar`
- TypeScript compiles without errors

### Completion Notes List

- Breadcrumbs use route context `crumb` property
- UserMenu uses mock user until auth is implemented
- Role badges are color-coded for visual distinction
- Sign out is a placeholder - will integrate with Better Auth in Epic 1
- Added showUserMenu prop to Header for flexibility

### Change Log

| Date       | Change                                  | Author    |
| ---------- | --------------------------------------- | --------- |
| 2025-12-30 | Story created via create-story workflow | SM Agent  |
| 2025-12-30 | Implemented breadcrumbs and user menu   | Dev Agent |

### File List

**Created:**

- `src/components/layout/breadcrumbs.tsx`
- `src/components/layout/user-menu.tsx`

**Modified:**

- `src/components/layout/header.tsx` (integrated breadcrumbs + user menu)
- `src/components/layout/index.ts` (added exports)

**shadcn Components Added:**

- `src/components/ui/breadcrumb.tsx` (was already present)
- `src/components/ui/badge.tsx`
- `src/components/ui/avatar.tsx`
