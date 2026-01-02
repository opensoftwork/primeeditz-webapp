# Product Requirements Document (PRD)

# PrimeEditz v1.0 — Creative Workflow Platform

**Document Version**: 1.0  
**Created**: 2025-12-27  
**Author**: Winston (Architect) & Mary (Analyst)  
**Status**: Active — Ready for Implementation  
**Target**: Fresh Build with TanStack Start + Better Auth + Convex

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target Market & GTM Strategy](#2-target-market--gtm-strategy)
3. [Technology Stack](#3-technology-stack)
4. [User Personas & Roles](#4-user-personas--roles)
5. [Core Features — MVP](#5-core-features--mvp)
6. [Shipping Strategy — This Week](#6-shipping-strategy--this-week)
7. [Feature Phases — Post-MVP](#7-feature-phases--post-mvp)
8. [Data Architecture](#8-data-architecture)
9. [Authentication Architecture](#9-authentication-architecture)
10. [File Storage Architecture](#10-file-storage-architecture)
11. [UI/UX Guidelines](#11-uiux-guidelines)
12. [Success Metrics](#12-success-metrics)
13. [Risk Assessment](#13-risk-assessment)

---

## 1. Product Vision

### 1.1 The One-Liner

> **PrimeEditz** is a workflow management platform that transforms chaotic creative studio operations into a streamlined, professional experience for studios and their clients.

### 1.2 The Problem We Solve

| Problem                     | Impact                                      | Our Solution                               |
| --------------------------- | ------------------------------------------- | ------------------------------------------ |
| **Scattered Communication** | Lost requirements, endless WhatsApp threads | Unified request portal                     |
| **File Chaos**              | Wrong versions, lost assets, storage mess   | Organized folder structure with versioning |
| **Status Anxiety**          | "Is my work ready?" calls every day         | Real-time progress tracking                |
| **Manual Quotations**       | Hours wasted, inconsistent pricing          | Template-based instant quotes              |
| **No Accountability**       | Disputes over agreements                    | Complete audit trail                       |

### 1.3 The Product

PrimeEditz provides four interconnected portals:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PRIMEEDITZ                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   CLIENT    │  │   EDITOR    │  │   ADMIN     │  │ SUPERADMIN  │ │
│  │   PORTAL    │  │   PORTAL    │  │   PORTAL    │  │   PORTAL    │ │
│  │             │  │             │  │             │  │             │ │
│  │ • Request   │  │ • My Tasks  │  │ • All Events│  │ • Settings  │ │
│  │ • Upload    │  │ • Edit      │  │ • Sessions  │  │ • Templates │ │
│  │ • Track     │  │ • Submit    │  │ • Assign    │  │ • Pricing   │ │
│  │ • Approve   │  │ • Notes     │  │ • Review    │  │ • Users     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    SHARED INFRASTRUCTURE                       │  │
│  │                                                                │  │
│  │   Convex DB  │  Better Auth  │  R2/MinIO Storage  │  Real-time │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.4 Why Now?

- **Market Timing**: Post-pandemic shift to digital workflows for creative studios
- **Tech Maturity**: TanStack Start RC + Convex + Better Auth = production-ready stack
- **Competition Gap**: Existing solutions are either too expensive (Sprout Studio) or too generic (Notion, Trello)

---

## 2. Target Market & GTM Strategy

### 2.1 Target Customer Profile (ICP)

**Primary: Small-to-Medium Creative Studios**

| Attribute            | Value                                                  |
| -------------------- | ------------------------------------------------------ |
| **Team Size**        | 3-20 employees                                         |
| **Annual Revenue**   | ₹10L - ₹2Cr ($12K - $250K)                             |
| **Clients per Year** | 50-500                                                 |
| **Services**         | Wedding photography, corporate video, product shoots   |
| **Current Tools**    | WhatsApp, Google Drive, Excel, Email                   |
| **Pain Level**       | High — losing clients due to unprofessional experience |

**Secondary: Freelance Photographers/Videographers**

| Attribute            | Value                                                     |
| -------------------- | --------------------------------------------------------- |
| **Team Size**        | Solo or 1-2 contractors                                   |
| **Annual Revenue**   | ₹3L - ₹15L ($4K - $18K)                                   |
| **Clients per Year** | 20-100                                                    |
| **Pain Level**       | Medium — want to look professional without admin overhead |

### 2.2 Go-To-Market Strategy

#### Phase 1: Seed Users (Week 1-2)

| Channel              | Action                                   | Target          |
| -------------------- | ---------------------------------------- | --------------- |
| **Personal Network** | Reach out to known photographers/studios | 5 beta users    |
| **LinkedIn**         | Post about the problem, not the product  | 100 impressions |
| **WhatsApp Groups**  | Share in photography communities         | 10 signups      |

#### Phase 2: Early Adopters (Week 3-4)

| Channel             | Action                             | Target      |
| ------------------- | ---------------------------------- | ----------- |
| **Product Hunt**    | Soft launch with early access      | 100 signups |
| **Instagram Reels** | Show before/after workflow videos  | 1000 views  |
| **Reddit**          | r/photography, r/videography posts | 50 signups  |

#### Phase 3: Growth (Month 2+)

| Channel              | Action                                      | Target          |
| -------------------- | ------------------------------------------- | --------------- |
| **SEO Content**      | "How to manage photography studio workflow" | Organic traffic |
| **Referral Program** | Free month for referrals                    | Viral loop      |
| **Partnerships**     | Camera stores, photography schools          | Distribution    |

### 2.3 Pricing Strategy

**Freemium Model with Fair Limits**

| Plan           | Price           | Limits                            | Target          |
| -------------- | --------------- | --------------------------------- | --------------- |
| **Free**       | ₹0/mo           | 5 events, 5GB storage, 1 user     | Freelancers     |
| **Pro**        | ₹999/mo (~$12)  | 50 events, 50GB, 5 users          | Small studios   |
| **Business**   | ₹2499/mo (~$30) | Unlimited events, 200GB, 15 users | Growing studios |
| **Enterprise** | Custom          | Custom limits, priority support   | Large studios   |

### 2.4 Launch Week Goals

| Metric              | Target          |
| ------------------- | --------------- |
| **Beta Users**      | 10 active users |
| **Events Created**  | 25+             |
| **Assets Uploaded** | 500+ files      |
| **NPS Score**       | > 50            |
| **Critical Bugs**   | 0               |

---

## 3. Technology Stack

### 3.1 Core Stack

| Layer              | Technology                   | Justification                                                 |
| ------------------ | ---------------------------- | ------------------------------------------------------------- |
| **Framework**      | TanStack Start (RC 1.0)      | Type-safe routing, SSR, modern DX                             |
| **Language**       | TypeScript 5.x               | End-to-end type safety                                        |
| **Backend**        | Convex (Self-Hosted)         | Real-time DB, serverless functions, open-source, full control |
| **Authentication** | Better Auth + Convex Adapter | Full control, no vendor lock-in, works with Convex            |
| **File Storage**   | MinIO (dev & prod)           | S3-compatible, self-hosted, cost-effective                    |
| **Styling**        | Tailwind CSS v4              | Utility-first, rapid development                              |
| **UI Components**  | shadcn/ui + Radix            | Accessible, customizable                                      |
| **State**          | TanStack Query (via Convex)  | Automatic caching, live updates                               |
| **Helpers**        | convex-helpers               | CRUD utilities, custom functions, row-level security          |

### 3.2 Development Tools

| Tool               | Purpose                   |
| ------------------ | ------------------------- |
| **pnpm**           | Package manager           |
| **Vinxi**          | TanStack Start's bundler  |
| **Biome**          | Linting + formatting      |
| **Playwright**     | E2E testing               |
| **Docker**         | Convex & MinIO containers |
| **GitHub Actions** | CI/CD                     |

### 3.3 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION INFRASTRUCTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
  │  Cloudflare     │         │  Self-Hosted    │         │  Self-Hosted    │
  │  Pages          │────────▶│  Convex         │────────▶│  MinIO          │
  │  (Frontend)     │         │  (Backend)      │         │  (Storage)      │
  └─────────────────┘         └─────────────────┘         └─────────────────┘
         │                           │                           │
         │                    Docker + PostgreSQL          S3-Compatible
         │                                                       │
         └──────────────── TanStack Start SSR ──────────────────┘
```

| Environment        | Platform                                 |
| ------------------ | ---------------------------------------- |
| **Frontend**       | Cloudflare Pages                         |
| **Backend**        | Self-hosted Convex (Docker + PostgreSQL) |
| **Storage (Dev)**  | MinIO (Docker)                           |
| **Storage (Prod)** | MinIO (Self-hosted)                      |
| **Database**       | PostgreSQL (for Convex persistence)      |

### 3.4 Project Setup (Already Scaffolded)

> **Note**: TanStack Start with Convex is already scaffolded. Below are the additional dependencies.

```bash
# Install convex-helpers for CRUD, custom functions, and utilities
pnpm add convex-helpers

# Better Auth (if not already installed)
pnpm add better-auth @better-auth/convex

# UI dependencies
pnpm dlx shadcn@latest init
pnpm add @radix-ui/react-icons tailwindcss-animate class-variance-authority clsx tailwind-merge
```

### 3.5 Self-Hosted Convex Setup

```bash
# docker-compose.yml for Convex + PostgreSQL + MinIO
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: convex
      POSTGRES_PASSWORD: convex_password
      POSTGRES_DB: convex
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  convex-backend:
    image: ghcr.io/get-convex/convex-backend:latest
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgres://convex:convex_password@postgres:5432/convex
      SITE_URL: http://localhost:3000
    ports:
      - "3210:3210"

  convex-dashboard:
    image: ghcr.io/get-convex/convex-dashboard:latest
    depends_on:
      - convex-backend
    ports:
      - "6790:6790"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

volumes:
  postgres_data:
  minio_data:
```

### 3.6 Environment Variables

```bash
# .env.local (Development)
CONVEX_SELF_HOSTED_URL=http://localhost:3210
CONVEX_ADMIN_KEY=your_admin_key_here

# Storage (MinIO)
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=primeeditz
NEXT_PUBLIC_MINIO_PUBLIC_URL=http://localhost:9000

# Better Auth
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
```

---

## 4. User Personas & Roles

### 4.1 Role Hierarchy

```
                    SUPERADMIN
                   (Platform Owner)
                         │
           ┌─────────────┼─────────────┐
           │             │             │
         ADMIN       EMPLOYEE       CLIENT
      (Studio Mgr)      │
                   ┌────┴────┐
                EDITOR      QC
```

### 4.2 Role Definitions

#### CLIENT

```yaml
Who: End customer of the creative studio
Can:
  - Create event requests
  - Upload reference files
  - View own events and sessions
  - Upload assets to assigned folders
  - View and approve quotations
  - Review and approve albums
  - Download delivered assets
Cannot:
  - View other clients' data
  - Access admin/employee features
  - Modify pricing or templates
```

#### EMPLOYEE (Editor/QC)

```yaml
Who: Staff member who works on creative projects
Can:
  - View assigned projects
  - Download project assets
  - Upload edited assets (Editor)
  - Approve/Reject edits (QC)
  - Add notes and comments
Cannot:
  - View other employees' projects
  - Assign work
  - Access client personal details
  - Modify system settings
```

#### ADMIN (Studio Manager)

```yaml
Who: Manager who oversees operations
Can:
  - View all pending event requests
  - Create sessions and quotations
  - Assign employees to projects
  - Update event/session status
  - Manage client relationships
  - View reports and analytics
Cannot:
  - Modify system-level templates
  - Change pricing tiers
  - Manage other admins
```

#### SUPERADMIN (Platform Owner)

```yaml
Who: Owner of the creative studio
Can:
  - All Admin capabilities
  - Manage system settings
  - Create/edit event types
  - Manage quotation templates
  - Set storage pricing tiers
  - Create folder templates
  - Manage all users
```

---

## 5. Core Features — MVP

### 5.1 MVP Scope Definition

**Philosophy**: Ship the smallest thing that delivers value, then iterate.

**MVP = What we ship THIS WEEK**

| Feature                      | Included | Justification |
| ---------------------------- | :------: | ------------- |
| Authentication (Better Auth) |    ✅    | Foundation    |
| User Profiles & Roles        |    ✅    | Foundation    |
| Event Creation (Client)      |    ✅    | Core value    |
| Event Listing (Admin)        |    ✅    | Core value    |
| Session Creation (Admin)     |    ✅    | Core value    |
| Basic Quotation              |    ✅    | Core value    |
| Folder Structure             |    ✅    | Core value    |
| Asset Upload (Client)        |    ✅    | Core value    |
| Status Tracking              |    ✅    | Core value    |
| Project Management           |    ❌    | Phase 2       |
| Album Workflow               |    ❌    | Phase 2       |
| Notes/Collaboration          |    ❌    | Phase 3       |
| Analytics                    |    ❌    | Phase 3       |

### 5.2 Feature Details — MVP

#### 5.2.1 Authentication

**Better Auth + Convex Integration**

| Capability         | Implementation                  |
| ------------------ | ------------------------------- |
| Sign Up            | Email/Password via Better Auth  |
| Sign In            | Email/Password + OAuth (Google) |
| Protected Routes   | TanStack Router guards          |
| Session Management | Better Auth sessions in Convex  |
| Role Assignment    | Post-login onboarding flow      |

**Sign-Up Flow**:

```
Landing → Sign Up → Email Verification → Onboarding → Role Selection → Dashboard
```

#### 5.2.2 User Onboarding

**Flow**:

```
1. User signs up (email/password or Google)
2. Verify email (if email/password)
3. Complete profile:
   - Name
   - Phone
   - Company (optional)
4. Select role:
   - "I'm a client looking for photo/video services"
   - "I work at a creative studio"
5. Role-specific dashboard
```

#### 5.2.3 Event Creation (Client)

**User Story**: As a client, I want to submit an event request so the studio understands my requirements.

**Form Fields (Multi-Step)**:

| Step                | Fields                                                   |
| ------------------- | -------------------------------------------------------- |
| **1. Basic Info**   | Event Name, Event Type (dropdown), Event Date            |
| **2. Details**      | Venue/Location, Description, Additional Info             |
| **3. Requirements** | Expected Photo Count, Video Count, Storage Needs         |
| **4. References**   | Upload reference images/videos (max 20 files, 50MB each) |
| **5. Review**       | Summary of all info, Submit button                       |

**On Submit**:

- Create event with status `pending_review`
- Generate event code (EVT000001)
- Notify admin (in-app + optional email)

#### 5.2.4 Event Management (Admin)

**User Story**: As an admin, I want to view and manage client event requests.

**Capabilities**:

- View pending events (status: `pending_review`)
- View all events with filters (status, date, client)
- Open event detail to see all information
- Create sessions for events
- Update event status

#### 5.2.5 Session Creation (Admin)

**User Story**: As an admin, I want to create sessions for an event so work can be organized.

**Form Fields**:
| Field | Type | Notes |
|-------|------|-------|
| Session Name | Text | e.g., "Wedding Day Photos" |
| Session Type | Dropdown | Photo, Video, Combo |
| Scheduled Date | Date Picker | When the shoot happens |
| Location | Text (optional) | Where it happens |
| Folder Template | Dropdown | Pre-defined folder structure |
| Quotation Template | Dropdown | Pre-defined pricing |
| Storage Tier | Dropdown | 5GB, 10GB, 50GB, etc. |
| Notes | Textarea | Internal notes |

**On Submit**:

- Create session with status `scheduled`
- Create quotation (auto-calculated)
- Create session folders (from template)
- Link quotation to session
- Auto-transition event: `pending_review` → `planning`

#### 5.2.6 Basic Quotation

**User Story**: As a client, I want to see what I'm paying for so I can approve the work.

**Quotation Structure**:

```
┌─────────────────────────────────────────┐
│        QUOTATION #QT-000001             │
├─────────────────────────────────────────┤
│ Client: Priya Sharma                    │
│ Event: Wedding of Priya & Raj           │
│ Session: Wedding Day Photography        │
├─────────────────────────────────────────┤
│ Base Package: Premium Wedding    ₹50,000│
│ Storage: 50GB Tier               ₹10,000│
├─────────────────────────────────────────┤
│ Subtotal                         ₹60,000│
│ GST (18%)                        ₹10,800│
├─────────────────────────────────────────┤
│ TOTAL                            ₹70,800│
├─────────────────────────────────────────┤
│ Status: Awaiting Approval               │
│ [Approve] [Request Changes]             │
└─────────────────────────────────────────┘
```

**Quotation Statuses**:

- `draft` — Admin is editing
- `sent` — Client can view
- `approved` — Client accepted
- `rejected` — Client declined (with reason)

#### 5.2.7 Folder Structure

**User Story**: As a client, I want an organized place to upload my files.

**Folder Template System**:

```yaml
Template: "Standard Wedding"
Folders:
  - name: "Ceremony"
    description: "Photos from the wedding ceremony"
  - name: "Reception"
    description: "Photos from the reception"
  - name: "Candid"
    description: "Candid moments throughout the day"
  - name: "Portraits"
    description: "Formal portraits of couple and family"
```

**Session Folder Statuses**:

- `pending_upload` — Ready for client uploads
- `in_progress` — Client is uploading
- `completed` — Client finalized (locked)

#### 5.2.8 Asset Upload (Client)

**User Story**: As a client, I want to upload my raw photos/videos so the studio can edit them.

**Upload Flow**:

```
1. Client opens session
2. Selects folder to upload to
3. Drops/selects files (batch upload)
4. Progress indicator per file
5. Files uploaded directly to R2/MinIO
6. Metadata saved to Convex
7. Folder status: pending_upload → in_progress
```

**Upload Strategy** (from existing codebase):

1. Frontend requests signed URL from Convex action
2. Direct PUT to R2/MinIO with signed URL
3. On success, record metadata in Convex

**File Validation**:

- Max file size: 100MB (photos), 2GB (videos)
- Allowed types: jpg, jpeg, png, gif, mp4, mov, avi
- Max files per upload: 50

#### 5.2.9 Status Tracking

**User Story**: As a client, I want to see the status of my event without calling the studio.

**Event Status Flow**:

```
pending_review → planning → active → completed → archived
```

**Session Status Flow**:

```
scheduled → ready_to_upload → in_progress → uploaded → review → completed
```

**Client Dashboard Shows**:

- Event name and status
- Sessions with status
- Folder upload progress (X of Y files)
- Next action required (if any)

---

## 6. Shipping Strategy — This Week

### 6.1 Day-by-Day Plan

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      WEEK 1 SHIPPING PLAN                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DAY 1 (Today): FOUNDATION                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ □ Scaffold project with `npm create convex -- -t tanstack-start`             │
│ □ Set up Better Auth with Convex adapter                                     │
│ □ Configure Tailwind CSS v4 + shadcn/ui                                      │
│ □ Create basic layout (Sidebar, Header, Main Content)                        │
│ □ Implement sign-up/sign-in pages                                            │
│ □ Set up user profile creation flow                                          │
│ □ Port Convex schema from existing project (users, profiles, events)         │
│ GOAL: User can sign up, sign in, and see dashboard shell                     │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DAY 2: CLIENT PORTAL — Event Creation                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ □ Create event creation form (5-step wizard)                                 │
│ □ Port Convex mutations for event creation                                   │
│ □ Implement file upload for reference files                                  │
│ □ Create client dashboard with event listing                                 │
│ □ Implement event detail view (client perspective)                           │
│ GOAL: Client can create event request and see it in their dashboard          │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DAY 3: ADMIN PORTAL — Event & Session Management                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ □ Create admin dashboard layout                                              │
│ □ Build event listing page (admin view)                                      │
│ □ Build event detail page (admin view)                                       │
│ □ Create session creation form                                               │
│ □ Port session mutations/queries                                             │
│ □ Implement folder template selection                                        │
│ GOAL: Admin can view events and create sessions                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DAY 4: QUOTATION & UPLOAD FLOW                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ □ Build quotation creation (attached to session)                             │
│ □ Build quotation view (client)                                              │
│ □ Implement quotation approval flow                                          │
│ □ Build folder view with upload UI                                           │
│ □ Port storage actions (signed URL generation)                               │
│ □ Implement direct upload to R2/MinIO                                        │
│ GOAL: Complete flow: Event → Session → Quotation → Upload                    │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DAY 5: SUPERADMIN & POLISH                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ □ Build superadmin settings pages                                            │
│   □ Event types management                                                   │
│   □ Quotation templates                                                      │
│   □ Storage pricing tiers                                                    │
│   □ Folder templates                                                         │
│ □ Polish UI/UX across all pages                                              │
│ □ Add loading states, error handling                                         │
│ □ Test complete user journeys                                                │
│ GOAL: Superadmin can configure system; all flows polished                    │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DAY 6-7 (Weekend): TESTING & DEPLOYMENT                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ □ End-to-end testing of all user journeys                                    │
│ □ Fix critical bugs                                                          │
│ □ Deploy to production (Vercel/Cloudflare)                                   │
│ □ Configure production Convex deployment                                     │
│ □ Set up R2 for production storage                                           │
│ □ Invite 5-10 beta users                                                     │
│ GOAL: Production deployment with beta users                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 What We're Reusing vs Building Fresh

| Component                |  Reuse  | Build Fresh | Notes                                        |
| ------------------------ | :-----: | :---------: | -------------------------------------------- |
| Convex Schema            | Partial |   Partial   | Port & improve with computed fields          |
| Convex Queries/Mutations | Partial |   Partial   | Port logic, restructure to feature folders   |
| Storage Provider Logic   |   ✅    |             | MinIO abstraction (move to lib/storage.ts)   |
| UI Components (shadcn)   |   ✅    |             | Copy over                                    |
| Authentication           |         |     ✅      | Better Auth (already scaffolded)             |
| Routing                  |         |     ✅      | TanStack Router replaces Next.js             |
| Layout/Navigation        |         |     ✅      | New patterns for TanStack                    |
| Event Forms              | Partial |   Partial   | Port form logic, rebuild UI                  |
| Dashboard Pages          |         |     ✅      | New component structure                      |
| **Domain-Based Convex**  |   ❌    |             | **SCRAPPED** — using feature-based structure |
| **convex-helpers**       |         |     ✅      | **NEW** — Custom functions, CRUD utilities   |

### 6.3 MVP Acceptance Criteria

**Before we ship, ALL of these must work**:

| #   | Criteria                             | Test        |
| --- | ------------------------------------ | ----------- |
| 1   | User can sign up with email/password | Manual test |
| 2   | User can sign in                     | Manual test |
| 3   | User can complete onboarding         | Manual test |
| 4   | Client can create event request      | Manual test |
| 5   | Client can upload reference files    | Manual test |
| 6   | Admin can view pending events        | Manual test |
| 7   | Admin can create session             | Manual test |
| 8   | Admin can generate quotation         | Manual test |
| 9   | Client can view quotation            | Manual test |
| 10  | Client can approve quotation         | Manual test |
| 11  | Client can upload assets to folders  | Manual test |
| 12  | Client can see their event status    | Manual test |
| 13  | No critical console errors           | Dev tools   |
| 14  | Mobile responsive                    | Device test |

---

## 7. Feature Phases — Post-MVP

### 7.1 Phase 2: Editing Workflow (Week 2-3)

| Feature             | Priority | Description                          |
| ------------------- | -------- | ------------------------------------ |
| Project Creation    | P0       | Create project from uploaded session |
| Employee Dashboard  | P0       | View assigned projects               |
| Asset Download      | P0       | Download assets for editing          |
| Edited Asset Upload | P0       | Upload edited versions               |
| Asset Versioning    | P0       | Track version history                |
| QC Review           | P1       | Approve or request rework            |
| Project Status Flow | P0       | Track through workflow               |

### 7.2 Phase 3: Delivery & Albums (Week 4)

| Feature         | Priority | Description                |
| --------------- | -------- | -------------------------- |
| Album Creation  | P1       | Create from project assets |
| Album Preview   | P1       | Client views album         |
| Album Feedback  | P1       | Threaded comments          |
| Album Approval  | P1       | Client approves final      |
| Download Portal | P1       | Secure download links      |

### 7.3 Phase 4: Collaboration & Analytics (Month 2)

| Feature             | Priority | Description                   |
| ------------------- | -------- | ----------------------------- |
| Notes System        | P2       | Threaded comments on projects |
| Notifications       | P2       | In-app + email alerts         |
| Analytics Dashboard | P2       | Business metrics              |
| Payment Integration | P2       | Collect payments              |

---

## 8. Data Architecture

### 8.1 Convex Backend Structure (Feature-Based + convex-helpers)

**Design Principles:**

- ✅ Feature-based organization (not domain-based)
- ✅ Files kept to **100-200 lines** maximum
- ✅ `convex-helpers` for CRUD utilities and auth wrappers
- ✅ Clear separation: queries, mutations, internal helpers

```
convex/
├── _generated/                    # Auto-generated (Convex)
│
├── schema.ts                      # All table definitions (~200 lines)
├── convex.config.ts               # Register Better Auth component
├── http.ts                        # Better Auth routes + webhooks
│
├── functions/                     # 📁 All queries, mutations, actions
│   │
│   ├── events/
│   │   ├── queries.ts             # ~80 lines: listMy, listPending, get, getByCode
│   │   ├── mutations.ts           # ~100 lines: create, update, updateStatus
│   │   └── internal.ts            # ~50 lines: generateCode, validateEvent
│   │
│   ├── sessions/
│   │   ├── queries.ts             # ~80 lines: listByEvent, get
│   │   ├── mutations.ts           # ~100 lines: create, update, updateStatus
│   │   └── internal.ts            # ~50 lines: createFolders
│   │
│   ├── quotations/
│   │   ├── queries.ts             # ~60 lines: get, getBySession
│   │   ├── mutations.ts           # ~80 lines: create, approve, reject
│   │   └── internal.ts            # ~40 lines: calculateTotal
│   │
│   ├── assets/
│   │   ├── queries.ts             # ~60 lines: listByFolder, get
│   │   ├── mutations.ts           # ~80 lines: recordUpload, delete
│   │   └── actions.ts             # ~100 lines: getUploadUrl, getDownloadUrl
│   │
│   ├── users/
│   │   ├── queries.ts             # ~60 lines: getProfile, getMyProfile
│   │   ├── mutations.ts           # ~80 lines: createProfile, updateProfile
│   │   └── internal.ts            # ~40 lines: getUserByExternalId
│   │
│   └── config/                    # Configuration CRUD (auto-generated)
│       ├── eventTypes.ts          # ~20 lines (using CRUD helper)
│       ├── folderTemplates.ts     # ~30 lines
│       ├── quotationTemplates.ts  # ~20 lines
│       └── storageTiers.ts        # ~20 lines
│
├── lib/                           # 🛠 Shared utilities
│   ├── customFunctions.ts         # ~100 lines: authenticatedQuery, adminQuery, etc.
│   ├── validators.ts              # ~50 lines: shared validators
│   ├── helpers.ts                 # ~80 lines: formatCode, timestamps
│   └── storage.ts                 # ~100 lines: MinIO signed URL helpers
│
└── components/                    # 📦 Registered in convex.config.ts
    └── (Better Auth Component)
```

**API Path Examples:**
| Function | API Path |
|----------|----------|
| List my events | `api.functions.events.queries.listMy` |
| Create event | `api.functions.events.mutations.create` |
| Get upload URL | `api.functions.assets.actions.getUploadUrl` |
| List event types | `api.functions.config.eventTypes.list` |

---

### 8.2 convex-helpers Integration

#### 8.2.1 Custom Functions (Auth Wrappers)

```typescript
// convex/lib/customFunctions.ts
import {
  customQuery,
  customMutation,
  customAction,
} from "convex-helpers/server/customFunctions";
import { query, mutation, action } from "../_generated/server";
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

// User context type after authentication
export type AuthenticatedUser = {
  id: string;
  role: "client" | "employee" | "admin" | "superadmin";
  profileId: string;
  clientProfileId?: string;
  employeeProfileId?: string;
};

// Get authenticated user or throw
async function getAuthenticatedUser(
  ctx: QueryCtx | MutationCtx
): Promise<AuthenticatedUser> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .unique();

  if (!profile) {
    throw new Error("User profile not found. Complete onboarding first.");
  }

  return {
    id: identity.subject,
    role: profile.role,
    profileId: profile._id,
    clientProfileId:
      profile.role === "client" ? profile.clientProfileId : undefined,
    employeeProfileId:
      profile.role === "employee" ? profile.employeeProfileId : undefined,
  };
}

// =====================
// Authenticated Wrappers
// =====================

export const authenticatedQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return { ctx: { ...ctx, user }, args };
  },
});

export const authenticatedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return { ctx: { ...ctx, user }, args };
  },
});

// =====================
// Role-Specific Wrappers
// =====================

export const clientQuery = customQuery(authenticatedQuery, {
  args: {},
  input: async (ctx, args) => {
    if (ctx.user.role !== "client") {
      throw new Error("Client access required");
    }
    return { ctx, args };
  },
});

export const clientMutation = customMutation(authenticatedMutation, {
  args: {},
  input: async (ctx, args) => {
    if (ctx.user.role !== "client") {
      throw new Error("Client access required");
    }
    return { ctx, args };
  },
});

export const adminQuery = customQuery(authenticatedQuery, {
  args: {},
  input: async (ctx, args) => {
    if (!["admin", "superadmin"].includes(ctx.user.role)) {
      throw new Error("Admin access required");
    }
    return { ctx, args };
  },
});

export const adminMutation = customMutation(authenticatedMutation, {
  args: {},
  input: async (ctx, args) => {
    if (!["admin", "superadmin"].includes(ctx.user.role)) {
      throw new Error("Admin access required");
    }
    return { ctx, args };
  },
});

export const superadminMutation = customMutation(authenticatedMutation, {
  args: {},
  input: async (ctx, args) => {
    if (ctx.user.role !== "superadmin") {
      throw new Error("Superadmin access required");
    }
    return { ctx, args };
  },
});
```

#### 8.2.2 CRUD Utilities for Config Tables

```typescript
// convex/functions/config/eventTypes.ts
import { crud } from "convex-helpers/server/crud";
import schema from "../../schema";
import {
  adminQuery,
  adminMutation,
  superadminMutation,
} from "../../lib/customFunctions";

// Auto-generate CRUD with admin auth
export const {
  create, // adminMutation
  read, // adminQuery
  update, // adminMutation
  destroy, // superadminMutation (prevent accidental deletes)
  paginate, // adminQuery
} = crud(schema, "eventTypes", adminQuery, adminMutation);

// Custom query for active event types (public for forms)
export const listActive = adminQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("eventTypes")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});
```

#### 8.2.3 Example Feature File (Events Queries)

```typescript
// convex/functions/events/queries.ts
import { v } from "convex/values";
import {
  authenticatedQuery,
  clientQuery,
  adminQuery,
} from "../../lib/customFunctions";

// Client: List my events
export const listMy = clientQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("events")
      .withIndex("by_client", (q) =>
        q.eq("clientId", ctx.user.clientProfileId!)
      )
      .order("desc")
      .collect();
  },
});

