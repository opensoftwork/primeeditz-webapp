# Story 13D.4: Update Studio Quotation Request UI

**Status**: backlog  
**Points**: 3  
**Epic**: [13D: Legacy Cleanup & Migration](../../../../planning-artifacts/epics/13d-legacy-cleanup-migration.md)  
**Depends On**: Epic 13A complete

---

## User Story

**As a** Studio,  
**I want** to select multiple service packages when requesting a quote,  
**So that** I can combine services for my client.

---

## Acceptance Criteria

### AC1: Package Selection Grid

**Given** I'm on the quotation request page  
**When** the page loads  
**Then** I see a grid of available service packages (not templates)  
**And** each package shows: name, description, starting price, project type

### AC2: Multi-Select with Checkboxes

**Given** packages are displayed  
**When** I click on a package card  
**Then** the package is selected (checkbox checked)  
**And** I can select MULTIPLE packages

### AC3: Projects Count Preview

**Given** I've selected 3 packages  
**When** I view the summary  
**Then** I see: "This will create 3 projects:"  
**And** a list showing each package's project type

### AC4: Combined Pricing

**Given** I've selected multiple packages  
**When** I view the pricing section  
**Then** I see:

- Line items grouped by package
- Subtotal per package
- Combined total with GST

### AC5: Submit with Multiple Packages

**Given** I've selected packages and filled project info  
**When** I click "Request Quote"  
**Then** the quotation is created with `selectedPackageIds` array  
**And** line items are aggregated from all packages

### AC6: Filter by Category

**Given** packages have different categories  
**When** I filter by category  
**Then** only packages in that category are shown

### AC7: Search Packages

**Given** many packages exist  
**When** I search by name  
**Then** packages are filtered by name match

---

## Technical Implementation

### Route Location

```
src/app/(protected)/@studio/quotations/request/page.tsx
```

### File Structure (MANDATORY)

```
src/components/modules/studio/quotation-request/
├── package-selector.tsx            # Multi-select grid
├── package-card.tsx                # Individual package card
├── selected-packages-summary.tsx   # Projects preview + pricing
├── quotation-request-form.tsx      # Main form
├── quotation-request-loading.tsx
├── quotation-request-error.tsx
└── index.ts
```

### Package Selector Component

```tsx
// package-selector.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PackageCard } from "./package-card";

interface PackageSelectorProps {
  selectedIds: Id<"servicePackages">[];
  onSelectionChange: (ids: Id<"servicePackages">[]) => void;
}

export function PackageSelector({
  selectedIds,
  onSelectionChange,
}: PackageSelectorProps) {
  const packages = useQuery(api.servicePackages.listActive);
  const categories = useQuery(api.projectCategories.list);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter packages
  let filtered = packages ?? [];
  if (categoryFilter) {
    filtered = filtered.filter((p) => p.categoryId === categoryFilter);
  }
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(lower));
  }

  function handleToggle(packageId: Id<"servicePackages">) {
    if (selectedIds.includes(packageId)) {
      onSelectionChange(selectedIds.filter((id) => id !== packageId));
    } else {
      onSelectionChange([...selectedIds, packageId]);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={categoryFilter ?? ""}
          onValueChange={(v) => setCategoryFilter(v || null)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((pkg) => (
          <PackageCard
            key={pkg._id}
            package={pkg}
            isSelected={selectedIds.includes(pkg._id)}
            onToggle={() => handleToggle(pkg._id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No packages found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
```

### Package Card with Checkbox

```tsx
// package-card.tsx
interface PackageCardProps {
  package: Doc<"servicePackages">;
  isSelected: boolean;
  onToggle: () => void;
}

export function PackageCard({
  package: pkg,
  isSelected,
  onToggle,
}: PackageCardProps) {
  const projectType = useQuery(api.projectTypes.get, { id: pkg.projectTypeId });

  // Calculate starting price
  const startingPrice = pkg.lineItems.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0,
  );

  return (
    <div
      className={cn(
        "relative border rounded-lg p-4 cursor-pointer transition-all",
        isSelected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
          : "hover:border-muted-foreground/50",
      )}
      onClick={onToggle}
    >
      {/* Selection indicator */}
      <div className="absolute top-3 right-3">
        <Checkbox checked={isSelected} />
      </div>

      <h3 className="font-semibold pr-8">{pkg.name}</h3>

      {pkg.description && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {pkg.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Badge variant="outline">{projectType?.name ?? "..."}</Badge>
        <span className="font-bold">₹{startingPrice.toLocaleString()}</span>
      </div>
    </div>
  );
}
```

### Selected Packages Summary

```tsx
// selected-packages-summary.tsx
interface SelectedPackagesSummaryProps {
  selectedIds: Id<"servicePackages">[];
}

export function SelectedPackagesSummary({
  selectedIds,
}: SelectedPackagesSummaryProps) {
  const packages = useQuery(api.servicePackages.getMany, { ids: selectedIds });
  const projectTypes = useQuery(api.projectTypes.list);

  if (selectedIds.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
        Select packages to see what projects will be created.
      </div>
    );
  }

  // Calculate totals
  const totalLineItems =
    packages?.flatMap((p) =>
      p.lineItems.map((item) => ({ ...item, packageName: p.name })),
    ) ?? [];

  const subtotal = totalLineItems.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0,
  );
  const gstAmount = Math.round(subtotal * 0.18);
  const total = subtotal + gstAmount;

  return (
    <div className="space-y-6">
      {/* Projects Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            This will create {selectedIds.length} project(s):
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {packages?.map((pkg) => {
              const projectType = projectTypes?.find(
                (t) => t._id === pkg.projectTypeId,
              );
              return (
                <li key={pkg._id} className="flex items-center gap-2">
                  <Badge>{projectType?.name}</Badge>
                  <span className="text-sm text-muted-foreground">
                    from {pkg.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Combined Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Combined Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Group by package */}
          {packages?.map((pkg) => (
            <div key={pkg._id} className="mb-4">
              <h4 className="font-medium mb-2">{pkg.name}</h4>
              <div className="pl-4 space-y-1 text-sm">
                {pkg.lineItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.description}</span>
                    <span>₹{(item.rate * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Separator className="my-4" />

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST (18%)</span>
              <span>₹{gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Backend Query

```typescript
// convex/functions/servicePackages/queries.ts

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("servicePackages")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getMany = query({
  args: { ids: v.array(v.id("servicePackages")) },
  handler: async (ctx, { ids }) => {
    const packages = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return packages.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT allow submitting with 0 packages selected
- ❌ Do NOT combine into single project (each package = 1 project)
- ❌ Do NOT show inactive packages
- ❌ Do NOT forget to show project type per package

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Select 3 packages → see "3 projects" message
- [ ] Manual test: Pricing combines correctly
- [ ] Manual test: Submit creates quotation with `selectedPackageIds`

---

## Files to Create

```
CREATE: src/components/modules/studio/quotation-request/package-selector.tsx
CREATE: src/components/modules/studio/quotation-request/package-card.tsx
CREATE: src/components/modules/studio/quotation-request/selected-packages-summary.tsx
CREATE: src/components/modules/studio/quotation-request/quotation-request-form.tsx
CREATE: src/components/modules/studio/quotation-request/quotation-request-loading.tsx
CREATE: src/components/modules/studio/quotation-request/quotation-request-error.tsx
CREATE: src/components/modules/studio/quotation-request/index.ts

UPDATE: convex/functions/servicePackages/queries.ts
  - Add listActive, getMany
```

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
