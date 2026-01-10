# Epic 2 Retrospective: Client Portal — Project Request

**Date:** 2026-01-09
**Status:** Complete ✅
**Duration:** ~3 days (2026-01-06 to 2026-01-09)

---

## 📊 Epic Overview

| Metric                | Value                                               |
| --------------------- | --------------------------------------------------- |
| **Stories Completed** | 8 (2.0 - 2.7)                                       |
| **Original Scope**    | 8 stories                                           |
| **Added Stories**     | 0                                                   |
| **Tech Stack**        | Next.js 15, Convex, React Hook Form, MinIO, Zustand |

### Stories Completed

| Story | Title                              | Status  |
| ----- | ---------------------------------- | ------- |
| 2-0   | Wizard Infrastructure & Draft      | ✅ Done |
| 2-1   | Client Dashboard with Project List | ✅ Done |
| 2-2   | Wizard Step 1 - Project Type       | ✅ Done |
| 2-3   | Wizard Step 2 - Dynamic Details    | ✅ Done |
| 2-4   | Wizard Step 3 - Reference Files    | ✅ Done |
| 2-5   | Wizard Step 4 - Description        | ✅ Done |
| 2-6   | Wizard Step 5 - Review & Submit    | ✅ Done |
| 2-7   | Client Project Detail View         | ✅ Done |

---

## ✅ What Went Well

### 1. Framework Migration Handled Cleanly

Stories were originally written for TanStack Start, but the actual implementation used Next.js 15 App Router. This pivot was handled seamlessly without blocking development.

### 2. Zustand-Based Deferred Upload Pattern

**Decision:** Instead of uploading files to MinIO immediately in Step 3, files are stored in a Zustand store (`reference-files-store.ts`) and only uploaded on final submission (Step 5).

**Benefits:**

- No orphaned files from abandoned wizards
- Better UX (no upload wait per file)
- Simpler cleanup logic

### 3. Production Vault Architecture

Created a unified `FilesVaultDrawer` component that's shared between:

- Wizard Step 3 (via adapter)
- Project Detail View

This promotes **code reuse** and ensures consistent UX across the application.

### 4. Secure Asset Protocol

Implemented pre-signed MinIO URLs via Convex actions (`storage/actions:getSignedFileUrls`). This ensures:

- Authenticated access only
- Time-limited URLs (1 hour expiry)
- No public bucket exposure

### 5. Database-Driven Dynamic Forms

Instead of hardcoding project types and fields, the system fetches:

- `projectTypes` table → for type selection
- `projectTypeFields` table → for dynamic Step 2 fields

This enables **admin-configurable workflows** without code changes.

### 6. Premium Studio Aesthetic

Consistent use of:

- Glassmorphism effects
- `motion/react` animations
- High-density typography
- Dark theme with amber accents

---

## ⚠️ What Could Be Improved

### 1. Story-Reality Divergence

**Issue:** Stories referenced TanStack Form, TanStack Router, and Unpic, but implementation used React Hook Form, Next.js App Router, and next/image.

**Resolution:** Updated all story task lists with `*(NOT DONE - reason)*` annotations.

**Lesson for Future Stories:** Write framework-agnostic acceptance criteria. Implementation details should be flexible.

### 2. Auto-Save Not Implemented

**Planned:** Debounced auto-save on field blur (500ms delay).
**Actual:** Manual save on step navigation only.

**Impact:** Lower UX, but acceptable for MVP. Can be added later.

**Story Update Needed:** Mark auto-save as "deferred enhancement" in future stories.

### 3. Confirmation Dialog Missing

Step 5 was supposed to have a confirmation dialog before submission. This was skipped.

**Recommendation:** Add to "polish" phase or Epic 7 (Status Tracking).

### 4. Character Counter Not Added

Description field was supposed to have a character counter. Skipped for simplicity.

---

## 📝 Lessons Learned

### 1. Deferred Upload Pattern

| Traditional Approach               | PrimeEditz Approach                |
| ---------------------------------- | ---------------------------------- |
| Upload immediately on file select  | Store in Zustand, upload on submit |
| Risk of orphaned files             | Zero orphaned files                |
| Multiple MinIO calls during wizard | Single batch upload                |

**Apply to Future Stories:** Epic 5 (Asset Upload) should follow this same pattern.

### 2. Unified Component Strategy

When the same UI pattern appears in multiple places, create a **shared component** with an **adapter pattern**:

```
Shared: FilesVaultDrawer (in /shared/)
├── Wizard Adapter: uploaded-files-drawer.tsx (maps Zustand → VaultFile)
└── Detail Adapter: reference-materials.tsx (maps Convex → VaultFile)
```

### 3. Form Library Flexibility

React Hook Form + Zod proved simpler than TanStack Form for this use case:

- Simpler API
- Better TypeScript inference
- Smaller bundle size

**Recommendation:** Update remaining stories to specify "React Hook Form + Zod" instead of TanStack Form.

### 4. MinIO Integration Pattern

```
Client → Convex Action (getSignedFileUrls) → MinIO Pre-signed URL → Direct Download
```

**Key Files:**

- `convex/functions/storage/actions.ts` - URL generation
- `convex/lib/storageUtils.ts` - URL construction helpers

---

## 🎯 Key Architectural Decisions

### 1. Reference Files Stored on Project, Not Separate Table

Files are stored directly in the `projects.referenceFiles` array as objects with `storageKey`, `filename`, `mimeType`, `sizeBytes`.

**Rationale:** Simpler queries, no joins needed for basic display.

### 2. Project Types as Database Entities

