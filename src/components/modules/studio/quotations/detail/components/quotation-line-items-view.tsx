/**
 * Studio Quotation Line Items View
 *
 * Professional table-based display of quotation items for Studios.
 * Supports hierarchical grouping and nested sub-items (read-only).
 */

"use client";

import React from "react";
import { Folders } from "lucide-react";
import { cn } from "@/lib/utils";

interface LineItem {
  id: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  subItems?: any[];
}

interface SectionGroup {
  section: { _id: string; name: string; color?: string };
  items: LineItem[];
}

interface ProjectGroup {
  project: {
    _id: string;
    eventName?: string;
    code: string;
    projectTypeName?: string;
  };
  sectionGroups: SectionGroup[];
}

interface QuotationLineItemsViewProps {
  groupedByProject: ProjectGroup[];
  groupedBySection: SectionGroup[];
  projects: any[];
  formatCurrency: (amount: number) => string;
}

export function QuotationLineItemsView({
  groupedByProject,
  groupedBySection,
  formatCurrency,
}: QuotationLineItemsViewProps) {
  const standaloneSections = groupedBySection.filter(
    (s) =>
      !groupedByProject.some((p) =>
        p.sectionGroups.some((ps) => ps.section._id === s.section._id),
      ),
  );

  return (
    <div className="space-y-10">
      {groupedByProject.map((pg) => (
        <div key={pg.project._id} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Folders className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {pg.project.eventName || pg.project.code}
              </h3>
              <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-[0.2em]">
                {pg.project.projectTypeName || "Project Services"}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {pg.sectionGroups.map((sg) => (
              <div
                key={sg.section._id}
                className="space-y-3 pl-4 border-l border-white/5 ml-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-1.5 h-4 rounded-full",
                      sg.section.color === "blue"
                        ? "bg-blue-400"
                        : sg.section.color === "purple"
                          ? "bg-purple-400"
                          : sg.section.color === "green"
                            ? "bg-emerald-400"
                            : sg.section.color === "amber"
                              ? "bg-amber-400"
                              : sg.section.color === "red"
                                ? "bg-red-400"
                                : "bg-zinc-400",
                    )}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {sg.section.name}
                  </span>
                </div>

                <StudioItemsTable
                  items={sg.items}
                  formatCurrency={formatCurrency}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {standaloneSections.length > 0 && (
        <div className="space-y-6">
          {standaloneSections.map((sg) => (
            <div key={sg.section._id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  {sg.section.name}
                </span>
              </div>
              <StudioItemsTable
                items={sg.items}
                formatCurrency={formatCurrency}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudioItemsTable({
  items,
  formatCurrency,
}: {
  items: any[];
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="w-full bg-white/2 rounded-2xl border border-white/5 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/10 text-left">
            <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30 w-12 text-center">
              #
            </th>
            <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30">
              Description
            </th>
            <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-center w-24">
              Unit
            </th>
            <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-center w-20">
              Qty
            </th>
            <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-right w-28">
              Rate
            </th>
            <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-right w-32">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
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
  );
}

function LineItemRow({
  item,
  index,
  level = 0,
  parentNumber = "",
  formatCurrency,
}: {
  item: any;
  index: number;
  level: number;
  parentNumber: string;
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
              ? "bg-white/1 hover:bg-white/2"
              : "bg-white/0.5 hover:bg-white/1",
        )}
      >
        <td className="py-3.5 px-4 text-center align-top">
          <span
            className={cn(
              "font-black tabular-nums transition-colors",
              level === 0
                ? "text-[10px] text-white/30 group-hover:text-white/50"
                : level === 1
                  ? "text-[9px] text-white/10"
                  : "text-[8px] text-white/5",
            )}
          >
            {itemNumber}
          </span>
        </td>
        <td className="py-3.5 px-4 align-top">
          <div
            className={cn(
              "flex items-center",
              level === 0
                ? "text-[13px] font-bold text-white/90"
                : level === 1
                  ? "text-[12px] font-bold text-white/60 pl-3"
                  : "text-[11px] font-medium text-white/40 pl-6 italic",
            )}
          >
            {level > 0 && (
              <span className="text-white/10 font-light mr-2">└</span>
            )}
            {item.description}
          </div>
        </td>
        <td
          className={cn(
            "py-3.5 px-4 text-center uppercase tracking-tighter align-top",
            level === 0
              ? "text-[11px] font-bold text-white/40"
              : level === 1
                ? "text-[10px] text-white/20"
                : "text-[9px] text-white/10",
          )}
        >
          {item.unit}
        </td>
        <td
          className={cn(
            "py-3.5 px-4 text-center align-top",
            level === 0
              ? "text-[11px] font-bold text-white/40"
              : level === 1
                ? "text-[10px] text-white/20"
                : "text-[9px] text-white/10",
          )}
        >
          {item.quantity}
        </td>
        <td
          className={cn(
            "py-3.5 px-4 text-right font-mono align-top",
            level === 0
              ? "text-[11px] font-bold text-white/40"
              : level === 1
                ? "text-[10px] text-white/20"
                : "text-[9px] text-white/10",
          )}
        >
          {formatCurrency(item.rate)}
        </td>
        <td
          className={cn(
            "py-3.5 px-4 text-right font-mono align-top",
            level === 0
              ? "text-[13px] font-black text-white"
              : level === 1
                ? "text-[12px] font-bold text-white/40"
                : "text-[11px] font-medium text-white/20",
          )}
        >
          {formatCurrency(amount)}
        </td>
      </tr>

      {/* Recursive Sub-Items */}
      {hasSubItems &&
        item.subItems.map((sub: any, sIdx: number) => (
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
