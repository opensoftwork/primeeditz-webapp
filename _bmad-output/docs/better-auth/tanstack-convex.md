[Convex + Better Auth](https://labs.convex.dev/better-auth)

[Convex + Better Auth](https://labs.convex.dev/better-auth)

Search
`⌘` `K`

[Getting Started](https://labs.convex.dev/better-auth)

Framework Guides

[React (Vite SPA)](https://labs.convex.dev/better-auth/framework-guides/react) [Expo (React Native)](https://labs.convex.dev/better-auth/framework-guides/expo) [TanStack Start](https://labs.convex.dev/better-auth/framework-guides/tanstack-start) [Next.js](https://labs.convex.dev/better-auth/framework-guides/next) [SvelteKit](https://labs.convex.dev/better-auth/framework-guides/sveltekit)

[Basic Usage](https://labs.convex.dev/better-auth/basic-usage)

[Authorization](https://labs.convex.dev/better-auth/basic-usage/authorization)

Features

[Local Install](https://labs.convex.dev/better-auth/features/local-install) [Triggers](https://labs.convex.dev/better-auth/features/triggers)

[Supported Plugins](https://labs.convex.dev/better-auth/supported-plugins) [Debugging](https://labs.convex.dev/better-auth/debugging)

Integrations

[Experimental](https://labs.convex.dev/better-auth/experimental)

API

[Component Client](https://labs.convex.dev/better-auth/api/component-client) [Type Utilities](https://labs.convex.dev/better-auth/api/type-utilities)

Migrations

[Migrate to 0.10](https://labs.convex.dev/better-auth/migrations/migrate-to-0-10)

[Migrate to 0.9](https://labs.convex.dev/better-auth/migrations/migrate-to-0-9)

[Migrate to 0.8](https://labs.convex.dev/better-auth/migrations/migrate-to-0-8)

[GitHub](https://github.com/get-convex/better-auth)

TanStack StartInstallation

Framework Guides

# TanStack Start

Install and configure Convex + Better Auth for TanStack Start.

Check out a complete Convex + Better Auth example with TanStack Start in the
[GitHub\\
repo](https://github.com/get-convex/better-auth/tree/main/examples/tanstack).

## [Installation](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#installation)

### [Install packages](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#install-packages)

Install the component, a pinned version of Better Auth, and ensure the latest version
of Convex.

This component requires Convex `1.25.0` or later.

npm

pnpm

yarn

bun

```
npm install convex@latest @convex-dev/better-auth
npm install better-auth@1.4.9 --save-exact
npm install @types/node --save-dev
```

### [Configure Vite for SSR](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#configure-vite-for-ssr)

Configure Vite to bundle `@convex-dev/better-auth` during SSR to avoid module resolution issues.

vite.config.ts

```
export default defineConfig({
  // ...other config
  ssr: {
    noExternal: ['@convex-dev/better-auth'],
  },
});
```

### [Register the component](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#register-the-component)

Register the Better Auth component in your Convex project.

convex/convex.config.ts

```
import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

const app = defineApp();
app.use(betterAuth);

export default app;
```

### [Add Convex auth config](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#add-convex-auth-config)

Add a `convex/auth.config.ts` file to configure Better Auth as an authentication provider.

convex/auth.config.ts

```
import { getAuthConfigProvider } from '@convex-dev/better-auth/auth-config'
import type { AuthConfig } from 'convex/server'

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig
```

### [Set environment variables](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#set-environment-variables)

Generate a secret for encryption and generating hashes. Use the command below if you have openssl installed, or use the button to generate a random value instead. Or generate your own however you like.

```
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
```

Add your site URL to your Convex deployment.

```
npx convex env set SITE_URL http://localhost:3000
```

Add environment variables to the `.env.local` file created by `npx convex dev`. It will be picked up by your framework dev server.

Cloud

Self hosted

.env.local

```
# Deployment used by \`npx convex dev\`
CONVEX_DEPLOYMENT=dev:adjective-animal-123 # team: team-name, project: project-name

VITE_CONVEX_URL=https://adjective-animal-123.convex.cloud

# Same as VITE_CONVEX_URL but ends in .site
VITE_CONVEX_SITE_URL=https://adjective-animal-123.convex.site

# Your local site URL
VITE_SITE_URL=http://localhost:3000
```

### [Create a Better Auth instance](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#create-a-better-auth-instance)

Create a Better Auth instance and initialize the component.

Some Typescript errors will show until you save the file.

convex/auth.ts

```
import { betterAuth } from 'better-auth/minimal'
import { createClient } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import authConfig from './auth.config'
import { components } from './_generated/api'
import { query } from './_generated/server'
import type { GenericCtx } from '@convex-dev/better-auth'
import type { DataModel } from './_generated/dataModel'

const siteUrl = process.env.SITE_URL!

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [\
      // The Convex plugin is required for Convex compatibility\
      convex({ authConfig }),\
    ],
  })
}

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.getAuthUser(ctx)
  },
})
```

### [Create a Better Auth client instance](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#create-a-better-auth-client-instance)

Create a Better Auth client instance for interacting with the Better Auth server from your client.

src/lib/auth-client.ts

```
import { createAuthClient } from 'better-auth/react'
import { convexClient } from '@convex-dev/better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [convexClient()],
})
```

### [Configure TanStack server utilities](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#configure-tanstack-server-utilities)

Configure a set of helper functions for authenticated SSR, server functions, and route handlers.

src/lib/auth-server.ts

```
import { convexBetterAuthReactStart } from '@convex-dev/better-auth/react-start'

export const {
  handler,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthReactStart({
  convexUrl: process.env.VITE_CONVEX_URL!,
  convexSiteUrl: process.env.VITE_CONVEX_SITE_URL!,
})
```

### [Mount handlers](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#mount-handlers)

Register Better Auth route handlers on your Convex deployment.

convex/http.ts

```
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

export default http;
```

Set up route handlers to proxy auth requests from TanStack Start to your Convex deployment.

src/routes/api/auth/$.ts

```
import { createFileRoute } from '@tanstack/react-router'
import { handler } from '~/lib/auth-server'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
})
```

### [Set up root route](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#set-up-root-route)

Wrap your application root with `ConvexBetterAuthProvider` and make auth available in loaders.

src/routes/\_\_root.tsx

```
/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from '@tanstack/react-router'
import * as React from 'react'
import { createServerFn } from '@tanstack/react-start'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import type { ConvexQueryClient } from '@convex-dev/react-query'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'
import { authClient } from '~/lib/auth-client'
import { getToken } from '~/lib/auth-server'

// Get auth information for SSR using available cookies
const getAuth = createServerFn({ method: 'GET' }).handler(async () => {
  return await getToken()
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [\
      {\
        charSet: 'utf-8',\
      },\
      {\
        name: 'viewport',\
        content: 'width=device-width, initial-scale=1',\
      },\
    ],
    links: [\
      { rel: 'stylesheet', href: appCss },\
      { rel: 'icon', href: '/favicon.ico' },\
    ],
  }),
  beforeLoad: async (ctx) => {
    const token = await getAuth()

    // all queries, mutations and actions through TanStack Query will be
    // authenticated during SSR if we have a valid token
    if (token) {
      // During SSR only (the only time serverHttpClient exists),
      // set the auth token to make HTTP queries with.
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }

    return {
      isAuthenticated: !!token,
      token,
    }
  },
  component: RootComponent,
})

function RootComponent() {
  const context = useRouteContext({ from: Route.id })
  return (
    <ConvexBetterAuthProvider
      client={context.convexQueryClient.convexClient}
      authClient={authClient}
      initialToken={context.token}
    >
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ConvexBetterAuthProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-neutral-950 text-neutral-50">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
```

### [Add route context](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#add-route-context)

Provide context from Convex to your routes, and ensure correct setup for SSR -
this may replace some existing router setup in your code.

src/routes/router.tsx

```
import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
    // You may need to install this package if you haven't already
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexProvider } from 'convex/react'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  if (typeof document !== 'undefined') {
    notifyManager.setScheduler(window.requestAnimationFrame)
  }

  const convexUrl = (import.meta as any).env.VITE_CONVEX_URL!
  if (!convexUrl) {
    throw new Error('VITE_CONVEX_URL is not set')
  }
  const convexQueryClient = new ConvexQueryClient(convexUrl)
  const convexQueryClient = new ConvexQueryClient(convexUrl, {
    expectAuth: true,
  })

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  })
  convexQueryClient.connect(queryClient)
  const router = routerWithQueryClient(
    createRouter({
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    context: { queryClient },
    context: { queryClient, convexQueryClient },
    scrollRestoration: true,
    defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
    defaultNotFoundComponent: () => <p>not found</p>,
    Wrap: ({ children }) => (
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    ),
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
```

### [You're done!](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#youre-done)

You're now ready to start using Better Auth with Convex.

## [Usage](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#usage)

Check out the [Basic Usage](https://labs.convex.dev/better-auth/basic-usage) guide for more information on general
usage. Below are usage notes specific to TanStack Start.

### [SSR with TanStack Query](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#ssr-with-tanstack-query)

Use TanStack Query's `ensureQueryData` and `useSuspenseQuery` functions to use
Convex queries in server side rendering.

A seamless initial render currently requires `expectAuth: true` in the
ConvexQueryClient constructor. This setting does not allow Convex functions to
run in the client before authentication.

src/routes/index.tsx

```
import { createFileRoute } from "@tanstack/react-router";
import { api } from "~/convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: App,
  loader: async ({ context }) => {
    await Promise.all([\
      context.queryClient.ensureQueryData(\
        convexQuery(api.auth.getCurrentUser, {})\
      ),\
      // Load multiple queries in parallel if needed\
    ]);
  },
});
```

### [Signing out with `expectAuth: true`](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#signing-out-with-expectauth-true)

The `expectAuth: true` setting only has affect before the initial
authentication. If a user signs out and signs back in, authenticated queries
will likely be called before authentication is ready, resulting in an error.

**For this reason, the current recommendation is to reload the page on sign**
**out.** For apps that redirect based on authentication, signing out is typically
all that's needed as an unauth redirect will occur after reload.

src/routes/index.tsx

```
import { authClient } from "~/lib/auth-client";

const handleSignOut = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        location.reload();
      },
    },
  },
};
```

### [Using Better Auth from the server](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#using-better-auth-from-the-server)

Better Auth's
[`auth.api` methods](https://www.better-auth.com/docs/concepts/api) would
normally run in your TanStack Start server code, but with Convex being your
backend, these methods need to run in a Convex function. The Convex function can
then be called from the client via hooks like `useMutation` or in server
functions and other server code using one of the auth-server utilities like
`fetchAuthMutation`. Authentication is handled automatically using session
cookies.

Here's an example using the `changePassword` method. The Better Auth `auth.api`
method is called inside of a Convex mutation, because we know this function
needs write access. For reads a query function can be used.

convex/users.ts

```
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

Here we call the mutation from a server action.

src/routes/users.ts

```
import { createServerFn } from "@tanstack/react-start";
import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "../../convex/_generated/api";

export const updatePassword = createServerFn({ method: "POST" }).handler(
  async ({ data: { currentPassword, newPassword } }) => {
    await fetchAuthMutation(api.users.updatePassword, {
      currentPassword,
      newPassword,
    });
  }
);
```

[Expo (React Native)\\
\\
Install and configure Convex + Better Auth for Expo.](https://labs.convex.dev/better-auth/framework-guides/expo) [Next.js\\
\\
Install and configure Convex + Better Auth for Next.js.](https://labs.convex.dev/better-auth/framework-guides/next)

### On this page

[Installation](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#installation) [Install packages](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#install-packages) [Configure Vite for SSR](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#configure-vite-for-ssr) [Register the component](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#register-the-component) [Add Convex auth config](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#add-convex-auth-config) [Set environment variables](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#set-environment-variables) [Create a Better Auth instance](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#create-a-better-auth-instance) [Create a Better Auth client instance](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#create-a-better-auth-client-instance) [Configure TanStack server utilities](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#configure-tanstack-server-utilities) [Mount handlers](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#mount-handlers) [Set up root route](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#set-up-root-route) [Add route context](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#add-route-context) [You're done!](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#youre-done) [Usage](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#usage) [SSR with TanStack Query](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#ssr-with-tanstack-query) [Signing out with `expectAuth: true`](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#signing-out-with-expectauth-true) [Using Better Auth from the server](https://labs.convex.dev/better-auth/framework-guides/tanstack-start#using-better-auth-from-the-server)
