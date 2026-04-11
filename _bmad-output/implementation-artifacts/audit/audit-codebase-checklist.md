# PrimeEditz Codebase Audit Checklist

**Purpose**: Verify which stories are actually implemented in code vs. what sprint-status.yaml claims.  
**Delegated to**: Low-cost model (Gemini Flash)  
**Created**: 2026-04-10  
**Method**: Run targeted grep/find commands per epic, check for key files/functions, report findings.

---

## Instructions for the Executing Agent

For each epic below, run the **verification commands** and report:
- ✅ **Confirmed** — Key files/routes/components exist in codebase
- ❌ **Not Found** — Expected files/code missing
- ⚠️ **Partial** — Some evidence but incomplete

**Do NOT read entire files.** Only check for existence and key exports. Keep output minimal.

---

## GROUP A: Confirm "Done" Epics Still Match Code

### Epic 0: Foundation
```bash
# Check schema exists
ls convex/schema.ts
# Check app shell
ls src/app/layout.tsx src/app/(protected)/layout.tsx
# Check sidebar/header modules
ls src/components/modules/sidebar/ src/components/modules/header/
```

### Epic 1: Auth & Onboarding
```bash
# Check auth routes
ls src/app/(auth)/sign-in/page.tsx src/app/(auth)/sign-up/page.tsx
# Check auth modules
ls src/components/modules/auth/
# Check middleware
ls src/middleware.ts
# Check Convex auth wrappers
grep -rl "authenticatedQuery\|adminQuery\|authenticatedMutation" convex/ --include="*.ts" | head -5
```

### Epic 2: Client Portal
```bash
# Check studio project routes (was client, now studio)
ls -d src/app/(protected)/@studio/projects/*/
# Check wizard components
ls src/components/modules/studio/ 2>/dev/null || ls src/components/modules/client/ 2>/dev/null
```

### Epic 4: Quotation System
```bash
# Check quotation routes
ls -d src/app/(protected)/@admin/quotations/ 2>/dev/null
ls -d src/app/(protected)/@studio/ 2>/dev/null
# Check backend
ls convex/functions/quotations/ 2>/dev/null
# Check PDF generation
grep -rl "jsPDF\|html-to-image" src/ --include="*.ts" --include="*.tsx" | head -3
# Check public quotation route
ls src/app/q/ 2>/dev/null
```

### Epic 6: Deliverables & QC
```bash
# Check deliverables backend
ls convex/functions/deliverables/ 2>/dev/null
# Check deliverable components
find src/components/modules -path "*/deliverables*" -name "*.tsx" | head -10
# Check QC review components
grep -rl "qc\|QC\|review.*deliverable" src/components/ --include="*.tsx" | head -5
```

### Epic 20: Public Form Submissions
```bash
# Check HTTP endpoints for public forms
grep -rl "httpAction\|publicForm\|contactForm\|feedbackForm" convex/ --include="*.ts" | head -5
# Check admin dashboard for submissions
find src/app/(protected)/@admin -path "*contact*" -o -path "*feedback*" -o -path "*submission*" | head -5
```

### Epic 22: Profile Settings
```bash
# Check profile settings routes
ls src/app/(protected)/@admin/settings/profile/page.tsx 2>/dev/null
ls src/app/(protected)/@studio/settings/profile/page.tsx 2>/dev/null
ls src/app/(protected)/@employee/settings/profile/page.tsx 2>/dev/null
# Check shared component
ls src/components/modules/profile/ 2>/dev/null
```

---

## GROUP B: Verify "In Progress" Epics — What's Actually Built

### Epic 3: Admin Portal (2 stories remaining: 3-5, 3-6)
```bash
# Check if update-project-status exists (story 3-5)
grep -rl "updateProjectStatus\|update.*project.*status" convex/functions/ --include="*.ts" | head -3
# Check employee management CRUD (story 3-6)
find src/app/(protected)/@admin -path "*employee*" | head -5
grep -rl "employee.*management\|employeeCRUD" convex/ --include="*.ts" | head -3
```

### Epic 5A: Project Status Workflow (claims done, NOT in sprint-status)
```bash
# Check phase/actionState in schema
grep -n "phase\|actionState\|awaitingActorRole" convex/schema.ts | head -10
# Check status machine
ls convex/lib/status-machine.ts 2>/dev/null || find convex -name "*status*machine*" -o -name "*status*transition*" | head -3
# Check status display
ls src/lib/status-display.ts 2>/dev/null
```

### Epic 11B: Quotation Engine (11b-4 in review)
```bash
# Check project spawning
grep -rl "spawnProject\|projectSpawn\|createProjectFromQuotation" convex/ --include="*.ts" | head -5
# Check spawned projects display
grep -rl "spawnedProject\|linkedProject" src/ --include="*.tsx" | head -5
```

### Epic 11C: Studio Portal Revamp (5 ready-for-dev, 2 backlog)
```bash
# Check quote request flow
find src/app/(protected)/@studio -path "*quote*" -o -path "*quotation*" | head -5
# Check studio projects grouped view
grep -rl "groupedByClient\|endClient\|studioProject" src/components/modules/studio/ --include="*.tsx" | head -5
```

