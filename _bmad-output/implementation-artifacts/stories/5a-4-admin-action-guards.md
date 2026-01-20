---
id: 5a-4
title: Admin Action Guards
epic: 05a-project-status-workflow
status: done
priority: high
points: 5
assignee: null
dependencies:
  - 5a-1
  - 5a-2
created: 2026-01-19
updated: 2026-01-19
---

# Story 5A.4: Admin Action Guards

## User Story

**As an** Admin,
**I want** the system to prevent me from taking actions when another actor should act,
**So that** the workflow progresses correctly without confusion.

## Background

Currently an admin can upload files even when the client should be the one uploading. This story adds UI guards and messaging to ensure the workflow is followed correctly.

## Acceptance Criteria

### AC-1: Awaiting Client Banner

**Given** a project with `awaitingActorRole: 'client'`
**When** an admin views the project detail page
**Then** an info banner must display at the top:

- Icon: Clock or User icon
- Title: "Waiting for Client Action"
- Message varies by actionState:
  - `quotation_sent`: "Client is reviewing the quotation"
  - `awaiting_uploads`: "Client needs to upload their files"
  - `awaiting_review`: "Client is reviewing deliverables"
  - `delivered`: "Waiting for client to confirm receipt"

### AC-2: Awaiting Employee Banner

**Given** a project with `awaitingActorRole: 'employee'`
**When** an admin views the project detail page
**Then** an info banner must display:

- Icon: User icon
- Title: "Waiting for Employee Action"
- Show assigned employee name if available
- Message varies by actionState:
  - `assigned`: "[Employee] can start working"
  - `work_in_progress`: "[Employee] is working on deliverables"
  - `revisions_requested`: "[Employee] needs to complete revisions"
- Actions available: "Reassign", "Send Reminder"

### AC-3: Admin Action Required Banner

**Given** a project with `awaitingActorRole: 'admin'`
**When** an admin views the project detail page
**Then** a highlighted action banner must display:

- Icon: Alert icon
- Title: "Action Required"
- CTA button based on actionState:
  - `awaiting_quotation`: "Create Quotation" → Opens quotation builder
  - `quotation_approved`: "Allocate Storage" → Opens storage dialog
  - `storage_allocated`: "Enable Uploads" → Transitions to awaiting_uploads
  - `uploads_complete`: "Assign Employee" → Opens assignment dialog
  - `deliverables_ready`: "Review Deliverables" → Opens QC review
  - `review_approved`: "Prepare Delivery" → Opens delivery dialog
  - `ready_for_delivery`: "Mark Delivered" → Completes project

### AC-4: Upload Section Gating

**Given** a project with `awaitingActorRole: 'client'` and `actionState: 'awaiting_uploads'`
**When** an admin navigates to the upload section
**Then**:

- Upload dropzone must be hidden or disabled
- Info message: "Client is uploading files. [X] files uploaded so far."
- "Upload on behalf of client" link (requires confirmation)
- Refresh button to see latest uploads

### AC-5: System Control Section

**Given** the project detail page
**When** an admin views "System Control" section
**Then** action buttons must be:

- **Enabled** when `awaitingActorRole === 'admin'`
- **Disabled** with tooltip when waiting for another actor
- Tooltip: "Waiting for [actor] to complete [action]"

### AC-6: Status Badge Enhancement

**Given** any project card or detail view
**When** displaying project status
**Then** show both:

- Phase badge: "Setup", "Onboarding", "Production", etc.
- Action indicator: "Awaiting Client", "Awaiting Admin", "Awaiting Employee"
- Combined example: `ONBOARDING | Awaiting Client Upload`

## Technical Design

### Components to Create/Modify

```
src/components/modules/admin/projects/project-detail/
├── awaiting-actor-banner.tsx     # NEW: Role-based banner
├── admin-action-banner.tsx       # NEW: Action required banner
├── system-control-section.tsx    # MODIFY: Add action guards
└── project-header.tsx            # MODIFY: Enhanced status display
```

### AwaitingActorBanner Component

```tsx
// src/components/modules/admin/projects/project-detail/awaiting-actor-banner.tsx

interface AwaitingActorBannerProps {
  project: Project;
}

export function AwaitingActorBanner({ project }: AwaitingActorBannerProps) {
  const { awaitingActorRole, actionState, assignedEmployeeId } = project;

  if (awaitingActorRole === "admin") {
    return null; // Admin action banner handles this
  }

  const config = getAwaitingConfig(awaitingActorRole, actionState);

  return (
    <motion.div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
      <div className="flex items-start gap-3">
        <config.icon className="h-5 w-5 text-amber-500" />
        <div>
          <h4 className="font-bold text-amber-400">{config.title}</h4>
          <p className="text-sm text-white/60">{config.message}</p>
        </div>
      </div>
    </motion.div>
  );
}

function getAwaitingConfig(role: string, state: string) {
  if (role === "client") {
    const messages: Record<string, { title: string; message: string }> = {
      quotation_sent: {
        title: "Waiting for Client",
        message:
          "Client is reviewing the quotation. They will be notified to approve or request changes.",
      },
      awaiting_uploads: {
        title: "Client Uploading",
        message: "Client has been notified to upload their files.",
      },
      awaiting_review: {
        title: "Client Reviewing",
        message:
          "Client is reviewing the deliverables. They can approve or request revisions.",
      },
    };
    return {
      icon: User,
      ...(messages[state] || { title: "Waiting for Client", message: "" }),
    };
  }

  if (role === "employee") {
    const messages: Record<string, { title: string; message: string }> = {
      assigned: {
        title: "Employee Assigned",
        message: "Waiting for employee to start working on the project.",
      },
      work_in_progress: {
        title: "Work in Progress",
        message: "Employee is working on deliverables.",
      },
      revisions_requested: {
        title: "Revisions Required",
        message: "Employee needs to complete the requested revisions.",
      },
    };
    return {
      icon: UserCog,
      ...(messages[state] || { title: "Waiting for Employee", message: "" }),
    };
  }

  return { icon: Clock, title: "", message: "" };
}
```

### AdminActionBanner Component

```tsx
// src/components/modules/admin/projects/project-detail/admin-action-banner.tsx

interface AdminActionBannerProps {
  project: Project;
}

export function AdminActionBanner({ project }: AdminActionBannerProps) {
  const { awaitingActorRole, actionState } = project;

  if (awaitingActorRole !== "admin") {
    return null;
  }

  const action = getAdminAction(actionState);

  return (
    <motion.div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-bold text-primary">Action Required</h4>
            <p className="text-sm text-white/60">{action.message}</p>
          </div>
        </div>
        <Button onClick={action.onClick}>{action.buttonLabel}</Button>
      </div>
    </motion.div>
  );
}
```

## Definition of Done

- [ ] AwaitingActorBanner component created
- [ ] AdminActionBanner component created
- [ ] Banners display correctly based on awaitingActorRole
- [ ] Upload section properly gated
- [ ] Action buttons disabled with tooltips
- [ ] Status badges show phase + actor
- [ ] Override functionality works
- [ ] All states tested

## Estimated Effort

- Banner components: 2 hours
- System control updates: 1 hour
- Upload section gating: 1 hour
- Testing: 1 hour
- **Total: ~5 hours**
