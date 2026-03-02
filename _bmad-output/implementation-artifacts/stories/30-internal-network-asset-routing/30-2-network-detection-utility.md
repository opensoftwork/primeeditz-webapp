# Story 30.2: Network Detection Utility

**Epic**: Epic 30 - Internal Network Asset Routing
**Status**: backlog
**Complexity**: Small-Medium (3 points)
**Created**: 2026-03-02
**Priority**: HIGH — Core utility that all other internal routing stories depend on
**Depends On**: Story 30.1 (must PASS)

---

## 📋 User Story

**As a** web application,
**I want** to detect whether the current user is on the same local network as the object store,
**So that** I can route asset requests through the faster internal path when available.

---

## ✅ Acceptance Criteria

- [ ] **Given** `NEXT_PUBLIC_MINIO_INTERNAL_URL` is configured
- [ ] **When** the app loads
- [ ] **Then** a health probe is sent to the internal MinIO endpoint with a 2.5s timeout
- [ ] **And** if reachable, `isOnInternalNetwork()` returns `true`
- [ ] **And** the result is cached in `sessionStorage` for the duration of the session
- [ ] **Given** `NEXT_PUBLIC_MINIO_INTERNAL_URL` is NOT configured
- [ ] **Then** `isOnInternalNetwork()` returns `false` immediately (no probe sent)
- [ ] **Given** the probe times out or fails
- [ ] **Then** `isOnInternalNetwork()` returns `false` (fallback to public)
- [ ] **And** the probe does NOT block app rendering

---

## 📁 Files to Create

| File                                     | Change                    |
| ---------------------------------------- | ------------------------- |
| New: `src/lib/network/internal-route.ts` | Network detection utility |

---

## 🔧 Implementation Details

```typescript
// src/lib/network/internal-route.ts

const INTERNAL_MINIO_URL = process.env.NEXT_PUBLIC_MINIO_INTERNAL_URL;
const PUBLIC_MINIO_URL = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
const SESSION_KEY = "pe_internal_network";
const PROBE_TIMEOUT_MS = 2500;

let isInternalReachable: boolean | null = null;

/**
 * Run a one-time health probe to detect if the user is on the same
 * LAN as the MinIO object store. Results are cached per session.
 *
 * Call this on app initialization. It is non-blocking.
 */
export async function detectInternalNetwork(): Promise<boolean> {
  // No internal URL configured — skip entirely
  if (!INTERNAL_MINIO_URL) {
    isInternalReachable = false;
    return false;
  }

  // Already probed this session
  if (isInternalReachable !== null) return isInternalReachable;

  // Check sessionStorage for cached result (tab restore)
  const cached = sessionStorage.getItem(SESSION_KEY);
  if (cached !== null) {
    isInternalReachable = cached === "true";
    return isInternalReachable;
  }

  // Run the health probe
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

    await fetch(`${INTERNAL_MINIO_URL}/minio/health/live`, {
      signal: controller.signal,
      mode: "no-cors", // Avoid CORS issues — we only care about reachability
    });

    clearTimeout(timeoutId);
    isInternalReachable = true;
  } catch {
    isInternalReachable = false;
  }

  sessionStorage.setItem(SESSION_KEY, String(isInternalReachable));
  return isInternalReachable;
}

/**
 * Synchronous check — returns cached result from the last probe.
 * Returns false if no probe has been run yet.
 */
export function isOnInternalNetwork(): boolean {
  if (isInternalReachable !== null) return isInternalReachable;

  // Check sessionStorage as fallback
  const cached = sessionStorage.getItem(SESSION_KEY);
  return cached === "true";
}

/**
 * Get the preferred MinIO base URL based on network detection.
 */
export function getPreferredMinioBase(): string {
  if (isOnInternalNetwork() && INTERNAL_MINIO_URL) return INTERNAL_MINIO_URL;
  return PUBLIC_MINIO_URL || "";
}
```

### Where to Call `detectInternalNetwork()`

Call it in the app's root layout or a top-level provider — fire-and-forget:

```typescript
// In app layout or a useEffect in a root component:
useEffect(() => {
  detectInternalNetwork(); // Non-blocking, sets cache
}, []);
```

---

## 🚀 Definition of Done

- [ ] `src/lib/network/internal-route.ts` created with all three exports
- [ ] `detectInternalNetwork()` called on app init
- [ ] Probe has a 2.5s timeout and does not block rendering
- [ ] Result cached in `sessionStorage`
- [ ] Returns `false` when `NEXT_PUBLIC_MINIO_INTERNAL_URL` is not set
- [ ] `pnpm build` passes
- [ ] Story marked as `done`

---

**Previous Story**: 30-1 - Dokploy LAN validation
**Next Story**: 30-3 - Dual-endpoint signed URLs
