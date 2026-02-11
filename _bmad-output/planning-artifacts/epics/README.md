---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture/README.md
  - _bmad-output/planning-artifacts/ux/ux-design/README.md
  - _bmad-output/planning-artifacts/ux/user-flows/README.md
  - _bmad-output/planning-artifacts/research/tech-reference/README.md
---

# PrimeEditz v1.0 — Epic Breakdown

## Overview

This directory contains the complete epic and story breakdown for **primeeditz-tanstack-webapp**, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

### Epic List

- [Epic 0: Project Foundation](./00-foundation.md)
- [Epic 1: Authentication & Onboarding](./01-auth-onboarding.md)
- [Epic 2: Client Portal — Project Request](./02-client-portal-request.md) _(Superseded by 11C)_
- [Epic 3: Admin Portal — Project & System Management](./03-admin-portal-management.md)
- [Epic 4: Quotation System](./04-quotation-system.md)
- [Epic 5: Asset Upload & Folder Management](./05-asset-upload.md)
- [Epic 6: Deliverables & QC Workflow](./06-deliverables-qc.md)
- [Epic 7: Status Tracking & Dashboards](./07-status-tracking.md)
- [Epic 10: Landing Page — Marketing & Conversion](./10-landing-page.md)
- **[Epic 11: System Architecture Revamp (Master)](./11-system-restructuring-revamp.md)**
  - [Epic 11A: Schema & Data Foundation](./11a-schema-foundation.md)
  - [Epic 11B: Quotation Engine Enhancements](./11b-quotation-engine.md)
  - [Epic 11C: Studio Portal Revamp](./11c-studio-portal.md)
  - [Epic 11D: Terminology & Routing Cleanup](./11d-terminology-cleanup.md)
- [Epic 12: Employee Assignment & Team Management](./12-employee-assignment-team-management.md)
- **[Epic 13: Unified Service Package Configuration (Master)](./13-unified-service-package-configuration.md)**
  - [Epic 13A: Schema Consolidation](./13a-schema-consolidation.md)
  - [Epic 13B: Folder Template Enhancement](./13b-folder-template-enhancement.md)
  - [Epic 13C: Service Package Builder UI](./13c-service-package-builder-ui.md)
  - [Epic 13D: Legacy Cleanup & Migration](./13d-legacy-cleanup-migration.md)
- **[Epic 14: Project Type + Folder Template Integration](./14-project-type-folder-template-integration.md)** ⬅️ NEW

---

## Requirements Inventory

### Functional Requirements

**FR1: Authentication**

- Sign up with email/password
- Sign in with email/password
- Protected route access via TanStack Router guards
- Session management via Better Auth + Convex
- Post-login onboarding flow with role assignment

**FR2: User Profiles & Roles**

- User profile creation (name, phone, company)
- Role selection during onboarding (Client, Employee, Admin)
- Role-based dashboard routing
- Profile management and updates

**FR3: Project Creation (Client Portal)**

- Multi-step project request wizard (5 steps)
- Basic info: Project name, type, date
- Details: Location/venue, description
- Requirements: Photo count, video count, storage needs
- Reference files: Upload up to 20 files (50MB each)
- Review and submit
- Project code generation (PRJ-000001)

**FR4: Project Management (Admin Portal)**

- View pending projects (status: pending_review)
- View all projects with filters (status, date, client)
- Project detail view with full information
- Create internal projects (no client)
- Team assignment (per-project roles)
- Update project status

**FR5: Stage Management (Admin Portal)**

- Stage configuration per project type
- Stage creation with configurable workflows
- Folder template assignment to stages
- Quotation template selection
- Storage tier selection
- Team assignment per stage

**FR6: Quotation System**

- Auto-calculated quotations from templates
- Quotation display with line items
- GST calculation (18%)
- Quotation status flow (draft → sent → approved/rejected)
- Client approval/rejection workflow

**FR7: Folder Structure**

- Folder templates for different session types
- Automatic folder creation from templates
- Folder status tracking (pending_upload → in_progress → completed)
- Folder-based file organization

**FR8: Asset Upload (Client Portal)**

- Direct upload to MinIO via signed URLs
- Batch upload support (up to 50 files)
- Progress indicators per file
- File validation (size, type)
- Metadata recording in Convex

**FR9: Status Tracking**

