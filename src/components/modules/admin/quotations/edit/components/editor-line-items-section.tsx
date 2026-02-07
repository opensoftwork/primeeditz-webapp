"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { BookOpen, Layers, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useQuotationBuilder } from "../../builder/quotation-builder-context";
import { LibraryItemsDrawer } from "../../builder/steps/shared/library-items-drawer";
import { LineItemDrawer } from "../../builder/steps/shared/line-item-drawer";
import { LineItemsTable } from "../../builder/steps/shared/line-items-table";
import type {
  LibraryItem,
  Project,
  QuotationLineItem,
  Section,
} from "../../builder/types";

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function EditorLineItemsSection() {
  const {
    formData,
    addLineItem,
    updateLineItem,
    removeLineItem,
    projects,
    setFormData,
  } = useQuotationBuilder();

  const { lineItems } = formData.step4;
  const selectedProjectIds = formData.step3.projectIds || [];
  const filteredProjects =
    (projects as Project[])?.filter((p) =>
      selectedProjectIds.includes(p._id),
    ) || [];

  const sections =
    (useQuery(api.functions.quotations.sections.queries.getSections, {
      activeOnly: true,
    }) as Section[]) || [];

  const [activeTab, setActiveTab] = useState<string>("all");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    (QuotationLineItem & { originalIdx: number }) | null
  >(null);
  const [defaultSectionForDrawer, setDefaultSectionForDrawer] = useState<
    string | undefined
  >();

  const openLibrary = useCallback((sectionId: string | null = null) => {
    setTargetSectionId(sectionId);
    setLibraryOpen(true);
  }, []);

  const openAddItemDrawer = useCallback(
    (sectionId?: string) => {
      setEditingItem(null);
      const effectiveSectionId =
        sectionId || (activeTab !== "all" ? activeTab : sections[0]?._id);
      setDefaultSectionForDrawer(effectiveSectionId);
      setItemDrawerOpen(true);
    },
    [activeTab, sections],
  );

  const openEditItemDrawer = useCallback(
    (item: QuotationLineItem & { originalIdx: number }) => {
      setEditingItem(item);
      setDefaultSectionForDrawer(item.sectionId);
      setItemDrawerOpen(true);
    },
    [],
  );

  const handleSelectFromLibrary = useCallback(
    (item: any, projectId?: string) => {
      const defaultProjectId =
        projectId ||
        (filteredProjects.length === 1 ? filteredProjects[0]._id : undefined);

      addLineItem({
        description: item.name,
        unit: item.unit,
        rate: item.unitPrice,
        quantity: 1,
        sectionId: item.sectionId,
        projectId: defaultProjectId,
      });
    },
    [addLineItem, filteredProjects],
  );

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
    [editingItem, addLineItem, updateLineItem],
  );

  const handleAddProject = useCallback(
    (val: string) => {
      setFormData("step3", {
        projectIds: [...selectedProjectIds, val],
      });
    },
    [setFormData, selectedProjectIds],
  );

  const handleRemoveProject = useCallback(
    (projectId: string) => {
      setFormData("step3", {
        projectIds: selectedProjectIds.filter((id) => id !== projectId),
      });
      lineItems.forEach((li, idx) => {
        const item = li as QuotationLineItem;
        if (item.projectId === projectId) {
          updateLineItem(idx, { projectId: undefined });
        }
      });
    },
    [setFormData, selectedProjectIds, lineItems, updateLineItem],
  );

  const allItemsWithIdx = useMemo(
    () =>
      lineItems.map((item, originalIdx) => ({
        ...(item as QuotationLineItem),
        originalIdx,
      })),
    [lineItems],
  );

  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allItemsWithIdx.length };
    sections.forEach((s) => {
      counts[s._id] = allItemsWithIdx.filter(
        (item) => item.sectionId === s._id,
      ).length;
    });
    return counts;
  }, [allItemsWithIdx, sections]);

  const sectionTotals = useMemo(() => {
    const totals: Record<string, number> = { all: 0 };
    allItemsWithIdx.forEach((item) => {
      const itemTotal =
        item.rate * item.quantity +
        (item.subItems || []).reduce(
          (sum, sub) => sum + sub.rate * sub.quantity,
          0,
        );
      totals.all += itemTotal;
      if (item.sectionId) {
        totals[item.sectionId] = (totals[item.sectionId] || 0) + itemTotal;
      }
    });
    return totals;
  }, [allItemsWithIdx]);

  const displayedItems = useMemo(() => {
    if (activeTab === "all") return allItemsWithIdx;
    return allItemsWithIdx.filter((item) => item.sectionId === activeTab);
  }, [activeTab, allItemsWithIdx]);

  const activeSection = sections.find((s) => s._id === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase text-white">
            Calculate Worth
          </h2>
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

      {/* Projects Section - simplified inline version */}
      {filteredProjects.length > 0 && (
        <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Involved Projects ({filteredProjects.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="text-xs font-bold text-white">
                  {project.eventName || project.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-1 rounded-4xl bg-white/2 border border-white/5">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-4">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-[200px] h-9 bg-white/5 border-none rounded-lg text-xs font-bold uppercase tracking-wider">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      All Items ({sectionCounts.all})
                    </div>
                  </SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            s.color ? `bg-${s.color}-500` : "bg-zinc-500",
                          )}
                        />
                        {s.name} ({sectionCounts[s._id] || 0})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                Total
              </span>
              <span className="text-xl font-black text-white">
                {formatCurrency(
                  activeTab === "all"
                    ? sectionTotals.all
                    : sectionTotals[activeTab] || 0,
                )}
              </span>
            </div>
          </div>

          <LineItemsTable
            items={displayedItems}
            section={{
              _id: activeTab === "all" ? "" : activeTab,
              name: activeTab === "all" ? "All" : activeSection?.name || "",
            }}
            onEditItem={openEditItemDrawer}
            onRemoveItem={removeLineItem}
            onAddItem={(sectionId) => openAddItemDrawer(sectionId)}
            onAddFromLibrary={(sectionId) => openLibrary(sectionId)}
          />
        </div>
      </div>

      <LibraryItemsDrawer
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        initialSectionId={targetSectionId}
        onSelect={handleSelectFromLibrary}
      />

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
        onSave={handleSaveItem}
      />
    </div>
  );
}