### Epic 14: Project Type + Folder Template (14-5 in-progress)
```bash
# Check wizard stepper layout
find src/components/modules/admin -path "*project-type*wizard*" -o -path "*project-type*stepper*" | head -5
# Check all step components exist
find src/components/modules/admin -path "*project-type*" -name "*.tsx" | sort
```

### Epic 13F: Multi-Project Package Support (claims done)
```bash
# Check multi-project config in schema
grep -n "projectConfigs\|multiProject\|projectConfig" convex/schema.ts | head -5
# Check spawning logic for multiple projects
grep -rl "createNProjects\|spawnMultiple\|projectConfigs" convex/ --include="*.ts" | head -5
```

---

## GROUP C: Verify "Review" Status Stories — Are They Implemented?

### Epic 16: Deliverable Revision Workflow (ALL 5 stories in "review")
```bash
# Story 16-1: Revision requests schema
grep -n "revisionRequest\|revision_request" convex/schema.ts | head -5
# Story 16-2: Admin revision page with image upload
find src/app/(protected)/@admin -path "*revision*" | head -5
find src/components -path "*revision*" -name "*.tsx" | head -10
# Story 16-3: Employee revision workspace
find src/app/(protected)/@employee -path "*revision*" | head -5
# Story 16-4: Revision history timeline
grep -rl "revisionHistory\|RevisionTimeline\|revision.*timeline" src/ --include="*.tsx" | head -5
# Story 16-5: Studio per-deliverable review
grep -rl "studioReview\|perDeliverableReview" src/ --include="*.tsx" | head -5
```

### Epic 23: Quotation Sub-Items (6 stories in "review")
```bash
# Story 23-1/23-2: Sub-item schema and CRUD
grep -n "subItem\|sub_item\|subItems" convex/schema.ts | head -5
# Story 23-3: Sub-item CRUD in editor
grep -rl "subItem.*editor\|SubItemEditor\|sub-item" src/components/modules/admin/ --include="*.tsx" | head -5
# Story 23-5: Sub-item PDF preview
grep -rl "subItem.*pdf\|sub.*item.*preview" src/ --include="*.tsx" | head -5
# Story 23-7: Sub-item in service package
grep -rl "subItem.*package\|packageSubItem" src/ --include="*.tsx" | head -5
```

### Epic 21: Deliverable Code Dedup (stories 21-1 to 21-3 done, 21-4 to 21-8 ready)
```bash
# Verify shared types extracted (21-1)
find src -path "*deliverable*" -name "*types*" -o -path "*deliverable*" -name "*constants*" | head -5
# Verify signed URL hooks (21-2)
grep -rl "useSignedUrl\|useDeliverableUrl" src/ --include="*.ts" --include="*.tsx" | head -5
# Verify version status badge (21-3)
grep -rl "VersionStatusBadge\|versionStatus" src/components/ --include="*.tsx" | head -5
```

---

## GROUP D: Quick Existence Check for Untracked Epics

### Epic 11D: Terminology Cleanup
```bash
# Check if any terminology migration happened
grep -rl "terminology\|rename.*client.*studio\|clientPortal.*studioPortal" convex/ --include="*.ts" | head -3
# Check if routes were renamed
ls -d src/app/(protected)/@client/ 2>/dev/null && echo "OLD CLIENT ROUTES STILL EXIST" || echo "Client routes removed (expected)"
```

### Epic 17: Studio Deliverables UX Restructure
```bash
# Check if deliverables subfolder exists (story 17.1)
ls src/components/modules/projects/detail/deliverables/ 2>/dev/null
# Check if studio deliverable detail view exists (story 17.3)
find src/app/(protected)/@studio -path "*deliverable*" -name "page.tsx" | head -3
```

### Epic 18: Dual-Track Versioning
```bash
# Check schema for dual-track
grep -n "dualTrack\|versionTrack\|trackType" convex/schema.ts | head -5
```

### Epic 19: File Upload UX Refactor
```bash
# Check shared upload components
ls src/components/shared/upload/ 2>/dev/null || find src/components/shared -name "*upload*" | head -5
```

---

## OUTPUT FORMAT

Please produce a markdown table with these columns:

| Epic | Story | sprint-status.yaml | Code Evidence | Verified Status | Notes |
|------|-------|--------------------|---------------|-----------------|-------|

For each story, set **Verified Status** to one of:
- `✅ done` — code exists and matches story requirements
- `⚠️ partial` — some code exists but incomplete
- `❌ missing` — no code evidence found
- `🔄 review-confirmed` — code exists, was in review, can be marked done
- `❓ unclear` — need deeper inspection

---

## IMPORTANT CONSTRAINTS

1. **Do NOT open or read file contents** unless absolutely necessary — just check existence
2. **Do NOT run `pnpm build`** — the dev server is already running
3. **Keep total grep/find commands under 50**
4. **Report findings in the table format above**
5. **Flag any story where sprint-status says "done" but code is missing** — these are CRITICAL
