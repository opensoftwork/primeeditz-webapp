# Better Auth + Convex Integration Reference

> **Last Updated:** 2025-12-29
> **Requires:** Convex >= 1.25.0, better-auth, @convex-dev/better-auth

## Overview

Better Auth is a framework-agnostic authentication library for TypeScript. When integrated with Convex, authentication data is stored and managed within the Convex database.

## Key Features

- Email & Password authentication
- Social Sign-on (multiple providers)
- Account & Session Management
- Two-Factor Authentication
- Plugin ecosystem
- Organization & Access Control
- Built-in Rate Limiter

---

## Installation

### 1. Install Packages

```bash
npm install better-auth convex@latest @convex-dev/better-auth
```

### 2. Register Component

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

const app = defineApp();
app.use(betterAuth);

export default app;
```

### 3. Add Auth Config

```typescript
// convex/auth.config.ts
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
```

### 4. Set Environment Variables

```bash
# Generate secret
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)

# Add site URL
npx convex env set SITE_URL http://localhost:3000
```

```env
# .env.local
CONVEX_DEPLOYMENT=dev:adjective-animal-123
NEXT_PUBLIC_CONVEX_URL=https://adjective-animal-123.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://adjective-animal-123.convex.site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Server Configuration

### Create Better Auth Instance

```typescript
// convex/auth.ts
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

// Component client for Convex integration
export const authComponent = createClient<DataModel>(components.betterAuth);

// Create auth instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({ authConfig }), // Required for Convex compatibility
    ],
  });
};

// Get current user query
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
```

### Register HTTP Routes

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

export default http;
```

---

## TanStack Start Integration

### Mount Auth Handler

```typescript
// src/routes/api/auth/$.ts
import { auth } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
```

### Configure Better Auth Server

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = betterAuth({
  // ...your config
  plugins: [
    tanstackStartCookies(), // MUST be last plugin in array
  ],
});
```

### Auth Middleware for TanStack Start

```typescript
// lib/middleware.ts
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

---

## Client Configuration

### Create Auth Client

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});
```

### Convex Provider Wrapper

```typescript
// components/providers.tsx
"use client";
import { type PropsWithChildren } from "react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
  initialToken,
}: PropsWithChildren<{ initialToken?: string | null }>) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
```

---

## Usage Patterns

### Sign In (Client-Side)

```typescript
import { auth } from "@/lib/auth";

const signIn = async () => {
  await auth.api.signInEmail({
    body: {
      email: "user@email.com",
      password: "password",
    },
  });
};
```

### Using Auth in Convex Functions

```typescript
// convex/users/mutations.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { createAuth, authComponent } from "./auth";

export const updateUserPassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    await auth.api.changePassword({
      body: {
        currentPassword: args.currentPassword,
        newPassword: args.newPassword,
      },
      headers,
    });
  },
});
```

---

## Key Points for PrimeEditz

1. **Better Auth stores sessions in Convex** - No separate session table needed
2. **Use `authComponent.getAuthUser(ctx)`** in queries/mutations to get current user
3. **Route protection via TanStack Start middleware** - Not Convex-side
4. **tanstackStartCookies plugin required** for TanStack Start integration
5. **convex plugin required** for Convex database compatibility

---

## References

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Convex + Better Auth Guide](https://convex-better-auth.netlify.app/)
- [TanStack Start Integration](https://www.better-auth.com/docs/integrations/tanstack)
