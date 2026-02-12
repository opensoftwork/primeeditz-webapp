/**
 * Reusable Validators
 *
 * Common validators used across the schema and functions.
 * Import these to ensure consistency in validation.
 */

import { v } from "convex/values";

// ============================================================================
// Role Validators
// ============================================================================

/** User role validator */
export const roleValidator = v.union(
  v.literal("studio"),
  v.literal("employee"),
  v.literal("admin"),
);

// ============================================================================
// Project Validators
// ============================================================================

/**
 * Project status flow:
 * draft → pending_review → active → in_progress → completed → archived
 */
export const projectStatusValidator = v.union(
  v.literal("draft"),
  v.literal("pending_review"),
  v.literal("active"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("archived"),
);

/** Project source: how the project was created */
export const projectSourceValidator = v.union(
  v.literal("client_request"),
  v.literal("admin_init"),
);

// ============================================================================
// Quotation Validators
// ============================================================================

/**
 * Quotation status flow:
 * draft → sent → approved
 *          └→ version_requested → sent (loop)
 */
export const quotationStatusValidator = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("approved"),
  v.literal("version_requested"),
);

/** Line item for quotations */
export const lineItemValidator = v.object({
  description: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
});

// ============================================================================
// Folder & Asset Validators
// ============================================================================

/**
 * Folder status flow:
 * pending_upload → in_progress → completed
 */
export const folderStatusValidator = v.union(
  v.literal("pending_upload"),
  v.literal("in_progress"),
  v.literal("completed"),
);

/**
 * Deliverable status flow:
 * pending_qc → approved
 *          └→ version_needed → pending_qc (loop)
 *          (client can request) → version_requested
 */
export const deliverableStatusValidator = v.union(
  v.literal("pending_qc"),
  v.literal("approved"),
  v.literal("version_needed"),
  v.literal("version_requested"),
);

// ============================================================================
// Common Validators
// ============================================================================

/** Pagination args */
export const paginationValidator = {
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

/** Sort order */
export const sortOrderValidator = v.union(v.literal("asc"), v.literal("desc"));
