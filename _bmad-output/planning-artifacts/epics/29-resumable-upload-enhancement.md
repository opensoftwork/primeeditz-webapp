# Epic 29: Resumable Upload Enhancement

**Epic Owner**: Platform Infrastructure
**Status**: Planning
**Created**: 2026-03-02
**Complexity**: Medium (Client-side enhancements to existing TUS infrastructure)
**Priority**: P1 — Reliability improvement for core file upload workflow

---

## 📋 Epic Summary

Enhance the existing upload pipeline to **gracefully handle interruptions** — enabling auto-resume after network drops, manual pause/resume controls, and robust retry on failure. Currently, if an upload stops mid-way (network drop, browser tab close, client crash), the user must restart from scratch.

### Context

The codebase already has partial TUS (resumable upload protocol) foundations:

- **`tus-js-client`** is installed and used in `src/hooks/use-upload-manager.ts`
- **`@tus/server`** with `@tus/s3-store` is configured in `src/lib/upload/tus-server.ts` pointing at MinIO
- The upload manager splits files: small (<50MB) use pre-signed PUT, large (>50MB) use TUS
- TUS `retryDelays` are configured: `[0, 3000, 5000, 10000, 20000]`
- The upload store (`src/stores/upload-store.ts`) tracks `pending | uploading | processing | completed | error`

### What's Missing

1. **No auto-resume** — `tus-js-client` stores upload fingerprints in `localStorage`, but the code never calls `findPreviousUploads()` to check for interrupted uploads on page load
2. **No pause/resume controls** — No `paused` state in the upload store, no UI controls, no stored references to live `tus.Upload` instances
3. **No upload instance persistence** — Creating a new `tus.Upload` each time without checking for prior progress
4. **No retry UI for failed uploads** — Error status is shown but no way to retry without re-selecting the file

### Target State

- **Auto-resume**: On page load or reconnection, previously interrupted uploads resume automatically from where they left off
- **Manual pause/resume**: Users can pause an active upload and resume it later
- **Retry**: Failed uploads can be retried with a single click
- **Progress persistence**: Upload progress survives page refreshes and tab closures (for TUS uploads)

### Technical Architecture

```
┌─────────────────────────────────────────────┐
│  Upload Store (Zustand)                     │
│  + "paused" status                          │
│  + tusInstances: Map<id, tus.Upload>        │
│  + pauseUpload(id)                          │
│  + resumeUpload(id)                         │
│  + retryUpload(id)                          │
│  + recoverUploads() — on init               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  use-upload-manager.ts                      │
│  + findPreviousUploads() before start()     │
│  + Maintain Upload instance map             │
│  + Expose pause/resume/retry actions        │
│  + Store Upload instance ref on addUpload   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  TUS Server (existing @tus/server)          │
│  → S3Store → MinIO                          │
│  (No changes needed on server side)         │
└─────────────────────────────────────────────┘
```

**Key Insight**: The server-side `@tus/s3-store` already handles multipart uploads natively via S3's multipart API. **No server-side changes are required** — all work is client-side.

---

## 🎯 User Outcomes

| Role         | Outcome                                                          |
| ------------ | ---------------------------------------------------------------- |
| **Any User** | Interrupted uploads resume automatically — no file re-selection  |
| **Any User** | Can pause an active upload and resume it when convenient         |
| **Any User** | Failed uploads can be retried with a single click                |
| **Any User** | Upload progress is preserved across page refreshes (TUS uploads) |
| **Admin**    | Reduced support requests about "lost" uploads                    |

---

## 🗂️ Stories

### Phase A: Core Auto-Resume (Invisible to User — Highest Impact)

| Story | Description                                           | Points | Priority |
| ----- | ----------------------------------------------------- | ------ | -------- |
| 29.1  | Add `findPreviousUploads()` + auto-resume to TUS flow | 3      | HIGH     |
| 29.2  | Add `retryUpload` action to upload store + manager    | 2      | HIGH     |

### Phase B: Pause/Resume Controls (User-Facing)

| Story | Description                                                 | Points | Priority |
| ----- | ----------------------------------------------------------- | ------ | -------- |
| 29.3  | Add `paused` status + `pauseUpload`/`resumeUpload` to store | 2      | MEDIUM   |
| 29.4  | Upload overlay UI — pause/resume/retry buttons              | 3      | MEDIUM   |

### Phase C: Recovery on Page Load

| Story | Description                           | Points | Priority |
| ----- | ------------------------------------- | ------ | -------- |
| 29.5  | Upload recovery on app initialization | 3      | MEDIUM   |

**Total Points**: 13

---

## 📊 Detailed Story Specifications

### Story 29.1: Auto-Resume for TUS Uploads

**Files**:

- `src/hooks/use-upload-manager.ts`

**Changes**:

Before calling `upload.start()`, check for previous uploads:

```typescript
// Current (line 81-118 of use-upload-manager.ts):
const upload = new tus.Upload(file, { ... });
upload.start();

// Target:
const upload = new tus.Upload(file, { ... });
const previousUploads = await upload.findPreviousUploads();
if (previousUploads.length > 0) {
  upload.resumeFromPreviousUpload(previousUploads[0]);
}
upload.start();
```

**Acceptance Criteria**:

