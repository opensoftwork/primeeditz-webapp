## Implementation Patterns & Consistency Rules

### Convex File Structure (Validated)

This structure aligns with official Convex documentation and best practices:

```
convex/
├── _generated/              # Auto-generated (DO NOT EDIT)
│   ├── api.d.ts
│   ├── server.d.ts
│   └── dataModel.d.ts
│
├── schema.ts                # All table definitions (~200 lines max)
├── convex.config.ts         # Better Auth component registration
├── http.ts                  # HTTP routes (Better Auth + webhooks)
│
├── lib/                     # Shared utilities (CRITICAL)
│   ├── customFunctions.ts   # Auth wrappers: authenticatedQuery, adminMutation, etc.
│   ├── validators.ts        # Reusable validators: roleValidator, statusValidator
│   ├── storage.ts           # MinIO signed URL helpers
│   └── helpers.ts           # formatCode, timestamps, utilities
│
├── model/                   # Business logic helpers (NOT exposed to client)
│   ├── events.ts            # generateEventCode, validateOwnership
│   ├── quotations.ts        # calculateTotal, applyGST
│   └── (add as logic grows or is reused)
│
└── functions/               # Public API (domain-based)
    ├── users/
    │   ├── queries.ts       # getProfile, getMyProfile
    │   ├── mutations.ts     # createProfile, updateProfile
    │   └── internal.ts      # getUserByExternalId
    │
    ├── events/
    │   ├── queries.ts       # listMy, get, listPending, getByCode
    │   ├── mutations.ts     # create, update, updateStatus
    │   └── internal.ts      # generateCode, validateEvent
    │
    ├── sessions/
    │   ├── queries.ts
    │   ├── mutations.ts
    │   └── internal.ts      # createFolders from template
    │
    ├── quotations/
    │   ├── queries.ts
    │   ├── mutations.ts
    │   └── internal.ts
    │
    ├── assets/
    │   ├── queries.ts
    │   ├── mutations.ts
    │   └── actions.ts       # getUploadUrl, getDownloadUrl (MinIO)
    │
    └── config/              # Configuration CRUD
        ├── eventTypes.ts
        ├── folderTemplates.ts
        ├── quotationTemplates.ts
        └── storageTiers.ts
```

---

### File Size Management (150-Line Rule)

**When files exceed ~150 lines, split into folders by access level:**

```
# Before (single file > 150 lines):
functions/events/queries.ts  # 180 lines - TOO LONG

# After (split by access level):
functions/events/queries/
├── client.ts     # Client-only queries (~60 lines)
├── admin.ts      # Admin-only queries (~80 lines)
└── internal.ts   # Internal helpers (~40 lines)
```

**API path change:**

- Before: `api.functions.events.queries.listMy`
- After: `api.functions.events.queries.client.listMy`

---

### Naming Conventions

**Database (Convex):**

| Item         | Pattern           | Example                                |
| ------------ | ----------------- | -------------------------------------- |
| Tables       | camelCase, plural | `userProfiles`, `events`, `sessions`   |
| Columns      | camelCase         | `createdAt`, `clientId`, `eventTypeId` |
| Foreign Keys | `{table}Id`       | `eventId`, `sessionId`, `folderId`     |
| Indexes      | `by_{column}`     | `by_userId`, `by_status`, `by_code`    |

**Functions (Convex):**

| Item       | Pattern        | Example                            |
| ---------- | -------------- | ---------------------------------- |
| Queries    | camelCase verb | `listMy`, `get`, `getByCode`       |
| Mutations  | camelCase verb | `create`, `update`, `updateStatus` |
| Actions    | camelCase verb | `getUploadUrl`, `processWebhook`   |
| File names | kebab-case     | `queries.ts`, `mutations.ts`       |

**Frontend (React):**

