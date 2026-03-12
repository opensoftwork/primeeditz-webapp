# Story 29.1: Auto-Resume for TUS Uploads

**Epic**: Epic 29 - Resumable Upload Enhancement
**Status**: backlog
**Complexity**: Small-Medium (3 points)
**Created**: 2026-03-02
**Priority**: HIGH — Solves 80% of the upload interruption pain with minimal code change

---

## 📋 User Story

**As a** user uploading large files,
**I want** my uploads to automatically resume from where they left off after an interruption,
**So that** I don't have to restart a 500MB upload from scratch because of a network hiccup.

---

## ✅ Acceptance Criteria

- [ ] **Given** a TUS upload is in progress (file >50MB)
- [ ] **When** the upload is interrupted (network drop, page refresh)
- [ ] **And** the user re-selects the same file
- [ ] **Then** the upload resumes from the last uploaded byte (not from 0%)
- [ ] **And** the progress bar reflects the resumed position accurately
- [ ] **And** no behavior change occurs for small file pre-signed PUT uploads (<50MB)

---

## 📁 Files to Update

| File                              | Change                                                                             |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `src/hooks/use-upload-manager.ts` | Add `findPreviousUploads()` + `resumeFromPreviousUpload()` before `upload.start()` |

---

## 🔧 Implementation Details

### Current Code (line ~81-118 of `use-upload-manager.ts`)

```typescript
// CURRENT: fire-and-forget
const upload = new tus.Upload(file, { ... });
upload.start();
```

### Target Code

```typescript
// TARGET: check for previous uploads first
const upload = new tus.Upload(file, { ... });

// tus-js-client stores fingerprints in localStorage by default
const previousUploads = await upload.findPreviousUploads();
if (previousUploads.length > 0) {
  // Resume from the most recent interrupted upload
  upload.resumeFromPreviousUpload(previousUploads[0]);
}
upload.start();
```

### How It Works

1. `tus-js-client` generates a **fingerprint** for each upload based on file name, size, type, and other metadata
2. This fingerprint is stored in `localStorage` along with the TUS upload URL
3. `findPreviousUploads()` checks localStorage for matching fingerprints
4. `resumeFromPreviousUpload()` sets the upload URL to the previous one, allowing the TUS server to resume from the last offset
5. The `@tus/s3-store` on the server already supports multipart resume natively — **no server changes needed**

---

## 🚀 Definition of Done

- [ ] `findPreviousUploads()` called before every TUS `upload.start()`
- [ ] If a previous upload exists, `resumeFromPreviousUpload()` is called
- [ ] Progress bar starts from the resumed position (e.g., 45% if interrupted at 45%)
- [ ] Small file uploads (<50MB pre-signed PUT) are unaffected
- [ ] Tested: interrupt a large upload, re-select the file, verify it resumes
- [ ] `pnpm build` passes
- [ ] Story marked as `done`

---

**Previous Story**: None (first in epic)
**Next Story**: 29-2 - Retry failed uploads
