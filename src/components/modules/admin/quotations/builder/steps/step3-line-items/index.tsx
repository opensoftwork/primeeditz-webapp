"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, BookOpen, Layers, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuotationBuilder } from "../../quotation-builder-context";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";

import { LibraryItemsDrawer } from "./library-items-drawer";
import { LineItemsTable } from "./line-items-table";
import { LineItemDrawer } from "./line-item-drawer";
import { InvolvedProjects } from "./involved-projects";
import type { QuotationLineItem, Project, Section } from "../../types";

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

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

  // Tab state - "all" or section._id
  const [activeTab, setActiveTab] = useState<string>("all");

  // Library drawer state
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);

  // Line item drawer state
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    (QuotationLineItem & { originalIdx: number }) | null
  >(null);
  const [defaultSectionForDrawer, setDefaultSectionForDrawer] = useState<
    string | undefined
  >();

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(nextStep);
    return () => setSubmitTrigger(null);
  }, [nextStep, setSubmitTrigger]);

  // Open library for specific section
  const openLibrary = useCallback((sectionId: string | null = null) => {
    setTargetSectionId(sectionId);
    setLibraryOpen(true);
  }, []);

  // Open drawer to add new item
  const openAddItemDrawer = useCallback(
    (sectionId?: string) => {
      setEditingItem(null);
      const effectiveSectionId =
        sectionId || (activeTab !== "all" ? activeTab : sections[0]?._id);
      setDefaultSectionForDrawer(effectiveSectionId);
      setItemDrawerOpen(true);
    },
    [activeTab, sections]
  );

  // Open drawer to edit existing item
  const openEditItemDrawer = useCallback(
    (item: QuotationLineItem & { originalIdx: number }) => {
      setEditingItem(item);
      setDefaultSectionForDrawer(item.sectionId);
      setItemDrawerOpen(true);
    },
    []
  );

  // Handle library item select
  const handleSelectFromLibrary = useCallback(
    (item: any) => {
      const defaultProjectId =
        filteredProjects.length === 1 ? filteredProjects[0]._id : undefined;

      addLineItem({
        description: item.name,
        unit: item.unit,
        rate: item.unitPrice,
        quantity: 1,
        sectionId: item.sectionId as any,
        projectId: defaultProjectId,
      });
    },
    [addLineItem, filteredProjects]
  );

  // Handle save from drawer (add or update)
  const handleSaveItem = useCallback(
    (itemData: Omit<QuotationLineItem, "id">) => {
      if (editingItem) {
        updateLineItem(editingItem.originalIdx, itemData);
      } else {
        addLineItem(itemData);
      }
      setItemDrawerOpen(false);
      setEditingItem(null);
    },
    [editingItem, addLineItem, updateLineItem]
  );

  // Handle project management
  const handleAddProject = useCallback(
    (val: string) => {
      setFormData("step1", {
        projectIds: [...selectedProjectIds, val],
      });
    },
    [setFormData, selectedProjectIds]
  );

  const handleRemoveProject = useCallback(
    (projectId: string) => {
      setFormData("step1", {
        projectIds: selectedProjectIds.filter((id) => id !== projectId),
      });
      lineItems.forEach((li, idx) => {
        if ((li as QuotationLineItem).projectId === projectId) {
          updateLineItem(idx, { projectId: undefined });
        }
      });
    },
    [setFormData, selectedProjectIds, lineItems, updateLineItem]
  );

  // All items with originalIdx
  const allItemsWithIdx = useMemo(
    () =>
      lineItems.map((item, originalIdx) => ({
        ...(item as QuotationLineItem),
        originalIdx,
      })),
    [lineItems]
  );

  // Calculate section counts
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allItemsWithIdx.length };
    sections.forEach((s) => {
      counts[s._id] = allItemsWithIdx.filter(
        (item) => item.sectionId === s._id
      ).length;
    });
    return counts;
  }, [allItemsWithIdx, sections]);

  // Calculate section totals
  const sectionTotals = useMemo(() => {
    const totals: Record<string, number> = { all: 0 };
    allItemsWithIdx.forEach((item) => {
      const itemTotal =
        item.rate * item.quantity +
        (item.subItems || []).reduce(
          (sum, sub) => sum + sub.rate * sub.quantity,
          0
        );
      totals.all += itemTotal;
      if (item.sectionId) {
        totals[item.sectionId] = (totals[item.sectionId] || 0) + itemTotal;
      }
    });
    return totals;
  }, [allItemsWithIdx]);

  // Filter items based on active tab
  const displayedItems = useMemo(() => {
    if (activeTab === "all") return allItemsWithIdx;
    return allItemsWithIdx.filter((item) => item.sectionId === activeTab);
  }, [activeTab, allItemsWithIdx]);

  // Get active section for display
  const activeSection = sections.find((s) => s._id === activeTab);

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight uppercase text-white">
              Calculate Worth
            </h2>
            <p className="text-sm text-white/40 font-medium">
              Define the line items and pricing for this quotation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => openLibrary()}
              className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold uppercase tracking-widest text-[10px]"
            >
              <BookOpen className="h-4 w-4 mr-2 text-primary" />
              Library
            </Button>
            <Button
              type="button"
              onClick={() => openAddItemDrawer()}
              className="h-10 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Projects Section */}
        <InvolvedProjects
          projects={projects as Project[]}
          selectedProjectIds={selectedProjectIds}
          filteredProjects={filteredProjects}
          clientId={formData.step1.clientId}
          onAddProject={handleAddProject}
          onRemoveProject={handleRemoveProject}
        />

        {/* Section Filter - Dropdown */}
        <div className="mt-6 mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-white/30" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Filter by Section
            </span>
          </div>
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[220px] h-10 bg-white/5 border-white/10 rounded-xl text-sm font-medium">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {activeTab === "all" ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>All Items</span>
                      <span className="text-[10px] text-white/30 font-bold">
                        ({sectionCounts.all})
                      </span>
                    </>
                  ) : (
                    <>
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          activeSection?.color === "blue"
                            ? "bg-blue-500"
                            : activeSection?.color === "purple"
                            ? "bg-purple-500"
                            : activeSection?.color === "green"
                            ? "bg-emerald-500"
                            : activeSection?.color === "amber"
                            ? "bg-amber-500"
                            : activeSection?.color === "red"
                            ? "bg-red-500"
                            : "bg-zinc-500"
                        )}
                      />
                      <span>{activeSection?.name}</span>
                      <span className="text-[10px] text-white/30 font-bold">
                        ({sectionCounts[activeTab] || 0})
                      </span>
                    </>
                  )}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="all" className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  All Items
                  <span className="text-[10px] text-white/30 font-bold ml-2">
                    {sectionCounts.all}
                  </span>
                </div>
              </SelectItem>
              {sections.map((section) => (
                <SelectItem
                  key={section._id}
                  value={section._id}
                  className="text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        section.color === "blue"
                          ? "bg-blue-500"
                          : section.color === "purple"
                          ? "bg-purple-500"
                          : section.color === "green"
                          ? "bg-emerald-500"
                          : section.color === "amber"
                          ? "bg-amber-500"
                          : section.color === "red"
                          ? "bg-red-500"
                          : "bg-zinc-500"
                      )}
                    />
                    {section.name}
                    <span className="text-[10px] text-white/30 font-bold ml-2">
                      {sectionCounts[section._id] || 0}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Tab Content */}
        <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
          {/* Tab Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              {activeTab === "all" ? (
                <div className="h-6 px-2.5 rounded-md flex items-center justify-center bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest text-[8px]">
                  All Items
                </div>
              ) : (
                <div
                  className={cn(
                    "h-6 px-2.5 rounded-md flex items-center justify-center border font-black uppercase tracking-widest text-[8px]",
                    activeSection?.color === "blue"
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : activeSection?.color === "purple"
                      ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                      : activeSection?.color === "green"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : activeSection?.color === "amber"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : activeSection?.color === "red"
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                  )}
                >
                  {activeSection?.name || "Section"}
                </div>
              )}
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">
                {displayedItems.length} item
                {displayedItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                Total
              </span>
              <span className="text-lg font-black text-white">
                {formatCurrency(
                  activeTab === "all"
                    ? sectionTotals.all
                    : sectionTotals[activeTab] || 0
                )}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <LineItemsTable
            items={displayedItems}
            section={{
              _id: activeTab === "all" ? "" : activeTab,
              name: activeTab === "all" ? "All" : activeSection?.name || "",
            }}
            onEditItem={openEditItemDrawer}
            onRemoveItem={removeLineItem}
            onAddItem={(sectionId) => openAddItemDrawer(sectionId || undefined)}
          />
        </div>
      </div>

      {/* Library Items Drawer */}
      <LibraryItemsDrawer
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        initialSectionId={targetSectionId}
        onSelect={handleSelectFromLibrary}
      />

      {/* Line Item Drawer (Add/Edit) */}
      <LineItemDrawer
        open={itemDrawerOpen}
        onOpenChange={(open) => {
          setItemDrawerOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        sections={sections}
        defaultSectionId={defaultSectionForDrawer}
        projects={filteredProjects}
        defaultProjectId={
          filteredProjects.length === 1 ? filteredProjects[0]._id : undefined
        }
        onSave={handleSaveItem}
      />
    </div>
  );
}
