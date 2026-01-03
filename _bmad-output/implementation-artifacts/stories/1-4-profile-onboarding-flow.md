# Story 1.4: Profile Onboarding Flow (Next.js 16)

Status: backlog

## Story

As a **New User**,
I want to complete my profile after my first sign-up,
So that the system can tailor my experience correctly.

## Acceptance Criteria

1. **AC-1:** `/onboarding` route exists in Next.js App Router
2. **AC-2:** Onboarding form collects Full Name and Phone Number
3. **AC-3:** Form validation for required fields
4. **AC-4:** Submitting creates a profile record in Convex
5. **AC-5:** Role is automatically set to `client`
6. **AC-6:** User redirected to Client dashboard after completion
7. **AC-7:** First admin bootstrap: if profiles table is empty, role is set to `admin`
8. **AC-8:** Users with existing profile are redirected away from onboarding

## Tasks / Subtasks

### Task 1: Create Onboarding Route (AC: 1, 8)

- [ ] 1.1 Create `src/app/onboarding/page.tsx`
- [ ] 1.2 Add server-side check for existing profile → redirect to dashboard

### Task 2: Build Onboarding Form Component (AC: 2, 3)

- [ ] 2.1 Create `src/components/modules/onboarding/onboarding-form.tsx`
- [ ] 2.2 Add Full Name input (required)
- [ ] 2.3 Add Phone Number input (optional or required per spec)
- [ ] 2.4 Add form validation with Zod
- [ ] 2.5 Add submit button with loading state

### Task 3: Implement Profile Creation (AC: 4, 5, 7)

- [ ] 3.1 Create Convex mutation `createProfile` (or reuse existing)
- [ ] 3.2 Check if any profiles exist (for first admin bootstrap)
- [ ] 3.3 If first user → set role to `admin`
- [ ] 3.4 Otherwise → set role to `client`
- [ ] 3.5 Save profile to Convex

### Task 4: Post-Onboarding Redirect (AC: 6, 7)

- [ ] 4.1 After profile creation, fetch the profile to get role
- [ ] 4.2 Redirect based on role:
  - Admin → `/admin/dashboard`
  - Client → `/client/dashboard`
- [ ] 4.3 Show success toast: "Profile created! Welcome to PrimeEditz"

## Dev Notes

### Next.js App Router Structure

```
app/
├── onboarding/
│   └── page.tsx             ← This route (not in auth group, needs auth)
```

### Onboarding Flow Logic

```typescript
// In onboarding form submission
const isFirstUser = await convexMutation(api.profiles.isFirstUser);
const role = isFirstUser ? "admin" : "client";

await convexMutation(api.profiles.createProfile, {
  name: formData.fullName,
  phone: formData.phoneNumber,
  role: role,
  onboardingComplete: true,
});
```

### Profile Schema

```typescript
// From existing schema
profiles: {
  userId: v.id("users"),  // Reference to Better Auth user
  name: v.string(),
  phone: v.optional(v.string()),
  role: v.union(v.literal("admin"), v.literal("client"), v.literal("employee")),
  onboardingComplete: v.boolean(),
}
```

### Route Protection

Onboarding page should:

1. Require authentication (redirect to sign-in if not authenticated)
2. Redirect away if user already has a complete profile
3. Allow access only if authenticated AND no profile exists

### Portable from Old Project

- `src/components/onboarding/onboarding-form.tsx` - Update navigation hooks
- Convex mutations `createProfile`, `isFirstUser` - 100% portable

### References

- [Source: _bmad-output/planning-artifacts/epics/01-auth-onboarding.md#Story-1.4]
- [Source: convex/functions/profiles/mutations.ts]
- [Source: Old story 1-4-profile-onboarding-flow.md]

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Completion Notes List

(To be filled by dev agent)

### File List

(To be filled by dev agent)
