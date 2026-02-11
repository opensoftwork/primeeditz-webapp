# Story 5-2: Gated Upload Enforcement

**Epic**: Epic 5 - Asset Upload & Folder Management  
**Status**: ready-for-dev  
**Complexity**: Low (3 points)  
**Created**: 2026-01-18  
**Priority**: MUST — Prevents storage abuse

---

## 📋 User Story

**As a** System,  
**I want** to enforce the upload gate so clients can only upload after quotation approval,  
**So that** storage abuse is prevented and business workflow is enforced.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                     | Status  | Notes                              |
| ------------------------------ | ------- | ---------------------------------- |
| **5-1 - View Project Folders** | Pending | Base folder view                   |
| **4-8 - Quotation Approval**   | ✅ Done | Approval status check              |
| **Quotation Status Field**     | ✅ Done | `quotations.status === 'approved'` |

### Enables

| Story / Epic                    | Notes                           |
| ------------------------------- | ------------------------------- |
| **5-3 - File Upload**           | Upload only works when unlocked |
| **5-7 - Admin Internal Upload** | Exception for internal projects |

### Business Logic

```
Project Status Flow:
───────────────────────────────────────────────────────────────

  Client creates project
           │
           ▼
   Status: pending_review
           │
    Admin sends quotation
           │
           ▼
   Status: pending_quotation
    ┌──────────────────────┐
    │  🔒 UPLOADS LOCKED   │
    │  "Approve quotation  │
    │   to unlock uploads" │
    └──────────────────────┘
           │
    Client approves quotation
           │
           ▼
   Status: active
    ┌──────────────────────┐
    │  🔓 UPLOADS UNLOCKED │
    │  Drag & drop files   │
    │  to start uploading  │
    └──────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Locked State UI

- [ ] **Given** a project with status `pending_review` or `pending_quotation`
- [ ] **When** I view the Assets tab
- [ ] **Then** I see a locked state overlay on folders with:
  - Lock icon (🔒)
  - Message: "Approve quotation to unlock uploads"
  - CTA button: "View Quotation" (links to quotation detail)
- [ ] **And** folder cards are visually dimmed/disabled
- [ ] **And** no upload functionality is available

### AC2: Unlocked State UI

- [ ] **Given** a project with status `active` (quotation approved)
- [ ] **When** I view the Assets tab
- [ ] **Then** uploads are enabled
- [ ] **And** no lock overlay is shown
- [ ] **And** folders are fully interactive

### AC3: API Enforcement

- [ ] **Given** a project without approved quotation
- [ ] **When** any upload API is called:
  - `getUploadUrl`
  - `recordAssetUpload`
  - tus upload endpoint
- [ ] **Then** the API must throw error: "Quotation must be approved before uploading"
- [ ] **And** HTTP status 403 (Forbidden)

### AC4: Exception - Internal Projects

- [ ] **Given** a project with `source = 'admin_init'` (internal project)
- [ ] **When** admin accesses the Assets tab
- [ ] **Then** uploads are unlocked WITHOUT quotation requirement
- [ ] **And** storage limits still apply (from project settings)

### AC5: Status Badge Display

- [ ] **Given** any project
- [ ] **Then** the Assets tab header shows status:
  - Locked: "🔒 Uploads Locked"
  - Unlocked: "📤 Ready for Upload"

---

## 🎨 UX Design

### Locked State (Client View)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ASSETS                                                   🔒 LOCKED     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │                         🔒                                          ││
│  │                                                                     ││
│  │               UPLOADS ARE LOCKED                                    ││
│  │                                                                     ││
│  │    Approve your quotation to start uploading                        ││
│  │    photos and videos for your project.                              ││
│  │                                                                     ││
│  │              [📋 View Quotation]                                    ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  │  📁 (dimmed)        │  │  📁 (dimmed)        │  │  📁 (dimmed)        │
│  │  Ceremony           │  │  Reception          │  │  Candid             │
│  │  🔒                 │  │  🔒                 │  │  🔒                 │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Unlocked State (Client View)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ASSETS                                              📤 READY TO UPLOAD │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📊 STORAGE: ████████░░ 78GB / 100GB                                    │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  │  📁                 │  │  📁                 │  │  📁                 │
│  │  Ceremony           │  │  Reception          │  │  Candid             │
│  │  124 files ✅       │  │  0 files ⏳         │  │  45 files 🔄        │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Gate Check Logic (~1 point)

#### Task A1: Upload Gate Check Utility

**File**: `convex/lib/uploadGate.ts`

```typescript
import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function checkUploadGate(
  ctx: QueryCtx,
  projectId: Id<"projects">,
): Promise<{ unlocked: boolean; reason?: string }> {
  const project = await ctx.db.get(projectId);
  if (!project) {
    return { unlocked: false, reason: "Project not found" };
  }

  // Exception: Internal projects skip quotation
  if (project.source === "admin_init") {
    return { unlocked: true };
  }

  // Check quotation status
  const quotation = await ctx.db
    .query("quotations")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .first();

  if (!quotation || quotation.status !== "approved") {
    return {
      unlocked: false,
      reason: "Quotation must be approved before uploading",
    };
  }

  return { unlocked: true };
}
```

- [ ] A1.1 Create `checkUploadGate` utility function
- [ ] A1.2 Handle internal project exception
- [ ] A1.3 Check quotation approval status

#### Task A2: Gate Query for UI

**File**: `convex/functions/projects/queries.ts` (extend)

```typescript
export const getUploadGateStatus = clientQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const gateStatus = await checkUploadGate(ctx, args.projectId);

    // Get quotation ID for CTA link
    const quotation = await ctx.db
      .query("quotations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    return {
      ...gateStatus,
      quotationId: quotation?._id,
    };
  },
});
```

- [ ] A2.1 Create `getUploadGateStatus` query
- [ ] A2.2 Include quotation ID for navigation

---

### Phase B: UI Components (~1.5 points)

#### Task B1: Upload Gate Overlay Component

**File**: `src/components/modules/client/assets/upload-gate-overlay.tsx`

- [ ] B1.1 Create locked state overlay
- [ ] B1.2 Add lock icon with animation
- [ ] B1.3 Add "Approve quotation" message
- [ ] B1.4 Add "View Quotation" CTA button
- [ ] B1.5 Premium dark theme styling with glassmorphism

#### Task B2: Gate Status Badge

**File**: `src/components/modules/client/assets/gate-status-badge.tsx`

- [ ] B2.1 Create badge component
- [ ] B2.2 Locked state: "🔒 Uploads Locked"
- [ ] B2.3 Unlocked state: "📤 Ready to Upload"

#### Task B3: Integrate Gate Check in Assets Tab

**File**: `src/components/modules/client/projects/detail/assets-tab.tsx` (update)

- [ ] B3.1 Query `getUploadGateStatus`
- [ ] B3.2 Conditionally render gate overlay
- [ ] B3.3 Add gate status badge to header
- [ ] B3.4 Dim folders when locked

---

### Phase C: API Enforcement (~0.5 points)

#### Task C1: Enforce Gate in Upload APIs

**Files to update:**

- `convex/functions/storage/mutations.ts`
- API route: `/api/upload/[...file]/route.ts` (when created)

- [ ] C1.1 Add gate check to `getUploadUrl` mutation
- [ ] C1.2 Add gate check to `recordAssetUpload` mutation
- [ ] C1.3 Return 403 with error message if locked
- [ ] C1.4 Pass projectId to tus endpoint for validation

---

## 🧩 Component Structure

```
src/components/modules/client/assets/
├── upload-gate-overlay.tsx    # Locked state UI
├── gate-status-badge.tsx      # Status indicator
├── storage-usage-bar.tsx      # (from 5-1)
├── folder-card.tsx            # (from 5-1)
└── folder-grid.tsx            # (from 5-1)
```

---

## 🧪 Testing Checklist

### Locked State

- [ ] Lock overlay shown for `pending_review` projects
- [ ] Lock overlay shown for `pending_quotation` projects
- [ ] "View Quotation" button navigates correctly
- [ ] Folders are dimmed/non-interactive

### Unlocked State

- [ ] No overlay for `active` projects
- [ ] Folders are fully interactive
- [ ] "Ready to Upload" badge shown

### API Enforcement

- [ ] Upload API returns 403 when locked
- [ ] Error message is clear
- [ ] Internal projects bypass gate

### Edge Cases

- [ ] Project with no quotation (pending_review)
- [ ] Project with rejected quotation
- [ ] Project with admin_init source

---

## 🚀 Definition of Done

- [ ] `checkUploadGate` utility working
- [ ] `getUploadGateStatus` query working
- [ ] Upload gate overlay component complete
- [ ] Gate status badge showing correct state
- [ ] Assets tab conditionally renders gate
- [ ] API enforcement returning 403 when locked
- [ ] Internal projects bypass gate
- [ ] Premium dark theme UI
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                          |
| ---------- | ------------- | ------------------------------ |
| 2026-01-18 | ready-for-dev | Story created from Epic 5 plan |

---

**Previous Story**: 5-1 - View Project Folders  
**Next Story**: 5-3 - File Upload with Dual Strategy
