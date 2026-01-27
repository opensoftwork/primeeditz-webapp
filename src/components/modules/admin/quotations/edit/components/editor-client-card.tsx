"use client";

import { Building2, FileText, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { useQuotationBuilder } from "../../builder/quotation-builder-context";

export function EditorClientCard() {
  const { selectedStudio } = useQuotationBuilder();

  if (!selectedStudio) {
    return (
      <div className="p-6 rounded-[2rem] bg-white/2 border border-white/5">
        <div className="flex items-center gap-3 text-white/30">
          <User className="h-5 w-5" />
          <span className="text-sm font-medium">No client selected</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2rem] bg-white/2 border border-white/5 space-y-4"
    >
      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">
        Quotation For
      </h3>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="text-xl font-black text-primary">
            {selectedStudio.name?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>

        {/* Client Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <h4 className="text-lg font-black text-white tracking-tight truncate">
            {selectedStudio.name}
          </h4>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {selectedStudio.email && (
              <div className="flex items-center gap-1.5 text-white/50">
                <Mail className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {selectedStudio.email}
                </span>
              </div>
            )}

            {selectedStudio.company && (
              <div className="flex items-center gap-1.5 text-white/50">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {selectedStudio.company}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Type Badge */}
        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
            {selectedStudio.company ? "Business" : "Individual"}
          </span>
        </div>
      </div>

      {/* Info Note */}
      <div className="pt-3 border-t border-white/5">
        <p className="text-[10px] text-white/30 font-medium leading-relaxed flex items-center gap-2">
          <FileText className="h-3 w-3" />
          Client details are locked for this quotation. Create a new quotation
          to bill a different client.
        </p>
      </div>
    </motion.div>
  );
}
