## Usage

Check out the [Basic Usage](https://convex-better-auth.netlify.app/basic-usage)
guide for more information on general usage. Below are usage notes specific to
Next.js.

### SSR with server components

Convex queries can be preloaded in server components and rendered in client
components via `preloadAuthQuery` and `usePreloadedAuthQuery`.

Preloading in a server component:

```tsx title="app/(auth)/(dashboard)/page.tsx"
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

const Page = async () => {
  const [preloadedUserQuery] = await Promise.all([
    preloadAuthQuery(api.auth.getCurrentUser),
    // Load multiple queries in parallel if needed
  ]);

  return (
    <div>
      <Header preloadedUserQuery={preloadedUserQuery} />
    </div>
  );
};

export default Page;
```

Rendering preloaded data in a client component:

```tsx title="app/(auth)/(dashboard)/header.tsx"
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { api } from "@/convex/_generated/api";

export const Header = ({
  preloadedUserQuery,
}: {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}) => {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
  return (
    <div>
      <h1>{user?.name}</h1>
    </div>
  );
};

export default Header;
```

### Using Better Auth in server code

Better Auth's
[`auth.api` methods](https://www.better-auth.com/docs/concepts/api) would
normally run in your Next.js server code, but with Convex being your backend,
these methods need to run in a Convex function. The Convex function can then be
called from the client via hooks like `useMutation` or in server functions and
other server code using one of the auth-server utilities like
`fetchAuthMutation`. Authentication is handled automatically using session
cookies.

Here's an example using the `changePassword` method. The Better Auth `auth.api`
method is called inside of a Convex mutation, because we know this function
needs write access. For reads a query function can be used.

```ts title="convex/users.ts"
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

```ts title="app/actions.ts"
"use server";

import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "../convex/_generated/api";

// Authenticated mutation via server function
export async function updatePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  await fetchAuthMutation(api.users.updatePassword, {
    currentPassword,
    newPassword,
  });
}
```
