# Story 3.3: Admin Project Detail View

**Epic**: Epic 3 - Admin Portal — Project & System Management  
**Status**: done  
**Complexity**: Medium  
**Created**: 2026-01-09

---

## 📋 User Story

**As an** Admin,  
**I want** to view full project details including client info, reference files, and history,  
**So that** I can make informed decisions about quotations and assignments.

---

## ✅ Acceptance Criteria

- **Given** I am on `/projects/{projectId}` (via @admin parallel route)
- **When** the page loads
- **Then** I must see:
  - Project Header (code, status, client name)
  - Client Info section
  - Project-Specific Details (rendered dynamically based on type)
  - Reference Files (using FilesVaultDrawer from Epic 2)
  - Action buttons
- **And** action buttons must include:
  - "Create Quotation" — enabled if project status is `pending_review`
  - "Assign Team" — **disabled until quotation status = `approved`**
  - "Setup Folders" — enabled after quotation approved
- **And** status history must be visible showing all status transitions

---

## 📘 Framework Notes (Epic 2 Learnings)

### Reusable Components from Epic 2

| Component          | Location                                            | Use For                   |
| ------------------ | --------------------------------------------------- | ------------------------- |
| `FilesVaultDrawer` | `src/components/shared/files-vault/drawer.tsx`      | Reference files display   |
| `ImageSlider`      | `src/components/shared/image-viewer/`               | Full-screen image preview |
| `DetailSection`    | `src/components/modules/projects/detail/shared.tsx` | Section layouts           |
| `StatusBadge`      | `src/components/modules/projects/detail/shared.tsx` | Status display            |

### Route Structure

```
src/app/(protected)/@admin/projects/[projectId]/page.tsx
```

### Data Fetching

- Use existing `getProject` query (or create `getAdminProject` with additional admin fields)
- Use `getSignedFileUrls` action for MinIO access

### 🔐 MinIO Signed URL Security (CRITICAL)

**All file/image URLs MUST use MinIO pre-signed URLs:**

1. **Never expose raw storage URLs** — All images displayed in this view must use pre-signed URLs
2. **User-scoped access** — Signed URLs must be generated with the authenticated admin user's context
3. **Short expiry** — URLs should have a reasonable expiry (e.g., 1 hour) to prevent unauthorized sharing
4. **Server-side generation** — Use Convex action `getSignedFileUrls` to generate signed URLs
5. **Pattern from Epic 2** — Follow `FilesVaultDrawer` implementation which already implements this correctly

```typescript
// Example: Getting signed URLs in component
const signedUrls = useAction(api.files.actions.getSignedFileUrls);

// Call with file storage keys
const urls = await signedUrls({
  storageKeys: files.map((f) => f.storageKey),
  expirySeconds: 3600, // 1 hour
});
```

---

## 🎯 Implementation Tasks

### Task 1: Create Admin Project Detail Route

**File**: `src/app/(protected)/@admin/projects/[projectId]/page.tsx`

- [x] 1.1 Create route following parallel routes pattern
- [x] 1.2 Extract `projectId` from params using `use()` hook (Next.js 15)
- [x] 1.3 Add default.tsx for parallel route

### Task 2: Create/Enhance Convex Query

**File**: `convex/admin.ts`

- [x] 2.1 Create `getAdminProject` query (or reuse `getProject`)
- [x] 2.2 Include: client profile info (name, email)
- [x] 2.3 Include: project type name
- [x] 2.4 Include: reference files with storageKeys
- [x] 2.5 Include: status history (if table exists)

### Task 3: Create Admin Project Detail View Component

**File**: `src/components/modules/admin/projects/project-detail-view.tsx`

- [x] 3.1 Create main container component
- [x] 3.2 Reuse `DetailSection` from client detail
- [x] 3.3 Display project header with status badge
- [x] 3.4 Display client information section
- [x] 3.5 Display project specifications
- [x] 3.6 Integrate `FilesVaultDrawer` for reference files
- [x] 3.7 Add admin action buttons

### Task 4: Admin Action Buttons

- [x] 4.1 "Create Quotation" → `/admin/projects/{id}/quotation/new` (disabled if not pending_review)
- [x] 4.2 "Assign Team" → Modal or separate page (disabled until quotation approved)
- [x] 4.3 "Setup Folders" → Modal or inline (disabled until quotation approved)
- [x] 4.4 "Update Status" → Dropdown with valid transitions (Story 3-5)

### Task 5: Integrate FilesVaultDrawer with Signed URLs

- [x] 5.1 Map project reference files to `VaultFile` interface
- [x] 5.2 **Use `getSignedFileUrls` action for MinIO pre-signed URLs** (SECURITY-CRITICAL)
- [x] 5.3 Ensure signed URLs are user-scoped (admin must be authenticated)
- [x] 5.4 Set appropriate URL expiry (1 hour recommended)
- [x] 5.5 Enable ImageSlider for images (using signed URLs)
- [x] 5.6 Enable download functionality (using signed URLs)
- [x] 5.7 Handle URL expiry gracefully (re-fetch if needed)

### Task 6: Loading & Empty States

- [x] 6.1 Add skeleton loader while fetching
- [x] 6.2 Add 404 state for non-existent projects
- [x] 6.3 Add empty states for sections without data

