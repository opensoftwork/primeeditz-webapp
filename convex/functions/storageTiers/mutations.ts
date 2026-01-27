import { v } from "convex/values";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Create a new storage tier.
 */
export const createStorageTier = adminMutation({
  args: {
    name: v.string(),
    sizeGB: v.number(),
    priceINR: v.number(),
    isActive: v.boolean(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate inputs
    if (args.sizeGB <= 0) {
      throw new Error("Storage capacity must be greater than 0");
    }
    if (args.priceINR < 0) {
      throw new Error("Price cannot be negative");
    }

    const tierId = await ctx.db.insert("storageTiers", {
      name: args.name,
      sizeGB: args.sizeGB,
      priceINR: args.priceINR,
      isActive: args.isActive,
      isDefault: args.isDefault,
    });

    return tierId;
  },
});

/**
 * Update an existing storage tier.
 */
export const updateStorageTier = adminMutation({
  args: {
    id: v.id("storageTiers"),
    name: v.optional(v.string()),
    sizeGB: v.optional(v.number()),
    priceINR: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Validate if sizeGB is being updated
    if (updates.sizeGB !== undefined && updates.sizeGB <= 0) {
      throw new Error("Storage capacity must be greater than 0");
    }
    if (updates.priceINR !== undefined && updates.priceINR < 0) {
      throw new Error("Price cannot be negative");
    }

    // If changing capacity, check if tier is in use
    if (updates.sizeGB !== undefined) {
      const tier = await ctx.db.get(id);
      if (tier) {
        const sizeInBytes = tier.sizeGB * 1024 * 1024 * 1024;
        const projects = await ctx.db.query("projects").collect();
        const inUse = projects.some((p) => p.storageAllocated === sizeInBytes);

        if (inUse) {
          throw new Error(
            "Cannot change capacity of a tier that is in use by projects",
          );
        }
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Toggle a storage tier's active status.
 */
export const toggleStorageTierActive = adminMutation({
  args: {
    id: v.id("storageTiers"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
    return args.id;
  },
});

/**
 * Delete a storage tier permanently.
 * Only allowed if tier is not in use by any projects.
 */
export const deleteStorageTier = adminMutation({
  args: {
    id: v.id("storageTiers"),
  },
  handler: async (ctx, args) => {
    const tier = await ctx.db.get(args.id);
    if (!tier) {
      throw new Error("Storage tier not found");
    }

    // Check if tier is in use
    const sizeInBytes = tier.sizeGB * 1024 * 1024 * 1024;
    const projects = await ctx.db.query("projects").collect();
    const inUse = projects.some((p) => p.storageAllocated === sizeInBytes);

    if (inUse) {
      throw new Error("Cannot delete a tier that is in use by projects");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