| Item       | Pattern         | Example                                 |
| ---------- | --------------- | --------------------------------------- |
| Components | PascalCase      | `ProjectCard`, `StatusBadge`            |
| Files      | kebab-case.tsx  | `project-card.tsx`, `status-badge.tsx`  |
| Hooks      | `use{Name}`     | `useAuth`, `useUpload`, `useProject`    |
| Variables  | camelCase       | `isLoading`, `eventData`, `currentUser` |
| Constants  | SCREAMING_SNAKE | `MAX_FILE_SIZE`, `DEFAULT_LIMIT`        |

---

### Data Formats

| Format        | Pattern               | Example                         |
| ------------- | --------------------- | ------------------------------- |
| Timestamps    | Unix milliseconds     | `Date.now()` → `1703875200000`  |
| Status values | snake_case strings    | `pending_review`, `in_progress` |
| IDs           | Convex auto-generated | `Id<"events">`                  |
| Booleans      | `true`/`false`        | Never 1/0                       |

---

### Error Handling

**Convex Functions:**

```typescript
// Throw descriptive errors
if (!event) throw new Error("Event not found");
if (event.clientId !== ctx.user.clientProfileId) {
  throw new Error("Access denied");
}
```

**Frontend:**

```typescript
// Error boundaries for unexpected errors (per-route)
// toast.error() for operation failures
try {
  await createEvent(data);
  toast.success("Event created");
} catch (error) {
  toast.error(error.message);
}
```

---

### Loading States

| State        | Condition            | UI                       |
| ------------ | -------------------- | ------------------------ |
| Initial load | `data === undefined` | Skeleton                 |
| Empty        | `data.length === 0`  | Empty state illustration |
| Loaded       | `data` exists        | Render content           |
| Error        | `error !== null`     | Error message + retry    |

---

### All AI Agents MUST:

1. Follow naming conventions exactly (no variations)
2. Organize files in designated directories
3. Use Convex `useQuery` for real-time data (not manual fetch)
4. Handle loading/error states consistently
5. Keep function files under 150 lines (split if larger)
6. Use typed validators from schema
7. Throw errors, never return error objects
8. Auth wrappers in `lib/customFunctions.ts` only
9. Business logic in `model/` when > 10 lines or reused
10. **Follow Clean Architecture for React components** (see below)
11. **Keep route files thin** (~100 lines max, config only)
12. **Use Container/Presentational pattern** for complex features

---

### React Component Architecture

> **Full Details:** See `09-clean-code-standards.md`

**Pattern:** Container/Presentational (Clean Architecture)

| Layer              | Location                        | Purpose                                          |
| ------------------ | ------------------------------- | ------------------------------------------------ |
| **Route**          | `routes/`                       | Config only (validateSearch, beforeLoad, loader) |
| **Container**      | `components/modules/{feature}/` | State management, business logic                 |
| **Presentational** | `components/shared/`            | Reusable UI, receives props                      |
| **Primitives**     | `components/ui/`                | shadcn/ui base components                        |

**Route File Structure:**

```tsx
export const Route = createFileRoute('/_authed/client/projects/new')({
  validateSearch: (search) => ({ ... }),
  beforeLoad: ({ context }) => { /* auth guard */ },
  pendingComponent: FeatureLoading,    // From modules/
  errorComponent: FeatureError,        // From modules/
  component: FeatureRoute,             // Thin wrapper
})

function FeatureRoute() {
  // THIN - just passes props to module component
  return <FeatureComponent {...props} />
}
```

**Module Structure:**

```
components/modules/{feature}/
├── {sub-feature}/
│   ├── {component}.tsx           # Main container
│   ├── {component}-loading.tsx   # Loading state
│   ├── {component}-error.tsx     # Error state
│   └── index.ts                  # Exports
└── index.ts                      # Module exports
```

**When to Create a Module:**

- ✅ Feature has 3+ related components
- ✅ Feature has container + presentational components
- ✅ Feature will grow (multiple steps, states, views)

**When to Use Shared:**

- ✅ Component is reusable across 2+ features
- ✅ Component is purely presentational
