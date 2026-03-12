# Story 29.4: Upload Overlay UI — Pause/Resume/Retry Buttons

**Epic**: Epic 29 - Resumable Upload Enhancement
**Status**: backlog
**Complexity**: Small-Medium (3 points)
**Created**: 2026-03-02
**Priority**: MEDIUM — User-facing controls for the upload experience

---

## 📋 User Story

**As a** user,
**I want** pause, resume, retry, and cancel buttons on my upload progress overlay,
**So that** I have full control over active uploads.

---

## ✅ Acceptance Criteria

- [ ] **Given** a TUS upload is active (status: `uploading`, file >50MB)
- [ ] **Then** a Pause button (⏸️) is visible
- [ ] **Given** an upload is paused (status: `paused`)
- [ ] **Then** a Resume button (▶️) is visible
- [ ] **Given** an upload has failed (status: `error`)
- [ ] **Then** a Retry button (🔄) is visible
- [ ] **Given** an upload is active, paused, or pending
- [ ] **Then** a Cancel button (✕) is visible
- [ ] **And** small file uploads (<50MB) do NOT show the Pause button
- [ ] **And** buttons are consistent with PrimeEditz design system

---

## 📁 Files to Update

| File                                              | Change                                    |
| ------------------------------------------------- | ----------------------------------------- |
| `src/components/shared/upload-status-overlay.tsx` | Add action buttons based on upload status |

---

## 🔧 Implementation Details

### Button Visibility Matrix

| Status              | Pause | Resume | Retry | Cancel |
| ------------------- | ----- | ------ | ----- | ------ |
| `pending`           | ❌    | ❌     | ❌    | ✅     |
| `uploading` (TUS)   | ✅    | ❌     | ❌    | ✅     |
| `uploading` (small) | ❌    | ❌     | ❌    | ✅     |
| `paused`            | ❌    | ✅     | ❌    | ✅     |
| `processing`        | ❌    | ❌     | ❌    | ❌     |
| `error`             | ❌    | ❌     | ✅    | ✅     |
| `completed`         | ❌    | ❌     | ❌    | ❌     |

### UI Design

- Use icon-only buttons with tooltips (consistent with existing PrimeEditz patterns)
- Place buttons inline with the progress bar, right-aligned
- Use `lucide-react` icons: `Pause`, `Play`, `RotateCcw`, `X`
- Subtle hover effects matching the design system

### How to Determine TUS vs Small

Check if the file size is above `SMALL_FILE_THRESHOLD` (50MB) — the same constant used in `use-upload-manager.ts`. Only TUS uploads can be paused.

---

## 🚀 Definition of Done

- [ ] Pause button visible for active TUS uploads
- [ ] Resume button visible for paused uploads
- [ ] Retry button visible for failed uploads
- [ ] Cancel button removes upload from queue
- [ ] Small file uploads do not show Pause
- [ ] Buttons use PrimeEditz design system (icon buttons, tooltips)
- [ ] Responsive layout — buttons don't break on mobile
- [ ] `pnpm build` passes
- [ ] Story marked as `done`

---

**Previous Story**: 29-3 - Pause/resume upload state
**Next Story**: 29-5 - Upload recovery on init
