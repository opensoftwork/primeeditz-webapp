# Epic 15: Quotation Review Notification System

**Epic Owner**: Admin/Studio  
**Status**: Planning  
**Created**: 2026-02-04  
**Complexity**: Medium  
**Priority**: High  
**Dependencies**: Epic 4 (Quotation System), Epic 11c (Studio Portal)

---

## 📋 Epic Summary

A **notification-style quotation review system** that provides real-time visibility into quotations requiring Admin attention:

- **Studio Creates Quotation**: Studios create and submit quotation requests
- **Admin Dashboard Notification**: Shows quotations created by studios pending Admin review/approval
- **Notification Behavior**: Once Admin approves a quotation, it automatically disappears from the notification section
- **Studio Dashboard**: Shows their own quotations and their current status (accepted, pending, etc.)

**Key Insight**: Quotation reviews act as transient notifications for Admin. When a Studio creates a quotation, Admin sees it as a pending notification. Once Admin approves, the notification clears automatically.

---

## 🎯 User Outcomes

| Role       | Outcome                                                                           |
| ---------- | --------------------------------------------------------------------------------- |
| **Studio** | Create quotation requests for Admin review                                        |
| **Studio** | See their quotations and current status on dashboard                              |
| **Studio** | Clear visibility of quotation count and acceptance status                         |
| **Admin**  | See NEW quotations created by studios in "Pending Requisitions" dashboard section |
| **Admin**  | Review and approve/reject quotations                                              |
| **Admin**  | Notifications automatically clear when Admin approves the quotation               |
| **Admin**  | Quick link to view all quotations or process individual ones                      |

---

## 🖼️ UI Reference

### Studio Dashboard (Image Reference)

The "Review Quotations" section displays studios' own quotations:

- **Header**: Icon + "REVIEW QUOTATIONS" title
- **Subtitle**: "{count} TOTAL • ACTION REQUIRED ON PENDING"
- **View All**: Link to full quotations list
- **Quotation Cards**: Each card shows:
  - Quotation code (QT-000001)
  - Status badge (ACCEPTED, PENDING, etc.)
  - "QUOTATION" label
  - Package type icon + name (STANDARD QUOTATION)
  - Total valuation amount (₹17,700)
  - Date accepted/created
  - "VIEW" action button

### Admin Dashboard (Image Reference)

The "Pending Requisitions" section shows quotations created by studios:

- Display quotations created by studios awaiting Admin approval
- Show empty state when all quotations are processed ("OPERATIONS FLUID")
- Act as notifications that disappear once Admin approves the quotation
- Include "VIEW FULL LIST" link

---

## 🗂️ User Stories

### Story 15.1: Studio Dashboard Quotation Status Widget

**As a** Studio user  
**I want to** see my created quotations and their status on my dashboard  
**So that** I can track which quotations are pending, accepted, or rejected by Admin

**Acceptance Criteria:**

- [ ] "Review Quotations" section visible on studio dashboard
- [ ] Shows count of total quotations created by studio
- [ ] Displays up to 3 most recent quotations in card format
- [ ] Each card shows: code, status (ACCEPTED/PENDING/REJECTED), package type, total amount, date
- [ ] Status badge shows Admin's decision on the quotation
- [ ] "View All" links to `/quotations` page
- [ ] "VIEW" button on each card navigates to quotation detail
- [ ] Section hidden when studio has no quotations

**Implementation Notes:**

- Component: `QuotationsSection` (already exists at `modules/studio/quotations/quotations-section.tsx`)
- Uses `api.functions.quotations.queries.getMyQuotations`
- Already has animation and card layout implemented
- Status reflects Admin's approval decision

**Story Points**: 3  
**Status**: ✅ Exists - May need refinement

---

### Story 15.2: Admin Dashboard Quotation Notification Widget

**As an** Admin user  
**I want to** see quotations created by studios on my dashboard  
**So that** I can review and approve/reject them promptly

**Acceptance Criteria:**

