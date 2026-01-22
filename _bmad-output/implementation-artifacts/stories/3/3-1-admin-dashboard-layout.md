# Story 3.1: Admin Dashboard Layout

**Epic**: Epic 3 - Admin Portal — Project & System Management  
**Status**: done  
**Complexity**: Medium  
**Created**: 2026-01-06

---

## 📋 User Story

**As an** Admin,  
**I want** a dashboard that shows key metrics and pending actions,  
**So that** I can quickly understand the state of my business.

---

## ✅ Acceptance Criteria

- **Given** I am logged in as an Admin
- **When** I navigate to `/dashboard` (admin parallel route)
- **Then** I must see:
  - **Pending Requests count** - projects with status: `pending_review`
  - **Active Projects count** - projects with status: `active` or `in_progress`
  - **Quick Actions section** with navigation links
- **And** a **"Pending Requests"** list must show projects awaiting review (status: `pending_review`)
- **And** Quick Actions must include:
  - "View Pending Requests" → `/admin/projects?status=pending_review`
  - "Manage Project Types" → `/admin/settings/project-types`
  - "Manage Employees" → `/admin/settings/employees`
- **And** real-time subscriptions must update counts without page refresh

---

## 🎯 Implementation Tasks

### Task 1: Create Admin Convex Queries

**File**: `convex/functions/admin/dashboard.ts`

Create the following queries:

1. **`getAdminDashboardStats`** - Returns:

   - `pendingRequestsCount`: Count of projects with `status: 'pending_review'`
   - `activeProjectsCount`: Count of projects with `status: 'active'` or `'in_progress'`
   - `totalEmployeesCount`: Count of profiles with `role: 'employee'` or `'admin'`

2. **`getPendingProjects`** - Returns:
   - Array of projects with `status: 'pending_review'`
   - Include: `code`, `projectTypeId`, `clientId`, `eventName`, `eventDate`, `_creationTime`
   - Join with `projectTypes` to get project type name
   - Join with `profiles` to get client name
   - Sort by `_creationTime` descending (newest first)
   - Limit to 10 most recent

**Auth**: Use `authenticatedQuery` wrapper with admin role check

**Schema Reference**:

```typescript
// From convex/schema.ts
projects: {
  code: string
  projectTypeId: Id<"projectTypes">
  clientId: Id<"profiles">
  status: projectStatusValidator
  eventName?: string
  eventDate?: number
  _creationTime: number
}
```

---

### Task 2: Update Admin Dashboard Page Component

**File**: `src/app/(protected)/dashboard/@admin/page.tsx`

**Current State**: Basic placeholder with hardcoded "0" values

**Changes Required**:

1. **Import new queries**:

   ```typescript
   import { api } from "@convex/_generated/api";
   import { useQuery } from "convex/react";
   ```

2. **Replace hardcoded stats** with real-time data:

   - Use `useQuery(api.admin.dashboard.getAdminDashboardStats)`
   - Update the three stat cards with live counts
   - Add loading skeletons while data loads

3. **Add Pending Requests Section**:

   - Use `useQuery(api.admin.dashboard.getPendingProjects)`
   - Display in a table or card list format
   - Show: Project Code, Client Name, Project Type, Event Date, Created Date
   - Add "View Details" link to each project → `/admin/projects/{projectId}`
   - Show empty state if no pending requests

4. **Add Quick Actions Section**:

   - Create a new Card with quick action buttons
   - Use shadcn Button components with proper icons
   - Links:
     - "View All Pending Requests" → `/admin/projects?status=pending_review`
     - "Manage Project Types" → `/admin/settings/project-types`
     - "Manage Employees" → `/admin/settings/employees`

5. **Update Stats Cards Icons**:
   - Pending Requests: Use `AlertCircle` from lucide-react
   - Active Projects: Use `FolderKanban` (already present)
   - Team Members: Use `Users` (already present)

---

### Task 3: Create Shared Components (if needed)

**File**: `src/components/modules/admin/dashboard-stats-card.tsx` (Optional)

If the stats cards become complex, extract into a reusable component:

```typescript
interface DashboardStatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}
```

**Note**: Only create if complexity warrants it. Simple inline cards are fine for MVP.

---

### Task 4: Add Loading States

**Requirements**:

- Show skeleton loaders while queries are loading
- Use shadcn `Skeleton` component
- Match the layout structure (3 stat cards + pending requests table)

**Pattern**:

```typescript
if (!dashboardStats || !pendingProjects) {
  return <DashboardSkeleton />;
}
```

---

### Task 5: Add Empty States

**Pending Requests Empty State**:

