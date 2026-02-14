---
id: 20-1
title: Backend — Convex Mutations, Queries & HTTP Endpoints
epic: 20-public-form-submissions
status: in-progress
priority: critical
points: 5
assignee: null
dependencies: []
created: 2026-02-14
updated: 2026-02-14
---

# Story 20-1: Backend — Convex Mutations, Queries & HTTP Endpoints

**Epic**: Epic 20 - Public Form Submissions (Contacts, Feedbacks & Surveys)
**Status**: in-progress
**Complexity**: Medium (5 points)
**Created**: 2026-02-14
**Priority**: CRITICAL — Foundation for external form integration and admin views

---

## 📋 User Story

**As an** external website developer,
**I want** HTTP POST endpoints that accept contact, feedback, and survey submissions,
**So that** public forms on the external website can store data directly in the PrimeEditz backend without authentication.

**As an** admin user,
**I want** queries to list and read submissions, and mutations to delete them,
**So that** I can view and manage all form submissions from the admin dashboard.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On        | Status  | Notes                                                                            |
| ----------------- | ------- | -------------------------------------------------------------------------------- |
| **Schema tables** | ✅ Done | `contacts`, `feedbacks`, `surveys` already in `convex/schema.ts` (lines 776–827) |

### Enables

| Story / Epic              | Notes                                                     |
| ------------------------- | --------------------------------------------------------- |
| **20-2: Admin Dashboard** | Admin UI needs these queries/mutations to function        |
| **External Project**      | TanStack Query integration guide enables external website |

---

## ✅ Acceptance Criteria

### AC-1: Public Create Mutations (No Auth)

- [ ] **Given** the `contacts`, `feedbacks`, and `surveys` tables exist in the schema
- [ ] **When** a public mutation (e.g., `createContact`) is called with valid args
- [ ] **Then** a new record is inserted into the respective table
- [ ] **And** the Convex-generated `_id` is returned
- [ ] **And** no authentication is required (use raw `mutation` from `convex/_generated/server`)

### AC-2: Admin List Queries

- [ ] **Given** an admin user calls `listContacts`, `listFeedbacks`, or `listSurveys`
- [ ] **When** the query executes
- [ ] **Then** all records are returned sorted by `_creationTime` descending
- [ ] **And** the query uses `adminQuery` wrapper for role protection

### AC-3: Admin Get-By-ID Queries

- [ ] **Given** an admin user calls `getContactById`, `getFeedbackById`, or `getSurveyById` with a valid ID
- [ ] **When** the query executes
- [ ] **Then** the full record is returned
- [ ] **And** if the ID is invalid, `null` is returned

### AC-4: Admin Delete Mutations

- [ ] **Given** an admin user calls `deleteContact`, `deleteFeedback`, or `deleteSurvey` with a valid ID
- [ ] **When** the mutation executes
- [ ] **Then** the record is permanently deleted from the table
- [ ] **And** the mutation uses `adminMutation` wrapper for role protection

### AC-5: HTTP POST Endpoints

- [ ] **Given** an external website sends a POST request to `/contacts` on the Convex site URL
- [ ] **When** the request body is valid JSON with all required fields `{ name, email, phoneno, service, message }`
- [ ] **Then** a new `contacts` record is created
- [ ] **And** the response is `{ success: true, id: "<convex_id>" }` with status 200
- [ ] **And** `Content-Type: application/json` is set on the response

- [ ] **Given** an external website sends a POST to `/feedbacks` with `{ name, email, rating, feedback }`
- [ ] **Then** a new `feedbacks` record is created with status 200

- [ ] **Given** an external website sends a POST to `/surveys` with all required + optional fields
- [ ] **Then** a new `surveys` record is created with status 200

### AC-6: HTTP Error Handling

- [ ] **Given** a POST request with missing required fields or invalid JSON
- [ ] **When** the HTTP handler processes the request
- [ ] **Then** the response is `{ success: false, error: "<message>" }` with status 400

### AC-7: CORS Support

- [ ] **Given** an external website sends an OPTIONS preflight request to any endpoint
- [ ] **When** the HTTP handler processes it
- [ ] **Then** the response has status 204 with headers:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
- [ ] **And** all POST responses also include these CORS headers

---

## 📘 Implementation

### Phase A: Convex Functions — Contacts (~1.5 points)

#### Task A1: Contact Mutations

**File**: `convex/functions/contacts/mutations.ts`

Create public create mutation and admin delete mutation for contacts:

```typescript
// convex/functions/contacts/mutations.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Public mutation — no auth required.
 * Used by external websites via HTTP POST.
 */
export const createContact = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phoneno: v.string(),
    service: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contacts", {
      name: args.name,
      email: args.email,
      phoneno: args.phoneno,
      service: args.service,
      message: args.message,
    });
    return id;
  },
});

/**
 * Admin-only delete mutation.
 */
export const deleteContact = adminMutation({
  args: {
    id: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

- [ ] A1.1 Create `createContact` public mutation with all schema fields as args
- [ ] A1.2 Create `deleteContact` admin mutation with `v.id("contacts")` arg
- [ ] A1.3 Validate file stays under 150 lines

#### Task A2: Contact Queries

**File**: `convex/functions/contacts/queries.ts`

```typescript
// convex/functions/contacts/queries.ts
import { v } from "convex/values";
import { adminQuery } from "../../lib/customFunctions";

