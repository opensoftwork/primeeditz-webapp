---
stepsCompleted:
  [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories]
inputDocuments:
  - prd.md
  - architecture/*
  - ux-design-specification.md
  - epics/11c-studio-portal.md
---

# PrimeEditz - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for PrimeEditz, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Authentication with email/password and Google OAuth
FR2: User profiles with role-based access (Client/Studio, Employee, Admin, Superadmin)
FR3: Quotation system with sections, templates, line items, and GST calculation
FR4: Client quotation workflow (send, view, accept, reject, request changes)
FR5: Session management with configurable folder templates
FR6: Direct S3-compatible asset upload with signed URLs
FR7: Project spawning from approved quotations (Epic 11 specialty)
FR8: Studio-side quote request flow replacing traditional project wizard
FR9: Event Code Generation (Automatic unique codes for events)
FR10: User status management (active, inactive, pending)

### NonFunctional Requirements

NFR1: Real-time updates via Convex subscriptions
NFR2: Dashboard load time < 2 seconds
NFR3: Support file uploads up to 2GB (video)
NFR4: WCAG 2.1 AA accessibility compliance
NFR5: Mobile-first responsive design
NFR6: Self-hosted infrastructure (Convex + MinIO)
NFR7: Type-safety (Full TypeScript 5.x end-to-end)

### Additional Requirements

- Use Better Auth + convex-helpers custom wrappers for authentication
- Implement role-based authorization using custom wrappers (clientQuery/Mutation, adminQuery/Mutation)
- All contextual forms must use Sheet/Drawer pattern with premium dark theme
- PDF generation must use html-to-image (with `skipFonts: true`) and jsPDF
- Use structured feedback (checkboxes) for change requests/rejections
- Support both authenticated dashboard and public share link for quotations
- Standardize all list views with Convex subscriptions for real-time sync
- Premium dark mode aesthetic
- Progress tracker for projects/quotations (Project Created -> Files Uploaded -> In Progress -> Delivered)
- Studio Dashboard optimized for high-volume project management (grouped by End Client)

### FR Coverage Map

FR1: Epic 1 - Authentication & Onboarding
FR2: Epic 1 - Authentication & Onboarding
FR3: Epic 4 - Quotation System
FR4: Epic 4 - Quotation System
FR5: Epic 5 - Asset Upload & Folder Management
FR6: Epic 5 - Asset Upload & Folder Management
FR7: Epic 11C - Studio Portal Revamp (Project Spawning)
FR8: Epic 11C - Studio Portal Revamp (Quote Request Flow)
FR9: Epic 3 - Admin Portal
FR10: Epic 1 - Authentication & Onboarding

## Epic List

### Epic 11C: Studio Portal Revamp

This epic transforms the Studio (formerly Client) experience from a project-centric wizard to a quotation-driven flow. Studios will request packages, and projects are auto-created upon quote approval. The existing wizard is repurposed for "onboarding" (uploading reference files).
**FRs covered:** FR7, FR8

**Stories:**

1. Quote Request Flow (Replaces Wizard Entry)
2. "My Quote Requests" List View
3. "My Projects" Grouped by End Client
4. Project Onboarding Card
5. Repurpose Wizard for Onboarding Only
6. Studio Project Detail View
7. Deprecate Steps 0-2 for Studio Mode

### Story 11C.1: Quote Request Flow (Replaces Wizard Entry)

As a Studio,
I want to request a quote by selecting a package template,
So that I can quickly get pricing for my end client.

**Acceptance Criteria:**

**Given** I am a logged-in Studio user on the dashboard
**When** I click the "Request Quote" button
**Then** I see the Quote Request Wizard
**And** I can select a Package/Quotation Template
**And** I can enter the End Client Name and Event Date (optional)
**And** I can review and submit the request
**And** Use the existing quotation templates for package selection

### Story 11C.2: "My Quote Requests" List View

As a Studio,
I want to see all my quote requests and their statuses,
So that I can track which quotes are pending, approved, or rejected.

**Acceptance Criteria:**

**Given** I have submitted quote requests
**When** I navigate to the "My Quote Requests" page
**Then** I see a list of all my quotes with statuses (pending, approved, rejected)
**And** I can filter by status
**And** I can click to view quote details
**And** Real-time status updates are reflected via Convex subscriptions

### Story 11C.3: "My Projects" Grouped by End Client

As a Studio,
I want to see my projects organized by End Client name,
So that I can quickly find all work related to a specific customer.

**Acceptance Criteria:**

**Given** I have multiple projects for different end clients
**When** I view the "My Projects" dashboard
**Then** Projects are grouped by End Client Name
**And** Each group shows the client name and project count
**And** I can expand/collapse groups
**And** Direct engagements (no end client) are grouped separately

### Story 11C.4: Project Onboarding Card

As a Studio,
I want to see a clear prompt to upload reference files for newly created projects,
So that I know what action is needed from me.

**Acceptance Criteria:**

**Given** A project has been auto-spawned from an approved quote
**When** I view the project card in the dashboard
**Then** I see an "Onboarding Needed" badge if files are missing
**And** I see a "Resume Onboarding" button
**And** The card visualizes the project phase (Setup -> Onboarding -> Production)

### Story 11C.5: Repurpose Wizard for Onboarding Only

As a Studio,
I want to use a simplified version of the project wizard to upload files and add notes,
So that I can complete my project setup.

**Acceptance Criteria:**

**Given** I click "Resume Onboarding" for a project
**When** The wizard opens
**Then** It starts directly at the File Upload step (skips type/package selection)
**And** I can upload reference files
**And** I can add project notes
**And** Submitting updates the existing project status to "Production Ready"

### Story 11C.6: Studio Project Detail View

As a Studio,
I want to view the details of my project including its linked quotation,
So that I can understand the scope and track progress.

**Acceptance Criteria:**

**Given** I am viewing a project detail page
**When** The project was spawned from a quotation
**Then** I see a "Linked Quotation" section
**And** I can click to view the original approved quote
**And** I can see the agreed package details and pricing

### Story 11C.7: Deprecate Steps 0-2 for Studio Mode

As a Developer,
I want to ensure Studios cannot access the old "New Project" wizard steps,
So that they follow the quotation flow.

**Acceptance Criteria:**

**Given** I am a Studio user
**When** I try to access the old "New Project" wizard
**Then** I am redirected to the "Request Quote" flow
**And** Steps 0-2 (Client selection, Type selection) are hidden/disabled for Studio role
**And** The Sidebar "New Project" button points to the Quote Request flow