- [ ] New "Pending Quotations" section in admin dashboard (or extend "Pending Requisitions")
- [ ] Displays quotations created by studios that need Admin review
- [ ] Filter: Show quotations with status `draft` or `sent` (not yet approved)
- [ ] Shows quotation card with: code, studio name, package, amount, date created
- [ ] Cards disappear automatically when Admin approves the quotation
- [ ] Empty state shows "Operations Fluid" message when all processed
- [ ] "View Full List" links to admin quotations page
- [ ] Limited to 3-5 most recent pending quotations on dashboard
- [ ] "Review" or "Approve" quick action button on each card

**Story Points**: 5

---

### Story 15.3: Pending Quotation Queries

**As a** developer  
**I want to** have backend queries for pending quotations by role  
**So that** each dashboard can fetch relevant quotation notifications

**Acceptance Criteria:**

- [ ] Query `getPendingQuotationsForAdmin` returns quotations created by studios awaiting Admin approval
- [ ] Query `getMyQuotations` returns quotations created by the current studio (already exists)
- [ ] Both queries support pagination/limiting
- [ ] Queries return count for notification badges
- [ ] Results sorted by creation date (newest first) or urgency

**Backend Implementation:**

```typescript
// convex/functions/quotations/queries.ts

// For Admin: Get quotations created by studios pending Admin review/approval
export const getPendingQuotationsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    // Return quotations created by studios
    // Filter: status = draft, sent (not yet approved by Admin)
    // Exclude: approved, rejected, expired, superseded
    // Include: studioId, studio name for display
  },
});

// For Studio: Get their own quotations (already exists as getMyQuotations)
// Shows status reflecting Admin's decision (approved, pending, rejected)
```

**Story Points**: 5

---

### Story 15.4: Notification Badge Integration

**As a** user (Admin/Studio)  
**I want to** see a notification badge on the sidebar  
**So that** I know there are pending quotations even when not on dashboard

**Acceptance Criteria:**

- [ ] Quotations menu item shows badge with pending count
- [ ] Badge updates in real-time via Convex reactivity
- [ ] Badge disappears when count is 0
- [ ] Different styling for Admin vs Studio badges
- [ ] Badge animates when count changes

**Story Points**: 3

---

### Story 15.5: Quick Action Buttons on Dashboard Cards (Admin)

**As an** Admin user  
**I want to** approve or review quotations directly from the dashboard  
**So that** I can process simple approvals without navigating away

**Acceptance Criteria:**

- [ ] "Approve" button on quotation card (for pending quotations)
- [ ] "View" button always available for detailed review
- [ ] Quick approve shows confirmation dialog
- [ ] After approval, card animates out and disappears from pending section
- [ ] Success toast notification confirms action
- [ ] Studio sees updated status on their dashboard

**Story Points**: 5

---

### Story 15.6: Real-time Quotation Status Sync

**As a** user  
**I want to** see quotation status updates in real-time  
**So that** I always see the current state without refreshing

**Acceptance Criteria:**

- [ ] Dashboard sections update automatically via Convex subscriptions
- [ ] When quotation is approved, it removes from pending admin view
- [ ] When new quotation is sent, it appears on studio dashboard
- [ ] Notification counts update instantly
- [ ] No page refresh required

**Story Points**: 3

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUOTATION NOTIFICATION FLOW                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐        ┌───────────────┐        ┌──────────────┐ │
│  │  Studio  │──[1]──▶│   Quotation   │──[2]──▶│    Admin     │ │
│  │ Creates  │        │Status: DRAFT  │        │  Dashboard   │ │
│  │  Quote   │        │  or SENT      │        │Shows Notif.  │ │
│  └──────────┘        └───────────────┘        └──────────────┘ │
│       │                     │                        │          │
│       │                     │                        │          │
│       ▼                     ▼                        ▼          │
│  ┌──────────┐        ┌───────────────┐        ┌──────────────┐ │
│  │  Studio  │◀──[4]──│   Quotation   │◀──[3]──│    Admin     │ │
│  │Dashboard │        │Status:APPROVED│        │  Approves    │ │
│  │ Shows    │        │               │        │  Quotation   │ │
│  │"ACCEPTED"│        └───────────────┘        └──────────────┘ │
│  └──────────┘                                        │          │
│                                                      ▼          │
│                                               ┌──────────────┐  │
│                                               │ Notification │  │
│                                               │   Clears     │  │
│                                               └──────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ [1] Studio creates/sends quotation request                      │
│ [2] Admin sees quotation in "Pending Requisitions" notification │
│ [3] Admin reviews and approves quotation                        │
│ [4] Studio sees updated status (ACCEPTED) on their dashboard    │
│     Admin's notification clears (quotation is processed)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Components

