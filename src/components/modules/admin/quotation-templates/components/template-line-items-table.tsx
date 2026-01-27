/**
 * Template Line Items Table
 *
 * Table-based display for quotation template line items.
 * Optimized for template management without project context.
 */

"use client";

import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  TemplateLineItem,
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

interface SectionInfo {
  _id: string;
  name: string;
}

interface TemplateLineItemsTableProps {
  items: (TemplateLineItem & { originalIdx: number })[];
  section: SectionInfo;
  onEditItem?: (item: TemplateLineItem & { originalIdx: number }) => void;
  onRemoveItem?: (idx: number) => void;
  onAddItem?: (sectionId: string) => void;
  readOnly?: boolean;
}

export function TemplateLineItemsTable({
  items,
  section,
  onEditItem,
  onRemoveItem,
  onAddItem,
  readOnly = false,
}: TemplateLineItemsTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (idx: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Calculate section total
  const sectionTotal = items.reduce((sum, item) => {
    const itemTotal = item.unitPrice * item.defaultQuantity;
    const subItemsTotal = (item.subItems || []).reduce(
      (subSum: number, sub: TemplateSubItem) =>
        subSum + sub.unitPrice * sub.defaultQuantity,
      0,
    );
    return sum + itemTotal + subItemsTotal;
  }, 0);

  return (
    <div className="overflow-x-auto">
      {/* Table Header */}
      <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/10 pb-3 mb-2 px-2">
        <div className="w-10 text-center">#</div>
        <div className="flex-1 min-w-[200px] pl-2">Description</div>
        <div className="w-16 text-center">Unit</div>
        <div className="w-14 text-center">Qty</div>
        <div className="w-20 text-right">Rate</div>
        <div className="w-24 text-right pr-1">Total</div>
        {!readOnly && <div className="w-20"></div>}
      </div>

      {/* Table Body */}
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-white/20 font-medium italic">
              No items in this section
            </p>
          </div>
        ) : (
          items.map((item, localIdx) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.has(localIdx);
            const itemTotal = item.unitPrice * item.defaultQuantity;

            return (
              <motion.div
                key={localIdx}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="group"
              >
                {/* Main Item Row */}
                <div className="flex items-center py-2 hover:bg-white/3 rounded-lg transition-colors px-2">
                  <div className="w-10 text-center">
                    <span className="text-xs font-bold text-white/50">
                      {localIdx + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-[200px] flex items-center gap-2 pl-1">
                    {hasSubItems && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(localIdx)}
                        className="p-0.5 rounded hover:bg-white/10 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white/40" />
                        )}
                      </button>
                    )}
                    <span className="text-sm font-medium text-white truncate">
                      {item.description || (
                        <span className="italic text-white/30">
                          No description
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="w-16 text-center">
                    <span className="text-[10px] font-black uppercase text-white/40">
                      {item.unit}
                    </span>
                  </div>

                  <div className="w-14 text-center">
                    <span className="text-sm font-bold text-white">
                      {item.defaultQuantity}
                    </span>
                  </div>

                  <div className="w-20 text-right">
                    <span className="text-sm font-mono text-white/70">
                      {item.unitPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-24 text-right pr-1">
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>

                  {!readOnly && (
                    <div className="w-20 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditItem?.(item)}
                        className="h-7 w-7 rounded-lg text-white/40 hover:text-primary hover:bg-primary/10"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem?.(item.originalIdx)}
                        className="h-7 w-7 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Sub-Items (if expanded) */}
                {hasSubItems && isExpanded && (
                  <div className="ml-6 pl-4 border-l border-white/10">
                    {item.subItems!.map(
                      (subItem: TemplateSubItem, subIdx: number) => (
                        <TemplateSubItemRow
                          key={subIdx}
                          subItem={subItem}
                          parentIdx={localIdx}
                          subIdx={subIdx}
                          formatCurrency={formatCurrency}
                        />
                      ),
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </AnimatePresence>

      {/* Section Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 px-2">
        {!readOnly ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAddItem?.(section._id)}
            className="h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wide text-white/40 hover:text-white hover:bg-white/5"
          >
            <Plus className="h-3 w-3 mr-1.5" />
            Add Item
          </Button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
            Section Total
          </span>
          <span className="text-base font-black text-white">
            {formatCurrency(sectionTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

function TemplateSubItemRow({
  subItem,
  parentIdx,
  subIdx,
  formatCurrency,
}: {
  subItem: TemplateSubItem;
  parentIdx: number;
  subIdx: number;
  formatCurrency: (amount: number) => string;
}) {
  const subTotal = subItem.unitPrice * subItem.defaultQuantity;

  return (
    <div className="flex items-center py-1.5 text-white/60 hover:bg-white/2 rounded-lg transition-colors px-2">
      <div className="w-10 text-center">
        <span className="text-[9px] font-medium text-white/20">
          {parentIdx + 1}.{subIdx + 1}
        </span>
      </div>
      <div className="flex-1 min-w-[200px] pl-1">
        <span className="text-xs font-medium">{subItem.description}</span>
      </div>
      <div className="w-16 text-center text-[9px] font-bold uppercase text-white/30">
        {subItem.unit}
      </div>
      <div className="w-14 text-center text-xs font-bold text-white/50">
        {subItem.defaultQuantity}
      </div>
      <div className="w-20 text-right text-xs font-mono text-white/40">
        {subItem.unitPrice.toLocaleString()}
      </div>
      <div className="w-24 text-right pr-1 text-xs font-bold text-white/60">
        {formatCurrency(subTotal)}
      </div>
      <div className="w-20" />
    </div>
  );
}