/**
 * List all contacts, sorted by creation time (newest first).
 */
export const listContacts = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contacts").order("desc").collect();
  },
});

/**
 * Get a single contact by ID.
 */
export const getContactById = adminQuery({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

- [ ] A2.1 Create `listContacts` query with `adminQuery` wrapper, `.order("desc")`
- [ ] A2.2 Create `getContactById` query with `adminQuery` wrapper

#### Task A3: Contact Index

**File**: `convex/functions/contacts/index.ts`

```typescript
export * from "./mutations";
export * from "./queries";
```

- [ ] A3.1 Create barrel export file

---

### Phase B: Convex Functions — Feedbacks (~1 point)

#### Task B1: Feedback Mutations

**File**: `convex/functions/feedbacks/mutations.ts`

Same pattern as contacts. Args match schema: `name`, `email`, `rating` (number), `feedback` (string).

```typescript
// convex/functions/feedbacks/mutations.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { adminMutation } from "../../lib/customFunctions";

export const createFeedback = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    rating: v.number(),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("feedbacks", {
      name: args.name,
      email: args.email,
      rating: args.rating,
      feedback: args.feedback,
    });
    return id;
  },
});

export const deleteFeedback = adminMutation({
  args: {
    id: v.id("feedbacks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

- [ ] B1.1 Create `createFeedback` public mutation
- [ ] B1.2 Create `deleteFeedback` admin mutation

#### Task B2: Feedback Queries

**File**: `convex/functions/feedbacks/queries.ts`

```typescript
// convex/functions/feedbacks/queries.ts
import { v } from "convex/values";
import { adminQuery } from "../../lib/customFunctions";

export const listFeedbacks = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("feedbacks").order("desc").collect();
  },
});

