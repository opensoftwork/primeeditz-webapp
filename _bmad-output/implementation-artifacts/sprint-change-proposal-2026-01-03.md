# Sprint Change Proposal: TanStack Start → Next.js 16 Migration

**Date:** 2026-01-03  
**Author:** PM Agent (John)  
**Status:** ✅ APPROVED  
**Scope Classification:** Major

---

## 1. Issue Summary

### Problem Statement

TanStack Start's SSR authentication integration with Convex + Better Auth contains a fundamental bug causing **infinite redirect loops** on protected routes. The server-side `getAuthAndProfile` function returns stale/incorrect profile data during SSR (showing `hasCompletedOnboarding: false`), while client-side Convex queries return correct data (`onboardingComplete: true`), creating an irresolvable mismatch.

### Discovery Context

- **Discovered during:** Story 2.0 (Project Wizard UI) implementation
- **Manifestation:** Navigating to `/client/projects/new` causes infinite loop between `/onboarding` and `/client/dashboard`
- **Root cause:** `@convex-dev/better-auth/react-start` SSR token handling issue
- **Debugging attempted:** Added console logging, verified database state, checked auth token flow

### Evidence

| Finding                    | Evidence                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| Profile data correct in DB | Convex dashboard shows `onboardingComplete: true` for users            |
| SSR returning wrong data   | Debug logs show SSR context receiving `hasCompletedOnboarding: false`  |
| Browser console errors     | "Cannot update a component (Transitioner) while rendering"             |
| Infinite redirect observed | Browser history shows loop between `/onboarding` ↔ `/client/dashboard` |

---

## 2. Impact Analysis

### Epic Impact

| Epic                          | Impact Level | Required Action                           |
| ----------------------------- | ------------ | ----------------------------------------- |
| Epic 1: Auth & Onboarding     | **High**     | Mark Stories 1.1-1.4 as "Needs Migration" |
| **Epic 1.5: Migration (NEW)** | **New Epic** | Insert between Epic 1 and Epic 2          |
| Epic 2: Client Portal         | **Medium**   | Re-implement routes after migration       |
| Epic 3: Admin Portal          | **Low**      | Update tech stack references              |
| Epics 4-7                     | **Low**      | Update tech stack references              |

### Story Impact

**Completed stories affected:**

- Story 1.1a-1.1c: Better Auth Configuration (logic portable, auth-server.ts needs update)
- Story 1.2: Sign Up (component portable, route needs rebuild)
- Story 1.3: Sign In (component portable, route needs rebuild)
- Story 1.4: Profile Onboarding (component portable, route needs rebuild)

**In-progress stories affected:**

- Story 2.0: Project Wizard (component portable, route needs rebuild)

### Artifact Conflicts

| Artifact     | Files        | Changes Required                                            |
| ------------ | ------------ | ----------------------------------------------------------- |
| Architecture | 6 files      | Update framework, routing, auth patterns, project structure |
| PRD          | 1 file       | Update Technology Stack section                             |
| Epics        | 2 files      | Update Epic 1 status, add Epic 1.5                          |
| Environment  | Config files | Rename VITE*\* → NEXT_PUBLIC*\*                             |

### Technical Impact

**What changes:**

- Route structure → Next.js App Router conventions
- SSR → Next.js Server Components + Server Actions
- Auth protection → Proxy middleware + parallel routes
- Data fetching → `preloadAuthQuery` instead of `createServerFn`

**What stays the same:**

- Convex schema and functions (100% portable)
- React components (95% portable)
- shadcn/ui components (100% portable)
- CSS/Styling (100% portable)
- Business logic hooks (90% portable)

---

## 3. Recommended Approach

### Selected Path: Framework Migration to Next.js 16

**Approach:** Create a new Next.js 16 App Router project and migrate all portable code from the TanStack Start project.

### Rationale

| Factor                   | Assessment                                              |
| ------------------------ | ------------------------------------------------------- |
| Implementation Effort    | ✅ Medium - Most code is portable                       |
| Technical Risk           | ✅ Low - Next.js + Convex + Better Auth well-documented |
| Timeline Impact          | ⚠️ +1-2 weeks                                           |
| Team Morale              | ✅ Positive - Work with mature tools                    |
| Long-term Sustainability | ✅ High - Next.js ecosystem                             |
| MVP Impact               | ✅ None - Same features                                 |

