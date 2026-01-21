# Epic: Production-Ready Database Seeding Strategy

## Epic ID: SEED-001

## Status: Ready for Implementation

## Priority: High

---

## 📋 Executive Summary

This epic defines the comprehensive database seeding strategy for PrimeEditz webapp, aligning the seed data with the actual **B2B Rate Card** and **Pricing Strategy** document. The goal is to eliminate manual data entry by stakeholders and provide a production-ready baseline that reflects Prime Editz's real service offerings.

### Business Value

- **Zero Manual Setup**: Stakeholders can start using the system immediately after deployment
- **Accurate Pricing**: Seed data reflects actual B2B rates from the pricing strategy
- **Consistent Demo Environment**: Every deployment starts with the same professional dataset
- **Faster Onboarding**: New team members see real service examples, not placeholder data

---

## 🎯 Scope & Affected Tables

| Table                   | Current State        | Required Changes                               |
| ----------------------- | -------------------- | ---------------------------------------------- |
| `projectCategories`     | ✅ Generic (4 items) | Update to match post-production focus          |
| `projectTypes`          | ⚠️ Mixed             | Align with Photography/Videography services    |
| `projectTypeFields`     | ❌ Not seeded        | **NEW**: Add dynamic fields per project type   |
| `quotationSections`     | ✅ Good (7 sections) | Minor updates for clarity                      |
| `quotationTemplates`    | ⚠️ 3 templates       | **EXPAND**: Add all 5 package tiers + specials |
| `quotationLibraryItems` | ⚠️ 8 items           | **EXPAND**: Add all base rate items            |
| `storageTiers`          | ❌ Not seeded        | **NEW**: Add tiered storage pricing            |
| `folderTemplates`       | ⚠️ 3 templates       | **EXPAND**: Align with project types           |

---

## 📊 Data Mapping from Pricing Strategy

### 1. Project Categories & Types

Based on the pricing document, we identify two primary categories:

**Categories:**

| Category Name               | Description                             |
| --------------------------- | --------------------------------------- |
| Photography Post-Production | Color correction, grading, album design |
| Videography Post-Production | Video editing, teasers, highlights, VFX |

**Project Types (aligned with packages):**

| Project Type                       | Category                    | Key Deliverables                |
| ---------------------------------- | --------------------------- | ------------------------------- |
| Traditional Photo Color Correction | Photography Post-Production | Bulk photo color correction     |
| Candid Photo Grading               | Photography Post-Production | Per-image artistic grading      |
| Album Design - Traditional         | Photography Post-Production | Sheet-based album layouts       |
| Album Design - Candid              | Photography Post-Production | Candid album with branding      |
| Traditional Video Edit             | Videography Post-Production | Full-length traditional editing |
| Pre-Wedding Video                  | Videography Post-Production | Teaser + main video             |
| Pre-Wedding with VFX               | Videography Post-Production | Enhanced with visual effects    |
| Highlight/Teaser Edit              | Videography Post-Production | Short-form content              |
| VFX Work                           | Videography Post-Production | Mask, removal, effects          |

---

### 2. Quotation Sections (Updated)

Align with the pricing structure breakdown:

| Section Name           | Icon       | Color  | Purpose                           |
| ---------------------- | ---------- | ------ | --------------------------------- |
| Photo Color Correction | Camera     | blue   | Traditional/Candid color work     |
| Album Design           | BookOpen   | purple | Sheet-based album layouts         |
| Video Editing          | Film       | indigo | Full-length & short edits         |
| Teasers & Highlights   | Sparkles   | amber  | Short promotional videos          |
| VFX & Effects          | Wand       | pink   | Motion graphics, masking, effects |
| Add-ons                | PlusCircle | slate  | Rush delivery, extra revisions    |

---

### 3. Quotation Library Items (Base Rates)

From the pricing document - individual line items for building quotations:

**Photography Post-Production:**

| Item Name                            | Unit      | Base Price | Bulk Price | Bulk Min    |
| ------------------------------------ | --------- | ---------- | ---------- | ----------- |
| Traditional Color Correction         | per image | ₹5         | ₹2         | 2000 images |
| Pre-Wedding/Candid Grading           | per image | ₹50        | ₹35        | 100 images  |
| Album (Traditional) Color Correction | per sheet | ₹60        | ₹50        | 200 sheets  |
| Album (Candid) Color Correction      | per sheet | ₹70        | ₹60        | 200 sheets  |
| Candid Album Custom + Branding       | per sheet | ₹90-115    | -          | On quote    |

