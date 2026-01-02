## Project Context Analysis

### Requirements Overview

**Functional Requirements (MVP):**

- Authentication with email/password and Google OAuth
- User profiles with role-based access (Client, Employee, Admin, Superadmin)
- Event creation wizard (5 steps) for client project requests
- Session management with configurable folder templates
- Quotation generation with GST calculation
- Direct S3-compatible asset upload with signed URLs
- Real-time status tracking dashboards
- Responsive design with dark/light theme support

**Non-Functional Requirements:**

- Real-time updates via Convex subscriptions
- Dashboard load time < 2 seconds
- Support file uploads up to 2GB (video)
- WCAG 2.1 AA accessibility compliance
- Mobile-first responsive design
- Self-hosted infrastructure (Convex + MinIO)

---

### Scale & Complexity

| Aspect                 | Assessment                                             |
| ---------------------- | ------------------------------------------------------ |
| **Complexity Level**   | Medium-High                                            |
| **Primary Domain**     | Full-stack B2B SaaS                                    |
| **User Portals**       | 4 distinct interfaces                                  |
| **Real-time Needs**    | High (status, uploads, notifications)                  |
| **Data Relationships** | Hierarchical (User → Event → Session → Folder → Asset) |

---

### Technical Constraints & Dependencies

**Framework Constraints:**

- TanStack Start (RC) — production use of release candidate
- Better Auth — custom auth with Convex adapter required
- Convex self-hosted — Docker + PostgreSQL stack

**Infrastructure Constraints:**

- Self-hosted MinIO for S3-compatible storage
- Cloudflare Pages for frontend hosting
- Docker Compose for local development

**File Handling Constraints:**

- Max photo size: 100MB
- Max video size: 2GB
- Batch uploads up to 50 files
- Signed URL expiration management

---

### Cross-Cutting Concerns

| Concern            | Architectural Approach                                       |
| ------------------ | ------------------------------------------------------------ |
| **Authentication** | Better Auth + convex-helpers custom wrappers                 |
| **Authorization**  | Role-based wrappers (clientQuery, adminMutation, etc.)       |
| **Real-time Sync** | Convex subscriptions on all list views                       |
| **Error Handling** | Consistent error boundaries + toast notifications            |
| **Theming**        | CSS variables with OKLCH tokens, system preference detection |
| **Accessibility**  | ARIA labels, focus management, keyboard shortcuts            |
| **Audit Trail**    | Timestamps on all entities, status history tracking          |
