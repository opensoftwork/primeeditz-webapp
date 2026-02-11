# Story 16-4: Revision History Timeline

**Epic**: Epic 16 - Deliverable Revision Workflow  
**Status**: backlog  
**Complexity**: Medium (5 points)  
**Created**: 2026-02-11  
**Priority**: SHOULD — Provides visibility into revision lifecycle

---

## 📋 User Story

**As a** User (Admin, Studio, or Employee),  
**I want** to see a timeline of all revision requests on a deliverable,  
**So that** I can track the full history of feedback and corrections.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                     | Status     | Notes                             |
| ------------------------------ | ---------- | --------------------------------- |
| **16-1 - Schema & Backend**    | 📋 Backlog | `getRevisionRequests` query       |
| **16-2 - Admin Revision Page** | 📋 Backlog | Revision requests with data exist |

### Enables

| Story / Epic  | Notes                          |
| ------------- | ------------------------------ |
| **All roles** | Shared visibility into history |

### Proposed UX

```
┌──────────────────────────────────────────────────────┐
│  📋 REVISION HISTORY                                  │
│  ─────────────────────────────────────────────────── │
│                                                      │
│  ┌─ 🟢 Revision #3 — RESOLVED ────────────────────┐ │
│  │  Requested by Admin (John) • Feb 10, 2026       │ │
│  │  "Adjust saturation on the middle panel"        │ │
│  │  📎 2 reference images                          │ │
│  │  ✅ Resolved → v4 uploaded by Employee (Sarah)  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ 🟢 Revision #2 — RESOLVED ────────────────────┐ │
│  │  Requested by Studio (PrimeEditz) • Feb 8, 2026 │ │
│  │  "Logo placement is off-center"                 │ │
│  │  📎 1 reference image                           │ │
│  │  ✅ Resolved → v3 uploaded by Employee (Sarah)  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ 🟡 Revision #1 — IN PROGRESS ─────────────────┐ │
│  │  Requested by Admin (John) • Feb 5, 2026        │ │
│  │  "Color grading needs work on all shots"        │ │
│  │  📎 3 reference images                          │ │
│  │  ⏳ Employee is working on corrections          │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Timeline Display on Deliverable Detail

- [ ] **Given** I am viewing a deliverable detail page (any role)
- [ ] **When** the deliverable has revision requests
- [ ] **Then** a "Revision History" section shows below or alongside the deliverable
- [ ] **And** revisions are listed in reverse chronological order (newest first)

### AC2: Revision Card Content

- [ ] **Given** a revision request
- [ ] **Then** each card shows:
  - Revision number (e.g., "#3")
  - Status badge: Pending (amber), In Progress (blue), Resolved (green)
  - Requester name and role
  - Request date
  - Revision notes (truncated with "Show more" if long)
  - Number of reference images (with clickable gallery)
  - If resolved: resolution info (new version number, who uploaded, when)

### AC3: Reference Image Gallery

- [ ] **Given** a revision card with reference images
- [ ] **When** I click on the image count or thumbnail strip
- [ ] **Then** images open in a gallery/lightbox with per-image notes
- [ ] **And** signed URLs are used for image display

### AC4: Expand/Collapse

- [ ] **Given** multiple revision requests (3+)
- [ ] **Then** only the latest 2 are expanded by default
- [ ] **And** older revisions are collapsed with a "Show older revisions" toggle

### AC5: Empty State

- [ ] **Given** a deliverable with no revision requests
- [ ] **Then** the "Revision History" section is hidden entirely
- [ ] **Or** shows "No revision requests yet" if explicitly navigated to

### AC6: Real-Time Updates

- [ ] **Given** I am viewing the revision timeline
- [ ] **When** a revision request status changes (e.g., resolved)
- [ ] **Then** the timeline updates in real-time via Convex subscription

---

## 📘 Implementation

### Phase A: Timeline Component (~3 points)

#### Task A1: Revision History Timeline

**File**: `src/components/shared/revision-timeline.tsx`

```typescript
"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useAction } from "convex/react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  Clock,
  Loader2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RevisionTimelineProps {
  deliverableId: Id<"deliverables">;
  maxInitialVisible?: number; // Default: 2
}

