"use client";

import { useEffect } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useQuotationBuilder } from "../../quotation-builder-context";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";

import { LibraryItemsDrawer } from "./library-items-drawer";
import { LineItemRow } from "./line-item-row";
import { InvolvedProjects } from "./involved-projects";
import type { QuotationLineItem, Project, Section } from "../../types";

export function Step3LineItems() {
  const {
    formData,
    addLineItem,
    updateLineItem,
    removeLineItem,
    nextStep,
    setSubmitTrigger,
    projects,
    setFormData,
  } = useQuotationBuilder();

  const { lineItems } = formData.step3;
  const selectedProjectIds = formData.step1.projectIds;
  const filteredProjects =
    (projects as Project[])?.filter((p) =>
      selectedProjectIds.includes(p._id)
    ) || [];

  const sections =
    (useQuery(api.functions.quotations.sections.queries.getSections, {
      activeOnly: true,
    }) as Section[]) || [];

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(() => nextStep);
    return () => setSubmitTrigger(null);
  }, [nextStep, setSubmitTrigger]);

  const handleUpdateItem = (
    idx: number,
    field: keyof QuotationLineItem,
    value: any
  ) => {
    updateLineItem(idx, { [field]: value });
  };

  const handleAddProject = (val: string) => {
    setFormData("step1", {
      projectIds: [...selectedProjectIds, val],
    });
  };

  const handleRemoveProject = (projectId: string) => {
    setFormData("step1", {
      projectIds: selectedProjectIds.filter((id) => id !== projectId),
    });
    // Also clear association for line items using this project
    lineItems.forEach((li, idx) => {
      if (li.projectId === projectId) {
        handleUpdateItem(idx, "projectId", undefined);
      }
    });
  };

  // Group items by section
  const groupedItems = sections.map((section) => ({
    section,
    items: lineItems
      .map((item, originalIdx) => ({
        ...(item as QuotationLineItem),
        originalIdx,
      }))
      .filter((item) => item.sectionId === section._id),
  }));

  const uncategorizedItems = lineItems
    .map((item, originalIdx) => ({
      ...(item as QuotationLineItem),
      originalIdx,
    }))
    .filter(
      (item) =>
        !item.sectionId || !sections.find((s) => s._id === item.sectionId)
    );

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight uppercase text-white">
              Calculate Worth
            </h2>
            <p className="text-sm text-white/40 font-medium">
              Define the line items and pricing for this quotation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LibraryItemsDrawer
              onSelect={(item: any) => {
                // Auto-assign project if only one exists
                const defaultProjectId =
                  filteredProjects.length === 1
                    ? filteredProjects[0]._id
                    : undefined;

                addLineItem({
                  description: item.name,
                  unit: item.unit,
                  rate: item.unitPrice,
                  quantity: 1,
                  sectionId: item.sectionId,
                  projectId: defaultProjectId,
                });
              }}
            />
          </div>
        </div>

        <InvolvedProjects
          projects={projects as Project[]}
          selectedProjectIds={selectedProjectIds}
          filteredProjects={filteredProjects}
          clientId={formData.step1.clientId}
          onAddProject={handleAddProject}
          onRemoveProject={handleRemoveProject}
        />

        <div className="space-y-12">
          {groupedItems.map(({ section, items }) => (
            <div key={section._id} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-8 px-4 rounded-xl flex items-center justify-center border font-black uppercase tracking-[0.2em] text-[10px]",
                      section.color === "blue"
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : section.color === "purple"
                        ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        : section.color === "green"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : section.color === "amber"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : section.color === "indigo"
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        : section.color === "orange"
                        ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                    )}
                  >
                    {section.name}
                  </div>
                  <div className="h-px w-24 bg-white/5" />
                  <span className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">
                    {items.length} segments
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const defaultProjectId =
                      filteredProjects.length === 1
                        ? filteredProjects[0]._id
                        : undefined;
                    addLineItem({
                      sectionId: section._id,
                      description: "",
                      unit: "ls",
                      rate: 0,
                      quantity: 1,
                      projectId: defaultProjectId,
                    });
                  }}
                  className="h-8 px-4 rounded-xl bg-white/2 hover:bg-primary/5 text-white/40 hover:text-primary font-black uppercase tracking-widest text-[8px] transition-all"
                >
                  <Plus className="h-3 w-3 mr-1.5" /> add to {section.name}
                </Button>
              </div>

              <div className="p-1 rounded-3xl bg-white/2 border border-white/5 overflow-hidden">
                <div className="p-6 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <LineItemRow
                        key={item.id}
                        item={item}
                        idx={item.originalIdx}
                        filteredProjects={filteredProjects}
                        sections={sections}
                        handleUpdateItem={handleUpdateItem}
                        removeLineItem={removeLineItem}
                      />
                    ))}
                    {items.length === 0 && (
                      <div className="py-12 text-center">
                        <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em] italic">
                          No items in this section
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}

          {uncategorizedItems.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <div className="h-8 px-4 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  Uncategorized
                </div>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="p-1 rounded-3xl bg-white/2 border border-white/5 overflow-hidden">
                <div className="p-6 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {uncategorizedItems.map((item) => (
                      <LineItemRow
                        key={item.id}
                        item={item}
                        idx={item.originalIdx}
                        filteredProjects={filteredProjects}
                        sections={sections}
                        handleUpdateItem={handleUpdateItem}
                        removeLineItem={removeLineItem}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
