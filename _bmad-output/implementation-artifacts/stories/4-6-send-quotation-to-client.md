# Story 4-6: Send Quotation to Client

**Epic**: Epic 4 - Quotation System  
**Status**: in-progress  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-16  
**Updated**: 2026-01-17
**Priority**: HIGH — Enables client delivery and approval workflow

---

## 📋 User Story

**As an** Admin,  
**I want** to mark a quotation as "sent" and make it visible to the client,  
**So that** the client can review and respond to the quotation.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                 | Status  | Notes                           |
| -------------------------- | ------- | ------------------------------- |
| **4-3 - Create Quotation** | ✅ Done | Quotation exists to be sent     |
| **4-5 - Preview & Print**  | ✅ Done | Document layout for client view |

### Enables

| Story                       | Notes                         |
| --------------------------- | ----------------------------- |
| 4-7 - Client View Quotation | Dashboard + public URL access |
| 4-8 - Client Approve        | Approval after viewing        |

---

## ✅ Acceptance Criteria

### AC1: Send Quotation Action

- [ ] **Given** I am viewing a quotation detail page
- [ ] **When** I click "Send to Client"
- [ ] **Then** a confirmation dialog/drawer opens with sending options

### AC2: Dashboard Delivery (Primary Channel)

- [ ] **Given** the quotation has a linked `clientId`
- [ ] **When** I confirm sending
- [ ] **Then** quotation status changes from "draft" to "sent"
- [ ] **And** quotation becomes visible in client's dashboard
- [ ] **And** `sentAt` timestamp is recorded

### AC3: Share Link Generation (Secondary Channel)

- [ ] **Given** I am in the send dialog
- [ ] **When** I click "Generate Public Link"
- [ ] **Then** a unique shareable token is created
- [ ] **And** link is copied to clipboard
- [ ] **And** link expiry can be set (7, 14, 30, 90 days)

### AC4: Schema Updates

- [ ] **Given** the quotations table
- [ ] **Then** the following fields exist:
  - `shareToken: v.optional(v.string())` — Unique token for public access
  - `shareTokenExpiresAt: v.optional(v.number())` — Expiry timestamp
  - `sentAt: v.optional(v.number())` — When quotation was sent
  - `sentTo: v.optional(v.string())` — Email address (for email channel, future)

### AC5: Status Update

- [ ] **Given** a quotation is sent
- [ ] **When** the send action completes
- [ ] **Then** quotation status changes from "draft" to "sent"
- [ ] **And** activity log is updated (if implemented)

### AC6: Resend Capability

- [ ] **Given** a quotation has already been sent
- [ ] **When** I click "Resend" or "Generate New Link"
- [ ] **Then** I can generate a new share token
- [ ] **And** optionally invalidate previous links

---

## 🎨 UX Design

### Send Quotation Drawer

