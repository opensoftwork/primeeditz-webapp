# Track Handoff Template

Use this template when delegating work to team members.

## Quick Usage

1. Copy this template to a new file: `track-[name]-[date].md`
2. Fill in the sections below
3. Share the file path with your team member
4. They can reference this file when starting their AI session

---

# 🎯 Sprint Track Handoff: [Track Name]

**Assigned To**: [Developer Name]  
**Assigned By**: [Your Name]  
**Date**: [YYYY-MM-DD]  
**Track**: [A/B/C]  
**Estimated Duration**: [X days/weeks]

---

## 🚀 Quick Start

**To begin working on this track:**

1. Open this file and read the Mission Briefing
2. Review the stories in order
3. Use the `/dev` agent command to start implementation
4. Mark stories as `in-progress` when you start, `done` when complete

---

## 📋 Mission Briefing

### What You're Building

[Describe what they're building in 2-3 sentences]

### Why This Matters

[Explain the business value and dependencies]

---

## 📁 Your Assigned Stories (In Order)

### Story 1: [Story ID] [Story Title]

**Priority**: [HIGH/MEDIUM/LOW]  
**Points**: [X]  
**File**: `_bmad-output/implementation-artifacts/stories/[filename].md`

**Summary**: [One sentence summary]

**Key Deliverables**:

- [ ] [Deliverable 1]
- [ ] [Deliverable 2]

---

### Story 2: [Story ID] [Story Title]

[Repeat pattern...]

---

## 🏗️ Technical Context

### Schema Reference

[Include relevant schema snippets]

### Existing Patterns to Follow

[List patterns and example files]

### Key Files to Reference

| Purpose   | File     |
| --------- | -------- |
| [Purpose] | `[path]` |

---

## ✅ Definition of Done (Per Story)

- [ ] Backend queries and mutations work
- [ ] UI matches design aesthetic
- [ ] Form validation with Zod
- [ ] Loading and error states handled
- [ ] Story file marked with status updates
- [ ] `sprint-status.yaml` updated

---

## 📞 Communication Protocol

### When to Sync

1. Before starting
2. After completing each story
3. If blocked for 30+ minutes
4. When fully done

### Critical Sync Points

[List any sync dependencies]

---

## 💬 Initialization Prompt for AI Assistant

```
I am working on [Track Name] of the [Project] sprint. Please read:
1. This handoff file: [path to this file]
2. My first story: [path to first story]

Help me implement [First Story Title].
```

---

## 📊 Progress Tracker

| Story      | Status         | Started | Completed | Notes |
| ---------- | -------------- | ------- | --------- | ----- |
| [Story ID] | ⬜ Not Started |         |           |       |

---

**Good luck! 🚀**

_— [Your Name]_
