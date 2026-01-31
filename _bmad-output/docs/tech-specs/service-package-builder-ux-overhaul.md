# Tech Spec: Service Package Builder UX Overhaul

**Author:** Sally (UX Designer) + Life-design  
**Created:** 2026-01-31  
**Status:** Draft  
**Epic:** 13G (proposed) or extension of 13F

---

## 1. Executive Summary

This tech spec addresses critical UX issues in the Service Package Builder wizard:

1. **No progress persistence** — Users lose all work if they navigate away mid-creation
2. **Step 3 (Pricing & Terms) has poor UX** — Dense table layout, missing GST toggle, disconnected summary
3. **Inconsistent design language** — Step 3 doesn't match Steps 1-2 styling

### Scope

| Area                 | Changes                                                   |
| -------------------- | --------------------------------------------------------- |
| **Backend**          | New `servicePackageDrafts` table, draft mutations/queries |
| **Frontend Context** | Refactor `BuilderProvider` to use backend drafts          |
| **Step 3 UI**        | Compact row cards, sticky pricing sidebar, GST toggle     |
| **Step 3 UX**        | Better field organization, inline section creation        |

### Field Component Compliance Audit

> **Reference:** `_bmad-output/docs/ui/field.md`

| Component                 | Uses `Field`? | Uses `FieldLabel`? | Uses `FieldError`? | Status               |
| ------------------------- | ------------- | ------------------ | ------------------ | -------------------- |
| `step-1-identity.tsx`     | ✅ Yes        | ✅ Yes             | ✅ Yes             | ✅ **Compliant**     |
| `project-config-card.tsx` | ✅ Yes        | ✅ Yes             | ✅ Yes             | ✅ **Compliant**     |
| `storage-selector.tsx`    | ✅ Yes        | ✅ Yes             | ⚠️ Partial         | ✅ Mostly Compliant  |
| `step-3-pricing.tsx`      | ⚠️ Partial    | ❌ No              | ✅ Yes             | ⚠️ **Needs Update**  |
| `line-item-row.tsx`       | ❌ No         | ❌ No              | ❌ No              | ❌ **Not Compliant** |

**Key Finding:** `line-item-row.tsx` does NOT use the Field component system — it uses raw HTML labels and manual error handling. This tech spec addresses this by replacing it with a new `LineItemCard` component that properly uses `Field`, `FieldLabel`, `FieldError`, and `FieldGroup`.

## 2. Architecture: Draft Persistence

### 2.1 New Schema: `servicePackageDrafts`

Following the pattern established by the Project Wizard (`projects` table with `status: "draft"`), we'll create a dedicated draft table.

```typescript
// convex/schema.ts

servicePackageDrafts: defineTable({
  // Step tracking
  lastStep: v.number(), // 1, 2, 3, or 4

  // Step 1: Identity
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  categoryId: v.optional(v.id("projectCategories")),

  // Step 2: Project Configuration
  projectConfigs: v.optional(v.array(projectConfigValidator)),

  // Step 3: Pricing & Terms
  lineItems: v.optional(v.array(servicePackageLineItemValidator)),
  terms: v.optional(v.string()),
  applyGST: v.optional(v.boolean()),

  // Audit
  createdBy: v.string(), // Profile ID or user ID
  updatedAt: v.number(),
})
  .index("by_createdBy", ["createdBy"]),
```

### 2.2 New Mutations

