---
id: 5a-7
title: Portal-Specific Status Mapping
epic: 05a-project-status-workflow
status: done
priority: medium
points: 5
assignee: null
dependencies:
  - 5a-1
created: 2026-01-19
updated: 2026-01-19
---

# Story 5A.7: Portal-Specific Status Mapping

## User Story

**As a** Client,
**I want** to see simplified, friendly status labels,
**So that** I understand my project status without technical jargon.

## Background

Technical status names like `awaiting_quotation` or `work_in_progress` are confusing for clients. Each portal should display appropriate labels:

- **Client Portal**: Friendly, action-oriented labels
- **Admin Portal**: Full technical status with actor info
- **Employee Portal**: Task-focused labels

## Acceptance Criteria

### AC-1: Client Status Labels

**Given** any action state
**When** displayed in the client portal
**Then** use friendly labels:

| ActionState           | Client Label         | Description                              |
| --------------------- | -------------------- | ---------------------------------------- |
| `draft`               | "Draft"              | "Complete your project request"          |
| `awaiting_quotation`  | "Preparing Quote"    | "Our team is reviewing your request"     |
| `quotation_sent`      | "Quote Ready"        | "Review and approve your quotation"      |
| `quotation_approved`  | "Preparing"          | "We're setting up your project"          |
| `storage_allocated`   | "Preparing"          | "Almost ready for your files"            |
| `awaiting_uploads`    | "Upload Files"       | "We're ready for your photos/videos"     |
| `uploads_complete`    | "Processing"         | "We've received your files"              |
| `awaiting_assignment` | "Processing"         | "Assigning your project"                 |
| `assigned`            | "In Production"      | "Work has started on your project"       |
| `work_in_progress`    | "In Production"      | "Our team is working on your project"    |
| `deliverables_ready`  | "Quality Check"      | "Reviewing your deliverables"            |
| `awaiting_review`     | "Review Ready"       | "Your deliverables are ready for review" |
| `revisions_requested` | "Making Changes"     | "Working on your requested changes"      |
| `review_approved`     | "Approved"           | "Preparing for delivery"                 |
| `preparing_delivery`  | "Preparing Delivery" | (Use project type label)                 |
| `ready_for_delivery`  | "Ready"              | "Your project is ready for delivery"     |
| `delivered`           | "Delivered"          | "Confirm receipt of your project"        |
| `completed`           | "Complete"           | "Project completed successfully!"        |
| `cancelled`           | "Cancelled"          | "This project was cancelled"             |

### AC-2: Client Action Needed Indicator

**Given** a project where `awaitingActorRole === 'client'`
**When** displayed in client portal
**Then**:

- Show "Action Needed" badge
- Highlight the project card
- Show CTA button

### AC-3: Client CTA Buttons

**Given** a client action state
**When** rendering the project card
**Then** show appropriate CTA:

| ActionState        | CTA Label             | Action              |
| ------------------ | --------------------- | ------------------- |
| `draft`            | "Continue Request"    | Open wizard         |
| `quotation_sent`   | "View Quotation"      | Open quotation      |
| `awaiting_uploads` | "Upload Files"        | Open upload section |
| `awaiting_review`  | "Review Deliverables" | Open review page    |
| `delivered`        | "Confirm Receipt"     | Complete project    |

### AC-4: Phase Progress Display

**Given** a project with a phase
**When** displayed in client portal
**Then** show phase progress:

- Visual progress bar (1-6 phases)
- Current phase highlighted
- Completed phases checked

```
[✓ Setup] [✓ Onboarding] [● Production] [○ Review] [○ Delivery] [○ Complete]
```

### AC-5: Admin Full Status Display

**Given** a project viewed in admin portal
**When** displaying status
**Then** show:

- Phase badge with color
- Action state in readable format
- Actor indicator

Example: `PRODUCTION | Work in Progress | 👤 Employee: John`

### AC-6: Employee Task Labels

**Given** a project viewed in employee portal
**When** displaying status
**Then** show task-focused labels:

| ActionState           | Employee Label     |
| --------------------- | ------------------ |
| `assigned`            | "New Assignment"   |
| `work_in_progress`    | "In Progress"      |
| `revisions_requested` | "Revisions Needed" |
| `deliverables_ready`  | "In QC Review"     |

## Technical Design

### Utility Functions