- Project status flow: draft → pending_review → active → in_progress → completed → archived
- Stage status flow: pending → in_progress → review → completed
- Client dashboard with project status overview
- Admin dashboard with project status management

**FR10: Role-Based Access Control**

- Client: Own projects only, self-registration
- Employee: Assigned projects only, created by Admin
- Admin: Full access (all projects, sessions, system config)

**FR11: System Configuration (Admin)**

- Project types management
- Quotation templates management
- Storage pricing tiers configuration
- Folder templates configuration
- Employee account management

**FR12: Deliverables & QC Workflow**

- Deliverable upload by editors (per stage)
- Deliverable versioning (v1, v2, v3...)
- QC review workflow (approve/reject with notes)
- QC Gate: Clients only see QC-approved deliverables
- Client deliverable review page
- Client approve/request revision flow
- Revision tracking with limits

### Non-Functional Requirements

**NFR1: Performance**

- Dashboard load time < 2 seconds
- Real-time updates via Convex subscriptions
- Smooth file upload progress

**NFR2: File Handling**

- Max photo size: 100MB
- Max video size: 2GB
- Max files per upload: 50
- Allowed types: jpg, jpeg, png, gif, mp4, mov, avi

**NFR3: Accessibility**

- WCAG 2.1 AA compliance
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management

**NFR4: Responsiveness**

- Mobile-first responsive design
- Desktop, tablet, mobile breakpoints
- Touch-friendly interactions

**NFR5: Theming**

- Dark/light theme support
- OKLCH color tokens
- System preference detection
- Theme persistence

**NFR6: Security**

- Role-based function access control
- Signed URL expiration management
- Session-based authentication
- Protected routes

### Additional Requirements (from Architecture)

**AR1: Infrastructure**

- Self-hosted Convex (Docker + PostgreSQL)
- Self-hosted MinIO for storage
- Cloudflare Pages for frontend hosting

**AR2: Development**

- TypeScript strict mode
- Biome for linting/formatting
- Playwright for E2E testing
- Docker Compose for local development

**AR3: Code Organization**

- Convex hybrid pattern (model + thin API)
- 150-line file limit with splitting rules
- Auth wrappers via convex-helpers
- Index-based database queries

**AR4: API Patterns**

- authenticatedQuery for client access
- adminQuery/adminMutation for admin access
- internalQuery/internalMutation for scheduled jobs
- actions only for external API calls (MinIO)

**AR5: Clean Code Architecture (Frontend)**

- Container/Presentational pattern for React components
- Thin route files (~100 lines max, config only)
- Feature modules in `components/modules/{feature}/`
- Shared reusable components in `components/shared/`
- See: `architecture/09-clean-code-standards.md` for full details

---

### Additional Requirements (from UX Design)

**UX1: Design System**

- shadcn/ui component library
- OKLCH color tokens with semantic naming
- Consistent spacing scale (4px base)
- Typography scale with Inter font

**UX2: Interaction Patterns**

- Upload gate before client actions
- Skeleton loading states
- Toast notifications for actions
- Error boundaries with retry options

**UX3: Navigation**

- Role-based sidebar navigation
- Breadcrumb navigation for depth
- Quick actions in dashboards

---

## FR Coverage Map

| Requirement             | Epic      | Stories             |
| ----------------------- | --------- | ------------------- |
| FR1: Authentication     | Epic 1    | 1.1, 1.2, 1.3       |
| FR2: User Profiles      | Epic 1    | 1.4, 1.5            |
| FR3: Project Creation   | Epic 2    | 2.1, 2.2, 2.3, 2.4  |
| FR4: Project Management | Epic 3    | 3.1, 3.2, 3.3       |
| FR5: Stage Management   | Epic 3    | 3.4, 3.5, 3.6       |
| FR6: Quotation System   | Epic 4    | 4.1, 4.2, 4.3       |
| FR7: Folder Structure   | Epic 5    | 5.1, 5.2            |
| FR8: Asset Upload       | Epic 5    | 5.3, 5.4, 5.5       |
| FR9: Status Tracking    | Epic 7    | 7.1, 7.2            |
| FR10: RBAC              | Epic 1, 3 | Embedded            |
| FR11: System Config     | Epic 3    | 3.7, 3.8, 3.9, 3.10 |
| FR12: Deliverables & QC | Epic 6    | 6.1, 6.2, 6.3, 6.4  |

