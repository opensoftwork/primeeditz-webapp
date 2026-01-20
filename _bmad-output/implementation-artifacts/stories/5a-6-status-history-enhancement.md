---
id: 5a-6
title: Status History Enhancement
epic: 05a-project-status-workflow
status: blocked
priority: medium
points: 5
assignee: null
dependencies:
  - 5a-1
created: 2026-01-19
updated: 2026-01-19
---

# Story 5A.6: Status History Enhancement

## User Story

**As an** Admin,
**I want** complete status history tracking with phase, action state, and actor information,
**So that** I can audit the project timeline and understand delays.

## Background

With the new multi-dimensional status model, the status history needs to track more information:

- Phase changes
- Action state changes
- Actor responsibility changes
- Who triggered each change
- Optional notes

## Acceptance Criteria

### AC-1: Enhanced Schema

**Given** the need for detailed history
**When** the `statusHistory` table is updated
**Then** it must track:

```typescript
statusHistory: defineTable({
  projectId: v.id('projects'),

  // Phase tracking
  previousPhase: v.optional(projectPhaseValidator),
  newPhase: projectPhaseValidator,

  // Action state tracking
  previousActionState: v.optional(projectActionStateValidator),
  newActionState: projectActionStateValidator,

  // Actor tracking
  previousAwaitingActorRole: v.optional(roleValidator),
  newAwaitingActorRole: v.optional(roleValidator),
  previousAwaitingActorId: v.optional(v.id('profiles')),
  newAwaitingActorId: v.optional(v.id('profiles')),

  // Metadata
  changedBy: v.id('profiles'),
  changedAt: v.number(),
  notes: v.optional(v.string()),

  // Source of change
  source: v.optional(v.union(
    v.literal('user_action'),      // Manual status change
    v.literal('system_automation'), // Auto-transition
    v.literal('quotation_approved'), // Specific trigger
    v.literal('upload_complete'),
    v.literal('assignment'),
    v.literal('qc_review'),
    v.literal('client_review'),
  )),
})
  .index('by_project', ['projectId'])
  .index('by_changedAt', ['changedAt']),
```

### AC-2: History Creation on Transition

**Given** a project status transition via `transitionProject()`
**When** the transition succeeds
**Then** a history entry must be created with:

- All before/after values populated
- `changedBy` set to current user
- `changedAt` set to current timestamp
- `source` set appropriately

### AC-3: History Query

**Given** a project ID
**When** `getProjectHistory(projectId)` is called
**Then** return all history entries sorted by `changedAt` descending.

### AC-4: Timeline Visualization

**Given** the project detail page
**When** admin expands the "History" section
**Then** display a timeline with:

- Each transition as a timeline item
- Phase badge if phase changed
- Action state transition: "Previous → New"
- Actor change: "Now waiting for [Role]"
- User who made the change
- Relative timestamp (e.g., "2 hours ago")
- Notes (if any)

### AC-5: Initial Entry

**Given** a newly created project
**When** the project is saved
**Then** create an initial history entry:

- `previousPhase`: null
- `newPhase`: 'setup'
- `previousActionState`: null
- `newActionState`: 'draft'
- `source`: 'user_action'
- `notes`: 'Project created'

### AC-6: Duration Calculations

**Given** the history entries
**When** viewing the timeline
**Then** show time spent in each state:

- "Was in [state] for [X hours/days]"
- Highlight unusually long durations (e.g., > 3 days in same state)

## Technical Design

### Schema Update

```typescript
// convex/schema.ts

export const historySourceValidator = v.union(
  v.literal('user_action'),
  v.literal('system_automation'),
  v.literal('quotation_approved'),
  v.literal('upload_complete'),
  v.literal('assignment'),
  v.literal('qc_review'),
  v.literal('client_review'),
);

statusHistory: defineTable({
  projectId: v.id('projects'),
  previousPhase: v.optional(projectPhaseValidator),
  newPhase: projectPhaseValidator,
  previousActionState: v.optional(projectActionStateValidator),
  newActionState: projectActionStateValidator,
  previousAwaitingActorRole: v.optional(roleValidator),
  newAwaitingActorRole: v.optional(roleValidator),
  changedBy: v.id('profiles'),
  changedAt: v.number(),
  notes: v.optional(v.string()),
  source: v.optional(historySourceValidator),
})
  .index('by_project', ['projectId'])
  .index('by_changedAt', ['changedAt']),
```

### Query

```typescript
// convex/functions/projects/queries.ts

export const getProjectHistory = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("statusHistory")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    // Enrich with user names
    const enriched = await Promise.all(
      history.map(async (entry) => {
        const changedByProfile = await ctx.db.get(entry.changedBy);
        return {
          ...entry,
          changedByName: changedByProfile?.name || "System",
        };
      }),
    );

    // Calculate durations
    return calculateDurations(enriched);
  },
});

function calculateDurations(entries: HistoryEntry[]) {
  return entries.map((entry, index) => {
    const nextEntry = entries[index + 1];
    let duration = null;

    if (nextEntry) {
      duration = entry.changedAt - nextEntry.changedAt;
    }

    return {
      ...entry,
      durationMs: duration,
      durationFormatted: duration ? formatDuration(duration) : null,
    };
  });
}
```

### Timeline Component

```tsx
// src/components/modules/projects/detail/status-history-timeline.tsx

interface StatusHistoryTimelineProps {
  projectId: Id<"projects">;
}

export function StatusHistoryTimeline({
  projectId,
}: StatusHistoryTimelineProps) {
  const history = useQuery(api.projects.getProjectHistory, { projectId });

  if (!history) return <Skeleton />;

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <TimelineItem
          key={entry._id}
          entry={entry}
          isFirst={index === 0}
          isLast={index === history.length - 1}
        />
      ))}
    </div>
  );
}

function TimelineItem({ entry, isFirst, isLast }) {
  const phaseChanged = entry.previousPhase !== entry.newPhase;

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-primary" />
        {!isLast && <div className="w-px flex-1 bg-white/10" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-1">
          {phaseChanged && <Badge variant="outline">{entry.newPhase}</Badge>}
          <span className="text-sm">
            {entry.previousActionState} → {entry.newActionState}
          </span>
        </div>

        {entry.newAwaitingActorRole && (
          <p className="text-xs text-white/40">
            Now waiting for: {entry.newAwaitingActorRole}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2 text-xs text-white/30">
          <span>{entry.changedByName}</span>
          <span>•</span>
          <span>{formatRelativeTime(entry.changedAt)}</span>
          {entry.durationFormatted && (
            <>
              <span>•</span>
              <span>Took {entry.durationFormatted}</span>
            </>
          )}
        </div>

        {entry.notes && (
          <p className="mt-2 text-sm text-white/60 italic">{entry.notes}</p>
        )}
      </div>
    </div>
  );
}
```

## Definition of Done

- [ ] Schema updated with enhanced statusHistory table
- [ ] History entries created on all transitions
- [ ] getProjectHistory query returns enriched data
- [ ] Timeline component displays history
- [ ] Duration calculations work
- [ ] Notes display correctly
- [ ] Initial entry created on project creation

## Estimated Effort

- Schema update: 30 min
- Integration with transitionProject: 1 hour
- Query implementation: 1 hour
- Timeline component: 2 hours
- Duration calculations: 30 min
- **Total: ~5 hours**
