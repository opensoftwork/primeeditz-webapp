import { query } from "../../_generated/server";

/**
 * Get the company profile.
 * Since there's only one company record, we return the first record.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("company").first();
  },
});
