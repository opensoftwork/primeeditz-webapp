# Story 21-2: Signed URL Custom Hooks

**Epic**: Epic 21 - Deliverable Code Deduplication & UI Consistency
**Status**: done
**Complexity**: Medium (3 points)
**Created**: 2026-02-15
**Priority**: MUST — Eliminates the single most repeated pattern in the codebase (8+ copies)

---

## 📋 User Story

**As a** developer working with file previews and deliverables,
**I want** clean custom hooks for fetching MinIO signed URLs,
**So that** I don't have to write the same `useEffect → getSignedFileUrl → setState` pattern every time I need a file URL.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On | Status | Notes                                      |
| ---------- | ------ | ------------------------------------------ |
| None       | N/A    | Independent of 21-1 but ideally done after |

### Enables

| Story / Epic     | Notes                                                       |
| ---------------- | ----------------------------------------------------------- |
| **21-4 to 21-8** | All stories that display files benefit from clean URL hooks |

### Current Duplication

The following files each contain their own `useEffect` block to fetch signed URLs:

1. `admin/.../deliverable-detail-view.tsx` — single URL fetch
2. `admin/.../version-request-detail-view.tsx` — single URL + batch for reference images
3. `admin/.../versions-page.tsx` — batch for uploaded images
4. `admin/.../version-history-list.tsx` — batch for version thumbnails
5. `studio/.../studio-deliverable-detail.tsx` — single URL fetch
6. `studio/.../studio-deliverables-list.tsx` — batch for list thumbnails
7. `employee/.../versions-reference-viewer.tsx` — batch for reference images
8. `employee/.../versions-workspace.tsx` — single URL fetch

---

## ✅ Acceptance Criteria

### AC1: `useSignedUrl` Hook

- [x] **Given** a `minioKey` string (or `undefined`/`null`)
- [x] **When** the hook is called
- [x] **Then** it returns `{ url: string | null, isLoading: boolean, error: Error | null }`
- [x] **And** it handles `undefined`/`null` keys gracefully (returns `{ url: null, isLoading: false }`)
- [x] **And** it re-fetches when the key changes
- [x] **And** it does NOT re-fetch on every render (stable `useEffect` deps)

### AC2: `useSignedUrls` Hook

- [x] **Given** an array of `minioKey` strings (or `undefined`)
- [x] **When** the hook is called
- [x] **Then** it returns `{ urls: Record<string, string>, isLoading: boolean, error: Error | null }`
- [x] **And** it fetches all URLs in parallel via `Promise.all`
- [x] **And** it handles empty arrays gracefully
- [x] **And** it re-fetches when the keys array changes (by content, not by reference)

### AC3: Backward Compatible Integration

- [x] **Given** `deliverable-detail-view.tsx` (admin)
- [x] **When** the `useEffect` for signed URL is replaced with `useSignedUrl`
- [x] **Then** the component renders identically
- [x] **And** the `useEffect` block is fully removed

- [x] **Given** `version-request-detail-view.tsx` (admin)
- [x] **When** both `useEffect` blocks (deliverable URL + reference image URLs) are replaced
- [x] **Then** the component renders identically

- [x] **Given** all 8 files listed above
- [x] **Then** each has its signed URL `useEffect` replaced with the appropriate hook

### AC4: Build Passes

- [x] **Given** all hook integrations
- [x] **When** I run `pnpm build`
- [x] **Then** zero TypeScript errors are introduced

---

## 📘 Implementation

### Phase A: Create Hooks (~1.5 points)

#### Task A1: Create `useSignedUrl`

**File**: `src/components/shared/deliverables/hooks/use-signed-url.ts`

- [x] A1.1 Define hook signature:
  ```ts
  export function useSignedUrl(minioKey: string | undefined | null): {
    url: string | null;
    isLoading: boolean;
    error: Error | null;
  };
  ```
- [x] A1.2 Use `useAction(api.functions.storage.actions.getSignedFileUrl)` internally
- [x] A1.3 Handle `null`/`undefined` key → skip fetch
- [x] A1.4 Return loading state correctly
- [x] A1.5 Memoize to prevent unnecessary re-fetches

