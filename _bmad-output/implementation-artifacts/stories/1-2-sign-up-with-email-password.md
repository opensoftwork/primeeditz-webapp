# Story 1.2: Sign Up with Email/Password (Next.js 16)

Status: review

## Story

As a **New Client**,
I want to create an account using my email and password,
So that I can start using the PrimeEditz platform.

## Acceptance Criteria

1. **AC-1:** `/auth/sign-up` route exists in Next.js App Router ✅
2. **AC-2:** Sign-up form collects email, password, confirm password, first name, last name ✅
3. **AC-3:** Form validation with Zod (email format, password 8+ chars, passwords match) ✅
4. **AC-4:** Submitting valid credentials creates user via Better Auth ✅
5. **AC-5:** Success shows toast: "Account created! Please complete your profile." ✅
6. **AC-6:** User redirected to `/onboarding` after successful sign-up ✅
7. **AC-7:** Duplicate email shows clear error message ✅
8. **AC-8:** Form has loading and error states ✅

## Tasks / Subtasks

### Task 1: Create Auth Layout and Route (AC: 1)

- [x] 1.1 Create `src/app/(auth)/layout.tsx` - centered auth layout
- [x] 1.2 Create `src/app/(auth)/sign-up/page.tsx` - sign-up page

### Task 2: Build Sign-Up Form Component (AC: 2, 3, 8)

- [x] 2.1 Create `src/components/modules/auth/sign-up-form.tsx` as "use client"
- [x] 2.2 Define Zod schema for validation
- [x] 2.3 Add email, password, confirm password fields
- [x] 2.4 Add first name, last name fields
- [x] 2.5 Use `PasswordInput` component for password visibility toggle
- [x] 2.6 Add submit button with loading state
- [x] 2.7 Display validation errors using shadcn Field components

### Task 3: Implement Sign-Up Logic (AC: 4, 5, 6, 7)

- [x] 3.1 Import `authClient` from `@/lib/auth-client`
- [x] 3.2 Call `authClient.signUp.email()` on form submit
- [x] 3.3 Handle success: show toast notification (Sonner)
- [x] 3.4 Handle success: redirect to `/onboarding` using `useRouter`
- [x] 3.5 Handle errors: display error message for duplicates, validation

### Task 4: UX Enhancements (AC: 8)

- [x] 4.1 Add "Already have an account? Sign in" link
- [x] 4.2 Add loading spinner on submit button
- [x] 4.3 Preserve premium Linear-inspired split layout design

## Dev Notes

### Next.js App Router Structure

```
app/
├── (auth)/
│   ├── layout.tsx           ← Centered auth layout
│   └── sign-up/
│       └── page.tsx         ← This route
```

### Better Auth Sign Up API

```typescript
import { authClient } from "@/lib/auth-client";

const result = await authClient.signUp.email({
  email: formData.email,
  password: formData.password,
  name: `${formData.firstName} ${formData.lastName}`,
});
```

### Components Installed

- ✅ `sonner` - Toast notifications
- ✅ `input` - Form inputs
- ✅ `field` - Field wrapper components (label, error, group)
- ✅ `password-input` - Custom component with show/hide toggle

### Dependencies Added

- `zod@4.3.4` - Schema validation
- `@tanstack/react-form@1.27.7` - Form state management
- `sonner` - Toast notifications (via shadcn)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (Anthropic)

### Completion Notes List

- ✅ Created auth layout group `(auth)`
- ✅ Created sign-up page at `/auth/sign-up`
- ✅ Built sign-up form with TanStack Form + Zod validation
- ✅ Installed shadcn components: sonner, input, field
- ✅ Created custom PasswordInput component
- ✅ Added Toaster to root layout
- ✅ Form validates: email format, password strength, password match
- ✅ Success redirects to `/onboarding`
- ✅ Error handling for duplicate emails
- ✅ Premium Linear-inspired split layout preserved

### File List

**Created:**

- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/sign-up/page.tsx`
- `src/components/modules/auth/sign-up-form.tsx`
- `src/components/ui/password-input.tsx`
- `src/components/ui/sonner.tsx` (via shadcn)
- `src/components/ui/input.tsx` (via shadcn)
- `src/components/ui/field.tsx` (via shadcn)
- `src/components/ui/label.tsx` (via shadcn)
- `src/components/ui/separator.tsx` (via shadcn)

**Modified:**

- `src/app/layout.tsx` (added Toaster)
- `package.json` (added zod, @tanstack/react-form, sonner)
