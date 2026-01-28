# Story 13C.1: Service Package List Page

**Status**: backlog  
**Points**: 3  
**Epic**: [13C: Service Package Builder UI](../../../../planning-artifacts/epics/13c-service-package-builder-ui.md)  
**Depends On**: Epic 13A complete

---

## User Story

**As an** Admin,  
**I want** to see all my service packages in one place,  
**So that** I can manage my product offerings.

---

## Acceptance Criteria

### AC1: Route Setup

**Given** an admin user  
**When** they navigate to `/admin/settings/service-packages`  
**Then** they see the service package list page

### AC2: Package Cards Display

**Given** service packages exist in the database  
**When** the list loads  
**Then** each package is displayed as a card showing:

- Package name (title)
- Category badge (if set)
- Price range (min-max from line items)
- Status badge (Active/Inactive)

### AC3: Filter by Status

**Given** the list has multiple packages  
**When** I select "Active Only" or "All" filter  
**Then** the list filters accordingly

### AC4: Filter by Category

**Given** packages have different categories  
**When** I select a category filter  
**Then** only packages in that category are shown

### AC5: Search by Name

**Given** I type in the search box  
**When** I enter text  
**Then** packages are filtered by name match (case-insensitive)

### AC6: Quick Actions

**Given** I hover over a package card  
**When** I see the action buttons  
**Then** I can:

- Click "Edit" → opens builder with package data
- Click "Duplicate" → creates copy with "Copy of" prefix
- Click toggle → activates/deactivates package

### AC7: Create New Button

**Given** the list page  
**When** I click "Create New Package"  
**Then** I navigate to the builder page (`/admin/settings/service-packages/new`)

### AC8: Empty State

**Given** no packages exist  
**When** the list loads  
**Then** I see a helpful empty state with:

- Illustration or icon
- "No service packages yet" message
- "Create your first package" button

---

## Technical Implementation

### Route File (THIN - max 50 lines)

```typescript
// src/app/(protected)/@admin/settings/service-packages/page.tsx
"use client";

import {
  ServicePackageList,
  ServicePackageListLoading,
  ServicePackageListError
} from "@/components/modules/admin/service-packages";
import { PageHeader } from "@/components/ui/page-header";

export default function ServicePackagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Packages"
        description="Configure your service offerings for studios"
      />
      <ServicePackageList />
    </div>
  );
}
```

### File Structure (MANDATORY)

```
src/components/modules/admin/service-packages/
├── list/
│   ├── service-package-list.tsx           # Main container
│   ├── service-package-list-loading.tsx   # Skeleton loading
│   ├── service-package-list-error.tsx     # Error state
│   ├── package-card.tsx                   # Individual card
│   ├── list-filters.tsx                   # Filter controls
│   └── index.ts
└── index.ts
```

### Package Card Component

```tsx
// package-card.tsx
interface PackageCardProps {
  package: Doc<"servicePackages">;
  onEdit: (id: Id<"servicePackages">) => void;
  onDuplicate: (id: Id<"servicePackages">) => void;
  onToggleActive: (id: Id<"servicePackages">, currentState: boolean) => void;
}

export function PackageCard({
  package: pkg,
  onEdit,
  onDuplicate,
  onToggleActive,
}: PackageCardProps) {
  // Calculate price range from line items
  const prices = pkg.lineItems.map((item) => item.rate * item.quantity);
  const minPrice = Math.min(...prices, 0);
  const maxPrice = prices.reduce((a, b) => a + b, 0);

  return (
    <Card className="group relative">
      <CardContent>
        <div className="flex justify-between">
          <h3 className="font-semibold">{pkg.name}</h3>
          <Badge variant={pkg.isActive ? "success" : "secondary"}>
            {pkg.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {pkg.description}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-lg font-bold">
            ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
          </span>
        </div>

        {/* Hover actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(pkg._id)}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(pkg._id)}>
                <CopyIcon className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onToggleActive(pkg._id, pkg.isActive)}
              >
                {pkg.isActive ? (
                  <>
                    <EyeOffIcon className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Backend Query

```typescript
// convex/functions/servicePackages/queries.ts

import { adminQuery } from "@/lib/customFunctions";
import { v } from "convex/values";

export const list = adminQuery({
  args: {
    categoryId: v.optional(v.id("projectCategories")),
    isActive: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("servicePackages");

    // Filter by active status
    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }

    const packages = await query.collect();

    // Filter by search (client-side for simplicity)
    let filtered = packages;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filtered = packages.filter((p) =>
        p.name.toLowerCase().includes(searchLower),
      );
    }

    // Filter by category
    if (args.categoryId) {
      filtered = filtered.filter((p) => p.categoryId === args.categoryId);
    }

    return filtered;
  },
});

export const get = adminQuery({
  args: { id: v.id("servicePackages") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT put business logic in route file
- ❌ Do NOT skip loading/error components
- ❌ Do NOT use inline components in route
- ❌ Do NOT forget to create the index.ts exports

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Navigate to `/admin/settings/service-packages`
- [ ] Manual test: Filter by status works
- [ ] Manual test: Search by name works
- [ ] Manual test: Card actions work (edit, duplicate, toggle)

---

## Files to Create

```
CREATE: src/app/(protected)/@admin/settings/service-packages/page.tsx
CREATE: src/components/modules/admin/service-packages/list/service-package-list.tsx
CREATE: src/components/modules/admin/service-packages/list/service-package-list-loading.tsx
CREATE: src/components/modules/admin/service-packages/list/service-package-list-error.tsx
CREATE: src/components/modules/admin/service-packages/list/package-card.tsx
CREATE: src/components/modules/admin/service-packages/list/list-filters.tsx
CREATE: src/components/modules/admin/service-packages/list/index.ts
CREATE: src/components/modules/admin/service-packages/index.ts

CREATE: convex/functions/servicePackages/queries.ts
```

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
