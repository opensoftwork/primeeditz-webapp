"use client";

import { FolderOpen } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";

interface Project {
  _id: string;
  code: string;
  eventName?: string;
  projectTypeName?: string;
}

interface SectionGroup {
  section: any;
  items: any[];
}

interface ProjectGroup {
  project: Project;
  sectionGroups: SectionGroup[];
}

interface LineItemsSectionProps {
  groupedByProject?: ProjectGroup[];
  groupedBySection?: SectionGroup[];
  projects?: Project[];
  formatCurrency: (amount: number) => string;
}

export function LineItemsSection({
  groupedByProject = [],
  groupedBySection = [],
  projects = [],
  formatCurrency,
}: LineItemsSectionProps) {
  // Use project-based grouping if we have projects
  const hasProjects = projects.length > 0 && groupedByProject.length > 0;

  // Calculate project total
  const calculateProjectTotal = (sectionGroups: SectionGroup[]) => {
    return sectionGroups.reduce((acc, { items }) => {
      return (
        acc +
        items.reduce(
          (itemAcc: number, item: any) =>
            itemAcc +
            item.rate * item.quantity +
            (item.subItems?.reduce(
              (s: number, sub: any) => s + sub.rate * sub.quantity,
              0,
            ) ?? 0),
          0,
        )
      );
    }, 0);
  };

  // Render a section with its items
  const renderSection = (section: any, items: any[], isNested = false) => (
    <div
      key={section._id}
      className={cn(
        "rounded-2xl bg-white/2 border border-white/5 overflow-hidden",
        isNested && "ml-0",
      )}
    >
      {/* Section Header */}
      <div className="px-5 py-4 bg-white/2 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-6 px-2.5 rounded-lg flex items-center justify-center border text-[8px] font-black uppercase tracking-widest",
              section.color === "blue"
                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                : section.color === "purple"
                  ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                  : section.color === "green"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : section.color === "amber"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : section.color === "red"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
            )}
          >
            {section.name}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
            {items.length} Component{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
            Section Aggregate
          </span>
          <span className="text-sm font-black text-white">
            {formatCurrency(
              items.reduce(
                (acc: number, item: any) =>
                  acc +
                  item.rate * item.quantity +
                  (item.subItems?.reduce(
                    (s: number, sub: any) => s + sub.rate * sub.quantity,
                    0,
                  ) ?? 0),
                0,
              ),
            )}
          </span>
        </div>
      </div>

      {/* Items Architecture */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-[9px] font-black uppercase tracking-widest text-white/20 px-5 py-3">
                Description & Architecture
              </th>
              <th className="text-center text-[9px] font-black uppercase tracking-widest text-white/20 px-3 py-3 w-20">
                Unit
              </th>
              <th className="text-right text-[9px] font-black uppercase tracking-widest text-white/20 px-3 py-3 w-24">
                Rate
              </th>
              <th className="text-center text-[9px] font-black uppercase tracking-widest text-white/20 px-3 py-3 w-16">
                Qty
              </th>
              <th className="text-right text-[9px] font-black uppercase tracking-widest text-white/20 px-5 py-3 w-28">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/2">
            {items.map((item: any) => (
              <React.Fragment key={item.id}>
                {/* Main Item Row */}
                <tr className="group hover:bg-white/1 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-white tracking-tight">
                        {item.description || "Untitled Component"}
                      </span>
                      {item.subItems?.length > 0 && (
                        <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">
                          Includes {item.subItems.length} Sub-elements
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-center text-[9px] font-black text-white/30 uppercase tracking-widest">
                    {item.unit}
                  </td>
                  <td className="px-3 py-3.5 text-right text-xs font-mono font-bold text-white/60">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="px-3 py-3.5 text-center text-xs font-bold text-white/60">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-black text-white">
                    {formatCurrency(item.rate * item.quantity)}
                  </td>
                </tr>

                {/* Sub-items Breakdown */}
                {item.subItems?.map((sub: any, sIdx: number) => (
                  <tr
                    key={`${item.id}-sub-${sIdx}`}
                    className="bg-white/1 border-b border-white/2 last:border-b-0"
                  >
                    <td className="px-5 py-2.5 pl-10">
                      <div className="flex items-center gap-2">
                        <div className="h-px w-3 bg-white/10" />
                        <span className="text-xs font-medium text-white/40">
                          {sub.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-[8px] font-bold text-white/20 uppercase">
                      {sub.unit}
                    </td>
                    <td className="px-3 py-2.5 text-right text-[10px] font-mono text-white/30">
                      {formatCurrency(sub.rate)}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[10px] font-bold text-white/30">
                      {sub.quantity}
                    </td>
                    <td className="px-5 py-2.5 text-right text-xs font-bold text-white/50">
                      {formatCurrency(sub.rate * sub.quantity)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-8"
    >
      {hasProjects ? (
        // Project-based grouping
        <>
          {groupedByProject.map(({ project, sectionGroups }) => (
            <div key={project._id} className="space-y-4">
              {/* Project Header */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">
                        {project.eventName || "General Project"}
                      </h3>
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">
                        {project.code}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                      {project.projectTypeName}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">
                    Project Total
                  </span>
                  <span className="text-lg font-black text-white">
                    {formatCurrency(calculateProjectTotal(sectionGroups))}
                  </span>
                </div>
              </div>

              {/* Sections within Project */}
              <div className="space-y-4 pl-4 border-l-2 border-white/5">
                {sectionGroups.map(({ section, items }) =>
                  items.length > 0 ? renderSection(section, items, true) : null,
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
    </motion.div>
  );
}
