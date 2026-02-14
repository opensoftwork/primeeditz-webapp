# Epic 20: Public Form Submissions (Contacts, Feedbacks & Surveys)

**Status**: Ready for Implementation
**Owner**: Antigravity
**Created**: 2026-02-14

---

## 📋 Overview

The PrimeEditz platform needs to collect data from external public-facing forms (on a separate website or landing page) for **contacts**, **feedbacks**, and **surveys**. These tables already exist in `convex/schema.ts`. This epic covers:

1. **Backend**: Convex mutations for creating records, admin queries for viewing/managing them, and Convex HTTP endpoints (`httpRouter`) for accepting external POST requests (no auth required).
2. **Frontend**: Admin dashboard pages for listing and viewing details of each submission type, following the established module patterns (shared DataTable, detail views, module folder structure).

### Key Architectural Decisions

- **HTTP Endpoints** use `httpRouter` from `convex/server` to expose unauthenticated POST routes for external form submissions.
- **Public mutations** use the raw `mutation` from `convex/_generated/server` (no auth wrapper) since submissions come from external, unauthenticated sources. Input validation is enforced via Convex `v` validators.
- **Admin queries** use the existing `adminQuery` wrapper from `convex/lib/customFunctions.ts` for role-based access.
- **Admin mutations** (delete, archive, etc.) use the existing `adminMutation` wrapper.
- **Frontend modules** follow the `primeeditz-module-patterns` SKILL — thin route pages, container components in `src/components/modules/admin/`, shared `DataTable` with columns, cards, and toolbars.
- **No create/edit wizards** — data is created externally via HTTP POST; admin only views and manages submissions.

---

## Requirements Inventory

### Functional Requirements

- **FR1**: The system must expose unauthenticated HTTP POST endpoints for `contacts`, `feedbacks`, and `surveys` at the Convex deployment URL (`https://cool-pony-209.convex.site`).
- **FR2**: Each HTTP POST endpoint must validate the incoming JSON body against the corresponding Convex schema validators and return appropriate success/error responses.
- **FR3**: The system must provide CORS headers to allow cross-origin POST requests from the external website.
- **FR4**: Admin users must be able to view a paginated, searchable list of all contact submissions.
- **FR5**: Admin users must be able to view a paginated, searchable list of all feedback submissions.
- **FR6**: Admin users must be able to view a paginated, searchable list of all survey submissions.
- **FR7**: Admin users must be able to view the full detail of any individual submission.
- **FR8**: Admin users must be able to delete submissions.
- **FR9**: The system must generate a Markdown integration guide documenting endpoints, request/response formats, and TypeScript types for the external project (TanStack Query + React Query Kit).

### Non-Functional Requirements

- **NFR1**: HTTP endpoints must respond within 500ms under normal load.
- **NFR2**: All admin views must follow the premium dark-mode aesthetic (glassmorphic cards, uppercase tracking labels, motion animations).
- **NFR3**: Admin list views must reuse the shared `DataTable` and `DataTableSkeleton` components with search, filters, and card/table view toggle.
- **NFR4**: All Convex function files must stay under 150 lines per file.
- **NFR5**: All React module files must follow the Container/Presentational pattern with thin route pages.

### Additional Requirements

- **AR1**: Follow existing Convex folder structure: `convex/functions/{feature}/queries.ts`, `mutations.ts`.
- **AR2**: Follow existing frontend module structure: `src/components/modules/admin/{feature}/list/`, `detail/`.
- **AR3**: Use barrel exports (`index.ts`) for all modules.
- **AR4**: HTTP routes must be added to the existing `convex/http.ts` file alongside the auth routes.

### FR Coverage Map

| Requirement             | Story              | Components                                        |
| ----------------------- | ------------------ | ------------------------------------------------- |
| FR1, FR2, FR3           | 20.1               | HTTP routes in `convex/http.ts`, public mutations |
| FR4, FR5, FR6, FR7, FR8 | 20.2               | Admin modules, DataTable, detail views            |
| FR9                     | 20.1 (deliverable) | Integration guide markdown file                   |

---

## Epic List

### Epic 20: Public Form Submissions

Expose Convex HTTP POST endpoints for external contact, feedback, and survey form submissions, and build admin dashboard pages to view and manage this data.

**FRs covered:** FR1–FR9
**NFRs addressed:** NFR1–NFR5

---

## Epic 20: Public Form Submissions

**Goal:** External websites can POST contact, feedback, and survey submissions to the PrimeEditz Convex backend via HTTP endpoints, and admins can view and manage all submissions through premium dashboard pages.

---

### Story 20.1: Backend — Convex Mutations, Queries & HTTP Endpoints