### Why Next.js?

1. **Battle-Tested** - 7+ years, millions of production sites
2. **Mature Convex Integration** - `@convex-dev/better-auth/nextjs` well-documented
3. **Parallel Routes** - Native solution for role-based layouts
4. **Proxy Pattern** - Clean auth protection
5. **Massive Community** - Easy to find help

### Alternatives Rejected

| Alternative          | Reason for Rejection                                        |
| -------------------- | ----------------------------------------------------------- |
| Debug TanStack Start | High risk, uncertain timeline, fighting framework internals |
| Rollback + Retry     | Doesn't solve root cause                                    |
| Client-side only     | Loses SSR benefits, poor SEO                                |

---

## 4. Detailed Change Proposals

### 4.1 Architecture Changes

#### 03-core-decisions.md

**Section: Frontend Architecture**

OLD:

```
| Frontend | TanStack Start + React 19 + shadcn/ui |
| Router | TanStack Router (file-based) |
```

NEW:

```
| Frontend | Next.js 15 (App Router) + React 19 + shadcn/ui |
| Router | Next.js App Router (file-based, RSC) |
```

---

#### 05-project-structure.md

**Complete replacement with Next.js App Router structure:**

```
app/
├── layout.tsx                 # Root layout with Convex provider
├── page.tsx                   # Landing page
├── api/auth/[...all]/route.ts # Better Auth handlers
├── (auth)/                    # Auth group (public)
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── (protected)/               # Protected group
│   ├── layout.tsx            # Auth check layout
│   ├── @admin/               # Admin parallel slot
│   ├── @client/              # Client parallel slot
│   └── @employee/            # Employee parallel slot
└── onboarding/page.tsx

src/
├── components/               # Portable from old project
├── lib/                     # Updated for Next.js
└── hooks/                   # Portable from old project

convex/                      # 100% portable - copy directly
```

---

### 4.2 New Epic: 1.5 Framework Migration

**Position:** After Epic 1 (Auth), Before Epic 2 (Client Portal)

**Stories:**

| Story | Title                                         | Effort |
| ----- | --------------------------------------------- | ------ |
| 1.5.1 | Initialize Next.js 16 project with App Router | Small  |
| 1.5.2 | Configure Convex + Better Auth integration    | Medium |
| 1.5.3 | Implement proxy-based auth protection         | Medium |
| 1.5.4 | Create parallel routes for RBAC               | Medium |
| 1.5.5 | Migrate portable React components             | Medium |
| 1.5.6 | Migrate and verify Convex functions           | Small  |
| 1.5.7 | Implement authentication flows                | Medium |
| 1.5.8 | Smoke test all functionality                  | Small  |

**Total Estimated Effort:** 1-2 weeks

---

## 5. Implementation Handoff

### Scope Classification: Major

This change requires **Product Manager / Architect** involvement due to:

- New epic creation
- Multiple artifact updates
- Framework-level change

### Handoff Recipients

| Role          | Responsibilities                        |
| ------------- | --------------------------------------- |
| **PM**        | Approve proposal, update sprint backlog |
| **Architect** | Update architecture documentation       |
| **SM**        | Update sprint-status.yaml               |
| **Dev**       | Execute migration stories               |

### Handoff Sequence

1. ✅ PM approves Sprint Change Proposal
2. Architect updates architecture docs (6 files)
3. SM creates Epic 1.5 and stories in sprint-status.yaml
4. Dev executes migration stories in sequence

### Success Criteria

- [ ] New Next.js project running on localhost
- [ ] All auth flows working (sign-in, sign-up, onboarding)
- [ ] Protected routes accessible with role checks
- [ ] No SSR auth redirect loops
- [ ] Project wizard functional at `/client/projects/new`
- [ ] All Convex functions passing
- [ ] Architecture docs updated

---

## 6. Approval

**Do you approve this Sprint Change Proposal?**

- [ ] **Approved** - Proceed with migration
- [ ] **Approved with conditions** - (specify conditions)
- [ ] **Rejected** - (specify reason)

**Approver:** Life-design  
**Date:** 2026-01-03

---

_Generated by PM Agent (John) via Course Correction Workflow_
