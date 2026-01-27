# Story 11C.4: Project Onboarding Card

Status: ready-for-dev

## Story

As a Studio,
I want to see a clear prompt to complete onboarding for newly auto-spawned projects,
so that I know exactly what technical assets and notes are required to start production.

## Acceptance Criteria

1. Projects in the `awaiting_uploads` action state display a high-visibility "Onboarding Required" card/badge.
2. The card provides a concise summary: "Your project manifest is ready. Please upload reference files and technical notes to initiate the creative protocol."
3. Primary button: "Complete Onboarding" → Links to the onboarding wizard.
4. Visual progress tracker: [Manifest Approved] → [Onboarding] → [Production] → [Delivery].

## Tasks / Subtasks

- [ ] Design and implement the `ProjectOnboardingCard` component.
- [ ] Integrate the onboarding CTA into the project list and dashboard.
- [ ] Implement the progress tracker component for at-a-glance status.

## Technical Notes

- **Component**: `src/components/modules/studio/projects/project-onboarding-card.tsx`
- **State Check**: `project.actionState === 'awaiting_uploads'`
