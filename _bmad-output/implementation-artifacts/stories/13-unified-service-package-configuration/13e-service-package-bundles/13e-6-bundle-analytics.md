# Story 13E.6: Bundle Analytics

**Status**: planned  
**Points**: 3  
**Epic**: [13E: Service Package Bundles](../../../../planning-artifacts/epics/13e-service-package-bundles.md)  
**Depends On**: Story 13E.5

---

## User Story

**As an** Admin,  
**I want** to see bundle usage statistics,  
**So that** I can optimize promotional offerings.

---

## Acceptance Criteria

### AC1: Usage Count in List

**Given** the bundle list page  
**When** viewing bundles  
**Then** each shows "Used X times"

### AC2: Bundle Detail Stats

**Given** a bundle detail page  
**When** viewing stats  
**Then** I see:

- Total quotations using this bundle
- Total revenue generated
- Total discount given
- Conversion rate (approved / total)

### AC3: Dashboard Widget

**Given** the admin dashboard  
**When** viewing widgets  
**Then** I see "Top Bundles This Month"

### AC4: Date Range Filter

**Given** the analytics view  
**When** I select a date range  
**Then** stats filter to that period

---

## Technical Implementation

### Backend Query

```typescript
// convex/functions/serviceBundles/queries.ts

export const getAnalytics = adminQuery({
  args: {
    bundleId: v.id("serviceBundles"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { bundleId, startDate, endDate }) => {
    const bundle = await ctx.db.get(bundleId);
    if (!bundle) throw new Error("Bundle not found");

    // Get quotations using this bundle
    let quotations = await ctx.db
      .query("quotations")
      .filter((q) => q.eq(q.field("bundleId"), bundleId))
      .collect();

    // Filter by date if provided
    if (startDate) {
      quotations = quotations.filter((q) => q._creationTime >= startDate);
    }
    if (endDate) {
      quotations = quotations.filter((q) => q._creationTime <= endDate);
    }

    const approved = quotations.filter((q) => q.status === "approved");

    return {
      bundleId,
      bundleName: bundle.name,
      totalQuotations: quotations.length,
      approvedQuotations: approved.length,
      conversionRate:
        quotations.length > 0
          ? Math.round((approved.length / quotations.length) * 100)
          : 0,
      totalRevenue: approved.reduce((sum, q) => sum + (q.totalAmount ?? 0), 0),
      totalDiscountGiven: quotations.reduce(
        (sum, q) => sum + (q.discountAmount ?? 0),
        0,
      ),
    };
  },
});

export const getTopBundles = adminQuery({
  args: {
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 5, startDate }) => {
    const bundles = await ctx.db
      .query("serviceBundles")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // Get usage counts for each bundle
    const bundlesWithStats = await Promise.all(
      bundles.map(async (bundle) => {
        let quotations = await ctx.db
          .query("quotations")
          .filter((q) => q.eq(q.field("bundleId"), bundle._id))
          .collect();

        if (startDate) {
          quotations = quotations.filter((q) => q._creationTime >= startDate);
        }

        return {
          bundleId: bundle._id,
          bundleName: bundle.name,
          usageCount: quotations.length,
          revenue: quotations
            .filter((q) => q.status === "approved")
            .reduce((sum, q) => sum + (q.totalAmount ?? 0), 0),
        };
      }),
    );

    // Sort by usage and return top N
    return bundlesWithStats
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  },
});
```

### Dashboard Widget

```tsx
// src/components/modules/admin/dashboard/top-bundles-widget.tsx

export function TopBundlesWidget() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const topBundles = useQuery(api.serviceBundles.getTopBundles, {
    limit: 5,
    startDate: startOfMonth.getTime(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎁 Top Bundles This Month</CardTitle>
      </CardHeader>
      <CardContent>
        {topBundles?.map((bundle, index) => (
          <div
            key={bundle.bundleId}
            className="flex justify-between items-center py-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-muted-foreground">
                #{index + 1}
              </span>
              <span>{bundle.bundleName}</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{bundle.usageCount} uses</div>
              <div className="text-sm text-muted-foreground">
                ₹{bundle.revenue.toLocaleString()}
              </div>
            </div>
          </div>
        ))}

        {topBundles?.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No bundle usage this month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## ❌ DO NOT

- ❌ Do NOT count rejected quotations in revenue
- ❌ Do NOT expose analytics to non-admin users
- ❌ Do NOT forget date filtering

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: View bundle analytics
- [ ] Manual test: Top bundles widget shows data

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
