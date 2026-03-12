# Story 27.1: Add Company + User Signature Rendering to PDF Document

**Epic**: Epic 27 - PDF Preview Polish
**Status**: backlog
**Complexity**: Medium (5 points)
**Created**: 2026-02-27
**Priority**: HIGH — Professional output requirement

---

## 📋 User Story

**As an** Admin,
**I want** the PDF quotation to include company and authorized signatory signatures,
**So that** the document looks professional and legally complete when sent to clients.

---

## ⚠️ Current State Analysis

### PDF Document (`quotation-document.tsx`)

No signature block exists. The document ends with Terms & Conditions and a footer.

### Signature Sources

1. **Company Signature**: Should come from Global Settings / company configuration
2. **User Signature**: Should come from the admin profile who created the quotation
3. **Schema**: `profiles` table may need a `signature` field (image URL or storage ID)

### Screenshot Evidence

PDF Preview (QT-000003):

- "SET YOUR ADDRESS" placeholder visible — company info not fully configured
- No signature section at all

---

## ✅ Acceptance Criteria

### Signature Block

- [ ] **Given** a PDF/preview is generated
- [ ] **When** viewing the bottom of the document (before footer)
- [ ] **Then** a signature block appears with two columns:
  - Left: "For [Company Name]" with company signature image
  - Right: "Authorized By" with user signature image

### Company Signature

- [ ] **Given** a company signature is configured in Global Settings
- [ ] **When** generating the PDF
- [ ] **Then** the company signature image is rendered

### User Signature

- [ ] **Given** the quotation creator has a signature in their profile
- [ ] **When** generating the PDF
- [ ] **Then** the user's signature is rendered

### Missing Signature Fallback

- [ ] **Given** either signature is NOT configured
- [ ] **When** generating the PDF
- [ ] **Then** a dashed line with "[Signature not configured]" text appears
- [ ] **And** the PDF still generates successfully

### Address Fallback

- [ ] **Given** the company address is not set
- [ ] **When** generating the PDF
- [ ] **Then** it shows "Address not configured" instead of "SET YOUR ADDRESS"

---

## 📁 Files to Update

| File                                                                     | Change                                         |
| ------------------------------------------------------------------------ | ---------------------------------------------- |
| `src/components/modules/admin/quotations/preview/quotation-document.tsx` | Add signature block section                    |
| `convex/schema.ts`                                                       | Verify/add `signature` field on profiles table |
| Global Settings query                                                    | Ensure company signature is retrievable        |

---

## 🚀 Definition of Done

- [ ] Signature block renders in PDF/preview
- [ ] Company signature from Global Settings
- [ ] User signature from profile
- [ ] Graceful fallback for missing signatures
- [ ] Address placeholder replaced with better fallback
- [ ] Signatures crisp in downloaded PDF
- [ ] Story marked as `done`

---

**Previous Story**: None (first in epic)
**Next Story**: 27-2 - Fix table column color consistency
