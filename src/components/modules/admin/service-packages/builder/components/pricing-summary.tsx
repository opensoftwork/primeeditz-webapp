"use client";

import { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { ReceiptIndianRupee, Package, Layers } from "lucide-react";
import type { LineItem, ProjectConfig } from "../builder-context";

interface PricingSummaryProps {
  lineItems: LineItem[];
  projectConfigs: ProjectConfig[];
  applyGST: boolean;
}

export function PricingSummary({
  lineItems,
  projectConfigs,
  applyGST,
}: PricingSummaryProps) {
  // Group line items by projectConfigId
  const groupedTotals = useMemo(() => {
    const groups: Record<string, { label: string; subtotal: number; items: LineItem[] }> = {
      __general__: { label: "General / Shared", subtotal: 0, items: [] },
    };

    projectConfigs.forEach((config) => {
      groups[config.id] = {
        label: config.label || "Untitled Project",
        subtotal: 0,
        items: [],
      };
    });

    lineItems.forEach((item) => {
      const key = item.projectConfigId || "__general__";
      const targetGroup = groups[key] || groups.__general__;
      targetGroup.items.push(item);
      targetGroup.subtotal += (item.rate || 0) * (item.quantity || 1);
    });

    return Object.entries(groups)
      .filter(([_, data]) => data.items.length > 0)
      .map(([id, data]) => ({ id, ...data }));
  }, [lineItems, projectConfigs]);

  const packageSubtotal = groupedTotals.reduce((sum, g) => sum + g.subtotal, 0);
  const gstAmount = applyGST ? Math.round(packageSubtotal * 0.18) : 0;
  const total = packageSubtotal + gstAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
      {/* Left: Project Breakdowns */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 ml-1">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Breakdown by Project
          </h3>
        </div>
        
        <div className="space-y-3">
          {groupedTotals.map((group) => (
            <div 
              key={group.id} 
              className="bg-white/2 border border-white/5 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/60">
                  <Package className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {group.label}
                  </span>
                </div>
                <span className="text-xs font-black text-white tracking-widest">
                  ₹{group.subtotal.toLocaleString()}
                </span>
              </div>
              
              <ul className="space-y-1.5 pl-5 border-l border-white/5">
                {group.items.map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40 font-medium">
                      {item.description}
                      <span className="ml-2 text-[9px] opacity-50">
                        ({item.quantity} × {item.unit})
                      </span>
                    </span>
                    <span className="text-white/60 font-bold tabular-nums">
                      ₹{((item.rate || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Package Totals */}
      <div className="flex flex-col justify-end">
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 space-y-6">
           <div className="space-y-3">
             <div className="flex justify-between items-center text-sm px-1">
               <span className="font-black text-white/20 uppercase tracking-widest text-[10px]">
                 Subtotal
               </span>
               <span className="font-black text-white tracking-widest">
                 ₹{packageSubtotal.toLocaleString()}
               </span>
             </div>

             <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
               <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                   GST Component (18%)
                 </span>
               </div>
               <span className="text-[10px] font-black text-primary tracking-widest">
                 +₹{gstAmount.toLocaleString()}
               </span>
             </div>
           </div>

           <Separator className="bg-white/5" />

           <div className="flex justify-between items-center px-1">
             <div className="flex items-center gap-2">
               <ReceiptIndianRupee className="h-5 w-5 text-primary" />
               <span className="font-black text-white uppercase tracking-widest text-[11px]">
                 Package Total
               </span>
             </div>
             <div className="text-right">
               <span className="text-3xl font-black text-white tracking-tighter italic">
                 ₹{total.toLocaleString()}
               </span>
               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">
                 final cost to client
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
