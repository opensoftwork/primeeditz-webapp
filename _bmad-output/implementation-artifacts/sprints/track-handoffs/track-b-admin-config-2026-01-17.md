# 🎯 Sprint Track Handoff: Track B - Admin Configuration

**Assigned To**: Kavya (Junior Developer)  
**Assigned By**: Divya (Senior Developer)  
**Date**: 2026-01-17  
**Track**: B (Parallel with Track A - Divya)  
**Estimated Duration**: 1-2 weeks

---

## 🚀 Quick Start

**To begin working on this track:**

1. Open this file and read the Mission Briefing
2. Review the stories in order (3-9 → 3-10 → 3-4)
3. Use the `/dev` agent command to start implementation
4. Mark stories as `in-progress` when you start, `done` when complete

---

## 📋 Mission Briefing

### What You're Building

You are implementing **Admin Configuration features** that enable project folder management and storage allocation. These are **critical prerequisites** for Epic 5 (Asset Upload), which cannot start until your work is complete.

### Why This Matters

```
Your Work (Track B)                    Epic 5 (Blocked Until Complete)
─────────────────────                  ─────────────────────────────────

[3-9] Storage Tiers ──────────────────► [5-5] Storage Limit Enforcement
      "How much storage can clients         "Prevent uploads exceeding limit"
       purchase?"

[3-10] Folder Templates ──────────────► [5-1] View Project Folders
       "What folders should each            "Clients see where to upload"
        project type have?"

[3-4] Folder Setup ───────────────────► [5-3] File Upload
      "Admin creates folders for            "Clients upload to folders"
       specific project"
```

**Without your work, clients cannot upload their files.** This is high-impact work!

---

## 📁 Your Assigned Stories (In Order)

### Story 1: [3-9] Storage Pricing Tiers Configuration

**Priority**: HIGH  
**Points**: 3  
**File**: `_bmad-output/implementation-artifacts/stories/3-9-storage-pricing-tiers-configuration.md`

**Summary**: Create CRUD for storage tiers (e.g., "100GB - ₹2,000", "500GB - ₹5,000")

**Key Deliverables**:

- [ ] Backend: `convex/functions/storageTiers/` queries and mutations
- [ ] UI: `/admin/settings/storage-tiers` page
- [ ] Features: Create, edit, toggle active status

---

### Story 2: [3-10] Folder Templates Configuration

**Priority**: HIGH  
**Points**: 5  
**File**: `_bmad-output/implementation-artifacts/stories/3-10-folder-templates-configuration.md`

**Summary**: Create CRUD for folder templates (e.g., "Wedding: Ceremony, Reception, Candid")

**Key Deliverables**:

- [ ] Backend: `convex/functions/folderTemplates/` queries and mutations
- [ ] UI: `/admin/settings/folder-templates` page
- [ ] Features: Dynamic folder list editor, drag-drop reorder, default templates

---

### Story 3: [3-4] Project Stage/Folder Setup

**Priority**: HIGH (Depends on 3-10)  
**Points**: 5  
**File**: `_bmad-output/implementation-artifacts/stories/3-4-project-stage-folder-setup.md`

**Summary**: Allow admin to create folders for a project using templates

**Key Deliverables**:

- [ ] Backend: `convex/functions/folders/` mutations
- [ ] UI: Folder setup drawer in project detail
- [ ] Features: Template selection, storage tier assignment, folder creation

---

## 🏗️ Technical Context

### Schema Reference

The following tables already exist in `convex/schema.ts`:

```typescript
// Storage Tiers (your 3-9 work)
storageTiers: defineTable({
  name: v.string(), // "Premium 500GB"
  sizeGB: v.number(), // 500
  priceINR: v.number(), // 5000
  isActive: v.boolean(), // true
});

// Folder Templates (your 3-10 work)
folderTemplates: defineTable({
  name: v.string(), // "Wedding Photography"
  folders: v.array(v.string()), // ["Ceremony", "Reception", "Candid"]
});

// Folders (your 3-4 work creates these)
folders: defineTable({
  projectId: v.id("projects"),
  name: v.string(), // "Ceremony"
  path: v.string(), // "/ceremony"
  status: folderStatusValidator, // pending_upload | in_progress | completed
}).index("by_projectId", ["projectId"]);
```

### Existing Patterns to Follow

1. **Admin Settings Pages**: See `src/app/(protected)/@admin/settings/` for existing patterns
2. **CRUD Components**: Reference `3-7-project-types-management` implementation
3. **Drawers/Forms**: Use shadcn Sheet + React Hook Form + Zod
4. **Styling**: Follow the premium dark theme with glassmorphism

### Key Files to Reference

| Purpose                | File                                                 |
| ---------------------- | ---------------------------------------------------- |
| Schema definition      | `convex/schema.ts`                                   |
| Example settings page  | `src/app/(protected)/@admin/settings/project-types/` |
| Example CRUD mutations | `convex/functions/projectTypes/`                     |
| Styling patterns       | Any existing admin component                         |

---

## ✅ Definition of Done (Per Story)

For each story, ensure:

- [ ] Backend queries and mutations work
- [ ] UI matches premium design aesthetic
- [ ] Form validation with Zod
- [ ] Loading and error states handled
- [ ] Story file marked with status updates
- [ ] `sprint-status.yaml` updated

---

## 🔄 Update Sprint Status

When you complete a story, update `_bmad-output/implementation-artifacts/sprint-status.yaml`:

```yaml
# Change from:
3-9-storage-pricing-tiers-configuration: ready-for-dev

# To:
3-9-storage-pricing-tiers-configuration: done
```

---

## 📞 Communication Protocol

### When to Sync with Divya

1. **Before starting** — Confirm you understand the scope
2. **After completing 3-9 and 3-10** — Sync before starting 3-4
3. **If blocked** — Don't wait more than 30 minutes
4. **When done** — Final review before Epic 5

### Where to Ask Questions

- Schema questions → Check `convex/schema.ts` first
- UI patterns → Check existing admin settings pages
- Business logic → Ask Divya

### Critical Sync Point

```
⚠️ IMPORTANT: After completing all 3 stories, sync with Divya
   before Epic 5 begins. Both Track A and Track B must be complete.
```

---

## 🚦 Getting Started Commands

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if needed)
npm install

# 3. Start development server
npm run dev

# 4. In a new terminal, start Convex
npx convex dev
```

---

## 📊 Progress Tracker

| Story                 | Status         | Started | Completed | Notes |
| --------------------- | -------------- | ------- | --------- | ----- |
| 3-9 Storage Tiers     | ⬜ Not Started |         |           |       |
| 3-10 Folder Templates | ⬜ Not Started |         |           |       |
| 3-4 Folder Setup      | ⬜ Not Started |         |           |       |

**Update this table as you progress!**

---

## 💬 Initialization Prompt for AI Assistant

When starting a new session, you can use this prompt:

```
I am working on Track B of the PrimeEditz sprint. Please read:
1. This handoff file: _bmad-output/sprints/track-handoffs/track-b-admin-config-2026-01-17.md
2. My first story: _bmad-output/implementation-artifacts/stories/3-9-storage-pricing-tiers-configuration.md

Help me implement Story 3-9: Storage Pricing Tiers Configuration.
Start with the backend (Convex queries and mutations).
```

---

**Good luck! 🚀**

_— Divya_
