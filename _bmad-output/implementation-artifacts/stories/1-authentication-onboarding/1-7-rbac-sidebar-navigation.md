# Story 1.7: RBAC Sidebar Navigation (Next.js 16)

Status: backlog

## Story

As a **User with a specific role**,
I want to see navigation options relevant to my role,
So that I can easily access features I'm authorized to use.

## Acceptance Criteria

1. **AC-1:** Sidebar component renders dynamically based on user role
2. **AC-2:** Admin sees: Dashboard, Projects, Employees, Settings
3. **AC-3:** Client sees: Dashboard, My Projects, New Project
4. **AC-4:** Employee sees: Dashboard, Assigned Projects
5. **AC-5:** Current route is highlighted in sidebar
6. **AC-6:** Sidebar is consistent across all protected pages
7. **AC-7:** User menu shows profile info and sign-out option

## Tasks / Subtasks

### Task 1: Create Sidebar Component (AC: 1, 5)

- [ ] 1.1 Create `src/components/layout/sidebar.tsx` (or update existing)
- [ ] 1.2 Accept `role` and `currentPath` as props
- [ ] 1.3 Highlight current route using path matching
- [ ] 1.4 Use shadcn/ui navigation components

### Task 2: Define Role-Based Navigation Config (AC: 2, 3, 4)

- [ ] 2.1 Create navigation config with items per role:

```typescript
const navigationByRole = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: Home },
    { label: "Projects", href: "/admin/projects", icon: Folder },
    { label: "Employees", href: "/admin/employees", icon: Users },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  client: [
    { label: "Dashboard", href: "/client/dashboard", icon: Home },
    { label: "My Projects", href: "/client/projects", icon: Folder },
    { label: "New Project", href: "/client/projects/new", icon: Plus },
  ],
  employee: [
    { label: "Dashboard", href: "/employee/dashboard", icon: Home },
    { label: "Assigned Projects", href: "/employee/projects", icon: Folder },
  ],
};
```

### Task 3: Integrate Sidebar into Protected Layout (AC: 6)

- [ ] 3.1 Import Sidebar into `(protected)/layout.tsx`
- [ ] 3.2 Pass user role and profile to Sidebar
- [ ] 3.3 Render consistent layout with header + sidebar + main content

### Task 4: User Menu Component (AC: 7)

- [ ] 4.1 Create `src/components/layout/user-menu.tsx` (or update existing)
- [ ] 4.2 Display user name and avatar
- [ ] 4.3 Add Sign Out option that calls `authClient.signOut()`
- [ ] 4.4 Add link to Profile/Settings

## Dev Notes

### Layout Structure

```tsx
// app/(protected)/layout.tsx
export default async function ProtectedLayout({
  children,
  admin,
  client,
  employee,
}) {
  const profile = await fetchAuthQuery(api.profiles.queries.getMyProfile);

  return (
    <div className="flex h-screen">
      <Sidebar role={profile.role} />
      <main className="flex-1 overflow-auto">
        <Header profile={profile} />
        <div className="p-6">
          {/* Render role-specific content */}
          {profile.role === "admin" && admin}
          {profile.role === "client" && client}
          {profile.role === "employee" && employee}
        </div>
      </main>
    </div>
  );
}
```

### Portable from Old Project

Most of the sidebar/layout components from the old project should be portable:

- `src/components/layout/sidebar.tsx` - Update navigation config
- `src/components/layout/header.tsx` - Mostly portable
- `src/components/layout/user-menu.tsx` - Update sign-out to use authClient

### Sign Out Flow

```typescript
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const handleSignOut = async () => {
  await authClient.signOut();
  router.push("/auth/sign-in");
};
```

### Icon Library

Use `lucide-react` for consistent icons (already in dependencies).

### References

- [Source: Existing layout components from TanStack project]
- [Source: _bmad-output/planning-artifacts/epics/01-auth-onboarding.md]

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Completion Notes List

(To be filled by dev agent)

### File List

(To be filled by dev agent)
