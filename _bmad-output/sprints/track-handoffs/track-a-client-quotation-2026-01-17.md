# 🎯 Sprint Track Handoff: Track A - Client Quotation Workflow

**Assigned To**: Divya (Senior Developer)  
**Date**: 2026-01-17  
**Track**: A (Parallel with Track B - Kavya)  
**Estimated Duration**: 1-2 weeks

---

## 🚀 Quick Start

**Current Status**: Story 4-6 is `in-progress`

1. Continue with Story 4-6: Send Quotation to Client
2. Use `/dev` agent to implement
3. Mark stories as `done` when complete

---

## 📋 Mission Briefing

### What You're Building

You are implementing the **Client Quotation Workflow** that enables:

- Admins to send quotations to clients
- Clients to view quotations in their dashboard
- Clients to accept, reject, or request changes

### Why This Matters

```
Your Work (Track A)                    Epic 5 (Blocked Until Complete)
─────────────────────                  ─────────────────────────────────

[4-6] Send Quotation ───────────────► Quotation visible to client

[4-7] Client View ──────────────────► Client can see quotation

[4-8] Client Accept ────────────────► [5-2] Upload Gate Opens
      Status → "approved"                  "Client can now upload files"

[4-9] Request Changes ──────────────► Admin revises quotation
      Status → "changes_requested"

[4-9b] Reject ──────────────────────► End of quotation flow
       Status → "rejected"
```

**Story 4-8 (Client Accept) is the GATE for Epic 5!** Without client acceptance, uploads cannot begin.

---

## 📁 Your Assigned Stories (In Order)

### Story 1: [4-6] Send Quotation to Client

**Priority**: HIGH  
**Points**: 5  
**Status**: `in-progress`  
**File**: `_bmad-output/implementation-artifacts/stories/4-6-send-quotation-to-client.md`

**Summary**: Enable admins to mark quotations as "sent" with dual-channel delivery (Dashboard + Public Link)

**Key Deliverables**:

- [ ] Schema: Add `shareToken`, `shareTokenExpiresAt` fields
- [ ] Backend: `sendQuotation`, `generateShareToken` mutations
- [ ] Backend: `getQuotationByShareToken` query
- [ ] Backend: `getClientQuotations` query (for client dashboard)
- [ ] UI: Send quotation drawer with link generation
- [ ] UI: Update detail header with "Send to Client" button

---

### Story 2: [4-7] Client View Quotation

**Priority**: HIGH  
**Points**: 5  
**Status**: `ready-for-dev`  
**File**: `_bmad-output/implementation-artifacts/stories/4-7-client-view-quotation.md`

**Summary**: Enable clients to view quotations in dashboard and via public share link

**Key Deliverables**:

- [ ] UI: Quotations section in client dashboard
- [ ] UI: Client quotation detail page (`/quotations/[id]`)
- [ ] UI: Public share page (`/q/[token]`)
- [ ] Backend: `markQuotationViewed` mutation

---

### Story 3: [4-8] Client Accept Quotation

**Priority**: CRITICAL (Gates Epic 5)  
**Points**: 5  
**Status**: `ready-for-dev`  
**File**: `_bmad-output/implementation-artifacts/stories/4-8-client-accept-quotation.md`

**Summary**: Enable clients to accept quotations with T&C checkbox and digital signature

**Key Deliverables**:

- [ ] Backend: `acceptQuotation` mutation
- [ ] UI: Accept confirmation drawer
- [ ] UI: Post-acceptance success state
- [ ] Schema: `clientSignature` field

---

### Story 4: [4-9] Client Request Changes

**Priority**: MEDIUM  
**Points**: 3  
**Status**: `ready-for-dev`  
**File**: `_bmad-output/implementation-artifacts/stories/4-9-client-request-changes.md`

**Summary**: Enable clients to request changes with structured feedback (checkboxes + comments)

**Key Deliverables**:

