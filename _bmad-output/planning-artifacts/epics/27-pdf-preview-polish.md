# Epic 27: PDF Preview Polish

**Epic Owner**: Admin/CEO
**Status**: Planning
**Created**: 2026-02-27
**Complexity**: Medium (Multi-aspect polish)
**Priority**: P2 — Professional output improvements

---

## 📋 Epic Summary

Polish the PDF preview and download output with **signature support**, **color consistency**, **sub-item arrow cleanup**, and **performance investigation**. The current PDF is functional but lacks professional touches needed for client-facing documents.

### Issue Evidence (Screenshots)

**PDF Preview (QT-000003)**:

- "SET YOUR ADDRESS" placeholder visible — company address not configured
- No signatures shown (neither company nor user)
- Sub-item display appears correct (2.1 "per sheet" indented)
- Overall layout and package grouping looks good

**Admin Detail View (QT-000003)**:

- Sub-item arrows (`>`) visible on expandable items in the interactive view
- These arrows should NOT appear in the PDF (static document)

### Current State

| Capability             | Status        | Notes                                                   |
| ---------------------- | ------------- | ------------------------------------------------------- |
| Company info in PDF    | ⚠️ Partial    | Company name shows, address shows placeholder           |
| Company signature      | ❌ Missing    | Not rendered in PDF                                     |
| User signature         | ❌ Missing    | No `signature` field on profiles table                  |
| Color consistency      | ⚠️ Unverified | Need PDF download to verify column shading              |
| Sub-item arrows in PDF | ⚠️ Potential  | May carry over from interactive component               |
| PDF performance        | ⚠️ Known slow | `html-to-image` with `pixelRatio: 4` is inherently slow |

### Target State

- Company signature pulled from Global Settings
- User signature pulled from profile settings (with fallback for missing)
- Uniform table column coloring (no shade differences between Unit/Rate and Qty/Amount)
- No expand/collapse arrows on sub-items in the PDF output
- PDF generation feels responsive (investigate performance improvements)

---

## 🎯 User Outcomes

| Role              | Outcome                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| **Admin**         | Generate professional PDFs with company branding and authorized signatures |
| **Admin**         | Consistent, polished table formatting in downloaded PDFs                   |
| **Studio/Client** | Receive professional-grade quotation documents                             |

---

## 🗂️ Stories

| Story | Description                                            | Points | Priority |
| ----- | ------------------------------------------------------ | ------ | -------- |
| 27.1  | Add company + user signature rendering to PDF document | 5      | HIGH     |
| 27.2  | Fix table column color consistency in PDF              | 2      | MEDIUM   |
| 27.3  | Remove expand/collapse arrows from sub-items in PDF    | 2      | MEDIUM   |
| 27.4  | Investigate and optimize PDF generation performance    | 5      | LOW      |

**Total Points**: 14

---

## 📊 Detailed Story Specifications

### Story 27.1: Add company + user signature rendering to PDF document

**Files**:

- `src/components/modules/admin/quotations/preview/quotation-document.tsx`
- `convex/schema.ts` (check `company` / `globalSettings` table for signature field)
- `convex/functions/quotations/queries/admin.ts` or `storage.ts`

**Signature Sources**:

1. **Company Signature**: From Global Settings / company configuration → store as image URL
2. **User Signature** (authorized signatory): From the admin profile who created the quotation → `profiles.signature` field (may need to add)

**Design**:

- Signature block at the bottom of the PDF, before the footer
- Two columns: "For [Company Name]" (with company signature) and "Authorized By" (with user signature)
- Fallback: If no signature is available, show "[Signature not configured]" text
- Signature images rendered as `<img>` tags for html-to-image capture

**Acceptance Criteria**:

- [ ] Company signature rendered from Global Settings
- [ ] User signature rendered from the quotation creator's profile
- [ ] Graceful fallback when either signature is missing
- [ ] Signatures appear crisp in the downloaded PDF
- [ ] "SET YOUR ADDRESS" placeholder replaced with actual company address (or better fallback)

---

### Story 27.2: Fix table column color consistency in PDF

**File**: `src/components/modules/admin/quotations/preview/quotation-document.tsx` and related preview components

**Issue**: Unit/Rate columns potentially have a different shade than Qty/Amount columns in the PDF output.

**Fix**: Ensure all data columns in the line items table use the same background color. Check inline styles and CSS class overrides in the hidden render container in `download-quotation.tsx` (lines 267-280).

**Acceptance Criteria**:

- [ ] All table columns have uniform background shading
- [ ] Verified by downloading a PDF and inspecting visually
- [ ] Header row consistent
- [ ] Alternating row colors (if any) applied uniformly across all columns

---

### Story 27.3: Remove expand/collapse arrows from sub-items in PDF

**File**: `src/components/modules/admin/quotations/preview/quotation-document.tsx` or the line-items rendering component used for PDF

**Issue**: The interactive detail view uses `>` arrows for expandable sub-items. The PDF renderer may inherit these if it reuses the same component.

**Fix**: Ensure the PDF document component uses a static rendering path without interactive expand/collapse controls.

**Acceptance Criteria**:

- [ ] No `>` arrows or expand/collapse icons in the PDF output
- [ ] Sub-items rendered as indented rows without interactive elements
- [ ] Verified by downloading a PDF

---

### Story 27.4: Investigate and optimize PDF generation performance

**File**: `src/components/modules/admin/quotations/preview/download-quotation.tsx`

**Current approach**: `html-to-image` with `pixelRatio: 4` → PNG → `jsPDF` slicing

**Investigation areas**:

1. Reduce `pixelRatio` from 4 to 2 or 3 (balance quality vs speed)
2. Use `toJpeg` instead of `toPng` for smaller data URLs
3. Consider `html2pdf.js` or `react-pdf` as alternatives
4. Lazy-render the off-screen container only when download is triggered
5. Profile the actual bottleneck (image generation vs PDF assembly)

**Acceptance Criteria**:

- [ ] Performance baseline measured (time from click to download)
- [ ] At least one optimization implemented
- [ ] Quality regression test (compare before/after PDFs)
- [ ] Target: 50% reduction in generation time, or < 3 seconds

---

## 🧩 Affected Components Map

| File                             | Change                                         |
| -------------------------------- | ---------------------------------------------- |
| `preview/quotation-document.tsx` | Add signature block, fix colors, remove arrows |
| `preview/download-quotation.tsx` | Performance optimization                       |
| `convex/schema.ts`               | May need `signature` field on profiles         |
| Global Settings queries          | Signature retrieval                            |

---

## 🔗 Dependencies

| This Epic | Depends On                                                    | Notes                 |
| --------- | ------------------------------------------------------------- | --------------------- |
| 27.1      | May need profile `signature` field (Epic 22 Profile Settings) | Check if field exists |
| 27.2-27.3 | None                                                          | Self-contained fixes  |
| 27.4      | None                                                          | Investigation story   |

---

## 🔄 Status Updates

| Date       | Status   | Notes                                                     |
| ---------- | -------- | --------------------------------------------------------- |
| 2026-02-27 | Planning | Issues identified from screenshot analysis of PDF preview |

---

**Previous Epic**: Epic 26 - Public Link & Grouping Consistency
**Next Epic**: Epic 28 - Admin Internal Project Flow
