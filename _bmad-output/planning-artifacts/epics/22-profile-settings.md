# Epic 22: Profile Settings — Tab-Based UI

**Status**: In Progress
**Owner**: Antigravity
**Created**: 2026-02-23

---

## 📋 Overview

The PrimeEditz platform needs a **Profile Settings** page accessible to all user roles (admin, studio, employee). The page provides a Coda-inspired tab-based UI with a left sidebar showing user avatar, name, role badge, and quick stats, alongside a tabbed content area for managing personal information, viewing account details, and future security/activity modules.

### Key Architectural Decisions

- **Shared component** — A single `ProfileSettings` component in `src/components/modules/profile/` is used by all three roles (admin, studio, employee), avoiding code duplication.
- **Thin route pages** — Each role has a minimal route page at `@{role}/settings/profile/page.tsx` that renders the shared component.
- **Existing Convex API** — Uses `api.profiles.getMyProfile` for reading and `api.functions.profiles.mutations.updateProfile` for updating profile data. No new backend mutations needed.
- **Tab-based UI** — Custom tab navigation with `motion/react` spring animations for active indicator, matching the project's existing settings page pattern (see `src/components/modules/admin/settings/index.tsx`).
- **Sidebar navigation** — Already wired via the existing "Profile Settings" link in `sidebar-user-menu.tsx` (line 106: `<Link href="/settings/profile">`).

---

## Requirements Inventory

### Functional Requirements

- **FR1**: All authenticated users (admin, studio, employee) must be able to access `​/settings/profile` to view their profile information.
- **FR2**: Users must see their avatar, name, email, and role badge in a left sidebar panel.
- **FR3**: The profile page must have a tab-based navigation with four tabs: Profile Info, Account, Security, and Activity.
- **FR4**: Users must be able to edit their name, phone, and company fields via an inline edit mode triggered by an "Edit Profile" button.
- **FR5**: The Account tab must display email (read-only), role, account status, and account creation date.
- **FR6**: The Security and Activity tabs should display "Coming Soon" placeholders.
- **FR7**: Profile updates must persist to the Convex database via the existing `updateProfile` mutation.
- **FR8**: The page must show appropriate loading skeletons while data is being fetched.

### Non-Functional Requirements

- **NFR1**: The page must follow the premium dark-mode aesthetic (glassmorphic cards, uppercase tracking labels, motion animations).
- **NFR2**: Tab switching must have smooth spring animations for the active indicator.
- **NFR3**: The left sidebar avatar must have a camera hover overlay for future profile picture upload.
- **NFR4**: All three roles must render the exact same component with role-specific data displayed dynamically.
- **NFR5**: The component must be responsive and handle overflow gracefully.

---

## FR Coverage Map

| Requirement   | Story | Components                                               |
| ------------- | ----- | -------------------------------------------------------- |
| FR1, FR2, FR8 | 22.1  | Route pages, ProfileSettings component, loading skeleton |
| FR3, FR4, FR7 | 22.1  | Tab navigation, ProfileInfoTab, edit mode, updateProfile |
| FR5           | 22.1  | AccountTab component                                     |
| FR6           | 22.1  | SecurityTab, ActivityTab with ComingSoonPlaceholder      |

---

## Story 22.1: Profile Settings Page — Tab-Based UI with Edit Capability

**Status**: ✅ Done

As a **user (admin, studio, or employee)**,
I want **a profile settings page with a tab-based UI showing my profile, account, security, and activity information**,
So that **I can view and manage my personal information from a single, well-organized page**.

**Description:**

Build a complete profile settings page with:

1. **Left sidebar** — Profile avatar with camera hover overlay, name, email, role badge (color-coded by role), "Edit Profile" / "Save" / "Cancel" buttons, and quick stats (status, member since).
2. **Tab navigation** — Four tabs (Profile Info, Account, Security, Activity) with spring-animated active indicator using `motion/react`, matching the existing Settings page pattern.
3. **Profile Info tab** — Displays name, phone, company, and designation in card-based field layout. Edit mode transforms read-only fields into input fields.
4. **Account tab** — Read-only display of email (with verified badge), role, account status, and creation date.
5. **Security tab** — Coming soon placeholder for password management, 2FA, and session management.
6. **Activity tab** — Coming soon placeholder for project activity and action history.
7. **Route pages** — Thin route pages for all three roles under `@admin/settings/profile/`, `@studio/settings/profile/`, `@employee/settings/profile/`.

