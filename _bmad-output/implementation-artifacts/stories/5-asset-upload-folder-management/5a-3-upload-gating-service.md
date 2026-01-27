---
id: 5a-3
title: Upload Gating Service
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

# Story 5A.3: Upload Gating Service

## User Story

**As a** System,
**I want** to enforce upload permissions based on project status,
**So that** only authorized actors can upload at the appropriate time.

## Background

Currently, the upload gating was based on quotation approval status. With the new Phase + ActionState model, we need a more nuanced approach that considers:

- Current actionState
- Who is the awaiting actor
- Project source (admin_init bypasses some checks)

## Acceptance Criteria

### AC-1: canUpload Function

**Given** a project and user role
**When** `canUpload(projectId, role)` is called
**Then** it must return:

```typescript
interface UploadPermission {
  allowed: boolean;
  reason: string;
  canOverride?: boolean; // Admin can force upload
}
```

### AC-2: Client Upload Permissions

| ActionState          | Client Can Upload | Reason                               |
| -------------------- | ----------------- | ------------------------------------ |
| `draft`              | ❌                | "Project not submitted"              |
| `awaiting_quotation` | ❌                | "Waiting for quotation"              |
| `quotation_sent`     | ❌                | "Review and approve quotation first" |
| `quotation_approved` | ❌                | "Waiting for storage allocation"     |
| `storage_allocated`  | ❌                | "Upload area being prepared"         |
| `awaiting_uploads`   | ✅                | "Ready to upload"                    |
| `uploads_complete`   | ✅                | "You can still add more files"       |
| Others               | ❌                | "Upload phase complete"              |

### AC-3: Admin Upload Permissions

| ActionState          | Admin Can Upload | Reason                               |
| -------------------- | ---------------- | ------------------------------------ |
| `draft`              | ❌               | "Client hasn't submitted"            |
| `awaiting_quotation` | ❌               | "Create quotation first"             |
| `quotation_sent`     | ❌               | "Waiting for client approval"        |
| `quotation_approved` | ❌               | "Allocate storage first"             |
| `storage_allocated`  | ✅               | "Can enable uploads"                 |
| `awaiting_uploads`   | ⚠️               | "Client's turn - override available" |
| `uploads_complete`   | ✅               | "Can add files"                      |
| `work_in_progress+`  | ✅               | "Can add reference files"            |

### AC-4: Internal Project Override

**Given** a project with `source: 'admin_init'`
**When** an admin checks `canUpload()`
**Then** upload must be allowed after `storage_allocated`
**And** no "waiting for client" messages appear.

### AC-5: Employee Upload Permissions

| ActionState           | Employee Can Upload | Reason                              |
| --------------------- | ------------------- | ----------------------------------- |
| `assigned`            | ✅                  | "Start working on deliverables"     |
| `work_in_progress`    | ✅                  | "Continue uploading deliverables"   |
| `revisions_requested` | ✅                  | "Upload revised deliverables"       |
| Others                | ❌                  | "Not assigned or not in production" |

### AC-6: API Enforcement

**Given** an upload request to `getUploadUrl` action
**When** the caller doesn't have permission
**Then** the action must throw: "Upload not allowed: [reason]"
**And** no signed URL is generated.

## Technical Design

### Files to Create/Modify

```
convex/
├── lib/
│   └── upload-gate.ts           # NEW: Upload permission logic
└── functions/
    └── storage/
        └── actions.ts           # Modify to use upload-gate
```

### upload-gate.ts

```typescript
// convex/lib/upload-gate.ts

import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

export interface UploadPermission {
  allowed: boolean;
  reason: string;
  canOverride?: boolean;
}

type Role = "client" | "admin" | "employee";
type ActionState = string; // Use actual type

export async function canUpload(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  userRole: Role,
  userId?: Id<"profiles">,
): Promise<UploadPermission> {
  const project = await ctx.db.get(projectId);
  if (!project) {
    return { allowed: false, reason: "Project not found" };
  }

  const { actionState, source, assignedEmployeeId } = project;

  // Admin-initiated projects have relaxed rules
  if (source === "admin_init" && userRole === "admin") {
    if (
      ["storage_allocated", "awaiting_uploads", "uploads_complete"].includes(
        actionState,
      )
    ) {
      return {
        allowed: true,
        reason: "Internal project - admin upload allowed",
      };
    }
  }

  // Client upload logic
  if (userRole === "client") {
    switch (actionState) {
      case "awaiting_uploads":
      case "uploads_complete":
        return { allowed: true, reason: "Ready to upload" };
      case "draft":
        return { allowed: false, reason: "Submit your project request first" };
      case "awaiting_quotation":
        return { allowed: false, reason: "Your quotation is being prepared" };
      case "quotation_sent":
        return {
          allowed: false,
          reason: "Please review and approve your quotation",
        };
      case "quotation_approved":
      case "storage_allocated":
        return { allowed: false, reason: "Your upload area is being prepared" };
      default:
        return { allowed: false, reason: "Upload phase is complete" };
    }
  }

  // Admin upload logic
  if (userRole === "admin") {
    switch (actionState) {
      case "storage_allocated":
      case "uploads_complete":
      case "awaiting_assignment":
      case "assigned":
      case "work_in_progress":
      case "deliverables_ready":
        return { allowed: true, reason: "Admin can upload" };
      case "awaiting_uploads":
        return {
          allowed: false,
          reason: "Waiting for client to upload files",
          canOverride: true,
        };
      default:
        return { allowed: false, reason: "Not at upload stage" };
    }
  }

  // Employee upload logic
  if (userRole === "employee") {
    // Must be assigned to this project
    if (assignedEmployeeId !== userId) {
      return { allowed: false, reason: "Not assigned to this project" };
    }

    switch (actionState) {
      case "assigned":
      case "work_in_progress":
      case "revisions_requested":
        return { allowed: true, reason: "Upload deliverables" };
      default:
        return { allowed: false, reason: "Not in production phase" };
    }
  }

  return { allowed: false, reason: "Unknown role" };
}
```

### Integration with getUploadUrl

```typescript
// In convex/functions/storage/actions.ts

export const getUploadUrl = action({
  args: {
    projectId: v.id("projects"),
    folderId: v.id("folders"),
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current user and role
    const user = await getCurrentUser(ctx);
    const profile = await getProfile(ctx, user.id);

    // Check upload permission
    const permission = await canUpload(
      ctx,
      args.projectId,
      profile.role,
      profile._id,
    );

    if (!permission.allowed) {
      throw new Error(`Upload not allowed: ${permission.reason}`);
    }

    // Continue with URL generation...
  },
});
```

## Definition of Done

- [ ] `upload-gate.ts` created with canUpload function
- [ ] All role/state combinations tested
- [ ] `getUploadUrl` action uses canUpload
- [ ] Appropriate error messages returned
- [ ] Override flag works for admin
- [ ] Internal projects bypass client waiting states
- [ ] TypeScript compiles without errors

## Estimated Effort

- upload-gate.ts implementation: 2 hours
- Integration with storage actions: 1 hour
- Testing all combinations: 2 hours
- **Total: ~5 hours**

## Notes

- This utility is used by Story 5.2 (Gated Upload Enforcement) for UI gating
- Consider creating a query version for UI to check permission without action call
