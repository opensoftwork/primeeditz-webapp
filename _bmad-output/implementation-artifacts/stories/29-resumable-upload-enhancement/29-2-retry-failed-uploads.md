# Story 29.2: Retry Failed Uploads

**Epic**: Epic 29 - Resumable Upload Enhancement
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-03-02
**Priority**: HIGH — Users currently have no way to retry a failed upload

---

## 📋 User Story

**As a** user whose upload failed,
**I want** to retry the upload with a single click without re-selecting the file,
**So that** I can recover from transient errors quickly.

---

## ✅ Acceptance Criteria

- [ ] **Given** an upload has failed (status: `error`)
- [ ] **When** the user clicks "Retry"
- [ ] **Then** the upload restarts from where it left off (TUS) or from scratch (small file)
- [ ] **And** the error status is cleared and replaced with `uploading`
- [ ] **And** the file reference is preserved — no file re-selection needed

---

## 📁 Files to Update

| File                              | Change                                         |
| --------------------------------- | ---------------------------------------------- |
| `src/stores/upload-store.ts`      | Add `retryUpload(id: string)` action           |
| `src/hooks/use-upload-manager.ts` | Expose retry via `processUpload` re-invocation |

---

## 🔧 Implementation Details

### Upload Store Changes

```typescript
// Add to UploadState interface:
retryUpload: (id: string) => void;

// Implementation:
retryUpload: (id) => {
  set((state) => ({
    items: {
      ...state.items,
      [id]: {
        ...state.items[id],
        progress: 0,
        status: "pending",
        error: undefined,
      },
    },
  }));
},
```

### Upload Manager Changes

The `processUpload` function is already designed to process an item — retry simply resets the status and re-calls `processUpload`. The `File` object reference survives in the store's `items` record because it's held in memory.

**Important**: For TUS uploads, retry benefits from Story 29.1 (auto-resume) since the fingerprint is still in localStorage. So retry + auto-resume = resume from interrupted byte.

---

## 🚀 Definition of Done

- [ ] `retryUpload(id)` action added to upload store
- [ ] Retry resets status from `error` to `pending` and re-triggers upload
- [ ] File reference preserved — no file picker needed
- [ ] TUS retries leverage auto-resume from Story 29.1
- [ ] `pnpm build` passes
- [ ] Story marked as `done`

---

**Previous Story**: 29-1 - Auto-resume TUS uploads
**Next Story**: 29-3 - Pause/resume upload state
