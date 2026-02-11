# Story 4-7: Client View Quotation

**Epic**: Epic 4 - Quotation System  
**Status**: done  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-17  
**Updated**: 2026-01-18  
**Priority**: HIGH — Client must be able to view quotations to respond

---

## 📋 User Story

**As a** Client,  
**I want** to view quotations sent to me in my dashboard OR via a shared link,  
**So that** I can review the details and decide to accept, reject, or request changes.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                 | Status      | Notes                           |
| -------------------------- | ----------- | ------------------------------- |
| **4-6 - Send Quotation**   | in-progress | Quotation status = "sent"       |
| **2-1 - Client Dashboard** | ✅ Done     | Dashboard exists to add section |

### Enables

| Story                          | Notes                               |
| ------------------------------ | ----------------------------------- |
| 4-8 - Client Approve Quotation | Accept button on quotation view     |
| 4-9 - Client Request Changes   | Request changes from quotation view |

---

## ✅ Acceptance Criteria

### AC1: Dashboard Quotation Listing

- [x] **Given** I am a logged-in client
- [x] **When** I view my dashboard
- [x] **Then** I see a "Pending Quotations" section
- [x] **And** quotations with status `sent` or `viewed` appear here
- [x] **And** each quotation shows: code, total amount, status, validity date

### AC2: Dashboard Quotation Card

- [x] **Given** I see a quotation in my dashboard
- [x] **Then** I see the following information:
  - Quotation code (e.g., QT-2026-00042)
  - Total amount with currency (₹2,45,000)
  - Status badge (AWAITING RESPONSE, ACCEPTED, CHANGES REQUESTED)
  - Valid until date
  - [View] button

### AC3: Authenticated Quotation Detail View

- [x] **Given** I am a logged-in client
- [x] **When** I click "View" on a quotation card
- [x] **Then** I am taken to `/quotations/[id]`
- [x] **And** I see the full quotation with all line items
- [x] **And** I see Accept, Reject, and Request Changes buttons

### AC4: Public Quotation View (Share Token)

- [x] **Given** I have a share link (e.g., `/q/abc123xyz`)
- [x] **When** I open the link (logged in or not)
- [x] **Then** I see the full quotation details
- [x] **And** if token is valid, the quotation displays
- [x] **And** if token is expired, I see an "Expired" message
- [x] **And** if token is invalid, I see a 404 page

### AC5: Mark as Viewed

- [x] **Given** a client views a quotation for the first time
- [x] **When** the quotation detail page loads
- [x] **Then** status changes from `sent` to `viewed`
- [x] **And** `viewedAt` timestamp is recorded

### AC6: Status Badge Display

- [x] **Given** a quotation has any status
- [x] **Then** I see appropriate badge styling:
  - `sent` / `viewed` → Amber "AWAITING RESPONSE"
  - `approved` → Green "ACCEPTED ✅"
  - `changes_requested` → Purple "CHANGES REQUESTED"
  - `rejected` → Red "REJECTED"
  - `expired` → Gray "EXPIRED"

---

## 🎨 UX Design

### Client Dashboard - Quotations Section

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CLIENT DASHBOARD                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [EXISTING] Stats Cards                                                  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  📋 QUOTATIONS                                          [View All →]     │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ┌─────────────────────────────────────────────────────────────────┐││
│  │  │  QT-2026-00042                                                  │││
│  │  │  ──────────────────────────────────────────────────────────     │││
│  │  │  💰 ₹2,45,000        📅 Valid: Jan 30, 2026                     │││
│  │  │                                                                 │││
│  │  │  [AWAITING RESPONSE]                               [VIEW →]    │││
│  │  └─────────────────────────────────────────────────────────────────┘││
│  │                                                                     ││
│  │  ┌─────────────────────────────────────────────────────────────────┐││
│  │  │  QT-2026-00035                                                  │││
│  │  │  ──────────────────────────────────────────────────────────     │││
│  │  │  💰 ₹85,000          📅 Accepted: Jan 10, 2026                  │││
│  │  │                                                                 │││
│  │  │  [ACCEPTED ✅]                                      [VIEW →]    │││
│  │  └─────────────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  [EXISTING] Production Pipeline                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Quotation Detail View (Client)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  QUOTATION                                                          ││
│  │  ═══════════════════════════════════════════════════════════════    ││
│  │                                                                     ││
│  │  QT-2026-00042                              [AWAITING RESPONSE]     ││
│  │  ──────────────────────────────────────────────────────────────     ││
│  │  Created: Jan 15, 2026                      Valid Until: Jan 30     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  LINE ITEMS                                                         ││
│  │  ───────────────────────────────────────────────────────────────    ││
│  │                                                                     ││
│  │  [Section-wise breakdown - same as admin preview]                   ││
│  │                                                                     ││
│  │  ───────────────────────────────────────────────────────────────    ││
│  │  SUBTOTAL                                           ₹2,07,627.12    ││
│  │  GST (18%)                                            ₹37,372.88    ││
│  │  ═══════════════════════════════════════════════════════════════    ││
│  │  TOTAL                                              ₹2,45,000.00    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  TERMS & CONDITIONS                                                 ││
│  │  ───────────────────────────────────────────────────────────────    ││
│  │  1. 50% advance payment required to start work                      ││
│  │  2. Balance due upon delivery                                       ││
│  │  ...                                                                ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  [✅ Accept Quotation]  [📝 Request Changes]  [❌ Reject]           ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Dashboard Integration (~2 points)

#### Task A1: Client Quotations Query

**File**: `convex/functions/quotations/queries.ts`

