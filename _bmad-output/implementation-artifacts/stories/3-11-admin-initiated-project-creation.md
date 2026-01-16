# Story 3.11: Admin-Initiated Project Creation with Client Selection

## Status: Draft

## Story

**As an** Admin or Employee,  
**I want** to create a project request with an optional client selection step,  
**So that** I can handle walk-in clients, phone bookings, referrals, or internal projects without requiring the client to self-register.

---

## Business Context

Currently, the project wizard (`project-wizard.tsx`) is designed for **client-initiated** project requests. When an Admin clicks "INITIATE PROJECT" on the admin projects page, they need a way to:

1. **Select an existing client** from the database
2. **Create a new client profile** (as a draft, without onboarding email)
3. **Proceed without a client** for internal or placeholder projects

This extends the existing 5-step wizard to 6 steps for admin mode.

---

## Acceptance Criteria

### AC1: Admin Project Initiation Entry Point

- **Given** I am logged in as Admin or Employee
- **When** I click "INITIATE PROJECT" on `/admin/projects`
- **Then** I am navigated to the project wizard in **admin mode**
- **And** the wizard displays **Step 1: Client Selection** as the first step
- **And** the total step count is **6** (Client → Basics → Details → Files → Description → Review)

### AC2: Client Selection Options

- **Given** I am on Step 1: Client Selection
- **When** the step loads
- **Then** I see three options presented as selectable cards:
  - **"Select Existing Client"** — with icon and description
  - **"Create New Client"** — with icon and description
  - **"No Client (Internal Project)"** — with icon and description
- **And** I must select one option to enable the "Next Step" button

### AC3: Existing Client Selection — Drawer Behavior

- **Given** I am on Step 1 and I select "Select Existing Client"
- **When** I click the card or a "Browse Clients" button
- **Then** a drawer slides in from the right side
- **And** the drawer contains:
  - **Search bar** — searches by name, email, company
  - **Client list** — showing for each client:
    - Avatar placeholder with initials
    - Full name (bold)
    - Email address
    - Company (if exists)
    - Phone (if exists)
    - Onboarding status badge (Onboarded / Pending)
    - Project count (e.g., "3 projects")
    - Last activity date
  - **Select button** per row
- **And** the list is paginated or virtualized for large datasets
- **And** selecting a client closes the drawer and displays the selected client info in Step 1

### AC4: Selected Client Display

- **Given** I selected an existing client
- **When** the drawer closes
- **Then** Step 1 shows a **Client Summary Card** with:
  - Client avatar, name, email, phone, company
  - Onboarding status badge
  - Project history summary (e.g., "5 total projects, 2 active")
  - "Change Client" button to reopen the drawer
- **And** the "Next Step" button becomes enabled

### AC5: Create New Client — Inline Form

- **Given** I select "Create New Client" option
- **When** the option is selected
- **Then** an inline form appears with fields:
  - **Name** (required)
  - **Email** (required, validated format)
  - **Phone** (optional)
  - **Company** (optional)
- **And** a "Create Client" button to create the profile
- **And** upon successful creation:
  - A new `profiles` record is created with `role: "client"`, `onboardingComplete: false`
  - The new client is automatically selected
  - The form is replaced with the Client Summary Card
  - Toast notification: "Client profile created"

### AC6: No Client Option

- **Given** I select "No Client (Internal Project)" option
- **When** the option is selected
- **Then** Step 1 shows a confirmation message: "This project will be created without a client association. You can add a client later."
- **And** the "Next Step" button becomes enabled
- **And** proceeding stores `clientId: null` in the wizard state

### AC7: Basics Step Pre-Population (Read-Only)

- **Given** I selected an existing client in Step 1
- **When** I navigate to Step 2: Basics
- **Then** the client fields (name, email, phone) are:
  - Pre-populated with the selected client's data
  - Displayed as **read-only** with a "locked" visual indicator
  - Cannot be edited (greyed out or displayed as text, not inputs)
- **And** other fields (event name, date, venue, project type) remain editable

### AC8: Basics Step — No Client Selected

- **Given** I selected "No Client" in Step 1
- **When** I navigate to Step 2: Basics
- **Then** the client fields are hidden or replaced with a neutral message: "No client associated"
- **And** the remaining fields function normally

### AC9: Basics Step — New Client Created

- **Given** I created a new client in Step 1
- **When** I navigate to Step 2: Basics
- **Then** the client fields are pre-populated and **read-only** (same as existing client)
- **And** a small badge indicates "New Client Profile"

### AC10: Wizard Mode Prop

- **Given** the `ProjectWizard` component is rendered
- **When** it receives a `mode="admin"` prop
- **Then** the wizard includes Step 1: Client Selection
- **And** total steps = 6
- **And** step navigation displays all 6 steps correctly