- Show when `pendingProjects.length === 0`
- Message: "No pending requests at the moment"
- Icon: CheckCircle2 (green)
- Suggestion: "All caught up! Check back later."

---

### Task 6: Add Error Handling

**Requirements**:

- Wrap queries in try-catch (Convex handles errors gracefully)
- Show error boundary if queries fail
- Use Next.js error.tsx pattern if needed

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] **As Admin**: Navigate to `/dashboard` and verify:

  - [ ] Stats cards show correct counts
  - [ ] Pending requests list displays correctly
  - [ ] Quick actions navigate to correct routes
  - [ ] Real-time updates work (create a new project in another tab)
  - [ ] Loading states appear during data fetch
  - [ ] Empty state shows when no pending requests

- [ ] **As Client/Employee**: Verify cannot access admin dashboard
  - [ ] Should see client/employee dashboard instead

### Data Scenarios

- [ ] Test with 0 pending requests
- [ ] Test with 1-5 pending requests
- [ ] Test with 10+ pending requests (pagination not required for MVP)
- [ ] Test with 0 active projects
- [ ] Test with mixed project statuses

### Responsive Design

- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)
- [ ] Verify stats cards stack properly on mobile

---

## 📦 Dependencies

### Existing Code

- ✅ `src/app/(protected)/dashboard/@admin/page.tsx` - Placeholder exists
- ✅ `convex/schema.ts` - All tables defined
- ✅ `convex/functions/profiles/queries.ts` - Auth patterns established
- ✅ shadcn/ui components (Card, Button, Skeleton)

### New Files Required

- `convex/functions/admin/dashboard.ts` - Admin dashboard queries
- (Optional) `src/components/modules/admin/dashboard-stats-card.tsx`

### External Dependencies

- None (all dependencies already installed)

---

## 🔗 Integration Points

### Convex Functions

- **Auth Wrapper**: Use `authenticatedQuery` from `convex/functions/_auth.ts`
- **Role Check**: Verify `ctx.user.role === 'admin'`

### Routes (Future Stories)

- `/admin/projects` - Story 3.2 (Admin Project Listing)
- `/admin/projects/{projectId}` - Story 3.3 (Admin Project Detail)
- `/admin/settings/project-types` - Story 3.7 (Project Types Management)
- `/admin/settings/employees` - Story 3.6 (Employee Management)

**Note**: These routes don't exist yet. For MVP, links can be placeholders or disabled until implemented.

---

## 🎨 Design Guidelines

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│  [Pending Requests] [Active Projects] [Team]    │  ← Stats Cards
├─────────────────────────────────────────────────┤
│  Quick Actions                                  │  ← Action Buttons
├─────────────────────────────────────────────────┤
│  Pending Requests List                          │  ← Table/Cards
│  - Project Code | Client | Type | Date          │
└─────────────────────────────────────────────────┘
```

### Color Scheme

- Use existing theme colors (OKLCH-based)
- Pending Requests card: Amber/warning accent
- Active Projects card: Blue/primary accent
- Team Members card: Green/success accent

### Typography

- Card titles: `text-sm font-medium`
- Stat values: `text-2xl font-bold`
- Descriptions: `text-xs text-muted-foreground`

---

## 📝 Notes

### Parallel Development Coordination

- **Epic 2 (Client Portal)** is being developed in another chat
- This story is **SAFE** to implement - no conflicts with Epic 2
- Admin routes are isolated: `src/app/(protected)/dashboard/@admin/*`
- Convex functions are isolated: `convex/functions/admin/*`

### Schema Notes

- Schema is **COMPLETE** - no changes needed for this story
- All required tables exist: `projects`, `projectTypes`, `profiles`
- Use existing indexes: `by_status`, `by_clientId`, `by_role`

### Future Enhancements (Post-MVP)

- Add charts/graphs for project trends
- Add recent activity feed
- Add notifications/alerts section
- Add quick filters for pending requests

---

## 🚀 Definition of Done

- [x] Admin dashboard queries created and tested
- [x] Dashboard page component updated with real data
- [x] All acceptance criteria met
- [x] Loading states implemented
- [x] Empty states implemented
- [x] Manual testing completed
- [x] Code follows project patterns (convex-helpers, shadcn/ui)
- [x] No TypeScript errors
- [x] No console errors in browser
- [x] Responsive design verified
- [x] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                                                     |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-01-06 | ready-for-dev | Story created, ready to start                             |
| 2026-01-07 | done          | Implemented with premium stats cards and pending requests |

---

**Next Story**: 3.2 - Admin Project Listing with Filters
