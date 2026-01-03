# Convex Integration

Integrate Better Auth with Convex.

---

title: Convex Integration
description: Integrate Better Auth with Convex.

---

<Callout>
  This section is adapted from the [Convex + Better Auth guide](https://convex-better-auth.netlify.app/),
  for more information, please refer to their documentation.
</Callout>

## Prerequisites

<Steps>
  <Step>
    ### Create a Convex project

    To use Convex + Better Auth, you'll first need a [Convex](https://www.convex.dev/) project.
    If you don't have one, run the following command to get started.

    <CodeBlockTabs defaultValue="npm">
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npm create convex@latest
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm create convex
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn create convex
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bunx create-convex
        ```
      </CodeBlockTab>
    </CodeBlockTabs>

    Check out the [Convex docs](https://docs.convex.dev/home) to learn more about Convex.

  </Step>

  <Step>
    ### Run `convex dev`

    Running the CLI during setup will initialize your Convex deployment
    if it doesn't already exist, and keeps generated types current through the process. Keep it running.

    <CodeBlockTabs defaultValue="npm">
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npx convex dev
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm dlx convex dev
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn dlx convex dev
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun x convex dev
        ```
      </CodeBlockTab>
    </CodeBlockTabs>

  </Step>
</Steps>

## Installation of Convex + Better Auth

The following documentation assumes you're using Next.js.

If you're not using Next.js, support for other frameworks is documented in the [installation guide by Convex](https://convex-better-auth.netlify.app/#select-your-framework).

<Callout>
  For a complete example, check out Convex + Better Auth example with Next.js [on GitHub](https://github.com/get-convex/better-auth/tree/main/examples/next).
</Callout>

### Installation

<Steps>
  <Step>
    #### Install packages

    Install the component and Better Auth. Ensure you use version `1.25.0` or later of Convex.

    <CodeBlockTabs defaultValue="npm">
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npm install better-auth
        npm install convex@latest @convex-dev/better-auth
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm add better-auth
        pnpm add convex@latest @convex-dev/better-auth
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn add better-auth
        yarn add convex@latest @convex-dev/better-auth
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun add better-auth
        bun add convex@latest @convex-dev/better-auth
        ```
      </CodeBlockTab>
    </CodeBlockTabs>

  </Step>

  <Step>
    #### Register the component

    Register the Better Auth component in your Convex project.

    ```ts title="convex/convex.config.ts"
    import { defineApp } from "convex/server";
    import betterAuth from "@convex-dev/better-auth/convex.config";

    const app = defineApp();
    app.use(betterAuth);

    export default app;
    ```

  </Step>

  <Step>
    #### Add Convex auth config

    Add a `convex/auth.config.ts` file to configure Better Auth as an authentication provider.

    ```ts title="convex/auth.config.ts"
    import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
    import type { AuthConfig } from "convex/server";

    export default {
        providers: [getAuthConfigProvider()],
    } satisfies AuthConfig;
    ```

  </Step>

  <Step>
    #### Set environment variables

    Generate a secret for encryption and generating hashes. Use the command below if you have openssl installed, or generate your own however you like.

    <CodeBlockTabs defaultValue="npm">
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm dlx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn dlx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun x convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
        ```
      </CodeBlockTab>
    </CodeBlockTabs>

    Add your site URL to your Convex deployment.

    <CodeBlockTabs defaultValue="npm">
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="npm">
          npm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="pnpm">
          pnpm
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="yarn">
          yarn
        </CodeBlockTabsTrigger>

        <CodeBlockTabsTrigger value="bun">
          bun
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>

      <CodeBlockTab value="npm">
        ```bash
        npx convex env set SITE_URL http://localhost:3000
        ```
      </CodeBlockTab>

      <CodeBlockTab value="pnpm">
        ```bash
        pnpm dlx convex env set SITE_URL http://localhost:3000
        ```
      </CodeBlockTab>

      <CodeBlockTab value="yarn">
        ```bash
        yarn dlx convex env set SITE_URL http://localhost:3000
        ```
      </CodeBlockTab>

      <CodeBlockTab value="bun">
        ```bash
        bun x convex env set SITE_URL http://localhost:3000
        ```
      </CodeBlockTab>
    </CodeBlockTabs>

    Add environment variables to the `.env.local` file created by `npx convex dev`.
    It will be picked up by your framework dev server.

    ```shell title=".env.local" tab="Cloud"
    # Deployment used by \`npx convex dev\`
    CONVEX_DEPLOYMENT=dev:adjective-animal-123 # team: team-name, project: project-name

    NEXT_PUBLIC_CONVEX_URL=https://adjective-animal-123.convex.cloud

    # Same as NEXT_PUBLIC_CONVEX_URL but ends in .site // [!code ++]
    NEXT_PUBLIC_CONVEX_SITE_URL=https://adjective-animal-123.convex.site # [!code ++]

    # Your local site URL // [!code ++]
    NEXT_PUBLIC_SITE_URL=http://localhost:3000 # [!code ++]
    ```

    ```shell title=".env.local" tab="Self hosted"
    # Deployment used by \`npx convex dev\`
    CONVEX_DEPLOYMENT=dev:adjective-animal-123 # team: team-name, project: project-name

    NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210

    # Will generally be one number higher than NEXT_PUBLIC_CONVEX_URL,
    # so if your convex url is :3212, your site url will be :3213
    NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211 # [!code ++]

    # Your local site URL // [!code ++]
    NEXT_PUBLIC_SITE_URL=http://localhost:3000 # [!code ++]
    ```

  </Step>

  <Step>
    ### Create a Better Auth instance

    Create a Better Auth instance and initialize the component.

    <Callout>Some TypeScript errors will show until you save the file.</Callout>

    ```ts title="convex/auth.ts"
    import { createClient, type GenericCtx } from "@convex-dev/better-auth";
    import { convex } from "@convex-dev/better-auth/plugins";
    import { components } from "./_generated/api";
    import { DataModel } from "./_generated/dataModel";
    import { query } from "./_generated/server";
    import { betterAuth } from "better-auth";
    import authConfig from "./auth.config";

    const siteUrl = process.env.SITE_URL!;

    // The component client has methods needed for integrating Convex with Better Auth,
    // as well as helper methods for general use.
    export const authComponent = createClient<DataModel>(components.betterAuth);

    export const createAuth = (ctx: GenericCtx<DataModel>) => {
        return betterAuth({
            baseURL: siteUrl,
            database: authComponent.adapter(ctx),
            // Configure simple, non-verified email/password to get started
            emailAndPassword: {
                enabled: true,
                requireEmailVerification: false,
            },
            plugins: [
                // The Convex plugin is required for Convex compatibility
                convex({ authConfig }),
            ],
        });
    };

    // Example function for getting the current user
    // Feel free to edit, omit, etc.
    export const getCurrentUser = query({
        args: {},
        handler: async (ctx) => {
            return authComponent.getAuthUser(ctx);
        },
    });
    ```

  </Step>

  <Step>
    ### Create a Better Auth client instance

    Create a Better Auth client instance for interacting with the Better Auth server from your client.

    ```ts title="src/lib/auth-client.ts"
    import { createAuthClient } from "better-auth/react";
    import { convexClient } from "@convex-dev/better-auth/client/plugins";

    export const authClient = createAuthClient({
        plugins: [convexClient()],
    });
    ```

  </Step>

  <Step>
    ### Configure Next.js server utilities

    Configure a set of helper functions for authenticated SSR, server functions, and route handlers.

    ```ts title="src/lib/auth-server.ts"
    import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

    export const {
        handler,
        preloadAuthQuery,
        isAuthenticated,
        getToken,
        fetchAuthQuery,
        fetchAuthMutation,
        fetchAuthAction,
    } = convexBetterAuthNextJs({
        convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
        convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
    });
    ```

  </Step>

  <Step>
    ### Mount handlers

    Register Better Auth route handlers on your Convex deployment.

    ```ts title="convex/http.ts"
    import { httpRouter } from "convex/server";
    import { authComponent, createAuth } from "./auth";

    const http = httpRouter();

    authComponent.registerRoutes(http, createAuth);

    export default http;
    ```

    Set up route handlers to proxy auth requests from your framework server to your Convex deployment.

    ```ts title="app/api/auth/[...all]/route.ts"
    import { handler } from "@/lib/auth-server";

    export const { GET, POST } = handler;
    ```

  </Step>

  <Step>
    ### Set up Convex client provider

    Wrap your app with the `ConvexBetterAuthProvider` component.

    ```tsx title="app/ConvexClientProvider.tsx"
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

  </Step>
</Steps>

### You're done!

You're now ready to start using Better Auth with Convex.
