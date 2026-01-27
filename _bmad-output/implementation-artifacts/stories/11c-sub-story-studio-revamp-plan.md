# Sub-Story 11C: Studio Portal Revamp Implementation Plan

This sub-story tracks the remaining work for Epic 11C: Studio Portal Revamp. This epic shifts the primary Studio interaction from legacy project creation to a Quote Request flow, which auto-spawns projects upon approval.

## 1. Context & Rationale

We are moving away from the complex legacy "Project Wizard" for initial studio entry. Instead:

1. Studio requests a **Quote** based on a package.
2. Admin approves/dispatches the quote.
3. System **auto-spawns** the necessary projects.
4. Studio **completes onboarding** for those spawned projects (uploading assets/notes).

## 2. Implementation Progress

### 2.1 Fixed Technical Debt

- [x] Renamed `client` role to `studio` across backend functions.
- [x] Renamed `clientNotes` to `studioNotes` in `quotations` table and related mutations.
- [x] Synchronized `convex/schema.ts` with backend function logic (Quotation deletion, link/unlink).

### 2.2 Quote Request Flow (11C.1)

- [x] Backend: `api.functions.quotations.mutations.requestQuotation` implemented.
- [x] Frontend: `QuoteRequestWizard` implemented in `src/components/modules/studio/quotations/request-flow/`.
- [ ] UI: Update Studio Dashboard primary CTA from "New Project" to "Request Quote".

### 2.3 Studio Quotations List (11C.2)

- [x] Backend: `api.functions.quotations.queries.getMyQuotationsPaginated` implemented (includes `'initiated'` status).
- [x] Frontend: `StudioQuotationList` implemented in `src/components/modules/studio/quotations/list/`.
- [ ] UI: Update `QuotationStatusBadge` to specifically handle the `'initiated'` status with a distinct style (e.g., Indigo/Violet "Pending Review").
- [ ] UI: Add `'initiated'` to `statusOptions` filter in `StudioQuotationList`.

### 2.4 Studio Dashboard Grouping (11C.3)

- [x] Backend: `api.functions.projects.queries.getMyProjectsGroupedByEndClient` implemented.
- [x] Frontend: `GroupedProjectList` implemented in `src/components/modules/studio/dashboard/`.
- [ ] UI: Ensure the "My Projects" page also uses this grouped rendering or high-level overview.

### 2.5 Project Onboarding (11C.4 & 11C.5)

- [ ] Frontend: Implement `ProjectOnboardingCard` for projects in `awaiting_uploads` state.
- [ ] Logic: Repurpose `ProjectWizard` as an **Onboarding Wizard** (`mode="onboarding"`).
  - Hide Step 0 (Studio selection).
  - Hide Step 1 (Basics - already known from quote).
  - Step 1: Assets (Upload reference files/moodboards).
  - Step 2: Brief (Technical notes/Creative brief).
  - Step 3: Confirm & Submit.
- [ ] Backend: Create `api.functions.projects.mutations.completeOnboarding` to transition project from `awaiting_uploads` to `uploads_complete`.

## 3. Immediate Next Steps

1.  **UI Polish**: Update `QuotationStatusBadge` and `StudioQuotationList` filters to support the `'initiated'` status.
2.  **Dashboard Integration**: Replace the "New Project" button on the Studio Dashboard with "Request Production Quote".
3.  **Onboarding Wizard**: Start refactoring `ProjectWizard` to support the onboarding-only mode.

## 4. Acceptance Criteria for Sub-Story

- Studio can submit a quote request and see it in their list as "Pending Review".
- Admin can see the initiated request, edit line items, and approve it.
- Upon approval, the Studio sees the new project(s) on their dashboard with a "Complete Onboarding" CTA.
- Clicking "Complete Onboarding" takes them through a 3-step asset/brief upload flow.
- Completing onboarding moves the project to `uploads_complete` for Admin review.
