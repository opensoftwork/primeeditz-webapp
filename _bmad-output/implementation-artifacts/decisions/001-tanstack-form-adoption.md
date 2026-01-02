# ADR 001: Adopt TanStack Form for All Form Implementations

**Date:** 2025-12-31  
**Status:** Accepted  
**Decision Maker:** Life-design (Product Owner)  
**Context:** Epic 1 - Authentication & Onboarding

## Context

We need to choose a form library for implementing authentication pages (sign-up, sign-in, profile onboarding) and all future forms across the application.

## Decision

We will use **TanStack Form** as our standard form library for all form implementations in PrimeEditz.

## Rationale

### 1. **Stack Alignment**

- Already using TanStack Router and TanStack Query
- TanStack Form integrates seamlessly with the TanStack ecosystem
- Consistent patterns and mental models across the entire stack
- Better TypeScript inference when used with TanStack Router

### 2. **Technical Advantages**

- **SSR Support:** Excellent server-side rendering support (critical for auth flows)
- **Bundle Size:** Smaller bundle size compared to React Hook Form
- **Headless Design:** Full control over markup and styling
- **Framework Agnostic:** Works perfectly with TanStack Start
- **Validation Flexibility:** Multiple validation strategies (onChange, onBlur, onSubmit)

### 3. **Documentation Ready**

- Comprehensive TanStack Form documentation already available
- Field component patterns documented
- Examples for all form types (input, textarea, select, checkbox, radio, switch)
- Zod validation patterns documented

### 4. **Low Risk**

- Stories 1.2, 1.3, 1.4 not yet started
- No rework required
- Clear migration path for future forms

## Alternatives Considered

### React Hook Form

**Pros:**

- More mature ecosystem
- Larger community
- More third-party integrations
- Familiar to many developers

**Cons:**

- External to TanStack ecosystem
- Limited SSR support
- Larger bundle size
- Less flexible validation strategies

**Decision:** Rejected due to stack misalignment and SSR limitations.

## Consequences

### Positive

- ✅ Consistent form patterns across the application
- ✅ Better SSR support for auth flows
- ✅ Smaller bundle size
- ✅ Full control over form markup and styling
- ✅ Seamless integration with existing TanStack tools

### Negative

- ⚠️ Learning curve for developers unfamiliar with TanStack Form
- ⚠️ Smaller community compared to React Hook Form

### Neutral

- Documentation and examples readily available
- Team will need to reference TanStack Form docs

## Implementation

### Affected Stories

- **Story 1.2:** Sign Up with Email/Password
- **Story 1.3:** Sign In with Email/Password
- **Story 1.4:** Profile Onboarding Flow
- **Future:** All forms in Epic 2-7 (client portal, admin portal, quotations, etc.)

### Migration Path

1. Use TanStack Form for all new form implementations
2. Reference `_bmad-output/docs/ui/tanstack-form.md` for patterns
3. Use `Field` components from `_bmad-output/docs/ui/field.md` for accessibility
4. Validate with Zod schemas

## References

- [TanStack Form Documentation](https://tanstack.com/form)
- [Project Docs: TanStack Form](_bmad-output/docs/ui/tanstack-form.md)
- [Project Docs: Field Components](_bmad-output/docs/ui/field.md)
- [Epic 1: Authentication & Onboarding](_bmad-output/planning-artifacts/epics/01-auth-onboarding.md)

## Review

This decision was made during Epic 1 implementation planning. The decision is reversible but would require significant rework if changed after multiple forms are implemented.

**Next Review:** After Epic 1 completion (retrospective)