- [ ] Backend: `requestQuotationChanges` mutation
- [ ] Schema: `changeReasons`, `changeRequestedAt` fields
- [ ] UI: Request changes drawer with checkboxes
- [ ] UI: Admin view of client feedback

---

### Story 5: [4-9b] Client Reject Quotation

**Priority**: MEDIUM  
**Points**: 2  
**Status**: `ready-for-dev`  
**File**: `_bmad-output/implementation-artifacts/stories/4-9b-client-reject-quotation.md`

**Summary**: Enable clients to reject quotations with reason

**Key Deliverables**:

- [ ] Backend: `rejectQuotation` mutation
- [ ] Schema: `rejectionReason` field
- [ ] UI: Rejection dialog

---

## 🏗️ Technical Context

### Schema Fields to Add/Verify

```typescript
// In convex/schema.ts - quotations table

// For 4-6: Share token
shareToken: v.optional(v.string()),
shareTokenExpiresAt: v.optional(v.number()),

// For 4-8: Client signature
clientSignature: v.optional(v.string()),

// For 4-9: Change request
changeReasons: v.optional(v.array(v.string())),
changeRequestedAt: v.optional(v.number()),

// For 4-9b: Rejection
rejectionReason: v.optional(v.string()),
```

### Key Files to Reference

| Purpose             | File                                                    |
| ------------------- | ------------------------------------------------------- |
| Quotation schema    | `convex/schema.ts` (lines 304-356)                      |
| Quotation mutations | `convex/functions/quotations/mutations.ts`              |
| Quotation queries   | `convex/functions/quotations/queries.ts`                |
| Admin quotation UI  | `src/components/modules/admin/quotations/`              |
| Client dashboard    | `src/components/modules/dashboard/client/dashboard.tsx` |

### Existing Patterns

1. **Drawer components**: Use shadcn Sheet
2. **Forms**: React Hook Form + Zod
3. **Mutations**: Use `useMutation` from Convex
4. **Premium styling**: Dark glassmorphism theme

---

## 🔄 Parallel Track Sync Points

### With Kavya (Track B)

**Sync after completing 4-8**:

- Your 4-8 (Client Accept) + Kavya's 3-4 (Folder Setup) = **Ready for Epic 5**

```
┌─────────────────────────────────────────────────────────────────────┐
│  SYNC POINT: Before Starting Epic 5                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Track A (Divya)              Track B (Kavya)                       │
│  ───────────────              ───────────────                       │
│  4-8 Accept ✓                 3-9 Storage Tiers ✓                   │
│                               3-10 Folder Templates ✓               │
│                               3-4 Folder Setup ✓                    │
│                                                                      │
│                     ↓                                               │
│           BOTH COMPLETE → Epic 5 Can Start                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Definition of Done (Per Story)

- [ ] Backend queries and mutations work
- [ ] UI matches premium design aesthetic
- [ ] Form validation with Zod
- [ ] Loading and error states handled
- [ ] Story file marked with status updates
- [ ] `sprint-status.yaml` updated

---

## 📊 Progress Tracker

| Story               | Status         | Started    | Completed | Notes    |
| ------------------- | -------------- | ---------- | --------- | -------- |
| 4-6 Send Quotation  | 🟡 In Progress | 2026-01-17 |           |          |
| 4-7 Client View     | ⬜ Not Started |            |           |          |
| 4-8 Client Accept   | ⬜ Not Started |            |           | CRITICAL |
| 4-9 Request Changes | ⬜ Not Started |            |           |          |
| 4-9b Reject         | ⬜ Not Started |            |           |          |

---

## 💬 Initialization Prompt

```
I am Divya, working on Track A of the PrimeEditz sprint.

Please read my handoff file:
_bmad-output/sprints/track-handoffs/track-a-client-quotation-2026-01-17.md

I am currently implementing Story 4-6: Send Quotation to Client.
The story file is at: _bmad-output/implementation-artifacts/stories/4-6-send-quotation-to-client.md

Help me continue implementation. I need to [specific task].
```

---

**Let's ship this! 🚀**

_— Divya_
