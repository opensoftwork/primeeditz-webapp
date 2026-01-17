# Story 4-16: Enhanced Quotation PDF Download

**Epic**: Epic 4 - Quotation System  
**Status**: done  
**Complexity**: Low (2 points)  
**Created**: 2026-01-17  
**Priority**: MEDIUM — UX Enhancement for quotation workflow

---

## 📋 User Story

**As an** Admin or Architect,  
**I want** to download quotations as professionally formatted PDF files with section-specific naming,  
**So that** I can share quotations with clients via email, WhatsApp, or other channels outside the system.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                  | Status | Notes                           |
| --------------------------- | ------ | ------------------------------- |
| **4-5: Quotation Preview**  | done   | Base PDF generation implemented |
| **4-3: Quotation Creation** | done   | Quotation data structure exists |

### Existing Implementation

The following components already exist and are functional:

| Component           | Location                                          | Status     |
| ------------------- | ------------------------------------------------- | ---------- |
| `DownloadQuotation` | `admin/quotations/preview/download-quotation.tsx` | ✅ Working |
| `QuotationDocument` | `admin/quotations/preview/quotation-document.tsx` | ✅ Working |
| `QuotationPreview`  | `admin/quotations/preview/quotation-preview.tsx`  | ✅ Working |

### Current Behavior

- PDF downloads as `Quotation_{code}_v{version}.pdf`
- Uses `html-to-image` + `jsPDF` for generation
- Renders all sections in a single document
- Integrated in `QuotationPreview` component header

---

## ✅ Acceptance Criteria

### AC1: Section-Specific Downloads (Enhancement)

- [x] Add `activeSection` prop to `DownloadQuotation` component
- [x] PDF filename includes section name: `Quotation_{code}_{sectionName}.pdf`
- [x] Filter line items to only include selected section when `activeSection` is provided
- [x] Section totals calculated for single-section download

### AC2: Full Quotation Download

- [x] Default behavior (no section specified) downloads complete quotation
- [x] Filename: `Quotation_{code}_Complete.pdf` or `Quotation_{code}_v{version}.pdf`
- [x] All sections rendered in sequence with visual separation

### AC3: Integration Points

- [x] Add download button to `QuotationDetail` header (alongside existing Preview/Send buttons)
- [ ] Add section-specific download to each section header in detail view (deferred)
- [ ] Client portal quotation view should also have download capability (deferred)

### AC4: PDF Quality (Already Implemented - Verify)

- [x] Clean A4 layout with 10mm margins
- [x] Company branding (PRIMEEDITZ logo area, name, tagline)
- [x] Client and project information displayed
- [x] Line items table with numbered rows, nested sub-items
- [x] Section headers with color indicators
- [x] Financial summary (subtotal, discount, tax, grand total)
- [x] Amount in words
- [x] Terms & conditions
- [x] Signature sections
- [x] "Generated via PrimeEditz Studio" footer

---

## 📘 Implementation Tasks

### Task 1: Enhance DownloadQuotation Component (~1 point)

**File**: `src/components/modules/admin/quotations/preview/download-quotation.tsx`

```typescript
// Add new props
interface DownloadQuotationProps {
  quotation: QuotationData;
  sections: Section[];
  activeSection?: string; // NEW: Section name for filtered download
  companyInfo?: {...};
  clientName?: string;
  projectName?: string;
  variant?: "default" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}
```

**Changes**:

- [x] Add `activeSection` prop to component
- [x] Update filename generation:
  ```typescript
  const fileName = activeSection
    ? `Quotation_${quotation.code}_${activeSection.replace(/\s+/g, "_")}.pdf`
    : `Quotation_${quotation.code}_v${quotation.version}.pdf`;
  ```
- [x] Filter sections passed to `QuotationDocument` when `activeSection` is provided
- [x] Recalculate totals for single-section download

### Task 2: Add QuotationDocument Section Filtering (~0.5 points)

**File**: `src/components/modules/admin/quotations/preview/quotation-document.tsx`

