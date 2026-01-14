import { Doc, Id } from "@convex/_generated/dataModel";

// ============================================================================
// Line Item Types
// ============================================================================

export interface QuotationSubItem {
  id: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
}

export interface QuotationLineItem {
  id: string;
  sectionId?: Id<"quotationSections">;
  projectId?: string; // Associated project ID
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  length?: string;
  width?: string;
  image?: string;
  subItems?: QuotationSubItem[];
}

// ============================================================================
// Data Types (from Convex)
// ============================================================================

export type Client = Doc<"profiles">;

export interface Project {
  _id: Id<"projects">;
  code: string;
  eventName?: string;
  projectTypeName: string;
}

export type Template = Doc<"quotationTemplates">;
export type TemplateLineItem = Template["lineItems"][number] & {
  projectId?: string;
};
// @ts-ignore - Handle optional subItems
export type TemplateSubItem = NonNullable<TemplateLineItem["subItems"]>[number];

export type Section = Doc<"quotationSections">;
export type Quotation = Doc<"quotations">;
export type LibraryItem = Doc<"quotationLibraryItems">;

// ============================================================================
// Form State Types
// ============================================================================

export interface QuotationBuilderState {
  clientId: string;
  projectId: string;
  projectIds: string[];
  templateId: string;
  lineItems: QuotationLineItem[];
  terms: string;
  validUntil: Date | undefined;
  taxRate: number;
  discountAmount: number;
}
