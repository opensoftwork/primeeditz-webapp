# Story 30.5: Internal Network Indicator Badge

**Epic**: Epic 30 - Internal Network Asset Routing
**Status**: backlog
**Complexity**: Tiny (1 point)
**Created**: 2026-03-02
**Priority**: LOW — Nice-to-have UX indicator
**Depends On**: Story 30.2

---

## 📋 User Story

**As a** user on the internal network,
**I want** to see a subtle indicator that assets are loading via the fast internal route,
**So that** I understand why things are faster in the office vs. at home.

---

## ✅ Acceptance Criteria

- [ ] **Given** `isOnInternalNetwork()` returns `true`
- [ ] **Then** a small badge/chip appears in the UI: `⚡ Internal Network`
- [ ] **And** hovering shows a tooltip: "Assets are loading directly from your local network for faster performance"
- [ ] **Given** the user is NOT on the internal network
- [ ] **Then** no badge is shown
- [ ] **And** the badge is subtle — does NOT distract from the main interface

---

## 📁 Files to Create/Update

| File                                               | Change                        |
| -------------------------------------------------- | ----------------------------- |
| New or existing layout header/status bar component | Add conditional network badge |

---

## 🔧 Implementation Details

### Badge Design

- Small chip/badge with a lightning bolt icon (⚡) and text "Internal Network"
- Use existing PrimeEditz design system badge component
- Positioned in the header or footer — unobtrusive
- Color: subtle green or blue tint to indicate "optimized"
- Only renders client-side (uses `isOnInternalNetwork()`)

### Example

```tsx
import { isOnInternalNetwork } from "@/lib/network/internal-route";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Zap } from "lucide-react";

function NetworkBadge() {
  if (!isOnInternalNetwork()) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-yellow-500" />
          <span>Internal Network</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        Assets are loading directly from your local network for faster
        performance
      </TooltipContent>
    </Tooltip>
  );
}
```

---

## 🚀 Definition of Done

- [ ] Badge visible when on internal network
- [ ] Badge hidden for remote users
- [ ] Tooltip provides explanation
- [ ] Design is subtle and consistent with PrimeEditz system
- [ ] `pnpm build` passes
- [ ] Story marked as `done`

---

**Previous Story**: 30-4 - Integrate internal URL resolution
**Next Story**: 30-6 - Bulk download feature