// Client: Get single event (with ownership check)
export const get = clientQuery({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    if (event.clientId !== ctx.user.clientProfileId) {
      throw new Error("Access denied");
    }
    return event;
  },
});

// Admin: List pending events
export const listPending = adminQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "pending_review"))
      .order("desc")
      .collect();
  },
});

// Admin: List all events with filters
export const listAll = adminQuery({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit }) => {
    let query = ctx.db.query("events");

    if (status) {
      query = query.withIndex("by_status", (q) =>
        q.eq("status", status as any)
      );
    }

    const events = await query.order("desc").take(limit ?? 50);
    return events;
  },
});

// Admin: Get event by code
export const getByCode = adminQuery({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return ctx.db
      .query("events")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
  },
});
```

---

### 8.3 Convex Schema (Improved MVP Schema)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// =====================
// REUSABLE VALIDATORS
// =====================

const roleValidator = v.union(
  v.literal("client"),
  v.literal("employee"),
  v.literal("admin"),
  v.literal("superadmin")
);

const userStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("pending")
);

const employeeTypeValidator = v.union(
  v.literal("editor"),
  v.literal("qc"),
  v.literal("photographer")
);

const eventStatusValidator = v.union(
  v.literal("pending_review"),
  v.literal("planning"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("archived")
);

const sessionStatusValidator = v.union(
  v.literal("scheduled"),
  v.literal("ready_to_upload"),
  v.literal("in_progress"),
  v.literal("uploaded"),
  v.literal("review"),
  v.literal("completed")
);

const folderStatusValidator = v.union(
  v.literal("pending_upload"),
  v.literal("in_progress"),
  v.literal("completed")
);

const quotationStatusValidator = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("approved"),
  v.literal("rejected")
);

// =====================
// SCHEMA DEFINITION
// =====================

export default defineSchema({
  // ─────────────────────────
  // IDENTITY (Better Auth manages base user)
  // ─────────────────────────

  // User profile linked to Better Auth user
  userProfiles: defineTable({
    userId: v.string(), // Better Auth user ID (external)
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: roleValidator,
    status: userStatusValidator,
    // Linked profile (one of these will be set based on role)
    clientProfileId: v.optional(v.id("clientProfiles")),
    employeeProfileId: v.optional(v.id("employeeProfiles")),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),

  clientProfiles: defineTable({
    userProfileId: v.id("userProfiles"),
    companyName: v.optional(v.string()),
    address: v.optional(v.string()),
    // Computed stats (updated on changes)
    totalEvents: v.number(),
    totalStorageUsed: v.number(), // bytes
  }).index("by_userProfile", ["userProfileId"]),

  employeeProfiles: defineTable({
    userProfileId: v.id("userProfiles"),
    employeeType: employeeTypeValidator,
    skills: v.array(v.string()),
    // Computed stats
    activeProjects: v.number(),
  })
    .index("by_userProfile", ["userProfileId"])
    .index("by_type", ["employeeType"]),

  // ─────────────────────────
  // CONFIGURATION
  // ─────────────────────────

  eventTypes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_active", ["isActive"])
    .index("by_name", ["name"]),

  folderTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  // Separate table for folder definitions (normalized)
  folderDefinitions: defineTable({
    templateId: v.id("folderTemplates"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
  }).index("by_template", ["templateId"]),

  quotationTemplates: defineTable({
    name: v.string(),
    basePrice: v.number(),
    gstPercent: v.number(), // e.g., 18
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  storageTiers: defineTable({
    name: v.string(), // e.g., "5GB", "50GB"
    sizeBytes: v.number(),
    price: v.number(),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  // ─────────────────────────
  // EVENTS
  // ─────────────────────────

  events: defineTable({
    clientId: v.id("clientProfiles"),
    eventTypeId: v.id("eventTypes"),
    // Core fields
    code: v.string(), // EVT000001
    name: v.string(),
    date: v.number(), // timestamp
    venue: v.optional(v.string()),
    description: v.optional(v.string()),
    // Reference files (MinIO storage keys)
    referenceFiles: v.array(v.string()),
    // Status
    status: eventStatusValidator,
    // Computed stats
    sessionCount: v.number(),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_code", ["code"])
    .index("by_date", ["date"]),

  // ─────────────────────────
  // SESSIONS
  // ─────────────────────────

  sessions: defineTable({
    eventId: v.id("events"),
    // Core fields
    name: v.string(),
    type: v.union(v.literal("photo"), v.literal("video"), v.literal("combo")),
    scheduledDate: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    // Status
    status: sessionStatusValidator,
    // Template used (for reference)
    folderTemplateId: v.optional(v.id("folderTemplates")),
    // Computed stats
    folderCount: v.number(),
    assetCount: v.number(),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_status", ["status"]),

  sessionFolders: defineTable({
    sessionId: v.id("sessions"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    status: folderStatusValidator,
    // Computed
    assetCount: v.number(),
  }).index("by_session", ["sessionId"]),

  // ─────────────────────────
  // QUOTATIONS
  // ─────────────────────────

  quotations: defineTable({
    sessionId: v.id("sessions"),
    clientId: v.id("clientProfiles"),
    // Template references
    templateId: v.id("quotationTemplates"),
    storageTierId: v.id("storageTiers"),
    // Pricing (stored, not computed on read)
    basePrice: v.number(),
    storagePrice: v.number(),
    subtotal: v.number(),
    gstPercent: v.number(),
    gstAmount: v.number(),
    total: v.number(),
    // Optional note
    note: v.optional(v.string()),
    // Status
    status: quotationStatusValidator,
    approvedAt: v.optional(v.number()),
    rejectedReason: v.optional(v.string()),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"]),

  // ─────────────────────────
  // ASSETS
  // ─────────────────────────

  assets: defineTable({
    sessionId: v.id("sessions"),
    folderId: v.id("sessionFolders"),
    // File info
    filename: v.string(),
    storageKey: v.string(), // MinIO key
    size: v.number(), // bytes
    contentType: v.string(),
    // Metadata
    uploadedBy: v.id("userProfiles"),
    uploadedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_folder", ["folderId"])
    .index("by_uploadedBy", ["uploadedBy"]),

  // ─────────────────────────
  // COUNTERS (for code generation)
  // ─────────────────────────

  counters: defineTable({
    type: v.string(), // "event", "quotation"
    value: v.number(),
  }).index("by_type", ["type"]),
});
```

