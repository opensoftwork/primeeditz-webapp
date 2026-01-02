# Story 1.5: Route Protection & Auth Middleware

Status: done

## Story

As a **Studio Manager**,
I want to ensure that unauthorized users cannot access protected data,
so that our business data remains secure.

## Acceptance Criteria

1. **AC-1:** ✅ A TanStack Start middleware must exist that validates session and profile state
2. **AC-2:** ✅ Unauthenticated users attempting to visit any protected route must be redirected to `/auth/sign-in`
3. **AC-3:** ✅ Authenticated users without a profile must be redirected to `/onboarding`
4. **AC-4:** ✅ Clients can only access client routes (`/client/dashboard`) - redirect if attempting `/admin/*` or `/employee/*`
5. **AC-5:** ✅ Admins can access all routes (`/admin/*`, `/client/*`, `/employee/*`)
6. **AC-6:** ✅ Role-based dashboard routing: Clients → `/client/dashboard`, Employees → `/employee/dashboard`, Admins → `/admin/dashboard`
7. **AC-7:** ✅ Sign-in page must check for existing session and redirect authenticated users to appropriate dashboard
8. **AC-8:** ✅ An `_authed` layout route must wrap all protected routes and provide auth context

> **Note:** AC-4 and AC-6 updated from original story. Root path `/` is now a public landing page, not the client dashboard.

## Tasks / Subtasks

### Task 1: Create Auth Middleware File (AC: 1, 2, 3)

- [x] 1.1 Create `src/middleware/auth.ts` file
- [x] 1.2 Implement `authMiddleware` using `createMiddleware` from TanStack Start
- [x] 1.3 Use request headers for session validation
- [x] 1.4 Query session using `auth.api.getSession({ headers })`
- [x] 1.5 Create `requireAuthMiddleware` that redirects if not authenticated
- [x] 1.6 Export middleware for use in API routes (page routes use beforeLoad)

### Task 2: Create Global Middleware in start.ts (AC: 1)

- [x] 2.1 Create `src/start.ts` with `createStart()`
- [x] 2.2 Implement `globalAuthMiddleware` that attaches session to context
- [x] 2.3 Configure `requestMiddleware` array with global auth

### Task 3: Extend \_\_root.tsx Auth Context (AC: 1, 8)

- [x] 3.1 Extend `beforeLoad` to fetch profile data via `fetchAuthQuery`
- [x] 3.2 Pass `profile`, `hasProfile`, `hasCompletedOnboarding` to route context
- [x] 3.3 Create `getAuthAndProfile` server function for SSR

### Task 4: Create Authenticated Layout Route (AC: 8, 2, 3)

- [x] 4.1 Create `src/routes/_authed.tsx` layout route using TanStack Router's pathless layout pattern
- [x] 4.2 Implement `beforeLoad` guard checking `context.isAuthenticated`
- [x] 4.3 If authenticated but no profile → redirect to `/onboarding`
- [x] 4.4 Render `<Outlet />` for child routes

> **Design Decision:** Page routes use `beforeLoad` guards instead of `server: { middleware: [] }`. The server middleware syntax is for API routes, not page routes.

### Task 5: Create Role-Specific Dashboard Routes (AC: 4, 5, 6)

- [x] 5.1 Create `src/routes/_authed/admin/dashboard.tsx` with admin-only access
- [x] 5.2 Create `src/routes/_authed/client/dashboard.tsx` for clients (admins can access)
- [x] 5.3 Create `src/routes/_authed/employee/dashboard.tsx` for employees (admins can access)
- [x] 5.4 Implement `beforeLoad` guards with role checking using `src/utils/auth.ts` helpers

> **Design Decision:** Changed from pathless layout routes (`_admin.tsx`, `_client.tsx`) to folder-based routes (`admin/dashboard.tsx`, `client/dashboard.tsx`) to avoid TanStack Router path conflicts.

### Task 6: Update Route Structure (AC: all)

- [x] 6.1 Keep `src/routes/index.tsx` as PUBLIC landing page at `/`
- [x] 6.2 Move `src/routes/onboarding.tsx` to `src/routes/_authed/onboarding.tsx`
- [x] 6.3 Onboarding route redirects completed users to their dashboard

### Task 7: Update Auth Page Redirects (AC: 7)

- [x] 7.1 Update `src/routes/auth/sign-in.tsx` to check for existing session in `beforeLoad`
- [x] 7.2 If already authenticated → redirect based on role using `getDashboardPath()`
- [x] 7.3 Update `src/routes/auth/sign-up.tsx` with same session check

### Task 8: Create Permission Helpers & Hooks (AC: 4, 5)

- [x] 8.1 Create `src/utils/auth.ts` with ROLES constant and Role type
- [x] 8.2 Create `hasMinimumRole(userRole, requiredRole)` helper
- [x] 8.3 Create `getDashboardPath(role)` helper
- [x] 8.4 Create `isAdmin`, `isClient`, `isEmployee`, `isStaff`, `canAccessRoleRoute` helpers
- [x] 8.5 Create `src/hooks/usePermissions.ts` hook for component-level checks