- **Given** the `ProjectWizard` component is rendered
- **When** it receives `mode="client"` or no mode prop
- **Then** the wizard behaves as current (5 steps, no client selection)

### AC11: Step Navigation Updates

- **Given** I am in admin mode with 6 steps
- **When** viewing the step navigation sidebar
- **Then** all 6 steps are displayed correctly:
  1. Client
  2. Basics
  3. Details
  4. Files (optional)
  5. Description
  6. Review
- **And** completed steps show checkmarks
- **And** clicking a completed step navigates back to it

### AC12: Review Step — Client Summary

- **Given** I am on Step 6: Review in admin mode
- **When** the review page loads
- **Then** the first section shows "Client Information" with:
  - Client name, email, phone, company (if client selected)
  - OR "No client associated" message (if no client)
- **And** an "Edit" button next to Client section returns to Step 1

---

## Technical Notes

### Component Changes

1. **`project-wizard.tsx`**

   - Add `mode?: "client" | "admin"` prop
   - Conditionally include Step 0 (Client Selection)
   - Update `WIZARD_STEPS` array based on mode
   - Update step count display from "05" to "06" in admin mode

2. **New Component: `steps/step-0-client-selection/`**

   - `index.tsx` — Main step component
   - `client-option-cards.tsx` — Three selectable option cards
   - `client-drawer.tsx` — Existing client search drawer
   - `client-summary-card.tsx` — Display selected client info
   - `new-client-form.tsx` — Inline form for new client creation

3. **`wizard-form-context.tsx`**

   - Add `clientId: Id<"profiles"> | null` to form state
   - Add `clientData: ClientProfile | null` for display purposes
   - Add `isNewClient: boolean` flag

4. **`step-1-basics/client-event-fields.tsx`**

   - Accept `isReadOnly` prop for client fields
   - Accept `selectedClient` prop to pre-populate

5. **`step-5-review/`**
   - Add Client Information section at the top

### API Requirements

1. **Query: `getClientsForSelection`**

   - Returns paginated clients with: name, email, phone, company, onboardingComplete, projectCount, lastActivityDate
   - Supports search by name, email, company
   - Sorted by name or last activity

2. **Mutation: `createDraftClientProfile`**
   - Creates new profile with `onboardingComplete: false`
   - Returns the new client ID

---

## UI/UX Specifications

### Step 0 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT SELECTION                                           │
│  Choose how to associate a client with this project         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   👤          │  │   ➕          │  │   📁          │   │
│  │               │  │               │  │               │   │
│  │ Select        │  │ Create New    │  │ No Client     │   │
│  │ Existing      │  │ Client        │  │ (Internal)    │   │
│  │               │  │               │  │               │   │
│  │ Browse your   │  │ Add a new     │  │ Create        │   │
│  │ client list   │  │ client now    │  │ without       │   │
│  │               │  │               │  │ association   │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
│                                                             │
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│  [Selected Client Card or New Client Form appears here]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Client Drawer Design

- Width: 480px (lg) / 100% (mobile)
- Header: "Select Client" + search bar
- Body: Scrollable client list with hover states
- Each row: Click to select, shows flyout for more details
- Footer: Close button

---

## Dependencies

- Existing `DataTable` component for client list (or new simpler list component)
- Existing drawer/sheet pattern from UI library
- Profile query capabilities from `api.admin` module

---

## Out of Scope (Phase 2)

- Client invitation email on creation
- Bulk client import
- Client merge functionality
- Advanced client filtering (by date range, project type history)

---

## Estimation

| Task                                | Estimate      |
| ----------------------------------- | ------------- |
| Step 0 component + option cards     | 2 hours       |
| Client drawer with search           | 3 hours       |
| New client form + mutation          | 2 hours       |
| Wizard mode prop + step updates     | 2 hours       |
| Basics step read-only modifications | 1 hour        |
| Review step client section          | 1 hour        |
| Testing + polish                    | 2 hours       |
| **Total**                           | **~13 hours** |

---

## Definition of Done

- [ ] Admin can click "INITIATE PROJECT" and see 6-step wizard
- [ ] All three client selection options work correctly
- [ ] Client drawer searches and displays rich client info
- [ ] New client creation saves draft profile to database
- [ ] Basics step correctly shows read-only client data
- [ ] Review step displays client information section
- [ ] Existing client flow (5 steps) remains unchanged
- [ ] No TypeScript errors
- [ ] Mobile responsive

---

## Related Artifacts

- **Epic:** 03-admin-portal-management.md
- **Related Components:**
  - `src/components/modules/projects/wizard/project-wizard.tsx`
  - `src/components/modules/admin/clients/client-projects/individual-client.tsx` (reference for client display patterns)
  - `src/components/modules/admin/projects/project-list/index.tsx` (entry point)
