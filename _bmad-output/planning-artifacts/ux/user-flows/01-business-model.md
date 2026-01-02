# 1. Business Model Overview

[← Back to Index](./README.md) | [Next: Roles →](./02-roles.md)

---

## 1.1 What is PrimeEditz?

PrimeEditz is a **B2B post-production workflow platform** for businesses that provide editing services to photography studios and agencies.

### The One-Liner

> **PrimeEditz** = The software that runs YOUR post-production business

---

## 1.2 Visual: How PrimeEditz Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRIMEEDITZ = YOUR BUSINESS                        │
└─────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────────┐
                         │     PRIMEEDITZ       │
                         │  (Your Business)     │
                         │                      │
                         │  Post-Production     │
                         │  Services:           │
                         │  • Color Grading     │
                         │  • Photo Editing     │
                         │  • Video Editing     │
                         │  • Album Design      │
                         │  • Thumbnails        │
                         │  • Posters           │
                         │  • YouTube Edits     │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
    │  Studio Client  │   │  Studio Client  │   │  Internal Work  │
    │  "ABC Photos"   │   │  "XYZ Studios"  │   │  (R&D, etc.)    │
    └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
             │                     │                     │
      Their Projects         Their Projects        Your Projects
             │                     │                     │
    ┌────────┴────────┐   ┌────────┴────────┐   ┌────────┴────────┐
    │ Priya's Wedding │   │ Corp XYZ Event  │   │ Portfolio Update│
    └─────────────────┘   └─────────────────┘   └─────────────────┘

    *** Studio clients' customers are NOT PrimeEditz users ***
```

---

## 1.3 Key Terminology (v3.0 — Project-Centric)

| Term             | Definition                                  | Example                                 |
| ---------------- | ------------------------------------------- | --------------------------------------- |
| **Project**      | A unit of work — the central entity         | "Priya's Wedding Photos"                |
| **Project Type** | Category of project with specific workflow  | "Wedding Photography", "YouTube Edit"   |
| **Client**       | B2B customer (studio/agency)                | ABC Photos, XYZ Studios                 |
| **End Client**   | Client's customer (NOT a PrimeEditz user)   | Priya (the bride)                       |
| **Stage**        | A workflow step within a project            | "Culling", "Color Grading", "QC Review" |
| **Deliverable**  | Final output for client                     | Album PDF, YouTube Video                |
| **Employee**     | Your internal team (editors, QC, designers) | Rahul (Editor), Priya (QC)              |

---

## 1.4 v3.0 Entity Model: Project-Centric

### Old Model (v2.0) — DEPRECATED

```
Event → Session → Project
(Too rigid, always required client)
```

### New Model (v3.0) — PROJECT-CENTRIC

```
PROJECT (central entity)
    │
    ├── Project Type (configurable)
    ├── Stages (workflow steps)
    ├── Team (per-project assignment)
    ├── Assets (uploaded files)
    ├── Deliverables (versioned outputs)
    └── Quotation (versioned, for client projects)
```

### Why the Change?

| Problem with v2.0                 | Solution in v3.0                          |
| --------------------------------- | ----------------------------------------- |
| Always required client initiation | Admin can create internal projects        |
| Fixed workflow stages             | Configurable stages per project type      |
| Global roles (Employee = Editor)  | Per-project role assignment               |
| No versioning                     | Versioning on deliverables and quotations |
| Rigid "event" terminology         | Flexible "project type" system            |

---

## 1.5 Two Project Creation Paths

### Path A: Client-Initiated (Quotation Required)

```
1. Client requests project (selects project type)
2. Admin reviews, creates quotation
3. Client approves quotation
4. Storage allocated, upload unlocked
5. Client uploads assets
6. Work begins
```

**For:** Wedding photos, corporate events, YouTube edits — any client work

### Path B: Admin-Initiated (Direct Creation)

```
1. Admin creates project (selects project type + storage tier)
2. Admin assigns team
3. Admin uploads assets (if needed)
4. Work begins
```

**For:** Internal R&D, portfolio updates, templates, training projects

---

## 1.6 Project Type Categories

| Category             | Examples                                         | Source       |
| -------------------- | ------------------------------------------------ | ------------ |
| **Wedding & Events** | Wedding Photography, Cinematography, Pre-Wedding | Client       |
| **Corporate**        | Corporate Event, Product Shoot, Brand Video      | Client       |
| **Social Media**     | YouTube Long-form, Shorts, Thumbnails            | Client/Admin |
| **Design**           | Poster, Album Design, Invitation                 | Client/Admin |
| **Internal**         | R&D, Template Creation, Portfolio Update         | Admin only   |

---

## 1.7 This is NOT

| What it's NOT                        | What it IS                           |
| ------------------------------------ | ------------------------------------ |
| A photography studio management tool | A post-production workflow platform  |
| A consumer-facing app                | A B2B platform                       |
| A generic project management tool    | A specialized creative workflow tool |
| A file storage solution              | A workflow + storage solution        |

---

[Next: The Three Roles →](./02-roles.md)
