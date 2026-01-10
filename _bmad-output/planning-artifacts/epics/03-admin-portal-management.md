# Epic 3: Admin Portal — Project & System Management

**User Outcome:** Admins can view all client project requests, manage the workflow, AND configure system settings (project types, templates, pricing).

**FRs covered:** FR4 (Project Management), FR5 (Stage Management), FR10 (RBAC - partial), FR11 (System Configuration)

**Scope:**

- Admin dashboard layout
- Project listing page with filters
- Project detail page (admin perspective)
- Stage/folder setup for projects
- Update project statuses
- Employee management (create, view, deactivate)
- Project types management (CRUD)
- Quotation templates management (CRUD)
- Storage pricing tiers configuration
- Folder templates configuration
- Basic team assignment to projects

**Standalone:** ✅ Admins can fully manage projects AND system settings.

---

## 📘 Epic 2 Learnings Applied

**IMPORTANT**: Based on Epic 2 retrospective (2026-01-09), apply these corrections to all stories:

### Framework Corrections

| Original Specification | Actual Implementation              |
| ---------------------- | ---------------------------------- |
| TanStack Start Router  | **Next.js 15 App Router**          |
| TanStack Form          | **React Hook Form + Zod**          |
| `@unpic/react`         | **`next/image`**                   |
| `useSearch` for params | **`useParams`, `useSearchParams`** |
| `beforeLoad` guards    | **Parallel routes + middleware**   |

### Reusable Patterns from Epic 2

1. **FilesVaultDrawer** (`src/components/shared/files-vault/drawer.tsx`)

   - Use for any file display (reference files, deliverables, assets)
   - Supports: thumbnails, categories, ImageSlider integration

2. **Pre-signed MinIO URLs** (`convex/functions/storage/actions.ts`)

   - Use `getSignedFileUrls` action for all MinIO access
   - Never generate public URLs directly

3. **Dynamic Form Fields** (`src/components/shared/dynamic-form-fields/`)

   - Reuse field components for any database-driven forms

4. **Zustand Deferred Upload** pattern
   - Store files client-side until final submission
   - Prevents orphaned files

### Route Structure

Admin routes follow parallel route pattern:

```
src/app/(protected)
├── @admin/
│   ├── dashboard/page.tsx
│   ├── projects/page.tsx
│   ├── projects/[projectId]/page.tsx
│   └── settings/
│       ├── project-types/page.tsx
│       └── employees/page.tsx
└── layout.tsx (conditional slot rendering)
```

---

### Story 3.1: Admin Dashboard Layout

**As an** Admin,
**I want** a dashboard that shows key metrics and pending actions,
**So that** I can quickly understand the state of my business.

**Acceptance Criteria:**

- **Given** I am logged in as an Admin
- **When** I navigate to `/admin/dashboard`
- **Then** I must see: Pending Requests count, Active Projects count, and a Quick Actions section.
- **And** a "Pending Requests" list must show projects awaiting review (status: `pending_review`).
- **And** Quick Actions must include:
  - "View Pending Requests" → `/admin/projects?status=pending_review`
  - "Manage Project Types" → `/admin/settings/project-types`
  - "Manage Employees" → `/admin/settings/employees`
- **And** real-time subscriptions must update counts without page refresh.

### Story 3.2: Admin Project Listing with Filters

**As an** Admin,
**I want** to view all projects with filtering and search capabilities,
**So that** I can find specific projects quickly.

**Acceptance Criteria:**

- **Given** I am on `/admin/projects`
- **When** the page loads
- **Then** I must see a table/list of all projects (paginated if >20).
- **And** I can filter by: Status (dropdown), Project Type (dropdown), Client (search).
- **And** I can sort by: Date (newest/oldest), Status.

### Story 3.3: Admin Project Detail View

**As an** Admin,
**I want** to view full project details including client info, reference files, and history,
**So that** I can make informed decisions about quotations and assignments.

**Acceptance Criteria:**

