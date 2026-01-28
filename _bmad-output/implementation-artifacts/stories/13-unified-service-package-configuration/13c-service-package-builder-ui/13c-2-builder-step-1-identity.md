# Story 13C.2: Package Builder - Step 1: Identity

**Status**: backlog  
**Points**: 3  
**Epic**: [13C: Service Package Builder UI](../../../../planning-artifacts/epics/13c-service-package-builder-ui.md)  
**Depends On**: Story 13C.1

---

## User Story

**As an** Admin,  
**I want** to enter basic package information,  
**So that** studios understand what they're purchasing.

---

## Acceptance Criteria

### AC1: Wizard Container Setup

**Given** I navigate to `/admin/settings/service-packages/new`  
**When** the page loads  
**Then** I see a 4-step wizard with:

- Step 1: Identity (active)
- Step 2: Project Config
- Step 3: Pricing
- Step 4: Review

### AC2: Step 1 Form Fields

**Given** Step 1 is displayed  
**When** I view the form  
**Then** I see:

- Package Name (required, max 100 chars)
- Description (optional, max 500 chars, textarea)
- Category (dropdown from `projectCategories`, optional)

### AC3: Real-time Validation

**Given** I leave Package Name empty  
**When** I blur the field  
**Then** I see error: "Package name is required"

**Given** I type more than 100 characters  
**When** I blur the field  
**Then** I see error: "Package name must be 100 characters or less"

### AC4: Next Button State

**Given** form validation fails  
**When** I look at the "Next" button  
**Then** it is disabled

**Given** form validation passes  
**When** I look at the "Next" button  
**Then** it is enabled

### AC5: Progress to Step 2

**Given** valid form data  
**When** I click "Next"  
**Then** Step 2 becomes active  
**And** Step 1 data is preserved in wizard context

---

## Technical Implementation

### File Structure

```
src/components/modules/admin/service-packages/
├── builder/
│   ├── package-builder.tsx                # Main wizard container
│   ├── package-builder-loading.tsx
│   ├── package-builder-error.tsx
│   ├── builder-context.tsx                # Wizard state context
│   ├── step-1-identity.tsx               # THIS STORY
│   ├── step-2-project-config.tsx
│   ├── step-3-pricing.tsx
│   ├── step-4-review.tsx
│   ├── components/
│   │   └── step-navigation.tsx           # Next/Back buttons
│   └── index.ts
└── index.ts
```

### Builder Context

```tsx
// builder-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Id } from "@/convex/_generated/dataModel";

interface Step1Data {
  name: string;
  description?: string;
  categoryId?: string;
}

interface Step2Data {
  projectTypeId: string;
  folderTemplateId: string;
  defaultStorageTierId?: string;
}

interface Step3Data {
  lineItems: LineItem[];
  terms?: string;
  applyGST: boolean;
}

interface BuilderContextValue {
  currentStep: 1 | 2 | 3 | 4;
  setCurrentStep: (step: 1 | 2 | 3 | 4) => void;

  step1Data: Step1Data | null;
  setStep1Data: (data: Step1Data) => void;

  step2Data: Step2Data | null;
  setStep2Data: (data: Step2Data) => void;

  step3Data: Step3Data | null;
  setStep3Data: (data: Step3Data) => void;

  isEditing: boolean;
  packageId: Id<"servicePackages"> | null;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({
  children,
  packageId,
}: {
  children: ReactNode;
  packageId?: string;
}) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null);

  return (
    <BuilderContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        step1Data,
        setStep1Data,
        step2Data,
        setStep2Data,
        step3Data,
        setStep3Data,
        isEditing: !!packageId,
        packageId: packageId as Id<"servicePackages"> | null,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilder must be used within BuilderProvider");
  }
  return context;
}
```

### Step 1 Component

```tsx
// step-1-identity.tsx
"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as z from "zod";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBuilder } from "./builder-context";
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
import { Button } from "@/components/ui/button";

const step1Schema = z.object({
  name: z
    .string()
    .min(1, "Package name is required")
    .max(100, "Package name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
});

export function Step1Identity() {
  const { step1Data, setStep1Data, setCurrentStep } = useBuilder();
  const categories = useQuery(api.projectCategories.list);

  const form = useForm({
    defaultValues: {
      name: step1Data?.name ?? "",
      description: step1Data?.description ?? "",
      categoryId: step1Data?.categoryId ?? "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: step1Schema,
      onBlur: step1Schema,
    },
    onSubmit: async ({ value }) => {
      setStep1Data({
        name: value.name,
        description: value.description || undefined,
        categoryId: value.categoryId || undefined,
      });
      setCurrentStep(2);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.Field
        name="name"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Package Name *</FieldLabel>
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
              {isInvalid && (
                <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
              )}
            </Field>
          );
        }}
      />

      <form.Field
        name="description"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="What does this package include?"
                rows={3}
              />
              <FieldDescription>
                {field.state.value?.length ?? 0}/500 characters
              </FieldDescription>
              {isInvalid && (
                <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
              )}
            </Field>
          );
        }}
      />

      <form.Field
        name="categoryId"
        children={(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Category</FieldLabel>
            <Select
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Group this package under a category.
            </FieldDescription>
          </Field>
        )}
      />

      <div className="flex justify-end">
        <form.Subscribe
          selector={(state) => [state.isSubmitting, state.canSubmit]}
          children={([isSubmitting, canSubmit]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Validating..." : "Next: Project Config →"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
```

---

## ❌ DO NOT

- ❌ Do NOT use uncontrolled inputs
- ❌ Do NOT skip `aria-invalid` for accessibility
- ❌ Do NOT validate only on submit (use `onBlur` too)
- ❌ Do NOT skip the character counter for description
- ❌ Do NOT forget to show validation errors

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Empty name shows error on blur
- [ ] Manual test: 101+ characters shows error
- [ ] Manual test: Valid form enables Next button
- [ ] Manual test: Data persists when going back from Step 2

---

## Files to Create

```
CREATE: src/app/(protected)/@admin/settings/service-packages/new/page.tsx
CREATE: src/components/modules/admin/service-packages/builder/package-builder.tsx
CREATE: src/components/modules/admin/service-packages/builder/package-builder-loading.tsx
CREATE: src/components/modules/admin/service-packages/builder/package-builder-error.tsx
CREATE: src/components/modules/admin/service-packages/builder/builder-context.tsx
CREATE: src/components/modules/admin/service-packages/builder/step-1-identity.tsx
CREATE: src/components/modules/admin/service-packages/builder/components/step-navigation.tsx
CREATE: src/components/modules/admin/service-packages/builder/index.ts
```

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
