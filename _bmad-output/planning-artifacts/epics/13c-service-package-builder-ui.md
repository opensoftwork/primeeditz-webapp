# Epic 13C: Service Package Builder UI

**Parent Epic**: [13: Unified Service Package Configuration](./13-unified-service-package-configuration.md)  
**Status**: Backlog  
**Created**: 2026-01-27  
**Updated**: 2026-01-28  
**Complexity**: High  
**Estimated Points**: 21

---

## 📋 Epic Summary

This epic creates a unified admin wizard for configuring Service Packages (formerly quotation templates). Key features:

1. **Unified Wizard**: 4-step flow to create a complete package
2. **Project Config**: Select project type, folder template, storage tier
3. **Pricing Only**: Line items for display/pricing, no spawning config
4. **Preview**: See what studios will see before publishing

---

## 🎯 User Outcomes

| Role      | Outcome                                             |
| :-------- | :-------------------------------------------------- |
| **Admin** | Create complete service packages in ONE wizard flow |
| **Admin** | See all configuration in one place                  |
| **Admin** | Preview what studios will see before publishing     |

---

## 📐 Module Architecture

**All components MUST follow Clean Code Standards (`09-clean-code-standards.md`)!**

### Module Structure (MANDATORY)

```
src/components/modules/admin/service-packages/
├── list/
│   ├── service-package-list.tsx           # Container
│   ├── service-package-list-loading.tsx   # Loading state
│   ├── service-package-list-error.tsx     # Error state
│   ├── package-card.tsx                   # Presentational
│   ├── list-filters.tsx                   # Filter controls
│   └── index.ts
├── builder/
│   ├── package-builder.tsx                # Main wizard container
│   ├── package-builder-loading.tsx
│   ├── package-builder-error.tsx
│   ├── builder-context.tsx                # Wizard state context
│   ├── step-1-identity.tsx               # Step components
│   ├── step-2-project-config.tsx
│   ├── step-3-pricing.tsx
│   ├── step-4-review.tsx
│   ├── components/
│   │   ├── folder-preview.tsx            # Shows folder structure
│   │   ├── line-item-row.tsx             # Editable line item
│   │   ├── storage-selector.tsx          # Storage tier picker
│   │   └── step-navigation.tsx           # Next/Back buttons
│   └── index.ts
├── detail/
│   ├── package-detail.tsx
│   ├── package-detail-loading.tsx
│   ├── package-detail-error.tsx
│   └── index.ts
└── index.ts
```

---

## 📝 User Stories

### Story 13C.1: Service Package List Page

**Points**: 3

**As an** Admin,  
**I want** to see all my service packages in one place,  
**So that** I can manage my product offerings.

**Acceptance Criteria**:

- [ ] List page at `/admin/settings/service-packages`
- [ ] Package card shows: Name, Category, Price Range, Status (Active/Inactive)
- [ ] Filter by: Category, Status (Active/All)
- [ ] Search by name
- [ ] Quick actions: Edit, Duplicate, Activate/Deactivate
- [ ] "Create New Package" button → opens wizard
- [ ] Empty state with helpful prompt

**Technical Pattern**:

- **Route File**: `src/app/(protected)/@admin/settings/service-packages/page.tsx`
- **Query**: Use `useQuery(api.servicePackages.list)`
- **Auth Wrapper (backend)**: `adminQuery`

**Route File (THIN - max 50 lines)**:

```tsx
// src/app/(protected)/@admin/settings/service-packages/page.tsx
"use client";

import {
  ServicePackageList,
  ServicePackageListLoading,
  ServicePackageListError,
} from "@/components/modules/admin/service-packages";
import { AppLayout } from "@/components/layout";

export default function ServicePackagesPage() {
  return (
    <AppLayout>
      <ServicePackageList />
    </AppLayout>
  );
}
```

**Component Exports (MANDATORY)**:

```typescript
// src/components/modules/admin/service-packages/list/index.ts
export { ServicePackageList } from "./service-package-list";
export { ServicePackageListLoading } from "./service-package-list-loading";
export { ServicePackageListError } from "./service-package-list-error";
```

**❌ DO NOT**:

- Do NOT put business logic in route file
- Do NOT skip loading/error components
- Do NOT use inline components in route

**Files to Create**:

```
CREATE: src/app/(protected)/@admin/settings/service-packages/page.tsx
CREATE: src/components/modules/admin/service-packages/list/service-package-list.tsx
CREATE: src/components/modules/admin/service-packages/list/service-package-list-loading.tsx
CREATE: src/components/modules/admin/service-packages/list/service-package-list-error.tsx
CREATE: src/components/modules/admin/service-packages/list/package-card.tsx
CREATE: src/components/modules/admin/service-packages/list/index.ts
CREATE: src/components/modules/admin/service-packages/index.ts

CREATE: convex/functions/servicePackages/queries.ts
  - list: adminQuery - returns all packages
  - get: adminQuery - returns single package by ID
```

---

### Story 13C.2: Package Builder - Step 1: Identity

**Points**: 3

**As an** Admin,  
**I want** to enter basic package information,  
**So that** studios understand what they're purchasing.

