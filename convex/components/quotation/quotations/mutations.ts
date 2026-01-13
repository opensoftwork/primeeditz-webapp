import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Sub-item input validator
 */
const subItemInput = v.object({
  id: v.string(),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
});

/**
 * Line item input validator
 */
const lineItemInput = v.object({
  id: v.string(),
  sectionId: v.id("quotationSections"),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  length: v.optional(v.string()),
  width: v.optional(v.string()),
  image: v.optional(v.string()),
  subItems: v.optional(v.array(subItemInput)),
});

/**
 * Status validator
 */
const statusValidator = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("viewed"),
  v.literal("approved"),
  v.literal("changes_requested"),
  v.literal("rejected"),
  v.literal("expired"),
  v.literal("superseded")
);

/**
 * Generate unique quotation code
 */
async function generateQuotationCode(ctx: any): Promise<string> {
  const quotations = await ctx.db.query("quotations").collect();
  const maxNumber = quotations.reduce((max: number, q: any) => {
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
  discountAmount?: number
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
 * Create a new quotation
 */
export const createQuotation = mutation({
  args: {
    // External links (optional)
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    projectIds: v.optional(v.array(v.string())),
    templateId: v.optional(v.id("quotationTemplates")),
    
    // Content
    lineItems: v.array(lineItemInput),
    terms: v.optional(v.string()),
    validUntil: v.optional(v.number()),
    
    // Tax configuration
    taxRate: v.optional(v.number()), // Defaults to 0.18 (18%)
    discountAmount: v.optional(v.number()),
    
    // Audit
    createdBy: v.string(),
  },
  returns: v.id("quotations"),
  handler: async (ctx, args) => {
    const code = await generateQuotationCode(ctx);
    const taxRate = args.taxRate ?? 0.18;
    const { subtotal, taxAmount, total } = calculateTotals(
      args.lineItems,
      taxRate,
      args.discountAmount
    );
    
    return await ctx.db.insert("quotations", {
      code,
      version: 1,
      parentQuotationId: undefined,
      clientId: args.clientId,
      projectId: args.projectId,
      projectIds: args.projectIds,
      templateId: args.templateId,
      status: "draft",
      lineItems: args.lineItems,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount: args.discountAmount,
      total,
      terms: args.terms,
      validUntil: args.validUntil,
      clientNotes: undefined,
      createdBy: args.createdBy,
      sentAt: undefined,
      viewedAt: undefined,
      approvedAt: undefined,
      rejectedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update quotation line items and recalculate totals
 */
export const updateQuotation = mutation({
  args: {
    quotationId: v.id("quotations"),
    lineItems: v.optional(v.array(lineItemInput)),
    terms: v.optional(v.string()),
    validUntil: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    
    if (quotation.status !== "draft") {
      throw new Error("Can only edit draft quotations");
    }
    
    const { quotationId, ...updates } = args;
    
    // Recalculate totals if line items changed
    if (updates.lineItems) {
      const taxRate = updates.taxRate ?? quotation.taxRate;
      const discountAmount = updates.discountAmount ?? quotation.discountAmount;
      const { subtotal, taxAmount, total } = calculateTotals(
        updates.lineItems,
        taxRate,
        discountAmount
      );
      
      await ctx.db.patch(quotationId, {
        ...updates,
        subtotal,
        taxAmount,
        total,
        updatedAt: Date.now(),
      });
    } else {
      // Remove undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
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
export const sendQuotation = mutation({
  args: {
    quotationId: v.id("quotations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    
    if (quotation.status !== "draft") {
      throw new Error("Can only send draft quotations");
    }
    
    await ctx.db.patch(args.quotationId, {
      status: "sent",
      sentAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return null;
  },
});

/**
 * Mark quotation as viewed (client opened it)
 */
export const markQuotationViewed = mutation({
  args: {
    quotationId: v.id("quotations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    
    if (quotation.status === "sent") {
      await ctx.db.patch(args.quotationId, {
        status: "viewed",
        viewedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return null;
  },
});

/**
 * Client approves quotation
 */
export const approveQuotation = mutation({
  args: {
    quotationId: v.id("quotations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    
    if (!["sent", "viewed"].includes(quotation.status)) {
      throw new Error("Can only approve sent or viewed quotations");
    }
    
    await ctx.db.patch(args.quotationId, {
      status: "approved",
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return null;
  },
});

/**
 * Client requests changes
 */
export const requestChanges = mutation({
  args: {
    quotationId: v.id("quotations"),
    clientNotes: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    
    if (!["sent", "viewed"].includes(quotation.status)) {
      throw new Error("Can only request changes on sent or viewed quotations");
    }
    
    await ctx.db.patch(args.quotationId, {
      status: "changes_requested",
      clientNotes: args.clientNotes,
      updatedAt: Date.now(),
    });
    
    return null;
  },
});

/**
 * Client rejects quotation
 */
export const rejectQuotation = mutation({
  args: {
    quotationId: v.id("quotations"),
    clientNotes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    
    if (!["sent", "viewed", "changes_requested"].includes(quotation.status)) {
      throw new Error("Cannot reject this quotation");
    }
    
    await ctx.db.patch(args.quotationId, {
      status: "rejected",
      clientNotes: args.clientNotes,
      rejectedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return null;
  },
});

/**
 * Create a new version of a quotation (for revisions)
 */
export const createQuotationRevision = mutation({
  args: {
    quotationId: v.id("quotations"),
    createdBy: v.string(),
  },
  returns: v.id("quotations"),
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.quotationId);
    if (!original) {
      throw new Error("Quotation not found");
    }
    
    // Mark original as superseded
    await ctx.db.patch(args.quotationId, {
      status: "superseded",
      updatedAt: Date.now(),
    });
    
    // Create new version
    return await ctx.db.insert("quotations", {
      code: original.code, // Same code
      version: original.version + 1,
      parentQuotationId: args.quotationId,
      clientId: original.clientId,
      projectId: original.projectId,
      projectIds: original.projectIds,
      templateId: original.templateId,
      status: "draft",
      lineItems: original.lineItems,
      subtotal: original.subtotal,
      taxRate: original.taxRate,
      taxAmount: original.taxAmount,
      discountAmount: original.discountAmount,
      total: original.total,
      terms: original.terms,
      validUntil: original.validUntil,
      clientNotes: undefined,
      createdBy: args.createdBy,
      sentAt: undefined,
      viewedAt: undefined,
      approvedAt: undefined,
      rejectedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete quotation (soft delete - mark as rejected)
 */
export const deleteQuotation = mutation({
  args: {
    quotationId: v.id("quotations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    
    if (quotation.status === "approved") {
      throw new Error("Cannot delete approved quotations");
    }
    
    await ctx.db.patch(args.quotationId, {
      status: "rejected",
      clientNotes: "Deleted by admin",
      rejectedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return null;
  },
});
