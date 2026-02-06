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
  const itemTotal = item.rate * item.quantity;

  return (
    <>
      <tr
        className={cn(
          "border-b border-slate-100 transition-colors",
          level === 0 ? "bg-white font-semibold" : "bg-slate-50/30 text-[11px]",
        )}
      >
        <td className="py-3.5 px-3 text-center text-slate-400 font-bold align-top w-12">
          {itemNumber}
        </td>
        <td className="py-3.5 px-4 align-top">
          <div
            className={cn(
              "text-slate-900",
              level === 0 ? "font-bold text-sm" : "font-medium pl-4",
            )}
          >
            {level > 0 && <span className="text-slate-300 mr-2">└</span>}
            {item.description}
          </div>
        </td>
        <td className="py-3.5 px-2 text-center text-slate-500 align-top uppercase text-[10px] font-bold tracking-wider w-16">
          {item.unit}
        </td>
        <td className="py-3.5 px-2 text-center font-bold text-slate-700 align-top w-14">
          {item.quantity}
        </td>
        <td className="py-3.5 px-3 text-right text-slate-600 align-top tabular-nums font-mono text-sm w-24">
          {formatCurrency(item.rate)}
        </td>
        <td className="py-3.5 px-4 text-right font-black text-slate-900 align-top tabular-nums w-28">
          {formatCurrency(itemTotal)}
        </td>
      </tr>
      {item.subItems?.map((sub, idx) => (
        <DocumentLineItem
          key={`${item.id}-sub-${idx}`}
          item={{ ...sub, id: `${item.id}-sub-${idx}` } as QuotationLineItem}
          index={idx + 1}
          level={level + 1}
          parentNumber={itemNumber}
          formatCurrency={formatCurrency}
        />
      ))}
    </>
  );
}
