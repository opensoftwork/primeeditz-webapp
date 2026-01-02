# 9. Editing Workflow & Revision Process

[← Back to Index](./README.md) | [← Previous: Role Management](./08-role-management.md)

---

## 9.1 Overview

The editing workflow includes configurable stages, a **QC gate** to ensure quality, and **versioning on final deliverables**.

### Key Principles

| Principle                  | Description                                  |
| -------------------------- | -------------------------------------------- |
| **Configurable Stages**    | Each project type has its own stage workflow |
| **QC Gate**                | Client never sees work until QC approves it  |
| **Deliverable Versioning** | Only final deliverables have version history |
| **Per-Project Roles**      | Editor/QC assigned per project, not globally |

---

## 9.2 Stage Workflow (Configurable Per Project Type)

### Example: Wedding Photography

```
Culling → Color Grading → Selection → Album Design → QC Review → Client Review
```

### Example: YouTube Long-form

```
Video Edit → Thumbnail → QC Review → Client Review
```

### Example: Poster Design

```
Design → QC Review → Client Review
```

### Stage Status Flow

```
pending → in_progress → pending_qc → completed
                              │
                       (if rejected)
                              │
                              ▼
                         in_progress
```

---

## 9.3 The Three Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE THREE PHASES OF WORK                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  PHASE 1                    PHASE 2                    PHASE 3
  Editor Work                QC Gate                    Client Review
  ─────────────              ───────                    ─────────────

  Editor downloads           QC reviews                 Client sees
  raw assets                 editor's work              approved work
       │                          │                          │
       ▼                          ▼                          ▼
  Editor works             ┌────────────┐               Reviews and
  (external tools)         │ Approved?  │               decides
       │                   └─────┬──────┘                    │
       ▼                    Yes  │  No                  ┌────┴────┐
  Uploads                 ┌─────┘   └────────┐          │         │
  deliverable             │                  │       Approve   Request
       │                  ▼                  ▼          │       Changes
       ▼            Moves to             Back to        ▼          │
  Submits for QC    Client Review        Editor     Download       │
                                              │     enabled        │
                                              ▼                    │
                                         Fix issues                │
                                              │                    │
                                              ▼                    │
                                         Upload new                │
                                         version                   │
                                                                   │
                                         ◄─────────────────────────┘
                                         (Revision cycle)
```

---

## 9.4 Phase 1: Editor Work

### Step-by-Step Flow

```
Step 1: VIEW ASSIGNMENT
───────────────────────
Employee logs in → My Projects → Sees assigned project
         │
         ▼
Views project details:
┌─────────────────────────────────────────┐
│ Project: Priya's Wedding Photos         │
│ Client: ABC Photos                      │
│ My Role: Editor, QC                     │
│ Due: March 22                           │
│ Current Stage: Color Grading            │
└─────────────────────────────────────────┘


Step 2: DOWNLOAD ASSETS
───────────────────────
Clicks "Download Assets"
         │
         ▼
Selects folders to download
         │
         ▼
Downloads ZIP to local machine


Step 3: WORK LOCALLY
────────────────────
Opens files in Lightroom/Photoshop/Premiere
(Work happens OUTSIDE PrimeEditz)
         │
         ▼
Exports finished work


Step 4: UPLOAD DELIVERABLE
──────────────────────────
Returns to PrimeEditz
         │
         ▼
Opens project → Deliverables
         │
         ▼
Clicks "Upload Deliverable" or "Add Version"
         │
         ▼
Uploads file (creates Version 1 or next version)


Step 5: SUBMIT FOR QC
─────────────────────
Clicks "Submit for QC Review"
         │
         ▼
Deliverable status: draft → pending_qc
         │
         ▼
QC team gets notified
```

---

## 9.5 Phase 2: QC Gate

### QC Review Flow

```
Step 1: QC RECEIVES NOTIFICATION
────────────────────────────────
QC sees: "Deliverable ready for review"
         │
         ▼
Opens project → Deliverables → Pending QC


Step 2: REVIEW WORK
───────────────────
Downloads/views deliverable
         │
         ▼
Checks quality against standards


Step 3: MAKE DECISION
─────────────────────

           ┌──────────────────────────────────────┐
           │           QC DECISION                │
           └──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        ✅ APPROVE                 ❌ REJECT
              │                         │
              ▼                         ▼
     Deliverable moves         Deliverable goes
     to Client Review          back to Editor
              │                         │
              ▼                         ▼
     Client notified           Editor notified
                               with QC notes
```

### QC Feedback (Internal)

```
┌─────────────────────────────────────────┐
│ QC Feedback                             │
├─────────────────────────────────────────┤
│                                         │
│ Issues found:                           │
│ ┌─────────────────────────────────────┐ │
│ │ Page 5: Colors too warm             │ │
│ │ Page 12: Alignment issue            │ │
│ │ Overall: Background needs cleanup   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel] [Send Back to Editor]          │
└─────────────────────────────────────────┘
```

---

## 9.6 Phase 3: Client Review

### Client Review Flow (Only After QC Approves)

```
Step 1: CLIENT RECEIVES NOTIFICATION
────────────────────────────────────
Client receives: "Deliverable ready for review!"


Step 2: CLIENT REVIEWS
──────────────────────
Opens project → Deliverables
         │
         ▼
Views/downloads deliverable
         │
         ▼
Makes decision...


Step 3: CLIENT DECISION
───────────────────────

           ┌──────────────────────────────────────┐
           │         CLIENT DECISION              │
           └──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      ✅ APPROVE ALL            📝 REQUEST CHANGES
              │                         │
              ▼                         ▼
     Download enabled          Revision request
     Project → Completed       sent to team
