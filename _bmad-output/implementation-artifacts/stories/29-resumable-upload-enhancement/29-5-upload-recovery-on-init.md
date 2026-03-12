# Story 29.5: Upload Recovery on App Initialization

**Epic**: Epic 29 - Resumable Upload Enhancement
**Status**: backlog
**Complexity**: Small-Medium (3 points)
**Created**: 2026-03-02
**Priority**: MEDIUM — Handles the "closed browser during upload" edge case

---

## 📋 User Story

**As a** user who closed the browser during an upload,
**I want** to be notified about interrupted uploads when I return,
**So that** I know to re-select the file and my upload will resume from where it left off.

---

## ✅ Acceptance Criteria

- [ ] **Given** the user closed the browser during a TUS upload
- [ ] **When** the user returns and the app loads
- [ ] **Then** a notification/toast appears: "You have interrupted uploads"
- [ ] **And** guidance is provided: "Re-select the file to resume"
- [ ] **And** once the file is re-selected, auto-resume kicks in (Story 29.1)
- [ ] **Given** TUS fingerprints are older than 24 hours
- [ ] **Then** they are cleaned up automatically (stale data removal)

---

## 📁 Files to Create/Update

| File                                     | Change                       |
| ---------------------------------------- | ---------------------------- |
| New: `src/lib/upload/upload-recovery.ts` | Recovery detection utility   |
| `src/hooks/use-upload-manager.ts`        | Call recovery check on mount |

---

## 🔧 Implementation Details

### How TUS Fingerprints Work

`tus-js-client` stores keys in `localStorage` with the format:

- Key: `tus::${fingerprint}` (e.g., `tus::abc123xyz`)
- Value: JSON string containing `{ uploadUrl, size, metadata, ... }`

### Recovery Detection

```typescript
// src/lib/upload/upload-recovery.ts

const TUS_KEY_PREFIX = "tus::";
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export function detectInterruptedUploads(): {
  count: number;
  staleCount: number;
} {
  let count = 0;
  let staleCount = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(TUS_KEY_PREFIX)) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "");
        // Check if fingerprint is stale
        if (
          data.creationTime &&
          Date.now() - data.creationTime > STALE_THRESHOLD_MS
        ) {
          localStorage.removeItem(key);
          staleCount++;
        } else {
          count++;
        }
      } catch {
        // Corrupt entry — remove it
        localStorage.removeItem(key!);
        staleCount++;
      }
    }
  }

  return { count, staleCount };
}
```

### Important Limitation

When the browser is closed, the `File` object reference is lost (it's a JavaScript object in memory). The user **must re-select the file** for the upload to resume. However, once re-selected, `tus-js-client`'s `findPreviousUploads()` (Story 29.1) will match the fingerprint and resume from the stored offset.

This story is about **informing the user** that interrupted uploads exist, so they know to take action.

---

## 🚀 Definition of Done

- [ ] `detectInterruptedUploads()` utility created
- [ ] Called on app initialization (upload manager mount)
- [ ] Toast notification shown when interrupted uploads are detected
- [ ] Stale fingerprints (>24 hours) cleaned up automatically
- [ ] No false positives for completed uploads
- [ ] `pnpm build` passes
- [ ] Story marked as `done`

---

**Previous Story**: 29-4 - Upload overlay action buttons
**Next Story**: None (last in epic)
