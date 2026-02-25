"use client";

import { Layers, Package } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import type { Project, QuotationLineItem, QuotationSection } from "../../types";
import { DocumentLineItem } from "./document-line-item";

interface PackageGroup {
  packageId: string;
  packageName: string;
  packageIndex: number;
  projectTypeName?: string;
  items: QuotationLineItem[];
  total: number;
}

interface LineItemsListProps {
  hasProjects: boolean;
  groupedByProject: Array<{
    project: Project;
    sectionGroups: Array<{
      section: QuotationSection;
      items: QuotationLineItem[];
    }>;
    total: number;
  }>;
  groupedBySection: Array<{
    section: QuotationSection;
    items: QuotationLineItem[];
  }>;
  hasPackages?: boolean;
  groupedByPackage?: PackageGroup[];
  manualItems?: QuotationLineItem[];
  formatCurrency: (amount: number) => string;
}

// Reusable table header
function ItemsTableHeader() {
  return (
    <thead>
      <tr className="border-b-2 border-slate-950 bg-slate-50/50">
        <th className="py-3 px-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 w-12">
          #
        </th>
        <th className="py-3 px-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">
          Description
        </th>
        <th className="py-3 px-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 w-16">
          Unit
        </th>
        <th className="py-3 px-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 w-14">
          Qty
        </th>
        <th className="py-3 px-3 text-right text-[9px] font-black uppercase tracking-widest text-slate-400 w-24">
          Rate
        </th>
        <th className="py-3 px-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400 w-28">
          Amount
        </th>
      </tr>
    </thead>
  );
}

export function LineItemsList({
  hasProjects,
  groupedByProject,
  groupedBySection,
  hasPackages = false,
  groupedByPackage = [],
  manualItems = [],
  formatCurrency,
}: LineItemsListProps) {
  // =========================================================================
  // Priority 1: Package-based grouping (P1, P2, etc.)
  // =========================================================================
  if (hasPackages && groupedByPackage.length > 0) {
    return (
      <div className="pt-2 space-y-12">
        {groupedByPackage.map((pkg) => (
          <div
            key={pkg.packageId}
            className="space-y-4 section-container print:mb-8 break-inside-avoid page-break-inside-avoid relative block overflow-visible"
          >
            {/* Package Header */}
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-950">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-black text-[10px]">
                P{pkg.packageIndex}
              </div>
              <div className="flex-1">
                <div className="text-sm font-black uppercase tracking-wide text-slate-900">
                  {pkg.packageName}
                </div>
                {pkg.projectTypeName && (
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {pkg.projectTypeName}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Pkg Estimation
                </div>
                <div className="text-base font-black text-slate-900">
                  {formatCurrency(pkg.total)}
                </div>
              </div>
            </div>

            {/* Package Items Table */}
            <table className="w-full border-collapse">
              <ItemsTableHeader />
              <tbody>
                {pkg.items.map((item, idx) => (
                  <DocumentLineItem
                    key={item.id}
                    item={item}
                    index={idx + 1}
                    level={0}
                    parentNumber=""
                    formatCurrency={formatCurrency}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Manual Items (not part of any package) */}
        {manualItems.length > 0 && (
          <div className="space-y-4 section-container print:mb-8 break-inside-avoid page-break-inside-avoid relative block overflow-visible">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-black uppercase tracking-wide text-slate-600">
                  Additional Items
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Manual entries
                </div>
              </div>
            </div>

            <table className="w-full border-collapse">
              <ItemsTableHeader />
              <tbody>
                {manualItems.map((item, idx) => (
                  <DocumentLineItem
                    key={item.id}
                    item={item}
                    index={idx + 1}
                    level={0}
                    parentNumber=""
                    formatCurrency={formatCurrency}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // Priority 2: Project-based grouping
  // =========================================================================
  if (hasProjects && groupedByProject.length > 0) {
    return (
      <div className="pt-2 space-y-12">
        {groupedByProject.map(({ project, sectionGroups, total }) => (
          <div
            key={project._id}
            className="space-y-6 project-container print:mb-10 break-inside-avoid page-break-inside-avoid relative block overflow-visible"
          >
            {/* Project Header */}
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-950">
              <div className="w-2 h-6 bg-slate-950 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-black uppercase tracking-wide text-slate-900">
                  {project.eventName || project.code}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {project.projectTypeName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Project Total
                </div>
                <div className="text-base font-black text-slate-900">
                  {formatCurrency(total)}
                </div>
              </div>
            </div>

            {/* Section Groups within Project */}
            {sectionGroups.map(({ section, items }) => (
              <div
                key={section._id}
                className="space-y-3 section-container print:mb-6 pl-4 break-inside-avoid page-break-inside-avoid relative block overflow-visible"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-1.5 h-4 rounded-full",
                      section.color === "blue"
                        ? "bg-blue-500"
                        : section.color === "purple"
                          ? "bg-purple-500"
                          : section.color === "green"
                            ? "bg-emerald-500"
                            : section.color === "amber"
                              ? "bg-amber-500"
                              : "bg-slate-400",
                    )}
                  />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <Layers className="w-3 h-3 text-slate-400" />
                    {section.name}
                  </div>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50/50">
                      <th className="py-2.5 px-2 text-center text-[8px] font-black uppercase tracking-widest text-slate-400 w-10">
                        #
                      </th>
                      <th className="py-2.5 px-3 text-left text-[8px] font-black uppercase tracking-widest text-slate-400">
                        Description
                      </th>
                      <th className="py-2.5 px-2 text-center text-[8px] font-black uppercase tracking-widest text-slate-400 w-14">
                        Unit
                      </th>
                      <th className="py-2.5 px-2 text-center text-[8px] font-black uppercase tracking-widest text-slate-400 w-12">
                        Qty
                      </th>
                      <th className="py-2.5 px-2 text-right text-[8px] font-black uppercase tracking-widest text-slate-400 w-20">
                        Rate
                      </th>
                      <th className="py-2.5 px-3 text-right text-[8px] font-black uppercase tracking-widest text-slate-400 w-24">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <DocumentLineItem
                        key={item.id}
                        item={item}
                        index={idx + 1}
                        level={0}
                        parentNumber=""
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // =========================================================================
  // Priority 3: Section-based grouping (fallback)
  // =========================================================================
  return (
    <div className="pt-2 space-y-10">
      {groupedBySection.map(
        ({ section, items }) =>
          items.length > 0 && (
            <div
              key={section._id}
              className="space-y-3 section-container print:mb-8 break-inside-avoid page-break-inside-avoid relative block overflow-visible"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-1.5 h-5 rounded-full",
                    section.color === "blue"
                      ? "bg-blue-500"
                      : section.color === "purple"
                        ? "bg-purple-500"
                        : section.color === "green"
                          ? "bg-emerald-500"
                          : section.color === "amber"
                            ? "bg-amber-500"
                            : "bg-slate-950",
                  )}
                />
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 flex items-center gap-3">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {section.name}
                </div>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <table className="w-full border-collapse">
                <ItemsTableHeader />
                <tbody>
                  {items.map((item, idx) => (
                    <DocumentLineItem
                      key={item.id}
                      item={item}
                      index={idx + 1}
                      level={0}
                      parentNumber=""
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ),
      )}
    </div>
  );
}
