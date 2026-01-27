# Epic 11C: Studio Portal Revamp

**Parent Epic**: [11: System Architecture Revamp](./11-system-restructuring-revamp.md)  
**Status**: Pending (Blocked by 11A)  
**Created**: 2026-01-23  
**Complexity**: High  
**Estimated Points**: 34

---

## 📋 Epic Summary

This epic **transforms the Studio (formerly Client) experience** from a project-centric wizard to a **quotation-driven flow**. Studios will request packages, and projects are auto-created upon quote approval. The existing wizard is repurposed for "onboarding" (uploading reference files after project creation).

---

## 🎯 User Outcomes

| Role       | Outcome                                                          |
| :--------- | :--------------------------------------------------------------- |
| **Studio** | Request a quote by selecting a package and naming the end client |
| **Studio** | See all quote requests and their statuses                        |
| **Studio** | View projects grouped by End Client name                         |
| **Studio** | Upload reference files after project creation (onboarding)       |

---

## 📝 User Stories

### Story 11C.1: Quote Request Flow (Replaces Wizard Entry)

**Points**: 8

**As a** Studio,  
**I want** to request a quote by selecting a package template,  
**So that** I can quickly get pricing for my end client.

**Acceptance Criteria**:

- [ ] On Studio Dashboard, the primary CTA is "Request Quote" (not "New Project").
- [ ] Clicking "Request Quote" opens a modal/page with:
  - **Step 1**: Select Package Template (e.g., "Gold Wedding Package", "Pre-Wedding Basic")
  - **Step 2**: Enter End Client Name (required) and Event Date (optional)
  - **Step 3**: Review selected package and submit