```
┌─────────────────────────────────────────────────────────────┐
│  Send Quotation                                        [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 Quotation: QT-2026-00042                                 │
│  💰 Total: ₹2,45,000                                         │
│  👤 Client: Acme Productions                                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃  📊 DASHBOARD (Primary)                                ┃  │
│  ┃  ─────────────────────────────────────────────────────  ┃  │
│  ┃  ✅ Quotation will appear in client's dashboard         ┃  │
│  ┃     Client can log in to view and respond               ┃  │
│  ┃                                                         ┃  │
│  ┃                         [✓ Mark as Sent]                ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                              │
│  ─────────────────── OR ───────────────────                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🔗 SHARE LINK (For clients without account)            ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  https://app.primeeditz.com/q/abc123xyz                 ││
│  │                                                          ││
│  │  [📋 Copy Link]              Valid for: [30 days ▼]      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ⚠️ Sending will change status from Draft to Sent           │
│                                                              │
│  [Cancel]                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Schema & Status Update (~2 points)

#### Task A1: Schema Updates

**File**: `convex/schema.ts`

- [ ] A1.1 Add share token fields to quotations table (if not already present):
  ```typescript
  shareToken: v.optional(v.string()),      // Unique token for public access
  shareTokenExpiresAt: v.optional(v.number()), // Expiry timestamp
  ```
- [ ] A1.2 Verify `sentAt` field exists
- [ ] A1.3 Add index `by_shareToken` for token lookup

#### Task A2: Send Quotation Mutation

**File**: `convex/functions/quotations/mutations.ts`

- [ ] A2.1 Create `sendQuotation` mutation
- [ ] A2.2 Update status from `draft` to `sent`
- [ ] A2.3 Set `sentAt` timestamp
- [ ] A2.4 Generate and store share token (nanoid)
- [ ] A2.5 Set token expiry based on validity selection

#### Task A3: Get Quotation by Share Token Query

**File**: `convex/functions/quotations/queries.ts`

- [ ] A3.1 Create `getQuotationByShareToken` query
- [ ] A3.2 Validate token exists and hasn't expired
- [ ] A3.3 Return quotation data for client view

---

### Phase B: Send UI (~2 points)

#### Task B1: Send Quotation Drawer

**File**: `src/components/modules/admin/quotations/send/send-quotation-drawer.tsx`

- [ ] B1.1 Create drawer component with Sheet from shadcn
- [ ] B1.2 Display quotation summary (code, total, client name)
- [ ] B1.3 Dashboard section with "Mark as Sent" button
- [ ] B1.4 Share link section with copy functionality
- [ ] B1.5 Link validity dropdown (7, 14, 30, 90 days)
- [ ] B1.6 Copy to clipboard with toast notification

#### Task B2: Update Quotation Detail Header

**File**: `src/components/modules/admin/quotations/detail/components/detail-header.tsx`

- [ ] B2.1 Add "Send to Client" button (for draft quotations)
- [ ] B2.2 Add "Resend" button (for already-sent quotations)
- [ ] B2.3 Show "Sent" status badge with timestamp
- [ ] B2.4 Open send drawer on click

---

### Phase C: Client Query (~1 point)

#### Task C1: Client Quotations Query

**File**: `convex/functions/quotations/queries.ts`

- [ ] C1.1 Create `getMyQuotations` query for clients
- [ ] C1.2 Filter by `clientId` matching current user's profile
- [ ] C1.3 Filter by status (show `sent`, `viewed`, `approved`, `changes_requested`)
- [ ] C1.4 Return quotation list for dashboard display

---

## 🧩 Component Structure

```
src/components/modules/admin/quotations/send/
├── index.ts                     # Barrel exports
├── send-quotation-drawer.tsx    # Main send drawer
├── dashboard-section.tsx        # Dashboard delivery option
├── share-link-section.tsx       # Link generation UI
└── validity-selector.tsx        # Expiry dropdown
```

---

## 📦 Public Route (Story 4-7)

The public route for clients to view quotations will be:

```
/q/[token]  →  Public quotation view (no auth required)
```

This will be implemented in **Story 4-7**.

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Click "Send to Client" → drawer opens
- [ ] Click "Mark as Sent" → status changes to "sent"
- [ ] Click "Generate Link" → link created and copied
- [ ] View quotation detail → shows "Sent" status badge
- [ ] Already sent quotation → shows "Resend" option

### Edge Cases

- [ ] Quotation without client → warning shown
- [ ] Already sent quotation → can still regenerate link
- [ ] Draft quotation → "Send to Client" button visible

---

## 🚀 Definition of Done

- [ ] `sendQuotation` mutation working
- [ ] Share token generated and stored
- [ ] Copy link functionality working
- [ ] Status updates to "sent"
- [ ] Send drawer UI complete
- [ ] "Send to Client" button in detail header
- [ ] Client query ready for 4-7
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status      | Notes                                                 |
| ---------- | ----------- | ----------------------------------------------------- |
| 2026-01-16 | in-progress | Story created, starting implementation                |
| 2026-01-17 | in-progress | Updated with dual-channel delivery (dashboard + link) |

---

**Previous Story**: 4-5 - Quotation Preview & Print  
**Next Story**: 4-7 - Client View Quotation
