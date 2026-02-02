import { adminMutation } from "../../../lib/customFunctions";
import { v } from "convex/values";
import { servicePackageLineItemValidator } from "../../../schema";

/**
 * Create a new service package draft.
 */
export const createDraft = adminMutation({
  args: {},
  handler: async (ctx) => {
    // Check for existing draft created by this admin
    const existing = await ctx.db
      .query("servicePackageDrafts")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", ctx.profile._id))
      .first();

    if (existing) {
      return { draftId: existing._id, isNew: false };
    }

    const draftId = await ctx.db.insert("servicePackageDrafts", {
      lastStep: 1,
      createdBy: ctx.profile._id,
      updatedAt: Date.now(),
    });

    return { draftId, isNew: true };
  },
});

/**
 * Update a service package draft.
 */
export const updateDraft = adminMutation({
  args: {
    draftId: v.id("servicePackageDrafts"),
    lastStep: v.optional(v.number()),
    // Step 1
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    // Step 2
    projectConfigs: v.optional(v.array(v.object({
      id: v.string(),
      label: v.optional(v.string()),
      categoryId: v.optional(v.id("projectCategories")),
      projectTypeId: v.id("projectTypes"),
      folderTemplateId: v.id("folderTemplates"),
      defaultStorageTierId: v.optional(v.id("storageTiers")),
    }))),
    // Step 3
    lineItems: v.optional(v.array(servicePackageLineItemValidator)),
    terms: v.optional(v.string()),
    applyGST: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { draftId, ...updates } = args;
    await ctx.db.patch(draftId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a service package draft.
 */
export const deleteDraft = adminMutation({
  args: {
    draftId: v.id("servicePackageDrafts"),
  },
  handler: async (ctx, { draftId }) => {
    await ctx.db.delete(draftId);
  },
});

/**
 * Publish a draft to create a real service package.
 */
export const publishDraft = adminMutation({
  args: {
    draftId: v.id("servicePackageDrafts"),
  },
  handler: async (ctx, { draftId }) => {
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error("Draft not found");

    // Validate minimum requirements for publishing
    if (!draft.name) throw new Error("Package name is required to publish");
    if (!draft.projectConfigs || draft.projectConfigs.length === 0) {
      throw new Error("At least one project configuration is required to publish");
    }
    if (!draft.lineItems || draft.lineItems.length === 0) {
      throw new Error("At least one line item is required to publish");
    }

    // Extract top-level fields from the first config for backward compatibility and filtering
    const firstConfig = draft.projectConfigs[0];
    const categoryId = firstConfig.categoryId || draft.categoryId;
    const projectTypeId = firstConfig.projectTypeId;
    const folderTemplateId = firstConfig.folderTemplateId;
    const defaultStorageTierId = firstConfig.defaultStorageTierId;

    // Create the real package
    const packageId = await ctx.db.insert("servicePackages", {
      name: draft.name,
      description: draft.description,
      categoryId,
      projectConfigs: draft.projectConfigs,
      // Legacy fields for backward compatibility
      projectTypeId,
      folderTemplateId,
      defaultStorageTierId,
      
      lineItems: draft.lineItems,
      terms: draft.terms,
      applyGST: draft.applyGST ?? true,
      isActive: true,
      createdBy: ctx.profile._id,
      updatedAt: Date.now(),
    });

    // Clean up the draft
    await ctx.db.delete(draftId);

    return packageId;
  },
});
