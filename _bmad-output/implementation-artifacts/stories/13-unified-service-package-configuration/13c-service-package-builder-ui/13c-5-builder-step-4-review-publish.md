# Story 13C.5: Package Builder - Step 4: Review & Publish

**Status**: backlog  
**Points**: 3  
**Epic**: [13C: Service Package Builder UI](../../../../planning-artifacts/epics/13c-service-package-builder-ui.md)  
**Depends On**: Story 13C.4

---

## User Story

**As an** Admin,  
**I want** to review and publish my package,  
**So that** studios can start selecting it.

---

## Acceptance Criteria

### AC1: Summary View

**Given** I'm on Step 4  
**When** the page loads  
**Then** I see a complete summary of:

- Package name and description
- Category badge (if set)
- Project type badge
- Folder structure preview (collapsible tree)
- Storage tier (if selected)
- All line items with pricing
- Total starting price (with GST if applicable)

### AC2: Edit Buttons

**Given** I'm viewing the summary  
**When** I want to change something  
**Then** I see edit buttons for each section  
**And** clicking them jumps back to the relevant step

### AC3: Save as Draft

**Given** I'm on Step 4  
**When** I click "Save as Draft"  
**Then** the package is created with `isActive: false`  
**And** I'm redirected to the package list with success message

### AC4: Publish Button

**Given** I'm on Step 4  
**When** I click "Publish"  
**Then** the package is created with `isActive: true`  
**And** I'm redirected to the package list with success message

### AC5: Success Confirmation

**Given** I've published a package  
**When** I see the success message  
**Then** it shows the package name (not generic)  
**And** provides a link to view the package

### AC6: Error Handling

**Given** the save fails  
**When** an error occurs  
**Then** I see an error message  
**And** the form is not cleared  
**And** I can retry

---

## Technical Implementation

### Step 4 Component

```tsx
// step-4-review.tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBuilder } from "./builder-context";
import { FolderPreview } from "./components/folder-preview";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Step4Review() {
  const router = useRouter();
  const {
    step1Data,
    step2Data,
    step3Data,
    setCurrentStep,
    isEditing,
    packageId,
  } = useBuilder();

  // Look up names for IDs
  const projectTypes = useQuery(api.projectTypes.list);
  const categories = useQuery(api.projectCategories.list);
  const storageTiers = useQuery(api.storageTiers.list);

  // Mutations
  const createPackage = useMutation(api.servicePackages.create);
  const updatePackage = useMutation(api.servicePackages.update);

  const [isSaving, setIsSaving] = useState(false);

  // Resolve names
  const projectTypeName = projectTypes?.find(
    (t) => t._id === step2Data?.projectTypeId,
  )?.name;
  const categoryName = categories?.find(
    (c) => c._id === step1Data?.categoryId,
  )?.name;
  const storageTierInfo = storageTiers?.find(
    (t) => t._id === step2Data?.defaultStorageTierId,
  );

  // Calculate totals
  const lineItems = step3Data?.lineItems ?? [];
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0,
  );
  const gstAmount = step3Data?.applyGST ? Math.round(subtotal * 0.18) : 0;
  const total = subtotal + gstAmount;

  async function handleSave(isActive: boolean) {
    if (!step1Data || !step2Data || !step3Data) {
      toast.error("Missing data. Please complete all steps.");
      return;
    }

    setIsSaving(true);

    try {
      const packageData = {
        name: step1Data.name,
        description: step1Data.description,
        categoryId: step1Data.categoryId,
        projectTypeId: step2Data.projectTypeId,
        folderTemplateId: step2Data.folderTemplateId,
        defaultStorageTierId: step2Data.defaultStorageTierId,
        lineItems: step3Data.lineItems.map((item) => ({
          id: item.id,
          sectionId: item.sectionId || undefined,
          description: item.description,
          unit: item.unit,
          rate: item.rate,
          quantity: item.quantity,
          subItems: item.subItems,
        })),
        terms: step3Data.terms,
        isActive,
      };

      if (isEditing && packageId) {
        await updatePackage({ id: packageId, ...packageData });
        toast.success(`Package "${step1Data.name}" updated!`);
      } else {
        await createPackage(packageData);
        toast.success(
          `Package "${step1Data.name}" ${isActive ? "published" : "saved as draft"}!`,
        );
      }

      router.push("/admin/settings/service-packages");
    } catch (error) {
      console.error("Failed to save package:", error);
      toast.error("Failed to save package. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Identity */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium">Package Identity</h3>
          <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <dl className="space-y-2">
          <div>
            <dt className="text-sm text-muted-foreground">Name</dt>
            <dd className="font-medium">{step1Data?.name}</dd>
          </div>
          {step1Data?.description && (
            <div>
              <dt className="text-sm text-muted-foreground">Description</dt>
              <dd>{step1Data.description}</dd>
            </div>
          )}
          {categoryName && (
            <div>
              <dt className="text-sm text-muted-foreground">Category</dt>
              <dd>
                <Badge variant="outline">{categoryName}</Badge>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Section 2: Project Configuration */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium">Project Configuration</h3>
          <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Project Type</dt>
            <dd>
              <Badge>{projectTypeName}</Badge>
            </dd>
          </div>

          {storageTierInfo && (
            <div>
              <dt className="text-sm text-muted-foreground">Storage Tier</dt>
              <dd>
                {storageTierInfo.name} ({storageTierInfo.storageGB} GB)
              </dd>
            </div>
          )}
        </div>

        <div className="mt-4">
          <dt className="text-sm text-muted-foreground mb-2">
            Folder Structure
          </dt>
          <div className="bg-muted/50 rounded p-3">
            <FolderPreview templateId={step2Data?.folderTemplateId} />
          </div>
        </div>
      </div>

      {/* Section 3: Pricing */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium">Pricing</h3>
          <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

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
            {lineItems.map((item) => (
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
            <TableRow>
              <TableCell colSpan={4}>Subtotal</TableCell>
              <TableCell className="text-right">
                ₹{subtotal.toLocaleString()}
              </TableCell>
            </TableRow>
            {step3Data?.applyGST && (
              <TableRow>
                <TableCell colSpan={4}>GST (18%)</TableCell>
                <TableCell className="text-right">
                  ₹{gstAmount.toLocaleString()}
                </TableCell>
              </TableRow>
            )}
            <TableRow className="font-bold">
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell className="text-right">
                ₹{total.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {step3Data?.terms && (
          <div className="mt-4">
            <dt className="text-sm text-muted-foreground mb-1">
              Terms & Conditions
            </dt>
            <dd className="text-sm whitespace-pre-wrap">{step3Data.terms}</dd>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(3)}
        >
          ← Back
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Save as Draft
          </Button>

          <Button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Publish Package
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Backend Create Mutation

```typescript
// convex/functions/servicePackages/mutations.ts

