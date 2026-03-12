/**
 * Document Line Item Component
 *
 * Renders a single quotation line item and its recursive sub-items
 * for the professional PDF document.
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { QuotationLineItem } from "../../types";

interface DocumentLineItemProps {
  item: QuotationLineItem;
  index: number;
  level?: number;
  parentNumber?: string;
  formatCurrency: (amount: number) => string;
}

export function DocumentLineItem({
  item,
  index,
  level = 0,
  parentNumber = "",
  formatCurrency,
}: DocumentLineItemProps) {
  const itemNumber = parentNumber ? `${parentNumber}.${index}` : `${index}`;
  const amount = item.rate * item.quantity;
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <React.Fragment>
      <tr
        className={cn(
          "break-inside-avoid print:break-inside-avoid",
          level === 0
            ? "border-b border-slate-100"
            : level === 1
              ? "border-b border-slate-50 bg-slate-25"
              : "border-b border-slate-50 bg-slate-50/50",
        )}
      >
        <td className="py-2.5 px-2 text-center align-top">
          <span
            className={cn(
              "font-black tabular-nums",
              level === 0
                ? "text-[9px] text-slate-400"
                : level === 1
                  ? "text-[8px] text-slate-300"
                  : "text-[7px] text-slate-300",
            )}
          >
            {itemNumber}
          </span>
        </td>
        <td className="py-2.5 px-3 align-top">
          <div
            className={cn(
              level === 0
                ? "text-xs font-bold text-slate-800"
                : level === 1
                  ? "text-[11px] font-medium text-slate-600 pl-3"
                  : "text-[10px] font-medium text-slate-500 pl-6 border-l border-slate-100 ml-1 mt-1",
            )}
          >
            {level > 0 && (
              <span className="text-slate-300 mr-1.5 inline-block -translate-y-px">
                └
              </span>
            )}
            <span className={cn(level > 1 && "italic")}>
              {item.description}
            </span>
          </div>
        </td>
        <td
          className={cn(
            "py-2.5 px-2 text-center uppercase tracking-widest align-top",
            level === 0
              ? "text-[9px] text-slate-500"
              : "text-[8px] text-slate-400 font-medium",
          )}
        >
          {item.unit}
        </td>
        <td
          className={cn(
            "py-2.5 px-2 text-center font-bold align-top",
            level === 0
              ? "text-[10px] text-slate-700 font-black"
              : "text-[9px] text-slate-500",
          )}
        >
          {item.quantity}
        </td>
        <td
          className={cn(
            "py-2.5 px-2 text-right font-medium tabular-nums align-top",
            level === 0
              ? "text-[10px] text-slate-500"
              : "text-[9px] text-slate-400",
          )}
        >
          {formatCurrency(item.rate)}
        </td>
        <td
          className={cn(
            "py-2.5 px-3 text-right font-black tabular-nums align-top",
            level === 0
              ? "text-[10px] text-slate-900"
              : "text-[9px] text-slate-600",
          )}
        >
          {formatCurrency(amount)}
        </td>
      </tr>

      {/* Recursive sub-items */}
      {hasSubItems &&
        item.subItems!.map((sub: any, sIdx: number) => (
          <DocumentLineItem
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