---

### 8.4 Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENTITY RELATIONSHIP DIAGRAM                         │
└─────────────────────────────────────────────────────────────────────────────┘

  Better Auth                userProfiles
  (External)                      │
      │                    ┌──────┴──────┐
      │                    │             │
      └────────────────────▶  CLIENT   EMPLOYEE
                           │ PROFILE    PROFILE
                           │             │
                           │             │
                           ▼             │
                        events           │
                           │             │
                           ├──1:N──▶ sessions ◀────── (future: projects)
                           │             │
                           │    ┌────────┼────────┐
                           │    │        │        │
                           │    ▼        ▼        ▼
                           │ folders  quotation  assets
                           │    │                   │
                           │    └───────────────────┘
                           │         (assets in folders)
                           │
  ┌────────────────────────┴────────────────────────┐
  │                 CONFIGURATION                    │
  │                                                  │
  │  eventTypes  folderTemplates  quotationTemplates │
  │              folderDefinitions    storageTiers   │
  └──────────────────────────────────────────────────┘
```

**Key Relationships:**

- `userProfiles` → `clientProfiles` OR `employeeProfiles` (1:1, based on role)
- `clientProfiles` → `events` (1:N)
- `events` → `sessions` (1:N)
- `sessions` → `quotations` (1:1)
- `sessions` → `sessionFolders` (1:N)
- `sessionFolders` → `assets` (1:N)
- `folderTemplates` → `folderDefinitions` (1:N)

---

## 9. Authentication Architecture

### 9.1 Better Auth + Convex Integration

**Why Better Auth?**

- No vendor lock-in (unlike Clerk)
- Works natively with Convex
- Full control over auth logic
- Free at any scale

**Architecture**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

  Browser                         TanStack Start              Convex
     │                                  │                        │
     │   1. User signs up               │                        │
     │ ─────────────────────────────────▶                        │
     │                                  │                        │
     │               2. Call Better Auth mutation                │
     │                                  │───────────────────────▶│
     │                                  │                        │
     │                                  │  3. Create user,       │
     │                                  │     hash password,     │
     │                                  │     create session     │
     │                                  │◀───────────────────────│
     │                                  │                        │
     │   4. Return session cookie       │                        │
     │ ◀─────────────────────────────────                        │
     │                                  │                        │
     │   5. Subsequent requests include cookie                   │
     │ ─────────────────────────────────▶   6. Validate session  │
     │                                  │───────────────────────▶│
     │                                  │                        │
     │                                  │  7. Return user data   │
     │                                  │◀───────────────────────│
     │                                  │                        │
```