As an **external website developer**,
I want **HTTP POST endpoints that accept contact, feedback, and survey submissions**,
So that **public forms on the external website can store data directly in the PrimeEditz backend without authentication**.

As an **admin user**,
I want **queries to list and read submissions, and mutations to delete them**,
So that **I can view and manage all form submissions from the admin dashboard**.

**Description:**

Create the full backend layer for public form submissions:

1. **Public mutations** (no auth) for inserting records into `contacts`, `feedbacks`, and `surveys` tables.
2. **Admin queries** (using `adminQuery`) for listing all submissions (sorted by creation date) and getting individual records by ID.
3. **Admin mutations** (using `adminMutation`) for deleting submissions.
4. **HTTP routes** in `convex/http.ts` using `httpRouter` to expose POST endpoints with proper CORS headers and JSON validation.
5. **Integration guide** (Markdown) documenting endpoints, types, and usage examples for the external project.

**File Structure:**

```
convex/functions/
├── contacts/
│   ├── queries.ts        # Admin queries: list, getById
│   ├── mutations.ts      # Public create, admin delete
│   └── index.ts          # Barrel exports
├── feedbacks/
│   ├── queries.ts        # Admin queries: list, getById
│   ├── mutations.ts      # Public create, admin delete
│   └── index.ts          # Barrel exports
└── surveys/
    ├── queries.ts        # Admin queries: list, getById
    ├── mutations.ts      # Public create, admin delete
    └── index.ts          # Barrel exports

convex/http.ts            # Add POST routes for /contacts, /feedbacks, /surveys
```

**Technical Notes:**

- **Public mutations** use raw `mutation` from `convex/_generated/server` — NOT auth wrappers.
- **Admin queries/mutations** use `adminQuery` / `adminMutation` from `convex/lib/customFunctions.ts`.
- **HTTP handler pattern** — each route handler:
  1. Reads `request.json()`.
  2. Calls the appropriate internal mutation via `ctx.runMutation()`.
  3. Returns `new Response(JSON.stringify({ success: true }), { status: 200 })`.
  4. On error, returns `new Response(JSON.stringify({ error: message }), { status: 400 })`.
- **CORS** — add `httpAction` handlers for OPTIONS preflight and include `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type` headers on all responses.
- Schema validators for each table are already defined in `convex/schema.ts` (lines 776–827).
- **Timestamps** — each public mutation should add `_creationTime` is auto-set by Convex, so no manual timestamp needed.

**Acceptance Criteria:**

**Given** an external website sends a POST request to `https://cool-pony-209.convex.site/contacts` with a valid JSON body `{ name, email, phoneno, service, message }`
**When** the HTTP handler processes the request
**Then** a new record is inserted into the `contacts` table
**And** the response is `{ success: true, id: "<convex_id>" }` with status 200

**Given** an external website sends a POST request to `https://cool-pony-209.convex.site/feedbacks` with a valid JSON body `{ name, email, rating, feedback }`
**When** the HTTP handler processes the request
**Then** a new record is inserted into the `feedbacks` table
**And** the response is `{ success: true, id: "<convex_id>" }` with status 200

**Given** an external website sends a POST request to `https://cool-pony-209.convex.site/surveys` with a valid JSON body (all required + optional fields per schema)
**When** the HTTP handler processes the request
**Then** a new record is inserted into the `surveys` table
**And** the response is `{ success: true, id: "<convex_id>" }` with status 200

**Given** an external website sends a POST request with an invalid or missing required field
**When** the HTTP handler processes the request
**Then** the response is `{ error: "<validation_message>" }` with status 400

**Given** an external website sends an OPTIONS preflight request to any endpoint
**When** the HTTP handler processes the request
**Then** proper CORS headers are returned with status 204

**Given** an admin user calls the admin `listContacts` query
**When** the query executes
**Then** all contact submissions are returned, sorted by `_creationTime` descending

**Given** an admin user calls the admin `deleteContact` mutation with a valid ID
**When** the mutation executes
**Then** the record is permanently deleted from the `contacts` table

---

### Story 20.2: Frontend — Admin Dashboard List & Detail Views

As an **admin user**,
I want **dashboard pages to view, search, and manage contact, feedback, and survey submissions**,
So that **I can review incoming form data and take action on submissions**.

**Description:**

Create admin module UI pages for all three submission types (`contacts`, `feedbacks`, `surveys`), following the established `primeeditz-module-patterns` SKILL with:

1. **List views** — DataTable with search, filters, and card/table toggle.
2. **Detail views** — Full submission detail with formatted metadata.
3. **Delete action** — Confirmation dialog with delete mutation.
4. **No create/edit** — Data is read-only in the admin (created only via HTTP POST).

**File Structure:**

