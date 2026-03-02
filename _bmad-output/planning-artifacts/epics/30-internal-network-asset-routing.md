# Epic 30: Internal Network Asset Routing

**Epic Owner**: Platform Infrastructure
**Status**: Planning
**Created**: 2026-03-02
**Complexity**: Medium-High (Infrastructure config + client-side detection + URL resolution)
**Priority**: P1 — Performance multiplier for core team workflows

---

## 📋 Epic Summary

Enable the PrimeEditz web app to **detect when the user is on the same local network as the object store** (MinIO) and serve assets directly over the LAN instead of routing through Cloudflare and the public internet. This turns a 3-40 second image load into a <0.5 second load for the core team.

### Context: The Problem

Currently, all asset requests (images, deliverables, reference files) are served via:

```
Browser → Cloudflare → Dokploy/Traefik → MinIO → Cloudflare → Browser
```

When the user is on the **same internal network** as the server, data is unnecessarily leaving the building, traveling to Cloudflare's edge, and coming back in. This is like ordering delivery from a restaurant that's in your own building.

### The Impact (Why This Matters)

| Metric                       | Via Cloudflare (Current) | Via LAN (Proposed) | Improvement |
| ---------------------------- | ------------------------ | ------------------ | ----------- |
| **Time to load 50MB image**  | 8-40 seconds             | <0.5 seconds       | **20-100x** |
| **Downloading 5GB project**  | 15-60 minutes            | ~40 seconds        | **20-100x** |
| **Browsing 50 deliverables** | 7-30 min of waiting      | ~20 seconds        | **20-100x** |

**Key insight**: The office LAN runs at ~125 MB/s (gigabit). Typical Indian broadband uploads at 1-6 MB/s. The data is taking a 20-100x slower road when a highway exists.

### Workflows This Unlocks

1. **🔥 Bulk Download** — "Download All" for project folders becomes viable (5GB in 40s vs 60min)
2. **🔥 Instant High-Res Review** — Studio managers can flick through full-resolution deliverables like a local lightbox
3. **🔥 Version Comparison** — Loading two 50MB images side-by-side takes <1s instead of 30+ seconds
4. **Reference Material Browsing** — Employees browse client uploads at local folder speed
5. **Batch Upload to Object Store** — Employee-to-MinIO uploads at LAN speed
6. **Snappier Admin Dashboard** — All thumbnails and previews load instantly

### Target State

- MinIO exposed on the LAN via Dokploy port configuration
- App detects LAN availability on load via a health-check probe
- All signed URLs resolve to internal endpoint when on LAN, public endpoint when remote
- **Zero behavior change** for external/remote users — falls back to current Cloudflare route
- Subtle UI indicator when internal routing is active

---

## 🎯 User Outcomes

| Role            | Outcome                                                      |
| --------------- | ------------------------------------------------------------ |
| **Core Team**   | Assets load 20-100x faster when in the office                |
| **Core Team**   | Bulk download of project assets becomes viable               |
| **Studio**      | Deliverable review workflow is instant — no loading spinners |
| **Employee**    | Reference materials and deliverables load instantly          |
| **Admin**       | Dashboard feels snappy, no waiting on thumbnails             |
| **Remote User** | Zero change — same Cloudflare-proxied experience             |

---

## 🗂️ Stories

### Phase A: Infrastructure Validation (Spike)

| Story | Description                                         | Points | Priority |
| ----- | --------------------------------------------------- | ------ | -------- |
| 30.1  | Dokploy port exposure + LAN reachability validation | 2      | HIGH     |

### Phase B: Core Detection & URL Resolution

| Story | Description                                           | Points | Priority |
| ----- | ----------------------------------------------------- | ------ | -------- |
| 30.2  | Network detection utility (health probe + caching)    | 3      | HIGH     |
| 30.3  | Dual-endpoint signed URL generation in Convex actions | 3      | HIGH     |
| 30.4  | Integrate internal URL resolution across asset hooks  | 3      | HIGH     |

### Phase C: UI Enhancements

| Story | Description                            | Points | Priority |
| ----- | -------------------------------------- | ------ | -------- |
| 30.5  | Internal network indicator badge in UI | 1      | LOW      |

### Phase D: Unlocked Features (Leveraging Internal Routing)

| Story | Description                                            | Points | Priority |
| ----- | ------------------------------------------------------ | ------ | -------- |
| 30.6  | Bulk download feature for project folders/deliverables | 5      | HIGH     |
| 30.7  | Full-resolution deliverable preview carousel           | 3      | MEDIUM   |

**Total Points**: 20

---

## 📊 Detailed Story Specifications

### Story 30.1: Dokploy + LAN Reachability Validation (Spike)

**Type**: Investigation spike — timeboxed to 2 hours

