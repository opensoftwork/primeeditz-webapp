# Story 21-5: Consolidate Version Request Dialogs

**Epic**: Epic 21 - Deliverable Code Deduplication & UI Consistency
**Status**: backlog
**Complexity**: Medium (4 points)
**Created**: 2026-02-15
**Priority**: SHOULD — Reduces 3 implementations to 1; improves feature parity

---

## 📋 User Story

**As a** user (admin or studio) requesting a new version of a deliverable,
**I want** a consistent dialog experience with the option to attach reference images,
**So that** the request form feels familiar regardless of which portal I'm using.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On | Status  | Notes                                              |
| ---------- | ------- | -------------------------------------------------- |
| **21-1**   | backlog | Shared types                                       |
| **21-7**   | backlog | Shared `VersionImageGrid` and `VersionImageUpload` |

### Enables

| Story / Epic | Notes                                        |
| ------------ | -------------------------------------------- |
| **21-8**     | UI consistency benefits from a single dialog |

### Current Implementations

There are **3 separate dialog implementations**:

1. **`admin/.../versions-dialog.tsx`** (71 lines)
   - Simple: notes textarea + submit button
   - Props: `open`, `onOpenChange`, `onSubmit(notes)`
   - No image upload capability

2. **`studio/.../versions-dialog.tsx`** (93 lines) — `ClientVersionDialog`
   - Simple: notes textarea + submit button
   - Nearly identical to admin version
   - Different styling (amber theme vs red theme)

3. **`studio/.../studio-versions-dialog.tsx`** (257 lines) — `StudioVersionsDialog`
   - Full: notes + image upload + image grid
   - Inline upload logic (duplicates `VersionImageUpload`)
   - Props: `open`, `onOpenChange`, `deliverableId`, `deliverableName`, `projectId`, `onSuccess`

---

## ✅ Acceptance Criteria

### AC1: Shared Dialog Created

- [ ] **Given** `src/components/shared/deliverables/version-request-dialog.tsx`
- [ ] **Then** it exports a `VersionRequestDialog` component
- [ ] **And** it accepts:
  ```ts
  interface VersionRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: {
      notes: string;
      referenceImages?: VersionImage[];
    }) => Promise<void>;
    title?: string; // default: "Request Version"
    description?: string; // default description text
    showImageUpload?: boolean; // default: false
    projectId?: string; // required if showImageUpload
    deliverableId?: string; // required if showImageUpload
    submitLabel?: string; // default: "Submit Version Request"
    themeColor?: "amber" | "red" | "indigo"; // default: "red"
  }
  ```

### AC2: Image Upload Integration

- [ ] **Given** `showImageUpload={true}`
- [ ] **Then** the dialog shows an image upload section with `VersionImageGrid`
- [ ] **And** uploaded images are included in the `onSubmit` callback data
- [ ] **And** the upload uses the shared `VersionImageUpload` component (from 21-7)

### AC3: Admin Module Updated

- [ ] **Given** the admin versions page
- [ ] **Then** it uses `VersionRequestDialog` from shared
- [ ] **And** the old `admin/.../versions-dialog.tsx` is deleted

### AC4: Studio Module Updated

- [ ] **Given** the studio deliverable detail view
- [ ] **Then** it uses `VersionRequestDialog` from shared with `showImageUpload={true}`
- [ ] **And** the old `studio/.../versions-dialog.tsx` is deleted
- [ ] **And** the old `studio/.../studio-versions-dialog.tsx` is deleted

### AC5: Visual Parity

- [ ] **Given** the admin dialog
- [ ] **Then** it renders with the same styling as before

- [ ] **Given** the studio dialog
- [ ] **Then** it renders with reference image upload capability as before

### AC6: Build Passes

- [ ] **Given** all changes
- [ ] **When** I run `pnpm build`
- [ ] **Then** zero TypeScript errors

---

## 📘 Implementation

### Phase A: Create Shared Dialog (~2 points)

#### Task A1: Create `VersionRequestDialog`

**File**: `src/components/shared/deliverables/version-request-dialog.tsx`

- [ ] A1.1 Define the `VersionRequestDialogProps` interface
- [ ] A1.2 Implement notes textarea with required validation
- [ ] A1.3 Conditionally render image upload section based on `showImageUpload`
- [ ] A1.4 Use `VersionImageGrid` for displaying uploaded images
- [ ] A1.5 Handle form reset on close
- [ ] A1.6 Submit loading state
- [ ] A1.7 Use `themeColor` prop for button/accent styling
- [ ] A1.8 Standard dialog structure (DialogHeader, DialogContent, DialogFooter)

#### Task A2: Export from barrel

- [ ] A2.1 Add `VersionRequestDialog` to `index.ts`

### Phase B: Upload Logic (~1 point)

#### Task B1: Handle image upload within dialog

- [ ] B1.1 If `showImageUpload`, use `VersionImageUpload` component for file selection/upload
- [ ] B1.2 Manage `VersionImage[]` state internally
- [ ] B1.3 Pass `onRemove` and `onNoteChange` through to `VersionImageGrid`
- [ ] B1.4 Include images in `onSubmit` callback

### Phase C: Replace Existing Dialogs (~1 point)

#### Task C1: Update admin's version request page

- [ ] C1.1 Replace `VersionDialog` import with `VersionRequestDialog` from shared
- [ ] C1.2 Update `onSubmit` to match new callback signature
- [ ] C1.3 Delete `admin/.../versions-dialog.tsx`

#### Task C2: Update studio's deliverable detail

- [ ] C2.1 Replace `StudioVersionsDialog` import with `VersionRequestDialog` from shared
- [ ] C2.2 Pass `showImageUpload={true}`, `projectId`, `deliverableId`
- [ ] C2.3 Update `onSubmit` to handle image data
- [ ] C2.4 Delete `studio/.../studio-versions-dialog.tsx`
- [ ] C2.5 Delete `studio/.../versions-dialog.tsx` (ClientVersionDialog)

#### Task C3: Verify build

- [ ] C3.1 Run `pnpm build` — confirm zero errors

---

## 🧪 Testing Checklist

### Admin Portal

- [ ] Open version request dialog — notes textarea visible
- [ ] No image upload section visible (admin currently doesn't have it)
- [ ] Submit with notes — works correctly
- [ ] Submit without notes — validation prevents submission
- [ ] Cancel — dialog closes, form resets

### Studio Portal

- [ ] Open version request dialog — notes textarea + image upload visible
- [ ] Upload reference images — appear in grid
- [ ] Add per-image notes — stored correctly
- [ ] Remove uploaded image — disappears from grid
- [ ] Submit with notes + images — works correctly
- [ ] Submit with notes only (no images) — works correctly
- [ ] Cancel — dialog closes, form resets

### Edge Cases

- [ ] Submitting while images are still uploading — button disabled
- [ ] Upload error — toast notification shown
- [ ] Very long notes — textarea handles overflow

---

## 🚀 Definition of Done

- [ ] Shared `VersionRequestDialog` component created
- [ ] Admin and studio both use the shared component
- [ ] 3 old dialog files deleted
- [ ] Visual parity confirmed
- [ ] `pnpm build` passes with zero errors
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-15 | backlog | Story created |

---

**Previous Story**: 21-4 - Unify VersionRequestsList Component
**Next Story**: 21-6 - Employee Lightbox → AssetSlider + Animation Fix
