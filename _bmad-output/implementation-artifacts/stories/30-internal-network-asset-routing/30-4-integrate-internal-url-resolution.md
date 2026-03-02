# Story 30.4: Integrate Internal URL Resolution Across Asset Hooks

**Epic**: Epic 30 - Internal Network Asset Routing
**Status**: backlog
**Complexity**: Small-Medium (3 points)
**Created**: 2026-03-02
**Priority**: HIGH — Connects detection (30.2) and backend (30.3) to actual asset loading
**Depends On**: Stories 30.2 and 30.3

---

## 📋 User Story

**As a** user on the internal network,
**I want** all images and assets to load from the LAN automatically,
**So that** I experience 20-100x faster asset loading without changing my workflow.

---

## ✅ Acceptance Criteria

- [ ] **Given** the network detection (30.2) determines the user is on the LAN
- [ ] **When** any component requests a signed URL
- [ ] **Then** the `useInternal: true` flag is passed to the Convex action
- [ ] **And** assets load from the internal MinIO endpoint
- [ ] **Given** the user is NOT on the LAN
- [ ] **Then** assets load from the public Cloudflare-proxied endpoint (current behavior)
- [ ] **And** no visual or functional change to the user

---

## 📁 Files to Update

| File                                 | Change                                         |
| ------------------------------------ | ---------------------------------------------- |
| Signed URL hooks / utility functions | Pass `useInternal: isOnInternalNetwork()` flag |

---

## 🔧 Implementation Details

### Identify All Signed URL Call Sites

Search for all places that call `getSignedFileUrl` or `getSignedFileUrls` actions:

```bash
grep -r "getSignedFileUrl\|getSignedFileUrls" src/ --include="*.ts" --include="*.tsx"
```

### Update Pattern

For each call site, add the `useInternal` flag:

```typescript
// BEFORE:
const url = await getSignedFileUrlAction({ storageKey });

// AFTER:
import { isOnInternalNetwork } from "@/lib/network/internal-route";

const url = await getSignedFileUrlAction({
  storageKey,
  useInternal: isOnInternalNetwork(),
});
```

### Centralized Approach (Preferred)

If signed URL calls are centralized in a custom hook (e.g., `useSignedUrl`), the change can be made in a single place. Otherwise, each call site needs updating.

### Next.js Image Component

If `next/image` is used with MinIO URLs, the `next.config.ts` remote patterns may need updating to include the internal hostname. Check if internal URLs flow through `next/image` or are used directly in `<img>` tags.

---

## 🚀 Definition of Done

- [ ] All signed URL call sites pass `useInternal` flag
- [ ] Assets load from internal endpoint when on LAN
- [ ] Assets load from public endpoint when remote
- [ ] `next.config.ts` updated if internal URLs flow through `next/image`
- [ ] No visual change to the user — just faster loading
- [ ] Tested on LAN: assets load from internal IP
- [ ] Tested off LAN: assets load from public domain (unchanged)
- [ ] `pnpm build` passes
- [ ] Story marked as `done`

---

**Previous Story**: 30-3 - Dual-endpoint signed URLs
**Next Story**: 30-5 - Internal network indicator badge