**Tasks**:

1. Open Dokploy dashboard → find the MinIO service
2. Go to **Advanced → Ports** → expose port 9000 on the host (e.g., `9000:9000`)
3. From any machine on the LAN, test:
   ```bash
   curl http://<server-LAN-IP>:9000/minio/health/live
   ```
4. Document the server's LAN IP (`MINIO_INTERNAL_ENDPOINT`)
5. Verify MinIO API responds correctly to S3-compatible requests on the LAN IP
6. Test that pre-signed URLs generated with the internal endpoint work from a LAN browser

**Acceptance Criteria**:

- [ ] MinIO health endpoint reachable on LAN IP
- [ ] Pre-signed GET URLs using internal endpoint load assets in browser on LAN
- [ ] Public Cloudflare route remains unaffected
- [ ] LAN IP and port documented for env configuration

**Outcome**: GO/NO-GO decision for the rest of this epic.

---

### Story 30.2: Network Detection Utility

**File**: New `src/lib/network/internal-route.ts`

**Implementation**:

```typescript
const INTERNAL_MINIO_URL = process.env.NEXT_PUBLIC_MINIO_INTERNAL_URL;
const PUBLIC_MINIO_URL = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;

let isInternalReachable: boolean | null = null;

export async function detectInternalNetwork(): Promise<boolean> {
  if (!INTERNAL_MINIO_URL) return false;
  if (isInternalReachable !== null) return isInternalReachable;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${INTERNAL_MINIO_URL}/minio/health/live`, {
      signal: controller.signal,
      mode: "no-cors",
    });

    clearTimeout(timeoutId);
    isInternalReachable = true;
    sessionStorage.setItem("pe_internal_network", "true");
    return true;
  } catch {
    isInternalReachable = false;
    sessionStorage.setItem("pe_internal_network", "false");
    return false;
  }
}

export function isOnInternalNetwork(): boolean {
  if (isInternalReachable !== null) return isInternalReachable;
  return sessionStorage.getItem("pe_internal_network") === "true";
}

export function getPreferredMinioBase(): string {
  if (isOnInternalNetwork() && INTERNAL_MINIO_URL) return INTERNAL_MINIO_URL;
  return PUBLIC_MINIO_URL || "";
}
```

**Acceptance Criteria**:

- [ ] Health probe runs on app initialization (once per session)
- [ ] Result cached in `sessionStorage` for the session duration
- [ ] Probe has a 2.5s timeout — does not block app load
- [ ] Returns `false` gracefully if `NEXT_PUBLIC_MINIO_INTERNAL_URL` is not configured
- [ ] Exported `isOnInternalNetwork()` and `getPreferredMinioBase()` for use across the app

---

### Story 30.3: Dual-Endpoint Signed URL Generation

**File**: `convex/functions/storage/actions.ts`

**Changes**:

Add a `MINIO_INTERNAL_ENDPOINT` env var and allow signed URL generation to target either endpoint.

```typescript
// In getSignedFileUrl and getSignedFileUrls:
// Accept optional `useInternal` flag
// When true, initialize S3 client with MINIO_INTERNAL_ENDPOINT
// Generate signed URL pointing to internal endpoint

export const getSignedFileUrl = action({
  args: {
    storageKey: v.string(),
    expiresIn: v.optional(v.number()),
    useInternal: v.optional(v.boolean()),
  },
  handler: async (_ctx, args): Promise<string | null> => {
    const endpoint = args.useInternal
      ? process.env.MINIO_INTERNAL_ENDPOINT
      : process.env.MINIO_ENDPOINT;

    // ... generate signed URL using the selected endpoint
  },
});
```

**Environment Variables**:

- `MINIO_INTERNAL_ENDPOINT` — e.g., `http://192.168.1.5:9000`
- Existing `MINIO_ENDPOINT` — continues to work for public URLs

**Acceptance Criteria**:

- [ ] `getSignedFileUrl` accepts optional `useInternal` boolean
- [ ] `getSignedFileUrls` accepts optional `useInternal` boolean
- [ ] When `useInternal: true`, signed URL uses `MINIO_INTERNAL_ENDPOINT`
- [ ] When `useInternal: false` or omitted, signed URL uses `MINIO_ENDPOINT` (current behavior)
- [ ] If `MINIO_INTERNAL_ENDPOINT` is not configured, falls back to public endpoint

---

### Story 30.4: Integrate Internal URL Resolution Across Asset Hooks

**Files**:

- `src/hooks/use-signed-url.ts` (or wherever signed URLs are consumed)
- Any component calling `getSignedFileUrl` / `getSignedFileUrls`

**Changes**:

When calling the signed URL actions, pass `useInternal: isOnInternalNetwork()` from the network detection utility (Story 30.2).

