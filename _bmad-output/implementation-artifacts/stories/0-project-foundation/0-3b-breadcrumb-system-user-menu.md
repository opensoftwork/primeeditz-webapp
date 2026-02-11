# Story 0.3b: Breadcrumb System & User Menu (Next.js 16)

Status: ready-for-dev

## Story

As a **User**,
I want breadcrumb navigation and a user profile menu in the Next.js shell,
so that I always know where I am and can access my account settings.

## Acceptance Criteria

1. **AC-1:** Breadcrumb system displays current hierarchy using Next.js `usePathname`.
2. **AC-2:** User Menu displays name, role badge, and Sign Out option using Better Auth client.
3. **AC-3:** Role-based badge colors (admin=red, client=green, employee=blue).
4. **AC-4:** Integration with Next.js Server Components for initial user state preloading.

## Tasks / Subtasks

- [ ] **Task 1: Next.js Breadcrumbs** (AC: #1)

  - [ ] Implement `src/components/layout/breadcrumbs.tsx`
  - [ ] Use `usePathname()` from `next/navigation` to resolve route segments
  - [ ] Map static route labels for breadcrumb display

- [ ] **Task 2: Migration of User Menu** (AC: #2, #3)

  - [ ] Migrate `src/components/layout/user-menu.tsx`
  - [ ] Update Sign Out logic to use `authClient.signOut()`
  - [ ] Implement loading skeleton for auth state

- [ ] **Task 3: Integration with App Shell**
  - [ ] Add breadcrumbs and user menu to `header.tsx`
  - [ ] verify alignment and responsiveness

## Dev Notes

### Breadcrumb Implementation in Next.js

Unlike TanStack Router which provides `useMatches`, in Next.js we parse `usePathname()`:

```tsx
const pathname = usePathname();
const segments = pathname.split("/").filter(Boolean);
```

### Auth State Handling

The User Menu should use `authClient.useSession()` for client-side state, but the layout should ideally preload the user identity in a Server Component for zero-layout-shift (Story 1.1).

## Dependencies

- **Story 0.3a** (App Shell)
- **Story 1.1** (Auth Infrastructure)

## Definition of Done

- [ ] Breadcrumbs correctly reflect the current URL.
- [ ] User menu shows current auth state (mocked until Story 1.1 completes).
- [ ] Layout matches previous design exactly.
