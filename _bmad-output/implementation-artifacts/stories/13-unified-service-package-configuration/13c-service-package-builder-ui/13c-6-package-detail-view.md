# Story 13C.6: Package Detail View

**Status**: backlog  
**Points**: 2  
**Epic**: [13C: Service Package Builder UI](../../../../planning-artifacts/epics/13c-service-package-builder-ui.md)  
**Depends On**: Story 13C.1

---

## User Story

**As an** Admin,  
**I want** to view a published package's details,  
**So that** I can review what studios see.

---

## Acceptance Criteria

### AC1: Route Setup

**Given** an admin user  
**When** they navigate to `/admin/settings/service-packages/[id]`  
**Then** they see the package detail page

### AC2: Read-Only View

**Given** the detail page loads  
**When** I view the content  
**Then** I see all package information in read-only format:

- Package name and description
- Category badge
- Project type
- Folder structure preview
- Storage tier
- Line items table with pricing
- Terms and conditions

### AC3: Edit Button

**Given** I'm viewing a package  
**When** I click "Edit"  
**Then** I navigate to the builder with all data pre-filled

### AC4: Duplicate Button

**Given** I'm viewing a package  
**When** I click "Duplicate"  
**Then** a new package is created with "Copy of" prefix  
**And** I navigate to the new package's edit page

### AC5: Toggle Active Status

**Given** I'm viewing an active package  
**When** I click "Deactivate"  
**Then** the package becomes inactive  
**And** the page updates to show "Inactive" status

**Given** I'm viewing an inactive package  
**When** I click "Activate"  
**Then** the package becomes active

### AC6: Usage Statistics

**Given** the package has been used  
**When** I view the detail page  
**Then** I see usage stats:

- Number of quotations using this package
- Number of projects created from this package

---

## Technical Implementation

### Route File

```tsx
// src/app/(protected)/@admin/settings/service-packages/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import {
  PackageDetail,
  PackageDetailLoading,
  PackageDetailError,
} from "@/components/modules/admin/service-packages";
import { PageHeader } from "@/components/ui/page-header";

export default function ServicePackageDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <PackageDetail id={params.id} />
    </div>
  );
}
```

### File Structure

```
src/components/modules/admin/service-packages/
├── detail/
│   ├── package-detail.tsx             # Main container
│   ├── package-detail-loading.tsx
│   ├── package-detail-error.tsx
│   └── index.ts
└── index.ts
```

### Main Detail Component

```tsx
// package-detail.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderPreview } from "../builder/components/folder-preview";
import { PackageDetailLoading } from "./package-detail-loading";
import { PackageDetailError } from "./package-detail-error";

interface PackageDetailProps {
  id: string;
}

export function PackageDetail({ id }: PackageDetailProps) {
  const router = useRouter();

  // Queries
  const pkg = useQuery(api.servicePackages.get, { id });
  const projectTypes = useQuery(api.projectTypes.list);
  const categories = useQuery(api.projectCategories.list);
  const storageTiers = useQuery(api.storageTiers.list);
  const usageStats = useQuery(api.servicePackages.getUsageStats, { id });

  // Mutations
  const toggleActive = useMutation(api.servicePackages.toggleActive);
  const duplicatePackage = useMutation(api.servicePackages.duplicate);

  // Loading state
  if (pkg === undefined) {
    return <PackageDetailLoading />;
  }

  // Error state
  if (pkg === null) {
    return <PackageDetailError message="Package not found" />;
  }

  // Resolve names
  const projectTypeName = projectTypes?.find(
    (t) => t._id === pkg.projectTypeId,
  )?.name;
  const categoryName = categories?.find((c) => c._id === pkg.categoryId)?.name;
  const storageTier = storageTiers?.find(
    (t) => t._id === pkg.defaultStorageTierId,
  );

  // Calculate totals
  const subtotal = pkg.lineItems.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0,
  );
  const gstAmount = Math.round(subtotal * 0.18); // Assuming GST applied
  const total = subtotal + gstAmount;

  async function handleEdit() {
    router.push(`/admin/settings/service-packages/${id}/edit`);
  }

  async function handleDuplicate() {
    try {
      const newId = await duplicatePackage({ id });
      toast.success(`Package duplicated!`);
      router.push(`/admin/settings/service-packages/${newId}/edit`);
    } catch (error) {
      toast.error("Failed to duplicate package");
    }
  }

  async function handleToggleActive() {
    try {
      await toggleActive({ id });
      toast.success(pkg.isActive ? "Package deactivated" : "Package activated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{pkg.name}</h1>
            <Badge variant={pkg.isActive ? "success" : "secondary"}>
              {pkg.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          {pkg.description && (
            <p className="text-muted-foreground mt-1">{pkg.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <CopyIcon className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant={pkg.isActive ? "destructive" : "default"}
            onClick={handleToggleActive}
          >
            {pkg.isActive ? (
              <>
                <EyeOffIcon className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <EyeIcon className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Usage Stats */}
      {usageStats && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {usageStats.quotationCount}
              </div>
              <div className="text-sm text-muted-foreground">Quotations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {usageStats.projectCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Projects Created
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm text-muted-foreground">Category</dt>
              <dd>
                {categoryName ? (
                  <Badge variant="outline">{categoryName}</Badge>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Project Type</dt>
              <dd>
                <Badge>{projectTypeName}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Storage Tier</dt>
              <dd>
                {storageTier
                  ? `${storageTier.name} (${storageTier.storageGB} GB)`
                  : "Not set"}
              </dd>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Folder Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <FolderPreview templateId={pkg.folderTemplateId} />
          </CardContent>
        </Card>
      </div>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pkg.lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">
                    ₹{item.rate.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ₹{(item.rate * item.quantity).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold">
                <TableCell colSpan={4}>Starting From</TableCell>
                <TableCell className="text-right">
                  ₹{total.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Terms */}
      {pkg.terms && (
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{pkg.terms}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Usage Stats Query

```typescript
// convex/functions/servicePackages/queries.ts

export const getUsageStats = adminQuery({
  args: { id: v.id("servicePackages") },
  handler: async (ctx, { id }) => {
    // Count quotations that include this package
    const quotations = await ctx.db.query("quotations").collect();

    const quotationCount = quotations.filter((q) =>
      q.selectedPackageIds?.includes(id),
    ).length;

    // Count projects where the quotation included this package
    // This would require more complex logic, simplified for now
    const projectCount = 0; // TODO: Implement if needed

    return {
      quotationCount,
      projectCount,
    };
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT allow editing inline (use the builder)
- ❌ Do NOT forget loading/error states
- ❌ Do NOT skip usage stats (helps admins understand impact)

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: View package details
- [ ] Manual test: Edit button opens builder
- [ ] Manual test: Duplicate creates copy
- [ ] Manual test: Toggle status works

---

## Files to Create

```
CREATE: src/app/(protected)/@admin/settings/service-packages/[id]/page.tsx
CREATE: src/components/modules/admin/service-packages/detail/package-detail.tsx
CREATE: src/components/modules/admin/service-packages/detail/package-detail-loading.tsx
CREATE: src/components/modules/admin/service-packages/detail/package-detail-error.tsx
CREATE: src/components/modules/admin/service-packages/detail/index.ts

UPDATE: convex/functions/servicePackages/queries.ts
  - Add getUsageStats
```

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
