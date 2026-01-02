# Epic 1: Authentication & Onboarding

**User Outcome:** Users can sign up, sign in, complete their profile, select their role, and access their role-specific dashboard.

**FRs covered:** FR1 (Authentication), FR2 (User Profiles & Roles), FR10 (RBAC - partial)

**Scope:**

- Better Auth + Convex integration
- Sign-up page (email/password)
- Sign-in page (email/password)
- Email verification flow
- Onboarding wizard (profile + role selection)
- Role-based route protection (TanStack Router guards)
- Role-based dashboard routing

**Standalone:** ✅ Complete auth system that works independently.

**Technical Decisions:**

- **Forms:** Using TanStack Form (see ADR-001) for all form implementations
- **Validation:** Zod schemas for client-side validation
- **UI Components:** Field components for accessibility

---

### Story 1.1a: Better Auth Server Configuration

**As a** Developer,
**I want** to configure the Better Auth server with Convex adapter,
**So that** authentication is integrated with our database.

**Acceptance Criteria:**

- **Given** the Better Auth documentation and tech reference
- **When** I create `lib/auth.ts`
- **Then** `betterAuth()` must be configured with:
  - Convex adapter for user/session storage
  - `tanstackStartCookies` plugin for cookie handling
  - Email/password provider enabled
- **And** `authClient` must be exported for frontend use.
- **And** the server must start without errors.

### Story 1.1b: Auth API Route Mounting

**As a** Developer,
**I want** to mount the Better Auth handler to API routes,
**So that** authentication endpoints are accessible.

**Acceptance Criteria:**

- **Given** the auth config from Story 1.1a
- **When** I create `/api/auth/$` route handler
- **Then** GET and POST requests to `/api/auth/*` must be handled by `auth.handler(request)`.
- **And** visiting `/api/auth/sign-in` must not return a 404.

### Story 1.1c: Convex Session Verification

**As a** Developer,
**I want** Convex functions to verify Better Auth sessions,
**So that** backend calls are properly authenticated.

**Acceptance Criteria:**

- **Given** the auth wrappers from Story 0.4
- **When** I implement session verification in `convex/auth.ts`
- **Then** an action must exist that validates the session cookie from request headers.
- **And** the `authenticatedQuery` wrapper must use this action to get the current user.
- **And** calling an authenticated query without a valid session must throw "Not authenticated".

### Story 1.2: Sign Up with Email/Password

**As a** New Client,
**I want** to create an account using my email and password,
**So that** I can start using the PrimeEditz platform.

**Acceptance Criteria:**

- **Given** the `/auth/sign-up` route
- **When** I submit my email and password
- **Then** a new user record must be created in Convex via Better Auth.
- **And** a **toast notification** must inform me: "Account created! Please complete your profile."
- **And** I must be redirected to the `/onboarding` route upon success.

**Note:** Email verification is mocked for MVP (toast only, no actual email).

### Story 1.3: Sign In with Email & Password

**As a** Returning User,
**I want** to log in to my existing account,
**So that** I can access my dashboard and projects.

**Acceptance Criteria:**

- **Given** the `/auth/sign-in` route
- **When** I enter valid credentials
- **Then** a secure session cookie must be set.
- **And** I must be redirected to the appropriate dashboard based on my role.
- **And** invalid credentials must show a clear, user-friendly error message.

### Story 1.4: Profile Onboarding Flow

**As a** New User,
**I want** to complete my profile after my first sign-up,
**So that** the system can tailor my experience correctly.

**Acceptance Criteria:**

- **Given** a new user with no profile record
- **When** I navigate to the `/onboarding` route
- **Then** I must enter my Full Name and Phone number.
- **And** my role must be automatically set to `client` (no role selection UI).
- **And** upon submission, a profile record must be created in Convex.
- **And** I must be redirected to the Client dashboard.

**First Admin Bootstrap:**

- **Given** the `profiles` table is empty (first user ever)
- **When** the first user completes onboarding
- **Then** their role must be set to `admin` instead of `client`.

### Story 1.5: Route Protection & Auth Middleware

**As a** Studio Manager,
**I want** to ensure that unauthorized users cannot access protected data,
**So that** our business data remains secure.

**Acceptance Criteria:**

- **Given** the `(protected)` route group in TanStack Router
- **When** an unauthenticated user attempts to visit a protected route
- **Then** the `authMiddleware` must redirect them to `/auth/sign-in`.
- **And** users without a profile must be redirected to `/onboarding`.
- **And** authenticated users must only see routes matching their role (e.g., Client cannot see `/admin/*`).

**Dependency:** Requires Story 1.4 (profile exists with role) to be completed first.
