"use client";

import { Eye, Pencil, Layout, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBuilder } from "../../builder-context";

export function IdentitySummary() {
  const { step1Data, step2Data, goToStep } = useBuilder();

  return (
    <div className="group space-y-4">
      <div className="flex items-center justify-between ml-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            Identity Summary
          </h3>
        </div>
        <button
          onClick={() => goToStep(1)}
          className="h-8 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
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
                <Layout className="h-4 w-4 text-primary" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight">
                Package Profile
              </h4>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                Package Title
              </p>
              <h4 className="text-xl font-black text-white uppercase tracking-tight">
                {step1Data?.name}
              </h4>
            </div>

            {step1Data?.description && (
              <div className="space-y-2">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                  Public Description
                </p>
                <p className="text-xs text-white/50 leading-relaxed max-w-2xl font-medium">
                  {step1Data.description}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                <Package className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                  Composition:{" "}
                  <span className="text-white">
                    {step2Data?.projectConfigs.length || 0} Project Module
                    {step2Data?.projectConfigs.length !== 1 ? "s" : ""}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
