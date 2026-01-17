# Story 4-8: Client Accept Quotation

**Epic**: Epic 4 - Quotation System  
**Status**: ready-for-dev  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-17  
**Priority**: CRITICAL — Gates folder activation and asset upload (Epic 5)

---

## 📋 User Story

**As a** Client,  
**I want** to accept a quotation with a digital confirmation,  
**So that** the project can proceed and I can upload my raw footage.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                      | Status        | Notes                            |
| ------------------------------- | ------------- | -------------------------------- |
| **4-7 - Client View Quotation** | ready-for-dev | Client can see quotation         |
| **Convex Schema**               | ✅ Done       | Status field supports `approved` |

### Enables

| Story / Epic                           | Notes                                     |
| -------------------------------------- | ----------------------------------------- |
| **Epic 5 - Asset Upload**              | Folder activation triggered by acceptance |
| **3-4 - Project Stage & Folder Setup** | Admin activates folders post-acceptance   |

### Critical Flow

```
Client Accepts Quotation
         │
         ▼
┌─────────────────────────────────────┐
│  STATUS: approved                   │
│  approvedAt: timestamp              │
│  clientSignature: text/image        │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Admin sees "Quotation Approved"    │
│  Admin can now activate folders     │
│  (Story 3-4 / Epic 5)               │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Client can upload raw footage      │
│  (Epic 5 - Gated Upload)            │
└─────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Accept Button Visibility

- [ ] **Given** I am viewing a quotation with status `sent` or `viewed`
- [ ] **Then** I see an "Accept Quotation" button
- [ ] **And** the button is prominently styled (primary action)

### AC2: Accept Confirmation Flow

- [ ] **Given** I click "Accept Quotation"
- [ ] **When** the confirmation drawer/dialog opens
- [ ] **Then** I see:
  - Quotation summary (code, total, validity)
  - Checkbox: "I agree to the terms and conditions"
  - Optional: Digital signature or acceptance text
  - "Confirm Acceptance" button

### AC3: Acceptance Processing

- [ ] **Given** I confirm acceptance
- [ ] **When** the mutation completes
- [ ] **Then** quotation status changes to `approved`
- [ ] **And** `approvedAt` timestamp is recorded
- [ ] **And** `clientSignature` (if provided) is stored
- [ ] **And** success message is shown

### AC4: Post-Acceptance UI

- [ ] **Given** a quotation is approved
- [ ] **When** I view the quotation
- [ ] **Then** status shows "ACCEPTED ✅"
- [ ] **And** accept button is replaced with "Accepted on [date]"
- [ ] **And** reject/change request buttons are hidden

### AC5: Admin Notification

- [ ] **Given** a quotation is approved
- [ ] **Then** the quotation appears in admin dashboard with "Approved" status
- [ ] **And** admin can see the approval timestamp
- [ ] **And** admin can proceed to folder setup

### AC6: Schema Requirements

- [ ] **Given** the quotations table
- [ ] **Then** the following fields exist/work:
  - `status: 'approved'` — Approval status
  - `approvedAt: v.number()` — Timestamp of approval
  - `clientSignature: v.optional(v.string())` — Digital signature text

---

## 🎨 UX Design

### Accept Quotation Button (on Detail View)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  [✅ ACCEPT QUOTATION]  [📝 Request Changes]  [❌ Reject]           ││
│  │   ▲ Primary action                                                  ││
│  │   Prominent green/primary styling                                   ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Accept Confirmation Drawer

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Accept Quotation                                                  [X]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  📋 QUOTATION SUMMARY                                               ││
│  │  ───────────────────────────────────────────────────────────────    ││
│  │  Code: QT-2026-00042                                                ││
│  │  Total: ₹2,45,000.00                                                ││
│  │  Valid Until: January 30, 2026                                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ⚠️ IMPORTANT                                                       ││
│  │  ───────────────────────────────────────────────────────────────    ││
│  │  By accepting this quotation, you agree to:                         ││
│  │  • The terms and conditions stated in the quotation                 ││
│  │  • The payment schedule as outlined                                 ││
│  │  • The project timeline estimates                                   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ☑ I have read and agree to the terms and conditions               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Digital Signature (optional)                                       ││
│  │  ┌─────────────────────────────────────────────────────────────────┐││
│  │  │  Type your full name as signature                               │││
│  │  │  [Rahul Sharma                                            ]     │││
│  │  └─────────────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Cancel]                              [✅ Confirm Acceptance]          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Post-Acceptance View

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  ✅ QUOTATION ACCEPTED                                              ││
│  │  ─────────────────────────────────────────────────────────────      ││
│  │  Accepted on: January 17, 2026 at 2:45 PM                           ││
│  │  Signed by: Rahul Sharma                                            ││
│  │                                                                     ││
│  │  📁 Your project folders will be activated shortly.                 ││
│  │     You will receive a notification when you can upload files.      ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Accept Mutation (~2 points)

#### Task A1: Schema Verification

**File**: `convex/schema.ts`

- [ ] A1.1 Verify `approvedAt` field exists
- [ ] A1.2 Add `clientSignature` field if not present:
  ```typescript
  clientSignature: v.optional(v.string()),
  ```

#### Task A2: Accept Quotation Mutation

**File**: `convex/functions/quotations/mutations.ts`

- [ ] A2.1 Create `acceptQuotation` mutation
- [ ] A2.2 Validate quotation exists and belongs to client
- [ ] A2.3 Validate status is `sent` or `viewed`
- [ ] A2.4 Update status to `approved`
- [ ] A2.5 Set `approvedAt` timestamp
- [ ] A2.6 Store `clientSignature` if provided

---

### Phase B: Accept UI (~2 points)

#### Task B1: Accept Confirmation Drawer

**File**: `src/components/modules/client/quotations/accept-quotation-drawer.tsx`

- [ ] B1.1 Create drawer component with Sheet
- [ ] B1.2 Display quotation summary
- [ ] B1.3 Terms acknowledgment checkbox (required)
- [ ] B1.4 Digital signature input (optional text field)
- [ ] B1.5 Confirm button (disabled until checkbox checked)
- [ ] B1.6 Loading state during mutation
- [ ] B1.7 Success toast and drawer close on completion

#### Task B2: Update Action Buttons

**File**: `src/components/modules/client/quotations/quotation-action-buttons.tsx`

- [ ] B2.1 Wire Accept button to open drawer
- [ ] B2.2 Disable buttons for already-approved quotations
- [ ] B2.3 Show "Accepted on [date]" for approved quotations
- [ ] B2.4 Hide action buttons when not applicable

#### Task B3: Post-Acceptance View

**File**: `src/components/modules/client/quotations/quotation-accepted-banner.tsx`

- [ ] B3.1 Create success banner component
- [ ] B3.2 Show acceptance details (date, signature)
- [ ] B3.3 Show next steps message (folder activation coming)

---

### Phase C: Admin Integration (~1 point)

#### Task C1: Admin Quotation Status Update

**File**: `src/components/modules/admin/quotations/list/quotation-list.tsx`

- [ ] C1.1 Update quotation list to show "Approved" status prominently
- [ ] C1.2 Add filter for approved quotations
- [ ] C1.3 Show approval timestamp in detail view

#### Task C2: Admin Dashboard Quick Action (Optional)

**File**: `src/components/modules/dashboard/admin/dashboard.tsx`

- [ ] C2.1 Consider adding "Approved Quotations" count to dashboard
- [ ] C2.2 Quick link to folder setup for approved quotations

---

## 🧩 Component Structure

```
src/components/modules/client/quotations/
├── accept-quotation-drawer.tsx      # Acceptance confirmation UI
├── quotation-accepted-banner.tsx    # Post-acceptance success banner
└── quotation-action-buttons.tsx     # Updated with accept functionality
```

---

## 🧪 Testing Checklist

### Accept Flow

- [ ] Accept button visible for `sent`/`viewed` quotations
- [ ] Accept button hidden for `approved`/`rejected` quotations
- [ ] Clicking Accept opens confirmation drawer
- [ ] Checkbox must be checked to enable confirm button
- [ ] Digital signature is optional
- [ ] Confirm updates status to `approved`
- [ ] `approvedAt` timestamp is recorded
- [ ] Success message displayed

### Post-Acceptance

- [ ] Quotation shows "Accepted ✅" status
- [ ] Accept button replaced with acceptance info
- [ ] Success banner shows next steps

### Admin View

- [ ] Approved quotations visible in admin list
- [ ] Status filter includes "Approved"
- [ ] Detail view shows approval info

### Edge Cases

- [ ] Cannot accept already approved quotation
- [ ] Cannot accept expired quotation
- [ ] Cannot accept rejected quotation
- [ ] Network error shows appropriate message

---

## 🚀 Definition of Done

- [ ] `acceptQuotation` mutation working
- [ ] Accept confirmation drawer complete
- [ ] Terms checkbox validation working
- [ ] Digital signature stored (if provided)
- [ ] Status updates to `approved`
- [ ] Post-acceptance UI shows success state
- [ ] Admin can see approved quotations
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                            |
| ---------- | ------------- | -------------------------------- |
| 2026-01-17 | ready-for-dev | Story created as gate for Epic 5 |

---

**Previous Story**: 4-7 - Client View Quotation  
**Next Story**: 4-9 - Client Request Changes