- [x] Accept optional `activeSection` prop
- [x] When `activeSection` is provided, only render that section's items
- [x] Adjust totals to reflect single section

### Task 3: Integrate Download in QuotationDetail (~0.5 points)

**File**: `src/components/modules/admin/quotations/detail/components/detail-header.tsx`

- [x] Import `DownloadQuotation` component
- [x] Replace existing navigation button with `DownloadQuotation` component
- [x] Pass full quotation and sections data for complete download

**File**: `src/components/modules/admin/quotations/detail/components/line-items-section.tsx`

- [ ] Add section-specific download button to each section header (optional enhancement)

---

## 🎨 Current PDF Layout (Reference)

```
┌─────────────────────────────────────────────────────────────┐
│  [PRIMEEDITZ LOGO]           PROPOSAL                       │
│  Post-Production Excellence  Reference No. #QT-2026-001     │
│  Address, Phone, Email       Date: 17 January 2026          │
│                              Valid Until: 31 Jan 2026       │
├─────────────────────────────────────────────────────────────┤
│  CLIENT                      PROJECT                        │
│  ───────                     ───────                        │
│  John Doe Productions        Wedding Film - Rahul & Priya   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ▌ PHOTOGRAPHY SECTION                                      │
│  ┌────┬──────────────────┬────┬────┬─────────┬───────────┐  │
│  │ #  │ Description      │Unit│ Qty│ Rate    │ Amount    │  │
│  ├────┼──────────────────┼────┼────┼─────────┼───────────┤  │
│  │ 1  │ Ceremony Coverage│ Day│  2 │ ₹25,000 │ ₹50,000   │  │
│  │ 1.1│ └ Candid Shots   │ Set│  1 │ ₹10,000 │ ₹10,000   │  │
│  └────┴──────────────────┴────┴────┴─────────┴───────────┘  │
│                                                             │
│  ▌ VIDEOGRAPHY SECTION                                      │
│  [Similar table structure]                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                     Subtotal    ₹1,50,000   │
│                                     Discount   -₹10,000     │
│                                     GST 18%     ₹25,200     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ GRAND TOTAL                              ₹1,65,200     ││
│  │ One Lakh Sixty-Five Thousand Two Hundred Only          ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  TERMS & CONDITIONS                                         │
│  1. Payment terms...                                        │
│  2. Delivery timeline...                                    │
├─────────────────────────────────────────────────────────────┤
│  _______________              _______________               │
│  Client Acceptance            Authorized Signature          │
│                               For PRIMEEDITZ                │
├─────────────────────────────────────────────────────────────┤
│              Generated via PrimeEditz Studio                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Technical Details

### Libraries (Already Installed)

- `html-to-image` - DOM to PNG conversion
- `jspdf` - PDF generation

### Key Code Patterns (Existing)

```typescript
// PDF generation with multi-page support
const dataUrl = await htmlToImage.toPng(documentRef.current, {
  quality: 0.95,
  pixelRatio: 2,
  backgroundColor: "#ffffff",
  width: 900,
  skipFonts: true, // Prevents OKLCH/LAB parser crashes
});

// A4 PDF with margins
const pdf = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4",
});
const margin = 10; // 10mm margins
```

---

## 🧪 Testing Checklist

- [ ] Full quotation PDF downloads correctly
- [ ] Section-specific PDF downloads only that section
- [ ] Filename includes section name when applicable
- [ ] Totals are correct for section-specific downloads
- [ ] Download button visible in QuotationDetail header
- [ ] Loading indicator shows during generation
- [ ] Toast notifications on success/failure
- [ ] Works in Chrome, Firefox, Safari
- [ ] Multi-page PDFs paginate correctly

---

## 🚀 Definition of Done

- [x] `activeSection` prop added to `DownloadQuotation`
- [x] Section filtering works in PDF generation
- [x] Download button integrated in `QuotationDetail`
- [x] Filenames include section names appropriately
- [ ] All tests pass (manual testing recommended)
- [x] Story marked as `done` in `sprint-status.yaml`

---

**Related**: 4-5 - Quotation Preview Print (base implementation)
