# Convex Best Practices & Patterns Reference

> **Last Updated:** 2025-12-29

## The Zen of Convex

### Core Philosophy

1. **Double down on the sync engine** - Center your apps around Convex's reactive, deterministic database
2. **Queries for everything** - Every read operation should happen via a query function
3. **Mutations for writes** - Use mutations for all data changes
4. **Actions sparingly** - Only for external API calls and batch jobs
5. **Don't over-complicate client state** - Let Convex handle caching and consistency

### When to Use Each Function Type

| Type       | Use For                           | Guarantees                        |
| ---------- | --------------------------------- | --------------------------------- |
| `query`    | All reads, reactive subscriptions | Cached, deterministic, consistent |
| `mutation` | All writes, data changes          | Transactional, consistent         |
| `action`   | External APIs, batch jobs         | Slower, fewer guarantees          |

---

## Best Practices Checklist

### ✅ DO

1. **Await all Promises** - Every Promise must be awaited
2. **Use indexes** - Use `.withIndex()` instead of `.filter()` for large datasets
3. **Limit `.collect()`** - Only collect small result sets (< 100 items)
4. **Use argument validators** - All public functions must validate args
5. **Implement access control** - Check `ctx.auth.getUserIdentity()` in all functions
6. **Use helper functions** - Business logic in `convex/model/`, thin wrappers in API
7. **Use internal functions** - Only schedule/run internal functions from other functions

### ❌ DON'T

1. **Don't use `.filter()` on large datasets** - Use indexes instead
2. **Don't call actions from browser** - Trigger via mutations
3. **Don't over-use `ctx.runQuery/runMutation`** - Use helper functions instead
4. **Don't use spoofable args for access control** - Never trust email/name from args
5. **Don't store secrets in code** - Use environment variables

---

## Access Control Patterns

### ❌ Bad: No Access Control

```typescript
// Anyone can update any team!
export const updateTeam = mutation({
  args: { id: v.id("teams"), name: v.string() },
  handler: async (ctx, { id, name }) => {
    await ctx.db.patch(id, { name });
  },
});
```

### ❌ Bad: Spoofable Args

```typescript
// Email can be spoofed!
export const updateTeam = mutation({
  args: { id: v.id("teams"), name: v.string(), email: v.string() },
  handler: async (ctx, { id, name, email }) => {
    // Don't trust email from args!
    if (email !== "admin@example.com") throw new Error("Unauthorized");
    await ctx.db.patch(id, { name });
  },
});
```

### ✅ Good: Auth-Based Access Control

```typescript
export const updateTeam = mutation({
  args: { id: v.id("teams"), name: v.string() },
  handler: async (ctx, { id, name }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    const team = await ctx.db.get(id);
    const isTeamMember = team?.members.includes(user.tokenIdentifier);
    if (!isTeamMember) throw new Error("Unauthorized");

    await ctx.db.patch(id, { name });
  },
});
```

### ✅ Best: Separate Functions by Permission

```typescript
// Only owners can change ownership
export const setTeamOwner = mutation({
  args: { id: v.id("teams"), owner: v.id("users") },
  handler: async (ctx, { id, owner }) => {
    const user = await getAuthenticatedUser(ctx);
    const isOwner = await isTeamOwner(ctx, id, user._id);
    if (!isOwner) throw new Error("Unauthorized");

    await ctx.db.patch(id, { owner });
  },
});

// Any member can change name
export const setTeamName = mutation({
  args: { id: v.id("teams"), name: v.string() },
  handler: async (ctx, { id, name }) => {
    const user = await getAuthenticatedUser(ctx);
    const isMember = await isTeamMember(ctx, id, user._id);
    if (!isMember) throw new Error("Unauthorized");

    await ctx.db.patch(id, { name });
  },
});
```

---

## Helper Functions Pattern

### ❌ Bad: All Logic in Functions

```typescript
export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const user = await ctx.runQuery(api.users.getCurrentUser); // Avoid this!
    const conversation = await ctx.db.get(conversationId);

    if (!conversation?.members.includes(user._id)) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId)
      )
      .collect();
  },
});
```

### ✅ Good: Logic in Model, Thin API

```typescript
// convex/model/users.ts
import { QueryCtx } from "../_generated/server";

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
}

// convex/model/conversations.ts
import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getMessagesForUser(
  ctx: QueryCtx,
  conversationId: Id<"conversations">,
  userId: Id<"users">
) {
  const conversation = await ctx.db.get(conversationId);
  if (!conversation?.members.includes(userId)) {
    throw new Error("Unauthorized");
  }

  return await ctx.db
    .query("messages")
    .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
    .collect();
}
```