### 9.2 Implementation Files

```
convex/
├── convex.config.ts     # Register Better Auth component
├── auth.ts              # Better Auth server config
├── auth.client.ts       # Better Auth client config
└── http.ts              # Mount auth routes

app/
├── routes/
│   ├── auth/
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── verify.tsx
│   └── __root.tsx       # Auth provider wrapper
```

### 9.3 Protected Routes

```typescript
// TanStack Router with auth guards
export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth/sign-in" });
    }
    return { user: session.user };
  },
  component: DashboardPage,
});
```

---

## 10. File Storage Architecture

### 10.1 Storage Provider Strategy

**Same as v1**: Environment-based switching between R2 and MinIO.

```typescript
// Configured via environment variable
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || "r2";

// Development: MinIO (Docker)
// Production: Cloudflare R2
```

### 10.2 Upload Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UPLOAD FLOW                                          │
└─────────────────────────────────────────────────────────────────────────────┘

    Client                    TanStack Start                 Convex                  R2/MinIO
       │                            │                          │                        │
       │  1. Select file            │                          │                        │
       │                            │                          │                        │
       │  2. Request upload URL     │                          │                        │
       │ ───────────────────────────▶                          │                        │
       │                            │  3. Call action          │                        │
       │                            │ ─────────────────────────▶                        │
       │                            │                          │  4. Generate signed URL│
       │                            │                          │ ───────────────────────▶
       │                            │                          │                        │
       │                            │                          │◀───────────────────────│
       │                            │◀─────────────────────────│  5. Return URL         │
       │◀───────────────────────────│                          │                        │
       │                            │                          │                        │
       │  6. PUT file directly      │                          │                        │
       │ ─────────────────────────────────────────────────────────────────────────────▶│
       │                            │                          │                        │
       │  7. 200 OK                 │                          │                        │
       │◀─────────────────────────────────────────────────────────────────────────────│
       │                            │                          │                        │
       │  8. Record metadata        │                          │                        │
       │ ───────────────────────────▶  9. Mutation             │                        │
       │                            │ ─────────────────────────▶                        │
       │                            │                          │  10. Save to DB        │
       │                            │◀─────────────────────────│                        │
       │◀───────────────────────────│                          │                        │
       │  11. Done!                 │                          │                        │
