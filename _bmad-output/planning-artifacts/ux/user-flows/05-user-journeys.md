# 5. Complete User Journeys

[← Back to Index](./README.md) | [← Previous: Dashboards](./04-dashboards.md) | [Next: Gated Upload →](./06-gated-upload.md)

---

## 5.1 Journey Overview

This section covers complete end-to-end journeys for each role.

| Journey | Primary Role | Description                                                      |
| ------- | ------------ | ---------------------------------------------------------------- |
| A       | Client       | Request project → Approve quotation → Upload → Review → Download |
| B       | Admin        | Create project → Quotation → Assign team → Track → Deliver       |
| C       | Admin        | Create internal project → Assign → Complete                      |
| D       | Employee     | View assignments → Work → Submit → Complete                      |

---

## 5.2 Journey A: Client — Request to Delivery

### Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CLIENT JOURNEY: PROJECT REQUEST TO DELIVERY               │
└─────────────────────────────────────────────────────────────────────────────┘

1. REQUEST PROJECT
   └── Client logs in
   └── Clicks "Request New Project"
   └── Selects project type (e.g., "Wedding Photography")
   └── Fills project details
   └── Uploads reference files (optional)
   └── Submits request

2. WAIT FOR QUOTATION
   └── Status: "Pending Quotation"
   └── Admin reviews and creates quotation
   └── Client receives notification

3. REVIEW QUOTATION
   └── Client opens quotation
   └── Reviews line items, total, terms
   └── Option A: Approve → Go to step 4
   └── Option B: Request changes → Back-and-forth

4. UPLOAD ASSETS (Unlocked after approval)
   └── Storage allocated
   └── Upload button now active
   └── Client uploads raw assets to folders
   └── Marks upload as complete

5. TRACK PROGRESS
   └── Status: "In Progress"
   └── Client can view progress bar
   └── Receives notifications on status changes

6. REVIEW DELIVERABLES
   └── Status: "Ready for Review"
   └── Client receives notification
   └── Reviews deliverables (album, video, etc.)
   └── Option A: Approve → Go to step 7
   └── Option B: Request revision → Editor fixes → Back to step 6

7. DOWNLOAD FINALS
   └── Status: "Completed"
   └── Download button active
   └── Client downloads approved deliverables
   └── Project archived after retention period
```

### Journey A Detail: Project Request Form

```
┌─────────────────────────────────────────┐
│ Request New Project                     │
├─────────────────────────────────────────┤
│                                         │
│ Project Type*: [Wedding Photography ▼]  │
│                                         │
│ End Client Name*: Priya Sharma          │
│ Event Name: Priya & Raj Wedding         │
│ Event Date*: March 15, 2024             │
│ Venue: Grand Palace, Bangalore          │
│                                         │
│ Description:                            │
│ ┌─────────────────────────────────────┐ │
│ │ Full wedding coverage including     │ │
│ │ ceremony, reception, and candid     │ │
│ │ shots. Need album + all edits.      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Reference Files (optional):             │
│ [+ Add files] (max 10)                  │
│                                         │
│ Preferred Delivery: March 25, 2024      │
│                                         │
│ [Cancel] [Submit Request]               │
└─────────────────────────────────────────┘
```

---

## 5.3 Journey B: Admin — Client Project Management

### Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN JOURNEY: CLIENT PROJECT MANAGEMENT                  │
└─────────────────────────────────────────────────────────────────────────────┘

1. RECEIVE REQUEST
   └── Admin receives notification: "New project request"
   └── Opens project: "Priya's Wedding - ABC Photos"
   └── Reviews details and reference files

2. CREATE QUOTATION
   └── Clicks "Create Quotation"
   └── Selects template (e.g., "Premium Wedding Package")
   └── Adjusts line items if needed
   └── Selects storage tier (e.g., "100 GB")
   └── Sends to client

3. WAIT FOR APPROVAL
   └── Status: "Quotation Sent"
   └── Client reviews and approves (or requests changes)
   └── If changes requested → Revise → Send again

4. ASSIGN TEAM
   └── After quotation approved
   └── Clicks "Assign Team"
   └── Assigns:
       • Rahul → Editor, QC (all stages)
       • Priya → QC (all stages)
       • Anil → Editor (Color Grading only)

5. MONITOR PROGRESS
   └── Views project dashboard
   └── Checks stage progress
   └── Reviews uploaded deliverables
   └── Approves for client review (QC gate)

6. HANDLE REVISIONS (if any)
   └── Client requests changes
   └── Admin reviews request
   └── Assigns to editor
   └── New version uploaded

7. COMPLETE PROJECT
   └── Client approves final
   └── Project marked completed
   └── Download enabled for client
   └── Schedule archival
```

