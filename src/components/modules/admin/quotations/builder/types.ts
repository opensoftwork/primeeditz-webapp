/**
 * Quotation Builder Types
 *
 * Re-exports from centralized types for backward compatibility.
 * Import from "../types" for new code.
 */

// Re-export all types from the centralized types file
export type {
  // Component props
  Client,
  CompanyInfo,
  GroupedLineItems,
  LibraryItem,
  Project,
  Quotation,
  // Builder state
  QuotationBuilderState,
  QuotationData,
  QuotationLineItem,
  QuotationSection,
  // Core types
  QuotationSubItem,
  // Convex document types
  Section,
  Template,
  TemplateLineItem,
  TemplateSubItem,
} from "../types";

// For backward compatibility with existing imports that use TemplateLineItem differently
import type { Template } from "../types";
export type TemplateLineItemFromDoc = Template["lineItems"][number] & {
  projectId?: string;
};
