/**
 * Project Section Items Component
 *
 * Displays items grouped by project, with sections as sub-groups within each project.
 * Falls back to package-based grouping when items have no projectId (e.g., from packages).
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  Project,
  QuotationLineItem,
  Section,
  Template,
} from "../../types";
import { LineItemsTable } from "./line-items-table";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

// Currency formatter
const formatCurrency = (amount: number): string => {
  if (amount === 0) return "-";
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
  templates?: Template[];
  packageIds?: string[];
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

/** Get section color classes */
const getSectionColorClasses = (color?: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    case "purple":
      return "bg-purple-500/10 border-purple-500/20 text-purple-400";
    case "green":
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    case "amber":
      return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    case "red":
      return "bg-red-500/10 border-red-500/20 text-red-400";
    default:
      return "bg-zinc-500/10 border-zinc-500/20 text-zinc-400";
  }
};

interface PackageGroup {
  packageId: string;
  packageName: string;
  projectTypeName?: string;
  items: LineItemWithIdx[];
  totalAmount: number;
}

export function ProjectSectionItems({
  projects,
  sections,
  items,
  templates,
  packageIds,
  expandedProjects,
  onToggleProject,
  onEditItem,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  onAddFromLibrary,
}: ProjectSectionItemsProps) {
  //@ts-ignore
  const projectTypes = useQuery(api.functions.projectTypes.queries.getActiveProjectTypes);

  // Separate items: assigned to a project vs unassigned (no projectId)
  const { assignedItems, unassignedItems } = useMemo(() => {
    const assigned: LineItemWithIdx[] = [];
    const unassigned: LineItemWithIdx[] = [];
    items.forEach((item) => {
      if (item.projectId) {
        assigned.push(item);
      } else {
        unassigned.push(item);
      }
    });
    return { assignedItems: assigned, unassignedItems: unassigned };
  }, [items]);

  // Group assigned items by project, then by section
  const groupedByProject = useMemo(() => {
    if (!projects) return [];
    return projects
      .map((project) => {
        const projectItems = assignedItems.filter(
          (item) => item.projectId === project._id,
        );

        const sectionGroups = sections
          .map((section) => ({
            section,
            items: projectItems.filter(
              (item) => item.sectionId === section._id,
            ),
          }))
          .filter((group) => group.items.length > 0);

        const unsectionedItems = projectItems.filter(
          (item) => !item.sectionId,
        );

        return {
          project,
          sectionGroups,
          unsectionedItems,
          totalItems: projectItems.length,
          totalAmount: calculateTotal(projectItems),
        };
      })
      .filter((pg) => pg.totalItems > 0);
  }, [projects, sections, assignedItems]);

  // Group unassigned items by SOURCE PACKAGE (matching studio-side UX)
  const groupedByPackage = useMemo(() => {
    // If no packageIds provided, fall back to grouping items by their sourcePackageId
    if (!packageIds || packageIds.length === 0) {
      if (unassignedItems.length === 0) return [];
      
      const packageMap = new Map<
        string,
        { template: Template | undefined; items: LineItemWithIdx[] }
      >();

      unassignedItems.forEach((item) => {
        const pkgId = (item.sourcePackageId as string) || "__no_package__";
        if (!packageMap.has(pkgId)) {
          const tmpl = templates?.find((t) => t._id === pkgId);
          packageMap.set(pkgId, { template: tmpl, items: [] });
        }
        packageMap.get(pkgId)!.items.push(item);
      });

      return Array.from(packageMap.entries()).map(
        ([pkgId, { template, items: pkgItems }]) => {
          const projectTypeId = template?.projectTypeId || pkgItems[0]?.projectTypeId;
          const projectType = projectTypes?.find((t) => t._id === projectTypeId);

          return {
            packageId: pkgId,
            packageName: template?.name || (projectType ? `${projectType.name} Package` : "Manual Items"),
            projectTypeName: projectType?.name,
            items: pkgItems,
            totalAmount: calculateTotal(pkgItems),
          } as PackageGroup;
        },
      );
    }

    // Strategy: Show a section for EVERY selected package.
    // Match items to packages using multiple strategies:
    // 1. Direct sourcePackageId match (best)
    // 2. Description match against template lineItems (fallback for items without sourcePackageId)
    // 3. projectTypeId match (last resort)

    const uniqueSelectedIds = Array.from(new Set(packageIds));
    const processedItemIds = new Set<string>();

    // Build a description-to-packageId lookup from templates for fallback matching
    const descriptionToPackageId = new Map<string, string>();
    uniqueSelectedIds.forEach((pkgId) => {
      const template = templates?.find(t => t._id === pkgId);
      if (template?.lineItems) {
        template.lineItems.forEach((li) => {
          if (li.description) {
            descriptionToPackageId.set(li.description.trim().toLowerCase(), pkgId);
          }
        });
      }
    });

    // First pass: assign items to packages
    const packageItemsMap = new Map<string, LineItemWithIdx[]>();
    uniqueSelectedIds.forEach(pkgId => packageItemsMap.set(pkgId, []));

    // Pass 1: Direct sourcePackageId match
    unassignedItems.forEach((item) => {
      const spId = item.sourcePackageId as string;
      if (spId && packageItemsMap.has(spId)) {
        packageItemsMap.get(spId)!.push(item);
        processedItemIds.add(item.id);
      }
    });

    // Pass 2: For remaining items, try description match against template lineItems
    unassignedItems.forEach((item) => {
      if (processedItemIds.has(item.id)) return;
      const descKey = item.description?.trim().toLowerCase();
      if (descKey && descriptionToPackageId.has(descKey)) {
        const matchedPkgId = descriptionToPackageId.get(descKey)!;
        packageItemsMap.get(matchedPkgId)!.push(item);
        processedItemIds.add(item.id);
      }
    });

    // Pass 3: For still-remaining items, try projectTypeId match
    unassignedItems.forEach((item) => {
      if (processedItemIds.has(item.id)) return;
      if (item.projectTypeId) {
        // Find a selected package whose template has this projectTypeId
        for (const pkgId of uniqueSelectedIds) {
          const template = templates?.find(t => t._id === pkgId);
          if (
            template &&
            (template.projectTypeId === item.projectTypeId ||
              template.projectConfigs?.some(c => c.projectTypeId === item.projectTypeId))
          ) {
            packageItemsMap.get(pkgId)!.push(item);
            processedItemIds.add(item.id);
            break;
          }
        }
      }
    });

    // Build result from collected data
    const result: PackageGroup[] = [];
    uniqueSelectedIds.forEach((pkgId) => {
      const template = templates?.find(t => t._id === pkgId);
      const pkgItems = packageItemsMap.get(pkgId)!;

      // Always show the package section if it was selected (even if 0 items — user selected it)
      const projectTypeId = template?.projectTypeId || pkgItems[0]?.projectTypeId;
      const projectType = projectTypes?.find((t) => t._id === projectTypeId);

      result.push({
        packageId: pkgId,
        packageName: template?.name || (projectType ? `${projectType.name} Package` : "Package"),
        projectTypeName: projectType?.name,
        items: pkgItems,
        totalAmount: calculateTotal(pkgItems),
      });
    });

    // Collect truly manual remaining items
    const manualItems = unassignedItems.filter(item => !processedItemIds.has(item.id));
    if (manualItems.length > 0) {
      result.push({
        packageId: "__no_package__",
        packageName: "Manual Items",
        projectTypeName: undefined,
        items: manualItems,
        totalAmount: calculateTotal(manualItems),
      });
    }

    return result;
  }, [unassignedItems, templates, projectTypes, packageIds]);

  // Check if there's anything to display
  const hasProjectItems = groupedByProject.length > 0;
  const hasPackageItems = groupedByPackage.length > 0;
  const hasAnyItems = hasProjectItems || hasPackageItems;

  // True empty: no items at all AND no projects
  if (!hasAnyItems && (!projects || projects.length === 0)) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <FolderOpen className="h-8 w-8 text-amber-500/50" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-500 uppercase tracking-widest">
            No Items Added
          </p>
          <p className="text-xs text-white/30 font-medium max-w-xs">
            Select a service package or add line items to build your quotation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* Package-Grouped Items (from package selection — no project yet)  */}
      {/* ================================================================ */}
      {hasPackageItems &&
        groupedByPackage.map(
          ({ packageId, packageName, projectTypeName, items: pkgItems, totalAmount }, idx) => {
            const isExpanded = expandedProjects.has(packageId);

            return (
              <motion.div
                key={packageId}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[2rem] border border-white/5 bg-white/1 overflow-hidden"
              >
                {/* Package Header (Directly from Studio style) */}
                <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-4">
                     <button
                      type="button"
                      onClick={() => onToggleProject(packageId)}
                      className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_12px_rgba(var(--primary),0.1)] hover:bg-primary/20 transition-colors"
                    >
                      <span className="text-[11px] font-black text-primary uppercase">
                        P{idx + 1}
                      </span>
                    </button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                          {packageName}
                        </h4>
                        {projectTypeName && (
                          <Badge
                            variant="outline"
                            className="bg-primary/5 border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest px-1.5 py-0 h-3.5"
                          >
                            {projectTypeName}
                          </Badge>
                        )}
                        <button 
                          onClick={() => onToggleProject(packageId)}
                          className="text-white/20 hover:text-white/40 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-0.5">
                        {pkgItems.length} Component{pkgItems.length !== 1 ? "s" : ""} included
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 block mb-0.5">
                      Pkg Estimation
                    </span>
                    <span className="text-lg font-black text-white tracking-tight">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Package Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 space-y-6">
                        {/* Group by section within this package */}
                        {sections
                          .map((section) => ({
                            section,
                            items: pkgItems.filter(
                              (item) => item.sectionId === section._id,
                            ),
                          }))
                          .filter((g) => g.items.length > 0)
                          .map(({ section, items: secItems }) => (
                            <div key={section._id} className="space-y-3">
                              <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "h-6 px-2.5 rounded-lg flex items-center justify-center border text-[8px] font-black uppercase tracking-widest",
                                      getSectionColorClasses(section.color),
                                    )}
                                  >
                                    {section.name}
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                    {secItems.length} item{secItems.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                    Section Subtotal
                                  </span>
                                  <span className="text-sm font-black text-white">
                                    {formatCurrency(calculateTotal(secItems))}
                                  </span>
                                </div>
                              </div>
                              <LineItemsTable
                                items={secItems}
                                section={section}
                                onEditItem={onEditItem}
                                onUpdateItem={onUpdateItem}
                                onRemoveItem={onRemoveItem}
                                onAddItem={() =>
                                  onAddItem(packageId, section._id)
                                }
                                onAddFromLibrary={() =>
                                  onAddFromLibrary(packageId, section._id)
                                }
                              />
                            </div>
                          ))}

                        {/* Items without section within this package */}
                        {pkgItems.filter((item) => !item.sectionId).length > 0 && (
                          <div className="space-y-3">
                            {/* Only show header if there are other sections to differentiate from */}
                            {sections.some(s => pkgItems.some(item => item.sectionId === s._id)) && (
                              <div className="flex items-center gap-3 px-1">
                                <div className="h-6 px-2.5 rounded-lg flex items-center justify-center border text-[8px] font-black uppercase tracking-widest bg-zinc-500/10 border-zinc-500/20 text-zinc-400">
                                  Uncategorized
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                  {pkgItems.filter((item) => !item.sectionId).length} items
                                </span>
                              </div>
                            )}
                            <LineItemsTable
                              items={pkgItems.filter((item) => !item.sectionId)}
                              section={{ _id: "", name: "Uncategorized" }}
                              onEditItem={onEditItem}
                              onUpdateItem={onUpdateItem}
                              onRemoveItem={onRemoveItem}
                              onAddItem={() => onAddItem(packageId)}
                              onAddFromLibrary={() => onAddFromLibrary(packageId)}
                            />
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

      {/* ================================================================ */}
      {/* Project-Grouped Items — Collapsible project cards                */}
      {/* ================================================================ */}
      {hasProjectItems && (
        <div className="space-y-4">
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
                    className="rounded-[2rem] border border-white/5 bg-white/2 overflow-hidden"
                  >
                    {/* Project Header */}
                    <div className="p-4 flex items-center justify-between bg-white/5 border-b border-white/5">
                       <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => onToggleProject(project._id)}
                            className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_12px_rgba(var(--primary),0.1)] hover:bg-primary/20 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-primary" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-primary" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                                {project.eventName || project.code}
                              </h4>
                              {project.projectTypeName && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary/5 border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest px-1.5 py-0 h-3.5"
                                >
                                  {project.projectTypeName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-0.5">
                              Associated Project • {totalItems} component{totalItems !== 1 ? "s" : ""}
                            </p>
                          </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block mb-0.5">
                          Project Value
                        </div>
                        <div className="text-lg font-black text-white tracking-tight">
                          {formatCurrency(totalAmount)}
                        </div>
                      </div>
                    </div>

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
                          <div className="p-5 space-y-6">
                            {/* Section Groups */}
                            {sectionGroups.map(
                              ({ section, items: sectionItems }) => (
                                <div key={section._id} className="space-y-3">
                                  <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          "h-6 px-2.5 rounded-lg flex items-center justify-center border text-[8px] font-black uppercase tracking-widest",
                                          getSectionColorClasses(section.color),
                                        )}
                                      >
                                        {section.name}
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                        {sectionItems.length} item{sectionItems.length !== 1 ? "s" : ""}
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
                                {/* Only show header if there are other sections to differentiate from */}
                                {sectionGroups.length > 0 && (
                                  <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-3">
                                      <div className="h-6 px-2.5 rounded-lg flex items-center justify-center border text-[8px] font-black uppercase tracking-widest bg-zinc-500/10 border-zinc-500/20 text-zinc-400">
                                        Uncategorized
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                        {unsectionedItems.length} items
                                      </span>
                                    </div>
                                  </div>
                                )}
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
                                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 border border-dashed border-white/10 rounded-[2rem]">
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
                                      onClick={() =>
                                        onAddFromLibrary(project._id)
                                      }
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
                                      Add Item
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
        </div>
      )}

      {/* Overall Empty State — projects exist but no items at all */}
      {!hasAnyItems && (projects && projects.length > 0) && (
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
