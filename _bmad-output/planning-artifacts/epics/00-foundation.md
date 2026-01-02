# Epic 0: Project Foundation

**User Outcome:** Development environment is ready with all infrastructure in place for building the application.

**FRs covered:** AR1 (Infrastructure), AR2 (Development), AR3 (Code Organization)

**Scope:**

- Convex backend setup with Docker + PostgreSQL
- MinIO storage configuration
- TanStack Start project structure verification
- Tailwind CSS v4 + shadcn/ui configuration
- Convex schema with core tables (users, events, sessions, quotations, folders, assets)
- Auth wrapper utilities (convex-helpers)
- Basic layout components (AppShell, Sidebar, Header)

**Standalone:** ✅ Complete foundation that enables all subsequent epics.

---

### Story 0.1: Project Infrastructure & Environment Setup

**As a** Developer,
**I want** to configure the development environment with Convex Cloud and existing MinIO,
**So that** I have a stable foundation for building feature logic.

**Acceptance Criteria:**

- **Given** the repository with existing scaffolding
- **When** I configure the environment
- **Then** Convex Cloud must be connected via `CONVEX_DEPLOYMENT` and `CONVEX_URL` in `.env.local`.
- **And** MinIO connection (already on Dokploy) must be configured via `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`.
- **And** `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` must be set.
- **And** `pnpm dev` must start the application without errors.

### Story 0.2: Core v3.0 Project-Centric Schema

**As a** Developer,
**I want** to define the complete database schema for the v3.0 project-centric model,
**So that** all data structures are in place from the beginning.

**Acceptance Criteria:**

- **Given** an empty or placeholder `convex/schema.ts`
- **When** I define the schema using Convex `v` validators
- **Then** tables must exist for:
  - **Auth tables:** `users`, `sessions`, `accounts`, `verifications` (Better Auth)
  - **Core tables:** `profiles`, `projects`, `project_types`, `stages`, `quotations`
  - **Asset tables:** `folders`, `assets`, `deliverables`
  - **Audit table:** `status_history`
- **And** `projects` table must include a `source` field (`client_request` vs `admin_init`).
- **And** relevant indexes must be created for `by_userId`, `by_projectId`, `by_status`, `by_clientId`.

### Story 0.3a: Base App Shell with Sidebar & Header

**As a** User,
**I want** a responsive application shell with a sidebar and header,
**So that** I can navigate the platform consistently across mobile and desktop.

**Acceptance Criteria:**

- **Given** the TanStack Start routing setup
- **When** I implement the root layout in `__root.tsx` using Tailwind CSS v4 and shadcn/ui
- **Then** a persistent Sidebar must be visible on desktop and collapsible on mobile.
- **And** the Header must include a placeholder for user context (to be implemented in Story 0.3b).
- **And** the layout must use CSS variables for theming (dark mode default).

### Story 0.3b: Breadcrumb System & User Menu

**As a** User,
**I want** breadcrumb navigation and a user profile menu,
**So that** I always know where I am and can access my account settings.

**Acceptance Criteria:**

- **Given** the app shell from Story 0.3a and auth context from Epic 1
- **When** I navigate to any route
- **Then** the Breadcrumb must display the current route hierarchy using TanStack Router's route matching.
- **And** the User Menu must show: User Name, Role Badge, and Sign Out option.
- **And** clicking Sign Out must clear the session and redirect to `/auth/sign-in`.

**Dependency:** Requires Story 1.1c (auth context) to be completed first.

### Story 0.4: Convex Helper Utilities & Auth Wrappers

**As a** Developer,
**I want** to implement custom Convex wrappers like `authenticatedQuery` and `adminMutation`,
**So that** I can enforce security patterns at the API level easily.

**Acceptance Criteria:**

- **Given** the `convex/lib/customFunctions.ts` file
- **When** I implement wrappers using `convex-helpers`
- **Then** `authenticatedQuery` must call an auth action that validates the session cookie and returns the user identity.
- **And** `adminMutation` must explicitly check `role === 'admin'` in the user's profile.
- **And** unauthorized access must throw a descriptive error: "Not authenticated" or "Access denied".
