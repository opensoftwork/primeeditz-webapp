"use client";

import { motion } from "motion/react";
import { User, Calendar } from "lucide-react";
import { format } from "date-fns";

interface ClientProjectInfoProps {
  quotation: any;
}

export function ClientProjectInfo({ quotation }: ClientProjectInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-white/2 border border-white/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <User className="h-4 w-4 text-primary" />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">
          Client Information
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-wider mb-1">
            Client
          </p>
          <p className="text-sm font-bold text-white">
            {quotation.clientId || "Not specified"}
          </p>
        </div>
        {quotation.projectId && (
          <div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-wider mb-1">
              Project
            </p>
            <p className="text-sm font-bold text-white">
              {quotation.projectId}
            </p>
          </div>
        )}
        {quotation.validUntil && (
          <div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-wider mb-1">
              Valid Until
            </p>
            <p className="text-sm font-bold text-white">
              {format(quotation.validUntil, "MMM dd, yyyy")}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
