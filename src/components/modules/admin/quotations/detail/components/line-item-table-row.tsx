/**
 * Line Item Table Row (Admin Detail View)
 *
 * A recursive table row component for displaying quotation items and their sub-items.
 * Supports up to 3 levels of nesting with professional indentations and numbering.
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LineItemRowProps {
  item: {
    id: string;
    description: string;
    unit: string;
    rate: number;
    quantity: number;
    subItems?: any[];
  };
  index: number;
  level?: number;
  parentNumber?: string;
  formatCurrency: (amount: number) => string;
}

export function LineItemRow({
  item,
  index,
  level = 0,
  parentNumber = "",
  formatCurrency,
}: LineItemRowProps) {
  const itemNumber = parentNumber ? `${parentNumber}.${index}` : `${index}`;
  const amount = item.rate * item.quantity;
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <React.Fragment>
      <tr
        className={cn(
          "group transition-colors",
          level === 0
            ? "hover:bg-white/3"
            : level === 1
              ? "bg-white/1 hover:bg-white/2"
              : "bg-transparent hover:bg-white/1",
        )}
      >
        <td className="py-3 px-4 text-center">
          <span
            className={cn(
              "font-black tabular-nums",
              level === 0
                ? "text-[10px] text-white/20"
                : level === 1
                  ? "text-[9px] text-white/10"
                  : "text-[8px] text-white/5",
            )}
          >
            {itemNumber}
          </span>
        </td>
        <td className="py-3 px-4">
          <div
            className={cn(
              "flex items-center",
              level === 0
                ? "font-bold text-[13px] text-white"
                : level === 1
                  ? "font-semibold text-xs text-white/60 pl-4"
                  : "font-medium text-[11px] text-white/40 pl-8",
            )}
          >
            {level > 0 && (
              <span className="font-light mr-2 text-white/20 -translate-y-px">
                └
              </span>
            )}
            {item.description}
          </div>
        </td>
        <td className="py-3 px-4 text-center">
          <span
            className={cn(
              "uppercase tracking-widest text-[9px] font-bold",
              level === 0 ? "text-white/40" : "text-white/20",
            )}
          >
            {item.unit}
          </span>
        </td>
        <td className="py-3 px-4 text-center">
          <span
            className={cn(
              "font-black text-[11px]",
              level === 0 ? "text-white/60" : "text-white/30",
            )}
          >
            {item.quantity}
          </span>
        </td>
        <td className="py-3 px-4 text-right">
          <span
            className={cn(
              "font-mono font-bold text-[11px] tabular-nums",
              level === 0 ? "text-white/40" : "text-white/20",
            )}
          >
            {formatCurrency(item.rate)}
          </span>
        </td>
        <td className="py-3 px-4 text-right">
          <span
            className={cn(
              "font-mono font-black tabular-nums",
              level === 0
                ? "text-[13px] text-white"
                : "text-[11px] text-white/40",
            )}
          >
            {formatCurrency(amount)}
          </span>
        </td>
      </tr>

      {/* Recursive sub-items */}
      {hasSubItems &&
        item.subItems?.map((sub: any, sIdx: number) => (
          <LineItemRow
            key={sub.id || `${item.id}-sub-${sIdx}`}
            item={sub}
            index={sIdx + 1}
            level={level + 1}
            parentNumber={itemNumber}
            formatCurrency={formatCurrency}
          />
        ))}
    </React.Fragment>
  );
}