export function RevisionTimeline({
  deliverableId,
  maxInitialVisible = 2,
}: RevisionTimelineProps) {
  const revisionRequests = useQuery(
    api.functions.deliverables.queries.getRevisionRequests,
    { deliverableId }
  );

  const [showAll, setShowAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!revisionRequests || revisionRequests.length === 0) {
    return null; // Hidden when no revisions
  }

  const reversed = [...revisionRequests].reverse(); // Newest first
  const visible = showAll ? reversed : reversed.slice(0, maxInitialVisible);
  const hasMore = reversed.length > maxInitialVisible;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/50">
        Revision History
      </h3>

      <div className="space-y-3">
        <AnimatePresence>
          {visible.map((request) => (
            <RevisionCard
              key={request._id}
              request={request}
              isExpanded={expandedIds.has(request._id)}
              onToggle={() => toggleExpand(request._id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {hasMore && !showAll && (
        <button onClick={() => setShowAll(true)}>
          Show {reversed.length - maxInitialVisible} older revisions
        </button>
      )}
    </div>
  );
}

function RevisionCard({ request, isExpanded, onToggle }) {
  const statusConfig = {
    pending: { color: "amber", icon: Clock, label: "Pending" },
    in_progress: { color: "blue", icon: Loader2, label: "In Progress" },
    resolved: { color: "emerald", icon: CheckCircle, label: "Resolved" },
  };

  const config = statusConfig[request.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-white/3 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`border-${config.color}-500/30 text-${config.color}-400`}>
            <config.icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
          <span className="text-xs font-bold text-white/60">
            Revision #{request.revisionNumber}
          </span>
        </div>
        <span className="text-[10px] text-white/40">
          {format(request.createdAt, "MMM d, yyyy")}
        </span>
      </div>

      {/* Requester */}
      <p className="text-xs text-white/50 mt-2">
        Requested by {request.requestedByName} ({request.requestedByRole})
      </p>

      {/* Notes */}
      <p className="text-sm text-white/80 mt-2">{request.notes}</p>

      {/* Reference images count */}
      {request.referenceImages?.length > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-white/40">
          <ImageIcon className="h-3 w-3" />
          {request.referenceImages.length} reference image(s)
        </div>
      )}

      {/* Resolution info */}
      {request.status === "resolved" && request.resolvedAt && (
        <p className="text-xs text-emerald-400 mt-2">
          ✅ Resolved on {format(request.resolvedAt, "MMM d, yyyy")}
        </p>
      )}
    </motion.div>
  );
}
```

- [ ] A1.1 Create `RevisionTimeline` component
- [ ] A1.2 `RevisionCard` sub-component with status badges
- [ ] A1.3 Expand/collapse for long lists
- [ ] A1.4 Real-time updates via `useQuery`
- [ ] A1.5 Image gallery integration (click to view)
- [ ] A1.6 Empty state handling (return null)

---

### Phase B: Integration (~1.5 points)

#### Task B1: Add to Admin Deliverable Detail

**File**: `src/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-detail-view.tsx`

```typescript
// Add after existing content (e.g., after DeliverablePreview):
<RevisionTimeline deliverableId={deliverable._id} />
```

- [ ] B1.1 Import and render `RevisionTimeline` in admin detail view
- [ ] B1.2 Position below deliverable preview or in a dedicated tab

#### Task B2: Add to Employee Deliverable View

**File**: `src/components/modules/employee/assigned-work/details/revision-workspace.tsx`

- [ ] B2.1 Add "View All Revisions" link in revision workspace
- [ ] B2.2 Shows full timeline when clicked

#### Task B3: Add to Studio Deliverable View

**File**: `src/components/modules/projects/detail/deliverables-section.tsx` (or per-deliverable view)

- [ ] B3.1 Import and render `RevisionTimeline` in studio deliverable detail
- [ ] B3.2 Studio sees revision requests they created + status

#### Task B4: Replace/Augment Existing Version History

**File**: `src/components/modules/admin/projects/project-detail/deliverables/detail/version-history.tsx`

Link version history entries to their corresponding revision requests:

- [ ] B4.1 Show revision request badge next to version entries that were created from revisions
- [ ] B4.2 Click on badge opens the revision request details

---

### Phase C: Signed URLs for Timeline Images (~0.5 points)

#### Task C1: Batch Signed URLs

Ensure reference images in the timeline have signed URLs for display:

- [ ] C1.1 Use existing `getSignedFileUrls` action for revision image keys
- [ ] C1.2 Batch fetch URLs for all visible revision requests
- [ ] C1.3 Lazy load URLs for collapsed/hidden revisions

---

## 🧪 Testing Checklist

### Display

- [ ] Timeline shows revision requests in reverse chronological order
- [ ] Status badges are correct (Pending/In Progress/Resolved)
- [ ] Requester name and role displayed
- [ ] Revision notes displayed
- [ ] Reference image count shown
- [ ] Resolution info shown for resolved requests

### Expand/Collapse

- [ ] Only 2 latest shown by default
- [ ] "Show older" toggle works
- [ ] Collapsed states render correctly

### Role Integration

- [ ] Admin detail view shows timeline
- [ ] Employee workspace shows timeline
- [ ] Studio detail view shows timeline

### Real-Time

- [ ] Status change updates timeline instantly
- [ ] New revision request appears in timeline

### Edge Cases

- [ ] 0 revision requests — section hidden
- [ ] 1 revision request — no "show older" toggle
- [ ] 10+ revision requests — performance acceptable
- [ ] Long revision notes — truncated with "show more"

---

## 🚀 Definition of Done

- [ ] `RevisionTimeline` shared component created
- [ ] Integrated into admin, employee, and studio deliverable views
- [ ] Status badges and expand/collapse working
- [ ] Reference image gallery accessible from timeline
- [ ] Real-time updates confirmed
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-11 | backlog | Story created |

---

**Previous Story**: 16-3 - Employee Revision Workspace  
**Next Story**: 16-5 - Studio Per-Deliverable Review with Image Upload
