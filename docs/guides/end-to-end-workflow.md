# End-to-End Operational Workflow: Studio to Delivery

This guide outlines the complete step-by-step interaction between the **Studio (Client)** and the **Admin** within the PrimeEditz ecosystem, following the new quotation-driven architecture.

---

## Part 1: Commercial Initiation (Studio)

The process begins with the Studio requesting a service package.

### 1.1 The Request Flow

- **User**: Studio
- **Location**: Studio Dashboard → "Request Engagement"
- **Process**:
  1.  **Package Selection**: Studio picks from available models (e.g., Gold Wedding Package).
  2.  **Project Intel**: Studio enters the End Client Name (e.g., "Sharma Wedding") and Event Date.
  3.  **Manifest Review**: Final confirmation of the requested services.
- **System Result**: A `quotation` is created with status **`initiated`**.
- **Visibility**: Studio sees this in their "My Quote Requests" list.

---

## Part 2: Proposal Refinement (Admin)

The Admin team validates and formalizes the Studio's request.

### 2.1 Admin Review

- **User**: Admin
- **Location**: Admin Portal → Quotations List → Status: `initiated`
- **Process**:
  1.  Admin opens the request.
  2.  **Verification**: Checks if the requested date is available.
  3.  **Adjustments**: Modifies line items, adds custom charges, or applies discounts.
  4.  **Spawning Rules**: Admin ensures items have `spawnsProject: true` and the correct **Folder Template** selected.
- **System Result**: Admin clicks "Send Proposal".
- **Status Change**: Quotation moves to **`sent`**.

---

## Part 3: Acceptance & System Spawning (Bridges)

The moment the commercial deal converts into a production workload.

### 3.1 Acceptance

- **User**: Studio (or Admin on behalf of Studio)
- **Location**: Quotation Share Link / Studio Dashboard
- **Process**: Studio reviews the formal proposal and clicks **"Accept & Sign"**.
- **Alternative**: Admin manually marks it as **`approved`** upon receiving offline payment confirmation.
- **Status Change**: Quotation moves to **`approved`**.

### 3.2 Automated Birth (System Action)

- **Trigger**: Status changed to `approved`.
- **System Actions**:
  1.  **Project Creation**: High-speed spawning of specific project records for every line item marked `spawnsProject: true`.
  2.  **Auto-Mounting**: Correct folder structures are created immediately using the selected folder templates.
  3.  **Phase Entry**: Projects bypass "Setup" and land directly in the **`onboarding`** phase.
  4.  **Notification**: Studio is notified that their project manifest is active.

---

## Part 4: Production Onboarding (Studio)

The Studio provides the specific technical needs to the creative team.

### 4.1 Onboarding Completion

- **User**: Studio
- **Location**: Studio Dashboard → My Projects → "Onboarding Needed"
- **Constraint**: The Studio cannot move to production until assets are provided.
- **Process (Onboarding Wizard)**:
  1.  **Assets**: Studio uploads reference files, moodboards, or specific client requests.
  2.  **Briefing**: Studio adds high-level description and technical notes.
  3.  **Submission**: Studio clicks "Finalize Manifest".
- **Status Change**: Project action state moves to **`uploads_complete`**.

---

## Part 5: Resource Allocation & Production (Admin & Employee)

The project enters the creative pipeline.

### 5.1 Assignment

- **User**: Admin
- **Location**: Admin Project Detail → Team Assignment
- **Process**: Admin assigns a Lead Editor or Squad to the project.
- **Status Change**: Project moves to **`assigned`**.

### 5.2 Creative Production

- **User**: Employee
- **Action**: Employee starts work.
- **Status Change**: Moves to **`work_in_progress`**.

---

## Part 6: Delivery & Completion

Final output is provided to the Studio.

### 6.1 Manifest Delivery

- **Process**: Deliverables are uploaded by the team and approved by Admin QC.
- **Status Change**: Project moves to **`ready_for_delivery`**.
- **Final Result**: Studio reviews and downloads final assets. Once confirmed, project moves to **`completed`**.

---

## Workflow Summary Table

| Step         | Initiator    | Status Indicator   | Phase Name |
| :----------- | :----------- | :----------------- | :--------- |
| **Request**  | Studio       | `initiated`        | Commercial |
| **Proposal** | Admin        | `sent`             | Commercial |
| **Approval** | Studio/Admin | `approved`         | Commercial |
| **Spawning** | System       | `awaiting_uploads` | Onboarding |
| **Briefing** | Studio       | `uploads_complete` | Onboarding |
| **Work**     | Employee     | `work_in_progress` | Production |
| **Handoff**  | Admin        | `delivered`        | Delivery   |
