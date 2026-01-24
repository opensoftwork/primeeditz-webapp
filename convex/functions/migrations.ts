import { internalMutation } from "../_generated/server";

/**
 * Migration: client -> studio role
 * Updates all profile records with role 'client' to 'studio'.
 */
export const migrateClientToStudio = internalMutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "client" as any))
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
  },
});
