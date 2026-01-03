# Story 1.6: RBAC with Parallel Routes (Next.js 16)

Status: backlog

## Story

As a **User with a specific role**,
I want to see a dashboard tailored to my role,
So that I can access features relevant to my responsibilities.

## Acceptance Criteria

1. **AC-1:** Parallel route slots exist: `@admin`, `@client`, `@employee`
2. **AC-2:** Protected layout renders the correct slot based on user role
3. **AC-3:** Admin users see admin dashboard at `/`
4. **AC-4:** Client users see client dashboard at `/`
5. **AC-5:** Employee users see employee dashboard at `/`
6. **AC-6:** Each slot has a `default.tsx` for unmatched routes
7. **AC-7:** Role mismatch redirects to correct dashboard (e.g., client trying `/admin/*`)

## Tasks / Subtasks

### Task 1: Create Parallel Route Slots (AC: 1, 6)

- [ ] 1.1 Create `src/app/(protected)/@admin/` directory
- [ ] 1.2 Create `src/app/(protected)/@admin/default.tsx` (returns null or redirect)
- [ ] 1.3 Create `src/app/(protected)/@client/` directory
- [ ] 1.4 Create `src/app/(protected)/@client/default.tsx`
- [ ] 1.5 Create `src/app/(protected)/@employee/` directory
- [ ] 1.6 Create `src/app/(protected)/@employee/default.tsx`

### Task 2: Create Dashboard Pages Per Role (AC: 3, 4, 5)

- [ ] 2.1 Create `src/app/(protected)/@admin/dashboard/page.tsx`
- [ ] 2.2 Create `src/app/(protected)/@client/dashboard/page.tsx`
- [ ] 2.3 Create `src/app/(protected)/@employee/dashboard/page.tsx`

### Task 3: Update Protected Layout for Parallel Routes (AC: 2)

- [ ] 3.1 Update `src/app/(protected)/layout.tsx` to accept slot props
- [ ] 3.2 Conditionally render slot based on user role:
  - `role === 'admin'` → render `{admin}`
  - `role === 'client'` → render `{client}`
  - `role === 'employee'` → render `{employee}`
- [ ] 3.3 Pass children through appropriate slot

### Task 4: Role Enforcement (AC: 7)

- [ ] 4.1 In each slot's pages, verify user has correct role
- [ ] 4.2 Redirect to correct dashboard if role mismatch

## Dev Notes

### Parallel Routes Concept

From Next.js documentation, parallel routes use `@folder` naming convention:

```
app/(protected)/
├── layout.tsx               ← Receives @slots as props
├── @admin/
│   ├── default.tsx          ← Fallback for unmatched routes
│   └── dashboard/
│       └── page.tsx         ← Admin dashboard
├── @client/
│   ├── default.tsx
│   └── dashboard/
│       └── page.tsx         ← Client dashboard
└── @employee/
    ├── default.tsx
    └── dashboard/
        └── page.tsx         ← Employee dashboard
```

### Protected Layout with Parallel Routes

```tsx
// app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

interface LayoutProps {
  children: React.ReactNode;
  admin: React.ReactNode;
  client: React.ReactNode;
  employee: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
  admin,
  client,
  employee,
}: LayoutProps) {
  const profile = await fetchAuthQuery(api.profiles.queries.getMyProfile);

  if (!profile) {
    redirect("/onboarding");
  }

  // Render appropriate slot based on role
  switch (profile.role) {
    case "admin":
      return <>{admin}</>;
    case "client":
      return <>{client}</>;
    case "employee":
      return <>{employee}</>;
    default:
      redirect("/auth/sign-in");
  }
}
```

### default.tsx Purpose

When a parallel route doesn't match the current URL, Next.js renders `default.tsx`:

```tsx
// app/(protected)/@admin/default.tsx
export default function AdminDefault() {
  return null; // Or redirect to admin dashboard
}
```

### URL Structure

With parallel routes, the URL remains clean:

- `/dashboard` - Renders appropriate dashboard based on role
- `/client/projects/new` - Renders client project wizard

**Important:** The `@folder` convention doesn't affect URLs!

### References

- [Source: _bmad-output/docs/nextjs/parallel-routes.md]
- [Source: _bmad-output/docs/nextjs/parallel-routes.md#Conditional-Routes]

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Completion Notes List

(To be filled by dev agent)

### File List

(To be filled by dev agent)
