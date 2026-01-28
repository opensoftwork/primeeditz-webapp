# Story 13C.4: Package Builder - Step 3: Pricing

**Status**: backlog  
**Points**: 5  
**Epic**: [13C: Service Package Builder UI](../../../../planning-artifacts/epics/13c-service-package-builder-ui.md)  
**Depends On**: Story 13C.3

---

## User Story

**As an** Admin,  
**I want** to configure the pricing structure,  
**So that** I can generate accurate quotations.

---

## Acceptance Criteria

### AC1: Add Line Item

**Given** Step 3 is displayed  
**When** I click "Add Line Item"  
**Then** a new line item row is added with empty fields

### AC2: Line Item Fields

**Given** a line item row  
**When** I view it  
**Then** I see:

- Description (text input, required)
- Section (dropdown from `quotationSections`, optional)
- Unit (text input, default "per project")
- Rate (number input, required, ≥0)
- Quantity (number input, required, ≥1, default 1)
- Remove button (X icon)

### AC3: Running Subtotal

**Given** line items are added  
**When** rates and quantities change  
**Then** the subtotal is calculated and displayed in real-time

### AC4: Remove Line Item

**Given** a line item exists  
**When** I click the remove (X) button  
**Then** the line item is removed  
**And** the subtotal is recalculated

### AC5: At Least One Line Item

**Given** I try to remove the last line item  
**When** I click remove  
**Then** I see an error: "At least one line item is required"

### AC6: Sub-Items Support

**Given** a line item  
**When** I click "Add Sub-Item"  
**Then** I can add nested descriptions with optional amounts

### AC7: Terms and Conditions

**Given** Step 3 is displayed  
**When** I view the form  
**Then** I see a "Terms & Conditions" textarea (optional)

### AC8: GST Toggle

**Given** Step 3 is displayed  
**When** I view the form  
**Then** I see a "Apply 18% GST" toggle (default: on)

---

## Technical Implementation

### Step 3 Component

```tsx
// step-3-pricing.tsx
"use client";

import { useForm, useFieldArray } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as z from "zod";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBuilder } from "./builder-context";
import { LineItemRow } from "./components/line-item-row";
import { nanoid } from "nanoid";

const lineItemSchema = z.object({
  id: z.string(),
  sectionId: z.string().optional().or(z.literal("")),
  description: z.string().min(1, "Description is required"),
  unit: z.string().default("per project"),
  rate: z.number().min(0, "Rate must be 0 or more"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
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
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
  terms: z.string().max(2000).optional().or(z.literal("")),
  applyGST: z.boolean().default(true),
});

interface LineItem {
  id: string;
  sectionId?: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  subItems?: { description: string; amount?: number }[];
}

export function Step3Pricing() {
  const { step3Data, setStep3Data, setCurrentStep } = useBuilder();
  const sections = useQuery(api.quotationSections.list);

  const form = useForm({
    defaultValues: {
      lineItems: step3Data?.lineItems ?? [
        {
          id: nanoid(),
          description: "",
          unit: "per project",
          rate: 0,
          quantity: 1,
        },
      ],
      terms: step3Data?.terms ?? "",
      applyGST: step3Data?.applyGST ?? true,
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: step3Schema,
    },
    onSubmit: async ({ value }) => {
      setStep3Data({
        lineItems: value.lineItems,
        terms: value.terms || undefined,
        applyGST: value.applyGST,
      });
      setCurrentStep(4);
    },
  });

  // Calculate totals
  const lineItems = form.useStore((state) => state.values.lineItems);
  const applyGST = form.useStore((state) => state.values.applyGST);

  const subtotal = lineItems.reduce(
    (sum, item) => sum + (item.rate || 0) * (item.quantity || 1),
    0,
  );
  const gstAmount = applyGST ? Math.round(subtotal * 0.18) : 0;
  const total = subtotal + gstAmount;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Line Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              form.pushFieldValue("lineItems", {
                id: nanoid(),
                description: "",
                unit: "per project",
                rate: 0,
                quantity: 1,
              });
            }}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Line Item
          </Button>
        </div>

        <div className="border rounded-lg divide-y">
          <form.Field
            name="lineItems"
            mode="array"
            children={(field) => (
              <>
                {field.state.value.map((_, index) => (
                  <LineItemRow
                    key={field.state.value[index]?.id ?? index}
                    form={form}
                    index={index}
                    sections={sections ?? []}
                    onRemove={() => {
                      if (field.state.value.length > 1) {
                        field.removeValue(index);
                      } else {
                        // Can't remove last item
                        toast.error("At least one line item is required");
                      }
                    }}
                    canRemove={field.state.value.length > 1}
                  />
                ))}
              </>
            )}
          />
        </div>

        {/* Validation error for lineItems */}
        <form.Subscribe
          selector={(state) => state.errors}
          children={(errors) => {
            const lineItemsError = errors.find((e) => e.path === "lineItems");
            return lineItemsError ? (
              <p className="text-sm text-destructive">
                {lineItemsError.message}
              </p>
            ) : null;
          }}
        />
      </div>

      {/* Pricing Summary */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <form.Field
              name="applyGST"
              children={(field) => (
                <Switch
                  id="applyGST"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
              )}
            />
            <label htmlFor="applyGST">GST (18%)</label>
          </div>
          <span>₹{gstAmount.toLocaleString()}</span>
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Terms & Conditions */}
      <form.Field
        name="terms"
        children={(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Terms & Conditions</FieldLabel>
            <Textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Delivery timelines, revision policies, payment terms..."
              rows={4}
            />
            <FieldDescription>
              These will appear on quotations using this package.
            </FieldDescription>
          </Field>
        )}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(2)}
        >
          ← Back
        </Button>
        <form.Subscribe
          selector={(state) => [state.isSubmitting, state.canSubmit]}
          children={([isSubmitting, canSubmit]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Validating..." : "Next: Review →"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
```

