import { v } from "convex/values";
import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Doc, Id } from "../../_generated/dataModel";
import { adminMutation } from "../../lib/customFunctions";

/**
 * Line item input validator
 */
const lineItemInput = v.object({
  id: v.string(),
  sectionId: v.id("quotationSections"),
  projectId: v.optional(v.string()),
  description: v.string(),
  unit: v.string(),
  rate: v.number(),
  quantity: v.number(),
  length: v.optional(v.string()),
  width: v.optional(v.string()),
  image: v.optional(v.string()),
  subItems: v.optional(
    v.array(
      v.object({
        id: v.string(),
        description: v.string(),
        unit: v.string(),
        rate: v.number(),
        quantity: v.number(),
      })
    )
  ),
});

/**
 * Generate unique quotation code
 */
async function generateQuotationCode(ctx: QueryCtx | MutationCtx): Promise<string> {
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
export const createQuotation = adminMutation({
  args: {
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    projectIds: v.optional(v.array(v.string())),
    templateId: v.optional(v.id("quotationTemplates")),
    lineItems: v.array(lineItemInput),
    terms: v.optional(v.string()),
    validUntil: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    createdBy: v.string(),
  },
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
      createdBy: args.createdBy,
      updatedAt: Date.now(),
    });
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
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
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
        discountAmount
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
export const sendQuotation = adminMutation({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");
    if (quotation.status !== "draft") throw new Error("Can only send draft quotations");
    
    await ctx.db.patch(args.quotationId, {
      status: "sent",
      sentAt: Date.now(),
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Approve quotation
 */
export const approveQuotation = adminMutation({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");
    
    await ctx.db.patch(args.quotationId, {
      status: "approved",
      approvedAt: Date.now(),
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
      clientNotes: "Deleted by admin",
      rejectedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return null;
  },
});
