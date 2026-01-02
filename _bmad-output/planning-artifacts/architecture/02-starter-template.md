## Starter Template Evaluation

### Primary Technology Domain

Full-stack B2B SaaS web application with real-time capabilities.

### Technology Stack (Pre-Determined)

The technology stack was established in the PRD based on project requirements:

| Layer         | Technology                  | Rationale                             |
| ------------- | --------------------------- | ------------------------------------- |
| **Framework** | TanStack Start (RC 1.0)     | Type-safe routing, SSR, modern DX     |
| **Backend**   | Convex (Self-Hosted)        | Real-time DB, serverless, open-source |
| **Auth**      | Better Auth + Convex        | Full control, no vendor lock-in       |
| **Storage**   | MinIO                       | S3-compatible, self-hosted            |
| **Styling**   | Tailwind CSS v4 + shadcn/ui | Rapid development, accessibility      |
| **Utilities** | convex-helpers              | Custom functions, CRUD helpers        |

---

### Selected Starter: TanStack Start + Convex Template

**Initialization Command:**

```bash
npm create convex -- -t tanstack-start
```

**Post-Initialization Setup:**

```bash
# Auth + utilities
pnpm add better-auth @better-auth/convex convex-helpers

# UI components
pnpm dlx shadcn@latest init
pnpm add @radix-ui/react-icons tailwindcss-animate class-variance-authority clsx tailwind-merge

# Development tools
pnpm add -D @biomejs/biome @playwright/test
```

---

### Architectural Decisions Established by Stack

**Language & Runtime:**

- TypeScript 5.x with strict mode
- React 19 with Server Components support
- Node.js runtime for Convex functions

**Build Tooling:**

- Vinxi (TanStack Start bundler) + Vite
- HMR for development
- Production SSR capabilities

**Code Organization:**

- Feature-based Convex functions (100-200 lines per file)
- File-based routing (TanStack Router)
- Domain components separate from UI primitives

**Development Experience:**

- Biome for linting + formatting
- Playwright for E2E testing
- Docker Compose for local development