**Videography Post-Production:**

| Item Name                       | Duration      | Price  |
| ------------------------------- | ------------- | ------ |
| Traditional Full Length Video   | 5-10 min      | ₹500   |
| Traditional Full Length Video   | 10-60 min     | ₹900   |
| Traditional Full Length Video   | 60-90 min     | ₹1,200 |
| Traditional Full Length Video   | per hour      | ₹900   |
| Pre-Wedding Teaser (Video)      | 1min - 3-4min | ₹4,500 |
| Pre-Wedding Teaser (Video)      | 1min - 4-8min | ₹6,000 |
| Pre-Wedding with VFX            | 1min - 3-4min | ₹6,000 |
| Pre-Wedding with VFX            | 1min - 4-8min | ₹9,000 |
| VFX Only (Mask/Removal/Effects) | per minute    | ₹2,000 |

---

### 4. Quotation Templates (Package Tiers)

Create templates matching the 5 main packages:

| Template Name       | Price   | Target Use Case            |
| ------------------- | ------- | -------------------------- |
| Silver Package      | ₹8,500  | Small Traditional Weddings |
| Gold Package        | ₹18,000 | Standard Weddings          |
| Platinum Package    | ₹35,000 | Premium Weddings           |
| Diamond Package     | ₹55,000 | Luxury Weddings            |
| Royal Elite Package | ₹85,000 | Destination/Celebrity      |

**Plus Special Packages:**

- Pre-Wedding Special (Basic/Standard/Premium/Cinematic)
- Album Only Packages
- Video Only Packages
- VFX Add-on Packages

---

### 5. Project Type Fields (Dynamic Forms)

For each project type, define the wizard fields:

**Traditional Photo Color Correction:**

| Field Name     | Type   | Required | Options/Validation             |
| -------------- | ------ | -------- | ------------------------------ |
| imageCount     | number | Yes      | min: 1                         |
| turnaroundDays | select | Yes      | Standard (5-7) / Express (2-3) |
| colorStyle     | select | No       | Natural / Warm / Cool / Custom |

**Album Design - Traditional:**

| Field Name   | Type   | Required | Options/Validation           |
| ------------ | ------ | -------- | ---------------------------- |
| sheetCount   | number | Yes      | min: 10, max: 60             |
| albumSize    | select | Yes      | 12x18 / 12x30 / 12x36        |
| coverType    | select | Yes      | Leatherette / Acrylic / Wood |
| parentAlbums | number | No       | min: 0, max: 4               |

**Video Edit (Full Length):**

| Field Name        | Type     | Required | Options/Validation  |
| ----------------- | -------- | -------- | ------------------- |
| footageDuration   | number   | Yes      | Duration in minutes |
| includeTeaser     | checkbox | No       | -                   |
| includeDroneClips | checkbox | No       | -                   |
| vfxMinutes        | number   | No       | min: 0              |

---

### 6. Storage Tiers

From operational requirements:

| Tier Name    | Size GB | Price INR | Use Case                   |
| ------------ | ------- | --------- | -------------------------- |
| Starter      | 50      | ₹500      | Small photo projects       |
| Standard     | 100     | ₹900      | Standard weddings          |
| Professional | 250     | ₹2,000    | Large events               |
| Enterprise   | 500     | ₹3,500    | Multi-day destination      |
| Unlimited    | 1000    | ₹6,000    | Celebrity/Premium projects |

---

### 7. Folder Templates

Aligned with project types:

| Template Name          | Folders                                                   |
| ---------------------- | --------------------------------------------------------- |
| Photo Color Correction | Raw Images, Color Corrected, Rejected, Deliverables       |
| Album Design           | Raw Photos, Design Drafts, Client Approved, Print Ready   |
| Traditional Video      | Raw Footage, Proxy, Timeline Export, Final Render         |
| Pre-Wedding/Teaser     | Raw Clips, BTS, Music, VFX Assets, Exports                |
| Full Wedding Package   | Ceremony Raw, Reception Raw, Edited Photos, Album, Videos |

---

## 🔧 Implementation Stories

### Story SEED-1: Refactor Project Structure Seed

**Acceptance Criteria:**

- [ ] Update `projectCategories` to: "Photography Post-Production", "Videography Post-Production"
- [ ] Update `projectTypes` to match the 9 types listed above
- [ ] Add delivery configs appropriate for each type
- [ ] Maintain backward compatibility with existing projects

