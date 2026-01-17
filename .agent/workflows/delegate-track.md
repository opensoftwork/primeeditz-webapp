---
description: Create a track handoff file for delegating work to team members
---

# Delegate Track Workflow

This workflow helps you create a handoff file for delegating sprint track work to another developer (e.g., junior team member).

## When to Use

- When you want to delegate a set of stories to another developer
- When setting up parallel development tracks
- When onboarding a team member to a specific feature area

## Steps

### Step 1: Identify Stories to Delegate

1. Review `_bmad-output/implementation-artifacts/sprint-status.yaml`
2. Identify stories that can be parallelized
3. Note any dependencies between stories

### Step 2: Create Handoff File

// turbo

```bash
# Copy the template
cp _bmad-output/sprints/track-handoffs/_TEMPLATE.md _bmad-output/sprints/track-handoffs/track-[name]-$(date +%Y-%m-%d).md
```

### Step 3: Fill In Handoff Details

Edit the new file and provide:

- **Mission Briefing**: What and why
- **Story List**: In implementation order
- **Technical Context**: Schema, patterns, key files
- **Communication Protocol**: Sync points

### Step 4: Update Sprint Status

Mark delegated stories with a comment indicating the track:

```yaml
# ── TRACK B: [Developer Name] ──────────────────────────────────
3-9-story-name: ready-for-dev # Assigned to [Developer]
```

### Step 5: Share with Team Member

Share the handoff file path:

```
_bmad-output/sprints/track-handoffs/track-[name]-[date].md
```

They can use the **Initialization Prompt** section to start their AI session.

## Tips

- Keep handoff files self-contained (all context in one file)
- Include the "Why This Matters" section for motivation
- Add a progress tracker table they can update
- Set clear sync points to prevent divergence

## Example Initialization Prompt for Delegate

```
I am working on [Track Name] of the PrimeEditz sprint.

Please read my handoff file:
_bmad-output/sprints/track-handoffs/track-b-admin-config-2026-01-17.md

Then help me start implementing Story 3-9: Storage Pricing Tiers.
```