### Studio Dashboard Components

```
src/components/modules/studio/dashboard/
├── quotation-review-section.tsx    # Main section wrapper
├── quotation-notification-card.tsx # Individual quotation card
└── shared/
    └── quick-action-buttons.tsx    # Accept/Reject/View buttons
```

### Admin Dashboard Components

```
src/components/modules/admin/dashboard/
├── pending-quotations-section.tsx  # New section component
├── quotation-notification-card.tsx # Quotation preview card
└── empty-state.tsx                 # "Operations Fluid" state
```

### Shared Components

```
src/components/shared/notification/
├── notification-badge.tsx          # Count badge for sidebar
└── notification-toast.tsx          # Action confirmation toasts
```

---

## 🔗 Integration Points

| Component          | Integration                                    |
| ------------------ | ---------------------------------------------- |
| Studio Dashboard   | Add `QuotationsSection` below onboarding       |
| Admin Dashboard    | Add pending quotations after current stats     |
| Sidebar Navigation | Add notification badge to Quotations menu item |
| Quotation Detail   | Update status triggers dashboard refresh       |

---

## ✅ Acceptance Criteria Summary

### MVP (Stories 15.1-15.3)

- [ ] Studio dashboard shows "Review Quotations" section with pending quotations
- [ ] Admin dashboard shows pending quotations in notification style
- [ ] Backend queries return correct pending quotations by role
- [ ] Cards disappear when quotations are approved
- [ ] Empty state shows "Operations Fluid" message

### Enhanced (Stories 15.4-15.6)

- [ ] Sidebar shows notification badge with pending count
- [ ] Quick action buttons available on dashboard cards
- [ ] Real-time updates without refresh
- [ ] Smooth animations for card appearance/disappearance

---

## 📈 Story Points Summary

| Story | Description                    | Points |
| ----- | ------------------------------ | ------ |
| 15.1  | Studio Dashboard Widget        | 3      |
| 15.2  | Admin Dashboard Widget         | 5      |
| 15.3  | Pending Quotation Queries      | 5      |
| 15.4  | Notification Badge Integration | 3      |
| 15.5  | Quick Action Buttons           | 5      |
| 15.6  | Real-time Status Sync          | 3      |

**Total**: 24 Story Points

---

## 🔄 Status Updates

| Date       | Status   | Notes                            |
| ---------- | -------- | -------------------------------- |
| 2026-02-04 | Planning | Epic created based on UI designs |

---

## 📝 Implementation Notes

### Existing Code to Leverage

1. **`QuotationsSection`** (`studio/quotations/quotations-section.tsx`):
   - Already shows quotations on studio dashboard
   - Uses `getMyQuotations` query
   - Has card layout with animations

2. **`QuotationCard`** (`studio/quotations/shared/quotation-card.tsx`):
   - Existing card component for quotations
   - Shows status, amount, dates

3. **Admin Dashboard** (`admin/dashboard/index.tsx`):
   - Has "Pending Requisitions" section structure
   - Currently shows pending projects
   - Can be extended for quotations

### Status Filtering Logic

```typescript
// Admin Dashboard: Show quotations created by studios pending Admin review
const ADMIN_PENDING_STATUSES = ["draft", "sent"]; // Not yet approved by Admin

// Studio Dashboard: Show their own quotations with any status
// Status badges reflect Admin's decision:
// - PENDING: draft, sent (awaiting Admin review)
// - ACCEPTED: approved (Admin approved)
// - REJECTED: rejected (Admin rejected)
// - EXPIRED: expired

// Excluded from Admin notifications (already processed by Admin)
const PROCESSED_STATUSES = ["approved", "rejected", "expired", "superseded"];
```

---

**Previous Epic**: Epic 14 - Project Type Folder Template Integration  
**Next Epic**: TBD