---

## Epic Summary (MVP)

| Epic  | Title                                | Priority | Dependencies | FRs Covered          |
| ----- | ------------------------------------ | -------- | ------------ | -------------------- |
| **0** | Project Foundation                   | Critical | None         | AR1-AR4              |
| **1** | Authentication & Onboarding          | Critical | Epic 0       | FR1, FR2, FR10       |
| **2** | Client Portal — Project Request      | Critical | Epic 1       | FR3, FR9             |
| **3** | Admin Portal — Project & System Mgmt | Critical | Epic 1       | FR4, FR5, FR10, FR11 |
| **4** | Quotation System                     | High     | Epic 3       | FR6                  |
| **5** | Asset Upload & Folder Management     | High     | Epic 4       | FR7, FR8             |
| **6** | Deliverables & QC Workflow           | High     | Epic 5       | FR12, NFR6           |
| **7** | Status Tracking & Dashboards         | High     | Epic 2, 3    | FR9, NFR1            |

---

## Dependency Graph

```
Epic 0: Foundation
    ↓
Epic 1: Auth & Onboarding
    ↓
    ├─────────────────────────────────┐
    ↓                                 ↓
Epic 2: Client Portal           Epic 3: Admin Portal
    │                                 ↓
    │                           Epic 4: Quotes
    │                                 ↓
    │                           Epic 5: Uploads
    │                                 ↓
    │                           Epic 6: Deliverables & QC
    │                                 │
    └─────────────────────────────────┘
                      ↓
                Epic 7: Dashboards
```

---

## Role Model (v3.0)

| Role         | Who              | Access                                                             |
| ------------ | ---------------- | ------------------------------------------------------------------ |
| **Admin**    | You + Managers   | Full access (all projects, system config, employee management)     |
| **Employee** | Editing team     | Assigned projects only (per-project roles: Editor, QC, Designer)   |
| **Client**   | Studios/Agencies | Own projects only (self-registration, quotation approval, uploads) |

---

## Phase 2 Features (Post-MVP)

The following features are documented in user flows but deferred to Phase 2:

| Feature                         | Description                                           | User Flow Reference         |
| ------------------------------- | ----------------------------------------------------- | --------------------------- |
| **Configurable Project Fields** | Admin-defined dynamic fields per project type         | Epic 2 Story 2.3 note       |
| **Quotation Version History**   | New record per quotation version for full audit trail | Epic 4 Story 4.6 note       |
| **Revision Payment System**     | Charge for revisions beyond configurable limit        | Epic 6 Story 6.4 note       |
| **ZIP Bulk Downloads**          | Package deliverables as ZIP for bulk download         | Epic 7 Story 7.5 note       |
| **Advanced Per-Project Roles**  | Detailed Editor/QC/Designer assignment per project    | 02-roles.md §2.5            |
| **Configurable Stages**         | Admin-defined workflow stages per project type        | 09-editing-workflow.md §9.2 |

---

## Story Summary

| Epic  | Stories               | Key Features                                                                      |
| ----- | --------------------- | --------------------------------------------------------------------------------- |
| **0** | 0.1, 0.2, 0.3a/b, 0.4 | Infrastructure (Convex Cloud + MinIO), Full Schema, Layout (split), Auth Wrappers |
| **1** | 1.1a/b/c, 1.2-1.5     | Better Auth (3-part), Sign Up/In, Onboarding, Middleware                          |
| **2** | 2.0 - 2.7             | Wizard Infrastructure, Dashboard, 5-Step Wizard (dynamic fields), Detail View     |
| **3** | 3.1 - 3.10            | Admin Dashboard, Project Mgmt, System Config (4 areas)                            |
| **4** | 4.1 - 4.6             | Quotation Create/Edit/Send, Client Approve/Reject                                 |
| **5** | 5.1 - 5.7             | Folders, Gated Upload, Signed URLs, Storage Limits, Admin Internal Upload         |
| **6** | 6.1 - 6.4             | Deliverable Upload (Admin/Employee), QC Review, Client Approve/Revise             |
| **7** | 7.1 - 7.5             | Enhanced Dashboards, Real-time Updates, History, Download Deliverables            |

**Total Stories:** 49 (after Epic 4-7 updates)

---

<!-- End of Epics and Stories Document -->
