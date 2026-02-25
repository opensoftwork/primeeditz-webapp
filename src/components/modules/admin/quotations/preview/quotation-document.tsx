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
import type { PackageInfo } from "./quotation-preview";

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
  packages?: PackageInfo[];
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
      packages = [],
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
//@ts-ignore
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
      hasPackages,
      groupedByPackage,
      manualItems,
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

      // Recursive total calculation
      const calculateItemTotal = (item: any): number => {
        const self = item.rate * item.quantity;
        const subTotal = (item.subItems || []).reduce(
          (sum: number, sub: any) => {
            const subSelf = sub.rate * sub.quantity;
            const subSubTotal = (sub.subItems || []).reduce(
              (s: number, ss: any) => s + ss.rate * ss.quantity,
              0,
            );
            return sum + subSelf + subSubTotal;
          },
          0,
        );
        return self + subTotal;
      };

      // Calculate totals based on filtered items
      const st = fli.reduce((acc, item) => acc + calculateItemTotal(item), 0);

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
                total: projectItems.reduce(
                  (acc, item) => acc + calculateItemTotal(item),
                  0,
                ),
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

      const filteredLineItems: typeof fli = fli;
      const filteredSections: typeof fs = fs;
      const subtotal = st;
      const discountAmount: number = da;
      const taxRate = tr;
      const taxAmount = ta;
      const grandTotal = gt;
      const hasProjects = hp;
      const groupedByProject = gbp;
      const groupedBySection = gbs;

      // Group items by package (for package-based preview)
      // Uses a 3-pass matching strategy (same as builder's ProjectSectionItems):
      // 1. Direct sourcePackageId match (best)
      // 2. Description match against package line item descriptions (fallback)
      // 3. projectTypeId match (last resort)
      const hasPackages = packages.length > 0;
      const processedItemIds = new Set<string>();

      const groupedByPackage = hasPackages
        ? (() => {
            // Initialize buckets for each package
            const packageItemsMap = new Map<string, typeof fli>();
            packages.forEach((pkg) => packageItemsMap.set(pkg._id, []));

            // Build a description-to-packageId lookup from package data
            const descriptionToPackageId = new Map<string, string>();
            packages.forEach((pkg) => {
              if (pkg.lineItemDescriptions) {
                pkg.lineItemDescriptions.forEach((desc) => {
                  if (desc) {
                    descriptionToPackageId.set(desc.trim().toLowerCase(), pkg._id);
                  }
                });
              }
            });

            // Pass 1: Direct sourcePackageId match (best)
            fli.forEach((item) => {
              if (item.sourcePackageId && packageItemsMap.has(item.sourcePackageId as string)) {
                packageItemsMap.get(item.sourcePackageId as string)!.push(item);
                processedItemIds.add(item.id);
              }
            });

            // Pass 2: Description match against package line items
            fli.forEach((item) => {
              if (processedItemIds.has(item.id)) return;
              const descKey = item.description?.trim().toLowerCase();
              if (descKey && descriptionToPackageId.has(descKey)) {
                const matchedPkgId = descriptionToPackageId.get(descKey)!;
                packageItemsMap.get(matchedPkgId)!.push(item);
                processedItemIds.add(item.id);
              }
            });

            // Pass 3: For remaining items, try projectTypeId match
            fli.forEach((item) => {
              if (processedItemIds.has(item.id)) return;
              if (item.projectTypeId) {
                for (const pkg of packages) {
                  if (pkg.projectTypeId && pkg.projectTypeId === item.projectTypeId) {
                    packageItemsMap.get(pkg._id)!.push(item);
                    processedItemIds.add(item.id);
                    break;
                  }
                }
              }
            });

            // Build grouped result
            return packages.map((pkg, pkgIdx) => {
              const pkgItems = packageItemsMap.get(pkg._id) || [];
              return {
                packageId: pkg._id,
                packageName: pkg.name,
                packageIndex: pkgIdx + 1,
                projectTypeName: pkg.projectTypeName,
                items: pkgItems,
                total: pkgItems.reduce(
                  (acc, item) => acc + calculateItemTotal(item),
                  0,
                ),
              };
            }).filter((pg) => pg.items.length > 0);
          })()
        : [];

      // Items not in any package (manual items)
      const manualItems = hasPackages
        ? fli.filter((item) => !processedItemIds.has(item.id))
        : [];

      const comp = companyInfo ||
        dbCompany || {
          name: "PRIMEEDITZ",
          tagline: "Post-Production Excellence",
          address: "Creative Hub, Film City, Mumbai 400065",
          phone: "+91 22 4455 6677",
          email: "studio@primeeditz.com",
        };

      return {
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
        hasPackages,
        groupedByPackage,
        manualItems,
        company: comp as unknown as CompanyInfo,
      };
    }, [quotation, sections, projects, packages, activeSection, companyInfo, dbCompany]);

    // -------------------------------------------------------------------------
    // 2. Render
    // -------------------------------------------------------------------------

    // DEBUG: Remove after fixing
    console.log('[QuotationDocument DEBUG]', {
      packagesReceived: packages.length,
      packages: packages.map(p => ({ _id: p._id, name: p.name })),
      hasPackages,
      groupedByPackageCount: groupedByPackage.length,
      manualItemsCount: manualItems.length,
      totalLineItems: quotation.lineItems.length,
      lineItemSourcePkgIds: quotation.lineItems.map(li => ({ desc: li.description, sourcePackageId: li.sourcePackageId })),
    });

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
            hasPackages={hasPackages}
            groupedByPackage={groupedByPackage}
            manualItems={manualItems}
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