```

### 10.3 Storage Key Structure

```
clients/{clientId}/events/{eventCode}/sessions/{sessionId}/{folderId}/{filename}

Example:
clients/abc123/events/EVT000001/sessions/ses456/ceremony/DSC_0001.jpg
```

---

## 11. UI/UX Guidelines

### 11.1 Design System

| Token       | Value           | Usage                      |
| ----------- | --------------- | -------------------------- |
| **Primary** | Blue (#3B82F6)  | CTAs, links, focus         |
| **Success** | Green (#10B981) | Positive status            |
| **Warning** | Amber (#F59E0B) | Attention needed           |
| **Error**   | Red (#EF4444)   | Errors, destructive        |
| **Neutral** | Slate           | Text, borders, backgrounds |

### 11.2 Component Library

Using **shadcn/ui** with customizations:

- Button, Input, Select, Card, Dialog, Table
- Form components with React Hook Form
- Toast notifications

### 11.3 Layout Patterns

**Dashboard Layout**:

```
┌─────────────────────────────────────────────────────┐
│  HEADER (User menu, notifications)                  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │            MAIN CONTENT                  │
│          │                                          │
│ • Home   │  ┌────────────────────────────────────┐  │
│ • Events │  │  PAGE HEADER                       │  │
│ • Settings  │  └────────────────────────────────────┘  │
│          │                                          │
│          │  ┌────────────────────────────────────┐  │
│          │  │  PAGE CONTENT                      │  │
│          │  │                                    │  │
│          │  │                                    │  │
│          │  └────────────────────────────────────┘  │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### 11.4 Mobile First

