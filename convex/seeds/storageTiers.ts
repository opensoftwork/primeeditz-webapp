import { MutationCtx } from "../_generated/server";

/**
 * SEED: Storage Tiers
 * 
 * Tiered storage pricing for project allocations.
 */

export async function seedStorageTiers(ctx: MutationCtx) {
  const tiers = [
    {
      name: "Starter",
      sizeGB: 50,
      priceINR: 500,
      description: "Small photo projects",
    },
    {
      name: "Standard",
      sizeGB: 100,
      priceINR: 900,
      description: "Standard weddings",
    },
    {
      name: "Professional",
      sizeGB: 250,
      priceINR: 2000,
      description: "Large events, multi-day shoots",
    },
    {
      name: "Enterprise",
      sizeGB: 500,
      priceINR: 3500,
      description: "Destination weddings",
    },
    {
      name: "Unlimited",
      sizeGB: 1000,
      priceINR: 6000,
      description: "Premium/Celebrity projects",
    },
  ];

  const existingTiers = await ctx.db.query("storageTiers").collect();
  let insertedCount = 0;
  let updatedCount = 0;

  for (const tier of tiers) {
    const existing = existingTiers.find(t => t.name === tier.name);

    if (existing) {
      await ctx.db.patch(existing._id, {
        sizeGB: tier.sizeGB,
        priceINR: tier.priceINR,
        isActive: true,
      });
      updatedCount++;
    } else {
      await ctx.db.insert("storageTiers", {
        name: tier.name,
        sizeGB: tier.sizeGB,
        priceINR: tier.priceINR,
        isActive: true,
      });
      insertedCount++;
    }
  }

  console.log(`Storage tiers: ${insertedCount} inserted, ${updatedCount} updated`);
}
