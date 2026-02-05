"use client";

import { FileText, Pencil, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useBuilder } from "../../builder-context";

export function TermsSummary() {
  const { step3Data, setCurrentStep } = useBuilder();

  return (
    <div className="group space-y-4">
      <div className="flex items-center justify-between ml-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            Terms & Conditions
          </h3>
        </div>
        <button
          onClick={() => setCurrentStep(4)}
          className="h-8 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>

      <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle hover:border-white/10 transition-colors shadow-2xl shadow-black/20">
        <CardContent className="p-0">
          <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight">
                Agreement Compliance
              </h4>
            </div>
          </div>
          <div className="p-8">
            {step3Data?.terms ? (
              <div className="space-y-4">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                  <Check className="h-3 w-3" /> Standardized Terms
                </p>
                <p className="text-[11px] text-white/50 leading-relaxed italic whitespace-pre-line font-medium bg-black/20 p-4 rounded-2xl border border-white/5">
                  {step3Data.terms}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <FileText className="h-10 w-10 text-white/5 mb-4" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                  No terms defined
                </p>
                <p className="text-[9px] text-white/20 mt-1 uppercase font-bold tracking-widest">
                  Standard legal backup will be applied
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