All layouts must work on:

- Mobile (375px+)
- Tablet (768px+)
- Desktop (1024px+)

---

## 12. Success Metrics

### 12.1 Week 1 (Launch Week)

| Metric          | Target |
| --------------- | ------ |
| Users Signed Up | 10     |
| Events Created  | 5      |
| Assets Uploaded | 100    |
| Critical Bugs   | 0      |
| Uptime          | 99%+   |

### 12.2 Month 1

| Metric                   | Target     |
| ------------------------ | ---------- |
| Active Users             | 25         |
| Events Created           | 50         |
| Quotations Approved      | 20         |
| Average Session Duration | 5+ minutes |
| NPS Score                | > 40       |

### 12.3 Month 3

| Metric                 | Target |
| ---------------------- | ------ |
| Paying Customers       | 5      |
| MRR                    | ₹5,000 |
| Client → Repeat Client | 30%    |
| Referrals              | 3+     |

---

## 13. Risk Assessment

### 13.1 Technical Risks

| Risk                       | Probability | Impact | Mitigation                         |
| -------------------------- | ----------- | ------ | ---------------------------------- |
| TanStack Start bugs (RC)   | Medium      | High   | Follow docs closely, report issues |
| Better Auth learning curve | Low         | Medium | Use official examples              |
| Upload failures            | Medium      | High   | Implement retry logic              |
| Convex rate limits         | Low         | Medium | Optimize queries                   |

