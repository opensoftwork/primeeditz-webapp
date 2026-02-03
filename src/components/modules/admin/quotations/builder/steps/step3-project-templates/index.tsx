/**
 * Quotation Builder Step 3: Project & Folder Template Selection
 *
 * Combined step for selecting projects and their folder templates.
 */

"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Check,
  ChevronDown,
  FolderOpen,
  FolderTree,
  Layers,
  Package as PackageIcon,
  Receipt,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuotationBuilder } from "../../quotation-builder-context";
import type { Project } from "../../types";

interface FolderTemplate {
  _id: Id<"folderTemplates">;
  name: string;
  variant?: string;
  projectTypeId: Id<"projectTypes">;
  folders: any[];
}

export function Step3ProjectTemplates() {
  const {
    formData,
    setFormData,
    projects,
    templates,
    nextStep,
    setSubmitTrigger,
    selectedStudio,
    applyPackageItems,
  } = useQuotationBuilder();

  // Selected project IDs and templates from step 3
  const selectedProjectIds = formData.step3.projectIds;
  const projectFolderTemplates = formData.step3.projectTemplates;

  // Folder templates query
  const folderTemplatesQuery = useQuery(
    api.functions.folderTemplates.queries.getFolderTemplates,
    { activeOnly: true },
  );
  const folderTemplates = (folderTemplatesQuery as FolderTemplate[]) || [];

  // Project types query
  const projectTypesQuery = useQuery(
    api.functions.projectTypes.queries.getActiveProjectTypes,
  );
  const projectTypes = projectTypesQuery || [];

  // Get packages to apply if selected in step 2
  const packageQuery = useQuery(
    api.functions.quotations.templates.queries.getPackages,
    { activeOnly: true },
  );
  const selectedPackages =
    packageQuery?.filter((p) => formData.step2.packageIds.includes(p._id)) ||
    [];

  // Auto-apply package templates when projects change or package changes
  useEffect(() => {
    if (selectedPackages.length > 0 && selectedProjectIds.length > 0) {
      const newTemplates = { ...projectFolderTemplates };
      let changed = false;

      selectedProjectIds.forEach((projectId) => {
        const project = (projects as Project[])?.find(
          (p) => p._id === projectId,
        );
        if (project && !newTemplates[projectId]) {
          // Find configuration for this project type in any of the selected packages
          for (const pkg of selectedPackages) {
            const config = pkg.projectConfigs?.find(
              (c) => c.projectTypeId === project.projectTypeId,
            );
            if (config?.folderTemplateId) {
              newTemplates[projectId] = config.folderTemplateId;
              changed = true;
              break;
            }
          }
        }
      });

      if (changed) {
        setFormData("step3", { projectTemplates: newTemplates });
      }
    }
  }, [selectedPackages, selectedProjectIds, projects, setFormData]);

  // Sync package items to line items state
  useEffect(() => {
    if (selectedPackages.length > 0) {
      applyPackageItems();
    }
  }, [selectedPackages, selectedProjectIds, applyPackageItems]);

  // Calculate package items summary
  const packageSummary = useMemo(() => {
    const allItems: any[] = [];
    const allProjectConfigs: any[] = [];
    let subtotal = 0;

    selectedPackages.forEach((pkg) => {
      // Items
      pkg.lineItems.forEach((item) => {
        allItems.push(item);
        subtotal += (item.rate || 0) * (item.quantity || 1);
        if (item.subItems) {
          item.subItems.forEach((si: any) => {
            subtotal += (si.amount || 0) * 1;
          });
        }
      });

      // Project Configs - Fetch names for the summary
      if (pkg.projectConfigs) {
        pkg.projectConfigs.forEach((config) => {
          const pt = (projectTypes as any[])?.find(
            (t) => t._id === config.projectTypeId,
          );
          const ft = folderTemplates.find(
            (t) => t._id === config.folderTemplateId,
          );
          allProjectConfigs.push({
            ...config,
            projectTypeName: pt?.name || "Unknown Type",
            folderTemplateName: ft?.name || "Standard Structure",
            folderTemplateId: ft?._id,
            packageName: pkg.name,
            folders: ft?.folders || [],
          });
        });
      }
    });

    return { allItems, subtotal, allProjectConfigs };
  }, [selectedPackages, projectTypes, folderTemplates]);

  // Handle next step
  const handleNext = () => {
    nextStep();
  };

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(handleNext);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger, nextStep]);

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight uppercase text-white">
              Project & Templates
            </h2>
            <p className="text-sm text-white/40 font-medium">
              Projects and folder templates required for your selected packages
            </p>
          </div>
        </div>

        {/* Unified Projects List (Requirements from Packages) */}
     

        {/* Package Items Summary */}
        {selectedPackages.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">
                Package Selection Details
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Configs Column */}
              <div className="lg:col-span-1 p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Project Requirements
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[8px] font-black uppercase tracking-widest bg-blue-500/10 border-blue-500/20 text-blue-400"
                  >
                    {packageSummary.allProjectConfigs.length} Types
                  </Badge>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {packageSummary.allProjectConfigs.map((config, idx) => (
                    <ProjectRequirementCardSmall key={idx} config={config} />
                  ))}
                  {packageSummary.allProjectConfigs.length === 0 && (
                    <p className="text-[10px] text-white/20 italic text-center py-4">
                      No specific project types required for these packages
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Included Services & Pricing
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[8px] font-black uppercase tracking-widest bg-primary/10 border-primary/20 text-primary"
                    >
                      {packageSummary.allItems.length} Line Items
                    </Badge>
                  </div>

                  <div className="overflow-hidden border border-white/5 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="px-4 py-3 text-[9px] font-black text-white/40 uppercase tracking-widest">
                            Service Description
                          </th>
                          <th className="px-4 py-3 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">
                            Rate
                          </th>
                          <th className="px-4 py-3 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {packageSummary.allItems.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-white/2 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="text-[11px] font-bold text-white uppercase truncate max-w-[200px]">
                                {item.description}
                              </p>
                              <p className="text-[9px] text-white/30 truncate">
                                {item.unit}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right text-[11px] font-bold text-white/60">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-[11px] font-bold text-white/60">
                              ₹{item.rate?.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-[11px] font-black text-primary italic">
                              ₹{(item.rate * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Inherited Financials - Full Breakdown */}
                  <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-start justify-between gap-10">
                    <div className="flex-1 max-w-xs space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <span>Subtotal</span>
                        <span>₹{packageSummary.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary/60">
                        <span>GST ({formData.step5.taxRate}%)</span>
                        <span>
                          ₹
                          {(
                            (packageSummary.subtotal * formData.step5.taxRate) /
                            100
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-px bg-white/10 w-full" />
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                          Total Amount
                        </span>
                        <span className="text-3xl font-black text-white italic">
                          ₹
                          {(
                            packageSummary.subtotal +
                            (packageSummary.subtotal * formData.step5.taxRate) /
                              100
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 max-w-sm self-center">
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Receipt className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                          These items are inherited from your package selection
                          and will be automatically added to the final quote.
                          All project configurations and folder structures are
                          preset for consistency.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/*** Components ***/

function ProjectRequirementCard({ config }: { config: any }) {
  const [showStructure, setShowStructure] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4 relative">
          {/* Project Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Layers className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {config.projectTypeName}
                </h3>
                <Badge
                  variant="secondary"
                  className="h-5 px-2 bg-primary/10 border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest"
                >
                  Required by {config.packageName}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-3.5 w-3.5 text-white/20" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Folder Template:
                  </span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {config.folderTemplateName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <Check className="h-3 w-3 text-green-400" />
              <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">
                Automatically Configured
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStructure(!showStructure)}
              className="h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10"
            >
              <FolderOpen className="h-3 w-3 mr-2" />
              {showStructure ? "Hide Structure" : "View Structure"}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showStructure && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-white/5 overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 w-fit">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                    Folder Creation Details
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.folders?.map((folder: any, fidx: number) => (
                    <div
                      key={fidx}
                      className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider truncate">
                          {folder.name}
                        </span>
                      </div>
                      {folder.children && (
                        <div className="pl-5 space-y-1 border-l border-white/5">
                          {folder.children.map((sub: any, sidx: number) => (
                            <div
                              key={sidx}
                              className="flex items-center gap-2 group/sub"
                            >
                              <div className="h-1 w-1 rounded-full bg-white/10 group-hover/sub:bg-primary/40 transition-colors" />
                              <span className="text-[9px] font-bold text-white/40 uppercase tracking-wide">
                                {sub.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ProjectRequirementCardSmall({ config }: { config: any }) {
  return (
    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all space-y-3 group/req overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <Layers className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">
            Project Type
          </p>
          <h4 className="text-[11px] font-black text-white uppercase tracking-wider truncate">
            {config.projectTypeName}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center">
          <FolderTree className="h-3.5 w-3.5 text-white/20" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">
            Folder Template
          </p>
          <p className="text-[10px] font-black text-primary uppercase tracking-tight truncate">
            {config.folderTemplateName}
          </p>
        </div>
      </div>

      {/* Folders List - Shown by default now */}

      <div className="pt-2 border-t border-white/5">
        <p className="text-[8px] font-black text-primary/40 uppercase tracking-[0.2em] group-hover/req:text-primary/60 transition-colors">
          From: {config.packageName}
        </p>
      </div>
    </div>
  );
}