### Task 9: Create Unauthorized Page (AC: 4, 5)

- [x] 9.1 Create `src/routes/unauthorized.tsx` public route
- [x] 9.2 Display "Access Denied" message
- [x] 9.3 Add "Go Back" and "Home" buttons

### Task 10: Testing & Validation (AC: All)

- [x] 10.1 Test: Unauthenticated user visits `/admin/dashboard` → redirects to `/auth/sign-in`
- [x] 10.2 Test: Authenticated user without profile → redirects to `/onboarding`
- [x] 10.3 Test: Client visits `/admin/dashboard` → redirects to `/client/dashboard`
- [x] 10.4 Test: Admin can access all dashboards
- [x] 10.5 Test: Sign-in with valid session → redirect to appropriate dashboard
- [x] 10.6 Test: Sign-up success → redirect to `/onboarding`
- [x] 10.7 Verify route guards work on both client and server-side navigation

### Review Follow-ups (AI)

- [x] [AI-Review][MEDIUM] Document employee creation flow (employees are created by admins, not self-service)
- [x] [AI-Review][LOW] Add @example JSDoc to usePermissions hook
- [ ] [AI-Review][LOW] Consider adding rate limiting to auth middleware (DEFERRED: requires infrastructure)

## Definition of Done

- [x] Auth middleware file exists at `src/middleware/auth.ts`
- [x] Global middleware configured in `src/start.ts`
- [x] `_authed.tsx` layout route protects child routes
- [x] Role-specific dashboards at `/admin/dashboard`, `/client/dashboard`, `/employee/dashboard`
- [x] Root `/` is public landing page
- [x] Onboarding at `_authed/onboarding.tsx`
- [x] Unauthorized page exists at `unauthorized.tsx`
- [x] Sign-in/sign-up redirect authenticated users
- [x] `usePermissions` hook available for component-level checks
- [x] All test scenarios pass
- [x] No console errors related to auth/routing
- [x] Code reviewed and merged

## Dev Agent Record

### Agent Model Used

claude-3.5-sonnet (Antigravity)

### Completion Notes

**Architecture Decision - Middleware vs beforeLoad:**

TanStack Start has two middleware patterns:

1. **Global Request Middleware** (`src/start.ts`) - Runs on ALL server requests, used for attaching session context
2. **Page Route Guards** (`beforeLoad` in route files) - Used for redirects and role checks

The `server: { middleware: [] }` syntax is for **API server routes**, NOT page routes. Page routes use `beforeLoad` hooks for protection. This was discovered through testing when the middleware syntax caused redirect loops.

**Route Structure Decision:**

Changed from pathless layout routes (`_admin.tsx`, `_client.tsx`) to folder-based routes (`admin/dashboard.tsx`, etc.) because:

1. Pathless layouts with same parent path cause TanStack Router conflicts
2. Folder-based routes provide clear URL paths: `/admin/dashboard`, `/client/dashboard`

**Error Handling:**

Added abstracted error components in `src/components/errors/`:

- `NotFound` - 404 page with shadcn/ui components
- `ErrorBoundary` - Handles auth, forbidden, and generic errors

### File List

| File                                            | Action   | Description                                                   |
| ----------------------------------------------- | -------- | ------------------------------------------------------------- |
| `src/start.ts`                                  | Created  | Global middleware configuration                               |
| `src/middleware/auth.ts`                        | Created  | Composable auth middleware for API routes                     |
| `src/utils/auth.ts`                             | Created  | Role constants and permission helpers                         |
| `src/hooks/usePermissions.ts`                   | Created  | React hook for component-level permissions                    |
| `src/routes/_authed.tsx`                        | Created  | Protected layout route with beforeLoad guard                  |
| `src/routes/_authed/onboarding.tsx`             | Created  | Protected onboarding (moved from /onboarding)                 |
| `src/routes/_authed/admin/dashboard.tsx`        | Created  | Admin dashboard with role check                               |
| `src/routes/_authed/client/dashboard.tsx`       | Created  | Client dashboard with role check                              |
| `src/routes/_authed/employee/dashboard.tsx`     | Created  | Employee dashboard with role check                            |
| `src/routes/unauthorized.tsx`                   | Created  | Access denied page                                            |
| `src/components/errors/not-found.tsx`           | Created  | 404 component with shadcn/ui                                  |
| `src/components/errors/error-boundary.tsx`      | Created  | Error handler component                                       |
| `src/components/errors/index.ts`                | Created  | Barrel export                                                 |
| `src/routes/__root.tsx`                         | Modified | Extended to fetch profile and pass to context                 |
| `src/routes/auth/sign-in.tsx`                   | Modified | Redirects authenticated users by role                         |
| `src/routes/auth/sign-up.tsx`                   | Modified | Redirects authenticated users by role                         |
| `src/routes/index.tsx`                          | Modified | Changed to public landing page                                |
| `src/components/auth/sign-in.tsx`               | Modified | Improved error handling, redirects to role-specific dashboard |
| `src/components/onboarding/onboarding-form.tsx` | Modified | Redirects to role-specific dashboard                          |
