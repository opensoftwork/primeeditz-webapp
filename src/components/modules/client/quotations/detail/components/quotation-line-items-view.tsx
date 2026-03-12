"use client";

import { FolderOpen, Layers } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface Project {
  _id: string;
  code: string;
  eventName?: string;
  projectTypeName?: string;
}

interface Section {
  _id: string;
  name: string;
  color?: string;
}

interface SectionGroup {
  section: Section;
  items: LineItem[];
}

interface ProjectGroup {
  project: Project;
  sectionGroups: SectionGroup[];
}

interface LineItem {
  id: string;
  description: string;
  rate: number;
  quantity: number;
  unit: string;
  sectionId?: string;
  projectId?: string;
  subItems?: LineItem[];
}

// ============================================================================
// Helpers
// ============================================================================

/** Recursively sum amounts at all nesting levels */
const calculateItemTotal = (item: LineItem): number => {
  const self = item.rate * item.quantity;
  const subTotal =
    item.subItems?.reduce((s, sub) => s + calculateItemTotal(sub), 0) ?? 0;
  return self + subTotal;
};

// ============================================================================
// Component Props
// ============================================================================

interface QuotationLineItemsViewProps {
  groupedByProject?: ProjectGroup[];
  groupedBySection?: SectionGroup[];
  projects?: Project[];
  formatCurrency: (amount: number) => string;
}

