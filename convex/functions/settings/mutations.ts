import { v } from "convex/values";
import { adminMutation } from "../../lib/customFunctions";

export const updateQuotationSettings = adminMutation({
  args: {
    defaultTaxRate: v.number(),
    defaultValidityDays: v.number(),
    defaultTerms: v.optional(v.string()),
    codePrefix: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("appSettings").first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quotation: {
          ...existing.quotation,
          ...args,
        },
        updatedAt: now,
        updatedBy: ctx.profile._id,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("appSettings", {
        quotation: {
          ...args,
          nextQuotationNumber: 1,
        },
        notifications: {
          adminEmails: [ctx.profile.email],
          enableEmailNotifications: true,
        },
        updatedAt: now,
        updatedBy: ctx.profile._id,
      });
    }
  },
});

export const updateNotificationSettings = adminMutation({
  args: {
    adminEmails: v.array(v.string()),
    enableEmailNotifications: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("appSettings").first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        notifications: args,
        updatedAt: now,
        updatedBy: ctx.profile._id,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("appSettings", {
        quotation: {
          defaultTaxRate: 18,
          defaultValidityDays: 30,
          nextQuotationNumber: 1,
        },
        notifications: args,
        updatedAt: now,
        updatedBy: ctx.profile._id,
      });
    }
  },
});
