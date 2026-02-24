/**
 * Project Section Items Component
 *
 * Displays items grouped by project, with sections as sub-groups within each project.
 * This is the new project-based grouping structure for quotation line items.
 */

"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Layers,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project, QuotationLineItem, Section } from "../../types";
import { LineItemsTable } from "./line-items-table";

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Item with original index for tracking */
export interface LineItemWithIdx extends QuotationLineItem {
  originalIdx: number;
}

interface ProjectSectionItemsProps {
  projects: Project[];
  sections: Section[];
  items: LineItemWithIdx[];
  expandedProjects: Set<string>;
  onToggleProject: (projectId: string) => void;
  onEditItem: (item: LineItemWithIdx) => void;
  onUpdateItem: (item: LineItemWithIdx) => void;
  onRemoveItem: (idx: number) => void;
  onAddItem: (projectId: string, sectionId?: string) => void;
  onAddFromLibrary: (projectId: string, sectionId?: string) => void;
}

/** Calculate total for a set of items including sub-items (3 levels) */
const calculateTotal = (items: LineItemWithIdx[]): number => {
  return items.reduce((sum, item) => {
    const itemTotal = item.rate * item.quantity;
    const subItemsTotal = (item.subItems || []).reduce((subSum, sub) => {
      const subSelf = sub.rate * sub.quantity;
      const subSubTotal = (sub.subItems || []).reduce(
        (s, ss) => s + ss.rate * ss.quantity,
        0,
      );
      return subSum + subSelf + subSubTotal;
    }, 0);
    return sum + itemTotal + subItemsTotal;
  }, 0);
};

export function ProjectSectionItems({
  projects,
  sections,
  items,
  expandedProjects,
  onToggleProject,
  onEditItem,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  onAddFromLibrary,
}: ProjectSectionItemsProps) {
  // Group items by project, then by section
  const groupedByProject = useMemo(() => {
    if (!projects) return [];
    return projects.map((project) => {
      const projectItems = items.filter(
        (item) => item.projectId === project._id,
      );

      // Group by section within this project
      const sectionGroups = sections
        .map((section) => ({
          section,
          items: projectItems.filter((item) => item.sectionId === section._id),
        }))
        .filter((group) => group.items.length > 0);

      // Items without section
      const unsectionedItems = projectItems.filter((item) => !item.sectionId);

      return {
        project,
        sectionGroups,
        unsectionedItems,
        totalItems: projectItems.length,
        totalAmount: calculateTotal(projectItems),
      };
    });
  }, [projects, sections, items]);

  // Check if any project has items
  const hasAnyItems = groupedByProject.some((pg) => pg.totalItems > 0);

  if (!projects || projects.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <FolderOpen className="h-8 w-8 text-amber-500/50" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-500 uppercase tracking-widest">
            No Projects Selected
          </p>
          <p className="text-xs text-white/30 font-medium max-w-xs">
            Add at least one project from the &quot;Involved Projects&quot;
            section above before adding line items.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {groupedByProject.map(
          ({
            project,
            sectionGroups,
            unsectionedItems,
            totalItems,
            totalAmount,
          }) => {
            const isExpanded = expandedProjects.has(project._id);

            return (
              <motion.div
                key={project._id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-white/10 bg-white/2 overflow-hidden"
              >
                {/* Project Header */}
                <button
                  type="button"
                  onClick={() => onToggleProject(project._id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-primary" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white uppercase tracking-tight">
                          {project.eventName || project.code}
                        </span>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest px-2 py-0.5 rounded bg-white/5">
                          {project.projectTypeName}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 font-medium">
                        {totalItems} item{totalItems !== 1 ? "s" : ""} •{" "}
                        {sectionGroups.length} section
                        {sectionGroups.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                      Project Total
                    </div>
                    <div className="text-lg font-black text-white">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                </button>

                {/* Project Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-6">
                        {/* Section Groups */}
                        {sectionGroups.map(
                          ({ section, items: sectionItems }) => (
                            <div key={section._id} className="space-y-3">
                              {/* Section Header */}
                              <div className="flex items-center justify-between px-1">
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
                                    {sectionItems.length} Component
                                    {sectionItems.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                    Section Share
                                  </span>
                                  <span className="text-sm font-black text-white">
                                    {formatCurrency(
                                      calculateTotal(sectionItems),
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Section Items Table */}
                              <LineItemsTable
                                items={sectionItems}
                                section={section}
                                onEditItem={onEditItem}
                                onUpdateItem={onUpdateItem}
                                onRemoveItem={onRemoveItem}
                                onAddItem={() =>
                                  onAddItem(project._id, section._id)
                                }
                                onAddFromLibrary={() =>
                                  onAddFromLibrary(project._id, section._id)
                                }
                              />
                            </div>
                          ),
                        )}

                        {/* Unsectioned Items */}
                        {unsectionedItems.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-3">
                                <div className="h-6 px-2.5 rounded-lg flex items-center justify-center border text-[8px] font-black uppercase tracking-widest bg-zinc-500/10 border-zinc-500/20 text-zinc-400">
                                  Uncategorized
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                  {unsectionedItems.length} Component
                                  {unsectionedItems.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                            <LineItemsTable
                              items={unsectionedItems}
                              section={{ _id: "", name: "Uncategorized" }}
                              onEditItem={onEditItem}
                              onUpdateItem={onUpdateItem}
                              onRemoveItem={onRemoveItem}
                              onAddItem={() => onAddItem(project._id)}
                              onAddFromLibrary={() =>
                                onAddFromLibrary(project._id)
                              }
                            />
                          </div>
                        )}

                        {/* Empty State for Project */}
                        {sectionGroups.length === 0 &&
                          unsectionedItems.length === 0 && (
                            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 border border-dashed border-white/10 rounded-xl">
                              <Layers className="h-6 w-6 text-white/10" />
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                                  No Items Yet
                                </p>
                                <p className="text-[10px] text-white/20">
                                  Add items to this project
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onAddFromLibrary(project._id)}
                                  className="h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-white/5 border-white/10 text-white hover:bg-white/10"
                                >
                                  <BookOpen className="h-3 w-3 mr-1.5" />
                                  Library
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onAddItem(project._id)}
                                  className="h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                                >
                                  <Plus className="h-3 w-3 mr-1.5" />
                                  Add First Item
                                </Button>
                              </div>
                            </div>
                          )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          },
        )}
      </AnimatePresence>

      {/* Overall Empty State */}
      {!hasAnyItems && projects && projects.length > 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Layers className="h-8 w-8 text-white/10" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
              Worth is Uncalculated
            </p>
            <p className="text-xs text-white/20 font-medium">
              Add items to your projects to see the architectural breakdown.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
