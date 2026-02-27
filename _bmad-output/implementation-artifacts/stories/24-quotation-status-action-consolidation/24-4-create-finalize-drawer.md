# Story 24.4: Create Consolidated "Finalize" Drawer with 3 Options

**Epic**: Epic 24 - Quotation Status Machine & Action Consolidation
**Status**: backlog
**Complexity**: Large (8 points)
**Created**: 2026-02-27
**Priority**: HIGH — Single entry point for quotation finalization

---

## 📋 User Story

**As an** Admin,
**I want** a single "Finalize" button that opens a drawer with three clear options (Keep as Draft, Send to Studio, Copy Public Link),
**So that** I have one clear action path instead of confusing duplicate buttons.

---

## 🔗 Dependencies & Context

- **Depends on**: Story 24.3 (role-aware actions clarify which flow the admin is in)
- **Blocks**: Stories 24.5-24.7 (cleanup of old duplicate actions)

---

## ⚠️ Current State Analysis

### Current Action Flow (3 places!)

1. **Detail Header** (`detail-header.tsx:159-176`): "SEND TO STUDIO" button → opens `SendQuotationDrawer`
2. **Quick Actions** (`quick-actions.tsx:51-63`): "Send to Studio" button → opens same drawer
3. **Builder Step 3** (`review-protocol-card.tsx:84-120`): "SEND TO STUDIO" + "FINALIZE & CLOSE"

### Current SendQuotationDrawer (`send-quotation-drawer.tsx`)

- Width: `sm:max-w-md` (too narrow)
- Options: "MARK AS SENT TO DASHBOARD" + "Generate Link" with OR divider
- Closes with navigation to `/quotations`

---

## ✅ Acceptance Criteria

### Drawer Appearance

- [ ] **Given** a quotation in `draft` or `changes_requested` status
- [ ] **When** clicking "Finalize" in the detail header
- [ ] **Then** a drawer/sheet opens from the right with width `sm:max-w-lg`

### Drawer Content

- [ ] **Given** the Finalize drawer is open
- [ ] **When** viewing the content
- [ ] **Then** it shows: quotation code, total amount, client/studio name
- [ ] **And** a validity selector (7, 14, 30, 90 days)
- [ ] **And** three action options with descriptions

### Option 1: Keep as Draft

- [ ] **Given** the admin clicks "Keep as Draft"
- [ ] **When** the action completes
- [ ] **Then** the quotation is saved and navigation goes to `/quotations`
- [ ] **And** status remains `draft`

### Option 2: Send to Studio

- [ ] **Given** the admin clicks "Send to Studio"
- [ ] **When** the action completes
- [ ] **Then** the `sendQuotation` mutation is called
- [ ] **And** status transitions from `draft` → `sent`
- [ ] **And** a share token is generated
- [ ] **And** a success toast is shown

### Option 3: Copy Public Link

- [ ] **Given** the admin clicks "Copy Public Link"
- [ ] **When** the action completes
- [ ] **Then** a share token is generated (calling `sendQuotation`)
- [ ] **And** the public quotation URL is copied to clipboard
- [ ] **And** a success toast confirms the copy

### Warning

- [ ] **Given** the drawer is open
- [ ] **When** viewing the bottom section
- [ ] **Then** a warning reads "Sending will lock this quotation for editing"

### Replaces Old Drawer

- [ ] **Given** the new `FinalizeQuotationDrawer` is implemented
- [ ] **When** the old `SendQuotationDrawer` is checked
- [ ] **Then** it is replaced by the new component in `quotation-detail.tsx`

---

## 📁 Files to Create/Update

| File                                                                             | Change                                           |
| -------------------------------------------------------------------------------- | ------------------------------------------------ |
| `src/components/modules/admin/quotations/finalize/finalize-quotation-drawer.tsx` | **NEW** — Main drawer component                  |
| `src/components/modules/admin/quotations/finalize/index.ts`                      | **NEW** — Barrel export                          |
| `src/components/modules/admin/quotations/detail/quotation-detail.tsx`            | Wire new drawer, replace old SendQuotationDrawer |
| `src/components/modules/admin/quotations/detail/components/detail-header.tsx`    | Replace "Send to Studio" with "Finalize" button  |

---

## 🛠 Technical Implementation

### Step 1: Create FinalizeQuotationDrawer Component

```typescript
// finalize/finalize-quotation-drawer.tsx
interface FinalizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: {
    _id: Id<"quotations">;
    code: string;
    total: number;
    studioId?: Id<"profiles">;
    studioName?: string;
    status: string;
  };
}
```

### Step 2: Layout Structure

```
┌─────────────────────────────────────┐
│  FINALIZE QUOTATION                 │
│  Complete your quotation workflow   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ QT-000003          ₹19,470   │  │
│  │ Client: Photography Studio    │  │
│  └───────────────────────────────┘  │
│                                     │
│  LINK VALIDITY                      │
│  [30 Days ▼]                        │
│                                     │
│  ┌── OPTION 1 ──────────────────┐  │
│  │ 📄 Keep as Draft              │  │
│  │ Save and return to listing    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌── OPTION 2 ──────────────────┐  │
│  │ 📤 Send to Studio             │  │
│  │ Deliver to client dashboard   │  │
│  │ for review and approval       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌── OPTION 3 ──────────────────┐  │
│  │ 🔗 Copy Public Onboarding    │  │
│  │ Link                         │  │
│  │ For clients without an       │  │
│  │ account                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ⚠ Sending will lock this          │
│    quotation for editing            │
└─────────────────────────────────────┘
```

### Step 3: Update Detail Header

Replace the "SEND TO STUDIO" button with "FINALIZE":

```typescript
<Button
  onClick={onFinalize}  // Opens FinalizeQuotationDrawer
  disabled={!["draft", "sent", "viewed", "changes_requested"].includes(quotation.status)}
  className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-zinc-950 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
>
  <ShieldCheck className="h-4 w-4 mr-2" />
  Finalize
</Button>
```

### Step 4: Use Sheet component with wider width

```typescript
<Sheet open={isOpen} onOpenChange={onClose}>
  <SheetContent className="sm:max-w-lg bg-zinc-950 border-white/10 text-white">
    {/* Drawer content */}
  </SheetContent>
</Sheet>
```

---

## ⚡ Risk Assessment

| Risk                                     | Mitigation                                                    |
| ---------------------------------------- | ------------------------------------------------------------- |
| Old SendQuotationDrawer still referenced | Search and replace all imports                                |
| Builder Step 3 uses different drawer     | Builder will get its own update in Story 24.7                 |
| Resend flow (status = sent/viewed)       | Finalize drawer supports resending by checking current status |

---

## 🚀 Definition of Done

- [ ] `FinalizeQuotationDrawer` component created with 3 options
- [ ] Drawer width is `sm:max-w-lg` (wider than old `sm:max-w-md`)
- [ ] Detail header shows "Finalize" instead of "Send to Studio"
- [ ] All 3 options work correctly with proper status transitions
- [ ] Public link copy works with clipboard API
- [ ] Warning about locking is displayed
- [ ] Old `SendQuotationDrawer` replaced in detail view
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                       |
| ---------- | ------- | --------------------------- |
| 2026-02-27 | backlog | Core UI consolidation story |

---

**Previous Story**: 24-3 - Refactor Review Actions
**Next Story**: 24-5 - Remove duplicate Send/Download from Quick Actions
