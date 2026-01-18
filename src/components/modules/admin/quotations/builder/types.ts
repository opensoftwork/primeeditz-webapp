/**
 * Quotation Builder Types
 *
 * Re-exports from centralized types for backward compatibility.
 * Import from "../types" for new code.
 */

// Re-export all types from the centralized types file
export {
  // Core types
  type QuotationSubItem,
  type QuotationLineItem,
  type QuotationSection,
  type QuotationData,
  type CompanyInfo,
  type GroupedLineItems,
  type TemplateLineItem,
  type TemplateSubItem,

  // Convex document types
  type Section,
  type Quotation,
  type LibraryItem,

  // Builder state
  type QuotationBuilderState,

  // Component props
  type Client,
  type Project,
  type Template,
} from "../types";

// For backward compatibility with existing imports that use TemplateLineItem differently
import type { Template } from "../types";
export type TemplateLineItemFromDoc = Template["lineItems"][number] & {
  projectId?: string;
};