**Acceptance Criteria**:

- [ ] Step 1 of wizard: "Package Identity"
- [ ] Fields:
  - Package Name (required, max 100 chars)
  - Description (optional, max 500 chars)
  - Category (dropdown from `projectCategories`)
- [ ] Real-time validation with error messages
- [ ] "Next" button to Step 2 (enabled when valid)

**Technical Pattern**:

- **Form**: TanStack Form + Zod
- **File**: `src/components/modules/admin/service-packages/builder/step-1-identity.tsx`

**Form Implementation (MANDATORY)**:

```tsx
// step-1-identity.tsx
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const step1Schema = z.object({
  name: z.string().min(1, "Package name is required").max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
});

export function Step1Identity({ onNext, initialData }) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      categoryId: initialData?.categoryId ?? "",
    },
    validators: {
      onSubmit: step1Schema,
      onBlur: step1Schema,
    },
    onSubmit: async ({ value }) => {
      onNext(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Package Name</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Wedding Photography Package"
              />
              <FieldDescription>
                The name studios will see when selecting packages.
              </FieldDescription>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />
      {/* More fields... */}
    </form>
  );
}
```

**❌ DO NOT**:

- Do NOT use uncontrolled inputs
- Do NOT skip `aria-invalid` for accessibility
- Do NOT validate only on submit (use `onBlur` too)

**Files to Create**:

```
CREATE: src/components/modules/admin/service-packages/builder/step-1-identity.tsx
CREATE: src/components/modules/admin/service-packages/builder/builder-context.tsx
```

---

### Story 13C.3: Package Builder - Step 2: Project Configuration

**Points**: 5

**As an** Admin,  
**I want** to configure what project gets created from this package,  
**So that** I define the delivery structure upfront.

**Acceptance Criteria**:

- [ ] Step 2: "Project Configuration"
- [ ] Project Type selector (from `projectTypes`, required)
- [ ] Folder Template selector (filtered by selected project type)
  - Shows template variant labels
  - Preview of folder structure on selection
- [ ] Default Storage Tier selector (from `storageTiers`, optional)
  - Shows GB and price
- [ ] Visual preview panel showing:
  - Selected project type badge
  - Folder structure tree (collapsible)
  - Storage allocation

**Technical Pattern**:

- **File**: `src/components/modules/admin/service-packages/builder/step-2-project-config.tsx`
- **Queries**:
  - `useQuery(api.projectTypes.list)`
  - `useQuery(api.folderTemplates.listByProjectType, { projectTypeId })`
  - `useQuery(api.storageTiers.list)`

**Form Schema**:

```typescript
const step2Schema = z.object({
  projectTypeId: z.string().min(1, "Project type is required"),
  folderTemplateId: z.string().min(1, "Folder template is required"),
  defaultStorageTierId: z.string().optional(),
});
```

**Folder Preview Component**:

```tsx
// components/folder-preview.tsx
interface FolderPreviewProps {
  templateId: string | undefined;
}

export function FolderPreview({ templateId }: FolderPreviewProps) {
  const template = useQuery(
    api.folderTemplates.get,
    templateId ? { id: templateId } : "skip",
  );

  if (!templateId) return <div className="text-muted">Select a template</div>;
  if (template === undefined) return <Spinner />;
  if (!template) return <div className="text-muted">Template not found</div>;

  return (
    <div className="font-mono text-sm">
      {template.folders.map((folder) => (
        <FolderNode key={folder.path} folder={folder} level={0} />
      ))}
    </div>
  );
}
```

**❌ DO NOT**:

- Do NOT allow proceeding without project type
- Do NOT show all folder templates (filter by project type!)
- Do NOT inline complex preview logic in the form

**Files to Create**:

```
CREATE: src/components/modules/admin/service-packages/builder/step-2-project-config.tsx
CREATE: src/components/modules/admin/service-packages/builder/components/folder-preview.tsx
CREATE: src/components/modules/admin/service-packages/builder/components/storage-selector.tsx
```

---

### Story 13C.4: Package Builder - Step 3: Pricing

**Points**: 5

**As an** Admin,  
**I want** to configure the pricing structure,  
**So that** I can generate accurate quotations.

**Acceptance Criteria**:

- [ ] Step 3: "Pricing & Terms"
- [ ] Line Items section:
  - Add line item button
  - For each item: Description, Section, Unit, Rate, Default Qty
  - Remove item button (X icon)
  - Running subtotal display
- [ ] Section selector (from `quotationSections`)
- [ ] Sub-items support (nested descriptions with optional amounts)
- [ ] Terms & Conditions text area
- [ ] GST toggle (apply 18% or not)

**Technical Pattern**:

- **File**: `src/components/modules/admin/service-packages/builder/step-3-pricing.tsx`
- **Array Fields**: Use TanStack Form array mode

**Line Item Schema**:

