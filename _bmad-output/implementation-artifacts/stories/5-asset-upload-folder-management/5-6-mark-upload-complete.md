# Story 5-6: Mark Upload Complete

**Epic**: Epic 5 - Asset Upload & Folder Management  
**Status**: ready-for-dev  
**Complexity**: Low (2 points)  
**Created**: 2026-01-18  
**Priority**: SHOULD — Workflow clarity

---

## 📋 User Story

**As a** Client,  
**I want** to mark my asset upload as complete,  
**So that** the studio knows they can start working on my project.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                | Status  | Notes                |
| ------------------------- | ------- | -------------------- |
| **5-1 to 5-5**            | Pending | Upload flow complete |
| **Asset uploads working** | In 5-3  | Files in folders     |

### Enables

| Story / Epic                | Notes                          |
| --------------------------- | ------------------------------ |
| **Epic 6 - Deliverables**   | Project moves to `in_progress` |
| **Admin notification flow** | Admin knows to start work      |

---

## ✅ Acceptance Criteria

### AC1: Mark Complete Button

- [ ] **Given** I have uploaded files to at least one folder
- [ ] **When** I view the assets section
- [ ] **Then** I see "Mark Upload Complete" button
- [ ] **And** button is prominent but secondary styling

### AC2: Button Disabled States

- [ ] **Given** no files have been uploaded
- [ ] **Then** button is disabled
- [ ] **And** tooltip shows: "Upload at least one file first"

### AC3: Confirmation Dialog

- [ ] **Given** I click "Mark Upload Complete"
- [ ] **Then** confirmation dialog appears with:
  - Title: "Mark Upload Complete?"
  - Message: "This will notify the studio that your assets are ready."
  - Subtext: "You can still upload more files after this."
  - Actions: [Cancel] [Confirm]

### AC4: Status Update

- [ ] **Given** I confirm completion
- [ ] **Then** project status changes to `in_progress`
- [ ] **And** `uploadCompletedAt` timestamp is recorded
- [ ] **And** success toast: "Upload marked complete! The studio will begin work soon."

### AC5: Admin Notification

- [ ] **Given** client marks upload complete
- [ ] **Then** admin receives notification
- [ ] **And** notification shows: "{Client} marked assets ready for {Project}"

### AC6: Post-Completion UI

- [ ] **Given** upload is marked complete
- [ ] **Then** I see status badge: "✅ Uploads Complete"
- [ ] **And** I can still upload more files (optional)
- [ ] **And** message: "Assets are being processed"

---

## 🎨 UX Design

### Assets Section with Button

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ASSETS                                              📤 Ready to Upload │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📊 STORAGE: ████████░░ 78GB / 100GB                                    │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  │  📁 Ceremony        │  │  📁 Reception       │  │  📁 Candid          │
│  │  124 files ✅       │  │  0 files ⏳         │  │  45 files 🔄        │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘
│                                                                          │
│  ───────────────────────────────────────────────────────────────────────│
│                                                                          │
│                        [✅ MARK UPLOAD COMPLETE]                         │
│                                                                          │
│  You can still upload additional files after marking complete.           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Confirmation Dialog

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                           ✅ MARK UPLOAD COMPLETE?                       │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  This will notify the studio that your assets are ready for processing.  │
│                                                                          │
│  📊 Your uploads:                                                        │
│  • 169 files across 3 folders                                            │
│  • 78 GB total                                                           │
│                                                                          │
│  ℹ️ You can still upload additional files after this.                   │
│                                                                          │
│                                                                          │
│                    [Cancel]                [✅ Mark Complete]            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Post-Completion State

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ASSETS                                         ✅ UPLOADS COMPLETE      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ✅ Your assets are being processed!                                ││
│  │     Marked complete on January 18, 2026 at 2:30 PM                  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  📊 STORAGE: ████████░░ 78GB / 100GB                                    │
│                                                                          │
│  [📁 folders...]                                                         │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Want to upload more files?           [📤 Upload Additional Files]      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Backend (~1 point)

#### Task A1: Mark Complete Mutation

**File**: `convex/functions/projects/mutations.ts`

```typescript
export const markUploadComplete = clientMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Verify client owns project
    // 2. Verify at least 1 file uploaded (via assets table)
    // 3. Update project status to 'in_progress'
    // 4. Set uploadCompletedAt timestamp
    // 5. Add to statusHistory
    // 6. (Optional) Create admin notification
  },
});
```

- [ ] A1.1 Create `markUploadComplete` mutation
- [ ] A1.2 Verify ownership
- [ ] A1.3 Check file count > 0
- [ ] A1.4 Update project status
- [ ] A1.5 Record timestamp

#### Task A2: Get Upload Status Query

**File**: `convex/functions/projects/queries.ts` (extend)

```typescript
export const getUploadStatus = clientQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Return { fileCount, uploadCompletedAt, canMarkComplete }
  },
});
```

- [ ] A2.1 Create query for upload status
- [ ] A2.2 Count assets
- [ ] A2.3 Check completion state

---

### Phase B: UI Components (~1 point)

#### Task B1: Mark Complete Button

**File**: `src/components/modules/projects/detail/mark-complete-button.tsx`

- [ ] B1.1 Create button component
- [ ] B1.2 Disabled state when no files
- [ ] B1.3 Click triggers confirmation

#### Task B2: Confirmation Dialog

**File**: `src/components/modules/projects/detail/mark-complete-dialog.tsx`

- [ ] B2.1 Create dialog component
- [ ] B2.2 Show file/folder summary
- [ ] B2.3 Cancel and Confirm actions
- [ ] B2.4 Loading state during mutation

#### Task B3: Completion Status Banner

**File**: `src/components/modules/projects/detail/completion-banner.tsx`

- [ ] B3.1 Create banner component
- [ ] B3.2 Show completion date
- [ ] B3.3 "Upload more" option

#### Task B4: Integrate in Assets Section

- [ ] B4.1 Add MarkCompleteButton to assets section
- [ ] B4.2 Conditionally show completion banner
- [ ] B4.3 Handle state transitions

---

## 🧪 Testing Checklist

### Button States

- [ ] Disabled when 0 files
- [ ] Enabled when 1+ files
- [ ] Tooltip on disabled state

### Confirmation Flow

- [ ] Dialog opens on click
- [ ] Cancel closes dialog
- [ ] Confirm triggers mutation

### Status Update

- [ ] Project status changes to `in_progress`
- [ ] Timestamp recorded
- [ ] Toast notification shown

### Post-Completion

- [ ] Status badge shows "Complete"
- [ ] Completion date shown
- [ ] "Upload more" option available

---

## 🚀 Definition of Done

- [ ] `markUploadComplete` mutation working
- [ ] `getUploadStatus` query working
- [ ] Mark complete button with disabled states
- [ ] Confirmation dialog with summary
- [ ] Completion banner displayed
- [ ] Can still upload after marking complete
- [ ] Toast notification on success
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                          |
| ---------- | ------------- | ------------------------------ |
| 2026-01-18 | ready-for-dev | Story created from Epic 5 plan |

---

**Previous Story**: 5-5 - Storage Limit Enforcement  
**Next Story**: 5-7 - Admin Asset Upload (Internal Projects)
