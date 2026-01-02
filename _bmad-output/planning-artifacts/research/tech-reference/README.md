# Technology Reference Documentation

> **Last Updated:** 2025-12-29
> **Status:** Active Reference

## Overview

This folder contains extracted technology reference documentation for the PrimeEditz project. These documents serve as AI agent reference material during implementation.

---

## Documents

| Document                                               | Description                                                    | Source        |
| ------------------------------------------------------ | -------------------------------------------------------------- | ------------- |
| [tanstack-start.md](./tanstack-start.md)               | TanStack Start RC - routing, middleware, execution model, RBAC | Official Docs |
| [better-auth-convex.md](./better-auth-convex.md)       | Better Auth + Convex integration patterns                      | Official Docs |
| [convex-best-practices.md](./convex-best-practices.md) | Convex Zen, patterns, access control, helper functions         | Official Docs |
| [rbac-implementation.md](./rbac-implementation.md)     | Role-based access control implementation guide                 | Synthesized   |

---

## How to Use

### For AI Agents

When implementing features, reference these documents for:

1. **Route creation** → `tanstack-start.md`
2. **Authentication flows** → `better-auth-convex.md`
3. **Convex function patterns** → `convex-best-practices.md`
4. **Access control** → `rbac-implementation.md`

### Quick Lookups

| Task                   | Reference                                                    |
| ---------------------- | ------------------------------------------------------------ |
| Create protected route | `tanstack-start.md` → Route Protection                       |
| Add auth middleware    | `better-auth-convex.md` → TanStack Start Integration         |
| Write Convex query     | `convex-best-practices.md` → Helper Functions Pattern        |
| Check user role        | `rbac-implementation.md` → Component-Level Permission Checks |

---

## Source URLs

- https://tanstack.com/start/latest/docs/framework/react/guide/routing
- https://tanstack.com/start/latest/docs/framework/react/guide/middleware
- https://tanstack.com/start/latest/docs/framework/react/guide/authentication
- https://tanstack.com/router/latest/docs/framework/react/how-to/setup-rbac
- https://www.better-auth.com/docs/integrations/tanstack
- https://www.better-auth.com/docs/integrations/convex
- https://docs.convex.dev/understanding/best-practices/
- https://docs.convex.dev/understanding/zen
- https://github.com/get-convex/convex-helpers

---

## Maintenance

These documents should be updated when:

- Major framework updates occur
- Breaking changes are discovered during implementation
- New patterns are established in the project