### Line Item Row Component

```tsx
// components/line-item-row.tsx
interface LineItemRowProps {
  form: any; // TanStack Form instance
  index: number;
  sections: Doc<"quotationSections">[];
  onRemove: () => void;
  canRemove: boolean;
}

export function LineItemRow({
  form,
  index,
  sections,
  onRemove,
  canRemove,
}: LineItemRowProps) {
  return (
    <div className="grid grid-cols-12 gap-2 p-4 items-start">
      {/* Description - spans 4 cols */}
      <div className="col-span-4">
        <form.Field
          name={`lineItems[${index}].description`}
          children={(field) => (
            <Input
              placeholder="Service description"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            />
          )}
        />
      </div>

      {/* Section - spans 2 cols */}
      <div className="col-span-2">
        <form.Field
          name={`lineItems[${index}].sectionId`}
          children={(field) => (
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section._id} value={section._id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Unit - spans 2 cols */}
      <div className="col-span-2">
        <form.Field
          name={`lineItems[${index}].unit`}
          children={(field) => (
            <Input
              placeholder="per project"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        />
      </div>

      {/* Rate - spans 2 cols */}
      <div className="col-span-1">
        <form.Field
          name={`lineItems[${index}].rate`}
          children={(field) => (
            <Input
              type="number"
              min={0}
              placeholder="Rate"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
          )}
        />
      </div>

      {/* Quantity - spans 1 col */}
      <div className="col-span-1">
        <form.Field
          name={`lineItems[${index}].quantity`}
          children={(field) => (
            <Input
              type="number"
              min={1}
              placeholder="Qty"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
          )}
        />
      </div>

      {/* Amount (calculated) - spans 1 col */}
      <div className="col-span-1 flex items-center justify-end font-medium">
        <form.Subscribe
          selector={(state) => {
            const item = state.values.lineItems[index];
            return (item?.rate || 0) * (item?.quantity || 1);
          }}
          children={(amount) => <span>₹{amount.toLocaleString()}</span>}
        />
      </div>

      {/* Remove button */}
      <div className="col-span-1 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

---

## ❌ DO NOT

- ❌ Do NOT add `spawnsProject` or `projectTypeId` to line items
- ❌ Do NOT store project config in line items
- ❌ Do NOT forget unique `id` for each line item
- ❌ Do NOT allow removing the last line item
- ❌ Do NOT forget real-time total calculation

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Add multiple line items
- [ ] Manual test: Totals update in real-time
- [ ] Manual test: Cannot remove last line item
- [ ] Manual test: GST toggle works

---

## Files to Create

```
CREATE: src/components/modules/admin/service-packages/builder/step-3-pricing.tsx
CREATE: src/components/modules/admin/service-packages/builder/components/line-item-row.tsx
```

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