- [ ] Submitting creates a quotation request with:
  - `status: 'initiated'` (indicates a studio's raw request)
  - `clientId` = Studio's profile ID
  - `endClientName` stored on quote (new field)
  - Template's line items copied to this quotation instance
- [ ] Studio is redirected to "My Quote Requests" list.

**Technical Notes**:

- New component: `src/components/modules/studio/quote-request/quote-request-wizard.tsx`
- Replaces the project wizard for Studios.
- Route: `/studio/quotes/new` (if using new route structure).

**UX Design Notes**:

- Package cards should show: Name, Description, Starting Price, Key Inclusions
- Mobile-first layout with clear visual hierarchy
- Success state: "Your quote request has been sent! We'll get back to you soon."

---

### Story 11C.2: "My Quote Requests" List View

**Points**: 5

**As a** Studio,  
**I want** to see all my quote requests and their statuses,  
**So that** I can track which quotes are pending, approved, or rejected.

**Acceptance Criteria**:

- [ ] Route: `/studio/quotes` (or equivalent).
- [ ] List shows all quotations where `clientId = myProfileId`.
- [ ] Each row displays: Quote Code, End Client Name, Package Name, Status Badge, Last Updated.
- [ ] Status badges: `pending_review` (yellow), `sent` (blue), `approved` (green), `rejected` (red).
- [ ] Clicking a row navigates to Quote Detail.
- [ ] Real-time subscription updates list when status changes.

**Technical Notes**:

- Query: `api.quotations.getForClient` (may already exist).
- Reuse `QuotationCard` component if exists, or create new.

---

### Story 11C.3: "My Projects" Grouped by End Client

**Points**: 5

**As a** Studio,  
**I want** to see my projects organized by End Client name,  
**So that** I can quickly find all work related to a specific customer.

**Acceptance Criteria**:

- [ ] Route: `/studio/projects`.
- [ ] Projects are grouped by `endClientName`.
- [ ] Each group shows: End Client Name as header, count of projects.
- [ ] Within each group, list projects: Code, Type, Phase, CTA.
- [ ] If project needs onboarding (no reference files), show "Upload Files" CTA.
- [ ] If project is in progress, show "View Details" CTA.
- [ ] Empty state: "No projects yet. Request a quote to get started."

**Technical Notes**:

- Query: `api.projects.getForClient` → Group by `endClientName` in frontend or backend.
- Consider a `getProjectsGroupedByEndClient` utility query.

---

### Story 11C.4: Project Onboarding Card

**Points**: 5

**As a** Studio,  
**I want** to see a clear prompt to upload reference files for newly created projects,  
**So that** I know what action is needed from me.

**Acceptance Criteria**:

- [ ] On the "My Projects" page, projects needing action have an "Onboarding Needed" badge.
- [ ] The project card shows:
  - "Your project is ready! Upload your reference files to get started."
  - "Upload Files" button → Opens onboarding wizard.
- [ ] Once onboarding is complete (files uploaded + notes added), the card updates to "Ready for Editing".
- [ ] A progress tracker shows: ☑ Project Created → ☐ Files Uploaded → ☐ In Progress → ☐ Delivered.

**Technical Notes**:

- New component: `src/components/modules/studio/projects/project-onboarding-card.tsx`.
- Determine onboarding state by checking `referenceFiles.length` or a new flag.

---

### Story 11C.5: Repurpose Wizard for Onboarding Only

**Points**: 5

**As a** Studio,  
**I want** to use a simplified version of the project wizard to upload files and add notes,  
**So that** I can complete my project setup.

**Acceptance Criteria**:

- [ ] Create a new wizard mode: `mode = 'onboarding'`.
- [ ] Onboarding wizard shows only:
  - Step 1: Reference Files (Step 3 of original)
  - Step 2: Description & Notes (Step 4 of original)
  - Step 3: Review & Confirm (Step 5 of original)
- [ ] The wizard receives `projectId` from the URL (project already exists).
- [ ] Submitting updates the existing project, does NOT create a new one.
- [ ] After submission, redirect to Project Detail.

**Technical Notes**:

- File: `src/components/modules/projects/wizard/project-wizard.tsx`
- Add `mode: 'client' | 'admin' | 'onboarding'` prop.
- Conditionally render steps based on mode.

---

### Story 11C.6: Studio Project Detail View

**Points**: 3

**As a** Studio,  
**I want** to view the details of my project including its linked quotation,  
**So that** I can understand the scope and track progress.

**Acceptance Criteria**:

- [ ] Route: `/studio/projects/[projectId]`.
- [ ] Display: Project Code, Type, End Client Name, Current Phase.
- [ ] Show "Linked Quotation" section with: Quote Code, Package Name, Total Amount, "View Quotation" link.
- [ ] Show Reference Files section (read-only after submission).
- [ ] Show Description & Notes.
- [ ] Show Deliverables section (when available).

**Technical Notes**:

- Enhance existing Client Project Detail or create new.
- Use `quotationId` to fetch linked quotation.

---

### Story 11C.7: Deprecate Steps 0-2 for Studio Mode

**Points**: 3

**As a** Developer,  
**I want** to ensure Studios cannot access the old "New Project" wizard steps,  
**So that** they follow the quotation flow.

**Acceptance Criteria**:

- [ ] If a Studio navigates to `/studio/projects/new`, redirect to `/studio/quotes/new`.
- [ ] The project wizard `mode = 'client'` now only works in onboarding context.
- [ ] Step 0 (Client Selection) and Step 1/2 (Type Selection/Details) are only shown for `mode = 'admin'`.
- [ ] Update sidebar navigation: Remove "New Project" for Studios.

**Technical Notes**:

- Conditional rendering in `project-wizard.tsx`.
- Update sidebar config in `src/components/modules/sidebar/nav-config.ts`.

---

## ✅ Definition of Done

- [ ] Studios can request quotes via package selection.
- [ ] Studios can view their quote requests and statuses.
- [ ] Studios see projects grouped by End Client.
- [ ] Studios can complete onboarding (upload files) for auto-created projects.
- [ ] Old project wizard is no longer accessible to Studios.

---

## 🔗 Dependencies

| Depends On   | Notes                                                |
| :----------- | :--------------------------------------------------- |
| **Epic 11A** | Schema changes must be complete                      |
| **Epic 11B** | Projects must be spawned on quote approval (partial) |

---

## 🎨 UX Considerations

| Screen              | Key Design Requirements                            |
| :------------------ | :------------------------------------------------- |
| Quote Request Flow  | Clear package cards, pricing visible, mobile-first |
| Quote Requests List | Status badges, sortable, searchable                |
| Projects List       | Grouped headers, clear action CTAs                 |
| Onboarding Wizard   | Simplified, progress visible, reassuring copy      |

---

## 📱 Mobile Responsiveness

All new screens must be tested on:

- [ ] Desktop (1920x1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

_Document Version: 1.0_  
_Last Updated: 2026-01-23_
