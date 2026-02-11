/**
 * Quotation Document Component
 *
 * Print-ready quotation document optimized for A4 paper.
 * Professional layout for post-production studio.
 */

"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import React, { useMemo } from "react";
import type {
  CompanyInfo,
  Project,
  QuotationData,
  QuotationSection,
} from "../types";

// Sub-components
import { ClientInfo } from "./components/client-info";
import { DocumentFooter } from "./components/document-footer";
import { DocumentHeader } from "./components/document-header";
import { FinancialSummary } from "./components/financial-summary";
import { LineItemsList } from "./components/line-items-list";
import { SignatureSection } from "./components/signature-section";
import { TermsAndConditions } from "./components/terms-and-conditions";
import { BankDetails } from "./components/bank-details";

// ============================================================================
// Component Props
// ============================================================================

interface QuotationDocumentProps {
  quotation: QuotationData;
  sections: QuotationSection[];
  projects?: Project[];
  activeSection?: string; // Filter to show only this section
  companyInfo?: CompanyInfo;
  studioName?: string;
  projectName?: string;
}

// ============================================================================
// Currency Formatter
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// ============================================================================
// Main Document Component
// ============================================================================

export const QuotationDocument = React.forwardRef<
  HTMLDivElement,
  QuotationDocumentProps
>(
  (
    {
      quotation,
      sections,
      projects = [],
      activeSection,
      companyInfo,
      studioName,
      projectName,
    },
    ref,
  ) => {
    // -------------------------------------------------------------------------
    // 1. Data Processing & Calculations
    // -------------------------------------------------------------------------

    const dbCompany = useQuery(api.functions.company.queries.get);

    const {
      filteredLineItems,
      filteredSections,
      subtotal,
      discountAmount,
      taxRate,
      taxAmount,
      grandTotal,
      hasProjects,
      groupedByProject,
      groupedBySection,
      company,
    } = useMemo(() => {
      // Filter sections if activeSection is provided
      const fs = activeSection
        ? sections.filter((s) => s.name === activeSection)
        : sections;

      // Filter line items if activeSection is provided
      const fli = activeSection
        ? quotation.lineItems.filter((item) => {
            const section = sections.find((s) => s._id === item.sectionId);
            return section?.name === activeSection;
          })
        : quotation.lineItems;

      // Calculate totals based on filtered items
      const st = fli.reduce((acc, item) => {
        const itemTotal = item.rate * item.quantity;
        const subItemsTotal =
          item.subItems?.reduce((s, sub) => s + sub.rate * sub.quantity, 0) ??
          0;
        return acc + itemTotal + subItemsTotal;
      }, 0);

      const da = activeSection ? 0 : quotation.discountAmount || 0;
      const tr = quotation.taxRate || 0.18;
      const ta = (st - da) * tr;
      const gt = st - da + ta;

      const hp = projects.length > 0;

      // Group items by project, then by section
      const gbp = hp
        ? projects
            .filter((p) => quotation.projectIds?.includes(p._id as any))
            .map((project) => {
              const projectItems = fli.filter(
                (item) => item.projectId === project._id,
              );

              const sectionGroups = fs
                .map((section) => ({
                  section,
                  items: projectItems.filter(
                    (item) => item.sectionId === section._id,
                  ),
                }))
                .filter((g) => g.items.length > 0);

              const unsectionedItems = projectItems.filter(
                (item) =>
                  !item.sectionId ||
                  !sections.some((s) => s._id === item.sectionId),
              );

              if (unsectionedItems.length > 0) {
                sectionGroups.push({
                  section: {
                    _id: "unsectioned",
                    name: "Standard Services",
                    color: "zinc",
                  } as any,
                  items: unsectionedItems,
                });
              }

              return {
                project,
                sectionGroups,
                total: projectItems.reduce((acc, item) => {
                  const itemTotal = item.rate * item.quantity;
                  const subItemsTotal =
                    item.subItems?.reduce(
                      (s, sub) => s + sub.rate * sub.quantity,
                      0,
                    ) ?? 0;
                  return acc + itemTotal + subItemsTotal;
                }, 0),
              };
            })
            .filter((pg) => pg.sectionGroups.length > 0)
        : [];

      // Fallback: Group items by section only
      const gbs = fs
        .map((section) => ({
          section,
          items: fli.filter((item) => item.sectionId === section._id),
        }))
        .filter((g) => g.items.length > 0);

      const globalUnsectioned = fli.filter(
        (item) =>
          !item.sectionId || !sections.some((s) => s._id === item.sectionId),
      );

      if (globalUnsectioned.length > 0) {
        gbs.push({
          section: {
            _id: "unsectioned",
            name: "Standard Services",
            color: "zinc",
          } as any,
          items: globalUnsectioned,
        });
      }

      const comp = companyInfo || dbCompany || {
        name: "PRIMEEDITZ",
        tagline: "Post-Production Excellence",
        address: "Creative Hub, Film City, Mumbai 400065",
        phone: "+91 22 4455 6677",
        email: "studio@primeeditz.com",
      };

      return {
        filteredLineItems: fli,
        filteredSections: fs,
        subtotal: st,
        discountAmount: da,
        taxRate: tr,
        taxAmount: ta,
        grandTotal: gt,
        hasProjects: hp,
        groupedByProject: gbp,
        groupedBySection: gbs,
        company: comp as unknown as CompanyInfo,
      };
    }, [quotation, sections, projects, activeSection, companyInfo, dbCompany]);

    // -------------------------------------------------------------------------
    // 2. Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className="bg-white text-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.12)] rounded-sm min-h-[1123px] w-full max-w-[900px] mx-auto overflow-visible print:shadow-none print:m-0 print:max-w-none print:rounded-none ring-1 ring-slate-100 print:ring-0"
      >
        <div className="p-10 md:p-14 pt-8 md:pt-10 pb-20 md:pb-24 space-y-10 text-slate-900 print:p-8 print:pt-0 print:pb-16">
          <DocumentHeader company={company} quotation={quotation} />

          {/* Divider */}
          <div className="h-0.5 bg-slate-100" />

          <ClientInfo
            studioName={studioName}
            projectName={projectName}
            quotation={quotation}
          />

          <LineItemsList
            hasProjects={hasProjects}
            groupedByProject={groupedByProject}
            groupedBySection={groupedBySection}
            formatCurrency={formatCurrency}
          />

          <FinancialSummary
            subtotal={subtotal}
            discountAmount={discountAmount}
            taxRate={taxRate}
            taxAmount={taxAmount}
            grandTotal={grandTotal}
            formatCurrency={formatCurrency}
          />

          <TermsAndConditions terms={quotation.terms} />

          {/* Bank Details */}
          <BankDetails company={company} />

          <SignatureSection companyName={company.name} />

          <DocumentFooter />
        </div>
      </div>
    );
  },
);

QuotationDocument.displayName = "QuotationDocument";
