# Story 1.3: Sign In with Email/Password (Next.js 16)

Status: backlog

## Story

As a **Returning User**,
I want to log in to my existing account,
So that I can access my dashboard and projects.

## Acceptance Criteria

1. **AC-1:** `/auth/sign-in` route exists in Next.js App Router
2. **AC-2:** Sign-in form collects email and password
3. **AC-3:** Form validation for email format and password required
4. **AC-4:** Successful sign-in creates a secure session cookie
5. **AC-5:** User redirected to appropriate dashboard based on role
6. **AC-6:** Invalid credentials show clear error message
7. **AC-7:** Form has loading and error states
8. **AC-8:** "Don't have an account? Sign up" link works

## Tasks / Subtasks

### Task 1: Create Sign In Route (AC: 1)

- [ ] 1.1 Create `src/app/(auth)/sign-in/page.tsx` - sign-in page

### Task 2: Build Sign-In Form Component (AC: 2, 3, 7)

- [ ] 2.1 Create `src/components/modules/auth/sign-in-form.tsx` as "use client"
- [ ] 2.2 Define Zod schema for validation (email, password)
- [ ] 2.3 Add email input field
- [ ] 2.4 Add password input with visibility toggle
- [ ] 2.5 Add submit button with loading state
- [ ] 2.6 Display validation errors

### Task 3: Implement Sign-In Logic (AC: 4, 5, 6)

- [ ] 3.1 Import `authClient` from `@/lib/auth-client`
- [ ] 3.2 Call `authClient.signIn.email()` on form submit
- [ ] 3.3 Handle success: get user profile to determine role
- [ ] 3.4 Handle success: redirect based on role:
  - Admin → `/admin/dashboard`
  - Client → `/client/dashboard`
  - Employee → `/employee/dashboard`
- [ ] 3.5 Handle users without profile: redirect to `/onboarding`
- [ ] 3.6 Handle errors: display "Invalid email or password"

### Task 4: UX Enhancements (AC: 7, 8)

- [ ] 4.1 Add "Don't have an account? Sign up" link
- [ ] 4.2 Add loading spinner on submit
- [ ] 4.3 Match design with sign-up page (Linear-inspired)
- [ ] 4.4 Optional: Add "Forgot password?" link (placeholder for future)

## Dev Notes

### Next.js App Router Structure

```
app/
├── (auth)/
│   ├── layout.tsx           ← Shared auth layout
│   ├── sign-up/page.tsx     ← Story 1.2
│   └── sign-in/page.tsx     ← This route
```

### Better Auth Sign In API

```typescript
import { authClient } from "@/lib/auth-client";

const result = await authClient.signIn.email({
  email: formData.email,
  password: formData.password,
});

if (result.error) {
  setError("Invalid email or password");
} else {
  // Check profile and redirect based on role
}
```

### Role-Based Redirect Logic

After successful sign-in:

1. Fetch user profile using Convex query
2. If no profile exists → redirect to `/onboarding`
3. If profile exists:
   - `role === 'admin'` → `/admin/dashboard`
   - `role === 'client'` → `/client/dashboard`
   - `role === 'employee'` → `/employee/dashboard`

### Portable from Old Project

- `src/components/auth/sign-in.tsx` - Mostly portable, update navigation
- Form validation logic - Portable
- Error handling - Portable

### References

- [Source: _bmad-output/docs/nextjs/betterauth-convex.md#auth-client]
- [Source: Old story 1-3-sign-in-with-email-password.md]

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Completion Notes List

(To be filled by dev agent)

### File List

(To be filled by dev agent)
