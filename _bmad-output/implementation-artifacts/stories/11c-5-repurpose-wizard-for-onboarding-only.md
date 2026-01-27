# Story 11C.5: Repurpose Wizard for Onboarding Only

Status: ready-for-dev

## Story

As a Studio,
I want to use a simplified version of the project wizard to upload assets and notes for an existing project,
so that I don't have to re-enter basic information that was already on the quotation.

## Acceptance Criteria

1. Onboarding wizard mode implemented: `mode = 'onboarding'`.
2. Wizard steps restricted to:
   - **Step 1: Assets** (Upload reference files, moodboards).
   - **Step 2: Brief** (Description, technical requirements, creative notes).
   - **Step 3: Confirm** (Review onboarding data and submit).
3. The wizard receives a `projectId` as a parameter.
4. Submitting patches the _existing_ project record:
   - Updates `referenceFiles`
   - Updates `description` and `additionalNotes`
   - Transitions `actionState` to `'uploads_complete'`
   - Transitions `phase` to `'onboarding'` (or moves to next step in onboarding).
5. User is redirected to the Project Detail view.

## Tasks / Subtasks

- [ ] Add `mode` prop to the base `ProjectWizard` component.
- [ ] Implement conditional step rendering for `'onboarding'`.
- [ ] Create `completeOnboarding` mutation to handle the patch and transition.
- [ ] Verify file upload logic works within the existing project context.

## Technical Notes

- **Component**: `src/components/modules/projects/wizard/project-wizard.tsx`
- **Convex Mutation**: `api.functions.projects.mutations.completeOnboarding`
