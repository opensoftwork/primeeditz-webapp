"use client";

import { motion } from "motion/react";
import { User, Calendar } from "lucide-react";
import { format } from "date-fns";

interface StudioProjectInfoProps {
  quotation: any;
}

export function StudioProjectInfo({ quotation }: StudioProjectInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-white/2 border border-white/5"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="h-1.5 w-1 rounded-full bg-primary" />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60">
          Studio & Intent
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-1">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
            Strategic Studio
          </p>
          <p className="text-xs font-bold text-white uppercase tracking-tight">
            {quotation.clientId || "Universal"}
          </p>
        </div>
        {quotation.projectId && (
          <div className="space-y-1">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
              Associated Project
            </p>
            <div className="flex flex-col">
              <p className="text-xs font-bold text-white uppercase tracking-tight">
                {quotation.projectName || "General Project"}
              </p>
              {quotation.projectCode &&
                quotation.projectName !== quotation.projectCode && (
                  <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest mt-0.5">
                    {quotation.projectCode}
                  </span>
                )}
            </div>
          </div>
        )}
        {quotation.validUntil && (
          <div className="space-y-1">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
              Proposal Validity
            </p>
            <p className="text-xs font-bold text-white uppercase tracking-tight">
              {format(quotation.validUntil, "MMM dd, yyyy")}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