- [ ] A1.1 Create `getClientQuotations` query
- [ ] A1.2 Filter by current user's profile ID as `clientId`
- [ ] A1.3 Return quotations with status in ['sent', 'viewed', 'approved', 'changes_requested', 'rejected']
- [ ] A1.4 Sort by `sentAt` descending (most recent first)

#### Task A2: Dashboard Quotations Section

**File**: `src/components/modules/dashboard/client/quotations-section.tsx`

- [ ] A2.1 Create quotations section component
- [ ] A2.2 Fetch quotations using `getClientQuotations` query
- [ ] A2.3 Display quotation cards with summary info
- [ ] A2.4 Show empty state if no quotations
- [ ] A2.5 Limit to 3 most recent, with "View All" link

#### Task A3: Update Client Dashboard

**File**: `src/components/modules/dashboard/client/dashboard.tsx`

- [ ] A3.1 Import and add QuotationsSection component
- [ ] A3.2 Position between stats and project pipeline
- [ ] A3.3 Style consistently with existing dashboard design

---

### Phase B: Authenticated Detail View (~2 points)

#### Task B1: Quotation Detail Page (Client)

**File**: `src/app/(protected)/@client/quotations/[id]/page.tsx`

- [ ] B1.1 Create client quotation detail page
- [ ] B1.2 Fetch quotation by ID with client authorization check
- [ ] B1.3 Mark as viewed on first load (if status is 'sent')
- [ ] B1.4 Display full quotation with line items
- [ ] B1.5 Show action buttons (Accept, Request Changes, Reject)

#### Task B2: Quotation Detail Components

**File**: `src/components/modules/client/quotations/`

- [ ] B2.1 Create `quotation-detail-header.tsx`
- [ ] B2.2 Create `quotation-line-items-view.tsx` (reuse admin preview styles)
- [ ] B2.3 Create `quotation-terms-view.tsx`
- [ ] B2.4 Create `quotation-action-buttons.tsx`

#### Task B3: Mark as Viewed Mutation

**File**: `convex/functions/quotations/mutations.ts`

- [ ] B3.1 Create `markQuotationViewed` mutation
- [ ] B3.2 Update status from `sent` to `viewed`
- [ ] B3.3 Set `viewedAt` timestamp
- [ ] B3.4 Only update if status is currently `sent`

---

### Phase C: Public Share View (~1 point)

#### Task C1: Public Quotation Page

**File**: `src/app/q/[token]/page.tsx`

- [ ] C1.1 Create public route (no auth required)
- [ ] C1.2 Fetch quotation by share token
- [ ] C1.3 Validate token and expiry
- [ ] C1.4 Show quotation view (read-only for non-authenticated)
- [ ] C1.5 Show "Login to respond" CTA for actions
- [ ] C1.6 Handle expired/invalid tokens gracefully

#### Task C2: Public Layout

**File**: `src/app/q/layout.tsx`

- [ ] C2.1 Create minimal public layout (no sidebar)
- [ ] C2.2 Show PrimeEditz branding
- [ ] C2.3 Optional login/signup link

---

## 🧩 Component Structure

```
src/components/modules/client/quotations/
├── index.ts                          # Barrel exports
├── quotations-section.tsx            # Dashboard section
├── quotation-card.tsx                # Summary card for listing
├── quotation-detail-header.tsx       # Detail page header
├── quotation-line-items-view.tsx     # Line items display
├── quotation-terms-view.tsx          # Terms & conditions
├── quotation-action-buttons.tsx      # Accept/Reject/Request Changes
└── quotation-status-badge.tsx        # Status badge styling

src/app/(protected)/@client/quotations/
├── page.tsx                          # Quotations list page
└── [id]/
    └── page.tsx                      # Quotation detail page

src/app/q/
├── layout.tsx                        # Public minimal layout
└── [token]/
    └── page.tsx                      # Public quotation view
```

---

## 🔄 Route Structure

| Route                       | Auth     | Purpose                       |
| --------------------------- | -------- | ----------------------------- |
| `/dashboard` (client)       | Required | Shows quotation section       |
| `/quotations` (client)      | Required | Full quotation list           |
| `/quotations/[id]` (client) | Required | Quotation detail with actions |
| `/q/[token]`                | Public   | Share link view (read-only)   |

---

## 🧪 Testing Checklist

### Dashboard Integration

- [ ] Client dashboard shows quotations section
- [ ] Quotations with status `sent` appear in list
- [ ] Click "View" navigates to detail page
- [ ] Empty state shown when no quotations

### Authenticated View

- [ ] Quotation detail page loads correctly
- [ ] Line items displayed by section
- [ ] Totals calculated correctly
- [ ] Terms & conditions visible
- [ ] Action buttons visible and styled
- [ ] First view marks quotation as `viewed`

### Public View

- [ ] Valid share link shows quotation
- [ ] Expired link shows expiry message
- [ ] Invalid token shows 404
- [ ] Actions prompt login for non-authenticated users

### Edge Cases

- [ ] Quotation for different client → 403 forbidden
- [ ] Deleted quotation → 404 not found
- [ ] Already viewed → status stays `viewed`

---

## 🚀 Definition of Done

- [x] Quotations section appears in client dashboard
- [x] Client can view quotation list
- [x] Client can view quotation details
- [x] Public share link works
- [x] Status updates to `viewed` on first view
- [x] Action buttons ready (wired in 4-8, 4-9)
- [x] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                                                                    |
| ---------- | ------------- | ------------------------------------------------------------------------ |
| 2026-01-17 | ready-for-dev | Story created with dual-view approach                                    |
| 2026-01-18 | done          | Client quotation view, dashboard section, and public share view complete |

---

**Previous Story**: 4-6 - Send Quotation to Client  
**Next Story**: 4-8 - Client Accept Quotation