```typescript
// convex/functions/servicePackages/drafts/mutations.ts

// Create a new draft (called on wizard mount if no existing draft)
export const createDraft = adminMutation({
  args: {},
  handler: async (ctx) => {
    const profile = await getCurrentProfile(ctx);

    // Check for existing draft
    const existing = await ctx.db
      .query("servicePackageDrafts")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", profile._id))
      .first();

    if (existing) {
      return { draftId: existing._id, isNew: false };
    }

    const draftId = await ctx.db.insert("servicePackageDrafts", {
      lastStep: 1,
      createdBy: profile._id,
      updatedAt: Date.now(),
    });

    return { draftId, isNew: true };
  },
});

// Update draft (called on step navigation)
export const updateDraft = adminMutation({
  args: {
    draftId: v.id("servicePackageDrafts"),
    lastStep: v.optional(v.number()),
    // Step 1
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    // Step 2
    projectConfigs: v.optional(v.array(projectConfigValidator)),
    // Step 3
    lineItems: v.optional(v.array(servicePackageLineItemValidator)),
    terms: v.optional(v.string()),
    applyGST: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { draftId, ...updates } = args;
    await ctx.db.patch(draftId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete draft (called on cancel or successful publish)
export const deleteDraft = adminMutation({
  args: { draftId: v.id("servicePackageDrafts") },
  handler: async (ctx, { draftId }) => {
    await ctx.db.delete(draftId);
  },
});

// Publish draft → Creates real servicePackage
export const publishDraft = adminMutation({
  args: { draftId: v.id("servicePackageDrafts") },
  handler: async (ctx, { draftId }) => {
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error("Draft not found");

    // Validate required fields
    if (!draft.name) throw new Error("Package name is required");
    if (!draft.projectConfigs?.length)
      throw new Error("At least one project config is required");
    if (!draft.lineItems?.length)
      throw new Error("At least one line item is required");

    // Create the service package
    const packageId = await ctx.db.insert("servicePackages", {
      name: draft.name,
      description: draft.description,
      categoryId: draft.categoryId,
      projectConfigs: draft.projectConfigs,
      lineItems: draft.lineItems,
      terms: draft.terms,
      applyGST: draft.applyGST ?? true,
      isActive: true,
      createdBy: draft.createdBy,
      updatedAt: Date.now(),
    });

    // Delete the draft
    await ctx.db.delete(draftId);

    return packageId;
  },
});
```

### 2.3 New Queries

```typescript
// convex/functions/servicePackages/drafts/queries.ts

// Get active draft for current user
export const getActiveDraft = adminQuery({
  args: {},
  handler: async (ctx) => {
    const profile = await getCurrentProfile(ctx);

    return await ctx.db
      .query("servicePackageDrafts")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", profile._id))
      .first();
  },
});
```

---

## 3. Frontend: BuilderContext Refactor

### 3.1 Current Architecture Issues

- State is stored only in React `useState`
- No persistence across page reloads
- No draft resume capability

### 3.2 New Architecture

```tsx
// builder-context.tsx (refactored)

export function BuilderProvider({ children, packageId }: Props) {
  const [draftId, setDraftId] = useState<Id<"servicePackageDrafts"> | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mutations
  const createDraftMutation = useMutation(
    api.functions.servicePackages.drafts.mutations.createDraft,
  );
  const updateDraftMutation = useMutation(
    api.functions.servicePackages.drafts.mutations.updateDraft,
  );
  const deleteDraftMutation = useMutation(
    api.functions.servicePackages.drafts.mutations.deleteDraft,
  );
  const publishDraftMutation = useMutation(
    api.functions.servicePackages.drafts.mutations.publishDraft,
  );

  // Query for existing draft
  const existingDraft = useQuery(
    api.functions.servicePackages.drafts.queries.getActiveDraft,
    packageId ? "skip" : {}, // Skip if editing existing package
  );

  // Initialize draft on mount
  useEffect(() => {
    if (packageId || isInitialized) return;
    if (existingDraft === undefined) return; // Loading

    const initDraft = async () => {
      if (existingDraft) {
        // Resume existing draft
        setDraftId(existingDraft._id);
        setCurrentStep(existingDraft.lastStep || 1);
        // Populate form data from draft...
      } else {
        // Create new draft
        const result = await createDraftMutation({});
        setDraftId(result.draftId);
      }
      setIsInitialized(true);
    };

    initDraft();
  }, [existingDraft, packageId, isInitialized]);

  // Save draft on step navigation
  const goToStep = useCallback(
    async (step: number) => {
      setCurrentStep(step);

      if (draftId) {
        await updateDraftMutation({
          draftId,
          lastStep: step,
          // Include current form data...
        });
      }
    },
    [draftId, updateDraftMutation],
  );

  // Cancel and delete draft
  const cancelWizard = useCallback(async () => {
    if (draftId) {
      await deleteDraftMutation({ draftId });
    }
    // Navigate away...
  }, [draftId, deleteDraftMutation]);

  // Publish draft
  const publishPackage = useCallback(async () => {
    if (!draftId) return;

    const packageId = await publishDraftMutation({ draftId });
    return packageId;
  }, [draftId, publishDraftMutation]);

  // ... rest of context
}
```

