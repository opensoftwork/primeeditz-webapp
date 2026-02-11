import { v } from "convex/values";
import { query } from "../../_generated/server";
import { adminQuery } from "../../lib/customFunctions";

/**
 * Get all storage tiers (admin only).
 * Returns all tiers sorted by capacity ascending.
 */
export const listStorageTiers = adminQuery({
  args: {},
  handler: async (ctx) => {
    const tiers = await ctx.db.query("storageTiers").collect();

    // Sort by capacity (sizeGB) ascending
    return tiers.sort((a, b) => a.sizeGB - b.sizeGB);
  },
});

/**
 * Get active storage tiers only.
 * Used for quotation selection and public-facing dropdowns.
 */
export const listActiveStorageTiers = query({
  args: {},
  handler: async (ctx) => {
    const tiers = await ctx.db.query("storageTiers").collect();

    // Filter active and sort by capacity ascending
    return tiers
      .filter((tier) => tier.isActive)
      .sort((a, b) => a.sizeGB - b.sizeGB);
  },
});

/**
 * Get a single storage tier by ID.
 */
export const getStorageTier = adminQuery({
  args: {
    tierId: v.id("storageTiers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tierId);
  },
});

/**
 * Check if a storage tier is in use by any projects.
 * Returns the count of projects using this tier.
 */
export const getStorageTierUsage = adminQuery({
  args: {
    tierId: v.id("storageTiers"),
  },
  handler: async (ctx, args) => {
    const tier = await ctx.db.get(args.tierId);
    if (!tier) return { count: 0, tier: null };

    // Count projects that have storageAllocated matching this tier's sizeGB in bytes
    const sizeInBytes = tier.sizeGB * 1024 * 1024 * 1024;
    const projects = await ctx.db.query("projects").collect();

    const matchingProjects = projects.filter(
      (p) => p.storageAllocated === sizeInBytes,
    );

    return {
      count: matchingProjects.length,
      tier,
    };
  },
});