**Acceptance Criteria**:

- [ ] All asset-loading hooks pass the `useInternal` flag based on network detection
- [ ] Assets load from internal endpoint when on LAN
- [ ] Assets load from public endpoint when remote
- [ ] No visual change to the user — just faster loading on LAN

---

### Story 30.5: Internal Network Indicator Badge

**File**: Layout header or status bar component

**Change**: Show a subtle indicator when internal routing is active:

`⚡ Internal Network — Faster Transfers`

Small badge/chip in the header or footer. Only visible when `isOnInternalNetwork()` returns true.

**Acceptance Criteria**:

- [ ] Badge visible when internal network is detected
- [ ] Badge hidden for remote users
- [ ] Subtle styling — does not distract from main UI
- [ ] Tooltip explains: "Assets are loading directly from your local network"

---

### Story 30.6: Bulk Download for Project Folders/Deliverables

**Files**:

- New: `src/components/shared/bulk-download-button.tsx`
- `src/components/modules/projects/detail/folder/folder-detail-view.tsx`
- `src/components/modules/admin/projects/project-detail/deliverables/`

**Implementation**:

A "Download All" / "Download Selected" button on:

1. Folder detail view (project assets)
2. Deliverables list view
3. Reference materials view

Uses internal URLs when on LAN for maximum speed.

**Note**: For many files, this should use the browser's File System Access API or generate a ZIP server-side. For the PoC, downloading files sequentially via anchor tags is acceptable.

**Acceptance Criteria**:

- [ ] "Download All" button on folder detail view
- [ ] "Download Selected" with checkbox selection
- [ ] Downloads use internal URLs when on LAN
- [ ] Progress indicator for bulk download
- [ ] Works with public URLs for remote users (slower but functional)

---

### Story 30.7: Full-Resolution Deliverable Preview Carousel

**Files**:

- Existing deliverable review components
- Lightbox/carousel component

**Enhancement**: When on internal network, load full-resolution images instead of compressed previews. The near-instant loading on LAN makes this viable.

**Acceptance Criteria**:

- [ ] On LAN: Full-resolution images loaded in carousel — no skeleton delay
- [ ] On public network: Current compressed preview behavior (unchanged)
- [ ] Smooth transitions between images
- [ ] Preload next/previous image for instant navigation

---

## 🧩 Affected Components Map

### Infrastructure (One-Time Setup)

| System     | Change                                                             |
| ---------- | ------------------------------------------------------------------ |
| Dokploy    | Expose MinIO port 9000 on host via Advanced → Ports                |
| Env Config | Add `MINIO_INTERNAL_ENDPOINT` and `NEXT_PUBLIC_MINIO_INTERNAL_URL` |

### Backend

| File                                  | Change                              |
| ------------------------------------- | ----------------------------------- |
| `convex/functions/storage/actions.ts` | Dual-endpoint signed URL generation |

### Client-Side

| File                                                  | Change                           |
| ----------------------------------------------------- | -------------------------------- |
| New: `src/lib/network/internal-route.ts`              | Network detection utility        |
| Signed URL hooks                                      | Pass `useInternal` flag          |
| New: `src/components/shared/bulk-download-button.tsx` | Bulk download feature            |
| Layout header                                         | Internal network indicator badge |
| Deliverable carousel                                  | Full-res on LAN                  |

---

## 🔗 Dependencies

| This Epic | Depends On            | Notes                                    |
| --------- | --------------------- | ---------------------------------------- |
| 30.1      | None (infrastructure) | GO/NO-GO gate for rest of epic           |
| 30.2-30.4 | 30.1 validation       | Core implementation                      |
| 30.6      | 30.2 + 30.3           | Bulk download leverages internal routing |
| 30.7      | 30.2 + 30.3           | Full-res preview leverages internal URLs |
| 29.x      | Independent           | Resumable uploads are complementary      |

---

## ⚠️ Risks & Mitigations

| Risk                                       | Mitigation                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| MinIO health endpoint blocked by CORS      | Use `mode: 'no-cors'` on the probe fetch, or add CORS headers to MinIO config  |
| LAN IP changes (DHCP)                      | Use a static IP for the server, or configure via mDNS hostname                 |
| Security: MinIO exposed on LAN without TLS | Acceptable for internal network; signed URLs still time-limited and auth-gated |
| Browser caches wrong network state         | Use `sessionStorage` (per-tab), re-probe on network change events              |

---

## 🔄 Status Updates

| Date       | Status   | Notes                                             |
| ---------- | -------- | ------------------------------------------------- |
| 2026-03-02 | Planning | Created from party-mode infrastructure discussion |

---

**Previous Epic**: Epic 29 - Resumable Upload Enhancement
**Next Epic**: TBD
