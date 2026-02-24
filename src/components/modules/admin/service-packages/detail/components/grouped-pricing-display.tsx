"use client";

import React from "react";
import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupedPricingDisplayProps {
  lineItems: any[];
  projectConfigs: any[];
  applyGST: boolean;
}

export function GroupedPricingDisplay({
  lineItems,
  projectConfigs,
  applyGST,
}: GroupedPricingDisplayProps) {
  // Group items by projectConfigId
  const groupedItems = lineItems.reduce((acc: any, item: any) => {
    const configId = item.projectConfigId || "general";
    if (!acc[configId]) acc[configId] = [];
    acc[configId].push(item);
    return acc;
  }, {});

  const calculateItemTotal = (item: any): number => {
    const self = (item.rate || 0) * (item.quantity || 0);
    const subTotal = (item.subItems || []).reduce((sum: number, sub: any) => {
      const subSelf = (sub.rate || 0) * (sub.quantity || 0);
      const subSubTotal = (sub.subItems || []).reduce(
        (s: number, ss: any) => s + (ss.rate || 0) * (ss.quantity || 0),
        0,
      );
      return sum + subSelf + subSubTotal;
    }, 0);
    return self + subTotal;
  };

  const calculateSubtotal = (items: any[]) =>
    items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const totalBeforeGST = lineItems.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0,
  );
  const gstAmount = applyGST ? totalBeforeGST * 0.18 : 0;
  const totalWithGST = totalBeforeGST + gstAmount;

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([configId, items]: [string, any]) => {
        const config = projectConfigs.find((c) => c.id === configId);
        const subtotal = calculateSubtotal(items);

        return (
          <div
            key={configId}
            className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden"
          >
            <div className="bg-white/3 px-6 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {config ? config.label : "General / Shared Services"}
              </span>
              <div className="flex items-center gap-1.5 text-white/40">
                <IndianRupee className="h-3 w-3" />
                <span className="text-xs font-bold">
                  {subtotal.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <thead className="border-b border-white/5 bg-white/1">
                  <tr>
                    <th className="px-6 py-3 text-[9px] font-black text-white/20 uppercase tracking-widest">
                      Description
                    </th>
                    <th className="px-6 py-3 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-[9px] font-black text-white/20 uppercase tracking-widest text-center">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item: any, idx: number) => (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4 text-xs font-medium text-white/60">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-white/40 text-right">
                          ₹{item.rate.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-white text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-xs font-black text-white text-right">
                          ₹{calculateItemTotal(item).toLocaleString()}
                        </td>
                      </tr>

                      {/* Level 2 Sub-Items */}
                      {item.subItems?.map((sub: any, sIdx: number) => (
                        <React.Fragment key={sub.id}>
                          <tr className="bg-white/1">
                            <td className="px-6 py-2">
                              <div className="flex items-center gap-2 pl-4">
                                <span className="text-white/10 font-light">
                                  └
                                </span>
                                <span className="text-[11px] font-bold text-white/40">
                                  {sub.description}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-2 text-[10px] text-white/20 text-right">
                              ₹{sub.rate.toLocaleString()}
                            </td>
                            <td className="px-6 py-2 text-[10px] text-white/20 text-center">
                              {sub.quantity}
                            </td>
                            <td className="px-6 py-2 text-[10px] font-bold text-white/30 text-right">
                              ₹
                              {(
                                (sub.rate || 0) * (sub.quantity || 0)
                              ).toLocaleString()}
                            </td>
                          </tr>

                          {/* Level 3 Sub-Items */}
                          {sub.subItems?.map((ssub: any) => (
                            <tr key={ssub.id} className="bg-white/0.5">
                              <td className="px-6 py-1">
                                <div className="flex items-center gap-2 pl-10">
                                  <span className="text-white/5 font-light">
                                    └
                                  </span>
                                  <span className="text-[10px] text-white/20 italic">
                                    {ssub.description}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-1 text-[9px] text-white/10 text-right">
                                ₹{ssub.rate.toLocaleString()}
                              </td>
                              <td className="px-6 py-1 text-[9px] text-white/10 text-center">
                                {ssub.quantity}
                              </td>
                              <td className="px-6 py-1 text-[9px] text-white/10 text-right">
                                ₹
                                {(
                                  (ssub.rate || 0) * (ssub.quantity || 0)
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Totals Section */}
      <div className="flex justify-end pt-4">
        <div className="w-full md:w-80 space-y-3 bg-primary/5 border border-primary/10 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
              Subtotal
            </span>
            <span className="text-sm font-bold text-white">
              ₹{totalBeforeGST.toLocaleString()}
            </span>
          </div>
          {applyGST && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                GST (18%)
              </span>
              <span className="text-sm font-bold text-white">
                ₹{gstAmount.toLocaleString()}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-primary/10 flex items-center justify-between">
            <span className="text-xs font-black text-primary uppercase tracking-widest">
              Total Package Value
            </span>
            <div className="flex items-baseline gap-1 text-primary">
              <span className="text-xs font-black">₹</span>
              <span className="text-2xl font-black tracking-tighter">
                {totalWithGST.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
