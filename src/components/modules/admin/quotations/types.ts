/**
 * Quotation Types
 *
 * Centralized type definitions for all quotation-related components.
 * This is the single source of truth for quotation types across:
 * - Admin preview components
 * - Admin builder components
 * - Client-facing quotation views
 */

import { Doc, Id } from "@convex/_generated/dataModel";

// ============================================================================
// Core Line Item Types
// ============================================================================

/**
 * Sub-item within a line item (for nested/breakdown items)
 */
export interface QuotationSubItem {
  id?: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
}

/**
 * Primary line item in a quotation
 */
export interface QuotationLineItem {
  id: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  sectionId?: string | Id<"quotationSections">;
  projectId?: string;
  length?: string;
  width?: string;
  image?: string;
  subItems?: QuotationSubItem[];
  spawnsProject?: boolean;
  projectTypeId?: string | Id<"projectTypes">;
  selectedFolderTemplateId?: string | Id<"folderTemplates">;
}

// ============================================================================
// Section Types
// ============================================================================

/**
 * Quotation section for organizing line items
 */
export interface QuotationSection {
  _id: string;
  name: string;
  color?: string;
  sequence?: number;
}

// ============================================================================
// Quotation Data Types
// ============================================================================

/**
 * Core quotation data structure used across preview/document components
 */
export interface QuotationData {
  code: string;
  version: number;
  status: string;
  studioId?: string;
  projectIds?: string[];
  lineItems: QuotationLineItem[];
  terms?: string;
  validUntil?: number;
  taxRate?: number;
  discountAmount?: number;
  _creationTime: number;
}

/**
 * Company information for quotation branding
 */
export interface CompanyInfo {
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}

// ============================================================================
// Grouped Items (for sectioned display)
// ============================================================================

/**
 * Items grouped by section for display purposes
 */
export interface GroupedLineItems {
  section: QuotationSection;
  items: QuotationLineItem[];
}

// ============================================================================
// Template-Specific Types (for quotation templates)
// ============================================================================

/**
 * Sub-item within a template line item
 */
export interface TemplateSubItem {
  description: string;
  unit: string;
  unitPrice: number;
  defaultQuantity: number;
}

/**
 * Line item in a template (uses different field names than QuotationLineItem)
 */
export interface TemplateLineItem {
  description: string;
  unit: string;
  unitPrice: number;
  defaultQuantity: number;
  sectionId?: string;
  subItems?: TemplateSubItem[];
  spawnsProject?: boolean;
  projectTypeId?: string | Id<"projectTypes">;
  selectedFolderTemplateId?: string | Id<"folderTemplates">;
}

// ============================================================================
// Convex Document Types (re-exported for convenience)
// ============================================================================

export type Section = Doc<"quotationSections">;
export type Quotation = Doc<"quotations">;
export type LibraryItem = Doc<"quotationLibraryItems">;

// ============================================================================
// Builder State Types
// ============================================================================

export interface QuotationBuilderState {
  studioId: string;
  projectId: string;
  projectIds: string[];
  templateId: string;
  lineItems: QuotationLineItem[];
  terms: string;
  validUntil: Date | undefined;
  taxRate: number;
  discountAmount: number;
}

// ============================================================================
// Component Prop Types
// ============================================================================

export type Client = Doc<"profiles">;

export interface Project {
  _id: Id<"projects"> | string;
  code: string;
  eventName?: string;
  projectTypeName?: string;
}

export type Template = Doc<"quotationTemplates">;
