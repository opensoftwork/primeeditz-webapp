# Story 4-5: Quotation Preview & Print

**Epic**: Epic 4 - Quotation System  
**Status**: in-progress  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-16  
**Priority**: HIGH — Enables client-facing quotation delivery

---

## 📋 User Story

**As an** Admin,  
**I want** to preview quotations in a professional print-ready format,  
**So that** I can verify the layout before sending to clients or generating PDFs.

---

## 🔗 Dependencies & Context

### Implementation Order

```
┌─────────────────────────────────────────────────────────────┐
│                 IMPLEMENTATION FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  4.1 Quotation Sections ─────┐                               │
│  (DONE)                      ▼                               │
│  3.8 Quotation Templates ────┤ (DONE)                        │
│                              ▼                               │
│  4.3 Create Quotation ───────┤ (DONE)                        │
│                              ▼                               │
│  4.5 Preview & Print ────────┤ ← YOU ARE HERE                │
│                              ▼                               │
│  4.6 Send to Client ─────────┘                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies

| Depends On                   | Status  | Notes                          |
| ---------------------------- | ------- | ------------------------------ |
| **4.3 - Create Quotation**   | ✅ Done | Quotation data structure ready |
| **4.1 - Quotation Sections** | ✅ Done | Sections for grouping          |

### Enables

| Story                       | Notes                  |
| --------------------------- | ---------------------- |
| 4.6 - Send to Client        | Preview before sending |
| 4.7 - Client View Quotation | Same print layout      |

---

## ✅ Acceptance Criteria

### Preview Route

- [ ] **Given** I am viewing a quotation at `/quotations/[id]`
- [ ] **When** I click "Preview" or "Print"
- [ ] **Then** I see a professional print-ready document layout
- [ ] **And** the layout is optimized for A4 paper dimensions

### Document Header

- [ ] **Given** I am viewing the preview
- [ ] **Then** I see:
  - [ ] Company branding (logo placeholder, company name)
  - [ ] Quotation reference number prominently displayed
  - [ ] Issue date and validity period
  - [ ] Contact information (address, phone, email)

### Client & Project Info

- [ ] **Given** the quotation is linked to a client
- [ ] **Then** I see client details section
- [ ] **And** if linked to projects, I see project context

### Line Items Table

- [ ] **Given** I have line items in the quotation
- [ ] **When** viewing the preview
- [ ] **Then** line items are grouped by section
- [ ] **And** each section has a visual header
- [ ] **And** columns shown: #, Description, Unit, Qty, Rate, Total
- [ ] **And** nested sub-items are indented with parent numbering (1.1, 1.2)

### Financial Summary

- [ ] **Given** I am viewing the preview
- [ ] **Then** I see:
  - [ ] Subtotal
  - [ ] GST rate and amount
  - [ ] Grand Total (prominently styled)
  - [ ] Amount in words (Indian Rupee format)

### Terms & Conditions

- [ ] **Given** the quotation has terms
- [ ] **Then** terms are displayed in a formatted section
- [ ] **And** text is readable at print size

### Print Functionality

- [ ] **Given** I am viewing the preview
- [ ] **When** I click "Print"
- [ ] **Then** browser print dialog opens
- [ ] **And** document prints cleanly without app chrome

---

## 🎨 Design Reference

### Route Structure

```
/quotations/[id]           → Detail view with "Preview" button
/quotations/[id]/preview   → Full-page print preview (optional)
```

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  [COMPANY LOGO]    COMPANY NAME              ESTIMATE       │
│                    Address, Phone, Email     #QT-000024     │
│                                              Date: ...      │
├─────────────────────────────────────────────────────────────┤
│  CLIENT DETAILS                 PROJECT CONTEXT             │
│  ┌─────────────────┐           ┌─────────────────┐          │
│  │ Client Name     │           │ Project Name    │          │
│  └─────────────────┘           └─────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  ═══ SECTION: POST-PRODUCTION ══════════════════════════    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ # │ DESCRIPTION              │ UNIT │ QTY │ RATE │ TOTAL│
│  ├──────────────────────────────────────────────────────┤   │
│  │ 1 │ Video Editing            │ hrs  │ 10  │ 2000 │ 20K  │
│  │1.1│ ├─ Color Grading         │ ls   │  1  │ 5000 │ 5K   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                                         Subtotal: ₹X,XX,XXX │
│                                         GST (18%): ₹XX,XXX  │
│                                    ┌────────────────────┐   │
│                                    │ GRAND TOTAL ₹X,XX  │   │
│                                    └────────────────────┘   │
│  Amount in words: Twenty Five Thousand Rupees Only          │
├─────────────────────────────────────────────────────────────┤
│  TERMS & CONDITIONS                                         │
│  1. Payment terms...                                        │
│  2. Delivery timeline...                                    │
├─────────────────────────────────────────────────────────────┤
│  ───────────────────────    ────────────────────────────    │
│  Client Acknowledgement     Authorized Signature            │
│                             For [Company Name]              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Component Structure

```
src/components/modules/admin/quotations/preview/
├── index.ts                      # Barrel exports
├── quotation-preview.tsx         # Main preview container with actions
├── quotation-document.tsx        # Print-ready document component
├── preview-header.tsx            # Company branding & quotation info
├── preview-client-info.tsx       # Client & project context
├── preview-line-items.tsx        # Sectioned line items table
├── preview-summary.tsx           # Financial summary
├── preview-terms.tsx             # Terms & conditions
├── preview-footer.tsx            # Signature lines
└── utils/
    └── number-to-words.ts        # Indian Rupee words converter
```

---

## 🛠 Technical Implementation

### Key Features

1. **Print-Optimized CSS**

   - Use `@media print` for clean output
   - Hide app chrome (headers, navigation)
   - A4 optimized dimensions

2. **Sectioned Line Items**

   - Group by quotationSection
   - Recursive rendering for sub-items
   - Proper numbering (1, 1.1, 1.2, 2, etc.)

3. **Amount in Words**

   - Indian numbering system (Lakh, Crore)
   - Format: "Twenty Five Lakh Rupees Only"

4. **Responsive Preview**
   - Scrollable on screen
   - Proper pagination for print

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Navigate to quotation detail → see Preview button
- [ ] Click Preview → document renders correctly
- [ ] Sections display with proper headers
- [ ] Nested items show parent.child numbering
- [ ] Totals calculate correctly
- [ ] Print dialog opens with clean layout
- [ ] Amount in words displays correctly

### Edge Cases

- [ ] Quotation with no line items
- [ ] Very long descriptions (word wrap)
- [ ] Many sections (page breaks)
- [ ] Large amounts (Crore range)

---

## 🚀 Definition of Done

- [ ] Preview component renders quotation document
- [ ] Sectioned line items with nested support
- [ ] Professional print-ready layout
- [ ] Print functionality works
- [ ] Amount in words (Indian format)
- [ ] Matches premium dark theme for preview controls
- [ ] Clean print output without app chrome
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status      | Notes                                  |
| ---------- | ----------- | -------------------------------------- |
| 2026-01-16 | in-progress | Story created, implementation starting |

---

**Previous Story**: 4-3 - Create Quotation Standalone  
**Next Story**: 4-6 - Send Quotation to Client
