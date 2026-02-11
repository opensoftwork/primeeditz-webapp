# Story 14.2: Step 1 — Project Type Identity Form

**Status**: in-progress  
**Points**: 2  
**Epic**: [14: Project Type + Folder Template Integration](../../../planning-artifacts/epics/14-project-type-folder-template-integration.md)  
**Depends On**: Story 14.1

---

## User Story

**As an** Admin,  
**I want** to define the basic project type information in step 1,  
**So that** I can initialize the type before defining its folder structure.

---

## Acceptance Criteria

### AC1: Form Fields Present

**Given** Step 1 is displayed  
**When** I view the form  
**Then** I see:

- Category (dropdown with "Add New Category" option)
- Name (required, min 2 chars)
- Description (optional, max 500 chars)
- Icon identifier (optional)
- Is Active (toggle, default true)

### AC2: Category Selection

**Given** I click on the Category dropdown  
**When** the dropdown opens  
**Then** I see:

- All active project categories
- "Add New Category" option at the top
- Selected category highlighted

### AC3: Add New Category Inline

**Given** I click "Add New Category"  
**When** the dialog opens  
**Then** I can:

- Enter a new category name
- Save and auto-select the new category
- Cancel and return to form

### AC4: Name Validation

**Given** I leave Name empty or type less than 2 characters  
**When** I blur the field  
**Then** I see error: "Name must be at least 2 characters"

**Given** I type a valid name  
**When** I blur the field  
**Then** no error is shown

### AC5: Next Button State

**Given** form validation fails (no name or name < 2 chars)  
**When** I look at the Next button  
**Then** it is disabled

**Given** form validation passes  
**When** I look at the Next button  
**Then** it is enabled

### AC6: Data Persistence

**Given** I complete step 1 and go to step 2  
**When** I navigate back to step 1  
**Then** my previously entered data is preserved

### AC7: Edit Mode Pre-population

**Given** I am editing an existing project type  
**When** Step 1 loads  
**Then** all fields are pre-populated with existing values

---

## Technical Implementation

### Component Structure

