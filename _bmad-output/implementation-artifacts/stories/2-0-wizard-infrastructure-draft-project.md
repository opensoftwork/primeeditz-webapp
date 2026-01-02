# Story 2.0: Wizard Infrastructure & Draft Project

Status: ready-for-dev

## Story

As a **Developer**,
I want to set up the wizard infrastructure with step indicator and form state management,
so that the 5-step project request flow works smoothly.

## Acceptance Criteria

1. **AC-1:** Wizard route must be available at `/client/projects/new`
2. **AC-2:** Step indicator must show "Step X of 5" with visual progress bar
3. **AC-3:** Clicking "Request New Project" from dashboard must create a draft project record (status: `draft`) and redirect to wizard with `projectId` in URL
4. **AC-4:** Form state must persist across steps using React Hook Form with Zod validation
5. **AC-5:** Navigating away must show confirmation dialog if form has unsaved data
6. **AC-6:** Draft projects older than 7 days cleanup logic must be documented (implementation deferred to cron story)
7. **AC-7:** Component migration: Port `useFileUploader` hook and create `formatFileSize` utility
8. **AC-8:** Install and configure Unpic for image optimization
9. **AC-9:** Adapt ImageSlider component from old project (replace next/image with Unpic)

## Tasks / Subtasks

### Task 1: Component Migration from Old Project (AC: 7, 8, 9)

- [ ] 1.1 Install `@unpic/react` for image optimization: `pnpm add @unpic/react`
- [ ] 1.2 Copy `use-file-uploader.ts` → `src/hooks/useFileUploader.ts`
- [ ] 1.3 Create `src/utils/file.ts` with `formatFileSize()` utility
- [ ] 1.4 Create `src/components/shared/image-viewer/` directory structure
- [ ] 1.5 Adapt `ImageSlider` component:
  - Replace `import Image from "next/image"` with `import { Image } from "@unpic/react"`
  - Update width/height from strings to numbers
  - Keep all keyboard navigation and thumbnail logic
- [ ] 1.6 Export from `src/components/shared/image-viewer/index.ts`

### Task 2: Create Wizard Route Structure (AC: 1)

- [ ] 2.1 Create `src/routes/_authed/client/projects/` directory
- [ ] 2.2 Create `src/routes/_authed/client/projects/new.tsx` as wizard entry
- [ ] 2.3 Create `src/routes/_authed/client/projects/new/` directory for step routes (if using nested routing) OR handle steps via query param
- [ ] 2.4 Add route guard in `beforeLoad` to verify client role

### Task 3: Convex Schema for Projects (AC: 3)

- [ ] 3.1 Create/update `convex/schema.ts` with `projects` table:
  ```typescript
  projects: defineTable({
    clientId: v.id("profiles"),
    projectCode: v.string(), // AUTO: PE-YYYYMM-XXX
    projectType: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("pending_review"),
      v.literal("quoted"),
      v.literal("approved"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    // Step 1: Basic Info
    endClientName: v.optional(v.string()),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    venue: v.optional(v.string()),
    // Step 2: Stored as JSON
    typeSpecificDetails: v.optional(v.any()),
    // Step 3: Reference file IDs
    referenceFiles: v.optional(v.array(v.string())),
    // Step 4: Description
    description: v.optional(v.string()),
    additionalNotes: v.optional(v.string()),
    preferredDeliveryDate: v.optional(v.number()),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    submittedAt: v.optional(v.number()),
  })
    .index("by_clientId", ["clientId"])
    .index("by_status", ["status"])
    .index("by_projectCode", ["projectCode"]),
  ```
- [ ] 3.2 Create `convex/functions/projects/` directory
- [ ] 3.3 Create `mutations.ts` with:
  - `createDraft` - Creates draft project, returns projectId
  - `updateDraft` - Updates draft project fields
  - `submitProject` - Changes status from draft to pending_review
- [ ] 3.4 Create `queries.ts` with:
  - `getMyProjects` - List client's submitted projects (not drafts)
  - `getProject` - Get single project by ID (verify ownership)
  - `getDraft` - Get draft project for wizard

### Task 4: Step Indicator Component (AC: 2)

- [ ] 4.1 Create `src/components/shared/wizard/step-indicator.tsx`
- [ ] 4.2 Implement visual progress with 5 steps:
  ```
  [1] ---- [2] ---- [3] ---- [4] ---- [5]
   ●        ○        ○        ○        ○
  ```
- [ ] 4.3 Add step labels: "Project Type", "Details", "Files", "Description", "Review"
- [ ] 4.4 Highlight current step with primary color
- [ ] 4.5 Show completed steps with checkmark
- [ ] 4.6 Create `src/components/shared/wizard/index.ts` for exports

### Task 5: Form State Management with TanStack Form (AC: 4)

