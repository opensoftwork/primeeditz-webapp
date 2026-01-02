## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Confirmed from PRD):**

- Database: Convex with self-hosted PostgreSQL
- Authentication: Better Auth with Convex adapter
- File Storage: MinIO with S3-compatible API
- Frontend: TanStack Start + React 19 + shadcn/ui

**Important Decisions (Shape Architecture):**

- Authorization via convex-helpers custom wrappers
- Feature-based function organization (100-200 lines/file)
- OKLCH-based theming with dark mode default
- Command palette for power users

**Deferred Decisions (Post-MVP):**

- Advanced monitoring (beyond Convex dashboard)
- Horizontal scaling strategy
- Payment integration architecture
- Mobile app architecture

---

### Data Architecture

| Decision            | Choice                   | Version     | Rationale                                  |
| ------------------- | ------------------------ | ----------- | ------------------------------------------ |
| Database            | Convex                   | Self-hosted | Real-time, type-safe, serverless functions |
| Persistence         | PostgreSQL               | 16.x        | Required for self-hosted Convex            |
| Validation          | Convex `v` validators    | Built-in    | Schema-enforced type safety                |
| Schema Organization | Single schema.ts         | N/A         | Keeps under 200 lines                      |
| Computed Fields     | Stored, update on change | N/A         | Avoid expensive real-time computation      |

---

### Authentication & Security

| Decision           | Choice                                  | Rationale                       |
| ------------------ | --------------------------------------- | ------------------------------- |
| Auth Provider      | Better Auth                             | Full control, no vendor lock-in |
| OAuth Providers    | Google (MVP)                            | Most common, easy setup         |
| Session Storage    | Convex table                            | Integrated with database        |
| Auth Wrappers      | authenticatedQuery, adminMutation, etc. | Role-based access enforcement   |
| Row-Level Security | Wrapper checks per operation            | Convex best practice            |

---

### API & Communication Patterns

| Decision              | Choice                   | Rationale                           |
| --------------------- | ------------------------ | ----------------------------------- |
| API Style             | Convex functions         | Type-safe, real-time by default     |
| Function Organization | Feature-based folders    | Maintainable, discoverable          |
| Error Handling        | Throw typed errors       | Consistent error patterns           |
| Optimistic Updates    | Enabled for key actions  | Per UX "instant feedback" principle |
| File Upload           | Signed URL direct upload | Efficient, secure, scalable         |

---

### Frontend Architecture

| Decision            | Choice                   | Rationale                |
| ------------------- | ------------------------ | ------------------------ |
| Component Structure | ui/ + domain/ + layout/  | Separation of concerns   |
| Form Handling       | React Hook Form + shadcn | Accessible, validated    |
| Notifications       | Sonner (shadcn Toast)    | Non-blocking, consistent |
| Loading States      | Skeleton components      | Per UX patterns          |
| Error Boundaries    | Per-route                | TanStack Router pattern  |
| Power User Features | cmdk (Command Palette)   | Per UX decision          |

---

### Infrastructure & Deployment

| Decision          | Choice                      | Rationale                        |
| ----------------- | --------------------------- | -------------------------------- |
| Frontend Hosting  | Cloudflare Pages            | Global CDN, free tier            |
| Backend Hosting   | Self-hosted Convex (Docker) | Full control, cost-effective     |
| File Storage      | Self-hosted MinIO           | S3-compatible, no vendor lock-in |
| CI/CD             | GitHub Actions              | Standard, well-documented        |
| Local Development | Docker Compose              | Consistent environments          |
| Monitoring (MVP)  | Convex Dashboard            | Built-in, sufficient for launch  |
