# Story 1.2: Sign Up with Email/Password (Next.js 16)

Status: backlog

## Story

As a **New Client**,
I want to create an account using my email and password,
So that I can start using the PrimeEditz platform.

## Acceptance Criteria

1. **AC-1:** `/auth/sign-up` route exists in Next.js App Router
2. **AC-2:** Sign-up form collects email, password, confirm password, first name, last name
3. **AC-3:** Form validation with Zod (email format, password 8+ chars, passwords match)
4. **AC-4:** Submitting valid credentials creates user via Better Auth
5. **AC-5:** Success shows toast: "Account created! Please complete your profile."
6. **AC-6:** User redirected to `/onboarding` after successful sign-up
7. **AC-7:** Duplicate email shows clear error message
8. **AC-8:** Form has loading and error states

## Tasks / Subtasks

### Task 1: Create Auth Layout and Route (AC: 1)

- [ ] 1.1 Create `src/app/(auth)/layout.tsx` - centered auth layout (if not exists)
- [ ] 1.2 Create `src/app/(auth)/sign-up/page.tsx` - sign-up page

### Task 2: Build Sign-Up Form Component (AC: 2, 3, 8)

- [ ] 2.1 Create `src/components/modules/auth/sign-up-form.tsx` as "use client"
- [ ] 2.2 Define Zod schema for validation
- [ ] 2.3 Add email, password, confirm password fields
- [ ] 2.4 Add first name, last name fields
- [ ] 2.5 Use `PasswordInput` component for password visibility toggle
- [ ] 2.6 Add submit button with loading state
- [ ] 2.7 Display validation errors using shadcn Field components

### Task 3: Implement Sign-Up Logic (AC: 4, 5, 6, 7)

- [ ] 3.1 Import `authClient` from `@/lib/auth-client`
- [ ] 3.2 Call `authClient.signUp.email()` on form submit
- [ ] 3.3 Handle success: show toast notification (Sonner)
- [ ] 3.4 Handle success: redirect to `/onboarding` using `useRouter`
- [ ] 3.5 Handle errors: display error message for duplicates, validation

### Task 4: UX Enhancements (AC: 8)

- [ ] 4.1 Add "Already have an account? Sign in" link
- [ ] 4.2 Add loading spinner on submit button
- [ ] 4.3 Preserve premium Linear-inspired split layout design

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

### Key Differences from TanStack Version

| Aspect         | TanStack Start                | Next.js 16                           |
| -------------- | ----------------------------- | ------------------------------------ |
| Route file     | `src/routes/auth/sign-up.tsx` | `src/app/(auth)/sign-up/page.tsx`    |
| Navigation     | `useNavigate()`               | `useRouter()` from `next/navigation` |
| Route guard    | `beforeLoad`                  | Server Component or layout check     |
| Form component | Same (React component)        | Same (React component)               |

### Portable from Old Project

- `src/components/auth/sign-up.tsx` - Mostly portable, update navigation
- `src/components/ui/password-input.tsx` - 100% portable

### References

- [Source: Old story 1-2-sign-up-with-email-password.md for form logic]
- [Source: _bmad-output/docs/nextjs/betterauth-convex.md#auth-client]

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Completion Notes List

(To be filled by dev agent)

### File List

(To be filled by dev agent)
