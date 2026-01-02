# TanStack Start Reference Documentation

> **Status:** Release Candidate (RC) - Feature-complete, API stable
> **Last Updated:** 2025-12-29

## Overview

TanStack Start is a full-stack React framework powered by TanStack Router. It provides:

- Full-document SSR
- Streaming
- Server Functions
- Bundling via Vite
- File-based routing

## Dependencies

- **TanStack Router**: Type-safe router with nested routing, search params, data loading
- **Vite**: Modern build tool with HMR and optimized production builds

## Key Features

| Feature                    | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| Full-document SSR          | Server-side rendering for better performance and SEO |
| Streaming                  | Progressive page loading for improved UX             |
| Server Routes & API Routes | Build backend endpoints alongside frontend           |
| Server Functions           | Type-safe RPCs between client and server             |
| Middleware & Context       | Powerful request/response handling                   |
| Full-Stack Bundling        | Optimized builds for client and server               |
| Universal Deployment       | Deploy to any Vite-compatible host                   |
| End-to-End Type Safety     | Full TypeScript support                              |

## Limitations

- **No React Server Components** (yet) - actively being worked on

---

## File Structure

```
src/
├── router.tsx           # Router configuration
├── routeTree.gen.ts     # Auto-generated route tree (DO NOT EDIT)
└── routes/
    ├── __root.tsx       # Root route (always rendered)
    ├── index.tsx        # Home page (/)
    ├── about.tsx        # About page (/about)
    ├── posts.tsx        # Posts layout (/posts)
    └── posts.$postId.tsx # Dynamic post page (/posts/:postId)
```

---

## Router Configuration

```typescript
// src/router.tsx
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  });
  return router;
}
```

---

## Root Route Structure

```typescript
// src/routes/__root.tsx
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PrimeEditz" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

### Key Components

| Component         | Purpose                              | Location        |
| ----------------- | ------------------------------------ | --------------- |
| `<HeadContent />` | Renders head, title, meta, link tags | `<head>`        |
| `<Outlet />`      | Renders matching child route         | `<body>`        |
| `<Scripts />`     | Loads client-side JavaScript         | End of `<body>` |

---

## Execution Model

### Core Principle: Isomorphic by Default

All code runs on BOTH server and client unless explicitly constrained.

```typescript
// ✅ Route loaders are ISOMORPHIC
export const Route = createFileRoute("/products")({
  loader: async () => {
    // Runs on server during SSR AND on client during navigation
    const response = await fetch("/api/products");
    return response.json();
  },
});
```

### Server-Only Execution

```typescript
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

// RPC: Server execution, callable from client
const updateUser = createServerFn({ method: "POST" })
  .inputValidator((data: UserData) => data)
  .handler(async ({ data }) => {
    // Only runs on server, but client can call it
    return await db.users.update(data);
  });

// Utility: Server-only, client crashes if called
const getEnvVar = createServerOnlyFn(() => process.env.DATABASE_URL);
```

---

## Middleware

Middleware customizes behavior of server routes and server functions.

### Use Cases

- Authentication
- Authorization
- Logging
- CSP/Security
- Observability
- Context injection
- Error handling

### Example: Auth Middleware

```typescript
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw redirect({ to: "/login" });
    }

    return await next();
  }
);
```

### Using Middleware in Routes

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { authMiddleware } from "@/lib/middleware";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});
```

### Middleware Composition

```typescript
const loggingMiddleware = createMiddleware().server(() => {
  /* ... */
});

const authMiddleware = createMiddleware()
  .middleware([loggingMiddleware]) // Depends on loggingMiddleware
  .server(async ({ next }) => {
    const result = await next();
    return result;
  });
```

---

## Route Protection

### Layout Route for Protected Pages

```typescript
// routes/_authed.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUserFn } from "../server/auth";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserFn();

    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    // Pass user to child routes
    return { user };
  },
});
```

### Protected Child Route

```typescript
// routes/_authed/dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  const { user } = Route.useRouteContext();
  return <h1>Welcome, {user.email}!</h1>;
}
```

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

```typescript
// utils/auth.ts
export const roles = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
} as const;

type Role = (typeof roles)[keyof typeof roles];

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const hierarchy = {
    [roles.USER]: 0,
    [roles.MODERATOR]: 1,
    [roles.ADMIN]: 2,
  };
  return hierarchy[userRole] >= hierarchy[requiredRole];
}
```

### Protected Admin Route

```typescript
export const Route = createFileRoute("/_authed/admin/")({
  beforeLoad: async ({ context }) => {
    if (!hasPermission(context.user.role, roles.ADMIN)) {
      throw redirect({ to: "/unauthorized" });
    }
  },
});
```

### Admin Layout Route

```typescript
// routes/_authenticated/_admin.tsx
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasRole("admin")) {
      throw redirect({
        to: "/unauthorized",
        search: { redirect: location.href },
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div>
      <div className="admin-banner">Admin Area</div>
      <Outlet />
    </div>
  );
}
```

### Component-Level Permission Checks

```typescript
// hooks/usePermissions.ts
import { useRouter } from "@tanstack/react-router";

export function usePermissions() {
  const router = useRouter();
  const auth = router.options.context.auth;

  return {
    hasRole: auth.hasRole,
    hasAnyRole: auth.hasAnyRole,
    hasPermission: auth.hasPermission,
    user: auth.user,
  };
}
```

---

## Route Types

| Type            | Purpose                                | Example                          |
| --------------- | -------------------------------------- | -------------------------------- |
| Index Routes    | Match exact path                       | `index.tsx` → `/`                |
| Dynamic Routes  | Capture URL params                     | `$postId.tsx` → `/posts/:postId` |
| Pathless Layout | Apply layout without path nesting      | `_authed.tsx`                    |
| Grouped Routes  | Organize files without affecting paths | `(admin)/`                       |

---

## Quick Start Commands

```bash
# Create new TanStack Start project
pnpm create @tanstack/start@latest

# Run development server
pnpm dev

# Build for production
pnpm build
```

---

## References

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [Quick Start Guide](https://tanstack.com/start/latest/docs/framework/react/quick-start)
