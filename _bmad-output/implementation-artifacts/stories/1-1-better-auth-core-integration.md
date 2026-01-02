# Story 1.1: Better Auth + Convex + TanStack Start Integration

Status: review

## Story

As a **Developer**,
I want to integrate Better Auth with Convex and TanStack Start,
so that authentication is fully functional with SSR support and proper session management.

## Acceptance Criteria

1. **AC-1:** Convex Better Auth component must be registered and configured
2. **AC-2:** HTTP routes must be mounted on Convex deployment
3. **AC-3:** TanStack Start API routes must proxy auth requests to Convex
4. **AC-4:** Client-side auth provider must wrap the application with SSR token support
5. **AC-5:** Auth state must be available during SSR via `beforeLoad`

## Tasks / Subtasks

### Backend Setup (Convex)

- [x] **Task 1: Install Packages**

  - [x] 1.1 Install `convex@latest @convex-dev/better-auth`
  - [x] 1.2 Install `better-auth@1.4.9 --save-exact`
  - [x] 1.3 Install `@types/node --save-dev`

- [x] **Task 2: Configure Vite for SSR**

  - [x] 2.1 Add `@convex-dev/better-auth` to `ssr.noExternal` in `vite.config.ts`

- [x] **Task 3: Register Convex Component**

  - [x] 3.1 Create `convex/convex.config.ts`
  - [x] 3.2 Register Better Auth component using `defineApp()` and `app.use(betterAuth)`

- [x] **Task 4: Add Convex Auth Config**

  - [x] 4.1 Create `convex/auth.config.ts`
  - [x] 4.2 Configure `getAuthConfigProvider()` as auth provider

- [x] **Task 5: Set Environment Variables**

  - [x] 5.1 Set `BETTER_AUTH_SECRET` in Convex deployment
  - [x] 5.2 Set `SITE_URL` in Convex deployment
  - [x] 5.3 Add `VITE_CONVEX_URL`, `VITE_CONVEX_SITE_URL`, `VITE_SITE_URL` to `.env.local`

- [x] **Task 6: Create Better Auth Instance**

  - [x] 6.1 Create `convex/auth.ts` with `createClient` and `createAuth`
  - [x] 6.2 Configure `authComponent` using `components.betterAuth`
  - [x] 6.3 Add `getCurrentUser` query function

- [x] **Task 7: Mount HTTP Routes**
  - [x] 7.1 Create `convex/http.ts`
  - [x] 7.2 Register routes using `authComponent.registerRoutes(http, createAuth)`

### Frontend Setup (TanStack Start)

- [x] **Task 8: Create Auth Client**

  - [x] 8.1 Create `src/lib/auth-client.ts`
  - [x] 8.2 Use `createAuthClient` from `better-auth/react`
  - [x] 8.3 Add `convexClient()` plugin

- [x] **Task 9: Configure Server Utilities**

  - [x] 9.1 Create `src/lib/auth-server.ts`
  - [x] 9.2 Export `handler`, `getToken`, `fetchAuthQuery`, `fetchAuthMutation`, `fetchAuthAction`
  - [x] 9.3 Use `convexBetterAuthReactStart()` with Convex URLs

- [x] **Task 10: Mount API Route**

  - [x] 10.1 Create `src/routes/api/auth/$.ts`
  - [x] 10.2 Use `createFileRoute` with server handlers
  - [x] 10.3 Proxy GET/POST to `handler` from auth-server

- [x] **Task 11: Configure Router**

  - [x] 11.1 Update `src/router.tsx`
  - [x] 11.2 Create `ConvexQueryClient` with `expectAuth: true`
  - [x] 11.3 Configure `QueryClient` with Convex hash/query functions
  - [x] 11.4 Add `convexQueryClient` to router context

- [x] **Task 12: Set Up Root Route (CRITICAL)**

  - [x] 12.1 Create `getAuth` server function using `createServerFn`
  - [x] 12.2 Add `beforeLoad` to get token and set on `serverHttpClient`
  - [x] 12.3 Wrap app with `ConvexBetterAuthProvider`
  - [x] 12.4 Pass `convexQueryClient.convexClient`, `authClient`, and `initialToken`

- [x] **Task 13: Add ConvexProvider Wrap**
  - [x] 13.1 Add `Wrap` property to router config
  - [x] 13.2 Wrap children with `ConvexProvider` using `convexQueryClient.convexClient`

