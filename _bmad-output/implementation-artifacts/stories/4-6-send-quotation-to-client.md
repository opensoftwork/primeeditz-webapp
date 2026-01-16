# Story 4-6: Send Quotation to Client

**Epic**: Epic 4 - Quotation System  
**Status**: in-progress  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-16  
**Priority**: HIGH — Enables client delivery and approval workflow

---

## 📋 User Story

**As an** Admin,  
**I want** to send a quotation to a client via email or shareable link,  
**So that** the client can review and approve the quotation.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                 | Status  | Notes                           |
| -------------------------- | ------- | ------------------------------- |
| **4-3 - Create Quotation** | ✅ Done | Quotation exists to be sent     |
| **4-5 - Preview & Print**  | ✅ Done | Document layout for client view |

### Enables

| Story                       | Notes                        |
| --------------------------- | ---------------------------- |
| 4-7 - Client View Quotation | Public URL for client access |
| 4-8 - Client Approve        | Approval after viewing       |

---

## ✅ Acceptance Criteria

### Send Quotation Action

- [ ] **Given** I am viewing a quotation detail page
- [ ] **When** I click "Send to Client"
- [ ] **Then** a dialog/drawer opens with sending options

### Share Link Generation

- [ ] **Given** I am in the send dialog
- [ ] **When** I click "Generate Link"
- [ ] **Then** a unique shareable link is created
- [ ] **And** link is copied to clipboard
- [ ] **And** link expiry can be set (optional)

### Email Sending

- [ ] **Given** I am in the send dialog
- [ ] **When** I enter client email and click "Send"
- [ ] **Then** an email is sent with quotation link
- [ ] **And** email includes quotation summary
- [ ] **And** status changes to "sent"

### Status Update

- [ ] **Given** a quotation is sent
- [ ] **When** the send action completes
- [ ] **Then** quotation status changes from "draft" to "sent"
- [ ] **And** sentAt timestamp is recorded
- [ ] **And** activity log is updated

### Resend Capability

- [ ] **Given** a quotation has been sent
- [ ] **When** I want to resend
- [ ] **Then** I can generate a new link or resend email
- [ ] **And** previous links remain valid (or can be invalidated)

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
│  ┌─────────────────────────────────────────────────────────┐│
│  │  SHARE LINK                                              ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  🔗 https://app.primeeditz.com/q/abc123xyz               ││
│  │                                                          ││
│  │  [📋 Copy Link]              Valid for: [30 days ▼]      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ─────────────────── OR ───────────────────                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  SEND VIA EMAIL                                          ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Email Address*                                          ││
│  │  [client@acmeproductions.com                    ]        ││
│  │                                                          ││
│  │  Personal Message (optional)                             ││
│  │  [Please review the attached quotation...        ]       ││
│  │                                                          ││
│  │                              [📧 Send Email]             ││
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

### Phase A: Share Token & Public Access (~2 points)

#### Task A1: Schema Updates

**File**: `convex/schema.ts`

- [ ] A1.1 Add share token fields to quotations table:
  ```typescript
  shareToken: v.optional(v.string()),      // Unique token for public access
  shareTokenExpiresAt: v.optional(v.number()), // Expiry timestamp
  sentAt: v.optional(v.number()),          // When quotation was sent
  sentTo: v.optional(v.string()),          // Email address sent to
  ```

#### Task A2: Generate Share Token Mutation

**File**: `convex/functions/quotations/mutations.ts`

- [ ] A2.1 Create `generateShareToken` mutation
- [ ] A2.2 Generate secure random token (nanoid or uuid)
- [ ] A2.3 Set expiry date (default 30 days)
- [ ] A2.4 Return full public URL

#### Task A3: Public Quotation Query

**File**: `convex/functions/quotations/queries.ts`

- [ ] A3.1 Create `getQuotationByShareToken` query
- [ ] A3.2 Validate token and check expiry
- [ ] A3.3 Return quotation data (limited fields for security)

---

### Phase B: Send UI & Status (~2 points)

#### Task B1: Send Quotation Drawer

**File**: `src/components/modules/admin/quotations/send/send-quotation-drawer.tsx`

- [ ] B1.1 Create drawer component
- [ ] B1.2 Display quotation summary (code, total, client)
- [ ] B1.3 "Generate Link" section with copy button
- [ ] B1.4 Email input with send button
- [ ] B1.5 Link validity selector (7, 14, 30, 90 days)

#### Task B2: Update Quotation Detail Header

**File**: `src/components/modules/admin/quotations/detail/components/detail-header.tsx`

- [ ] B2.1 Add "Send to Client" button
- [ ] B2.2 Open send drawer on click
- [ ] B2.3 Show "Resend" for already-sent quotations

#### Task B3: Status Update Mutation

**File**: `convex/functions/quotations/mutations.ts`

- [ ] B3.1 Create `sendQuotation` mutation
- [ ] B3.2 Update status to "sent"
- [ ] B3.3 Record sentAt timestamp
- [ ] B3.4 Record sentTo email (if email sent)

---

### Phase C: Email Integration (Optional/Deferred) (~1 point)

#### Task C1: Email Action

**File**: `convex/functions/quotations/actions.ts`

- [ ] C1.1 Create `sendQuotationEmail` action
- [ ] C1.2 Use Resend/SendGrid/nodemailer
- [ ] C1.3 Email template with quotation summary
- [ ] C1.4 Include CTA button to view quotation

> **Note**: For MVP, we can defer email and focus on share link functionality.

---

## 🧩 Component Structure

```
src/components/modules/admin/quotations/send/
├── index.ts                     # Barrel exports
├── send-quotation-drawer.tsx    # Main send drawer
├── share-link-section.tsx       # Link generation UI
└── email-section.tsx            # Email form (optional)
```

---

## 📦 Public Route (Story 4-7 Dependency)

The public route for clients to view quotations will be:

```
/q/[token]  →  Public quotation view (no auth required)
```

This will be implemented in **Story 4-7**.

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Click "Send to Client" → drawer opens
- [ ] Click "Generate Link" → link created and copied
- [ ] Copy link to incognito → able to view (after 4-7)
- [ ] Send with email → status changes to "sent"
- [ ] View quotation detail → shows "Sent" status badge

### Edge Cases

- [ ] Already sent quotation → shows "Resend" option
- [ ] Expired link → shows expiry message (4-7)
- [ ] Invalid token → 404 page (4-7)

---

## 🚀 Definition of Done

- [ ] Share token generated and stored
- [ ] Copy link functionality working
- [ ] Status updates to "sent"
- [ ] Send drawer UI complete
- [ ] "Send to Client" button in detail header
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status      | Notes                                  |
| ---------- | ----------- | -------------------------------------- |
| 2026-01-16 | in-progress | Story created, starting implementation |

---

**Previous Story**: 4-5 - Quotation Preview & Print  
**Next Story**: 4-7 - Client View Quotation
