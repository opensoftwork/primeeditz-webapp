import { internalMutation, MutationCtx, mutation } from "../_generated/server";
import { adminMutation } from "../lib/customFunctions";

/**
 * Shared logic for client -> studio role migration
 */
async function performRoleMigration(ctx: MutationCtx) {
  const profiles = await ctx.db
    .query("profiles")
    .withIndex("by_role", (q: any) => q.eq("role", "client" as any))
    .collect();

  let count = 0;
  for (const profile of profiles) {
    await ctx.db.patch(profile._id, {
      role: "studio" as any,
      updatedAt: Date.now(),
    });
    count++;
  }

  console.log(`Migrated ${count} users from client to studio`);
  return { migrated: count };
}

export const migrateClientToStudio = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await performRoleMigration(ctx);
  },
});

/**
 * Admin Action: Migrate Client to Studio
 */
export const migrateClientToStudioAdmin = adminMutation({
  args: {},
  handler: async (ctx) => {
    return await performRoleMigration(ctx);
  },
});

/**
 * Shared logic for clearing operational data
 */
async function performSystemReset(ctx: MutationCtx) {
  const tables = [
    "projects",
    "quotations",
    "statusHistory",
    "folders",
    "assets",
    "deliverables",
  ] as const;

  const results: Record<string, number> = {};

  for (const table of tables) {
    const records = await ctx.db.query(table).collect();
    let count = 0;
    for (const record of records) {
      await ctx.db.delete(record._id);
      count++;
    }
    results[table] = count;
  }

  console.log("System Reset Complete:", results);
  return results;
}

export const clearOperationalData = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await performSystemReset(ctx);
  },
});

/**
 * Admin Action: Reset Operational Data
 */
export const resetSystem = adminMutation({
  args: {},
  handler: async (ctx) => {
    return await performSystemReset(ctx);
  },
});

