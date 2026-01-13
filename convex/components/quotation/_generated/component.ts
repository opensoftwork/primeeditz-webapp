/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    quotations: {
      mutations: {
        approveQuotation: FunctionReference<
          "mutation",
          "internal",
          { quotationId: string },
          null,
          Name
        >;
        createQuotation: FunctionReference<
          "mutation",
          "internal",
          {
            clientId?: string;
            createdBy: string;
            discountAmount?: number;
            lineItems: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            projectId?: string;
            projectIds?: Array<string>;
            taxRate?: number;
            templateId?: string;
            terms?: string;
            validUntil?: number;
          },
          string,
          Name
        >;
        createQuotationRevision: FunctionReference<
          "mutation",
          "internal",
          { createdBy: string; quotationId: string },
          string,
          Name
        >;
        deleteQuotation: FunctionReference<
          "mutation",
          "internal",
          { quotationId: string },
          null,
          Name
        >;
        markQuotationViewed: FunctionReference<
          "mutation",
          "internal",
          { quotationId: string },
          null,
          Name
        >;
        rejectQuotation: FunctionReference<
          "mutation",
          "internal",
          { clientNotes?: string; quotationId: string },
          null,
          Name
        >;
        requestChanges: FunctionReference<
          "mutation",
          "internal",
          { clientNotes: string; quotationId: string },
          null,
          Name
        >;
        sendQuotation: FunctionReference<
          "mutation",
          "internal",
          { quotationId: string },
          null,
          Name
        >;
        updateQuotation: FunctionReference<
          "mutation",
          "internal",
          {
            clientId?: string;
            discountAmount?: number;
            lineItems?: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            projectId?: string;
            quotationId: string;
            taxRate?: number;
            terms?: string;
            validUntil?: number;
          },
          null,
          Name
        >;
      };
      queries: {
        getQuotation: FunctionReference<
          "query",
          "internal",
          { quotationId: string },
          {
            _creationTime: number;
            _id: string;
            approvedAt?: number;
            clientId?: string;
            clientNotes?: string;
            code: string;
            createdBy: string;
            discountAmount?: number;
            lineItems: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            parentQuotationId?: string;
            projectId?: string;
            projectIds?: Array<string>;
            rejectedAt?: number;
            sentAt?: number;
            status:
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded";
            subtotal: number;
            taxAmount: number;
            taxRate: number;
            templateId?: string;
            terms?: string;
            total: number;
            updatedAt: number;
            validUntil?: number;
            version: number;
            viewedAt?: number;
          } | null,
          Name
        >;
        getQuotationByCode: FunctionReference<
          "query",
          "internal",
          { code: string },
          {
            _creationTime: number;
            _id: string;
            approvedAt?: number;
            clientId?: string;
            clientNotes?: string;
            code: string;
            createdBy: string;
            discountAmount?: number;
            lineItems: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            parentQuotationId?: string;
            projectId?: string;
            projectIds?: Array<string>;
            rejectedAt?: number;
            sentAt?: number;
            status:
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded";
            subtotal: number;
            taxAmount: number;
            taxRate: number;
            templateId?: string;
            terms?: string;
            total: number;
            updatedAt: number;
            validUntil?: number;
            version: number;
            viewedAt?: number;
          } | null,
          Name
        >;
        getQuotationHistory: FunctionReference<
          "query",
          "internal",
          { quotationId: string },
          Array<{
            _creationTime: number;
            _id: string;
            approvedAt?: number;
            clientId?: string;
            clientNotes?: string;
            code: string;
            createdBy: string;
            discountAmount?: number;
            lineItems: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            parentQuotationId?: string;
            projectId?: string;
            projectIds?: Array<string>;
            rejectedAt?: number;
            sentAt?: number;
            status:
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded";
            subtotal: number;
            taxAmount: number;
            taxRate: number;
            templateId?: string;
            terms?: string;
            total: number;
            updatedAt: number;
            validUntil?: number;
            version: number;
            viewedAt?: number;
          }>,
          Name
        >;
        getQuotations: FunctionReference<
          "query",
          "internal",
          {
            clientId?: string;
            limit?: number;
            projectId?: string;
            status?:
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded";
          },
          Array<{
            _creationTime: number;
            _id: string;
            approvedAt?: number;
            clientId?: string;
            clientNotes?: string;
            code: string;
            createdBy: string;
            discountAmount?: number;
            lineItems: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            parentQuotationId?: string;
            projectId?: string;
            projectIds?: Array<string>;
            rejectedAt?: number;
            sentAt?: number;
            status:
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded";
            subtotal: number;
            taxAmount: number;
            taxRate: number;
            templateId?: string;
            terms?: string;
            total: number;
            updatedAt: number;
            validUntil?: number;
            version: number;
            viewedAt?: number;
          }>,
          Name
        >;
        getQuotationWithSections: FunctionReference<
          "query",
          "internal",
          { quotationId: string },
          {
            quotation: {
              _creationTime: number;
              _id: string;
              approvedAt?: number;
              clientId?: string;
              clientNotes?: string;
              code: string;
              createdBy: string;
              discountAmount?: number;
              lineItems: Array<{
                description: string;
                id: string;
                image?: string;
                length?: string;
                quantity: number;
                rate: number;
                sectionId: string;
                subItems?: Array<{
                  description: string;
                  id: string;
                  quantity: number;
                  rate: number;
                  unit: string;
                }>;
                unit: string;
                width?: string;
              }>;
              parentQuotationId?: string;
              projectId?: string;
              projectIds?: Array<string>;
              rejectedAt?: number;
              sentAt?: number;
              status:
                | "draft"
                | "sent"
                | "viewed"
                | "approved"
                | "changes_requested"
                | "rejected"
                | "expired"
                | "superseded";
              subtotal: number;
              taxAmount: number;
              taxRate: number;
              templateId?: string;
              terms?: string;
              total: number;
              updatedAt: number;
              validUntil?: number;
              version: number;
              viewedAt?: number;
            };
            sections: Array<{
              _creationTime: number;
              _id: string;
              color?: string;
              displayOrder: number;
              icon?: string;
              isActive: boolean;
              name: string;
            }>;
          } | null,
          Name
        >;
      };
    };
    sections: {
      mutations: {
        createSection: FunctionReference<
          "mutation",
          "internal",
          {
            color?: string;
            displayOrder?: number;
            icon?: string;
            name: string;
          },
          string,
          Name
        >;
        deleteSection: FunctionReference<
          "mutation",
          "internal",
          { sectionId: string },
          null,
          Name
        >;
        reorderSections: FunctionReference<
          "mutation",
          "internal",
          { orderedIds: Array<string> },
          null,
          Name
        >;
        toggleSectionActive: FunctionReference<
          "mutation",
          "internal",
          { sectionId: string },
          boolean,
          Name
        >;
        updateSection: FunctionReference<
          "mutation",
          "internal",
          {
            color?: string;
            displayOrder?: number;
            icon?: string;
            isActive?: boolean;
            name?: string;
            sectionId: string;
          },
          null,
          Name
        >;
      };
      queries: {
        getSection: FunctionReference<
          "query",
          "internal",
          { sectionId: string },
          {
            _creationTime: number;
            _id: string;
            color?: string;
            displayOrder: number;
            icon?: string;
            isActive: boolean;
            name: string;
          } | null,
          Name
        >;
        getSections: FunctionReference<
          "query",
          "internal",
          { activeOnly?: boolean },
          Array<{
            _creationTime: number;
            _id: string;
            color?: string;
            displayOrder: number;
            icon?: string;
            isActive: boolean;
            name: string;
          }>,
          Name
        >;
      };
    };
    templates: {
      mutations: {
        createTemplate: FunctionReference<
          "mutation",
          "internal",
          {
            createdBy: string;
            description?: string;
            lineItems: Array<{
              defaultQuantity: number;
              description: string;
              sectionId: string;
              subItems?: Array<{
                defaultQuantity: number;
                description: string;
                unit: string;
                unitPrice: number;
              }>;
              unit: string;
              unitPrice: number;
            }>;
            name: string;
            projectTypeHint?: string;
            terms?: string;
          },
          string,
          Name
        >;
        deleteTemplate: FunctionReference<
          "mutation",
          "internal",
          { templateId: string },
          null,
          Name
        >;
        duplicateTemplate: FunctionReference<
          "mutation",
          "internal",
          { createdBy: string; newName: string; templateId: string },
          string,
          Name
        >;
        toggleTemplateActive: FunctionReference<
          "mutation",
          "internal",
          { templateId: string },
          boolean,
          Name
        >;
        updateTemplate: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            isActive?: boolean;
            lineItems?: Array<{
              defaultQuantity: number;
              description: string;
              sectionId: string;
              subItems?: Array<{
                defaultQuantity: number;
                description: string;
                unit: string;
                unitPrice: number;
              }>;
              unit: string;
              unitPrice: number;
            }>;
            name?: string;
            projectTypeHint?: string;
            templateId: string;
            terms?: string;
          },
          null,
          Name
        >;
      };
      queries: {
        getTemplate: FunctionReference<
          "query",
          "internal",
          { templateId: string },
          {
            _creationTime: number;
            _id: string;
            createdBy: string;
            description?: string;
            isActive: boolean;
            lineItems: Array<{
              defaultQuantity: number;
              description: string;
              sectionId: string;
              subItems?: Array<{
                defaultQuantity: number;
                description: string;
                unit: string;
                unitPrice: number;
              }>;
              unit: string;
              unitPrice: number;
            }>;
            name: string;
            projectTypeHint?: string;
            terms?: string;
            updatedAt: number;
          } | null,
          Name
        >;
        getTemplates: FunctionReference<
          "query",
          "internal",
          { activeOnly?: boolean },
          Array<{
            _creationTime: number;
            _id: string;
            createdBy: string;
            description?: string;
            isActive: boolean;
            lineItems: Array<{
              defaultQuantity: number;
              description: string;
              sectionId: string;
              subItems?: Array<{
                defaultQuantity: number;
                description: string;
                unit: string;
                unitPrice: number;
              }>;
              unit: string;
              unitPrice: number;
            }>;
            name: string;
            projectTypeHint?: string;
            terms?: string;
            updatedAt: number;
          }>,
          Name
        >;
        getTemplatesByProjectType: FunctionReference<
          "query",
          "internal",
          { projectTypeHint: string },
          Array<{
            _creationTime: number;
            _id: string;
            createdBy: string;
            description?: string;
            isActive: boolean;
            lineItems: Array<{
              defaultQuantity: number;
              description: string;
              sectionId: string;
              subItems?: Array<{
                defaultQuantity: number;
                description: string;
                unit: string;
                unitPrice: number;
              }>;
              unit: string;
              unitPrice: number;
            }>;
            name: string;
            projectTypeHint?: string;
            terms?: string;
            updatedAt: number;
          }>,
          Name
        >;
      };
    };
  };
