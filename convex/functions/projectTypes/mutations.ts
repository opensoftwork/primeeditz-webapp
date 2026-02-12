import { v } from "convex/values";
import { adminMutation } from "../../lib/customFunctions";
import { folderLevel1Validator } from "../../schema";

/**
 * Create a new project type.
 */
export const createProjectType = adminMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    categoryId: v.id("projectCategories"),
    isActive: v.boolean(),
    displayOrder: v.optional(v.number()),
    defaultFolderTemplateId: v.optional(v.id("folderTemplates")),
  },
  handler: async (ctx, args) => {
    const projectTypeId = await ctx.db.insert("projectTypes", {
      ...args,
    });
    return projectTypeId;
  },
});

/**
 * Update an existing project type.
 */
export const updateProjectType = adminMutation({
  args: {
    id: v.id("projectTypes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    categoryId: v.optional(v.id("projectCategories")),
    isActive: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    defaultFolderTemplateId: v.optional(v.id("folderTemplates")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Toggle a project type's active status.
 */
export const toggleProjectTypeActive = adminMutation({
  args: {
    id: v.id("projectTypes"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
    return args.id;
  },
});

/**
 * Delete a project type permanently.
 */
export const deleteProjectType = adminMutation({
  args: {
    id: v.id("projectTypes"),
  },
  handler: async (ctx, args) => {
    // 1. Delete all associated folder templates
    const templates = await ctx.db
      .query("folderTemplates")
      .withIndex("by_projectTypeId", (q) => q.eq("projectTypeId", args.id))
      .collect();

    for (const template of templates) {
      await ctx.db.delete(template._id);
    }

    // 2. Also delete associated fields (legacy)
    const fields = await ctx.db
      .query("projectTypeFields")
      .withIndex("by_projectTypeId", (q) => q.eq("projectTypeId", args.id))
      .collect();

    for (const field of fields) {
      await ctx.db.delete(field._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Handle atomic creation of Project Type + Default Folder Template
 */
export const createWithTemplate = adminMutation({
  args: {
    projectType: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      categoryId: v.id("projectCategories"),
      icon: v.optional(v.string()),
      isActive: v.boolean(),
    }),
    folders: v.array(folderLevel1Validator), // Validated by schema on insert
    templateName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { projectType, folders, templateName } = args;

    // 1. Create the project type first
    const projectTypeId = await ctx.db.insert("projectTypes", {
      ...projectType,
      isDraft: false,
      updatedAt: Date.now(),
    });

    // 2. Create the default folder template
    const templateId = await ctx.db.insert("folderTemplates", {
      name: templateName || `${projectType.name} Default`,
      projectTypeId,
      folders,
      isActive: true,
    });

    // 3. Link the template to the project type
    await ctx.db.patch(projectTypeId, {
      defaultFolderTemplateId: templateId,
    });

    return { projectTypeId, templateId };
  },
});

/**
 * Handle update of Project Type + Folder Template link
 */
export const updateWithTemplate = adminMutation({
  args: {
    projectTypeId: v.id("projectTypes"),
    templateId: v.optional(v.id("folderTemplates")),
    projectType: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      categoryId: v.id("projectCategories"),
      icon: v.optional(v.string()),
      isActive: v.boolean(),
    }),
    folders: v.array(folderLevel1Validator),
    templateName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { projectTypeId, templateId, projectType, folders, templateName } = args;

    // 1. Update project type
    await ctx.db.patch(projectTypeId, {
      ...projectType,
      isDraft: false, // Ensure draft flag is cleared
      draftData: undefined, // Clear draft data
    });

    const resolvedTemplateName = templateName || `${projectType.name} Default`;

    if (templateId) {
      // 2a. Update existing template
      await ctx.db.patch(templateId, {
        name: resolvedTemplateName,
        folders,
      });
    } else {
      // 2b. Create new template if none exists
      const newTemplateId = await ctx.db.insert("folderTemplates", {
        name: resolvedTemplateName,
        projectTypeId,
        folders,
        isActive: true,
      });

      await ctx.db.patch(projectTypeId, {
        defaultFolderTemplateId: newTemplateId,
      });
    }

    return { projectTypeId };
  },
});

/**
 * Save progress as draft
 */
export const saveDraft = adminMutation({
  args: {
    id: v.optional(v.id("projectTypes")),
    step: v.number(),
    formData: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      categoryId: v.optional(v.id("projectCategories")),
      icon: v.optional(v.string()),
      isActive: v.boolean(),
    }),
    folders: v.array(folderLevel1Validator),
  },
  handler: async (ctx, args) => {
    const { id, step, formData, folders } = args;

    const draftData = { step, folders };

    // Set fallback name if missing
    const projectTypeData = {
      name: formData.name || "Untitled Draft",
      description: formData.description,
      categoryId: formData.categoryId as any,
      icon: formData.icon,
      isActive: formData.isActive,
      isDraft: true,
      draftData,
    };

    if (id) {
      await ctx.db.patch(id, projectTypeData);
      return id;
    } else {
      return await ctx.db.insert("projectTypes", projectTypeData as any);
    }
  },
});