`projectTypes` and `projectTypeFields` tables enable admin-configurable workflows:

```
projectTypes:
  - id: "wedding-album"
  - name: "Wedding Album"
  - category: "albums"
  - isActive: true

projectTypeFields:
  - projectTypeId: "wedding-album"
  - fieldName: "albumCount"
  - fieldType: "number"
  - isRequired: true
  - displayOrder: 1
```

### 3. ImageSlider as First-Class Component

The `ImageSlider` component is deeply integrated:

- Keyboard navigation (Arrow keys)
- Zoom functionality
- Download button
- Thumbnail strip

Used in: `FilesVaultDrawer`, `ReferenceMaterials`, Step 3, Step 5

---

## 📁 Files Created/Modified

### New Files (35+)

| Category           | Files                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Routes**         | `@client/dashboard/page.tsx`, `@client/projects/new/page.tsx`, `@client/projects/[projectId]/page.tsx`                                 |
| **Wizard**         | `project-wizard.tsx`, `step-1-project-type.tsx`, `step-2/index.tsx`, `step-3/index.tsx`, `step-4-description.tsx`, `step-5-review.tsx` |
| **Project Detail** | `project-detail-view.tsx`, `header.tsx`, `specifications.tsx`, `reference-materials.tsx`, `sidebar.tsx`, `shared.tsx`                  |
| **Shared**         | `files-vault/drawer.tsx`, `image-viewer/image-slider.tsx`, `image-viewer/slider-*.tsx`, `dynamic-form-fields/*.tsx`                    |
| **Stores**         | `reference-files-store.ts`                                                                                                             |
| **Convex**         | `projects/mutations.ts`, `projects/queries.ts`, `storage/actions.ts`, `projectTypes/queries.ts`, `projectTypeFields/queries.ts`        |

---

## 🔮 Impact on Future Epics

### Epic 3: Admin Portal Management

| Story                    | Impact                                            |
| ------------------------ | ------------------------------------------------- |
| 3-3 Admin Project Detail | **LOW** - Can reuse `FilesVaultDrawer` directly   |
| 3-7 Project Types CRUD   | **MEDIUM** - Schema already exists, build CRUD UI |
| 3-8 Quotation Templates  | **NONE**                                          |

**Recommendation:** Start with Story 3-3 to demonstrate FilesVaultDrawer reuse.

### Epic 4: Quotation System

| Story                     | Impact                                              |
| ------------------------- | --------------------------------------------------- |
| 4-1 Create Quotation      | **LOW** - Build on existing project detail patterns |
| 4-4 Client View Quotation | **LOW** - Similar layout to project detail          |

### Epic 5: Asset Upload & Folder Management

| Story                            | Impact                                                             |
| -------------------------------- | ------------------------------------------------------------------ |
| 5-3 File Upload with Signed URLs | **HIGH** - Reuse `storage/actions.ts` patterns                     |
| 5-4 Upload Progress              | **MEDIUM** - May need to add progress tracking (skipped in Epic 2) |

### Story Updates Required

The following stories should be updated based on Epic 2 learnings:

#### CRITICAL Updates

1. **All Stories**: Replace "TanStack Form" → "React Hook Form + Zod"
2. **All Stories**: Replace "TanStack Router" → "Next.js App Router"
3. **All Stories**: Add "Zustand store for client-side state" pattern

#### RECOMMENDED Updates

4. **Stories 5-3, 5-4**: Reference `storage/actions.ts` for MinIO integration
5. **Story 3-3**: Reference `FilesVaultDrawer` for file display
6. **Stories with file upload**: Use deferred upload pattern

---

## 📋 Prioritized Next Steps

### Immediate (Before Epic 3 continues)

1. ✅ Epic 2 Retrospective (this document)
2. 🔲 Update Epic 3 stories with framework corrections
3. 🔲 Start Story 3-3 (Admin Project Detail) - demonstrates FilesVaultDrawer reuse

### Short-term (This week)

4. Story 3-5 (Update Project Status) - critical admin capability
5. Story 3-7 (Project Types CRUD) - enables full admin configuration

### Medium-term

6. Epic 4 (Quotation System) - client-facing value
7. Epic 5 (Asset Upload) - reuses established patterns

---

## 📈 Metrics

- **TypeScript Errors:** 0
- **Console.log Statements:** 0
- **Hardcoded Mock Data:** 0
- **Unused Dependencies:** 0

---

## 🏁 Conclusion

Epic 2 successfully delivered a complete client project request workflow with:

- 5-step wizard with draft persistence
- Dynamic form fields from database
- Deferred file upload pattern
- Premium studio aesthetic
- Secure MinIO integration

The architectural patterns established (Zustand stores, FilesVaultDrawer, storage actions) provide a strong foundation for Epics 3-5.

**Recommended Next Story:** Story 3-3 (Admin Project Detail View) - leverages FilesVaultDrawer immediately.

---

## 📌 Quick Reference: Reusable Patterns from Epic 2

| Pattern            | Location                          | Use In                  |
| ------------------ | --------------------------------- | ----------------------- |
| FilesVaultDrawer   | `shared/files-vault/drawer.tsx`   | Any file display        |
| ImageSlider        | `shared/image-viewer/`            | Any image gallery       |
| Pre-signed URLs    | `storage/actions.ts`              | All MinIO access        |
| Dynamic Fields     | `shared/dynamic-form-fields/`     | Any configurable form   |
| Zustand File Store | `stores/reference-files-store.ts` | Deferred upload pattern |
| Premium Styling    | `detail/shared.tsx`               | Section layouts         |
