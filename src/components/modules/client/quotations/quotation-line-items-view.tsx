"use client";

import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  subItems?: {
    description: string;
    unit: string;
    quantity: number;
    rate: number;
  }[];
}

interface Section {
  _id: string;
  name: string;
  color?: string;
}

interface QuotationLineItemsViewProps {
  groupedItems: {
    section: Section;
    items: LineItem[];
  }[];
  formatCurrency: (amount: number) => string;
}

export function QuotationLineItemsView({
  groupedItems,
  formatCurrency,
}: QuotationLineItemsViewProps) {
  return (
    <div className="space-y-10">
      {groupedItems.map(({ section, items }) => (
        <div key={section._id} className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-1.5 h-6 rounded-full",
                section.color === "blue"
                  ? "bg-blue-500"
                  : section.color === "purple"
                    ? "bg-purple-500"
                    : section.color === "green"
                      ? "bg-emerald-500"
                      : section.color === "amber"
                        ? "bg-amber-500"
                        : "bg-white/20",
              )}
            />
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white flex items-center gap-3">
              <Layers className="h-3.5 w-3.5 text-white/20" />
              {section.name}
            </h3>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="rounded-[2rem] border border-white/5 bg-white/2 overflow-hidden shadow-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="py-4 px-6 text-left text-[9px] font-black uppercase tracking-widest text-white/20 w-12">
                    #
                  </th>
                  <th className="py-4 px-6 text-left text-[9px] font-black uppercase tracking-widest text-white/20">
                    Description
                  </th>
                  <th className="py-4 px-4 text-center text-[9px] font-black uppercase tracking-widest text-white/20 w-24">
                    Unit
                  </th>
                  <th className="py-4 px-4 text-center text-[9px] font-black uppercase tracking-widest text-white/20 w-20">
                    Qty
                  </th>
                  <th className="py-4 px-6 text-right text-[9px] font-black uppercase tracking-widest text-white/20 w-32">
                    Rate
                  </th>
                  <th className="py-4 px-8 text-right text-[9px] font-black uppercase tracking-widest text-white/20 w-40">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2">
                {items.map((item, idx) => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    index={idx + 1}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function LineItemRow({
  item,
  index,
  level = 0,
  parentNumber = "",
  formatCurrency,
}: {
  item: any;
  index: number;
  level?: number;
  parentNumber?: string;
  formatCurrency: (amount: number) => string;
}) {
  const itemNumber = parentNumber ? `${parentNumber}.${index}` : `${index}`;
  const amount = item.rate * item.quantity;

  return (
    <>
      <tr
        className={cn(
          "group transition-colors",
          level === 0 ? "hover:bg-white/3" : "bg-black/20 hover:bg-black/40",
        )}
      >
        <td className="py-4 px-6 text-center text-[10px] font-black text-white/20 align-top">
          {itemNumber}
        </td>
        <td className="py-4 px-6 align-top">
          <div
            className={cn(
              "text-white transition-colors",
              level === 0
                ? "font-bold text-sm"
                : "font-medium text-xs text-white/60 pl-4",
            )}
          >
            {level > 0 && (
              <span className="text-white/10 mr-2 font-black">└</span>
            )}
            {item.description}
          </div>
        </td>
        <td className="py-4 px-4 text-center text-[10px] font-black text-white/40 uppercase tracking-widest align-top">
          {item.unit}
        </td>
        <td className="py-4 px-4 text-center text-sm font-black text-white/80 align-top">
          {item.quantity}
        </td>
        <td className="py-4 px-6 text-right text-sm font-medium text-white/40 tabular-nums align-top">
          {formatCurrency(item.rate)}
        </td>
        <td className="py-4 px-8 text-right text-sm font-black text-white tabular-nums align-top">
          {formatCurrency(amount)}
        </td>
      </tr>
      {item.subItems?.map((sub: any, idx: number) => (
        <LineItemRow
          key={`${item.id}-sub-${idx}`}
          item={sub}
          index={idx + 1}
          level={level + 1}
          parentNumber={itemNumber}
          formatCurrency={formatCurrency}
        />
      ))}
    </>
  );
}