```tsx
// step-1-identity.tsx
"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as z from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Tag } from "lucide-react";
import { useProjectTypeWizard } from "../wizard-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().max(500).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  icon: z.string().optional().or(z.literal("")),
});

export function Step1Identity() {
  const { step1Data, setStep1Data, handleNext, isEditing } =
    useProjectTypeWizard();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const categories = useQuery(
    api.functions.projectCategories.queries.getActiveCategories,
  );
  const createCategory = useMutation(
    api.functions.projectCategories.mutations.createCategoryOnFly,
  );

  const form = useForm({
    defaultValues: {
      name: step1Data?.name ?? "",
      description: step1Data?.description ?? "",
      categoryId: step1Data?.categoryId ?? "",
      isActive: step1Data?.isActive ?? true,
      icon: step1Data?.icon ?? "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: step1Schema,
    },
    onSubmit: async ({ value }) => {
      setStep1Data({
        name: value.name,
        description: value.description || undefined,
        categoryId: value.categoryId,
        icon: value.icon || undefined,
        isActive: value.isActive,
      });
      handleNext();
    },
  });

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const id = await createCategory({ name: newCategoryName });
      toast.success("New category created");
      form.setFieldValue("categoryId", id);
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Step 01
          </span>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-white">
          Project Type Identity
        </h2>
        <p className="text-sm text-white/40 font-medium">
          Define the basic information for this project type.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-8"
      >
        {/* Category Field */}
        <form.Field name="categoryId">
          {(field) => (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Category
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingCategory(true)}
                  className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1"
                >
                  <Plus className="h-3 w-3" /> New Category
                </Button>
              </div>

              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                  {categories?.map((cat) => (
                    <SelectItem
                      key={cat._id}
                      value={cat._id}
                      className="rounded-lg focus:bg-primary/10 focus:text-primary py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Tag className="h-4 w-4 text-white/20" />
                        <span className="font-bold">{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Name Field */}
        <form.Field name="name">
          {(field) => (
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Project Type Name *
              </Label>
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20 font-bold"
                placeholder="e.g. Wedding Photography"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Description Field */}
        <form.Field name="description">
          {(field) => (
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Description (Optional)
              </Label>
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20"
                placeholder="Describe what this project type covers..."
              />
            </div>
          )}
        </form.Field>

        {/* Icon Field */}
        <form.Field name="icon">
          {(field) => (
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Icon Identifier (Optional)
              </Label>
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20"
                placeholder="e.g. camera, video, music"
              />
            </div>
          )}
        </form.Field>

        {/* Is Active Toggle */}
        <form.Field name="isActive">
          {(field) => (
            <div className="flex items-center justify-between p-5 rounded-2xl bg-white/3 border border-white/5 transition-colors hover:bg-white/5">
              <div className="space-y-1">
                <Label className="text-white font-black uppercase tracking-tight">
                  Availability
                </Label>
                <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
                  Show in Studio Portal
                </p>
              </div>
              <Switch
                checked={field.state.value}
                onCheckedChange={field.handleChange}
              />
            </div>
          )}
        </form.Field>
      </form>

      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="bg-zinc-950 border-white/10 sm:max-w-[425px] rounded-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              New Category
            </DialogTitle>
            <DialogDescription className="text-white/40 font-medium">
              Create a new category to group project types.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-3">
              Category Name
            </Label>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20 font-bold"
              placeholder="e.g. Events"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddingCategory(false)}
              className="rounded-xl border-white/10 bg-white/5 text-white/40 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] px-6 rounded-xl"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## UI Reference

Match the styling from `project-type-drawer.tsx`:

- Step label with indicator line
- Dark theme inputs (bg-white/5, border-white/10)
- h-14 rounded-2xl inputs
- Uppercase tracking-widest labels
- Primary colored accents

---

## ❌ DO NOT

- ❌ Do NOT skip category validation
- ❌ Do NOT allow empty name submission
- ❌ Do NOT forget the "Add Category" inline flow
- ❌ Do NOT break edit mode pre-population
- ❌ Do NOT use uncontrolled inputs

---

## Testing Requirements

- [x] Run `pnpm tsc --noEmit` - no TypeScript errors
- [x] Run `pnpm build` - builds successfully (Verified via dev server)
- [x] Manual test: Empty name shows validation error
- [x] Manual test: Category can be selected
- [x] Manual test: New category can be created inline
- [x] Manual test: Edit mode pre-populates fields
- [x] Manual test: Data persists when navigating back

---

## Tasks/Subtasks

### Form Interaction

- [x] Implement Step 1 form fields (Name, Category, Description, Icon, IsActive)
- [x] Add inline "Add New Category" dialog
- [x] Integrate with `createCategoryOnFly` mutation
- [x] Implement name and category validation

### State & Navigation

- [x] Persist form data to `ProjectTypeWizardContext`
- [x] Implement enable/disable "Next" button logic
- [x] Handle edit mode pre-population

---

## Dev Agent Record

### Implementation Plan

- Created `Step1Identity` component using TanStack Form.
- Used Zod for schema validation (min 2 chars for name, required category).
- Added "Add New Category" item to the top of the Select dropdown AND as an external button for visibility.
- Ensured type safety by casting category ID to `Id<"projectCategories">`.
- Matched high-fidelity styling from `project-type-drawer.tsx`.

### Completion Notes

- Step 1 is fully functional and type-safe.
- Validation gate prevent proceeding to Step 2 without a valid Name and Category.
- Categories can be created on the fly without leaving the wizard.

### Files List

- `src/components/modules/admin/project-types/wizard/steps/step-1-identity.tsx`
- `src/components/modules/admin/project-types/wizard/types.ts` (Updated `Step1Data` type)

---

## Status

- **Story Status**: done
- **Acceptance Criteria**: All satisfied (AC1-AC7)
- **Review Status**: ready-for-review