### 13.2 Timeline Risks

| Risk                     | Probability | Impact | Mitigation              |
| ------------------------ | ----------- | ------ | ----------------------- |
| Scope creep              | High        | High   | Strict MVP definition   |
| Auth complexity          | Medium      | Medium | Follow official guide   |
| UI polish takes too long | Medium      | Medium | Ship ugly, polish later |

### 13.3 Business Risks

| Risk                         | Probability | Impact | Mitigation          |
| ---------------------------- | ----------- | ------ | ------------------- |
| No users sign up             | Medium      | High   | Pre-launch outreach |
| Users don't understand value | Medium      | Medium | Clear onboarding    |
| Competition                  | Low         | Medium | Move fast, iterate  |

---

## Document Changelog

| Version | Date       | Author         | Changes                                                                                         |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------- |
| 1.0     | 2025-12-27 | Mary           | Initial PRD (Next.js + Clerk)                                                                   |
| 2.0     | 2025-12-27 | Winston & Mary | Complete rewrite for TanStack Start + Better Auth, product-centric focus, GTM strategy          |
| 2.1     | 2025-12-27 | Winston & Mary | Self-hosted Convex, MinIO for prod, feature-based organization, convex-helpers, improved schema |

---

**Document Status**: ✅ Active — Ready for Implementation

**Architecture Decisions Finalized**:

- ✅ TanStack Start (RC 1.0) — Frontend framework
- ✅ Better Auth + Convex Adapter — Authentication
- ✅ Convex (Self-Hosted) — Backend with Docker + PostgreSQL
- ✅ MinIO — File storage for dev and prod
- ✅ Cloudflare Pages — Frontend hosting
- ✅ convex-helpers — Custom functions, CRUD utilities
- ✅ Feature-based file organization — Files kept to 100-200 lines
- ✅ pnpm — Package manager

**Next Steps**:

1. ✅ Review and approve PRD
2. ⏳ Begin Day 1: Foundation setup
3. ⏳ Configure self-hosted Convex with Docker
4. ⏳ Set up Better Auth integration
5. ⏳ Build MVP features day by day
6. ⏳ Ship by end of week!

---

_This PRD was created by Winston (Architect) & Mary (Analyst)_  
_Let's build something great, Life-design!_ 🏗️📊
