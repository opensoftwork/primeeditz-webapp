# Role-Based Access Control (RBAC) Reference

> **Last Updated:** 2025-12-29
> **Applies To:** TanStack Start + Convex + Better Auth

## Overview

RBAC (Role-Based Access Control) assigns permissions to users based on their roles, rather than assigning permissions to individual users. This creates a systematic, repeatable, and auditable access control system.

---

## Benefits of RBAC

- **Systematic permission assignment** - Repeatable, consistent access control
- **Easy auditing** - Quickly identify user privileges
- **Flexible role management** - Add/change roles across APIs
- **Reduced errors** - Less chance of incorrect permission assignment
- **Third-party integration** - Pre-defined roles for external users
- **Compliance** - Meet regulatory requirements for confidentiality

---

## PrimeEditz Role Model

### User Roles

| Role       | Description                                | Portal Access      |
| ---------- | ------------------------------------------ | ------------------ |
| `admin`    | Full system access, manages all operations | Admin Dashboard    |
| `employee` | Studio staff, handles assigned work        | Employee Dashboard |
| `client`   | External customers, submits events         | Client Dashboard   |

### Role Hierarchy

```typescript
// utils/auth.ts
export const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  CLIENT: "client",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Role hierarchy for permission inheritance
const ROLE_HIERARCHY: Record<Role, number> = {
  client: 0,
  employee: 1,
  admin: 2,
};

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
```

---

## TanStack Start Implementation

### 1. Extend Router Context

```typescript
// src/router.tsx
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export interface AuthContext {
  user: {
    id: string;
    email: string;
    role: Role;
    roles: Role[];
    permissions: string[];
  } | null;
  isAuthenticated: boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export function getRouter() {
  return createRouter({
    routeTree,
    context: {
      auth: undefined!, // Will be provided by __root.tsx
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

### 2. Create Auth Context

```typescript
// src/context/auth.tsx
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { type AuthContext, ROLES, type Role } from "@/utils/auth";

export function useAuthContext(): AuthContext {
  const user = useQuery(api.auth.getCurrentUser);

  return {
    user,
    isAuthenticated: !!user,
    hasRole: (role: Role) =>
      user?.role === role || hasMinimumRole(user?.role, role),
    hasAnyRole: (roles: Role[]) =>
      roles.some((role) => user?.roles.includes(role)),
    hasPermission: (permission: string) =>
      user?.permissions.includes(permission),
  };
}
```

### 3. Root Route with Auth Context

```typescript
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useAuthContext, type AuthContext } from "@/context/auth";

export const Route = createRootRouteWithContext<{ auth: AuthContext }>()({
  component: RootComponent,
});

function RootComponent() {
  const auth = useAuthContext();

  return (
    <RootDocument>
      <Outlet context={{ auth }} />
    </RootDocument>
  );
}
```

---

## Route Protection Patterns

### Public Routes

```typescript
// routes/index.tsx
export const Route = createFileRoute("/")({
  component: HomePage,
});
```

### Authenticated Routes (Any User)

```typescript
// routes/_authed.tsx
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
```

### Role-Protected Routes

#### Admin Only

```typescript
// routes/_authed/_admin.tsx
export const Route = createFileRoute("/_authed/_admin")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasRole("admin")) {
      throw redirect({
        to: "/unauthorized",
        search: {
          redirect: location.href,
          reason: "insufficient_role",
        },
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div>
      <AdminSidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

#### Client Only

```typescript
// routes/_authed/_client.tsx
export const Route = createFileRoute("/_authed/_client")({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.role !== "client") {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: ClientLayout,
});
```

#### Employee + Admin

```typescript
// routes/_authed/_staff.tsx
export const Route = createFileRoute("/_authed/_staff")({
  beforeLoad: ({ context }) => {
    if (!context.auth.hasAnyRole(["admin", "employee"])) {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: StaffLayout,
});
```

---

## Component-Level Permission Checks

### usePermissions Hook

```typescript
// hooks/usePermissions.ts
import { useRouteContext } from "@tanstack/react-router";

export function usePermissions() {
  const { auth } = useRouteContext({ from: "/_authed" });

  return {
    hasRole: auth.hasRole,
    hasAnyRole: auth.hasAnyRole,
    hasPermission: auth.hasPermission,
    user: auth.user,
    isAdmin: auth.hasRole("admin"),
    isEmployee: auth.hasAnyRole(["admin", "employee"]),
    isClient: auth.user?.role === "client",
  };
}
```

### Permission Guard Component

```tsx
// components/PermissionGuard.tsx
import { type ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Role } from "@/utils/auth";

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: Role;
  requiredRoles?: Role[];
  requiredPermission?: string;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  requiredRole,
  requiredRoles,
  requiredPermission,
  fallback = null,
}: PermissionGuardProps) {
  const { hasRole, hasAnyRole, hasPermission } = usePermissions();

  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <>{fallback}</>;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### Usage in Components

```tsx
function EventActions({ event }) {
  const { isAdmin, isClient } = usePermissions();

  return (
    <div>
      {/* All users see status */}
      <StatusBadge status={event.status} />

      {/* Only clients can edit their events */}
      {isClient && event.status === "draft" && (
        <Button onClick={() => editEvent(event.id)}>Edit Event</Button>
      )}

      {/* Only admin can approve/reject */}
      <PermissionGuard requiredRole="admin">
        <Button onClick={() => approveEvent(event.id)}>Approve</Button>
        <Button onClick={() => rejectEvent(event.id)}>Reject</Button>
      </PermissionGuard>
    </div>
  );
}
```

---

## Convex Backend Implementation

### Custom Auth Wrappers

```typescript
// convex/lib/customFunctions.ts
import {
  customQuery,
  customMutation,
  customAction,
} from "convex-helpers/server/customFunctions";
import { query, mutation, action } from "./_generated/server";
import type { Role } from "./types";

// Get authenticated user helper
async function getAuthenticatedUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

// Authenticated query (any logged-in user)
export const authenticatedQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return { ctx: { ...ctx, user }, args: {} };
  },
});

