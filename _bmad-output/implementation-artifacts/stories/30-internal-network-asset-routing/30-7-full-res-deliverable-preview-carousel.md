# Story 30.7: Full-Resolution Deliverable Preview Carousel

**Epic**: Epic 30 - Internal Network Asset Routing
**Status**: backlog
**Complexity**: Small-Medium (3 points)
**Created**: 2026-03-02
**Priority**: MEDIUM — Enhanced review experience for the core team on LAN
**Depends On**: Stories 30.2 and 30.3

---

## 📋 User Story

**As a** studio manager reviewing deliverables,
**I want** to browse full-resolution images in a fast carousel when I'm on the internal network,
**So that** I can check quality (retouching, color grading, sharpness) without waiting for each image to load.

---

## ✅ Acceptance Criteria

### On Internal Network

- [ ] **Given** the user is on the LAN
- [ ] **When** viewing the deliverable carousel/lightbox
- [ ] **Then** full-resolution images are loaded (not compressed thumbnails)
- [ ] **And** images load in <1 second each
- [ ] **And** next/previous images are preloaded for instant navigation

### On External Network

- [ ] **Given** the user is NOT on the LAN
- [ ] **Then** current behavior is preserved (compressed previews, standard loading)
- [ ] **And** no performance degradation compared to current experience

### Navigation

- [ ] **And** smooth transitions between images (no jarring layout shifts)
- [ ] **And** keyboard navigation (arrow keys) works for reviewing sequences

---

## 📁 Files to Update

| File                                           | Change                                   |
| ---------------------------------------------- | ---------------------------------------- |
| Existing deliverable review/lightbox component | Add full-res loading on LAN + preloading |

---

## 🔧 Implementation Details

### Full-Res vs. Thumbnail Decision

```typescript
import { isOnInternalNetwork } from "@/lib/network/internal-route";

// When requesting signed URLs for the carousel:
const useFullRes = isOnInternalNetwork();

// On LAN: request original file (full resolution)
// Off LAN: request current compressed/optimized version (if applicable)
```

### Image Preloading

When the user is viewing image N, preload N-1 and N+1:

```typescript
function preloadImage(url: string) {
  const img = new Image();
  img.src = url;
}

// In the carousel component:
useEffect(() => {
  if (currentIndex > 0 && images[currentIndex - 1]) {
    preloadImage(images[currentIndex - 1].url);
  }
  if (currentIndex < images.length - 1 && images[currentIndex + 1]) {
    preloadImage(images[currentIndex + 1].url);
  }
}, [currentIndex]);
```

### Performance Guardrails

Even on LAN, loading a 100MB TIFF in the browser isn't ideal. Set reasonable limits:

- If file is >50MB, show a "Download to View Full Quality" link instead
- For images in the 5-50MB range, load directly (LAN handles this fine)
- For images <5MB, always load full resolution regardless of network

---

## 🚀 Definition of Done

- [ ] Full-res images loaded in carousel when on internal network
- [ ] Compressed/optimized images loaded when on external network (current behavior)
- [ ] Next/previous image preloaded for instant navigation
- [ ] Keyboard navigation (arrow keys) works
- [ ] Smooth transitions between images
- [ ] Performance guardrails for very large files (>50MB)
- [ ] `pnpm build` passes
- [ ] Story marked as `done`

---

**Previous Story**: 30-6 - Bulk download feature
**Next Story**: None (last in epic)
