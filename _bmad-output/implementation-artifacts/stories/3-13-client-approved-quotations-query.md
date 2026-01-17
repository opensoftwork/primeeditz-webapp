# Story 3-13: Client Approved Quotations Query

**Epic**: Epic 3 - Admin Portal & System Management  
**Status**: ready-for-dev  
**Complexity**: Low (2 points)  
**Created**: 2026-01-17  
**Priority**: HIGH — Required for quotation linking and folder setup
**Track**: B (Parallel development)

---

## 📋 User Story

**As the** System,  
**I need** a query to get a client's approved quotations with storage usage information,  
**So that** the admin can select from available quotations when linking projects.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On        | Status  | Notes                       |
| ----------------- | ------- | --------------------------- |
| Quotations schema | ✅ Done | Quotation table with status |
| Storage tiers     | ✅ Done | 3-9: Storage Pricing Tiers  |

### Enables

| Story                               | Notes                              |
| ----------------------------------- | ---------------------------------- |
| **3-12: Link Project to Quotation** | Uses this query for selection list |
| **3-15: Storage Pool Tracking**     | Calculates storage remaining       |

---

## ✅ Acceptance Criteria

### AC1: Query Returns Approved Quotations

- [ ] Query: `getClientApprovedQuotations(clientId)`
- [ ] Returns only quotations where:
  - `clientId` matches
  - `status = "approved"`
- [ ] Sorted by approval date (most recent first)

### AC2: Enriched Quotation Data

Each quotation in result includes:

- [ ] `_id`, `code`, `status`
- [ ] `total` - Total quotation value
- [ ] `approvedAt` - When client approved
- [ ] `storageInfo`:
  - `tierName` - Storage tier name (if line item has storage)
  - `totalGB` - Total storage in quotation
  - `allocatedGB` - Storage already allocated to projects
  - `remainingGB` - Available for new projects

### AC3: Storage Calculation

- [ ] Calculate storage from quotation line items
- [ ] Sum storage allocated to projects linked to this quotation
- [ ] Return remaining = total - allocated

---

## 📘 Implementation Tasks

### Phase A: Backend (~2 points)

**File**: `convex/functions/quotations/queries.ts`

```typescript
/**
 * Get all approved quotations for a client with storage info.
 * Used for project-quotation linking.
 */
export const getClientApprovedQuotations = adminQuery({
  args: {
    clientId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    // 1. Get approved quotations for this client
    const quotations = await ctx.db
      .query("quotations")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId as string))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    // 2. For each quotation, calculate storage usage
    const enriched = await Promise.all(
      quotations.map(async (q) => {
        // Get linked projects
        const linkedProjects = await ctx.db
          .query("projects")
          .filter((p) => /* project linked to this quotation */)
          .collect();

        const allocatedStorage = linkedProjects.reduce(
          (sum, p) => sum + (p.storageAllocated || 0),
          0
        );

        // Extract storage from quotation (from line items or storage tier)
        const totalStorage = /* calculate from quotation */;

        return {
          ...q,
          storageInfo: {
            totalGB: totalStorage / (1024 * 1024 * 1024),
            allocatedGB: allocatedStorage / (1024 * 1024 * 1024),
            remainingGB: (totalStorage - allocatedStorage) / (1024 * 1024 * 1024),
          },
        };
      })
    );

    return enriched;
  },
});
```

---

## 🧪 Testing Checklist

- [ ] Returns only approved quotations
- [ ] Returns only quotations for specified client
- [ ] Storage calculation is accurate
- [ ] Allocated storage sums from linked projects
- [ ] Remaining = Total - Allocated

---

## 🚀 Definition of Done

- [ ] Query implemented and tested
- [ ] Storage calculations correct
- [ ] Returns proper enriched data structure
- [ ] Story marked as `done` in `sprint-status.yaml`

---

**Previous Story**: 3-12 - Link Project to Quotation  
**Enables**: 3-14 - Enhanced Folder Setup Flow
