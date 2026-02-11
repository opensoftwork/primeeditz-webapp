/**
 * Summary Sidebar Component
 *
 * Displays quotation totals and selected client info.
 */

"use client";

import { Briefcase, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useQuotationBuilder } from "./quotation-builder-context";

export function SummarySidebar({
  subtotal,
  grandTotal,
  selectedStudio,
}: {
  subtotal: number;
  grandTotal: number;
  selectedStudio: { _id: string; name: string; company?: string } | undefined;
}) {
  const { formData, setFormData, taxAmount, projects } = useQuotationBuilder();
  const { taxRate, discountAmount } = formData.step5;
  const selectedProjects = projects?.filter((p) =>
    formData.step3.projectIds?.includes(p._id),
  );

  return (
    <div className="sticky top-24 p-1 rounded-[2.5rem] bg-white/2 border border-white/5 overflow-hidden">
      <div className="relative p-8 space-y-10">
        {/* Visual Accent */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 blur-3xl -mr-20 -mt-20 opacity-50" />

        <div className="space-y-2 relative">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
            Valuation Overview
          </h2>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white/40 tracking-tighter">
              ₹
            </span>
            <span className="text-5xl font-black text-white tracking-tighter leading-none">
              {grandTotal.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="space-y-5 relative">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white/30 uppercase tracking-widest">
              Base Valuation
            </span>
            <span className="font-bold text-white/60 tracking-wider font-mono">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white/30 uppercase tracking-widest">
              Discount applied
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={discountAmount}
                onChange={(e) =>
                  setFormData("step5", {
                    discountAmount: Number(e.target.value),
                  })
                }
                className="h-8 w-20 bg-white/5 border-none rounded-lg text-right text-xs font-bold text-white focus:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white/30 uppercase tracking-widest">
              GST Rate (%)
            </span>
            <Select
              value={taxRate.toString()}
              onValueChange={(v) =>
                setFormData("step5", { taxRate: Number(v) })
              }
            >
              <SelectTrigger className="h-8 w-20 bg-white/5 border-none rounded-lg font-bold text-xs text-center justify-center">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white min-w-[80px]">
                <SelectItem value="0" className="text-xs font-bold">
                  0%
                </SelectItem>
                <SelectItem value="5" className="text-xs font-bold">
                  5%
                </SelectItem>
                <SelectItem value="12" className="text-xs font-bold">
                  12%
                </SelectItem>
                <SelectItem value="18" className="text-xs font-bold">
                  18%
                </SelectItem>
                <SelectItem value="28" className="text-xs font-bold">
                  28%
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white/30 uppercase tracking-widest">
              Tax Amount
            </span>
            <span className="font-bold text-white/40 tracking-wider font-mono">
              {formatCurrency(taxAmount)}
            </span>
          </div>

          <div className="pt-5 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="font-black text-primary uppercase tracking-widest">
              Grand Total
            </span>
            <span className="font-black text-white text-base tracking-tighter">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Recipient Details (If selected) */}
        {selectedStudio && (
          <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                <User className="h-5 w-5 text-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">
                  Quoting for
                </span>
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  {selectedStudio.name}
                </span>
              </div>
            </div>
            {selectedStudio.company && (
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">
                {selectedStudio.company}
              </p>
            )}
          </div>
        )}

        {/* Selected Projects (If any) */}
        {selectedProjects && selectedProjects.length > 0 && (
          <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">
                  Projects ({selectedProjects.length})
                </span>
              </div>
            </div>
            <div className="space-y-2 pl-1">
              {selectedProjects.map((project) => (
                <div key={project._id} className="space-y-0.5">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">
                    {project.eventName || project.code}
                  </p>
                  <p className="text-[8px] font-medium text-white/30 uppercase tracking-widest">
                    {project.code} • {project.projectTypeName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
