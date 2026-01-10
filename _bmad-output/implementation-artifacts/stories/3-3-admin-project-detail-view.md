# Story 3.3: Admin Project Detail View

**Epic**: Epic 3 - Admin Portal — Project & System Management  
**Status**: ready-for-dev  
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

---

## 🎯 Implementation Tasks

### Task 1: Create Admin Project Detail Route

**File**: `src/app/(protected)/@admin/projects/[projectId]/page.tsx`

- [ ] 1.1 Create route following parallel routes pattern
- [ ] 1.2 Extract `projectId` from params using `use()` hook (Next.js 15)
- [ ] 1.3 Add default.tsx for parallel route

### Task 2: Create/Enhance Convex Query

**File**: `convex/functions/admin/queries.ts`

- [ ] 2.1 Create `getAdminProject` query (or reuse `getProject`)
- [ ] 2.2 Include: client profile info (name, email)
- [ ] 2.3 Include: project type name
- [ ] 2.4 Include: reference files with storageKeys
- [ ] 2.5 Include: status history (if table exists)

### Task 3: Create Admin Project Detail View Component

**File**: `src/components/modules/admin/projects/project-detail-view.tsx`

- [ ] 3.1 Create main container component
- [ ] 3.2 Reuse `DetailSection` from client detail
- [ ] 3.3 Display project header with status badge
- [ ] 3.4 Display client information section
- [ ] 3.5 Display project specifications
- [ ] 3.6 Integrate `FilesVaultDrawer` for reference files
- [ ] 3.7 Add admin action buttons

### Task 4: Admin Action Buttons

- [ ] 4.1 "Create Quotation" → `/admin/projects/{id}/quotation/new` (disabled if not pending_review)
- [ ] 4.2 "Assign Team" → Modal or separate page (disabled until quotation approved)
- [ ] 4.3 "Setup Folders" → Modal or inline (disabled until quotation approved)
- [ ] 4.4 "Update Status" → Dropdown with valid transitions (Story 3-5)

### Task 5: Integrate FilesVaultDrawer

- [ ] 5.1 Map project reference files to `VaultFile` interface
- [ ] 5.2 Use `getSignedFileUrls` action for secure URLs
- [ ] 5.3 Enable ImageSlider for images
- [ ] 5.4 Enable download functionality

### Task 6: Loading & Empty States

- [ ] 6.1 Add skeleton loader while fetching
- [ ] 6.2 Add 404 state for non-existent projects
- [ ] 6.3 Add empty states for sections without data

### Task 7: Motion Animations

- [ ] 7.1 Add staggered entrance animations (matching client detail)
- [ ] 7.2 Use `motion/react` for consistent premium feel

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

| Date       | Status        | Notes                                  |
| ---------- | ------------- | -------------------------------------- |
| 2026-01-09 | ready-for-dev | Story created based on Epic 2 patterns |

---

**Previous Story**: 3.2 - Admin Project Listing with Filters  
**Next Story**: 3.4 - Project Stage/Folder Setup