```typescript
// convex/conversations.ts (thin API wrapper)
import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./model/users";
import { getMessagesForUser } from "./model/conversations";

export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const user = await getCurrentUser(ctx);
    return await getMessagesForUser(ctx, conversationId, user._id);
  },
});
```

---

## Custom Functions with convex-helpers

### Creating Auth Wrappers

```typescript
// convex/lib/customFunctions.ts
import {
  customQuery,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";

// Authenticated query wrapper
export const authenticatedQuery = customQuery(query, {
  args: {},
  input: async (ctx: QueryCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    return { ctx: { ...ctx, user }, args: {} };
  },
});

// Admin-only query wrapper
export const adminQuery = customQuery(query, {
  args: {},
  input: async (ctx: QueryCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || user.role !== "admin")
      throw new Error("Admin access required");

    return { ctx: { ...ctx, user }, args: {} };
  },
});
```

### Using Custom Functions

```typescript
// convex/functions/events/queries.ts
import { authenticatedQuery, adminQuery } from "../../lib/customFunctions";
import { v } from "convex/values";

// Client query - any authenticated user
export const listMy = authenticatedQuery({
  args: {},
  handler: async (ctx, args) => {
    // ctx.user is guaranteed to exist
    return await ctx.db
      .query("events")
      .withIndex("by_client", (q) => q.eq("clientId", ctx.user.clientProfileId))
      .collect();
  },
});

// Admin query - only admins
export const listAll = adminQuery({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query("events").collect();
  },
});
```

---

## Row-Level Security

```typescript
import {
  wrapDatabaseReader,
  wrapDatabaseWriter,
} from "convex-helpers/server/rowLevelSecurity";

async function rlsRules(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();

  return {
    users: {
      read: async (_, user) => {
        // Unauthenticated users can only read users over 18
        if (!identity && user.age < 18) return false;
        return true;
      },
      modify: async (_, user) => {
        if (!identity) throw new Error("Must be authenticated");
        return user.tokenIdentifier === identity.tokenIdentifier;
      },
    },
  };
}

const queryWithRLS = customQuery(
  query,
  customCtx(async (ctx) => ({
    db: wrapDatabaseReader(ctx, ctx.db, await rlsRules(ctx)),
  }))
);
```

---

## Index Best Practices

### Define Indexes in Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    clientId: v.id("users"),
    status: v.string(),
    createdAt: v.number(),
    eventCode: v.string(),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_code", ["eventCode"])
    .index("by_client_status", ["clientId", "status"]),
});
```

### Use Indexes in Queries

```typescript
// ✅ Good: Using index
const events = await ctx.db
  .query("events")
  .withIndex("by_client", (q) => q.eq("clientId", userId))
  .collect();

// ❌ Bad: Using filter on large dataset
const events = await ctx.db
  .query("events")
  .filter((q) => q.eq(q.field("clientId"), userId))
  .collect();
```

---

## Action Patterns

### ✅ Trigger Actions from Mutations

```typescript
// convex/events/mutations.ts
export const create = mutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      ...args,
      status: "pending",
    });

    // Schedule action for external API call
    await ctx.scheduler.runAfter(0, internal.events.sendNotification, {
      eventId,
    });

    return eventId;
  },
});

// convex/events/internal.ts
export const sendNotification = internalAction({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.runQuery(internal.events.get, { eventId });

    // Call external API
    await sendEmail(event.clientEmail, "Event created!");

    // Update status via mutation
    await ctx.runMutation(internal.events.updateStatus, {
      eventId,
      status: "notified",
    });
  },
});
```

---

## Performance Guidelines

| Metric            | Target          | Action if Exceeded           |
| ----------------- | --------------- | ---------------------------- |
| Records per query | < 100           | Use pagination               |
| Query duration    | < 100ms         | Add indexes, reduce scope    |
| Mutation duration | < 100ms         | Split into smaller mutations |
| Action duration   | < 10s (default) | Use chunked processing       |

---

## References

- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)
- [Convex TypeScript Guide](https://docs.convex.dev/understanding/best-practices/typescript)
- [The Zen of Convex](https://docs.convex.dev/understanding/zen)
- [convex-helpers](https://github.com/get-convex/convex-helpers)