- **Given** I am on `/admin/projects/{projectId}`
- **When** the page loads
- **Then** I must see: Project Header, Client Info, Project-Specific Details (rendered dynamically), Reference Files, and Action buttons.
- **And** action buttons must include:
  - "Create Quotation" — enabled if project status is `pending_review`
  - "Assign Team" — **disabled until quotation status = `approved`**
  - "Setup Folders" — enabled after quotation approved
- **And** status history must be visible showing all status transitions.

### Story 3.4: Project Stage/Folder Setup

**As an** Admin,
**I want** to set up the folder structure for a project based on templates,
**So that** clients know where to upload their assets.

**Acceptance Criteria:**

- **Given** I am editing a project
- **When** I click "Setup Folders"
- **Then** I must be able to select a Folder Template from configured templates.
- **And** applying the template must create folder records in the `folders` table.
- **And** the client must see these folders when uploading assets.

### Story 3.5: Update Project Status

**As an** Admin,
**I want** to manually update a project's status,
**So that** I can move projects through the workflow.

**Acceptance Criteria:**

- **Given** I am on a project detail page
- **When** I click "Update Status"
- **Then** I must see a dropdown with valid next statuses based on current status.
- **And** updating status must record a history entry with timestamp and actor.
- **And** the client must be notified (via real-time subscription) of the change.

### Story 3.6: Employee Management (CRUD)

**As an** Admin,
**I want** to create, view, and deactivate employee accounts,
**So that** I can manage my editing team's access.

**Acceptance Criteria:**

- **Given** I am on `/admin/settings/employees`
- **When** I view the list
- **Then** I must see all employees with their Name, Email, Role, and Status (Active/Inactive).
- **And** I can create a new employee with: Name, Email, Temporary Password.
  - The employee must change their password on first login.
  - **No email invite for MVP** — Admin communicates credentials manually.
- **And** I can deactivate an employee (soft delete, preserves history).
- **And** I can reactivate a previously deactivated employee.

### Story 3.7: Project Types Management

**As an** Admin,
**I want** to configure project types (Wedding Photography, YouTube Edit, etc.),
**So that** clients have relevant options when requesting projects.

**Acceptance Criteria:**

- **Given** I am on `/admin/settings/project-types`
- **When** I view the list
- **Then** I must see all project types with Name, Category, and Active status.
- **And** I can create/edit a project type with: Name, Category, Default Folder Template.
- **And** I can deactivate (not delete) a project type.

**Note:** MVP uses hardcoded project types from Story 2.2. This screen allows adding new types but **configurable detail fields are Phase 2**.

### Story 3.8: Quotation Templates Management

**As an** Admin,
**I want** to create and manage quotation templates,
**So that** I can quickly generate quotations for common project types.

**Acceptance Criteria:**

- **Given** I am on `/admin/settings/quotation-templates`
- **When** I view the list
- **Then** I must see all templates with Name, Base Price, and Associated Project Type.
- **And** I can create/edit a template with: Name, Line Items (description, unit price, quantity), Terms.
- **And** templates must support GST calculation (18%).

### Story 3.9: Storage Pricing Tiers Configuration

**As an** Admin,
**I want** to configure storage tiers with pricing,
**So that** I can offer different storage options to clients.

**Acceptance Criteria:**

- **Given** I am on `/admin/settings/storage-tiers`
- **When** I view the list
- **Then** I must see all tiers with Name, Capacity (GB), and Price.
- **And** I can create/edit a tier with: Name, Capacity, Price, Active status.
- **And** these tiers must appear in the quotation creation flow.

### Story 3.10: Folder Templates Configuration

**As an** Admin,
**I want** to define folder templates for different project types,
**So that** projects have consistent folder structures.

**Acceptance Criteria:**

- **Given** I am on `/admin/settings/folder-templates`
- **When** I view the list
- **Then** I must see all templates with Name and Folder Count.
- **And** I can create/edit a template with: Name, Folders (list of folder names like "Ceremony", "Reception", "Candid").
- **And** templates can be associated with Project Types.
