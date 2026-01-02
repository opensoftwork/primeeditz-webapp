## Project Structure & Boundaries

### Complete Project Directory Structure

```
primeeditz-tanstack-webapp/
│
├── README.md                        # Project documentation
├── package.json                     # Dependencies (pnpm)
├── pnpm-lock.yaml                   # Lock file
├── tsconfig.json                    # TypeScript config
├── biome.json                       # Linting & formatting
├── tailwind.config.ts               # Tailwind CSS v4 config
├── vite.config.ts                   # Vite config (TanStack Start)
├── .env.local                       # Local environment (gitignored)
├── .env.example                     # Environment template
├── .gitignore
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # Build + lint + typecheck
│       └── deploy.yml               # Cloudflare Pages deploy
│
├── docker-compose.yml               # Local dev: Convex + PostgreSQL + MinIO
├── docker-compose.prod.yml          # Production stack
│
├── convex/                          # 🔷 CONVEX BACKEND
│   ├── _generated/                  # Auto-generated (DO NOT EDIT)
│   ├── schema.ts                    # All table definitions (~200 lines)
│   ├── convex.config.ts             # Better Auth component
│   ├── http.ts                      # HTTP routes (auth)
│   │
│   ├── lib/                         # Shared utilities
│   │   ├── customFunctions.ts       # Auth wrappers (CRITICAL)
│   │   ├── validators.ts            # Reusable validators
│   │   ├── storage.ts               # MinIO signed URL helpers
│   │   └── helpers.ts               # formatCode, timestamps
│   │
│   ├── model/                       # Business logic helpers
│   │   ├── events.ts                # generateEventCode, validateOwnership
│   │   └── quotations.ts            # calculateTotal, applyGST
│   │
│   └── functions/                   # Public API
│       ├── users/
│       │   ├── queries.ts
│       │   ├── mutations.ts
│       │   └── internal.ts
│       ├── events/
│       │   ├── queries.ts
│       │   ├── mutations.ts
│       │   └── internal.ts
│       ├── sessions/
│       │   ├── queries.ts
│       │   ├── mutations.ts
│       │   └── internal.ts
│       ├── quotations/
│       │   ├── queries.ts
│       │   ├── mutations.ts
│       │   └── internal.ts
│       ├── assets/
│       │   ├── queries.ts
│       │   ├── mutations.ts
│       │   └── actions.ts           # MinIO signed URLs
│       └── config/
│           ├── eventTypes.ts
│           ├── folderTemplates.ts
│           ├── quotationTemplates.ts
│           └── storageTiers.ts
│
├── src/                             # 🔶 TANSTACK START FRONTEND
│   ├── start.ts                     # TanStack Start entry
│   ├── router.tsx                   # Router configuration
│   ├── routeTree.gen.ts             # Auto-generated route tree
│   ├── env.ts                       # Environment variables
│   │
│   ├── routes/                      # File-based routing
│   │   ├── __root.tsx               # Root layout + providers
│   │   ├── index.tsx                # Landing page
│   │   ├── unauthorized.tsx         # Unauthorized access page
│   │   │
│   │   ├── api/                     # API routes
│   │   │   └── auth/
│   │   │       └── $.ts             # Better Auth API handler
│   │   │
│   │   ├── auth/                    # Public auth routes
│   │   │   ├── sign-in.tsx
│   │   │   ├── sign-up.tsx
│   │   │   └── forgot-password.tsx
│   │   │
│   │   └── _authed/                 # Authenticated routes (layout route)
│   │       ├── _authed.tsx          # Auth layout with route protection
│   │       ├── onboarding.tsx       # First-time user setup
│   │       │
│   │       ├── client/              # Client portal
│   │       │   ├── dashboard.tsx    # ✅ Implemented
│   │       │   ├── projects/
│   │       │   │   ├── new.tsx      # ✅ 5-step wizard (thin route)
│   │       │   │   ├── index.tsx    # (TODO) Project listing
│   │       │   │   └── $projectId.tsx  # (TODO) Project detail
│   │       │   └── profile.tsx      # (TODO) User profile
│   │       │
│   │       ├── admin/               # Admin portal
│   │       │   ├── dashboard.tsx    # ✅ Implemented
│   │       │   ├── projects/        # (TODO) Admin project management
│   │       │   │   ├── index.tsx
│   │       │   │   └── $projectId.tsx
│   │       │   ├── quotations/      # (TODO) Quotation management
│   │       │   │   └── $quotationId.tsx
│   │       │   ├── clients/         # (TODO) Client management
│   │       │   │   └── index.tsx
│   │       │   └── settings/        # (TODO) System configuration
│   │       │       ├── project-types.tsx
│   │       │       ├── folder-templates.tsx
│   │       │       └── quotation-templates.tsx
│   │       │
│   │       └── employee/            # Employee portal
│   │           ├── dashboard.tsx    # ✅ Implemented
│   │           └── work/            # (TODO) Assigned work
│   │               └── index.tsx
│   │
│   ├── components/                  # React components (Clean Architecture)
│   │   ├── ui/                      # shadcn/ui primitives (minimal changes)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── drawer.tsx
│   │   │   └── ...
│   │   ├── shared/                  # Shared reusable components
│   │   │   ├── wizard/              # Multi-step wizard components
│   │   │   │   ├── step-indicator.tsx  # ✅ Implemented
│   │   │   │   └── index.ts
│   │   │   ├── image-viewer/        # Image viewing components
│   │   │   │   ├── image-slider.tsx    # ✅ Implemented
│   │   │   │   └── index.ts
│   │   │   ├── status-badge.tsx     # (TODO) Project status badges
│   │   │   ├── upload-dropzone.tsx  # (TODO) File upload dropzone
│   │   │   └── progress-stages.tsx  # (TODO) Stage progress indicator
│   │   │
│   │   ├── modules/                 # Feature modules (Container pattern)
│   │   │   ├── projects/            # Project feature module
│   │   │   │   ├── wizard/          # ✅ Implemented
│   │   │   │   │   ├── project-wizard.tsx
│   │   │   │   │   ├── project-wizard-loading.tsx
│   │   │   │   │   ├── project-wizard-error.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── detail/          # (TODO) Project detail view
│   │   │   │   ├── list/            # (TODO) Project listing
│   │   │   │   ├── project-card.tsx # (TODO) Project card component
│   │   │   │   └── index.ts
│   │   │   ├── quotations/          # (TODO) Quotation feature module
│   │   │   └── assets/              # (TODO) Asset management module
│   │   ├── layout/                  # App layout components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── app-layout.tsx
│   │   │   └── index.ts
│   │   ├── auth/                    # Auth form components
│   │   │   ├── sign-in.tsx
│   │   │   └── sign-up.tsx
│   │   ├── onboarding/              # Onboarding components
│   │   │   └── onboarding-form.tsx
│   │   └── errors/                  # Error boundary components
│   │       ├── error-boundary.tsx
│   │       ├── not-found.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                       # Custom hooks
│   │   ├── usePermissions.ts        # Role-based permission checks
│   │   ├── useFileUploader.ts       # File upload state management
│   │   └── use-mobile.ts            # Mobile detection
│   │
│   ├── utils/                       # Utility functions
│   │   ├── auth.ts                  # canAccessRoleRoute, getDashboardPath
│   │   └── file.ts                  # formatFileSize, getFileType
│   │
│   ├── lib/                         # Framework integrations
│   │   ├── auth.ts                  # Better Auth main config
│   │   ├── auth-client.ts           # Client-side auth helper
│   │   ├── auth-server.ts           # Server-side auth helper
│   │   └── utils.ts                 # cn(), misc utilities
│   │
│   ├── middleware/                  # Route middleware
│   │   └── auth.ts                  # Auth middleware
│   │
│   ├── integrations/                # Third-party integrations
│   │   ├── convex/
│   │   │   └── provider.tsx         # Convex React provider
│   │   └── tanstack-query/
│   │       └── root-provider.tsx
│   │
│   └── styles/
│       └── globals.css              # OKLCH tokens, Tailwind imports
│
├── public/                          # Static assets
│   ├── favicon.ico
│   └── logo.svg
│
└── tests/                           # Playwright E2E tests
    ├── playwright.config.ts
    ├── auth/
    ├── client/
    └── admin/
```