```

### If Client Approves

```
┌─────────────────────────────────────────┐
│ ✅ Deliverable Approved!                │
├─────────────────────────────────────────┤
│                                         │
│ Wedding Album v2 has been approved.     │
│                                         │
│ [📥 Download (45 MB)]                   │
│                                         │
└─────────────────────────────────────────┘
```

### If Client Requests Changes

```
┌─────────────────────────────────────────┐
│ 📝 Request Changes                      │
├─────────────────────────────────────────┤
│                                         │
│ Deliverable: Wedding Album v2           │
│                                         │
│ Please describe the changes you need:   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 1. Page 5: Please brighten          │ │
│ │ 2. Page 12: Remove background       │ │
│ │    person                           │ │
│ │ 3. Last page: Crop tighter          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel] [Submit Request]               │
└─────────────────────────────────────────┘
         │
         ▼
Team receives notification → Editor makes changes → Uploads v3 → QC → Client
```

---

## 9.7 Deliverable Versioning

### Version History View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📋 Wedding Album - Version History                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌─────────┬─────────────┬────────────┬─────────────────┬──────────────────┐ │
│ │ Version │ Uploaded By │ Date       │ Status          │ Actions          │ │
│ ├─────────┼─────────────┼────────────┼─────────────────┼──────────────────┤ │
│ │ v3      │ Rahul       │ Mar 22     │ ✅ Approved     │ [Download]       │ │
│ │ v2      │ Rahul       │ Mar 21     │ Client revision │ [View]           │ │
│ │ v1      │ Rahul       │ Mar 20     │ QC approved     │ [View]           │ │
│ └─────────┴─────────────┴────────────┴─────────────────┴──────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Version Rules

| Rule                       | Description                         |
| -------------------------- | ----------------------------------- |
| **All versions preserved** | v1, v2, v3... never deleted         |
| **Latest is default**      | Client sees latest approved version |
| **Audit trail**            | Who uploaded what, when, why        |

---

## 9.8 Project Status Flow (Complete)

### Client-Initiated Project

```
draft → pending_quotation → quotation_sent → quotation_approved
    → pending_upload → in_progress → qc_review → client_review
    → [revision_requested ↔ in_progress] → completed → archived
```

### Admin-Initiated Project

```
draft → in_progress → qc_review → completed → archived
```

### Status Descriptions

| Status               | When                          | Who Sees        |
| -------------------- | ----------------------------- | --------------- |
| `draft`              | Project being created         | Admin           |
| `pending_quotation`  | Waiting for quotation         | Admin           |
| `quotation_sent`     | Quotation sent to client      | Admin, Client   |
| `quotation_approved` | Client approved               | Admin, Client   |
| `pending_upload`     | Waiting for client upload     | Admin, Client   |
| `in_progress`        | Work being done               | Admin, Employee |
| `qc_review`          | QC reviewing                  | Admin, QC       |
| `client_review`      | Client reviewing deliverables | Admin, Client   |
| `revision_requested` | Client requested changes      | Admin, Employee |
| `completed`          | All done, download enabled    | All             |
| `archived`           | Archived for retention        | Admin           |

---

## 9.9 Editing Workflow Permissions

| Action                  | Admin | Editor | QC  | Client |
| ----------------------- | :---: | :----: | :-: | :----: |
| **Download raw assets** |  ✅   |   ✅   | ✅  |   ❌   |
| **Upload deliverable**  |  ✅   |   ✅   | ❌  |   ❌   |
| **Submit for QC**       |  ✅   |   ✅   | ❌  |   ❌   |
| **Approve (QC)**        |  ✅   |   ❌   | ✅  |   ❌   |
| **Reject (QC)**         |  ✅   |   ❌   | ✅  |   ❌   |
| **View before QC**      |  ✅   |   ✅   | ✅  |   ❌   |
| **View after QC**       |  ✅   |   ✅   | ✅  |   ✅   |
| **Approve (final)**     |  ❌   |   ❌   | ❌  |   ✅   |
| **Request revision**    |  ✅   |   ❌   | ❌  |   ✅   |
| **Download approved**   |  ✅   |   ❌   | ❌  |   ✅   |

---

## 9.10 Quotation Versioning

Quotations also have version history for back-and-forth with clients.

### Quotation Version Flow

```
Admin creates v1 → Sends to client
                         │
                   ┌─────┴─────┐
                   │           │
              Approved     Changes requested
                   │           │
                   ▼           ▼
              Proceed     Admin creates v2
                               │
                               ▼
                          Sends again
                               │
                          (repeat until approved)
```

### Quotation Version History

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 💰 Quotation QT-2024-00045 - Version History                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌─────────┬─────────────┬────────────┬─────────────────┬──────────────────┐ │
│ │ Version │ Created By  │ Date       │ Status          │ Client Response  │ │
│ ├─────────┼─────────────┼────────────┼─────────────────┼──────────────────┤ │
│ │ v2      │ Admin       │ Mar 12     │ ✅ Approved     │ Approved         │ │
│ │ v1      │ Admin       │ Mar 10     │ Superseded      │ Changes requested│ │
│ └─────────┴─────────────┴────────────┴─────────────────┴──────────────────┘ │
│                                                                              │
│ Client notes on v1:                                                          │
│ "Please reduce album page count and adjust pricing accordingly"             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9.11 Summary: What Gets Versioned

| Entity            | Versioned? | Notes                      |
| ----------------- | :--------: | -------------------------- |
| Stage progress    |     ❌     | Status updates, no history |
| Culling decisions |     ❌     | QC overrides, no history   |
| **Deliverables**  |     ✅     | Full version history       |
| **Quotations**    |     ✅     | Full version history       |
| Revision requests |     ❌     | Tracked but not versioned  |

---

[← Back to Index](./README.md)
