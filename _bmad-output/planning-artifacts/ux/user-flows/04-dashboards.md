# 4. Dashboards

[← Back to Index](./README.md) | [← Previous: Account Creation](./03-account-creation.md) | [Next: User Journeys →](./05-user-journeys.md)

---

## 4.1 Dashboard Overview

Each role sees a different dashboard tailored to their needs.

| Role         | Dashboard Focus                               |
| ------------ | --------------------------------------------- |
| **Admin**    | All projects, quotations, team, configuration |
| **Employee** | Assigned projects, tasks, work queue          |
| **Client**   | Their projects, status, deliverables          |

---

## 4.2 Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏠 PrimeEditz Admin                                    [👤 Life-design ▼]  │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  NAVIGATION  │  📊 Dashboard Overview                                      │
│              │                                                              │
│  ▸ Dashboard │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│              │  │   Active   │ │  Pending   │ │   Team     │ │  Storage   ││
│  ▸ Projects  │  │  Projects  │ │  Quotes    │ │  Members   │ │   Used     ││
│    All       │  │    23      │ │     5      │ │     8      │ │  456 GB    ││
│    Pending   │  └────────────┘ └────────────┘ └────────────┘ └────────────┘│
│    In Work   │                                                              │
│    Completed │  📦 Recent Projects                     [View All →]         │
│              │  ┌───────────────────────────────────────────────────────┐  │
│  ▸ Quotations│  │ Project              │ Client     │ Status   │ Due    │  │
│              │  ├──────────────────────┼────────────┼──────────┼────────│  │
│  ▸ Clients   │  │ Priya's Wedding      │ ABC Photos │ 🟠 In QC │ Mar 22 │  │
│              │  │ Corp Event Coverage  │ XYZ Studios│ 🔵 Work  │ Mar 25 │  │
│  ▸ Team      │  │ YouTube Tutorial     │ Internal   │ 🟢 Done  │ Mar 18 │  │
│              │  └───────────────────────────────────────────────────────┘  │
│  ▸ Config    │                                                              │
│    Types     │  📋 Pending Quotations                  [View All →]         │
│    Stages    │  ┌───────────────────────────────────────────────────────┐  │
│    Storage   │  │ Client       │ Project          │ Amount   │ Status  │  │
│    Templates │  ├──────────────┼──────────────────┼──────────┼─────────│  │
│              │  │ ABC Photos   │ Reception Party  │ ₹45,000  │ ⏳ Sent │  │
│  ▸ Settings  │  │ XYZ Studios  │ Product Shoot    │ ₹22,000  │ 📝 Draft│  │
│              │  └───────────────────────────────────────────────────────┘  │
│              │                                                              │
│              │  [+ New Project]  [+ New Quotation]                         │
│              │                                                              │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

### Admin Navigation

| Section        | Purpose                                   |
| -------------- | ----------------------------------------- |
| **Dashboard**  | Overview stats and quick actions          |
| **Projects**   | All projects, filtered views              |
| **Quotations** | Draft, sent, approved quotations          |
| **Clients**    | Client list and details                   |
| **Team**       | Employee management, assignments          |
| **Config**     | Project types, stages, storage, templates |
| **Settings**   | Business settings, preferences            |

---

## 4.3 Employee Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏠 PrimeEditz                                          [👤 Rahul ▼]        │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  NAVIGATION  │  📊 My Dashboard                                            │
│              │                                                              │
│  ▸ Dashboard │  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│              │  │  My Active │ │ Pending QC │ │  Due This  │               │
│  ▸ My        │  │  Projects  │ │   Review   │ │   Week     │               │
│    Projects  │  │     4      │ │     2      │ │     3      │               │
│              │  └────────────┘ └────────────┘ └────────────┘               │
│  ▸ Work      │                                                              │
│    Queue     │  📦 My Projects                          [View All →]        │
│              │  ┌───────────────────────────────────────────────────────┐  │
│              │  │ Project              │ My Role    │ Stage    │ Due    │  │
│              │  ├──────────────────────┼────────────┼──────────┼────────│  │
│              │  │ Priya's Wedding      │ Editor, QC │ Editing  │ Mar 22 │  │
│              │  │ Corp Event Coverage  │ Editor     │ Culling  │ Mar 25 │  │
│              │  │ YouTube Tutorial     │ Editor     │ Complete │ Mar 18 │  │
│              │  └───────────────────────────────────────────────────────┘  │
│              │                                                              │
│              │  ⏰ My Work Queue                                            │
│              │  ┌───────────────────────────────────────────────────────┐  │
│              │  │ 1. Priya's Wedding - Color Grading (Due: Tomorrow)    │  │
│              │  │ 2. Corp Event - Culling (Due: Mar 24)                 │  │
│              │  │ 3. Product Shoot - Retouching (Due: Mar 26)           │  │
│              │  └───────────────────────────────────────────────────────┘  │
│              │                                                              │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