export function QuotationLineItemsView({
  groupedByProject = [],
  groupedBySection = [],
  projects = [],
  formatCurrency,
}: QuotationLineItemsViewProps) {
  // Use project-based grouping if we have projects
  const hasProjects = projects.length > 0 && groupedByProject.length > 0;

  // Calculate project total (recursive)
  const calculateProjectTotal = (sectionGroups: SectionGroup[]) => {
    return sectionGroups.reduce((acc, { items }) => {
      return acc + items.reduce((a, item) => a + calculateItemTotal(item), 0);
    }, 0);
  };

  // Render a section with its items
  const renderSection = (section: Section, items: LineItem[]) => (
    <div key={section._id} className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-1.5 h-6 rounded-full",
            section.color === "blue"
              ? "bg-blue-500"
              : section.color === "purple"
                ? "bg-purple-500"
                : section.color === "green"
                  ? "bg-emerald-500"
                  : section.color === "amber"
                    ? "bg-amber-500"
                    : "bg-white/20",
          )}
        />
        <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white flex items-center gap-3">
          <Layers className="h-3.5 w-3.5 text-white/20" />
          {section.name}
        </h3>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="rounded-4xl border border-white/5 bg-white/2 overflow-hidden shadow-2xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="py-4 px-6 text-left text-[9px] font-black uppercase tracking-widest text-white/20 w-14">
                #
              </th>
              <th className="py-4 px-6 text-left text-[9px] font-black uppercase tracking-widest text-white/20">
                Description
              </th>
              <th className="py-4 px-4 text-center text-[9px] font-black uppercase tracking-widest text-white/20 w-24">
                Unit
              </th>
              <th className="py-4 px-4 text-center text-[9px] font-black uppercase tracking-widest text-white/20 w-20">
                Qty
              </th>
              <th className="py-4 px-6 text-right text-[9px] font-black uppercase tracking-widest text-white/20 w-32">
                Rate
              </th>
              <th className="py-4 px-8 text-right text-[9px] font-black uppercase tracking-widest text-white/20 w-40">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/2">
            {items.map((item, idx) => (
              <LineItemRow
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
    </div>
  );

  return (
    <div className="space-y-10">
      {hasProjects ? (
        // Project-based grouping
        <>
          {groupedByProject.map(({ project, sectionGroups }) => (
            <div key={project._id} className="space-y-6">
              {/* Project Header */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-white/3 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      {project.eventName || project.code}
                    </h3>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      {project.projectTypeName}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">
                    Project Total
                  </span>
                  <span className="text-xl font-black text-white">
                    {formatCurrency(calculateProjectTotal(sectionGroups))}
                  </span>
                </div>
              </div>

              {/* Sections within Project */}
              <div className="space-y-8 pl-4 border-l-2 border-white/5">
                {sectionGroups.map(({ section, items }) =>
                  items.length > 0 ? renderSection(section, items) : null,
                )}
              </div>
            </div>
          ))}
        </>
      ) : (
        // Fallback: Section-based grouping
        <>
          {groupedBySection.map(({ section, items }) =>
            items.length > 0 ? renderSection(section, items) : null,
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// Recursive Line Item Row (3-level: 1, 1.1, 1.1.1)
// ============================================================================

function LineItemRow({
  item,
  index,
  level = 0,
  parentNumber = "",
  formatCurrency,
}: {
  item: LineItem;
  index: number;
  level?: number;
  parentNumber?: string;
  formatCurrency: (amount: number) => string;
}) {
  const itemNumber = parentNumber ? `${parentNumber}.${index}` : `${index}`;
  const amount = item.rate * item.quantity;
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <React.Fragment>
      <tr
        className={cn(
          "group transition-colors",
          level === 0
            ? "hover:bg-white/3"
            : level === 1
              ? "bg-black/20 hover:bg-black/30"
              : "bg-black/10 hover:bg-black/20",
        )}
      >
        <td className="py-4 px-6 text-center align-top">
          <span
            className={cn(
              "font-black tabular-nums",
              level === 0
                ? "text-[10px] text-white/20"
                : level === 1
                  ? "text-[9px] text-white/15"
                  : "text-[8px] text-white/10",
            )}
          >
            {itemNumber}
          </span>
        </td>
        <td className="py-4 px-6 align-top">
          <div
            className={cn(
              "text-white transition-colors flex items-center",
              level === 0
                ? "font-bold text-sm"
                : level === 1
                  ? "font-medium text-xs text-white/60 pl-4"
                  : "font-medium text-[11px] text-white/40 pl-8",
            )}
          >
            {level > 0 && (
              <span
                className={cn(
                  "font-black mr-2",
                  level === 1 ? "text-white/10" : "text-white/5",
                )}
              >
                └
              </span>
            )}
            {item.description}
          </div>
        </td>
        <td
          className={cn(
            "py-4 px-4 text-center uppercase tracking-widest align-top",
            level === 0
              ? "text-[10px] font-black text-white/40"
              : level === 1
                ? "text-[9px] font-bold text-white/25"
                : "text-[8px] font-bold text-white/20",
          )}
        >
          {item.unit}
        </td>
        <td
          className={cn(
            "py-4 px-4 text-center font-black align-top",
            level === 0
              ? "text-sm text-white/80"
              : level === 1
                ? "text-xs text-white/50"
                : "text-[11px] text-white/35",
          )}
        >
          {item.quantity}
        </td>
        <td
          className={cn(
            "py-4 px-6 text-right font-medium tabular-nums align-top",
            level === 0
              ? "text-sm text-white/40"
              : level === 1
                ? "text-xs text-white/30"
                : "text-[11px] text-white/20",
          )}
        >
          {formatCurrency(item.rate)}
        </td>
        <td
          className={cn(
            "py-4 px-8 text-right font-black tabular-nums align-top",
            level === 0
              ? "text-sm text-white"
              : level === 1
                ? "text-xs text-white/60"
                : "text-[11px] text-white/40",
          )}
        >
          {formatCurrency(amount)}
        </td>
      </tr>

      {/* Recursive sub-items */}
      {hasSubItems &&
        item.subItems!.map((sub, sIdx) => (
          <LineItemRow
            key={sub.id || `${item.id}-sub-${sIdx}`}
            item={sub}
            index={sIdx + 1}
            level={level + 1}
            parentNumber={itemNumber}
            formatCurrency={formatCurrency}
          />
        ))}
    </React.Fragment>
  );
}
