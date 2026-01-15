"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";

export function SubmissionCard() {
  return (
    <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
        <Check className="h-20 w-20 text-primary" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">
        Ready to Submit
      </h3>
      <p className="text-xs font-semibold text-white/40 leading-relaxed mb-6">
        All information looks good. Click submit below to send your request to
        the production queue.
      </p>
      <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