```
src/components/modules/admin/
├── contacts/
│   ├── list/
│   │   ├── contacts-list.tsx       # Main list container
│   │   ├── columns.tsx             # DataTable column definitions
│   │   ├── contact-card.tsx        # Card view renderer
│   │   ├── types.ts                # List-specific types
│   │   └── index.ts                # Barrel exports
│   ├── detail/
│   │   ├── contact-detail.tsx      # Detail view container
│   │   └── index.ts                # Barrel exports
│   └── index.ts                    # Module root exports
├── feedbacks/
│   ├── list/
│   │   ├── feedbacks-list.tsx
│   │   ├── columns.tsx
│   │   ├── feedback-card.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   ├── detail/
│   │   ├── feedback-detail.tsx
│   │   └── index.ts
│   └── index.ts
└── surveys/
    ├── list/
    │   ├── surveys-list.tsx
    │   ├── columns.tsx
    │   ├── survey-card.tsx
    │   ├── types.ts
    │   └── index.ts
    ├── detail/
    │   ├── survey-detail.tsx
    │   └── index.ts
    └── index.ts

src/app/(protected)/@admin/
├── contacts/
│   ├── page.tsx                    # List route (thin)
│   └── [id]/
│       └── page.tsx                # Detail route (thin)
├── feedbacks/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
└── surveys/
    ├── page.tsx
    └── [id]/
        └── page.tsx
```

**Technical Notes:**

- **List views** reuse `DataTable` and `DataTableSkeleton` from `@/components/shared/data-table`.
- **Columns** use `DataTableColumnHeader` for sortable headers.
- **Card views** follow the premium dark theme: `rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30`.
- **Detail views** display all submission fields in a clean, card-based layout.
- **Sidebar navigation** — add links for "Contacts", "Feedbacks", "Surveys" under a "Submissions" group in the admin sidebar.
- **No create button** — since data comes from external POST only.
- **Motion animations** — use `motion/react` for header and content entrance animations.
- **Types** — use `Doc<"contacts">`, `Doc<"feedbacks">`, `Doc<"surveys">` from Convex.
- **Delete dialog** — reuse `AlertDialog` pattern from existing modules.
- **Route pages must be thin** (<30 lines) — only import and render the container component.

**Key DataTable Configurations:**

| Module    | Search Column | Filters        | Default View |
| --------- | ------------- | -------------- | ------------ |
| Contacts  | `name`        | Service type   | Cards        |
| Feedbacks | `name`        | Rating (1-5)   | Cards        |
| Surveys   | `name`        | Role (q1_role) | Table        |

**Acceptance Criteria:**

**Given** an admin navigates to the Contacts list page
**When** the page loads
**Then** a premium-styled DataTable displays all contact submissions with name, email, service, and date columns
**And** a search bar allows filtering by name
**And** each row/card has a "View" action to navigate to the detail page
**And** each row/card has a "Delete" action with confirmation dialog

**Given** an admin clicks "View" on a contact submission
**When** the detail page loads
**Then** all fields (name, email, phone, service, message) are displayed in a clean, card-based layout
**And** a back button navigates to the list
**And** the creation date is formatted in a human-readable format

**Given** an admin navigates to the Feedbacks list page
**When** the page loads
**Then** all feedback submissions are listed with name, email, rating (as stars or numeric badge), and date
**And** feedback entries can be filtered by rating

**Given** an admin clicks "View" on a feedback submission
**When** the detail page loads
**Then** the full feedback text and all metadata are displayed

**Given** an admin navigates to the Surveys list page
**When** the page loads
**Then** all survey submissions are listed in table view with name, email, role, and date
**And** surveys can be filtered by role (q1_role)

**Given** an admin clicks "View" on a survey submission
**When** the detail page loads
**Then** all survey sections (Contact Info, Section A, Section B) are displayed with clear grouping and labels

**Given** an admin clicks "Delete" on any submission
**When** they confirm the delete dialog
**Then** the record is permanently deleted and the list refreshes

---

## Implementation Priority

| Story | Priority     | Effort | Dependencies                                  |
| ----- | ------------ | ------ | --------------------------------------------- |
| 20.1  | **Critical** | Medium | Schema tables (already in `convex/schema.ts`) |
| 20.2  | **High**     | Medium | Story 20.1 (queries/mutations must exist)     |

**Recommended Sprint Plan:**

- **Sprint 1:** Story 20.1 — Backend mutations, queries, HTTP endpoints, integration guide
- **Sprint 2:** Story 20.2 — Admin dashboard list and detail views for all three modules

---

## 🔄 Status History

- **2026-02-14**: Epic initialized. Schema tables already exist in `convex/schema.ts` (lines 776–827).