- [ ] TUS uploads check for previous upload fingerprints before starting
- [ ] If a previous upload exists, it resumes from where it left off
- [ ] Progress bar reflects resumed position (not starting from 0%)
- [ ] No behavior change for small file pre-signed PUT uploads (they don't support resumption)
- [ ] `tus-js-client` default fingerprinting (localStorage) is used

---

### Story 29.2: Retry Failed Uploads

**Files**:

- `src/stores/upload-store.ts`
- `src/hooks/use-upload-manager.ts`

**Changes**:

Add `retryUpload(id)` to the upload store that resets the status to `pending` and re-triggers `processUpload`. Store the `File` reference so retry doesn't require re-selecting the file.

**Acceptance Criteria**:

- [ ] Upload store has a `retryUpload(id: string)` action
- [ ] Retry resets status from `error` to `pending` and re-triggers upload
- [ ] File reference is preserved in memory for retry
- [ ] TUS uploads on retry still benefit from fingerprint-based auto-resume (Story 29.1)

---

### Story 29.3: Pause/Resume Upload State

**Files**:

- `src/stores/upload-store.ts`
- `src/hooks/use-upload-manager.ts`

**Changes**:

1. Add `"paused"` to the `UploadStatus` type union
2. Add `tusInstances: Map<string, tus.Upload>` to store live TUS upload references
3. Add `pauseUpload(id)` → calls `tusInstances.get(id)?.abort()` + sets status to `paused`
4. Add `resumeUpload(id)` → calls `tusInstances.get(id)?.start()` + sets status to `uploading`

**Note**: Pause/resume only applies to TUS uploads (large files). Small file pre-signed PUT uploads are fire-and-forget.

**Acceptance Criteria**:

- [ ] `"paused"` is a valid `UploadStatus`
- [ ] `pauseUpload(id)` aborts the TUS upload and sets status to `paused`
- [ ] `resumeUpload(id)` restarts the TUS upload from where it was paused
- [ ] Small file uploads cannot be paused (UI hides pause button for them)

---

### Story 29.4: Upload Overlay UI — Pause/Resume/Retry Buttons

**Files**:

- `src/components/shared/upload-status-overlay.tsx`

**Changes**:

Add action buttons to the upload overlay/queue display:

- **Pause button** (⏸️) — shown when status is `uploading` and file is large (TUS)
- **Resume button** (▶️) — shown when status is `paused`
- **Retry button** (🔄) — shown when status is `error`
- **Cancel button** (✕) — shown for any active/paused upload

**Acceptance Criteria**:

- [ ] Pause button visible for active TUS uploads
- [ ] Resume button visible for paused uploads
- [ ] Retry button visible for failed uploads
- [ ] Cancel button removes the upload from the queue
- [ ] Buttons are consistent with PrimeEditz design system (icon buttons, tooltips)
- [ ] Responsive layout — buttons don't break on mobile

---

### Story 29.5: Upload Recovery on App Initialization

**Files**:

- `src/hooks/use-upload-manager.ts`
- New: `src/lib/upload/upload-recovery.ts`

**Changes**:

On app startup (or when the upload manager hook mounts), check `localStorage` for TUS fingerprints that represent interrupted uploads. Show a notification/toast: "You have interrupted uploads. Would you like to resume them?"

**Note**: Since `tus-js-client` stores fingerprints automatically, we can detect them via the `localStorage` keys. However, we lose the `File` object reference on page close — so recovery requires the user to re-select the file, after which the TUS client will auto-resume from the stored offset.

**Acceptance Criteria**:

- [ ] On app load, detect incomplete TUS uploads from localStorage fingerprints
- [ ] Show a notification informing the user of interrupted uploads
- [ ] Provide guidance: "Please re-select the file to resume upload"
- [ ] Once file is re-selected, auto-resume kicks in (Story 29.1)
- [ ] Stale fingerprints (>24 hours old) are cleaned up automatically

---

## 🧩 Affected Components Map

### Client-Side (No Server Changes Needed)

| File                                              | Change                                  |
| ------------------------------------------------- | --------------------------------------- |
| `src/stores/upload-store.ts`                      | Add `paused` status, pause/resume/retry |
| `src/hooks/use-upload-manager.ts`                 | findPreviousUploads, instance tracking  |
| `src/components/shared/upload-status-overlay.tsx` | Pause/resume/retry action buttons       |
| New: `src/lib/upload/upload-recovery.ts`          | Recovery detection on app init          |

### Server-Side (No Changes)

| File                           | Change |
| ------------------------------ | ------ |
| `src/lib/upload/tus-server.ts` | None   |
| `convex/functions/storage/`    | None   |

---

## 🔗 Dependencies

| This Epic | Depends On                     | Notes                                    |
| --------- | ------------------------------ | ---------------------------------------- |
| 29.x      | Epic 19 (File Upload Refactor) | Builds on existing upload infrastructure |
| 29.4      | None                           | UI enhancement to existing overlay       |
| 29.5      | 29.1                           | Recovery depends on auto-resume working  |

---

## 🔄 Status Updates

| Date       | Status   | Notes                                             |
| ---------- | -------- | ------------------------------------------------- |
| 2026-03-02 | Planning | Created from party-mode infrastructure discussion |

---

**Previous Epic**: Epic 28 - Admin Internal Project Flow
**Next Epic**: Epic 30 - Internal Network Asset Routing