export const getFeedbackById = adminQuery({
  args: { id: v.id("feedbacks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

- [ ] B2.1 Create `listFeedbacks` and `getFeedbackById` queries

#### Task B3: Feedback Index

**File**: `convex/functions/feedbacks/index.ts`

- [ ] B3.1 Create barrel export file

---

### Phase C: Convex Functions — Surveys (~1 point)

#### Task C1: Survey Mutations

**File**: `convex/functions/surveys/mutations.ts`

Survey has many optional fields. Args must match schema exactly (lines 798–825 of `convex/schema.ts`).

```typescript
// convex/functions/surveys/mutations.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { adminMutation } from "../../lib/customFunctions";

export const createSurvey = mutation({
  args: {
    // Required contact details
    name: v.string(),
    email: v.string(),
    // Optional contact details
    phone: v.optional(v.string()),
    channelName: v.optional(v.string()),
    instagramHandle: v.optional(v.string()),
    bestTimeToContact: v.optional(v.string()),
    preferredContactMethod: v.optional(v.string()),
    mayContact: v.optional(v.string()),
    // Section A
    q1_role: v.optional(v.string()),
    q1_roleOther: v.optional(v.string()),
    q2_frequency: v.optional(v.string()),
    q3_contentTypes: v.optional(v.array(v.string())),
    q3_contentTypesOther: v.optional(v.string()),
    q4_monthlyVolume: v.optional(v.string()),
    // Section B
    q5_currentEditing: v.optional(v.string()),
    q6_frustrations: v.optional(v.any()),
    q7_editingChallenges: v.optional(v.array(v.string())),
    q7_editingChallengesOther: v.optional(v.string()),
    q8_turnaroundTime: v.optional(v.string()),
    q9_turnaroundSatisfaction: v.optional(v.string()),
    q10_revisionRounds: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("surveys", args);
    return id;
  },
});

export const deleteSurvey = adminMutation({
  args: {
    id: v.id("surveys"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

- [ ] C1.1 Create `createSurvey` public mutation matching full schema
- [ ] C1.2 Create `deleteSurvey` admin mutation

#### Task C2: Survey Queries

**File**: `convex/functions/surveys/queries.ts`

- [ ] C2.1 Create `listSurveys` and `getSurveyById` queries (same pattern as contacts/feedbacks)

#### Task C3: Survey Index

**File**: `convex/functions/surveys/index.ts`

- [ ] C3.1 Create barrel export file

---

### Phase D: HTTP Endpoints (~1.5 points)

#### Task D1: Add HTTP Routes

**File**: `convex/http.ts`

Update the existing `convex/http.ts` to add POST and OPTIONS handlers for each endpoint. Use `httpAction` from `convex/_generated/server`.

**IMPORTANT**: The `httpAction` handler receives `(ctx, request)` where:

- `ctx` has `runMutation()`, `runQuery()`, `runAction()` methods
- `request` is a standard `Request` object
- The handler must return a `Response` object

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { api } from "./_generated/api";

const http = httpRouter();

// ─── Auth Routes ─────────────────────────────────────────
authComponent.registerRoutes(http, createAuth);

// ─── CORS Helper ─────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ─── Contacts ────────────────────────────────────────────
http.route({
  path: "/contacts",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const id = await ctx.runMutation(
        api.functions.contacts.mutations.createContact,
        body,
      );
      return new Response(JSON.stringify({ success: true, id }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }
  }),
});

http.route({
  path: "/contacts",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

// Similar routes for /feedbacks and /surveys...

export default http;
```

- [ ] D1.1 Import `httpAction` from `convex/_generated/server` and `api` from `convex/_generated/api`
- [ ] D1.2 Define `corsHeaders` object
- [ ] D1.3 Add POST route for `/contacts` with try/catch, calling `api.functions.contacts.mutations.createContact`
- [ ] D1.4 Add OPTIONS route for `/contacts`
- [ ] D1.5 Add POST route for `/feedbacks` calling `api.functions.feedbacks.mutations.createFeedback`
- [ ] D1.6 Add OPTIONS route for `/feedbacks`
- [ ] D1.7 Add POST route for `/surveys` calling `api.functions.surveys.mutations.createSurvey`
- [ ] D1.8 Add OPTIONS route for `/surveys`
- [ ] D1.9 Keep auth routes intact (do NOT remove `authComponent.registerRoutes(http, createAuth)`)
- [ ] D1.10 Verify file compiles without errors

**CRITICAL NOTES FOR HTTP ROUTES:**

- The api path depends on the actual file structure. If functions are at `convex/functions/contacts/mutations.ts`, the API path is `api.functions.contacts.mutations.createContact`.
- If the mutation is exported as `createContact`, call it via `api.functions.contacts.mutations.createContact`.
- Always use `try/catch` so invalid JSON or missing fields return 400 instead of 500.

---

## 🧪 Testing Checklist

### Mutations

- [ ] `createContact` inserts record with all required fields
- [ ] `createContact` rejects missing required fields (Convex validator error)
- [ ] `createFeedback` inserts record with rating as number
- [ ] `createSurvey` inserts record with all optional fields as `undefined`
- [ ] `deleteContact` removes record from table (admin only)
- [ ] `deleteFeedback` removes record from table (admin only)
- [ ] `deleteSurvey` removes record from table (admin only)

### Queries

- [ ] `listContacts` returns records sorted by `_creationTime` desc
- [ ] `listFeedbacks` returns records sorted by `_creationTime` desc
- [ ] `listSurveys` returns records sorted by `_creationTime` desc
- [ ] `getContactById` returns record for valid ID, `null` for invalid
- [ ] All queries require admin role (unauthenticated call throws error)

### HTTP Endpoints

- [ ] POST `/contacts` with valid body → 200 + `{ success: true, id }`
- [ ] POST `/contacts` with missing field → 400 + `{ success: false, error }`
- [ ] POST `/feedbacks` with valid body → 200
- [ ] POST `/surveys` with valid body → 200
- [ ] OPTIONS on each endpoint → 204 with CORS headers
- [ ] POST responses include CORS headers

---

## 🚀 Definition of Done

- [ ] `convex/functions/contacts/` — mutations.ts, queries.ts, index.ts created
- [ ] `convex/functions/feedbacks/` — mutations.ts, queries.ts, index.ts created
- [ ] `convex/functions/surveys/` — mutations.ts, queries.ts, index.ts created
- [ ] `convex/http.ts` — POST + OPTIONS routes for all 3 endpoints
- [ ] All files compile without TypeScript errors
- [ ] All files under 150 lines
- [ ] CORS headers present on all HTTP responses
- [ ] Auth routes unchanged and functional

---

## Estimated Effort

- Contacts functions: 30 min
- Feedbacks functions: 20 min
- Surveys functions: 30 min
- HTTP endpoints: 1 hour
- Testing & validation: 30 min
- **Total: ~2.5 hours**

---

## 📂 File Summary

| File                                      | Action | Lines (Est.) |
| ----------------------------------------- | ------ | ------------ |
| `convex/functions/contacts/mutations.ts`  | Create | ~40          |
| `convex/functions/contacts/queries.ts`    | Create | ~30          |
| `convex/functions/contacts/index.ts`      | Create | ~3           |
| `convex/functions/feedbacks/mutations.ts` | Create | ~35          |
| `convex/functions/feedbacks/queries.ts`   | Create | ~30          |
| `convex/functions/feedbacks/index.ts`     | Create | ~3           |
| `convex/functions/surveys/mutations.ts`   | Create | ~55          |
| `convex/functions/surveys/queries.ts`     | Create | ~30          |
| `convex/functions/surveys/index.ts`       | Create | ~3           |
| `convex/http.ts`                          | Modify | ~80 (was 9)  |

---

## 🔄 Status Updates

| Date       | Status      | Notes                  |
| ---------- | ----------- | ---------------------- |
| 2026-02-14 | backlog     | Story created          |
| 2026-02-14 | in-progress | Started implementation |

---

**Previous Story**: N/A (first story in Epic 20)
**Next Story**: 20-2 - Frontend Admin Dashboard List & Detail Views
