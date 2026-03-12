"use client";

import { FileText } from "lucide-react";
import { motion } from "motion/react";

interface TermsConditionsProps {
  terms?: string;
}

export function TermsConditions({ terms }: TermsConditionsProps) {
  if (!terms) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-5 rounded-2xl bg-white/2 border border-white/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">
          Terms & Conditions
        </h3>
      </div>
      <div className="text-sm text-white/60 font-medium whitespace-pre-wrap leading-relaxed columns-1 md:columns-2 gap-8 text-justify">
        {terms}
      </div>
    </motion.div>
  );
}
