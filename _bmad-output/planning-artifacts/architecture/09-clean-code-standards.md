# Clean Code Standards & Architecture Patterns

This document defines the clean code practices and architecture patterns that ALL agents MUST follow when implementing features in PrimeEditz.

---

## 1. Route Architecture (TanStack Router)

### Thin Route Files Rule

**Routes should be THIN - max 100 lines.** They contain only:

- `createFileRoute()` configuration
- Route wrapper component (passes props to module component)
- NO business logic, NO complex UI

### Route File Pattern

```tsx
// routes/_authed/client/projects/new.tsx

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import {
  ProjectWizard,
  ProjectWizardLoading,
  ProjectWizardError,
} from "@/components/modules/projects";
import { canAccessRoleRoute, ROLES } from "@/utils/auth";

export const Route = createFileRoute("/_authed/client/projects/new")({
  // Search Params
  validateSearch: (search) => ({
    step: Number(search.step) || 1,
    projectId: search.projectId as string | undefined,
  }),

  // Authorization Guard
  beforeLoad: ({ context }) => {
    if (!canAccessRoleRoute(context.profile?.role, ROLES.client)) {
      throw redirect({ to: "/employee/dashboard" });
    }
  },

  // Data Loader (async data fetching)
  // loader: async ({ context }) => { ... },

  // UI Components
  pendingComponent: ProjectWizardLoading,
  errorComponent: ProjectWizardError,
  component: ProjectWizardRoute,
});

// THIN wrapper - just passes props to module component
function ProjectWizardRoute() {
  const navigate = useNavigate();
  const { step, projectId } = Route.useSearch();

  const handleStepChange = useCallback(
    (newStep: number) => {
      navigate({
        to: ".",
        search: (prev) => ({ ...prev, step: newStep }),
        replace: true,
      });
    },
    [navigate]
  );

  return (
    <ProjectWizard
      initialStep={step}
      projectId={projectId}
      onStepChange={handleStepChange}
    />
  );
}
```

### Route Configuration Options

| Option             | Purpose                 | When to Use                    |
| ------------------ | ----------------------- | ------------------------------ |
| `validateSearch`   | Type-safe search params | When route uses query params   |
| `beforeLoad`       | Authorization guards    | Protected routes               |
| `loader`           | Async data fetching     | When data needed before render |
| `pendingComponent` | Loading UI              | Always - while loader runs     |
| `errorComponent`   | Error UI                | Always - catch errors          |
| `component`        | Main route component    | Always                         |

---

## 2. Component Architecture (Container/Presentational Pattern)

### Pattern Overview

| Type               | Location                                 | Purpose                          |
| ------------------ | ---------------------------------------- | -------------------------------- |
| **Container**      | `components/modules/{feature}/`          | State management, business logic |
| **Presentational** | `components/shared/` or `components/ui/` | Pure UI, receives props          |
| **Route Wrapper**  | `routes/.../*.tsx`                       | Thin bridge to container         |

### Feature Module Structure

```
src/components/modules/{feature}/
├── {sub-feature}/
│   ├── {component}.tsx           # Main container component
│   ├── {component}-loading.tsx   # Loading state
│   ├── {component}-error.tsx     # Error state
│   ├── {component}-*.tsx         # Other related components
│   └── index.ts                  # Sub-feature exports
└── index.ts                      # Module root exports
```

### Example: Projects Module

```
src/components/modules/projects/
├── wizard/
│   ├── project-wizard.tsx
│   ├── project-wizard-loading.tsx
│   ├── project-wizard-error.tsx
│   ├── step-content-placeholder.tsx
│   └── index.ts
├── detail/
│   ├── project-detail.tsx
│   └── index.ts
└── index.ts
```

---

## 3. File Naming Conventions

### Component Files

| Type                | Pattern                 | Example                      |
| ------------------- | ----------------------- | ---------------------------- |
| Container component | `{feature}-{role}.tsx`  | `project-wizard.tsx`         |
| Loading component   | `{feature}-loading.tsx` | `project-wizard-loading.tsx` |
| Error component     | `{feature}-error.tsx`   | `project-wizard-error.tsx`   |
| Shared UI component | `{component-name}.tsx`  | `step-indicator.tsx`         |
| Module index        | `index.ts`              | Always export from index     |

### Route Files

| Type          | Pattern        | Example          |
| ------------- | -------------- | ---------------- |
| Static route  | `{name}.tsx`   | `dashboard.tsx`  |
| Dynamic route | `${param}.tsx` | `$projectId.tsx` |
| Index route   | `index.tsx`    | `index.tsx`      |
| Layout route  | `_layout.tsx`  | `_authed.tsx`    |

### Utility/Hook Files

| Type             | Pattern                           | Example              |
| ---------------- | --------------------------------- | -------------------- |
| Custom hook      | `use-{name}.ts` or `use{Name}.ts` | `useFileUploader.ts` |
| Utility file     | `{name}.ts`                       | `file.ts`, `auth.ts` |
| Type definitions | `types.ts`                        | `types.ts`           |

---

## 4. Folder Structure Rules

