# Architectural Flow: Quotation to Project Lifecycle

This document describes the unified workflow for how a Studio (Client) initiates a request, how it is processed by the Admin, and how it automatically spawns production projects.

## 1. Request Initiation (Studio)

The workflow starts with the Studio requesting a production package.

- **Action**: Studio fills out the "Request Engagement" wizard.
- **Data Created**: A `quotation` record.
- **Initial Status**: `initiated`.
- **User Outcome**: Studio sees the request in their "My Quote Requests" list with a state indicating it is awaiting admin review.

## 2. Review & Quotation Verification (Admin)

The Admin reviews the incoming `initiated` requests.

- **Action**: Admin opens the quotation list, reviews the `initiated` request, and prepares a formal quote.
- **Workflow**: Admin can adjust line items, add taxes, or apply discounts.
- **Status Change**: Admin moves status to `sent` once the formal proposal is ready.

## 3. Acceptance & Financial Trigger (Admin/Studio)

The "Bridge" between the commercial deal and production start.

- **Scenario A (Standard)**: Studio accepts the quote (`approved`).
- **Scenario B (Admin Trigger)**: Admin manually confirms payment/agreement and marks the quote as `approved`.
- **The Trigger**: The transition to `approved` status is the core trigger for systemic project initialization.

## 4. Automatic Project Spawning (System)

Upon the `approved` status trigger, the backend executes the following:

- **Iterate**: Loops through all line items in the quotation.
- **Filter**: Identifies items with `spawnsProject: true`.
- **Create**: For each matching item, a new `project` is created.
- **Link**: The project is linked back to the quotation via `quotationId`.
- **Initialize**:
  - **Status**: Sets to `awaiting_uploads` (Onboarding Phase).
  - **Folders**: Automatically calls the folder setup logic using the `selectedFolderTemplateId`.
  - **Identity**: End client name and event details are mapped from the quotation.

## 5. Studio Onboarding (Studio)

Once projects are initialized, the Studio is notified to provide production assets.

- **Action**: Studio navigates to their "My Projects" list.
- **Insight**: They see the new projects grouped by the End Client name.
- **Workflow**: They enter the "Onboarding Flow" (a simplified version of the old project wizard) to:
  - Upload reference files.
  - Add technical notes.
  - Add specific project metadata.
- **Status Change**: Once completed, the project moves to `uploads_complete` and is ready for Admin assignment.

## State Machine Summary (Quotation)

| Transition     | From        | To          | Trigger                       |
| :------------- | :---------- | :---------- | :---------------------------- |
| **Request**    | N/A         | `initiated` | Studio Submission             |
| **Refinement** | `initiated` | `sent`      | Admin Review                  |
| **Spawning**   | `sent`      | `approved`  | Studio Accept / Admin Confirm |

## State Machine Summary (Project)

| Transition     | From               | To                 | Trigger                    |
| :------------- | :----------------- | :----------------- | :------------------------- |
| **Birth**      | N/A                | `awaiting_uploads` | Quotation Approval         |
| **Onboarding** | `awaiting_uploads` | `uploads_complete` | Studio Folder Finalization |
| **Production** | `uploads_complete` | `assigned`         | Admin Assignment           |