---

## 4. Step 3 UI Redesign

### 4.1 Current Problems (from UX Audit)

| Issue                      | Impact                             | Priority  |
| -------------------------- | ---------------------------------- | --------- |
| Dense table layout         | Hard to scan, mobile-unfriendly    | 🔴 High   |
| No GST toggle in UI        | User can't control tax calculation | 🔴 High   |
| Amount hidden in corner    | Key info not prominent             | 🟠 Medium |
| "Add Phase" under dropdown | Confusing placement                | 🟠 Medium |
| Drag handle non-functional | Misleading affordance              | 🟡 Low    |
| Summary disconnected       | Not visible while editing          | 🟠 Medium |

### 4.2 New Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📊 PRICING & TERMS                                          Step 3  │
│ Define the default cost structure and legal terms...                │
├───────────────────────────────────────────┬─────────────────────────┤
│ SERVICE LINE ITEMS          [+ Add Item] │ LIVE PRICING SUMMARY    │
├───────────────────────────────────────────┤ (Sticky on scroll)      │
│ ┌───────────────────────────────────────┐ │                         │
│ │ 📦 Grand Video Edit (Main)       🗑  │ │ Breakdown by Project    │
│ │ ├─ Description: Main Service...     │ │ ● Grand Video: ₹1,500   │
│ │ ├─ Section: [Production ▼]          │ │                         │
│ │ ├─ Unit: per project                │ │ ─────────────────────── │
│ │ └─ ₹0 × 1 = ₹0                      │ │ Subtotal:        ₹1,500 │
│ └───────────────────────────────────────┘ │                         │
│ ┌───────────────────────────────────────┐ │ ┌─────────────────────┐ │
│ │ 📦 Social Media Cut              🗑  │ │ │ □ Apply GST (18%)   │ │
│ │ ├─ Description: Social clips...     │ │ │   +₹270              │ │
│ │ ├─ Section: [Post-Production ▼]     │ │ └─────────────────────┘ │
│ │ ├─ Unit: per video                  │ │                         │
│ │ └─ ₹500 × 3 = ₹1,500                │ │ ═════════════════════   │
│ └───────────────────────────────────────┘ │ PACKAGE TOTAL: ₹1,770  │
│                                           │ Final cost to client    │
│ ┌───────────────────────────────────────┐ └─────────────────────────┤
│ │ [+] Add Another Line Item            │                           │
│ └───────────────────────────────────────┘                           │
├─────────────────────────────────────────────────────────────────────┤
│ 📝 TERMS & CONDITIONS                                    [245/2000] │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Define payment milestones, cancellation policies...            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Compact Row Card Component

> **Important:** This component uses the project's `Field` component system from `@/components/ui/field`. See `_bmad-output/docs/ui/field.md` for full API reference.

#### Imports Required

```tsx
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
```

#### Component Implementation