### When to Create a New Module

Create a new module in `components/modules/` when:

1. ✅ Feature has 3+ related components
2. ✅ Feature has container + presentational components
3. ✅ Feature will grow (multiple steps, states, views)
4. ✅ Feature is domain-specific (projects, quotations, etc.)

### When to Use `components/shared/`

Use shared components when:

1. ✅ Component is reusable across multiple features
2. ✅ Component is purely presentational (no business logic)
3. ✅ Component is generic (wizard step indicator, file uploader, etc.)

### Component Organization

```
src/components/
├── ui/                  # shadcn/ui primitives (DO NOT MODIFY MUCH)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
│
├── shared/              # Shared reusable components
│   ├── wizard/          # Wizard-related shared components
│   │   ├── step-indicator.tsx
│   │   └── index.ts
│   ├── image-viewer/    # Image viewing components
│   │   ├── image-slider.tsx
│   │   └── index.ts
│   └── file-uploader/   # File upload components
│       └── ...
│
├── modules/             # Feature-specific modules
│   ├── projects/        # Project feature
│   │   ├── wizard/
│   │   ├── detail/
│   │   └── index.ts
│   ├── quotations/      # Quotation feature
│   └── ...
│
└── layout/              # App layout components
    ├── app-sidebar.tsx
    ├── app-layout.tsx
    └── index.ts
```

---

## 5. Import Rules

### Import Order

```tsx
// 1. React & framework imports
import { useState, useEffect, useCallback } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

// 2. Third-party libraries
import { toast } from "sonner";
import { Loader2, ChevronRight } from "lucide-react";

// 3. Internal modules (absolute imports)
import { api } from "@/../convex/_generated/api";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ProjectWizard } from "@/components/modules/projects";
import { canAccessRoleRoute, ROLES } from "@/utils/auth";

// 4. Relative imports (same module)
import { StepContentPlaceholder } from "./step-content-placeholder";
```

### Module Exports

Always export from `index.ts`:

```tsx
// components/modules/projects/index.ts
export * from "./wizard";
export * from "./detail";

// components/modules/projects/wizard/index.ts
export { ProjectWizard, WIZARD_STEPS } from "./project-wizard";
export { ProjectWizardLoading } from "./project-wizard-loading";
export { ProjectWizardError } from "./project-wizard-error";
```

---

## 6. Code Quality Rules

### File Size Limits

| File Type      | Max Lines | Action When Exceeded      |
| -------------- | --------- | ------------------------- |
| Route file     | ~100      | Extract to modules        |
| Component file | ~200      | Split into sub-components |
| Utility file   | ~150      | Split by functionality    |

### Component Props Interface

Always define explicit props interface:

```tsx
interface ProjectWizardProps {
  /** Initial step from URL search params */
  initialStep: number;
  /** Project ID from URL (if editing draft) */
  projectId?: string;
  /** Callback to sync step to URL */
  onStepChange?: (step: number) => void;
}

export function ProjectWizard({
  initialStep,
  projectId,
  onStepChange,
}: ProjectWizardProps) {
  // ...
}
```

### JSDoc Comments

Add JSDoc to exported functions/components:

```tsx
/**
 * Project Wizard Component
 *
 * Multi-step wizard for creating project requests.
 * Container component that manages wizard state and navigation.
 *
 * @param initialStep - Step to start on (from URL)
 * @param projectId - Draft project ID (if continuing)
 * @param onStepChange - Callback when step changes (for URL sync)
 */
export function ProjectWizard({ ... }: ProjectWizardProps) {
  // ...
}
```

---

## 7. Agent Implementation Checklist

When implementing a new feature, agents MUST:

- [ ] Check if feature needs a new module in `components/modules/`
- [ ] Create container component with proper props interface
- [ ] Create loading component (`{feature}-loading.tsx`)
- [ ] Create error component (`{feature}-error.tsx`)
- [ ] Export all components from `index.ts`
- [ ] Create thin route file (config only)
- [ ] Use shared components where appropriate
- [ ] Follow file naming conventions
- [ ] Keep files under size limits
- [ ] Add JSDoc comments to exports

---

## 8. Examples

### Good: Thin Route with Module Component

```tsx
// Route file: ~50 lines, config only
export const Route = createFileRoute('/_authed/client/projects/new')({
  validateSearch: ...,
  beforeLoad: ...,
  pendingComponent: ProjectWizardLoading,
  errorComponent: ProjectWizardError,
  component: ProjectWizardRoute,
})

function ProjectWizardRoute() {
  // Thin wrapper - just passes props
  return <ProjectWizard initialStep={...} />
}
```

### Bad: Fat Route with Inline Components

```tsx
// ❌ DON'T DO THIS - route file is 300+ lines
export const Route = createFileRoute("...")({
  component: function () {
    // All logic inline
    const [step, setStep] = useState(1);
    // ... 200 lines of logic and UI ...
    return <div>{/* Complex inline UI */}</div>;
  },
});
```

---

_Last Updated: 2026-01-02 | Story 2.0: Wizard Infrastructure_
