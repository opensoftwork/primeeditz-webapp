/**
 * Pricing Summary (Service Package Review)
 *
 * Displays the final cost structure in a professional table format.
 */

"use client";

import React from "react";
import { CreditCard, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBuilder } from "../../builder-context";

interface PricingSummaryProps {
  lineItems: any[];
}

export function PricingSummary({ lineItems }: PricingSummaryProps) {
  const { goToStep } = useBuilder();

  return (
    <div className="group space-y-4">
      <div className="flex items-center justify-between ml-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            Pricing Summary
          </h3>
        </div>
        <button
          onClick={() => goToStep(3)}
          className="h-8 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all text-white"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>

      <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle hover:border-white/10 transition-colors shadow-2xl shadow-black/20 p-0">
        <CardContent className="p-0">
          <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight">
                Cost Structure
              </h4>
            </div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
              <Save className="h-3 w-3" /> Itemized Breakdown
            </p>
          </div>

          <div className="p-8">
            <div className="w-full bg-white/2 rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-left">
                    <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30 w-12 text-center">
                      #
                    </th>
                    <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30">
                      Description
                    </th>
                    <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-center w-20">
                      Qty
                    </th>
                    <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-right w-28">
                      Rate
                    </th>
                    <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-right w-32">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {lineItems.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      <tr className="group bg-white/2 hover:bg-white/4 transition-colors">
                        <td className="py-3 px-4 text-[11px] font-black text-white/20 text-center tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[13px] font-bold text-white uppercase tracking-tight">
                            {item.description}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] font-bold text-white/40 text-center">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-[11px] font-mono font-bold text-white/40 text-right">
                          ₹{Number(item.rate).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-[13px] font-mono font-black text-white text-right">
                          ₹{Number(item.rate * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                      {item.subItems?.map((sub: any, sIdx: number) => (
                        <React.Fragment key={sub.id}>
                          <tr className="bg-white/1 border-l-2 border-primary/20 group hover:bg-white/3 transition-colors">
                            <td className="py-2.5 px-4 text-[9px] font-bold text-white/10 text-center tabular-nums">
                              {idx + 1}.{sIdx + 1}
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2 pl-2">
                                <span className="text-white/10 font-light translate-y-[-2px]">
                                  └
                                </span>
                                <span className="text-[11px] font-bold text-white/50">
                                  {sub.description}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-[10px] text-white/30 text-center tabular-nums">
                              {sub.quantity}
                            </td>
                            <td className="py-2.5 px-4 text-[10px] font-mono text-white/30 text-right">
                              ₹{Number(sub.rate).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-[12px] font-mono font-bold text-white/40 text-right">
                              ₹
                              {Number(sub.rate * sub.quantity).toLocaleString()}
                            </td>
                          </tr>
                          {sub.subItems?.map((ssub: any, ssIdx: number) => (
                            <tr
                              key={ssub.id}
                              className="bg-white/0.5 border-l-2 border-primary/10 group hover:bg-white/2 transition-colors"
                            >
                              <td className="py-1.5 px-4 text-[8px] text-white/5 text-center tabular-nums">
                                {idx + 1}.{sIdx + 1}.{ssIdx + 1}
                              </td>
                              <td className="py-1.5 px-4">
                                <div className="flex items-center gap-2 pl-6">
                                  <span className="text-white/5 font-light translate-y-[-2px]">
                                    └
                                  </span>
                                  <span className="text-[10px] text-white/30 italic">
                                    {ssub.description}
                                  </span>
                                </div>
                              </td>
                              <td className="py-1.5 px-4 text-[9px] text-white/20 text-center tabular-nums">
                                {ssub.quantity}
                              </td>
                              <td className="py-1.5 px-4 text-[9px] font-mono text-white/20 text-right">
                                ₹{Number(ssub.rate).toLocaleString()}
                              </td>
                              <td className="py-1.5 px-4 text-[11px] font-mono font-bold text-white/20 text-right">
                                ₹
                                {Number(
                                  ssub.rate * ssub.quantity,
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                  {lineItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-[10px] font-black uppercase tracking-widest text-white/20"
                      >
                        No line items configured
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
