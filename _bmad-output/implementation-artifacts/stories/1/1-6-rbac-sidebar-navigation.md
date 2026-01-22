# Story 1.6: RBAC-Based Sidebar Navigation

Status: done

## Story

As a **User (Client/Employee/Admin)**,
I want the sidebar navigation to show only the menu items relevant to my role,
so that I have a focused, intuitive interface without confusion from features I can't access.

## Acceptance Criteria

1. **AC-1:** ✅ Sidebar must display role-appropriate navigation items based on authenticated user's role
2. **AC-2:** ✅ Client users see: Dashboard, My Projects, Settings
3. **AC-3:** ✅ Employee users see: Dashboard, Assigned Work, Settings
4. **AC-4:** ✅ Admin users see: Dashboard, All Projects, Clients, Employees, Quotations, Settings
5. **AC-5:** ✅ Sidebar footer must display real user profile data (name, role) instead of mock data
6. **AC-6:** ✅ Sign-out button must trigger real authentication sign-out flow
7. **AC-7:** ✅ Dashboard link must route to role-specific dashboard (using `getDashboardPath()`)
8. **AC-8:** ✅ All navigation must use TanStack Router `<Link>` components (no `<a>` tags for internal routes)
9. **AC-9:** ✅ Loading skeleton must display while profile data is being fetched

## Tasks / Subtasks

### Task 1: Integrate usePermissions Hook (AC: 1, 5)

- [x] 1.1 Import `usePermissions` hook in `app-sidebar.tsx`
- [x] 1.2 Remove `mockUser` constant
- [x] 1.3 Use `usePermissions()` to get `profile`, `role`, `isLoading`, `isAdmin`, `isEmployee`, `isClient`
- [x] 1.4 Add loading skeleton when `isLoading` is true

### Task 2: Define Role-Based Navigation Config (AC: 2, 3, 4)

- [x] 2.1 Create `clientNavItems` array (Dashboard, My Projects)
- [x] 2.2 Create `employeeNavItems` array (Dashboard, Assigned Work)
- [x] 2.3 Create `adminNavItems` array (Dashboard, All Projects, Clients, Employees, Quotations)
- [x] 2.4 Create `commonNavItems` array (Settings)
- [x] 2.5 Build filtered nav items based on role using `useMemo`

### Task 3: Update Dashboard Routing (AC: 7)

- [x] 3.1 Import `getDashboardPath` from `@/utils/auth`
- [x] 3.2 Update Dashboard nav item to use dynamic path based on role
- [x] 3.3 Update header logo link to use `getDashboardPath()`

### Task 4: Replace Anchor Tags with TanStack Links (AC: 8)

- [x] 4.1 Replace all `<a href={...}>` with `<Link to={...}>`
- [x] 4.2 Ensure type-safe routing for all navigation items
- [x] 4.3 Verify `isActive` detection works with Link components

### Task 5: Connect Real Sign-Out (AC: 6)

- [x] 5.1 Import `authClient` from `@/lib/auth-client`
- [x] 5.2 Implement sign-out handler with `authClient.signOut()`
- [x] 5.3 Show toast notification on successful sign-out
- [x] 5.4 Redirect to `/auth/sign-in` after sign-out (using window.location.href for full state clear)

### Task 6: Update Sidebar Footer with Real User Data (AC: 5)

- [x] 6.1 Display `profile.name` instead of mock name
- [x] 6.2 Display `role` with proper capitalization
- [x] 6.3 Add fallback for missing profile data

### Task 7: Testing & Validation (AC: All)

- [x] 7.1 Test: Sign in as client → only client nav items visible
- [x] 7.2 Test: Sign in as employee → only employee nav items visible
- [x] 7.3 Test: Sign in as admin → all nav items visible
- [x] 7.4 Test: Click sign-out → properly logs out and redirects
- [x] 7.5 Test: Dashboard link routes to correct role dashboard
- [x] 7.6 Test: Loading skeleton displays while profile loads

## Definition of Done

- [x] Sidebar displays role-filtered navigation
- [x] No mock data in sidebar component
- [x] Uses `usePermissions` hook for role detection
- [x] All internal links use TanStack `<Link>`
- [x] Sign-out triggers real authentication flow
- [x] Loading state handled gracefully
- [x] No TypeScript errors
- [x] No console errors

## Dev Notes

### Navigation Structure (Approved by Team)

| Role         | Dashboard Path        | Nav Items                                                         |
| ------------ | --------------------- | ----------------------------------------------------------------- |
| **Client**   | `/client/dashboard`   | Dashboard, My Projects, Settings                                  |
| **Employee** | `/employee/dashboard` | Dashboard, Assigned Work, Settings                                |
| **Admin**    | `/admin/dashboard`    | Dashboard, All Projects, Clients, Employees, Quotations, Settings |

### Key Files Modified

- `src/components/layout/app-sidebar.tsx` - Complete rewrite with RBAC support

### Design Decisions

1. **Role-based filtering via useMemo** - Efficient re-render only when role changes
2. **Loading skeleton** - Shows placeholder UI while profile loads
3. **@ts-expect-error for future routes** - `/settings` routes don't exist yet, will be created in future stories
4. **window.location.href for sign-out** - Full page reload to clear all client-side state

### TypeScript Notes

Some routes like `/settings`, `/admin/projects`, `/client/projects` etc. don't exist yet in the TanStack Router route tree. They will be created in future epics:

- `/settings` - Epic 7 (Settings)
- `/admin/projects`, `/admin/clients`, etc. - Epic 3 (Admin Portal)
- `/client/projects` - Epic 2 (Client Portal)
- `/employee/work` - Epic 3 (Admin Portal - Employee features)

The Links to these routes use `@ts-expect-error` until the routes are created.

## Dependencies

- Story 1.5: Route Protection & Auth Middleware (DONE) - Provides `usePermissions` hook

## Dev Agent Record

### Agent Model Used

claude-3.5-sonnet (Antigravity)

### Completion Notes

Complete rewrite of `app-sidebar.tsx` from 241 lines to 350 lines. Key changes:

- Removed all mock data
- Added role-based navigation configuration
- Integrated `usePermissions` hook for real-time role detection
- Added loading skeleton for better UX
- Connected real sign-out flow
- Replaced all `<a>` tags with TanStack `<Link>` components

### File List

| File                                    | Action   | Description                         |
| --------------------------------------- | -------- | ----------------------------------- |
| `src/components/layout/app-sidebar.tsx` | Modified | Complete RBAC-based sidebar rewrite |