```tsx
// components/line-item-card.tsx

export function LineItemCard({
  form,
  index,
  sections,
  projectConfigs,
  onRemove,
  canRemove,
}: LineItemCardProps) {
  return (
    <Card className="relative group bg-zinc-900/30 border-white/5 rounded-2xl backdrop-blur-sm overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

      {/* Remove button */}
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}

      <CardContent className="relative p-5 space-y-4">
        {/* Header Row: Project + Description */}
        <FieldGroup className="grid grid-cols-12 gap-4">
          {/* Project Field */}
          <form.Field name={`lineItems[${index}].projectConfigId`}>
            {(field) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field className="col-span-4" data-invalid={hasError}>
                  <FieldLabel htmlFor={`project-${index}`}>Project</FieldLabel>
                  <Select
                    value={field.state.value || "__general__"}
                    onValueChange={(val) =>
                      field.handleChange(val === "__general__" ? "" : val)
                    }
                  >
                    <SelectTrigger
                      id={`project-${index}`}
                      className="h-10 bg-black/20 border-white/5 rounded-xl"
                      aria-invalid={hasError}
                    >
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10 rounded-xl">
                      <SelectItem
                        value="__general__"
                        className="focus:bg-white/5 rounded-lg mx-1 my-0.5 italic text-white/40"
                      >
                        General / Shared
                      </SelectItem>
                      {projectConfigs.map((config) => (
                        <SelectItem
                          key={config.id}
                          value={config.id}
                          className="focus:bg-primary/20 rounded-lg mx-1 my-0.5"
                        >
                          {config.label || "Untitled"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          {/* Description Field */}
          <form.Field name={`lineItems[${index}].description`}>
            {(field) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field className="col-span-8" data-invalid={hasError}>
                  <FieldLabel htmlFor={`description-${index}`}>
                    Description
                  </FieldLabel>
                  <Input
                    id={`description-${index}`}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Service description..."
                    aria-invalid={hasError}
                    className="h-10 bg-black/20 border-white/5 rounded-xl"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        {/* Details Row: Section + Unit + Rate × Qty = Amount */}
        <FieldGroup className="grid grid-cols-12 gap-4 items-end">
          {/* Section Field */}
          <form.Field name={`lineItems[${index}].sectionId`}>
            {(field) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field className="col-span-3" data-invalid={hasError}>
                  <FieldLabel htmlFor={`section-${index}`}>Section</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger
                      id={`section-${index}`}
                      className="h-10 bg-black/20 border-white/5 rounded-xl"
                      aria-invalid={hasError}
                    >
                      <SelectValue placeholder="Phase..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10 rounded-xl">
                      {sections.map((section) => (
                        <SelectItem
                          key={section._id}
                          value={section._id}
                          className="focus:bg-primary/20 rounded-lg mx-1 my-0.5"
                        >
                          {section.name}
                        </SelectItem>
                      ))}
                      {/* Inline "New Section" option */}
                      <SectionQuickCreateInline
                        onCreated={field.handleChange}
                      />
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          {/* Unit Field */}
          <form.Field name={`lineItems[${index}].unit`}>
            {(field) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field className="col-span-2" data-invalid={hasError}>
                  <FieldLabel htmlFor={`unit-${index}`}>Unit</FieldLabel>
                  <Input
                    id={`unit-${index}`}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="per project"
                    aria-invalid={hasError}
                    className="h-10 bg-black/20 border-white/5 rounded-xl text-sm"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          {/* Rate Field */}
          <form.Field name={`lineItems[${index}].rate`}>
            {(field) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field className="col-span-2" data-invalid={hasError}>
                  <FieldLabel htmlFor={`rate-${index}`}>Rate (₹)</FieldLabel>
                  <Input
                    id={`rate-${index}`}
                    type="number"
                    min={0}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    aria-invalid={hasError}
                    className="h-10 bg-black/20 border-white/5 rounded-xl text-sm"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          {/* Multiplication Symbol */}
          <div className="col-span-1 flex items-center justify-center text-white/20 font-black text-xs pb-2">
            ×
          </div>

          {/* Quantity Field */}
          <form.Field name={`lineItems[${index}].quantity`}>
            {(field) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field className="col-span-2" data-invalid={hasError}>
                  <FieldLabel htmlFor={`quantity-${index}`}>Qty</FieldLabel>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min={1}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    aria-invalid={hasError}
                    className="h-10 bg-black/20 border-white/5 rounded-xl text-sm"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          {/* Computed Amount (Read-only display) */}
          <div className="col-span-2">
            <FieldLabel className="block">Amount</FieldLabel>
            <form.Subscribe
              selector={(state) => {
                const item = state.values.lineItems[index];
                return (item?.rate || 0) * (item?.quantity || 1);
              }}
            >
              {(amount: number) => (
                <div className="h-10 flex items-center justify-end pr-2 bg-primary/5 rounded-xl border border-white/5">
                  <span className="text-sm font-black text-white">
                    ₹{amount.toLocaleString()}
                  </span>
                </div>
              )}
            </form.Subscribe>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
```

