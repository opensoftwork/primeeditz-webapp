import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
} from "../../_generated/server";
import {
  adminMutation,
  authenticatedWithProfileMutation,
  type Profile,
  studioMutation,
} from "../../lib/customFunctions";
import { getActorForState, getPhaseForState } from "../../lib/statusMachine";
import type { ActionState } from "../../schema";
import { spawnProjectsFromQuotation } from "../projects/spawning";

/**
 * Line item input validator
 */
const lineItemInput = v.object({
  id: v.string(),
  sectionId: v.optional(v.id("quotationSections")),
  projectId: v.optional(v.string()),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  length: v.optional(v.string()),
  width: v.optional(v.string()),
  image: v.optional(v.string()),
  spawnsProject: v.optional(v.boolean()),
  projectTypeId: v.optional(v.id("projectTypes")),
  selectedFolderTemplateId: v.optional(v.id("folderTemplates")),
  sourcePackageId: v.optional(v.id("servicePackages")),
  subItems: v.optional(
    v.array(
      v.object({
        id: v.string(),
        description: v.string(),
        unit: v.string(),
        rate: v.number(),
        quantity: v.number(),
      }),
    ),
  ),
});

/**
 * Generate unique quotation code
 */
async function generateQuotationCode(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const quotations = await ctx.db.query("quotations").collect();
  const maxNumber = quotations.reduce((max: number, q: Doc<"quotations">) => {
    const match = q.code.match(/QT-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);

  const nextNumber = maxNumber + 1;
  return `QT-${nextNumber.toString().padStart(6, "0")}`;
}

/**
 * Calculate totals from line items
 */
function calculateTotals(
  lineItems: Array<{
    rate: number;
    quantity: number;
    subItems?: Array<{ rate: number; quantity: number }>;
  }>,
  taxRate: number,
  discountAmount?: number,
) {
  let subtotal = 0;

  for (const item of lineItems) {
    subtotal += item.rate * item.quantity;
    if (item.subItems) {
      for (const subItem of item.subItems) {
        subtotal += subItem.rate * subItem.quantity;
      }
    }
  }

  const discount = discountAmount || 0;
  const taxableAmount = subtotal - discount;
  const taxAmount = taxableAmount * taxRate;
  const total = taxableAmount + taxAmount;

  return { subtotal, taxAmount, total };
}

/**
 * Aggregates line items from multiple service packages.
 * Adds sourcePackageId and spawning config to each item.
 */
async function aggregateLineItemsFromPackages(
  ctx: MutationCtx,
  packageIds: Id<"servicePackages">[],
) {
  const allLineItems: any[] = [];

  for (const packageId of packageIds) {
    const pkg = await ctx.db.get(packageId);
    if (!pkg) {
      throw new Error(`Package not found: ${packageId}`);
    }

    // Add each line item with source tracking and spawning config
    for (const item of pkg.lineItems) {
      allLineItems.push({
        ...item,
        id: crypto.randomUUID(), // New ID for quotation line item
        sourcePackageId: packageId,
        spawnsProject: true, // Packages always spawn projects now
        projectTypeId: pkg.projectTypeId,
        selectedFolderTemplateId: pkg.folderTemplateId,
        subItems: item.subItems?.map((si) => ({
          id: crypto.randomUUID(),
          description: si.description,
          unit: "Unit",
          rate: si.amount ?? 0,
          quantity: 1,
        })),
      });
    }
  }

  return allLineItems;
}

/**
 * Helper to transition projects associated with a quotation
 */
async function transitionProjectsForQuotation(
  ctx: MutationCtx & { profile: Profile },
  args: {
    studioId?: Id<"profiles">;
    projectId?: Id<"projects">;
    projectIds?: Id<"projects">[];
    targetState: ActionState;
    notes: string;
    onlyFromDraft?: boolean;
  },
) {
  const targetProjectIds = [
    ...(args.projectId ? [args.projectId] : []),
    ...(args.projectIds || []),
  ];

  if (targetProjectIds.length === 0) return;

  // Optimized fetch: Query all projects for this client
  let projectsToUpdate: Doc<"projects">[] = [];

  if (args.studioId) {
    const allClientProjects = await ctx.db
      .query("projects")
      .withIndex("by_studioId", (q) =>
        q.eq("studioId", args.studioId as Id<"profiles">),
      )
      .collect();

    projectsToUpdate = allClientProjects.filter((p) =>
      targetProjectIds.includes(p._id),
    );
  } else {
    // Fallback if no studioId: fetch individually
    for (const pId of targetProjectIds) {
      const p = await ctx.db.get(pId);
      if (p) projectsToUpdate.push(p);
    }
  }

  const newPhase = getPhaseForState(args.targetState);
  const newActor = getActorForState(args.targetState);

  for (const project of projectsToUpdate) {
    if (args.onlyFromDraft && project.actionState !== "draft") continue;

    await ctx.db.patch(project._id, {
      phase: newPhase,
      actionState: args.targetState,
      awaitingActorRole: newActor,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("statusHistory", {
      projectId: project._id,
      previousPhase: project.phase,
      newPhase: newPhase,
      previousActionState: project.actionState,
      newActionState: args.targetState,
      previousAwaitingActorRole: project.awaitingActorRole,
      newAwaitingActorRole: newActor,
      changedBy: ctx.profile._id,
      changedAt: Date.now(),
      notes: args.notes,
    });
  }
}

/**
 * Request a quotation (Studio-side)
 */
export const requestQuotation = authenticatedWithProfileMutation({
  args: {
    selectedPackageIds: v.array(v.id("servicePackages")),
    endClientName: v.string(),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validation
    if (args.selectedPackageIds.length === 0) {
      throw new Error("At least one package must be selected");
    }

    const code = await generateQuotationCode(ctx);
    const taxRate = 0.18; // Default GST

    // Aggregate line items from all selected packages
    const lineItems = await aggregateLineItemsFromPackages(
      ctx,
      args.selectedPackageIds,
    );

    const { subtotal, taxAmount, total } = calculateTotals(
      lineItems,
      taxRate,
      0,
    );

    const quotationId = await ctx.db.insert("quotations", {
      code,
      version: 1,
      studioId: ctx.profile._id,
      selectedPackageIds: args.selectedPackageIds,
      status: "initiated",
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      endClientName: args.endClientName,
      eventName: args.eventName,
      eventDate: args.eventDate,
      studioNotes: args.notes,
      createdBy: "STUDIO",
      updatedAt: Date.now(),
    });

    return quotationId;
  },
});

/**
 * Create a new quotation
 */
export const createQuotation = adminMutation({
  args: {
    studioId: v.optional(v.id("profiles")),
    projectId: v.optional(v.id("projects")),
    projectIds: v.optional(v.array(v.id("projects"))),
    selectedPackageIds: v.array(v.id("servicePackages")),
    lineItems: v.array(lineItemInput),
    terms: v.optional(v.string()),
    validUntil: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    endClientName: v.string(),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Validation
    if (args.selectedPackageIds.length === 0 && (!args.lineItems || args.lineItems.length === 0)) {
      throw new Error("At least one package or one line item must be provided");
    }

    const code = await generateQuotationCode(ctx);
    const taxRate = args.taxRate ?? 0.18;

    // Aggregate line items from packages if provided
    let combinedLineItems = [...(args.lineItems || [])];
    if (args.selectedPackageIds.length > 0) {
      const packageLineItems = await aggregateLineItemsFromPackages(
        ctx,
        args.selectedPackageIds,
      );
      combinedLineItems = [...combinedLineItems, ...packageLineItems];
    }

    const { subtotal, taxAmount, total } = calculateTotals(
      combinedLineItems,
      taxRate,
      args.discountAmount,
    );

    const quotationId = await ctx.db.insert("quotations", {
      code,
      version: 1,
      studioId: args.studioId,
      projectId: args.projectId,
      projectIds: args.projectIds,
      selectedPackageIds: args.selectedPackageIds,
      status: "draft",
      lineItems: combinedLineItems,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount: args.discountAmount,
      total,
      terms: args.terms,
      validUntil: args.validUntil,
      endClientName: args.endClientName,
      eventName: args.eventName,
      eventDate: args.eventDate,
      createdBy: args.createdBy,
      updatedAt: Date.now(),
    });

    // Optimized transition using helper
    await transitionProjectsForQuotation(ctx, {
      studioId: args.studioId,
      projectId: args.projectId,
      projectIds: args.projectIds,
      targetState: "awaiting_quotation",
      notes:
        "System moved project to awaiting_quotation because a quotation was created",
      onlyFromDraft: true,
    });

    return quotationId;
  },
});

/**
 * Update quotation line items and recalculate totals
 */
export const updateQuotation = adminMutation({
  args: {
    quotationId: v.id("quotations"),
    lineItems: v.optional(v.array(lineItemInput)),
    terms: v.optional(v.string()),
    validUntil: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    endClientName: v.optional(v.string()),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    studioId: v.optional(v.id("profiles")),
    projectId: v.optional(v.id("projects")),
    projectIds: v.optional(v.array(v.id("projects"))),
    selectedPackageIds: v.optional(v.array(v.id("servicePackages"))),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }

    if (quotation.status !== "draft") {
      throw new Error("Can only edit draft quotations");
    }

    const { quotationId, ...updates } = args;

    if (updates.lineItems) {
      const taxRate = updates.taxRate ?? quotation.taxRate;
      const discountAmount = updates.discountAmount ?? quotation.discountAmount;
      const { subtotal, taxAmount, total } = calculateTotals(
        updates.lineItems,
        taxRate,
        discountAmount,
      );

      await ctx.db.patch(quotationId, {
        ...updates,
        lineItems: updates.lineItems,
        subtotal,
        taxAmount,
        total,
        updatedAt: Date.now(),
      });
    } else {
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined),
      );

      if (Object.keys(cleanUpdates).length > 0) {
        await ctx.db.patch(quotationId, {
          ...cleanUpdates,
          updatedAt: Date.now(),
        });
      }
    }

    return null;
  },
});

/**
 * Send quotation to client
 */
export const sendQuotation = adminMutation({
  args: {
    quotationId: v.id("quotations"),
    validityDays: v.optional(v.number()), // 7, 14, 30, 90
    sentTo: v.optional(v.string()), // Email address
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    // Status can be draft (first time) or sent/viewed (resending)
    const canSend = ["draft", "sent", "viewed", "changes_requested"].includes(
      quotation.status,
    );
    if (!canSend)
      throw new Error(`Cannot send quotation in ${quotation.status} status`);

    // Generate share token
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let shareToken = "";
    for (let i = 0; i < 16; i++) {
      shareToken += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    // Calculate expiry
    const validityDays = args.validityDays ?? 30;
    const shareTokenExpiresAt = Date.now() + validityDays * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.quotationId, {
      status: "sent",
      sentAt: Date.now(),
      sentTo: args.sentTo,
      shareToken,
      shareTokenExpiresAt,
      updatedAt: Date.now(),
    });

    // Optimized transition using helper
    await transitionProjectsForQuotation(ctx, {
      studioId: quotation.studioId,
      projectId: quotation.projectId,
      projectIds: quotation.projectIds,
      targetState: "quotation_sent",
      notes: "Quotation sent to client",
    });

    return { shareToken };
  },
});

/**
 * Mark quotation as viewed (Public)
 */
export const markQuotationViewed = mutation({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx: MutationCtx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return null;

    // Only update viewedAt if it hasn't been set or if status is 'sent'
    if (quotation.status === "sent") {
      await ctx.db.patch(args.quotationId, {
        status: "viewed",
        viewedAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else if (!quotation.viewedAt) {
      await ctx.db.patch(args.quotationId, {
        viewedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

/**
 * Approve quotation and spawn projects
 */
export const approveQuotation = adminMutation({
  args: {
    quotationId: v.id("quotations"),
    assignedEmployeeId: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    // Status check
    const allowed = [
      "initiated",
      "draft",
      "sent",
      "viewed",
      "changes_requested",
    ];
    if (!allowed.includes(quotation.status)) {
      throw new Error(
        `Cannot approve quotation from status: ${quotation.status}`,
      );
    }

    await ctx.db.patch(args.quotationId, {
      status: "approved",
      approvedAt: Date.now(),
      assignedEmployeeId:
        args.assignedEmployeeId ?? quotation.assignedEmployeeId,
      updatedAt: Date.now(),
    });

    // Optimized transition using helper
    await transitionProjectsForQuotation(ctx, {
      studioId: quotation.studioId,
      projectId: quotation.projectId,
      projectIds: quotation.projectIds,
      targetState: "quotation_approved",
      notes: "Admin approved the quotation",
    });

    // Story 11B.3: Spawn projects based on line items
    await spawnProjectsFromQuotation(ctx, {
      quotationId: args.quotationId,
      profileId: ctx.profile._id,
    });

    return null;
  },
});

/**
 * Reject quotation (Admin-side)
 */
export const rejectQuotationByAdmin = adminMutation({
  args: {
    quotationId: v.id("quotations"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    await ctx.db.patch(args.quotationId, {
      status: "rejected",
      rejectedAt: Date.now(),
      rejectionReason: args.reason,
      updatedAt: Date.now(),
    });

    // Optimized transition using helper
    await transitionProjectsForQuotation(ctx, {
      studioId: quotation.studioId,
      projectId: quotation.projectId,
      projectIds: quotation.projectIds,
      targetState: "quotation_rejected",
      notes: `Admin rejected requested quotation. Reason: ${args.reason}`,
    });

    return null;
  },
});

/**
 * Assign an employee to a quotation
 */
export const assignEmployeeToQuotation = adminMutation({
  args: {
    quotationId: v.id("quotations"),
    assignedEmployeeId: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    await ctx.db.patch(args.quotationId, {
      assignedEmployeeId: args.assignedEmployeeId,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Delete quotation (soft delete)
 */
export const deleteQuotation = adminMutation({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    await ctx.db.patch(args.quotationId, {
      status: "rejected",
      studioNotes: "Deleted by admin",
      rejectedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Record the deletion event for the project(s) if linked
    const targetProjectIds = [
      ...(quotation.projectId ? [quotation.projectId] : []),
      ...(quotation.projectIds || []),
    ];

    if (targetProjectIds.length > 0 && quotation.studioId) {
      const allClientProjects = await ctx.db
        .query("projects")
        .withIndex("by_studioId", (q) => q.eq("studioId", quotation.studioId!))
        .collect();

      const projectsToLog = allClientProjects.filter((p) =>
        targetProjectIds.includes(p._id),
      );

      for (const project of projectsToLog) {
        await ctx.db.insert("statusHistory", {
          projectId: project._id,
          previousPhase: project.phase,
          newPhase: project.phase,
          previousActionState: project.actionState,
          newActionState: project.actionState,
          changedBy: ctx.profile._id,
          changedAt: Date.now(),
          notes: "Quotation was deleted by admin",
        });
      }
    }

    return null;
  },
});

/**
 * Accept quotation (client-side)
 */
export const acceptQuotation = studioMutation({
  args: {
    quotationId: v.id("quotations"),
    studioSignature: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    // Verify ownership
    if (quotation.studioId !== ctx.profile._id) {
      throw new Error("Access denied: Not your quotation");
    }

    // Status check
    const allowedStatuses = ["sent", "viewed", "changes_requested"];
    if (!allowedStatuses.includes(quotation.status)) {
      throw new Error(
        `Quotation cannot be accepted from status: ${quotation.status}`,
      );
    }

    await ctx.db.patch(args.quotationId, {
      status: "approved",
      approvedAt: Date.now(),
      studioSignature: args.studioSignature,
      updatedAt: Date.now(),
    });

    // Optimized transition using helper
    await transitionProjectsForQuotation(ctx, {
      studioId: quotation.studioId,
      projectId: quotation.projectId,
      projectIds: quotation.projectIds,
      targetState: "quotation_approved",
      notes: "Client approved the quotation",
    });

    // Story 11B.3: Spawn projects based on line items
    await spawnProjectsFromQuotation(ctx, {
      quotationId: args.quotationId,
      profileId: ctx.profile._id,
    });

    return { success: true };
  },
});

/**
 * Request quotation changes (client-side)
 */
export const requestQuotationChanges = studioMutation({
  args: {
    quotationId: v.id("quotations"),
    reasons: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    // Verify ownership
    if (quotation.studioId !== ctx.profile._id) {
      throw new Error("Access denied: Not your quotation");
    }

    // Status check
    const allowedStatuses = ["sent", "viewed", "changes_requested"];
    if (!allowedStatuses.includes(quotation.status)) {
      throw new Error(
        `Changes cannot be requested from status: ${quotation.status}`,
      );
    }

    await ctx.db.patch(args.quotationId, {
      status: "changes_requested",
      changeRequestedAt: Date.now(),
      changeReasons: args.reasons,
      studioNotes: args.notes,
      updatedAt: Date.now(),
    });

    // Optimized transition using helper
    await transitionProjectsForQuotation(ctx, {
      studioId: quotation.studioId,
      projectId: quotation.projectId,
      projectIds: quotation.projectIds,
      targetState: "awaiting_quotation",
      notes: `Client requested changes: ${args.reasons.join(", ")}`,
    });

    return { success: true };
  },
});

/**
 * Reject quotation (client-side)
 */
export const rejectQuotation = studioMutation({
  args: {
    quotationId: v.id("quotations"),
    reason: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    // Verify ownership
    if (quotation.studioId !== ctx.profile._id) {
      throw new Error("Access denied: Not your quotation");
    }

    // Status check
    const allowedStatuses = ["sent", "viewed", "changes_requested"];
    if (!allowedStatuses.includes(quotation.status)) {
      throw new Error(
        `Quotation cannot be rejected from status: ${quotation.status}`,
      );
    }

    await ctx.db.patch(args.quotationId, {
      status: "rejected",
      rejectedAt: Date.now(),
      rejectionReason: args.reason,
      studioNotes: args.notes,
      updatedAt: Date.now(),
    });

    // Optimized transition using helper
    await transitionProjectsForQuotation(ctx, {
      studioId: quotation.studioId,
      projectId: quotation.projectId,
      projectIds: quotation.projectIds,
      targetState: "quotation_rejected",
      notes: `Client rejected the quotation. Reason: ${args.reason}`,
    });

    return { success: true };
  },
});

/**
 * Duplicate an existing quotation as a new draft
 */
export const duplicateQuotation = adminMutation({
  args: {
    quotationId: v.id("quotations"),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.quotationId);
    if (!original) throw new Error("Original quotation not found");

    const code = await generateQuotationCode(ctx);

    // Create new quotation as a copy of the original
    const newQuotationId = await ctx.db.insert("quotations", {
      ...original,
      _id: undefined as any,
      _creationTime: undefined as any,
      code,
      version: 1,
      status: "draft",
      selectedPackageIds: original.selectedPackageIds,
      createdBy: args.createdBy,
      updatedAt: Date.now(),
      sentAt: undefined,
      viewedAt: undefined,
      approvedAt: undefined,
      rejectedAt: undefined,
      changeRequestedAt: undefined,
      shareToken: undefined,
      shareTokenExpiresAt: undefined,
      studioSignature: undefined,
      changeReasons: undefined,
      studioNotes: undefined,
      rejectionReason: undefined,
    } as any);

    return newQuotationId;
  },
});

/**
 * Re-initiate a rejected quotation (Studio-side)
 */
export const reinitiateQuotation = studioMutation({
  args: {
    quotationId: v.id("quotations"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");

    if (quotation.studioId !== ctx.profile._id) {
      throw new Error("Access denied");
    }

    if (quotation.status !== "rejected") {
      throw new Error("Only rejected quotations can be re-initiated");
    }

    await ctx.db.patch(args.quotationId, {
      status: "initiated",
      studioNotes: args.notes ?? quotation.studioNotes,
      rejectionReason: undefined,
      rejectedAt: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