### Task 7: Motion Animations

- [x] 7.1 Add staggered entrance animations (matching client detail)
- [x] 7.2 Use `motion/react` for consistent premium feel

---

## 📦 Dependencies

### From Epic 2 (Reuse)

- `FilesVaultDrawer` component
- `ImageSlider` component
- `DetailSection`, `StatusBadge` components
- `getSignedFileUrls` action
- Premium styling patterns

### New for This Story

- Admin-specific action buttons
- Client info section (new)
- Status history section (new)

---

## 🔗 Future Story Dependencies

| Action Button      | Depends On                                |
| ------------------ | ----------------------------------------- |
| "Create Quotation" | Story 4-1 (Quotation Creation)            |
| "Assign Team"      | Epic 3 (Team Assignment - not scoped yet) |
| "Setup Folders"    | Story 3-4 (Folder Setup)                  |
| "Update Status"    | Story 3-5 (Status Update)                 |

**Note**: For this story, buttons can be visually present but disabled/placeholder until dependent stories are complete.

---

## 🎨 Design Guidelines

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Projects    [Create Quotation] [Update Status]  │  ← Header
├─────────────────────────────────────────────────────────────┤
│  PROJECT CODE: PE-202601-001          Status: pending_review│  ← Title Bar
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐  ┌──────────────────────┐  │
│  │ Project Specifications      │  │ Client Information   │  │
│  │ • Type: Wedding Album       │  │ • Name: Priya Sharma │  │
│  │ • Event: Wedding Ceremony   │  │ • Email: priya@...   │  │
│  │ • Date: Jan 15, 2026        │  │ • Submitted: 2d ago  │  │
│  └─────────────────────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Reference Materials                    [Enter Vault →]     │
│  ┌────┐ ┌────┐ ┌────┐                                       │
│  │ 🖼️ │ │ 🖼️ │ │ 🖼️ │    5 files uploaded                  │
│  └────┘ └────┘ └────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### Styling

- Match existing client detail view aesthetic

---

## 🔒 Security Requirements

### MinIO Pre-Signed URL Implementation

| Requirement          | Implementation                                             |
| -------------------- | ---------------------------------------------------------- |
| **No raw URLs**      | Never render `storageKey` directly; always use signed URLs |
| **Auth-scoped**      | Signed URLs generated with admin user context              |
| **Short expiry**     | 1 hour maximum; re-fetch on interaction if expired         |
| **Server-side only** | URL signing happens in Convex action, never client-side    |
| **Audit trail**      | Log file access in server action (optional)                |

### Why This Matters

- Prevents unauthorized access to client reference files
- Ensures only authenticated admins can view project assets
- Limits exposure window if URL is leaked
- Follows security best practices for object storage
- Use amber accent for admin-specific elements
- Premium glassmorphism, motion animations

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Navigate to `/admin/projects/{projectId}` → page loads
- [ ] Project header displays correctly
- [ ] Client info section shows client name and email
- [ ] Project specifications display all fields
- [ ] Reference files display with thumbnails
- [ ] "Enter Vault" opens FilesVaultDrawer
- [ ] Images can be viewed in ImageSlider
- [ ] Action buttons are present (can be disabled)
- [ ] 404 state for invalid projectId
- [ ] Real-time updates when project changes

### Responsive Design

- [ ] Mobile (320px) - stacked layout
- [ ] Tablet (768px) - 2-column sections
- [ ] Desktop (1920px) - full layout

---

## 🚀 Definition of Done

- [ ] Admin project route created
- [ ] Query returns all necessary data
- [ ] FilesVaultDrawer integrated successfully
- [ ] Action buttons present (can be disabled)
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] 404 state implemented
- [ ] Motion animations match client detail
- [ ] No TypeScript errors
- [ ] Responsive design verified
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                                                           |
| ---------- | ------------- | --------------------------------------------------------------- |
| 2026-01-09 | ready-for-dev | Story created based on Epic 2 patterns                          |
| 2026-01-10 | ready-for-dev | Added MinIO pre-signed URL security requirements (user request) |

---

---

**Previous Story**: 3.2 - Admin Project Listing with Filters  
 **Next Story**: 3.4 - Project Stage/Folder Setup

## Senior Developer Review (AI)

**Review Date**: 2026-01-10
**Reviewer**: Antigravity (Senior AI Coding Assistant)
**Outcome**: APPROVED (After Fixes)

### Review Summary

The implementation successfully follows the premium UI patterns established in Epic 2 while correctly implementing admin-specific requirements. Security protocols for MinIO pre-signed URLs are strictly followed.

### Issues Addressed During Review:

1. **Performance/Security**: Replaced raw `<img>` tags with `next/image` for optimized asset delivery.
2. **Type Safety**: Defined `StatusHistoryEntry` interface and removed `any` types from data mappings.
3. **Schema Optimization**: Added `email` field to the `profiles` table to allow admins to view client contact info without complex auth sub-queries.
4. **Code Quality**: Cleaned up component naming (Skeleton) and removed unused imports.

### Verification Results

- [x] Pre-signed URLs correctly generated in action
- [x] Staggered animations match project style
- [x] Loading/404 states functional
- [x] Action buttons correctly gated by status
- [x] Responsive layout verified
- [x] Build passing with no TypeScript errors
