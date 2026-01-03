# Story 1.5: Route Protection with Next.js 16 Proxy

Status: backlog

## Story

As a **Studio Manager**,
I want to ensure unauthorized users cannot access protected data,
So that our business data remains secure.

## Acceptance Criteria

1. **AC-1:** `proxy.ts` file exists at project root for auth protection
2. **AC-2:** Unauthenticated users visiting protected routes are redirected to `/auth/sign-in`
3. **AC-3:** Authenticated users without a profile are redirected to `/onboarding`
4. **AC-4:** Protected route groups defined: `(protected)` for role-gated content
5. **AC-5:** Cookie-based session check in proxy for fast route protection
6. **AC-6:** Server-side verification for full security on page load

## Tasks / Subtasks

### Task 1: Create Next.js Proxy File (AC: 1, 2)

- [ ] 1.1 Create `proxy.ts` at project root
- [ ] 1.2 Import `getSessionCookie` from `better-auth/cookies`
- [ ] 1.3 Define matcher for protected routes
- [ ] 1.4 Redirect to `/auth/sign-in` if no session cookie

### Task 2: Define Protected Route Group (AC: 4)

- [ ] 2.1 Create `src/app/(protected)/layout.tsx`
- [ ] 2.2 Add server-side auth check in layout
- [ ] 2.3 Fetch user profile in layout for role verification

### Task 3: Profile Check Logic (AC: 3)

- [ ] 3.1 In protected layout, check if user has profile
- [ ] 3.2 If no profile exists → redirect to `/onboarding`
- [ ] 3.3 Pass profile data to child routes via context or props

### Task 4: Update Route Matchers (AC: 5)

- [ ] 4.1 Configure proxy matcher to cover:
  - `/client/*`
  - `/admin/*`
  - `/employee/*`
  - `/onboarding`
- [ ] 4.2 Exclude from proxy:
  - `/auth/*`
  - `/api/*`
  - `/_next/*`
  - Static assets

## Dev Notes

### Next.js 16 Proxy Pattern

From the documentation, Next.js 16 replaces middleware with proxy:

```typescript
// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/client/:path*",
    "/admin/:path*",
    "/employee/:path*",
    "/onboarding",
  ],
};
```

### Two-Layer Protection

1. **Proxy (Fast, Cookie Check):**

   - Runs on every request to matched routes
   - Only checks if session cookie exists (fast)
   - Redirects unauthenticated users immediately

2. **Protected Layout (Full Verification):**
   - Server Component that fetches actual user data
   - Verifies session is valid with database
   - Checks if profile exists and is complete
   - Passes user/profile data to children

### Protected Layout Pattern

```tsx
// app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { isAuthenticated, fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

export default async function ProtectedLayout({ children }) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/auth/sign-in");
  }

  const profile = await fetchAuthQuery(api.profiles.queries.getMyProfile);

  if (!profile) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
```

### Route Structure

```
app/
├── (auth)/                  ← Public auth routes
├── (protected)/             ← Auth-required routes
│   ├── layout.tsx           ← Auth check + profile fetch
│   ├── @admin/              ← Admin parallel slot (Story 1.6)
│   ├── @client/             ← Client parallel slot (Story 1.6)
│   └── @employee/           ← Employee parallel slot (Story 1.6)
├── onboarding/              ← Needs auth but not profile
└── proxy.ts                 ← Cookie check
```

### References

- [Source: _bmad-output/docs/nextjs/proxy-betterauth.md]
- [Source: _bmad-output/docs/nextjs/betterauth-convex.md#auth-server]

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Completion Notes List

(To be filled by dev agent)

### File List

(To be filled by dev agent)
