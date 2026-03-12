# Story 27.4: Investigate and Optimize PDF Generation Performance

**Epic**: Epic 27 - PDF Preview Polish
**Status**: backlog
**Complexity**: Medium (5 points)
**Created**: 2026-02-27
**Priority**: LOW — Works but slow

---

## 📋 User Story

**As an** Admin,
**I want** PDF generation to complete faster,
**So that** I don't have to wait a long time when downloading quotation PDFs.

---

## ⚠️ Current State Analysis

### Current Approach (`download-quotation.tsx`)

1. Renders `QuotationDocument` in a hidden off-screen container (900px width)
2. Waits for all images to load
3. Adds 500ms delay for rendering stability
4. Uses `html-to-image` with `pixelRatio: 4` to capture a PNG
5. Uses `jsPDF` with smart slicing to assemble A4 pages

### Performance Bottlenecks

- `pixelRatio: 4` creates a 3600px wide image — 4x the pixel data
- Full DOM-to-PNG conversion is inherently slow
- 500ms artificial delay adds to total time
- Large images create large data URLs that slow jsPDF processing

---

## ✅ Acceptance Criteria

### Baseline Measurement

- [ ] **Given** a quotation with 10+ line items
- [ ] **When** clicking "Download PDF"
- [ ] **Then** measure the time from click to download completion

### Optimization

- [ ] **Given** optimizations are applied
- [ ] **When** downloading the same quotation
- [ ] **Then** generation time is reduced by at least 30%

### Quality Preservation

- [ ] **Given** the optimized PDF
- [ ] **When** comparing to the pre-optimization PDF
- [ ] **Then** text is still readable and crisp
- [ ] **And** no visual regression in layout

---

## 🛠 Investigation Areas

1. **Reduce pixelRatio** from 4 to 2 (2x improvement in pixel data)
2. **Use `toJpeg`** instead of `toPng` (smaller data URL, ~60% size reduction)
3. **Reduce artificial delay** from 500ms to 200ms
4. **Lazy-render** the off-screen container only when download is triggered
5. **Skip fonts** is already set — verify it's effective
6. **Consider `@react-pdf/renderer`** as an alternative (renders directly to PDF without DOM capture)

---

## 🚀 Definition of Done

- [ ] Performance baseline measured
- [ ] At least one optimization implemented
- [ ] Quality verified (no regression)
- [ ] Target: < 3 seconds for typical quotation
- [ ] Story marked as `done`

---

**Previous Story**: 27-3 - Remove sub-item arrows
**Next Story**: None (last in epic)