#### Key Field Component Patterns Used

| Component    | Usage                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| `Field`      | Wrapper for each form field with `data-invalid` for error styling        |
| `FieldLabel` | Accessible label with `htmlFor` linking to input `id`                    |
| `FieldError` | Renders validation errors from TanStack Form's `field.state.meta.errors` |
| `FieldGroup` | Groups related fields with proper spacing                                |

#### TanStack Form Integration

```tsx
// Pattern for connecting Field components to TanStack Form fields:
<form.Field name={`lineItems[${index}].fieldName`}>
  {(field) => {
    const hasError =
      field.state.meta.errors.length > 0 && field.state.meta.isTouched;
    return (
      <Field data-invalid={hasError}>
        <FieldLabel htmlFor={`fieldName-${index}`}>Label</FieldLabel>
        <Input
          id={`fieldName-${index}`}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={hasError}
        />
        <FieldError errors={field.state.meta.errors} />
      </Field>
    );
  }}
</form.Field>
```

### 4.4 Sticky Pricing Sidebar

> **Note:** Uses `Field` with `orientation="horizontal"` for the GST toggle switch pattern.

```tsx
// components/pricing-sidebar.tsx

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";

export function PricingSidebar({
  lineItems,
  projectConfigs,
  applyGST,
  onToggleGST,
}: PricingSidebarProps) {
  // ... calculation logic same as before

  return (
    <div className="sticky top-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" />
        <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
          Live Pricing Summary
        </h3>
      </div>

      {/* Breakdown Card */}
      <Card className="bg-zinc-900/30 border-white/5 rounded-3xl p-6 space-y-6">
        {/* Project Breakdown */}
        <div className="space-y-3">
          {groupedTotals.map((group) => (
            <div key={group.id} className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/60">
                {group.label}
              </span>
              <span className="text-xs font-black text-white">
                ₹{group.subtotal.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <Separator className="bg-white/5" />

        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Subtotal
          </span>
          <span className="text-sm font-black text-white">
            ₹{subtotal.toLocaleString()}
          </span>
        </div>

        {/* GST Toggle - Using Field with horizontal orientation */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <Field orientation="horizontal" className="justify-between">
            <Switch
              checked={applyGST}
              onCheckedChange={onToggleGST}
              id="gst-toggle"
            />
            <FieldContent className="flex-1 ml-3">
              <FieldLabel htmlFor="gst-toggle" className="cursor-pointer">
                Apply GST (18%)
              </FieldLabel>
              <FieldDescription>
                {applyGST
                  ? `Adds ₹${gstAmount.toLocaleString()} to the total`
                  : "Tax excluded from total"}
              </FieldDescription>
            </FieldContent>
            <span className="text-sm font-black text-primary tabular-nums">
              {applyGST ? `+₹${gstAmount.toLocaleString()}` : "—"}
            </span>
          </Field>
        </div>

        <Separator className="bg-white/5" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ReceiptIndianRupee className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-black text-white uppercase tracking-widest">
              Package Total
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">
              ₹{total.toLocaleString()}
            </span>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
              Final cost to client
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

---

## 5. Implementation Stories

### Story 1: Schema & Backend Draft Persistence

**Points:** 5  
**Description:** Add `servicePackageDrafts` table with CRUD mutations and query.

**Tasks:**

- [ ] Add `servicePackageDrafts` table to schema.ts
- [ ] Create `convex/functions/servicePackages/drafts/mutations.ts`
- [ ] Create `convex/functions/servicePackages/drafts/queries.ts`
- [ ] Add `publishDraft` mutation to convert draft → package

**Acceptance Criteria:**

- Draft is created on wizard mount
- Draft is updated on step navigation
- Draft is deleted on cancel
- Draft is converted to package on publish

---

### Story 2: BuilderContext Refactor

**Points:** 5  
**Description:** Refactor `BuilderProvider` to use backend drafts following project wizard pattern.

**Tasks:**

- [ ] Add draft query/mutations to context
- [ ] Initialize draft on mount (create or resume)
- [ ] Save draft on `goToStep()`
- [ ] Delete draft on cancel
- [ ] Publish draft on final submit

**Acceptance Criteria:**

- User can leave wizard and return to same step
- User can refresh page and resume draft
- Cancel deletes draft completely

---

### Story 3: Line Item Compact Cards

**Points:** 3  
**Description:** Replace table rows with compact card-based line items.

**Tasks:**

- [ ] Create `LineItemCard` component
- [ ] Integrate inline section creation
- [ ] Add proper amount display
- [ ] Match Step 1-2 styling

**Acceptance Criteria:**

- Each line item is a distinct visual card
- Project, Description, Section, Unit, Rate, Qty, Amount all visible
- Remove button appears on hover
- Consistent with project design system

---

### Story 4: Sticky Pricing Sidebar

**Points:** 3  
**Description:** Move pricing summary to sticky sidebar with GST toggle.

**Tasks:**

- [ ] Create `PricingSidebar` component
- [ ] Add GST toggle switch
- [ ] Wire toggle to form state
- [ ] Make sidebar sticky on scroll

**Acceptance Criteria:**

- Sidebar stays visible while scrolling line items
- GST can be toggled on/off
- Total updates in real-time

---

### Story 5: Terms & Conditions Polish

**Points:** 2  
**Description:** Add character counter and improve Terms textarea UX.

**Tasks:**

- [ ] Add character counter (X/2000)
- [ ] Match Step 1 description field styling
- [ ] Consider template snippets (future)

**Acceptance Criteria:**

- Counter shows current/max characters
- Styling matches Step 1

---

## 6. Open Questions

1. **Should we support multiple drafts per user?** (Currently: No, one active draft)
2. **Draft expiration?** (Currently: No expiration, persist indefinitely)
3. **Drag-and-drop line item reordering?** (Currently: Out of scope, can add later with @dnd-kit)

---

## 7. Dependencies

- **TanStack Form** — Form state management (already in use)
- **Convex** — Backend mutations/queries for draft persistence
- **shadcn/ui components** — Switch, Card, Select, Input, Separator, etc.
- **Field Component System** — `@/components/ui/field` (see `_bmad-output/docs/ui/field.md`)
  - `Field` — Wrapper with `data-invalid` support
  - `FieldLabel` — Accessible labels with `htmlFor`
  - `FieldError` — Renders validation errors array
  - `FieldGroup` — Groups related fields
  - `FieldContent` — Flex column for label + description
  - `FieldDescription` — Helper text slot

---

## 8. Rollout Plan

| Phase | Stories                         | ETA     |
| ----- | ------------------------------- | ------- |
| 1     | Story 1 + 2 (Backend + Context) | 2 hours |
| 2     | Story 3 + 4 (UI Components)     | 2 hours |
| 3     | Story 5 (Polish)                | 30 mins |
| 4     | Testing + Edge cases            | 1 hour  |

**Total Estimate:** ~5.5 hours

---

_Document maintained by Sally (UX Designer Agent) and Life-design_
