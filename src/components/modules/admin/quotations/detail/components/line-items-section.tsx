/**
 * Line Items Section (Admin Detail View)
 *
 * Displays quotation line items grouped by project and section.
 * Uses the professional table format with support for recursive sub-items.
 */

"use client";

import React from "react";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineItemRow } from "./line-item-table-row";

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

interface LineItemsSectionProps {
  groupedByProject: ProjectGroup[];
  groupedBySection: SectionGroup[];
  projects: any[];
  formatCurrency: (amount: number) => string;
}

export function LineItemsSection({
  groupedByProject,
  groupedBySection,
  formatCurrency,
}: LineItemsSectionProps) {
  // Flattened view for sections that aren't tied to an active project in the group
  const standaloneSections = groupedBySection.filter(
    (s) =>
      !groupedByProject.some((p) =>
        p.sectionGroups.some((ps) => ps.section._id === s.section._id),
      ),
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Layers className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-black tracking-tight uppercase text-white">
          Line Items
        </h2>
      </div>

      {/* Projects with their sections and items */}
      {groupedByProject.map((pg) => (
        <div key={pg.project._id} className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {pg.project.eventName}
              </h3>
              <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">
                PROJECT {pg.project.code}{" "}
                {pg.project.projectTypeName &&
                  `• ${pg.project.projectTypeName}`}
              </p>
            </div>
          </div>

          <div className="space-y-8 pl-4 border-l border-white/5 ml-4">
            {pg.sectionGroups.map((sg) => (
              <div key={sg.section._id} className="space-y-4">
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

                <ReadOnlyItemsTable
                  items={sg.items}
                  formatCurrency={formatCurrency}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Standalone sections or global items */}
      {standaloneSections.length > 0 && (
        <div className="space-y-8">
          {standaloneSections.map((sg) => (
            <div key={sg.section._id} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  {sg.section.name}
                </span>
              </div>
              <ReadOnlyItemsTable
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

function ReadOnlyItemsTable({
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
              formatCurrency={formatCurrency}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