### Employee Navigation

| Section         | Purpose                            |
| --------------- | ---------------------------------- |
| **Dashboard**   | Personal stats and quick view      |
| **My Projects** | Projects assigned to this employee |
| **Work Queue**  | Tasks sorted by priority/due date  |

---

## 4.4 Client Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏠 PrimeEditz                                          [👤 ABC Photos ▼]   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  NAVIGATION  │  📊 Welcome, ABC Photos!                                    │
│              │                                                              │
│  ▸ Dashboard │  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│              │  │   Active   │ │  Pending   │ │  Ready to  │               │
│  ▸ My        │  │  Projects  │ │  Approval  │ │  Download  │               │
│    Projects  │  │     3      │ │     1      │ │     2      │               │
│              │  └────────────┘ └────────────┘ └────────────┘               │
│  ▸ Request   │                                                              │
│    New       │  📦 My Projects                          [View All →]        │
│              │  ┌───────────────────────────────────────────────────────┐  │
│  ▸ Quotations│  │ Project              │ Type       │ Status   │ Action │  │
│              │  ├──────────────────────┼────────────┼──────────┼────────│  │
│  ▸ Downloads │  │ Priya's Wedding      │ Wedding    │ 🟠 In QC │ Track  │  │
│              │  │ Reception Party      │ Wedding    │ ⏳ Quote │ Review │  │
│  ▸ Settings  │  │ Product Launch       │ Corporate  │ 🟢 Ready │ ⬇️ Get  │  │
│              │  └───────────────────────────────────────────────────────┘  │
│              │                                                              │
│              │  📋 Pending Actions                                          │
│              │  ┌───────────────────────────────────────────────────────┐  │
│              │  │ ⚠️ Quotation waiting for approval                      │  │
│              │  │    Reception Party - ₹45,000                          │  │
│              │  │    [Review & Approve]                                  │  │
│              │  └───────────────────────────────────────────────────────┘  │
│              │                                                              │
│              │  [+ Request New Project]                                    │
│              │                                                              │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

### Client Navigation

| Section         | Purpose                              |
| --------------- | ------------------------------------ |
| **Dashboard**   | Project overview and pending actions |
| **My Projects** | All projects for this client         |
| **Request New** | Create new project request           |
| **Quotations**  | View and approve quotations          |
| **Downloads**   | Download approved deliverables       |
| **Settings**    | Business profile, preferences        |

---

## 4.5 Project Detail View (Admin)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Projects                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📦 Priya's Wedding Photos                        [•••]                      │
│ PRJ-2024-00045 | Wedding Photography | ABC Photos                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 📊 Status: In Progress          📅 Due: March 22          🔥 Priority: High │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                         STAGE PROGRESS                                   │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ ✅ Culling ──▶ 🔵 Color Grading ──▶ ⚪ Album Design ──▶ ⚪ QC ──▶ ⚪ Client│ │
│ │   Complete      In Progress          Pending            Pending   Pending│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ 👥 Team                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Rahul (Editor, QC) | Priya (QC) | Anil (Editor - Color Grading only)   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ 📁 Assets                                💾 Storage: 45.2 GB / 100 GB       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📂 Ceremony (450 files)  ✅                                              │ │
│ │ 📂 Reception (320 files) ✅                                              │ │
│ │ 📂 Candid (180 files)    ✅                                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ 📋 Deliverables                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Wedding Album (PDF) - v2 - Pending Client                                │ │
│ │ Edited Photos (ZIP) - v1 - In QC                                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ [Assign Team] [Update Status] [Add Deliverable]                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.6 Project Detail View (Client)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Back to My Projects                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📦 Priya's Wedding Photos                                                   │
│ PRJ-2024-00045 | Wedding Photography                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 📊 Status: In Progress          📅 Expected: March 22                       │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                         PROJECT PROGRESS                                 │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ ✅ Uploaded ──▶ 🔵 In Progress ──▶ ⚪ Ready for Review ──▶ ⚪ Delivered  │ │
│ │   Complete      Current              Pending                Pending      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ 📁 Uploaded Assets                       💾 Storage: 45.2 GB / 100 GB       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📂 Ceremony (450 files)  ✅                                              │ │
│ │ 📂 Reception (320 files) ✅                                              │ │
│ │ 📂 Candid (180 files)    ✅                                              │ │
│ │                                                                          │ │
│ │ [+ Upload More Files]                                                    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ 📋 Deliverables                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ⏳ In Progress - Expected March 22                                       │ │
│ │                                                                          │ │
│ │ You will be notified when deliverables are ready for review.            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Note:** Client sees simplified progress (not internal stages like "Culling" or "Color Grading").

---

[Next: User Journeys →](./05-user-journeys.md)