---

### Architectural Boundaries

**API Boundaries:**

| Boundary           | Location                             | Access                   |
| ------------------ | ------------------------------------ | ------------------------ |
| Client queries     | `convex/functions/*/queries.ts`      | `clientQuery` wrapper    |
| Admin queries      | `convex/functions/*/queries.ts`      | `adminQuery` wrapper     |
| Client mutations   | `convex/functions/*/mutations.ts`    | `clientMutation` wrapper |
| Admin mutations    | `convex/functions/*/mutations.ts`    | `adminMutation` wrapper  |
| Internal functions | `convex/functions/*/internal.ts`     | `internalQuery/Mutation` |
| External calls     | `convex/functions/assets/actions.ts` | Actions (MinIO)          |

**Component Boundaries:**

| Boundary          | Description                                       |
| ----------------- | ------------------------------------------------- |
| UI primitives     | `app/components/ui/` — Generic, no business logic |
| Domain components | `app/components/domain/` — PrimeEditz-specific    |
| Layout components | `app/components/layout/` — Page structure         |
| Client routes     | `app/routes/(protected)/client/` — Client-only    |
| Admin routes      | `app/routes/(protected)/admin/` — Admin-only      |

---

### Feature to File Mapping

**Authentication (MVP):**

- Sign-up/Sign-in: `app/routes/auth/`
- Auth provider: `app/lib/auth.ts`
- User queries: `convex/functions/users/`

**Event Creation (Client):**

- Event wizard: `app/routes/(protected)/client/events/new.tsx`
- Event queries: `convex/functions/events/`
- Event helpers: `convex/model/events.ts`

**Session & Quotation (Admin):**

- Session creation: `app/routes/(protected)/admin/sessions/new.tsx`
- Quotation: `convex/functions/quotations/`
- Quotation helpers: `convex/model/quotations.ts`

**Asset Upload (Client):**

- Upload component: `app/components/domain/upload-dropzone.tsx`
- Asset actions: `convex/functions/assets/actions.ts`
- Storage helpers: `convex/lib/storage.ts`

---

### Integration Points

**Internal Communication:**

```
[TanStack Router] → [useQuery/useMutation] → [Convex Functions] → [PostgreSQL]
                                            ↓
                                     [MinIO via Actions]
```

**External Integrations:**

| Service             | Status | Integration Point                    |
| ------------------- | ------ | ------------------------------------ |
| MinIO               | MVP    | `convex/functions/assets/actions.ts` |
| Google OAuth        | Future | `convex/http.ts` (Better Auth)       |
| Email notifications | Future | TBD                                  |
