"use client";

import { motion } from "motion/react";
import { Rocket } from "lucide-react";
import { useRequestWizard } from "../request-wizard-context";

export function Step3Review() {
  const { formData, templates, selectedPackage } = useRequestWizard();

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 w-full"
    >
      <div className="text-center space-y-4">
        <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Rocket className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">
          Ready to Submit?
        </h2>
        <p className="text-white/40 text-[11px] uppercase tracking-widest font-black leading-relaxed">
          Review your engagement details before sending the request to our
          production team.
        </p>
      </div>

      <div className="bg-white/3 border border-white/10 rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
            Package
          </span>
          <span className="text-[11px] font-black uppercase text-primary">
            {templates?.find((t) => t._id === selectedPackage)?.name}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
            End Client
          </span>
          <span className="text-[11px] font-black uppercase text-white">
            {formData.endClientName || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
            Event
          </span>
          <span className="text-[11px] font-black uppercase text-white">
            {formData.eventName || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
            Date
          </span>
          <span className="text-[11px] font-black uppercase text-white">
            {formData.eventDate || "TBD"}
          </span>
        </div>
      </div>

      <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-[0.2em]">
        Your request will be processed into a official quotation.
      </p>
    </motion.div>
  );
}
