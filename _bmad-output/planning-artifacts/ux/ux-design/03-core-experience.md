# 03 — Core User Experience

**Platform Strategy & Interaction Principles — PrimeEditz**

---

## Defining Experience

The core experience of PrimeEditz is **instant status visibility**. At every moment, every user should know exactly:

- What's happening with their project
- What action (if any) they need to take
- What's coming next

### The Core Loop

```
View Status → Take Action (if needed) → See Result Immediately
```

For each role, this translates to:

| Role         | Core Loop                                                                         |
| ------------ | --------------------------------------------------------------------------------- |
| **Client**   | "Where's my project?" → Glance at dashboard → See progress + pending actions      |
| **Employee** | "What's my next task?" → View assignments → Download, edit locally, upload back   |
| **Admin**    | "What needs my attention?" → Review pending queue → Approve, assign, or follow up |

---

## Platform Strategy

| Platform          | Priority | Approach                                                            |
| ----------------- | -------- | ------------------------------------------------------------------- |
| **Web (Desktop)** | Primary  | Full feature set, keyboard shortcuts (⌘K), multi-window support     |
| **Web (Mobile)**  | High     | All critical actions accessible, touch-optimized, glanceable status |
| **Native Apps**   | Post-MVP | Evaluate based on user demand after launch                          |

### Technical Approach

- Responsive design with mobile-first breakpoints
- Touch-friendly targets (min 44px) on all interactive elements
- Keyboard navigation and shortcuts for power users
- Real-time sync via Convex subscriptions
- No offline mode required (always-connected workflow)

---

## Effortless Interactions

These interactions MUST feel frictionless:

| Interaction              | Design Target                                                             |
| ------------------------ | ------------------------------------------------------------------------- |
| **File Upload**          | Drag-drop anywhere on page, paste from clipboard, progress visible inline |
| **Status Check**         | Dashboard loads in <2s, status visible without scrolling                  |
| **Approve Quotation**    | One click from dashboard card, confirmation inline                        |
| **Download Deliverable** | Single click, download starts immediately, no new tabs                    |
| **Create Project**       | Inline with onboarding, merged with first upload                          |
| **Find Anything**        | Command palette (⌘K) for power users, global search                       |

---

## Critical Success Moments

| Moment                       | User Reaction                    | Design Requirement                                        |
| ---------------------------- | -------------------------------- | --------------------------------------------------------- |
| **First upload completes**   | "My files are safe"              | Show success toast, update folder count instantly         |
| **Real-time status update**  | "I don't need to call them"      | Progress bar animates, stage completion notifications     |
| **Deliverable appears**      | "They're done and I can see it!" | Push notification + dashboard badge + email               |
| **Quote approved instantly** | "No email back-and-forth"        | Immediate unlock of upload, confirmation + next steps     |
| **Download works first try** | "Easy to get my files"           | Fast signed URLs, progress indicator, resumable downloads |

---

## Experience Principles

These principles guide ALL UX decisions in PrimeEditz:

### 1. Status at a Glance

> Users should never hunt for information. Current state, progress, and pending actions are always visible at the top level.

### 2. One Action, One Click

> Critical actions (approve, download, upload) should never require navigation. Inline actions are preferred.

### 3. Trust First, Verify Later

> Give users capabilities upfront. Free tier allows immediate uploads. Quotation expands, doesn't gate.

### 4. Client is Royalty

> The client experience is paramount. Premium feel, minimal friction, maximum respect for their time.

### 5. Get Out of the Way

> For employees, the platform facilitates work without creating administrative overhead. Quick access, quick exit.

### 6. Real-Time Everything

> Nothing should feel stale. Status updates live. Uploads show progress. Notifications appear instantly.

---

_Core experience defined through collaborative discovery with the BMAD team._
