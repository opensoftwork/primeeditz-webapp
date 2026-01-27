"use client";

import { Package, ShieldCheck, User } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useRequestWizard } from "../request-wizard-context";

export function Step3Review() {
  const { formData, templates, selectedPackage, projectTypes } =
    useRequestWizard();

  const pkg = templates?.find((t) => t._id === selectedPackage);
  const projectType = pkg
    ? projectTypes?.find((pt: any) => pt._id === pkg.projectTypeHint)
    : null;

  const totalAmount =
    pkg?.lineItems.reduce(
      (acc: number, item: any) => acc + item.unitPrice * item.defaultQuantity,
      0,
    ) || 0;

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8 w-full    pb-12"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">
            Final Confirmation
          </span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
          Production Manifest
        </h2>
        <p className="text-xs font-semibold text-white/40 leading-relaxed">
          Verify the engagement parameters and production standards.
        </p>
      </div>

      <div className="space-y-6">
        {/* Top: Engagement Intel */}
        <Card className="bg-zinc-900/30 border-white/5 p-6 relative overflow-hidden group rounded-3xl">
          <div className="absolute inset-0 bg-white/1 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full bg-white/5 border-white/10 text-white/40 text-[8px] font-black uppercase tracking-widest px-2 py-0.5"
              >
                Engagement Intel
              </Badge>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Client */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 text-white/40">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20">
                    End Client Identity
                  </p>
                  <p className="text-xl font-black text-white uppercase tracking-tight">
                    {formData.endClientName || "Not Specified"}
                  </p>
                </div>
              </div>

              {/* Protocol Verification Note */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10 max-w-sm">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <p className="text-[9px] font-bold text-primary/60 leading-tight uppercase tracking-widest">
                  Strategic parameters verified for production deployment.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom: Package Identity & Details */}
        <Card className="bg-zinc-900/30 border-white/5 overflow-hidden flex flex-col relative group rounded-[2.5rem]">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px] pointer-events-none" />

          <div className="p-8 space-y-10 relative z-10 flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="rounded-full bg-primary/10 border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest px-3 py-1"
                >
                  Selected Production Model
                </Badge>
                <div className="space-y-1">
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-white leading-none">
                    {pkg?.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Package className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {projectType?.name || "Standard Production"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                  Base Production Value
                </div>
                <div className="text-4xl font-black text-white tracking-tighter">
                  ₹{totalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Line Items Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shadow-[0_0_5px_rgba(var(--primary),0.5)]" />
                  Production Deliverables
                </h3>
                <div className="h-px w-full bg-white/5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pkg?.lineItems.map((item: any, index: number) => (
                  <div
                    key={`${item.description}-${index}`}
                    className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between gap-4 group/item hover:bg-white/5 hover:border-white/10 transition-all duration-300"
                  >
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-white uppercase tracking-tight leading-none group-hover/item:text-primary transition-colors">
                        {item.description}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[8px] font-bold border-white/5 bg-white/5 text-white/40 uppercase tracking-widest px-1.5 py-0"
                      >
                        {item.quantity} {item.unit}
                      </Badge>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-black text-white/60 tracking-tighter">
                        ₹{item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Standards */}
            {pkg?.terms && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    Production Standards
                  </h3>
                  <div className="h-px w-full bg-white/5" />
                </div>
                <div className="p-6 rounded-3xl bg-black/40 border border-white/5 relative overflow-hidden">
                  <pre className="text-[12px] font-medium text-white/50 leading-relaxed whitespace-pre-wrap font-sans italic">
                    {pkg.terms}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