- [ ] 5.1 Use existing `@tanstack/react-form` and `@tanstack/zod-adapter` (already installed)
- [ ] 5.2 Create form context provider in `src/components/shared/wizard/wizard-form-context.tsx`
- [ ] 5.3 Define Zod schemas for each step:
  - `step1Schema` - projectType, endClientName (required), eventName (required)
  - `step2Schema` - dynamic based on projectType
  - `step3Schema` - referenceFiles array
  - `step4Schema` - description (required), additionalNotes, deliveryDate
  - `step5Schema` - confirmation
- [ ] 5.4 Create `useWizardForm` hook using TanStack Form's `useForm`
- [ ] 5.5 Persist form data to draft project on each step navigation

### Task 6: Unsaved Changes Warning (AC: 5)

- [ ] 6.1 Implement `beforeUnload` event handler for browser close/refresh
- [ ] 6.2 Use TanStack Router's `useBlocker` for in-app navigation warnings
- [ ] 6.3 Create confirmation dialog using shadcn/ui AlertDialog
- [ ] 6.4 Track `isDirty` state from React Hook Form

### Task 7: Project Code Generation (AC: 3)

- [ ] 7.1 Create helper in `convex/lib/helpers.ts`:
  ```typescript
  export function generateProjectCode(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    // Format: PE-YYYYMM-XXX (XXX = sequential number)
    return `PE-${year}${month}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
  }
  ```
- [ ] 7.2 Ensure uniqueness via database check in createDraft mutation

### Task 8: Testing & Validation (AC: All)

- [ ] 8.1 Test: Navigate to `/client/projects/new` → wizard loads
- [ ] 8.2 Test: Step indicator shows correct current step
- [ ] 8.3 Test: Click "Request New Project" → creates draft in DB
- [ ] 8.4 Test: Navigate between steps → form data persists
- [ ] 8.5 Test: Refresh page with dirty form → warning shown
- [ ] 8.6 Test: ImageSlider component renders with Unpic images
- [ ] 8.7 Test: TypeScript compiles without errors

## Dev Notes

### Component Migration Details

**Source:** `primeeditz-app/components/modules/shared/`

| Component         | Source                                  | Target                                | Changes                       |
| ----------------- | --------------------------------------- | ------------------------------------- | ----------------------------- |
| `useFileUploader` | `file-uploader/use-file-uploader.ts`    | `src/hooks/useFileUploader.ts`        | None - pure React             |
| `formatFileSize`  | `session-folders/utils.ts`              | `src/utils/file.ts`                   | Extract only                  |
| `ImageSlider`     | `image-viewer/desktop/image-slider.tsx` | `src/components/shared/image-viewer/` | Replace next/image with Unpic |

### Unpic Configuration

```tsx
// Replace next/image imports:
// OLD: import Image from "next/image";
// NEW: import { Image } from "@unpic/react";

// Update Image usage:
// OLD: <Image src={url} alt={name} fill />
// NEW: <Image src={url} alt={name} layout="fullWidth" />
```

### TanStack Router Path

Wizard route structure:

```
/client/projects/new?step=1&projectId=xxx
```

Using query params for step navigation allows simpler form persistence.

### Project Status Flow

```
draft → pending_review → quoted → approved → in_progress → completed
                    ↘ cancelled (from any state)
```

### Convex Function Wrappers

Use existing auth wrappers from `convex/lib/customFunctions.ts`:

- `clientMutation` for createDraft, updateDraft, submitProject
- `clientQuery` for getMyProjects, getProject, getDraft

### References

- [Architecture: Project Structure](../planning-artifacts/architecture/05-project-structure.md)
- [Architecture: Implementation Patterns](../planning-artifacts/architecture/04-implementation-patterns.md)
- [Component Migration Analysis](../docs/component-migration-analysis.md)
- [Story 1.6: Sidebar RBAC](./1-6-rbac-sidebar-navigation.md) - Pattern for role-based features

### Previous Story Intelligence

From Story 1.6:

- Use `usePermissions()` hook for role checks
- TanStack Router `<Link>` component for navigation
- `@ts-expect-error` for routes that don't exist yet
- Loading skeletons for async data

## Dependencies

- Epic 1: Complete (Authentication & Onboarding)
- shadcn/ui: Button, Card, Form, Progress, AlertDialog
- react-hook-form, @hookform/resolvers, zod
- @unpic/react (to install)

## Definition of Done

- [ ] Wizard route accessible at `/client/projects/new`
- [ ] Step indicator component created and displays correctly
- [ ] Draft project created in Convex on wizard start
- [ ] Form state persists across steps
- [ ] Unsaved changes dialog works
- [ ] useFileUploader hook ported
- [ ] ImageSlider adapted with Unpic
- [ ] Convex projects schema and functions created
- [ ] TypeScript compiles clean
- [ ] No console errors

## Dev Agent Record

### Agent Model Used

(To be filled after implementation)

### Completion Notes

(To be filled after implementation)

### File List

(To be filled after implementation)