```typescript
// src/lib/status-display.ts

type ActionState = string; // Use actual type
type Role = "client" | "admin" | "employee";

interface StatusDisplay {
  label: string;
  description: string;
  color: string;
  isActionNeeded: boolean;
  cta?: {
    label: string;
    href: string;
  };
}

const CLIENT_STATUS_MAP: Record<ActionState, StatusDisplay> = {
  draft: {
    label: "Draft",
    description: "Complete your project request",
    color: "gray",
    isActionNeeded: true,
    cta: { label: "Continue Request", href: "/projects/[id]/wizard" },
  },
  awaiting_quotation: {
    label: "Preparing Quote",
    description: "Our team is reviewing your request",
    color: "blue",
    isActionNeeded: false,
  },
  quotation_sent: {
    label: "Quote Ready",
    description: "Review and approve your quotation",
    color: "amber",
    isActionNeeded: true,
    cta: { label: "View Quotation", href: "/projects/[id]/quotation" },
  },
  awaiting_uploads: {
    label: "Upload Files",
    description: "We're ready for your photos/videos",
    color: "amber",
    isActionNeeded: true,
    cta: { label: "Upload Files", href: "/projects/[id]/upload" },
  },
  // ... rest of states
};

export function getClientStatusDisplay(
  actionState: ActionState,
): StatusDisplay {
  return (
    CLIENT_STATUS_MAP[actionState] || {
      label: formatActionState(actionState),
      description: "",
      color: "gray",
      isActionNeeded: false,
    }
  );
}

export function getClientStatusLabel(actionState: ActionState): string {
  return getClientStatusDisplay(actionState).label;
}

export function getClientStatusDescription(actionState: ActionState): string {
  return getClientStatusDisplay(actionState).description;
}

export function isClientActionNeeded(actionState: ActionState): boolean {
  return getClientStatusDisplay(actionState).isActionNeeded;
}

export function getClientCTA(
  actionState: ActionState,
): { label: string; href: string } | null {
  return getClientStatusDisplay(actionState).cta || null;
}

// Format action state to readable text (fallback)
function formatActionState(state: string): string {
  return state
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
```

### Phase Progress Component

```tsx
// src/components/modules/projects/phase-progress.tsx

const PHASES = [
  { key: "setup", label: "Setup" },
  { key: "onboarding", label: "Onboarding" },
  { key: "production", label: "Production" },
  { key: "review", label: "Review" },
  { key: "delivery", label: "Delivery" },
  { key: "completed", label: "Complete" },
];

interface PhaseProgressProps {
  currentPhase: string;
  compact?: boolean;
}

export function PhaseProgress({
  currentPhase,
  compact = false,
}: PhaseProgressProps) {
  const currentIndex = PHASES.findIndex((p) => p.key === currentPhase);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-white/40">
          {currentIndex + 1} of {PHASES.length}
        </span>
        <div className="flex gap-0.5">
          {PHASES.map((phase, index) => (
            <div
              key={phase.key}
              className={cn(
                "w-2 h-2 rounded-full",
                index < currentIndex
                  ? "bg-green-500"
                  : index === currentIndex
                    ? "bg-primary"
                    : "bg-white/10",
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {PHASES.map((phase, index) => (
        <React.Fragment key={phase.key}>
          <div className="flex items-center gap-1">
            {index < currentIndex ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : index === currentIndex ? (
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-white/10" />
            )}
            <span
              className={cn(
                "text-xs",
                index <= currentIndex ? "text-white" : "text-white/30",
              )}
            >
              {phase.label}
            </span>
          </div>
          {index < PHASES.length - 1 && (
            <div
              className={cn(
                "w-4 h-px",
                index < currentIndex ? "bg-green-500" : "bg-white/10",
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
```

### Files to Create/Modify

```
src/
├── lib/
│   └── status-display.ts        # NEW: Status display utilities
└── components/
    └── modules/
        └── projects/
            ├── phase-progress.tsx       # NEW: Phase progress component
            ├── client-status-badge.tsx  # NEW: Client-friendly badge
            └── admin-status-badge.tsx   # NEW: Admin full status badge
```

## Definition of Done

- [ ] status-display.ts created with all utility functions
- [ ] All 19 action states have client labels
- [ ] Client CTA buttons configured
- [ ] Phase progress component created
- [ ] Admin status badge shows full info
- [ ] Employee labels work
- [ ] Used in client dashboard and project cards
- [ ] TypeScript compiles without errors

## Estimated Effort

- Utility functions: 2 hours
- Phase progress component: 1 hour
- Status badges: 1 hour
- Integration: 1 hour
- **Total: ~5 hours**

## Notes

- These utilities are used by Epic 7 (Dashboard enhancements)
- Colors should match the design system
- Consider adding status change animations for real-time updates
