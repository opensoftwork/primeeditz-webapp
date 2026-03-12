/**
 * Line Items Table
 *
 * Displays quotation line items in a professional table format.
 * Supports recursive rendering of sub-items (up to 3 levels) with hierarchical numbering.
 */

"use client";

import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuotationBuilder } from "../../quotation-builder-context";
import type { QuotationLineItem, QuotationSubItem, Section } from "../../types";
import { SubItemDrawer } from "./sub-item-drawer";

// Currency formatter
const formatCurrency = (amount: number): string => {
  if (amount === 0) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

interface LineItemWithIdx extends QuotationLineItem {
  originalIdx: number;
}

interface LineItemsTableProps {
  items: LineItemWithIdx[];
  section: Section | { _id: string; name: string };
  onEditItem: (item: LineItemWithIdx) => void;
  onUpdateItem: (item: LineItemWithIdx) => void;
  onRemoveItem: (originalIdx: number) => void;
  onAddItem: () => void;
  onAddFromLibrary?: () => void;
}

export function LineItemsTable({
  items,
  section,
  onEditItem,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
}: LineItemsTableProps) {
  // State for Sub-Item Drawer
  const [subItemDrawerOpen, setSubItemDrawerOpen] = useState(false);
  const [activeParent, setActiveParent] = useState<{
    item: LineItemWithIdx | QuotationSubItem;
    originalIdx?: number;
    parentIndices?: number[]; // [lineItemIdx, subItemIdx]
    level: number;
  } | null>(null);
  const [editingSubItem, setEditingSubItem] = useState<QuotationSubItem | null>(
    null,
  );

  // Expanded state for items with sub-items
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const { addSubItem, updateSubItem, removeSubItem } = useQuotationBuilder();

  // Sub-item CRUD handlers
  const handleAddSubItem = (
    item: LineItemWithIdx | QuotationSubItem,
    level: number,
    originalIdx?: number,
    parentIndices?: number[],
  ) => {
    setActiveParent({ item, level, originalIdx, parentIndices });
    setEditingSubItem(null);
    setSubItemDrawerOpen(true);
  };

  const handleEditSubItem = (
    sub: QuotationSubItem,
    parent: any,
    level: number,
    originalIdx?: number,
    parentIndices?: number[],
  ) => {
    setActiveParent({ item: parent, level, originalIdx, parentIndices });
    setEditingSubItem(sub);
    setSubItemDrawerOpen(true);
  };

  const handleSaveSubItem = (newSub: QuotationSubItem) => {
    if (!activeParent) return;

    const { originalIdx, parentIndices, level } = activeParent;

    if (originalIdx === undefined) return;

    if (level === 0) {
      // Level 2 (Sub-item of primary)
      if (editingSubItem) {
        // Find subIdx
        const lineItem = items.find((i) => i.originalIdx === originalIdx);
        const subIdx = lineItem?.subItems?.findIndex(
          (s) => s.id === editingSubItem.id,
        );
        if (subIdx !== undefined && subIdx !== -1) {
          updateSubItem(originalIdx, subIdx, newSub);
        }
      } else {
        addSubItem(originalIdx, newSub);
        // Auto-expand
        const lineItem = items.find((i) => i.originalIdx === originalIdx);
        if (lineItem) {
          const newExpanded = new Set(expandedItems);
          newExpanded.add(lineItem.id);
          setExpandedItems(newExpanded);
        }
      }
    } else if (level === 1 && parentIndices) {
      // Level 3 (Sub-item of sub-item)
      const subIdx = parentIndices[0];
      if (editingSubItem) {
        const lineItem = items.find((i) => i.originalIdx === originalIdx);
        const subSubIdx = lineItem?.subItems?.[subIdx]?.subItems?.findIndex(
          (s) => s.id === editingSubItem.id,
        );
        if (subSubIdx !== undefined && subSubIdx !== -1) {
          updateSubItem(originalIdx, subIdx, newSub, subSubIdx);
        }
      } else {
        addSubItem(originalIdx, newSub, subIdx);
        // Auto-expand
        const lineItem = items.find((i) => i.originalIdx === originalIdx);
        const subId = lineItem?.subItems?.[subIdx]?.id;
        if (subId) {
          const newExpanded = new Set(expandedItems);
          newExpanded.add(subId);
          setExpandedItems(newExpanded);
        }
      }
    }

    setSubItemDrawerOpen(false);
  };

  const handleRemoveSubItemLocal = (
    originalIdx: number,
    subId: string,
    parentSubId?: string,
  ) => {
    const lineItem = items.find((i) => i.originalIdx === originalIdx);
    if (!lineItem?.subItems) return;

    if (!parentSubId) {
      // Remove Level 2
      const subIdx = lineItem.subItems.findIndex((s) => s.id === subId);
      if (subIdx !== -1) removeSubItem(originalIdx, subIdx);
    } else {
      // Remove Level 3
      const subIdx = lineItem.subItems.findIndex((s) => s.id === parentSubId);
      if (subIdx === -1) return;
      const subSubIdx = lineItem.subItems[subIdx].subItems?.findIndex(
        (s) => s.id === subId,
      );
      if (subSubIdx !== undefined && subSubIdx !== -1) {
        removeSubItem(originalIdx, subIdx, subSubIdx);
      }
    }
  };

  return (
    <div className="w-full bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 text-left w-10">
              #
            </th>
            <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 text-left">
              Description
            </th>
            <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 text-center w-24">
              Unit
            </th>
            <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 text-center w-20">
              Qty
            </th>
            <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 text-right w-28">
              Rate
            </th>
            <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 text-right w-32">
              Amount
            </th>
            <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 text-center w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {items.map((item, idx) => (
            <React.Fragment key={item.id}>
              {/* Primary Line Item Row */}
              <tr className="bg-white/2 group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                <td className="py-3 px-3 text-[11px] font-black text-white/30">
                  {idx + 1}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    {item.subItems && item.subItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronDown className="h-3 w-3 text-primary" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-white/40" />
                        )}
                      </button>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-white group-hover:text-primary transition-colors leading-tight">
                        {item.description}
                      </span>
                      {item.spawnsProject && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-primary/60 mt-0.5">
                          Spawns Project
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-[11px] font-bold text-white/60 text-center">
                  {item.unit}
                </td>
                <td className="py-3 px-3 text-[11px] font-bold text-white/60 text-center">
                  {item.quantity}
                </td>
                <td className="py-3 px-3 text-[11px] font-mono font-bold text-white/60 text-right">
                  {formatCurrency(item.rate)}
                </td>
                <td className="py-3 px-3 text-[13px] font-mono font-black text-white text-right">
                  {formatCurrency(item.rate * item.quantity)}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center justify-center gap-1.5 translate-x-1">
                    <Button
                      onClick={() =>
                        handleAddSubItem(item, 0, item.originalIdx)
                      }
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-primary/20 hover:text-primary transition-all"
                      title="Add Sub-item"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      onClick={() => onEditItem(item)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-white/10"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      onClick={() => onRemoveItem(item.originalIdx)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>

              {/* Sub-Items (Level 2) */}
              {expandedItems.has(item.id) &&
                item.subItems?.map((sub, sIdx) => {
                  const subNum = `${idx + 1}.${sIdx + 1}`;
                  const hasSubSubs = sub.subItems && sub.subItems.length > 0;

                  return (
                    <React.Fragment key={sub.id}>
                      <tr className="bg-white/1 border-l-2 border-primary/20 group hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 text-[10px] font-bold text-white/20 pl-6">
                          {subNum}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2 pl-2">
                            <span className="text-white/20 font-light translate-y-[-2px]">
                              └
                            </span>
                            <div className="flex items-center gap-1.5">
                              {hasSubSubs && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(sub.id)}
                                  className="p-1 rounded hover:bg-white/10"
                                >
                                  {expandedItems.has(sub.id) ? (
                                    <ChevronDown className="h-2.5 w-2.5 text-primary/70" />
                                  ) : (
                                    <ChevronRight className="h-2.5 w-2.5 text-white/20" />
                                  )}
                                </button>
                              )}
                              <span className="text-[12px] font-bold text-white/80 leading-tight">
                                {sub.description}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[10px] font-medium text-white/40 text-center italic">
                          {sub.unit}
                        </td>
                        <td className="py-2.5 px-3 text-[10px] font-medium text-white/40 text-center">
                          {sub.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-[10px] font-mono font-medium text-white/40 text-right">
                          {formatCurrency(sub.rate)}
                        </td>
                        <td className="py-2.5 px-3 text-[12px] font-mono font-bold text-white/70 text-right">
                          {formatCurrency(sub.rate * sub.quantity)}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={() =>
                                handleAddSubItem(sub, 1, item.originalIdx, [
                                  sIdx,
                                ])
                              }
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md hover:bg-primary/20 hover:text-primary"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() =>
                                handleEditSubItem(
                                  sub,
                                  item,
                                  0,
                                  item.originalIdx,
                                  [sIdx],
                                )
                              }
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md hover:bg-white/10"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() =>
                                handleRemoveSubItemLocal(
                                  item.originalIdx,
                                  sub.id,
                                )
                              }
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md hover:bg-red-500/20 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Sub-Sub-Items (Level 3) */}
                      {expandedItems.has(sub.id) &&
                        sub.subItems?.map((ssub, ssIdx) => (
                          <tr
                            key={ssub.id}
                            className="bg-white/1 border-l-2 border-primary/10 group hover:bg-white/3 transition-colors"
                          >
                            <td className="py-2 px-3 text-[9px] font-medium text-white/10 pl-10">
                              {subNum}.{ssIdx + 1}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2 pl-8">
                                <span className="text-white/10 font-light translate-y-[-2px]">
                                  └
                                </span>
                                <span className="text-[11px] font-medium text-white/60 leading-tight italic">
                                  {ssub.description}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-[9px] font-medium text-white/30 text-center">
                              {ssub.unit}
                            </td>
                            <td className="py-2 px-3 text-[9px] font-medium text-white/30 text-center">
                              {ssub.quantity}
                            </td>
                            <td className="py-2 px-3 text-[9px] font-mono font-medium text-white/30 text-right">
                              {formatCurrency(ssub.rate)}
                            </td>
                            <td className="py-2 px-3 text-[11px] font-mono font-bold text-white/50 text-right">
                              {formatCurrency(ssub.rate * ssub.quantity)}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center justify-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                <Button
                                  onClick={() =>
                                    handleEditSubItem(
                                      ssub,
                                      sub,
                                      1,
                                      item.originalIdx,
                                      [sIdx, ssIdx],
                                    )
                                  }
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 rounded-md hover:bg-white/10"
                                >
                                  <Edit2 className="h-2.5 w-2.5" />
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleRemoveSubItemLocal(
                                      item.originalIdx,
                                      ssub.id,
                                      sub.id,
                                    )
                                  }
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 rounded-md hover:bg-red-500/20 hover:text-red-400"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Add Item Footer */}
      <div className="p-3 bg-white/2 border-t border-white/5 flex items-center justify-center">
        <Button
          onClick={onAddItem}
          variant="ghost"
          size="sm"
          className="h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/10 transition-all gap-1.5"
        >
          <Plus className="h-3 w-3" /> Add Component to {section.name}
        </Button>
      </div>

      {/* Shared Sub-Item Drawer */}
      <SubItemDrawer
        open={subItemDrawerOpen}
        onOpenChange={setSubItemDrawerOpen}
        subItem={editingSubItem}
        parentName={activeParent?.item.description}
        isLevel3={activeParent?.level === 1}
        onSave={handleSaveSubItem}
      />
    </div>
  );
}