```typescript
const lineItemSchema = z.object({
  id: z.string(),
  sectionId: z.string().optional(),
  description: z.string().min(1, "Description required"),
  unit: z.string().default("per project"),
  rate: z.number().min(0),
  quantity: z.number().min(1).default(1),
  subItems: z
    .array(
      z.object({
        description: z.string(),
        amount: z.number().optional(),
      }),
    )
    .optional(),
});

const step3Schema = z.object({
  lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
  terms: z.string().optional(),
  applyGST: z.boolean().default(true),
});
```

**Array Field Usage (TanStack Form)**:

```tsx
<form.Field
  name="lineItems"
  mode="array"
  children={(field) => (
    <>
      {field.state.value.map((_, index) => (
        <LineItemRow
          key={index}
          form={form}
          index={index}
          onRemove={() => field.removeValue(index)}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          field.pushValue({
            id: nanoid(),
            description: "",
            unit: "per project",
            rate: 0,
            quantity: 1,
          })
        }
      >
        Add Line Item
      </Button>
    </>
  )}
/>
```

**❌ DO NOT**:

- Do NOT add `spawnsProject` or `projectTypeId` to line items
- Do NOT store project config in line items
- Do NOT forget unique `id` for each line item

**Files to Create**:

```
CREATE: src/components/modules/admin/service-packages/builder/step-3-pricing.tsx
CREATE: src/components/modules/admin/service-packages/builder/components/line-item-row.tsx
```

---

### Story 13C.5: Package Builder - Step 4: Review & Publish

**Points**: 3

**As an** Admin,  
**I want** to review and publish my package,  
**So that** studios can start selecting it.

**Acceptance Criteria**:

- [ ] Step 4: "Review & Publish"
- [ ] Summary view showing:
  - Package name, description, category
  - Project type badge
  - Folder structure preview
  - Storage tier
  - All line items with pricing
  - Total starting price (with GST if applicable)
- [ ] Edit buttons to jump back to specific steps
- [ ] "Save as Draft" button
- [ ] "Publish" button (sets `isActive: true`)
- [ ] Success confirmation with link to package list

**Technical Pattern**:

- **File**: `src/components/modules/admin/service-packages/builder/step-4-review.tsx`
- **Mutation**: `useMutation(api.servicePackages.create)` or `update`

**Mutation (Backend)**:

```typescript
// convex/functions/servicePackages/mutations.ts
import { adminMutation } from "@/lib/customFunctions";

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
```

**❌ DO NOT**:

- Do NOT submit without validation passing
- Do NOT show generic success - show package name
- Do NOT leave user on form after success (redirect to list)

**Files to Create**:

```
CREATE: src/components/modules/admin/service-packages/builder/step-4-review.tsx
CREATE: convex/functions/servicePackages/mutations.ts
  - create: adminMutation
  - update: adminMutation
  - toggleActive: adminMutation
  - duplicate: adminMutation
```

---

### Story 13C.6: Package Detail View

**Points**: 2

**As an** Admin,  
**I want** to view a published package's details,  
**So that** I can review what studios see.

**Acceptance Criteria**:

- [ ] Detail page at `/admin/settings/service-packages/[id]`
- [ ] Read-only view of all configuration
- [ ] "Edit" button → opens wizard with pre-filled data
- [ ] "Duplicate" button → creates copy with "Copy of" prefix
- [ ] "Deactivate/Activate" button (toggles `isActive`)
- [ ] Usage stats: How many quotations use this package

**Technical Pattern**:

- **Route File**: `src/app/(protected)/@admin/settings/service-packages/[id]/page.tsx`
- **Module**: `src/components/modules/admin/service-packages/detail/`

**Files to Create**:

```
CREATE: src/app/(protected)/@admin/settings/service-packages/[id]/page.tsx
CREATE: src/components/modules/admin/service-packages/detail/package-detail.tsx
CREATE: src/components/modules/admin/service-packages/detail/package-detail-loading.tsx
CREATE: src/components/modules/admin/service-packages/detail/package-detail-error.tsx
CREATE: src/components/modules/admin/service-packages/detail/index.ts
```

---

## ✅ Definition of Done

- [ ] List page shows all service packages with filters
- [ ] 4-step wizard fully functional
- [ ] Packages can be created, edited, duplicated
- [ ] TanStack Form used for all forms with Zod validation
- [ ] Loading/Error components for all containers
- [ ] All exports from `index.ts` files
- [ ] Publish/Deactivate toggle working
- [ ] `pnpm tsc` has no type errors
- [ ] `pnpm build` succeeds

---

## 🧪 Testing Requirements

- [ ] Types pass: `pnpm tsc --noEmit`
- [ ] Build passes: `pnpm build`
- [ ] Manual test: Create package through wizard
- [ ] Manual test: Edit existing package
- [ ] Manual test: Duplicate package
- [ ] Manual test: Toggle active status

---

## 🔗 Dependencies

| Depends On   | Notes                                 |
| :----------- | :------------------------------------ |
| **Epic 13A** | `servicePackages` table must exist    |
| **Epic 13B** | Folder templates needed for selection |

| Blocks       | Notes                                  |
| :----------- | :------------------------------------- |
| **Epic 13D** | Old UIs removed after this is complete |

---

_Document Version: 2.0_  
_Last Updated: 2026-01-28 12:45 IST_
