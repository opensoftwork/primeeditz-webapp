# 07 — Defining Core Experience

**Core Promise & Experience Mechanics — PrimeEditz**

---

## The Defining Experience

### For PrimeEditz: "Instant Status Visibility"

> **The core promise:** See exactly where your project is — instantly.

This is the interaction that, if nailed, makes PrimeEditz feel magical. Users eliminate phone calls, WhatsApp chaos, and "is my work ready?" anxiety because the answer is _always_ visible.

### Per-Role Defining Experiences

| Role         | Defining Experience                        | "Tell a Friend"                         |
| ------------ | ------------------------------------------ | --------------------------------------- |
| **Client**   | Check dashboard → instantly know status    | "I can see exactly where my photos are" |
| **Employee** | Open queue → grab files → edit → drop back | "It's a task inbox that just works"     |
| **Admin**    | One view → everything happening            | "Mission control for my studio"         |

---

## User Mental Model

### How Users Currently Solve This

| Role         | Current Approach                      | Pain Points                            |
| ------------ | ------------------------------------- | -------------------------------------- |
| **Client**   | WhatsApp, calls, shared folders       | No visibility, constant back-and-forth |
| **Employee** | Email, shared drives, manual tracking | Hunting for files, unclear priorities  |
| **Admin**    | Spreadsheets, mental tracking         | No single truth, easy to miss things   |

### Mental Models Users Bring

- **"Dashboard"** = at-a-glance summary
- **"Project"** = container for all related assets/history
- **"Status"** = simple states: Pending → In Progress → Done
- **"Upload"** = drag-drop (like Dropbox)
- **"Download"** = one click, get files

---

## Success Criteria

| Scenario               | Success Metric                                 |
| ---------------------- | ---------------------------------------------- |
| Client checks status   | < 3s from login to seeing progress             |
| Client uploads files   | Upload starts on drop, progress visible        |
| Client approves quote  | One click, immediate unlock                    |
| Employee grabs work    | Dashboard → top priority → download in 1 click |
| Employee submits work  | Drop files, mark complete, next appears        |
| Admin reviews requests | All pending in one view, batch actions         |

### Speed Requirements

- Dashboard load: < 2 seconds
- Status visible: above the fold (no scroll)
- Action confirmation: immediate (optimistic UI)

---

## Novel UX Patterns

### Established (Users Already Know)

- Dashboard cards → Project status cards
- Drag-drop upload → File upload everywhere
- Progress bars → Stage completion
- Toast notifications → Action confirmations

### Novel/Adapted

- Unified onboarding + first project → Immediate value
- Command palette (⌘K) → Power user efficiency
- Trust-first upload → Free tier before quotation
- Inline actions → Approve/download without navigation

---

## Experience Mechanics: Client Status Check

### 1. Initiation

- Login → Dashboard loads immediately
- Skeleton screens show structure while content loads
- Projects visible without scrolling

### 2. Interaction

- Status cards show: Project name, status badge, progress bar, due date
- "Needs Your Attention" section surfaces actionable items
- Click card → expand details or navigate to project

### 3. Feedback

- Status colors: 🟡 In Progress, 🟢 Complete, 🟠 Needs Action
- Real-time updates (progress bar animates live)
- Toast confirmations for all actions

### 4. Completion

- Client understands status in < 3 seconds
- If action needed, it's one click away
- No navigation required for basic understanding

---

_Defining experience framework established through collaborative discovery._
