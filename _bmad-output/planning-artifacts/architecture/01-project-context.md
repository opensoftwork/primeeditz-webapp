## Project Context Analysis

### Requirements Overview

**Functional Requirements (MVP):**

- Authentication with email/password and Google OAuth
- User profiles with role-based access (Client, Employee, Admin, Superadmin)
- Project creation wizard (5 steps) for client project requests
- Quotation system with sections, templates, line items, and GST calculation
- Client quotation workflow (send, view, accept, reject, request changes)
- Session management with configurable folder templates
- Direct S3-compatible asset upload with signed URLs
- Real-time status tracking dashboards
- Responsive design with dark theme (premium studio aesthetic)

**Non-Functional Requirements:**

- Real-time updates via Convex subscriptions
- Dashboard load time < 2 seconds
- Support file uploads up to 2GB (video)
- WCAG 2.1 AA accessibility compliance
- Mobile-first responsive design
- Self-hosted infrastructure (Convex + MinIO)

---

### Scale & Complexity

| Aspect                 | Assessment                                                 |
| ---------------------- | ---------------------------------------------------------- |
| **Complexity Level**   | Medium-High                                                |
| **Primary Domain**     | Full-stack B2B SaaS (Post-Production Studio)               |
| **User Portals**       | 4 distinct interfaces (Client, Admin, Employee, Super)     |
| **Real-time Needs**    | High (status, uploads, notifications)                      |
| **Data Relationships** | Hierarchical (User → Project → Quotation → Folder → Asset) |

---

### Technical Stack (Updated 2026-01-18)

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| **Framework** | Next.js 16 (App Router)      |
| **React**     | React 19                     |
| **Backend**   | Convex (self-hosted)         |
| **Auth**      | Better Auth + Convex adapter |
| **Forms**     | TanStack Form + Zod          |
| **Styling**   | Tailwind CSS 4               |
| **Animation** | Motion (Framer Motion)       |
| **Storage**   | MinIO (S3-compatible)        |
| **PDF**       | jsPDF + html-to-image        |
| **State**     | Zustand (client-side)        |

---

### Technical Constraints & Dependencies

**Framework Constraints:**

- Next.js 16 App Router — file-based routing, server components
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
- Pre-signed URL expiration management

---

### Cross-Cutting Concerns

| Concern            | Architectural Approach                                          |
| ------------------ | --------------------------------------------------------------- |
| **Authentication** | Better Auth + convex-helpers custom wrappers                    |
| **Authorization**  | Role-based wrappers (clientQuery/Mutation, adminQuery/Mutation) |
| **Real-time Sync** | Convex subscriptions on all list views                          |
| **Error Handling** | Consistent error boundaries + toast notifications (Sonner)      |
| **Theming**        | Dark theme default, CSS variables with design tokens            |
| **Accessibility**  | ARIA labels, focus management, keyboard shortcuts               |
| **Audit Trail**    | Timestamps on all entities, status history tracking             |

---

### Established Patterns (Epic 2-4)

#### 1. Drawer-Based Forms

All contextual forms use Sheet/Drawer pattern:

- Consistent premium dark theme
- Loading states with RefreshCw spinner
- Toast notifications on success/error

#### 2. Client Mutations

```typescript
export const actionName = clientMutation({
  args: { ... },
  handler: async (ctx, args) => {
    // ctx.clientId available for ownership validation
  },
});
```

#### 3. Public Queries (No Auth)

```typescript
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Validate token expiry
    // Return read-only data
  },
});
```

#### 4. PDF Generation

```typescript
const dataUrl = await htmlToImage.toPng(ref, {
  skipFonts: true, // CRITICAL: Prevents OKLCH crashes
  quality: 0.95,
  pixelRatio: 2,
});
// Convert to jsPDF pages
```

#### 5. Structured Feedback

Use checkbox arrays for categorized input (change requests, rejections) instead of free-form text.

#### 6. Dual-Channel Delivery

Offer both authenticated dashboard and public share link access for quotations.
