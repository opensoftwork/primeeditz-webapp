# Story 29.3: Pause/Resume Upload State

**Epic**: Epic 29 - Resumable Upload Enhancement
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-03-02
**Priority**: MEDIUM — User-facing control for managing upload bandwidth

---

## 📋 User Story

**As a** user uploading a large file,
**I want** to pause my upload and resume it later,
**So that** I can free up bandwidth for other tasks without losing progress.

---

## ✅ Acceptance Criteria

- [ ] **Given** a TUS upload is in progress (file >50MB)
- [ ] **When** the user clicks "Pause"
- [ ] **Then** the upload stops transmitting data
- [ ] **And** the status changes from `uploading` to `paused`
- [ ] **And** the progress bar freezes at the current position
- [ ] **When** the user clicks "Resume"
- [ ] **Then** the upload continues from where it was paused
- [ ] **And** the status returns to `uploading`
- [ ] **Note** small file uploads (<50MB) cannot be paused (no pause button shown)

---

## 📁 Files to Update

| File                              | Change                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/stores/upload-store.ts`      | Add `"paused"` to `UploadStatus`, add `pauseUpload`/`resumeUpload` actions, add `tusInstances` map |
| `src/hooks/use-upload-manager.ts` | Store TUS `Upload` instance in `tusInstances` map on creation                                      |

---

## 🔧 Implementation Details

### Upload Store Changes

```typescript
// Update UploadStatus type:
export type UploadStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "completed"
  | "error"
  | "paused";  // NEW

// Add to UploadState (outside Zustand — plain Map, not serialized):
// This is a module-level variable, not in the store state (tus.Upload is not serializable)
const tusInstances = new Map<string, tus.Upload>();

// Export helpers:
export function setTusInstance(id: string, upload: tus.Upload) {
  tusInstances.set(id, upload);
}

export function getTusInstance(id: string): tus.Upload | undefined {
  return tusInstances.get(id);
}

// Add to UploadState interface:
pauseUpload: (id: string) => void;
resumeUpload: (id: string) => void;

// Implementations:
pauseUpload: (id) => {
  const instance = tusInstances.get(id);
  if (instance) {
    instance.abort();  // tus-js-client: stops upload, preserves offset
  }
  set((state) => ({
    items: {
      ...state.items,
      [id]: { ...state.items[id], status: "paused" },
    },
  }));
},

resumeUpload: (id) => {
  const instance = tusInstances.get(id);
  if (instance) {
    instance.start();  // tus-js-client: resumes from paused offset
  }
  set((state) => ({
    items: {
      ...state.items,
      [id]: { ...state.items[id], status: "uploading" },
    },
  }));
},
```

### Upload Manager Changes

When creating a `tus.Upload` instance in `processUpload`, call `setTusInstance(id, upload)` to store the reference.

---

## 🚀 Definition of Done

- [ ] `"paused"` is a valid `UploadStatus`
- [ ] `pauseUpload(id)` aborts TUS upload and sets status
- [ ] `resumeUpload(id)` restarts TUS upload and sets status
- [ ] TUS upload instances tracked in module-level Map
- [ ] Small file uploads have no pause/resume capability (by design)
- [ ] `pnpm build` passes
- [ ] Story marked as `done`

---

**Previous Story**: 29-2 - Retry failed uploads
**Next Story**: 29-4 - Upload overlay action buttons