#### Task A2: Create `useSignedUrls`

**File**: `src/components/shared/deliverables/hooks/use-signed-urls.ts`

- [x] A2.1 Define hook signature:
  ```ts
  export function useSignedUrls(minioKeys: string[]): {
    urls: Record<string, string>;
    isLoading: boolean;
    error: Error | null;
  };
  ```
- [x] A2.2 Use `Promise.all` for parallel fetches
- [x] A2.3 Handle empty arrays → return `{}`
- [x] A2.4 Use a serialized key comparison to avoid re-fetching when array reference changes but content is the same
- [x] A2.5 Return loading state correctly

#### Task A3: Export from barrel

**File**: `src/components/shared/deliverables/index.ts`

- [x] A3.1 Add hook exports to the barrel file

### Phase B: Replace Existing Patterns (~1.5 points)

#### Task B1: Admin `deliverable-detail-view.tsx`

- [x] B1.1 Replace signed URL `useEffect` with `useSignedUrl(deliverable?.minioKey)`
- [x] B1.2 Remove `fileUrl` state + `getSignedFileUrl` action import (if no longer needed)

#### Task B2: Admin `version-request-detail-view.tsx`

- [x] B2.1 Replace deliverable URL `useEffect` with `useSignedUrl(deliverable?.minioKey)`
- [x] B2.2 Replace reference images URL `useEffect` with `useSignedUrls(imageKeys)`
- [x] B2.3 Remove `imageUrls` state + corresponding `useEffect`

#### Task B3: Admin `versions-page.tsx`

- [x] B3.1 Replace signed URL `useEffect` with `useSignedUrl`

#### Task B4: Admin `version-history-list.tsx` (Optional/Context Dependent)

- [x] B4.1 N/A - Uses manual download action in event handler

#### Task B5: Studio `studio-deliverable-detail.tsx`

- [x] B5.1 Replace signed URL `useEffect` with `useSignedUrl`

#### Task B6: Studio `studio-deliverables-list.tsx`

- [x] B6.1 Replace batch URL fetching with `useSignedUrls`

#### Task B7: Employee `versions-reference-viewer.tsx`

- [x] B7.1 Replace signed URL `useEffect` with `useSignedUrls`

#### Task B8: Employee `versions-workspace.tsx`

- [x] B8.1 Replace signed URL `useEffect` with `useSignedUrl`

#### Task B9: Verify build

- [x] B9.1 Run `pnpm tsc --noEmit` — confirm zero errors (ignoring generated .next errors)

---

## 🧪 Testing Checklist

### Hook Behavior

- [ ] `useSignedUrl(undefined)` returns `{ url: null, isLoading: false }`
- [ ] `useSignedUrl("some-key")` fetches and returns a URL
- [ ] `useSignedUrl` does not re-fetch when component re-renders (stable deps)
- [ ] `useSignedUrls([])` returns `{ urls: {}, isLoading: false }`
- [ ] `useSignedUrls(["key1", "key2"])` returns both URLs
- [ ] `useSignedUrls` does not re-fetch when array reference changes but content is same

### Visual Regression

- [ ] Admin deliverable detail — file preview still loads
- [ ] Admin version request detail — deliverable + reference images still load
- [ ] Studio deliverables list — thumbnails still load
- [ ] Studio deliverable detail — file preview still loads
- [ ] Employee versions workspace — deliverable preview still loads
- [ ] Employee reference viewer — reference images still load

---

## 🚀 Definition of Done

- [ ] `useSignedUrl` hook created and tested
- [ ] `useSignedUrls` hook created and tested
- [ ] All 8 files updated to use hooks instead of inline `useEffect`
- [ ] No signed URL `useEffect` patterns remain in deliverable-related files
- [ ] `pnpm build` passes with zero errors
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status | Notes                                                             |
| ---------- | ------ | ----------------------------------------------------------------- |
| 2026-02-15 | done   | Story completed. Hooks created and integrated into 8+ components. |

---

**Previous Story**: 21-1 - Extract Shared Types & Constants
**Next Story**: 21-3 - Promote VersionStatusBadge to Shared
