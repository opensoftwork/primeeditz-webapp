# Story 6-3: Client View Approved Deliverables

**Epic**: Epic 6 - Deliverables & QC Workflow  
**Status**: done  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-18  
**Updated**: 2026-02-04  
**Priority**: MUST — QC Gate enforcement

---

## 📋 User Story

**As a** Client (Studio),  
**I want** to view deliverables that have been approved by QC,  
**So that** I can review the final work before approval.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On            | Status  | Notes                        |
| --------------------- | ------- | ---------------------------- |
| **6-2 - QC Review**   | ✅ Done | Deliverables can be approved |
| **2 - Client Portal** | ✅ Done | Client dashboard exists      |

### Enables

| Story / Epic                    | Notes                  |
| ------------------------------- | ---------------------- |
| **6-4 - Client Approve/Revise** | Client can take action |
| **6-5 - UI Reactions**          | Real-time visibility   |

### Data Flow

```
Studio Portal
      │
      ↓ Navigate to Project
      │
Project Detail Page
      │
      ↓ "Deliverables" Tab
      │
┌─────────────────────────────────────┐
│  ℹ️ Review your deliverables and    │
│     approve or request changes      │
├─────────────────────────────────────┤
│  📁 APPROVED DELIVERABLES           │
│  ┌────────────────────────────────┐ │
│  │ Album Preview v2               │ │
│  │ ✅ approved • 15.2 MB          │ │
│  │ [Preview] [Download]           │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ Video Highlight                │ │
│  │ ✅ approved • 245 MB           │ │
│  │ [Preview] [Download]           │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: QC Gate Enforcement

- [x] **Given** a project with `actionState: 'awaiting_review'`
- [x] **When** I (client) view the Deliverables tab
- [x] **Then** I only see deliverables with status `approved`
- [x] **And** `pending_qc` or `revision_requested` deliverables are NOT visible

### AC2: Info Banner

- [x] **Given** I am viewing approved deliverables
- [x] **Then** I see an info banner: "Review your deliverables and approve or request changes"
- [x] **And** clear call-to-action for next steps

### AC3: Deliverable Preview

- [x] **Given** an approved deliverable
- [x] **When** I click "Preview"
- [x] **Then** I see the file preview (image/video/document)
- [x] **And** I can download the file

### AC4: Real-time Updates

- [x] **Given** I am viewing the deliverables tab
- [x] **When** admin approves a new deliverable
- [x] **Then** the new deliverable appears automatically (no refresh)

---

## 📘 Implementation

### Phase A: Query Layer (~1 point)

#### Task A1: Client-Facing Deliverables Query

**File**: `convex/functions/deliverables/queries.ts`

```typescript
export const getClientDeliverables = clientQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Verify client owns project
    // 2. Filter by status = 'approved' ONLY (QC Gate)
    // 3. Return enriched deliverable data

    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    return deliverables;
  },
});
```

- [ ] A1.1 Create `getClientDeliverables` query
- [ ] A1.2 Enforce `approved` status filter (QC Gate)
- [ ] A1.3 Verify client ownership

---

### Phase B: UI Components (~2 points)

#### Task B1: Client Deliverables List

**File**: `src/components/modules/studio/projects/detail/deliverables-section.tsx`

```typescript
export function ClientDeliverablesSection({ projectId }: Props) {
  const deliverables = useQuery(
    api.functions.deliverables.queries.getClientDeliverables,
    { projectId }
  );

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
        <p className="text-sm text-indigo-300">
          Review your deliverables and approve or request changes
        </p>
      </div>

      {/* Deliverables Grid */}
      <div className="grid gap-4">
        {deliverables?.map((d) => (
          <DeliverableCard key={d._id} deliverable={d} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] B1.1 Create `ClientDeliverablesSection` component
- [ ] B1.2 Add info banner
- [ ] B1.3 List approved deliverables only

#### Task B2: Deliverable Card (Client View)

**File**: `src/components/modules/studio/projects/detail/deliverable-card.tsx`

- [ ] B2.1 Create card component with preview/download
- [ ] B2.2 Show file metadata
- [ ] B2.3 Add hover interactions

---

### Phase C: Page Integration (~1 point)

#### Task C1: Add Deliverables Tab to Client Project Detail

**File**: `src/app/(protected)/@studio/projects/[id]/page.tsx`

- [ ] C1.1 Add "Deliverables" tab
- [ ] C1.2 Only show when project is in `awaiting_review` state
- [ ] C1.3 Integrate `ClientDeliverablesSection`

---

## 🧪 Testing Checklist

### QC Gate

- [ ] Only approved deliverables visible to client
- [ ] pending_qc deliverables hidden
- [ ] revision_requested deliverables hidden

### Real-time

- [ ] New approval appears without refresh
- [ ] Revoked approval disappears

### Preview

- [ ] Image preview works
- [ ] Video preview works
- [ ] Download works for all types

---

## 🚀 Definition of Done

- [ ] `getClientDeliverables` query with QC Gate
- [ ] Client deliverables section component
- [ ] Info banner displayed
- [ ] Real-time updates working
- [ ] Deliverables tab in client project detail
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status        | Notes                   |
| ---------- | ------------- | ----------------------- |
| 2026-01-18 | ready-for-dev | Story created           |
| 2026-02-04 | done          | Implementation complete |

## 🤖 Dev Agent Record

### Implementation Plan

I implemented the client-facing deliverables view by creating a filtered Convex query `getClientDeliverables` and a new `DeliverablesSection` component. This ensures the QC Gate is enforced, only showing "approved" deliverables to the client.

### Debug Log

- 2026-02-04: Created `getClientDeliverables` query in `convex/functions/deliverables/queries.ts`.
- 2026-02-04: Created `DeliverablesSection` in `src/components/modules/projects/detail/`.
- 2026-02-04: Integrated into `ProjectDetailView`.

### Completion Notes

- Phase A: Query layer implemented.
- Phase B: UI components created and integrated.
- Phase C: QC Gate enforced via status filtering.

---

**Previous Story**: 6-2 - QC Review & Approval  
**Next Story**: 6-4 - Client Approve or Request Revision