---

## 5.4 Journey C: Admin — Internal Project

### Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN JOURNEY: INTERNAL PROJECT                           │
└─────────────────────────────────────────────────────────────────────────────┘

1. CREATE PROJECT
   └── Admin clicks "New Project"
   └── Selects type (e.g., "Portfolio Update")
   └── No client selected (internal)
   └── Selects storage tier
   └── Enters project details

2. ASSIGN TEAM
   └── Assigns team members
   └── Priya → Editor, Lead

3. UPLOAD ASSETS (if needed)
   └── Admin uploads files directly
   └── Or marks as "no assets needed"

4. WORK
   └── Assigned employees work on project
   └── Update stage progress

5. INTERNAL REVIEW
   └── Project lead reviews
   └── Approves or requests changes

6. COMPLETE
   └── Mark as complete
   └── Archive
```

**Key Difference:** No quotation flow, no client approval — purely internal.

---

## 5.5 Journey D: Employee — Work Completion

### Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EMPLOYEE JOURNEY: ASSIGNED WORK                           │
└─────────────────────────────────────────────────────────────────────────────┘

1. VIEW ASSIGNMENTS
   └── Employee logs in
   └── Sees "My Projects" with assigned work
   └── Sees role per project (Editor, QC, etc.)

2. OPEN PROJECT
   └── Clicks project (e.g., "Priya's Wedding")
   └── Sees project details
   └── Sees which stages they're assigned to

3. DOWNLOAD ASSETS
   └── Clicks "Download Assets"
   └── Selects folders to download
   └── Downloads ZIP to local machine

4. WORK LOCALLY
   └── Opens files in editing software
   └── Performs required work
   └── Exports finished files

5. UPLOAD WORK
   └── Returns to PrimeEditz
   └── Clicks "Upload Edits"
   └── Uploads finished files

6. UPDATE STAGE
   └── Marks stage as complete
   └── Or submits for QC review

7. HANDLE FEEDBACK (if QC role)
   └── Reviews other editor's work
   └── Approves or sends back for fixes

8. COMPLETE
   └── All assigned stages done
   └── Project moves forward
```

---

## 5.6 Journey Summary Table

| Step                | Client | Admin (Client Project) | Admin (Internal) |  Employee  |
| ------------------- | :----: | :--------------------: | :--------------: | :--------: |
| Request project     |   ✅   |           —            |        —         |     —      |
| Review request      |   —    |           ✅           |        —         |     —      |
| Create quotation    |   —    |           ✅           |        —         |     —      |
| Approve quotation   |   ✅   |           —            |        —         |     —      |
| Create project      |   —    |           —            |        ✅        |     —      |
| Assign team         |   —    |           ✅           |        ✅        |     —      |
| Upload assets       |   ✅   |           ✅           |        ✅        |     —      |
| Download assets     |   —    |           ✅           |        —         |     ✅     |
| Work on project     |   —    |           —            |        —         |     ✅     |
| Upload work         |   —    |           —            |        —         |     ✅     |
| QC review           |   —    |           ✅           |        ✅        | ✅ (if QC) |
| Review deliverables |   ✅   |           —            |        —         |     —      |
| Request revision    |   ✅   |           —            |        —         |     —      |
| Approve final       |   ✅   |           —            |        —         |     —      |
| Download final      |   ✅   |           —            |        —         |     —      |
| Mark complete       |   —    |           ✅           |        ✅        |     —      |

---

[Next: Gated Upload System →](./06-gated-upload.md)