// Admin-only query
export const adminQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");
    return { ctx: { ...ctx, user }, args: {} };
  },
});

// Staff query (admin or employee)
export const staffQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!["admin", "employee"].includes(user.role)) {
      throw new Error("Staff access required");
    }
    return { ctx: { ...ctx, user }, args: {} };
  },
});

// Client-only query
export const clientQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "client") throw new Error("Client access required");
    return { ctx: { ...ctx, user }, args: {} };
  },
});
```

### Using Auth Wrappers

```typescript
// convex/functions/events/queries.ts
import {
  authenticatedQuery,
  adminQuery,
  clientQuery,
} from "../../lib/customFunctions";
import { v } from "convex/values";

// Any authenticated user can get an event by ID (with ownership check)
export const getById = authenticatedQuery({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Clients can only see their own events
    if (
      ctx.user.role === "client" &&
      event.clientId !== ctx.user.clientProfileId
    ) {
      throw new Error("Access denied");
    }

    return event;
  },
});

// Admin sees all events
export const listAll = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

// Client sees only their events
export const listMy = clientQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .withIndex("by_client", (q) => q.eq("clientId", ctx.user.clientProfileId))
      .collect();
  },
});
```

---

## File Structure

```
src/
├── utils/
│   └── auth.ts              # Role definitions, hasRole helpers
├── context/
│   └── auth.tsx             # useAuthContext hook
├── hooks/
│   └── usePermissions.ts    # Permission checking hook
├── components/
│   └── PermissionGuard.tsx  # Component-level guard
└── routes/
    ├── _authed.tsx          # Authenticated layout
    ├── _authed/
    │   ├── _admin.tsx       # Admin layout
    │   ├── _admin/
    │   │   └── dashboard.tsx
    │   ├── _client.tsx      # Client layout
    │   └── _client/
    │       └── events.tsx

convex/
├── lib/
│   └── customFunctions.ts   # Auth wrappers
└── functions/
    └── events/
        ├── queries.ts       # getById, listAll, listMy
        └── mutations.ts     # create, update, delete
```

---

## Security Checklist

### ✅ Frontend

- [ ] Routes protected with `beforeLoad`
- [ ] Role-based layout routes configured
- [ ] Component guards for conditional rendering
- [ ] Redirect to login when unauthenticated
- [ ] Redirect to unauthorized when role mismatch

### ✅ Backend

- [ ] All public functions validate `ctx.auth.getUserIdentity()`
- [ ] Role checks in every query/mutation
- [ ] Use auth wrappers from `convex-helpers`
- [ ] Ownership checks for resource access
- [ ] Internal functions for scheduled/chained operations

---

## References

- [Auth0 RBAC Concepts](https://auth0.com/docs/manage-users/access-control/rbac)
- [TanStack Router RBAC Guide](https://tanstack.com/router/latest/docs/framework/react/how-to/setup-rbac)
- [TanStack Start Authentication](https://tanstack.com/start/latest/docs/framework/react/guide/authentication)
- [Convex Access Control](https://docs.convex.dev/understanding/best-practices/#use-some-form-of-access-control-for-all-public-functions)