import { adminMutation } from "@/lib/customFunctions";
import { v } from "convex/values";

export const create = adminMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    projectTypeId: v.id("projectTypes"),
    folderTemplateId: v.id("folderTemplates"),
    defaultStorageTierId: v.optional(v.id("storageTiers")),
    lineItems: v.array(servicePackageLineItemValidator),
    terms: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const packageId = await ctx.db.insert("servicePackages", {
      ...args,
      createdBy: ctx.user?.email,
      updatedAt: Date.now(),
    });
    return packageId;
  },
});

export const update = adminMutation({
  args: {
    id: v.id("servicePackages"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    projectTypeId: v.optional(v.id("projectTypes")),
    folderTemplateId: v.optional(v.id("folderTemplates")),
    defaultStorageTierId: v.optional(v.id("storageTiers")),
    lineItems: v.optional(v.array(servicePackageLineItemValidator)),
    terms: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const toggleActive = adminMutation({
  args: { id: v.id("servicePackages") },
  handler: async (ctx, { id }) => {
    const pkg = await ctx.db.get(id);
    if (!pkg) throw new Error("Package not found");

    await ctx.db.patch(id, {
      isActive: !pkg.isActive,
      updatedAt: Date.now(),
    });
  },
});

export const duplicate = adminMutation({
  args: { id: v.id("servicePackages") },
  handler: async (ctx, { id }) => {
    const pkg = await ctx.db.get(id);
    if (!pkg) throw new Error("Package not found");

    const { _id, _creationTime, ...data } = pkg;

    return await ctx.db.insert("servicePackages", {
      ...data,
      name: `Copy of ${data.name}`,
      isActive: false,
      createdBy: ctx.user?.email,
      updatedAt: Date.now(),
    });
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT submit without validation passing
- ❌ Do NOT show generic success - show package name
- ❌ Do NOT leave user on form after success (redirect to list)
- ❌ Do NOT clear form data on error (let user retry)

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Save as Draft creates inactive package
- [ ] Manual test: Publish creates active package
- [ ] Manual test: Edit buttons jump to correct steps
- [ ] Manual test: Error handling shows message

---

## Files to Create

```
CREATE: src/components/modules/admin/service-packages/builder/step-4-review.tsx
CREATE: convex/functions/servicePackages/mutations.ts (if not exists)
  - create, update, toggleActive, duplicate
```

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
