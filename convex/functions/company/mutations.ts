import { v } from "convex/values";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Update the company profile.
 * If no profile exists, it creates one.
 */
export const update = adminMutation({
  args: {
    name: v.optional(v.string()),
    tagline: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    gstNumber: v.optional(v.string()),
    panNumber: v.optional(v.string()),
    bankDetails: v.optional(
      v.object({
        bankName: v.string(),
        accountHolder: v.string(),
        accountNumber: v.string(),
        ifscCode: v.string(),
        branch: v.optional(v.string()),
      }),
    ),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("company").first();
    const now = Date.now();

    const updateData = {
      ...args,
      updatedAt: now,
      updatedBy: ctx.profile._id,
    };

    if (existing) {
      // Filter out undefined values to satisfy patch
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined),
      );
      await ctx.db.patch(existing._id, cleanUpdateData);
      return existing._id;
    } else {
      // For first time insert, ensure required fields have at least default values
      const insertData = {
        name: args.name ?? "New Studio",
        address: args.address ?? "Set your address",
        tagline: args.tagline,
        phone: args.phone,
        email: args.email,
        website: args.website,
        gstNumber: args.gstNumber,
        panNumber: args.panNumber,
        bankDetails: args.bankDetails,
        logoUrl: args.logoUrl,
        updatedAt: now,
        updatedBy: ctx.profile._id,
      };

      return await ctx.db.insert("company", insertData);
    }
  },
});