**File Structure:**

```
src/components/modules/profile/
└── profile-settings.tsx           # Main shared component (~750 lines)

src/app/(protected)/
├── @admin/settings/profile/
│   └── page.tsx                   # Admin route (thin)
├── @studio/settings/profile/
│   └── page.tsx                   # Studio route (thin)
└── @employee/settings/profile/
    └── page.tsx                   # Employee route (thin)
```

**Technical Notes:**

- Uses `api.profiles.getMyProfile` query with `@ts-ignore` for deep type instantiation (same pattern as `layout.tsx`).
- Uses `api.functions.profiles.mutations.updateProfile` mutation for saving edits.
- `LucideIcon` type used for icon props (avoids TS2322 with `React.ElementType`).
- Role badge colors: admin (amber), studio (blue), employee (emerald).
- Tab animation uses `layoutId="profileActiveTab"` with spring physics (`stiffness: 500, damping: 30`).
- Edit mode only applies to Profile Info tab fields; Account fields are always read-only.
- Avatar camera overlay is UI-only for now (no upload functionality wired).

**Acceptance Criteria:**

**Given** an authenticated admin navigates to `/settings/profile`
**When** the page loads
**Then** the left sidebar displays their avatar (or initials fallback), name, email, role badge ("ADMIN" in amber), and "Edit Profile" button
**And** the Profile Info tab is selected by default showing name, phone, and company fields

**Given** an authenticated studio user navigates to `/settings/profile`
**When** the page loads
**Then** the role badge displays "STUDIO" in blue
**And** all tabs and functionality work identically to admin

**Given** a user clicks "Edit Profile"
**When** the edit mode activates
**Then** the name, phone, and company fields become editable input fields
**And** the "Edit Profile" button is replaced with "Cancel" and "Save" buttons
**And** field cards gain a primary border glow effect

**Given** a user modifies their name and clicks "Save"
**When** the mutation completes
**Then** a success toast "Profile updated successfully" appears
**And** the edit mode deactivates
**And** the updated name is reflected in the sidebar and Profile Info tab

**Given** a user clicks "Cancel" during edit mode
**When** the action is processed
**Then** all changes are discarded
**And** the fields revert to their original values

**Given** a user clicks the "Account" tab
**When** the tab content transitions
**Then** the active indicator animates smoothly to the Account tab
**And** the content shows email (with "Verified" badge), role, account status ("Active"), and account creation date

**Given** a user clicks "Security" or "Activity" tabs
**When** the tab content loads
**Then** a premium "Coming Soon" placeholder is displayed with pulsing icon, title, description, and badge

**Given** the profile data is loading
**When** the user visits the page
**Then** a full skeleton layout is displayed (avatar skeleton, tab skeletons, field skeletons)

---

## Future Stories (Planned)

### Story 22.2: Profile Picture Upload (Planned)

As a **user**,
I want **to upload and change my profile picture**,
So that **my avatar is personalized across the platform**.

_Status: Not started — depends on MinIO/R2 integration for profile images._

### Story 22.3: Security — Password & Session Management (Planned)

As a **user**,
I want **to manage my password and view active sessions**,
So that **I can maintain the security of my account**.

_Status: Not started — depends on Better Auth session management API._

### Story 22.4: Activity Feed (Planned)

As a **user**,
I want **to see my recent project activity and action history**,
So that **I can track my contributions and recent changes**.

_Status: Not started — depends on status history and audit trail queries._

---

## Implementation Priority

| Story | Priority     | Effort | Dependencies                           | Status  |
| ----- | ------------ | ------ | -------------------------------------- | ------- |
| 22.1  | **Critical** | Medium | Existing profile queries and mutations | ✅ Done |
| 22.2  | Medium       | Medium | MinIO/R2 profile image storage         | Planned |
| 22.3  | Low          | High   | Better Auth session APIs               | Planned |
| 22.4  | Low          | Medium | Audit trail / status history queries   | Planned |

---

## 🔄 Status History

- **2026-02-23**: Epic created. Story 22.1 implemented — shared ProfileSettings component with tab-based UI, edit mode, and route pages for all three roles. Zero TypeScript errors confirmed.
