/**
 * Service Package Items Table
 *
 * A professional table-based editor for service package line items.
 * Replaces the card-based UI with a high-density, manageable table.
 */

"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Package,
  Layers,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SubItemDrawer } from "../../../quotations/builder/steps/shared/sub-item-drawer";
import type { QuotationSubItem } from "../../../quotations/types";
import { LineItemDrawer, type LineItem } from "./line-item-drawer";

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

interface ServicePackageItemsTableProps {
  form: any;
  projectConfigs: any[];
}

export function ServicePackageItemsTable({
  form,
  projectConfigs,
}: ServicePackageItemsTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [subItemDrawerOpen, setSubItemDrawerOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [editingSubItem, setEditingSubItem] = useState<{
    item: QuotationSubItem;
    parentIndices?: number[];
    level: number;
  } | null>(null);

  // Line Item Drawer State
  const [lineItemDrawerOpen, setLineItemDrawerOpen] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<{
    item: LineItem;
    index: number;
  } | null>(null);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleAddSubItem = (
    itemIndex: number,
    level: number = 0,
    parentIndices?: number[],
  ) => {
    setActiveItemIndex(itemIndex);
    setEditingSubItem(null);
    setSubItemDrawerOpen(true);
  };

  const handleEditSubItem = (
    itemIndex: number,
    sub: QuotationSubItem,
    level: number,
    parentIndices?: number[],
  ) => {
    setActiveItemIndex(itemIndex);
    setEditingSubItem({ item: sub, level, parentIndices });
    setSubItemDrawerOpen(true);
  };

  const handleSaveSubItem = (newSub: QuotationSubItem) => {
    if (activeItemIndex === null) return;

    const currentLineItem = form.getFieldValue(`lineItems[${activeItemIndex}]`);
    const subItems = [...(currentLineItem.subItems || [])];

    if (!editingSubItem) {
      // Add new
      subItems.push(newSub);
      // Auto expand
      const newExpanded = new Set(expandedItems);
      newExpanded.add(currentLineItem.id);
      setExpandedItems(newExpanded);
    } else {
      // Update existing
      const { level, parentIndices } = editingSubItem;
      if (level === 0) {
        const idx = subItems.findIndex((s: any) => s.id === newSub.id);
        if (idx !== -1) subItems[idx] = newSub;
      } else if (level === 1 && parentIndices) {
        const pIdx = parentIndices[0];
        const parentSub = { ...subItems[pIdx] };
        const sSubItems = [...(parentSub.subItems || [])];
        const sIdx = sSubItems.findIndex((s: any) => s.id === newSub.id);
        if (sIdx !== -1) sSubItems[sIdx] = newSub;
        parentSub.subItems = sSubItems;
        subItems[pIdx] = parentSub;
      }
    }

    form.setFieldValue(`lineItems[${activeItemIndex}].subItems`, subItems);
    setSubItemDrawerOpen(false);
  };

  const handleRemoveSubItem = (
    itemIndex: number,
    subId: string,
    level: number,
    parentIndices?: number[],
  ) => {
    const currentLineItem = form.getFieldValue(`lineItems[${itemIndex}]`);
    const subItems = [...(currentLineItem.subItems || [])];

    if (level === 0) {
      const filtered = subItems.filter((s: any) => s.id !== subId);
      form.setFieldValue(`lineItems[${itemIndex}].subItems`, filtered);
    } else if (level === 1 && parentIndices) {
      const pIdx = parentIndices[0];
      const parentSub = { ...subItems[pIdx] };
      const sSubItems = (parentSub.subItems || []).filter(
        (s: QuotationSubItem) => s.id !== subId,
      );
      parentSub.subItems = sSubItems;
      subItems[pIdx] = parentSub;
      form.setFieldValue(`lineItems[${itemIndex}].subItems`, subItems);
    }
  };

  const calculateItemTotal = (item: any) => {
    const self = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const subTotal = (item.subItems || []).reduce(
      (sum: number, sub: QuotationSubItem) => {
        const subSelf = (Number(sub.rate) || 0) * (Number(sub.quantity) || 0);
        const subSubTotal = (sub.subItems || []).reduce(
          (s: number, ss: QuotationSubItem) =>
            s + (Number(ss.rate) || 0) * (Number(ss.quantity) || 0),
          0,
        );
        return sum + subSelf + subSubTotal;
      },
      0,
    );
    return self + subTotal;
  };

  const toggleEditItem = (id: string, index: number, item: any) => {
    setEditingLineItem({ item, index });
    setLineItemDrawerOpen(true);
  };

  const handleSaveLineItem = (updatedItem: LineItem) => {
    if (editingLineItem === null) return;
    form.setFieldValue(`lineItems[${editingLineItem.index}]`, updatedItem);
    setLineItemDrawerOpen(false);
  };

  return (
    <div className="w-full bg-zinc-900/50 rounded-[12px] border border-white/5 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/40 text-center w-12">
              #
            </th>
            <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/40 text-left min-w-[300px]">
              Offering Description
            </th>
            <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/40 text-left w-48">
              Project Config
            </th>
            <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/40 text-center w-24">
              Unit
            </th>
            <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/40 text-center w-20">
              Qty
            </th>
            <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/40 text-right w-32">
              Rate (₹)
            </th>
            <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/40 text-right w-36">
              Amount
            </th>
            <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/40 text-center w-28">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          <form.Subscribe selector={(state: any) => state.values.lineItems}>
            {(lineItems: any[]) => (
              <>
                {lineItems?.map((item, idx) => {
                  const configLabel =
                    projectConfigs.find((c) => c.id === item.projectConfigId)
                      ?.label || "—";

                  return (
                    <React.Fragment key={item.id}>
                      {/* Main Item Row */}
                      <tr className="group bg-white/2 hover:bg-white/4 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {item.subItems && item.subItems.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(item.id)}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                {expandedItems.has(item.id) ? (
                                  <ChevronDown className="h-4 w-4 text-primary" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-white/40" />
                                )}
                              </button>
                            )}
                            <span className="text-[11px] font-black text-white/20 tabular-nums">
                              {idx + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[13px] font-bold text-white leading-tight">
                            {item.description || "Untitled"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-bold text-white/50">
                            {configLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[11px] font-medium text-white/40">
                            {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[11px] font-mono font-medium text-white/40">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[11px] font-mono font-medium text-white/40">
                            {formatCurrency(item.rate)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[13px] font-mono font-black text-white px-2">
                            {formatCurrency(calculateItemTotal(item))}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={() => toggleEditItem(item.id, idx, item)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl hover:bg-white/10"
                              title="Edit Item"
                              type="button"
                            >
                              <Settings2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleAddSubItem(idx)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl hover:bg-primary/20 hover:text-primary transition-all"
                              title="Add Sub-item"
                              type="button"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (lineItems.length > 1) {
                                  form.removeFieldValue("lineItems", idx);
                                }
                              }}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl hover:bg-red-500/20 hover:text-red-400"
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Sub-items (Level 2) */}
                      {expandedItems.has(item.id) &&
                        item.subItems?.map(
                          (sub: QuotationSubItem, sIdx: number) => {
                            const subNum = `${idx + 1}.${sIdx + 1}`;
                            const hasSubSubs =
                              sub.subItems && sub.subItems.length > 0;

                            return (
                              <React.Fragment key={sub.id}>
                                <tr className="bg-white/1 border-l-2 border-primary/20 group hover:bg-white/3 transition-colors">
                                  <td className="py-2.5 px-4 text-center">
                                    <span className="text-[10px] font-bold text-white/10 tabular-nums">
                                      {subNum}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4">
                                    <div className="flex items-center gap-2 pl-4">
                                      <span className="text-white/10 font-light translate-y-[-2px]">
                                        └
                                      </span>
                                      {hasSubSubs && (
                                        <button
                                          type="button"
                                          onClick={() => toggleExpand(sub.id)}
                                          className="p-1 rounded-lg hover:bg-white/10"
                                        >
                                          {expandedItems.has(sub.id) ? (
                                            <ChevronDown className="h-3 w-3 text-primary/70" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3 text-white/20" />
                                          )}
                                        </button>
                                      )}
                                      <span className="text-[12px] font-bold text-white/70 leading-tight">
                                        {sub.description}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-4">
                                    {/* Empty — inherits from parent */}
                                  </td>
                                  <td className="py-2.5 px-4 text-center">
                                    <span className="text-[10px] font-medium text-white/30">
                                      {sub.unit}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-center">
                                    <span className="text-[10px] font-mono font-medium text-white/30">
                                      {sub.quantity}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-right">
                                    <span className="text-[10px] font-mono font-medium text-white/30">
                                      {formatCurrency(sub.rate)}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-right">
                                    <span className="text-[12px] font-mono font-bold text-white/50 px-2">
                                      {formatCurrency(sub.rate * sub.quantity)}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        onClick={() =>
                                          handleAddSubItem(idx, 1, [sIdx])
                                        }
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg hover:bg-primary/20 hover:text-primary"
                                        type="button"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleEditSubItem(idx, sub, 0)
                                        }
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg hover:bg-white/10"
                                        type="button"
                                      >
                                        <Settings2 className="h-3.5 w-3.5 text-white/40" />
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleRemoveSubItem(idx, sub.id, 0)
                                        }
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg hover:bg-red-500/20 hover:text-red-400"
                                        type="button"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Level 3 items */}
                                {expandedItems.has(sub.id) &&
                                  sub.subItems?.map(
                                    (ssub: QuotationSubItem, ssIdx: number) => (
                                      <tr
                                        key={ssub.id}
                                        className="bg-white/0.5 border-l-2 border-primary/10 group hover:bg-white/2 transition-colors"
                                      >
                                        <td className="py-2 px-4 text-center">
                                          <span className="text-[9px] font-medium text-white/5 tabular-nums">
                                            {subNum}.{ssIdx + 1}
                                          </span>
                                        </td>
                                        <td className="py-2 px-4">
                                          <div className="flex items-center gap-2 pl-12">
                                            <span className="text-white/5 font-light translate-y-[-2px]">
                                              └
                                            </span>
                                            <span className="text-[11px] font-medium text-white/40 italic">
                                              {ssub.description}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="py-2 px-4">
                                          {/* Empty — inherits from parent */}
                                        </td>
                                        <td className="py-2 px-4 text-center">
                                          <span className="text-[9px] font-medium text-white/20">
                                            {ssub.unit}
                                          </span>
                                        </td>
                                        <td className="py-2 px-4 text-center">
                                          <span className="text-[9px] font-mono font-medium text-white/20">
                                            {ssub.quantity}
                                          </span>
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                          <span className="text-[9px] font-mono font-medium text-white/20">
                                            {formatCurrency(ssub.rate)}
                                          </span>
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                          <span className="text-[11px] font-mono font-bold text-white/30 px-2">
                                            {formatCurrency(
                                              ssub.rate * ssub.quantity,
                                            )}
                                          </span>
                                        </td>
                                        <td className="py-2 px-4 text-center">
                                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              onClick={() =>
                                                handleEditSubItem(
                                                  idx,
                                                  ssub,
                                                  1,
                                                  [sIdx],
                                                )
                                              }
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 rounded-lg hover:bg-white/10"
                                              type="button"
                                            >
                                              <Settings2 className="h-3 w-3 text-white/20" />
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                handleRemoveSubItem(
                                                  idx,
                                                  ssub.id,
                                                  1,
                                                  [sIdx],
                                                )
                                              }
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 rounded-lg hover:bg-red-500/20 hover:text-red-400"
                                              type="button"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ),
                                  )}
                              </React.Fragment>
                            );
                          },
                        )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </form.Subscribe>
        </tbody>
      </table>

      {/* Sub-item Drawer */}
      <SubItemDrawer
        open={subItemDrawerOpen}
        onOpenChange={setSubItemDrawerOpen}
        onSave={handleSaveSubItem}
        subItem={editingSubItem?.item}
        isLevel3={editingSubItem?.level === 1}
      />

      {/* Line Item Drawer (Left Side) */}
      <LineItemDrawer
        open={lineItemDrawerOpen}
        onOpenChange={setLineItemDrawerOpen}
        projectConfigs={projectConfigs}
        lineItem={editingLineItem?.item}
        onSave={handleSaveLineItem}
      />
    </div>
  );
}
