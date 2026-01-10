"use client";

import React from "react";
import { format } from "date-fns";
import { Clock, Calendar, Database, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { SidebarItem } from "./shared";
import { Button } from "@/components/ui/button";

interface DetailSidebarProps {
  project: any;
}

export function DetailSidebar({ project }: DetailSidebarProps) {
  return (
    <div className="space-y-10">
      {/* Context Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="p-8 rounded-[2.5rem] bg-white/4 border border-white/10 relative overflow-hidden group shadow-2xl"
      >
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[30px_30px]" />
        <div className="relative z-10 space-y-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
              Production Context
            </h3>
            <div className="space-y-4">
              {[
                {
                  icon: <Clock className="h-4 w-4" />,
                  label: "Scheduled Delivery",
                  value: project.preferredDeliveryDate
                    ? format(project.preferredDeliveryDate, "PPP")
                    : "ASAP",
                },
                {
                  icon: <Calendar className="h-4 w-4" />,
                  label: "Submitted On",
                  value: format(project._creationTime, "PPP"),
                },
                {
                  icon: <Database className="h-4 w-4" />,
                  label: "Asset Volume",
                  value: `${project.referenceFiles?.length || 0} Files`,
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.4 }}
                >
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {project.description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="pt-8 border-t border-white/5 space-y-3"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">
                Vision & Requirements
              </span>
              <p className="text-[13px] font-bold text-white/60 leading-relaxed italic">
                "{project.description}"
              </p>
            </motion.div>
          )}

          {project.additionalNotes && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="pt-6"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-2">
                Technical Notes
              </span>
              <p className="text-[11px] font-medium text-white/40 leading-relaxed">
                {project.additionalNotes}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Action Card - Placeholder for Quote */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 group overflow-hidden relative shadow-xl hover:bg-primary/8 transition-all duration-500"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:rotate-12 transition-all duration-700">
          <Sparkles className="h-16 w-16 text-primary" />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
          Quotation Status
        </h3>
        <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-6 leading-relaxed">
          Your project is currently in review. We'll issue a production quote
          shortly.
        </p>
        <Button
          disabled
          className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white/20 font-black uppercase tracking-widest text-[9px] cursor-not-allowed"
        >
          QUOTATION PENDING
        </Button>
      </motion.div>
    </div>
  );
}
