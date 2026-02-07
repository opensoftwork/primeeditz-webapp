import { v } from "convex/values";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Update the company profile.
 * If no profile exists, it creates one.
 */
export const update = adminMutation({
  args: {
    name: v.string(),
    tagline: v.optional(v.string()),
    address: v.string(),
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
      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      return await ctx.db.insert("company", updateData);
    }
  },
});