**Files to modify:**

- `convex/seeds/projectStructure.ts`

---

### Story SEED-2: Add Project Type Fields Seed

**Acceptance Criteria:**

- [ ] Create new seed file `convex/seeds/projectTypeFields.ts`
- [ ] Define 3-6 dynamic fields per project type
- [ ] Include proper validation (min/max/options)
- [ ] Integrate into main seed orchestrator

**Files to create/modify:**

- `convex/seeds/projectTypeFields.ts` (new)
- `convex/seed.ts` (add import and call)

---

### Story SEED-3: Update Quotation Sections Seed

**Acceptance Criteria:**

- [ ] Update section names to match pricing categories
- [ ] Use appropriate icons (Lucide icon names)
- [ ] Set correct display order

**Files to modify:**

- `convex/seeds/quotationSections.ts`

---

### Story SEED-4: Expand Quotation Library Items

**Acceptance Criteria:**

- [ ] Add all base rate items from pricing document
- [ ] Include bulk pricing metadata where applicable
- [ ] Link items to appropriate sections
- [ ] Add project type hints for filtering

**Files to modify:**

- `convex/seeds/quotationLibraryItems.ts`

---

### Story SEED-5: Create Package Templates

**Acceptance Criteria:**

- [ ] Create 5 main package templates (Silver → Royal Elite)
- [ ] Create 4 Pre-Wedding special templates
- [ ] Create Album-only and Video-only templates
- [ ] Include accurate line items with correct section references
- [ ] Add standard terms & conditions from pricing doc

**Files to modify:**

- `convex/seeds/quotationTemplates.ts`

---

### Story SEED-6: Add Storage Tiers Seed

**Acceptance Criteria:**

- [ ] Create new seed file `convex/seeds/storageTiers.ts`
- [ ] Add 5 storage tiers with GB and INR values
- [ ] Integrate into main seed orchestrator

**Files to create/modify:**

- `convex/seeds/storageTiers.ts` (new)
- `convex/seed.ts` (add import and call)

---

### Story SEED-7: Expand Folder Templates

**Acceptance Criteria:**

- [ ] Create folder templates for each project type
- [ ] Link templates to project types via `projectTypeId`
- [ ] Ensure folders reflect actual workflow needs

**Files to modify:**

- `convex/seeds/folderTemplates.ts`
- Integrate into main seed orchestrator

---

### Story SEED-8: Update Seed Orchestrator

**Acceptance Criteria:**

- [ ] Import all new seed modules
- [ ] Ensure proper execution order (dependencies first)
- [ ] Add progress logging for each step
- [ ] Test full seed with `clearFirst: true`

**Files to modify:**

- `convex/seed.ts`

---

## 📦 Deliverables

1. **Updated Seed Files**: All 7 seed modules updated/created
2. **Documentation**: This epic document serves as reference
3. **Test Report**: Confirmation that `seedAll({ clearFirst: true })` runs successfully
4. **Data Verification**: Screenshot/export showing seeded data in dashboard

---

## ⏱ Estimated Effort

| Story     | Complexity | Estimate      |
| --------- | ---------- | ------------- |
| SEED-1    | Medium     | 2 hours       |
| SEED-2    | High       | 3 hours       |
| SEED-3    | Low        | 30 mins       |
| SEED-4    | High       | 3 hours       |
| SEED-5    | High       | 4 hours       |
| SEED-6    | Low        | 30 mins       |
| SEED-7    | Medium     | 1 hour        |
| SEED-8    | Low        | 30 mins       |
| **Total** |            | **~15 hours** |

---

## 🚀 Success Metrics

- [ ] All 9 project types visible in admin dashboard
- [ ] All 5 package templates available in quotation builder
- [ ] Library items populated with accurate pricing
- [ ] Dynamic form fields appear in project wizard Step 2
- [ ] Storage tiers selectable during project setup
- [ ] Folder templates auto-applied based on project type

---

## 📝 Notes for Stakeholders

> **This seeding strategy eliminates manual data entry.** Once implemented, every fresh deployment of PrimeEditz will have the complete service catalog pre-loaded, matching the official B2B rate card. This ensures consistency across development, staging, and production environments.

---

## Changelog

| Date       | Author | Change                |
| ---------- | ------ | --------------------- |
| 2026-01-21 | System | Initial epic creation |