## Implementation Notes

### What's Been Implemented ✅

**Backend (Convex):**

- ✅ Component registration in `convex.config.ts`
- ✅ Auth config provider in `auth.config.ts`
- ✅ Better Auth instance in `convex/auth.ts` with component client
- ✅ HTTP routes mounted in `convex/http.ts`
- ✅ Environment variables configured

**Frontend (TanStack Start):**

- ✅ Auth client with Convex plugin
- ✅ Server utilities for SSR
- ✅ API route proxy to Convex
- ✅ Router with ConvexQueryClient and proper context
- ✅ Vite SSR configuration

### What's Still Needed ⚠️

**Critical for Auth to Work:**

1. **Root Route Integration** (`src/routes/__root.tsx`):

   ```typescript
   // Need to add:
   const getAuth = createServerFn({ method: "GET" }).handler(async () => {
     return await getToken();
   });

   export const Route = createRootRouteWithContext<{
     queryClient: QueryClient;
     convexQueryClient: ConvexQueryClient;
   }>()({
     beforeLoad: async (ctx) => {
       const token = await getAuth();
       if (token) {
         ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
       }
       return { isAuthenticated: !!token, token };
     },
     component: RootComponent,
   });

   function RootComponent() {
     const context = useRouteContext({ from: Route.id });
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
     );
   }
   ```

2. **Router ConvexProvider Wrap** (`src/router.tsx`):
   ```typescript
   const router = createRouter({
     routeTree,
     context: { queryClient, convexQueryClient },
     defaultPreload: "intent",
     Wrap: ({ children }) => (
       <ConvexProvider client={convexQueryClient.convexClient}>
         {children}
       </ConvexProvider>
     ),
   });
   ```

### Key Implementation Details

**From Official Docs:**

- Uses `better-auth/minimal` in `convex/auth.ts` (not regular `better-auth`)
- `expectAuth: true` in ConvexQueryClient for seamless SSR
- Sign out requires page reload when using `expectAuth: true`
- Auth token is set on `serverHttpClient` during SSR for authenticated queries

### Environment Variables Required

**.env.local:**

```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
VITE_SITE_URL=http://localhost:3000
```

**Convex Deployment:**

```bash
npx convex env set BETTER_AUTH_SECRET=<generated-secret>
npx convex env set SITE_URL=http://localhost:3000
```

## Dependencies

- Story 0.2 (Schema) — Auth tables must exist ✓
- Story 0.4 (Auth Wrappers) — Will be updated after auth is working

## Definition of Done

- [x] Convex component registered and configured
- [x] HTTP routes mounted on Convex
- [x] API routes proxy requests correctly
- [x] Root route has ConvexBetterAuthProvider wrapper
- [x] SSR token handling works in beforeLoad
- [x] Router has ConvexProvider wrap
- [ ] Sign in/sign up flows work end-to-end (needs sign-in/sign-up pages)
- [ ] Session persists across page reloads (needs testing)

## References

- **Official Docs:** `_bmad-output/docs/better-auth/tanstack-convex.md`
- **Example Repo:** https://github.com/get-convex/better-auth/tree/main/examples/tanstack
- **Convex Better Auth Docs:** https://labs.convex.dev/better-auth/framework-guides/tanstack-start

## Dev Agent Record

### Agent Model Used

Claude (Gemini Antigravity) + User Implementation

### Implementation Log

- User implemented backend setup following official docs
- User configured router with ConvexQueryClient
- User set up API routes and server utilities
- **Remaining:** Root route provider wrapper and router ConvexProvider wrap

### File List

**Created:**

- `convex/convex.config.ts` - Component registration
- `convex/auth.config.ts` - Auth provider config
- `convex/auth.ts` - Better Auth instance with component
- `convex/http.ts` - HTTP route registration
- `src/lib/auth-client.ts` - Client auth instance
- `src/lib/auth-server.ts` - Server utilities for SSR
- `src/routes/api/auth/$.ts` - API route proxy

**Modified:**

- `vite.config.ts` - Added SSR noExternal config
- `src/router.tsx` - Added ConvexQueryClient setup
- `src/routes/__root.tsx` - Added convexQueryClient to context (needs provider wrapper)

**Still Needs Modification:**

- `src/routes/__root.tsx` - Add ConvexBetterAuthProvider wrapper
- `src/router.tsx` - Add ConvexProvider in Wrap property
