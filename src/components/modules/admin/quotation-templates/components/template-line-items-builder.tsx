/**
 * Template Line Items Builder
 *
 * A high-performance, table-based builder for quotation templates.
 * Replicates the "Step 3" UX from the main quotation builder.
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Plus, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { LibraryItemsDrawer } from "../../quotations/builder/steps/step3-line-items/library-items-drawer";
import { TemplateLineItemsTable } from "./template-line-items-table";
import { TemplateLineItemDrawer } from "./template-line-item-drawer";
import type {
  TemplateLineItem,
  Section,
  TemplateSubItem,
} from "../../quotations/builder/types";

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

interface TemplateLineItemsBuilderProps {
  lineItems: TemplateLineItem[];
  onChange: (items: TemplateLineItem[]) => void;
  sections: Section[];
}

export function TemplateLineItemsBuilder({
  lineItems,
  onChange,
  sections,
}: TemplateLineItemsBuilderProps) {
  // Tab state - "all" or section._id
  const [activeTab, setActiveTab] = useState<string>("all");

  // Drawer states
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    (TemplateLineItem & { originalIdx: number }) | null
  >(null);
  const [defaultSectionId, setDefaultSectionId] = useState<
    string | undefined
  >();

  // Helpers
  const openLibrary = useCallback(() => {
    setLibraryOpen(true);
  }, []);

  const openAddItemDrawer = useCallback(
    (sectionId?: string) => {
      setEditingItem(null);
      setDefaultSectionId(
        sectionId || (activeTab !== "all" ? activeTab : sections[0]?._id)
      );
      setItemDrawerOpen(true);
    },
    [activeTab, sections]
  );

  const openEditItemDrawer = useCallback(
    (item: TemplateLineItem & { originalIdx: number }) => {
      setEditingItem(item);
      setDefaultSectionId(item.sectionId);
      setItemDrawerOpen(true);
    },
    []
  );

  const handleSaveItem = (itemData: TemplateLineItem) => {
    if (editingItem) {
      const updated = [...lineItems];
      updated[editingItem.originalIdx] = itemData;
      onChange(updated);
    } else {
      onChange([...lineItems, itemData]);
    }
    setItemDrawerOpen(false);
    setEditingItem(null);
  };

  const handleRemoveItem = (idx: number) => {
    onChange(lineItems.filter((_, i) => i !== idx));
  };

  const handleSelectFromLibrary = (libItem: any) => {
    onChange([
      ...lineItems,
      {
        description: libItem.name,
        unit: libItem.unit,
        unitPrice: libItem.unitPrice,
        defaultQuantity: 1,
        sectionId: libItem.sectionId as any,
        subItems: [],
      },
    ]);
  };

  // Memoized data for table
  const allItemsWithIdx = useMemo(
    () =>
      lineItems.map((item, originalIdx) => ({
        ...item,
        originalIdx,
      })),
    [lineItems]
  );

  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allItemsWithIdx.length };
    sections.forEach((s) => {
      counts[s._id] = allItemsWithIdx.filter(
        (item) => item.sectionId === s._id
      ).length;
    });
    return counts;
  }, [allItemsWithIdx, sections]);

  const sectionTotals = useMemo(() => {
    const totals: Record<string, number> = { all: 0 };
    allItemsWithIdx.forEach((item) => {
      const itemTotal = item.unitPrice * item.defaultQuantity;
      const subItemsTotal = (item.subItems || []).reduce(
        (sum: number, sub: TemplateSubItem) =>
          sum + sub.unitPrice * sub.defaultQuantity,
        0
      );
      const total = itemTotal + subItemsTotal;
      totals.all += total;
      if (item.sectionId) {
        totals[item.sectionId] = (totals[item.sectionId] || 0) + total;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase text-white">
            Template Breakdown
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={openLibrary}
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

      {/* Filter & Totals */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5">
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
                        s.color === "blue"
                          ? "bg-blue-500"
                          : s.color === "purple"
                          ? "bg-purple-500"
                          : s.color === "green"
                          ? "bg-emerald-500"
                          : s.color === "amber"
                          ? "bg-amber-500"
                          : s.color === "red"
                          ? "bg-red-500"
                          : "bg-zinc-500"
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
            {activeTab === "all"
              ? "Total Value"
              : `${activeSection?.name} Total`}
          </span>
          <span className="text-xl font-black text-white">
            {formatCurrency(
              activeTab === "all"
                ? sectionTotals.all
                : sectionTotals[activeTab] || 0
            )}
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="p-1 rounded-[2.5rem] bg-white/2 border border-white/5 shadow-2xl relative overflow-hidden group/container">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none opacity-0 group-hover/container:opacity-100 transition-opacity" />
        <div className="relative p-6 space-y-12">
          {activeTab === "all" ? (
            sections.map((section) => {
              const sectionItems = allItemsWithIdx.filter(
                (item) => item.sectionId === section._id
              );
              if (sectionItems.length === 0) return null;

              return (
                <div key={section._id} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div
                      className={cn(
                        "h-6 w-1 rounded-full",
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
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
                      {section.name}
                    </h4>
                  </div>
                  <TemplateLineItemsTable
                    items={sectionItems}
                    section={section}
                    onEditItem={openEditItemDrawer}
                    onRemoveItem={handleRemoveItem}
                    onAddItem={(sId) => openAddItemDrawer(sId)}
                  />
                </div>
              );
            })
          ) : (
            <TemplateLineItemsTable
              items={displayedItems}
              section={activeSection || { _id: "", name: "" }}
              onEditItem={openEditItemDrawer}
              onRemoveItem={handleRemoveItem}
              onAddItem={(sId) => openAddItemDrawer(sId)}
            />
          )}

          {activeTab === "all" && allItemsWithIdx.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Layers className="h-8 w-8 text-white/10" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
                  Architecture is Empty
                </p>
                <p className="text-xs text-white/20 font-medium">
                  Add items to your framework to see the breakdown.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawers */}
      <LibraryItemsDrawer
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onSelect={handleSelectFromLibrary}
      />

      <TemplateLineItemDrawer
        open={itemDrawerOpen}
        onOpenChange={(open) => {
          setItemDrawerOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        sections={sections}
        defaultSectionId={defaultSectionId}
        onSave={handleSaveItem}
      />
    </div>
  );
}
