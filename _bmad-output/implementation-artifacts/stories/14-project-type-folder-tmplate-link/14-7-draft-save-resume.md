# Story 14.7: Draft Save & Resume Functionality

**Status**: done  
**Points**: 3  
**Epic**: [14: Project Type + Folder Template Integration](../../../planning-artifacts/epics/14-project-type-folder-template-integration.md)  
**Depends On**: Story 14.4, Story 14.11

---

## User Story

**As an** Admin,  
**I want** to save my progress as a draft and resume later,  
**So that** I don't lose work if I need to step away.

---

## Acceptance Criteria

### AC1: Save Draft Button Available

**Given** I am on any step of the wizard  
**When** I have entered some data  
**Then** I can see a "Save as Draft" button

### AC2: Draft Saves Current State

**Given** I click "Save as Draft"  
**When** the draft is saved  
**Then** the following are persisted:

- Current step number
- Step 1 form data
- Folder hierarchy
- `isDraft: true` flag

### AC3: Drafts Appear in List

**Given** I save a draft project type  
**When** I view the project types list  
**Then** I see the draft with a "Draft" badge
**And** it is visually distinct from published types

### AC4: Resume Draft

**Given** I click on a draft project type  
**When** the wizard opens  
**Then** it restores:

- My saved step position
- All form data from step 1
- My folder structure
  **And** I can continue where I left off

### AC5: Publish Draft

**Given** I complete a draft project type  
**When** I submit the wizard  
**Then** the `isDraft` flag is set to `false`
**And** the project type becomes a regular published type

### AC6: Delete Draft Option

**Given** I have a draft project type  
**When** I click delete in the list  
**Then** I see a confirmation dialog
**And** I can permanently delete the draft

### AC7: Draft Name Display

**Given** I have a draft without completing step 1  
**When** I view the list  
**Then** I see "Untitled Draft" as the name

### AC8: Multiple Drafts Allowed

**Given** I already have one draft  
**When** I start a new project type  
**Then** I can save it as another draft
**And** both appear in the list

---

## Technical Implementation

### Schema Updates

```typescript
// convex/schema.ts - Add to projectTypes table

projectTypes: defineTable({
  // existing fields...
  name: v.string(),
  description: v.optional(v.string()),
  categoryId: v.id("projectCategories"),
  icon: v.optional(v.string()),
  isActive: v.boolean(),

  // NEW: Draft support
  isDraft: v.optional(v.boolean()),
  draftData: v.optional(
    v.object({
      step: v.number(),
      folders: v.array(folderLevel1),
    }),
  ),

  // NEW: Link to default template
  defaultFolderTemplateId: v.optional(v.id("folderTemplates")),
});
```

### Save Draft Mutation

```typescript
// convex/functions/projectTypes/mutations/saveDraft.ts
import { authMutation } from "@/lib/auth-wrappers";
import { v } from "convex/values";
import { folderLevel1 } from "../../../schema";

export const saveDraft = authMutation({
  args: {
    id: v.optional(v.id("projectTypes")),
    step: v.number(),
    formData: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      categoryId: v.optional(v.string()),
      icon: v.optional(v.string()),
      isActive: v.boolean(),
    }),
    folders: v.array(folderLevel1),
  },
  handler: async (ctx, args) => {
    const { id, step, formData, folders } = args;

    const draftData = {
      step,
      folders,
    };

    if (id) {
      // Update existing draft
      await ctx.db.patch(id, {
        name: formData.name || "Untitled Draft",
        description: formData.description,
        categoryId: formData.categoryId as any,
        icon: formData.icon,
        isActive: formData.isActive,
        isDraft: true,
        draftData,
      });
      return id;
    } else {
      // Create new draft
      const newId = await ctx.db.insert("projectTypes", {
        name: formData.name || "Untitled Draft",
        description: formData.description,
        categoryId: formData.categoryId as any,
        icon: formData.icon,
        isActive: formData.isActive,
        isDraft: true,
        draftData,
      });
      return newId;
    }
  },
});
```

### Update Context for Draft Handling

```typescript
// wizard-context.tsx - Update saveDraft function

const saveDraft = useCallback(async () => {
  setIsSavingDraft(true);
  try {
    const draftId = await saveDraftMutation({
      id: projectTypeId,
      step,
      formData: {
        name: step1Data?.name || "",
        description: step1Data?.description,
        categoryId: step1Data?.categoryId,
        icon: step1Data?.icon,
        isActive: step1Data?.isActive ?? true,
      },
      folders,
    });
    toast.success("Draft saved successfully");
    router.push("/settings/project-types");
    return draftId;
  } catch (error) {
    console.error("Save draft error:", error);
    toast.error("Failed to save draft");
    throw error;
  } finally {
    setIsSavingDraft(false);
  }
}, [step1Data, step, folders, projectTypeId, saveDraftMutation, router]);
```

### Update Project Type Card for Draft Display

```tsx
// project-type-card.tsx - Add draft badge

export function ProjectTypeCard({
  type,
  onEdit,
  onDelete,
}: ProjectTypeCardProps) {
  return (
    <Card
      className={cn(
        "...",
        type.isDraft && "border-amber-500/20 bg-amber-500/5",
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{type.name}</CardTitle>
          {type.isDraft && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px]">
              Draft
            </Badge>
          )}
        </div>
      </CardHeader>
      {/* ... rest of card */}
    </Card>
  );
}
```

### Update List Query

```typescript
// Ensure drafts are included in the list query
// They should be sorted separately (drafts at top or bottom)

export const getProjectTypes = adminQuery({
  handler: async (ctx) => {
    const projectTypes = await ctx.db
      .query("projectTypes")
      .order("desc")
      .collect();

    // Sort: drafts first, then by creation date
    return projectTypes.sort((a, b) => {
      if (a.isDraft && !b.isDraft) return -1;
      if (!a.isDraft && b.isDraft) return 1;
      return 0;
    });
  },
});
```

---

## UI Updates

### Draft Badge in List

```tsx
{
  type.isDraft && (
    <Badge
      variant="outline"
      className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] font-black uppercase"
    >
      Draft
    </Badge>
  );
}
```

### Draft Card Styling

```css
/* Add visual distinction for draft cards */
.draft-card {
  border-color: var(--amber-500) / 20%;
  background: var(--amber-500) / 5%;
}

.draft-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--amber-500);
}
```

---

## ❌ DO NOT

- ❌ Do NOT allow publishing incomplete drafts (must validate)
- ❌ Do NOT lose folder structure when saving draft
- ❌ Do NOT overwrite existing drafts without user's ID
- ❌ Do NOT save draft without at least a name (use "Untitled Draft")
- ❌ Do NOT forget to clear isDraft on publish

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Save draft from step 1
- [ ] Manual test: Save draft from step 2
- [ ] Manual test: Draft appears in list with badge
- [ ] Manual test: Resume draft restores all data
- [ ] Manual test: Resume draft opens at correct step
- [ ] Manual test: Publish draft works correctly
- [ ] Manual test: Delete draft works

---

## Files to Create

```
CREATE: convex/functions/projectTypes/mutations/saveDraft.ts
```

## Files to Modify

```
MODIFY: convex/schema.ts
  - Add isDraft and draftData fields

MODIFY: src/components/modules/admin/project-types/wizard/wizard-context.tsx
  - Update saveDraft function

MODIFY: src/components/modules/admin/project-types/list/project-type-card.tsx
  - Add draft badge and styling

MODIFY: convex/functions/projectTypes/queries.ts
  - Include isDraft in return type
```

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
