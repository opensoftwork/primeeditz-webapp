"use client";

import { ShieldCheck, User, Calendar, MapPin, Tag } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useRequestWizard } from "../request-wizard-context";
import { SelectedPackagesSummary } from "../../../quotation-request/selected-packages-summary";

export function Step3Review() {
  const { formData, selectedPackageIds } = useRequestWizard();

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8 w-full pb-12"
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

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="rounded-full bg-white/5 border-white/10 text-white/40 text-[8px] font-black uppercase tracking-widest px-2 py-0.5"
              >
                Engagement Intel
              </Badge>
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                  Protocol Verified
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Client */}
              <div className="space-y-1.5 font-outfit">
                <div className="flex items-center gap-2 text-white/20">
                  <User className="h-3.5 w-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Client Identity
                  </span>
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-tight truncate">
                  {formData.endClientName || "N/A"}
                </p>
              </div>

              {/* Event */}
              <div className="space-y-1.5 font-outfit">
                <div className="flex items-center gap-2 text-white/20">
                  <Tag className="h-3.5 w-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Event
                  </span>
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-tight truncate">
                  {formData.eventName || "General Production"}
                </p>
              </div>

              {/* Date */}
              <div className="space-y-1.5 font-outfit">
                <div className="flex items-center gap-2 text-white/20">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Schedule
                  </span>
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-tight">
                  {formData.eventDate
                    ? new Date(formData.eventDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "TBD"}
                </p>
              </div>

              {/* Venue */}
              <div className="space-y-1.5 font-outfit">
                <div className="flex items-center gap-2 text-white/20">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Venue
                  </span>
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-tight truncate">
                  {formData.venue || "Global Distribution"}
                </p>
              </div>
            </div>

            {formData.notes && (
              <div className="pt-4 border-t border-white/5 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                  Project Directive
                </span>
                <p className="text-xs text-white/50 leading-relaxed font-medium line-clamp-2 italic">
                  "{formData.notes}"
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Multi-Package Summary */}
        <div className="pt-4">
          <SelectedPackagesSummary selectedIds={selectedPackageIds} />
        </div>
      </div>
    </motion.div>
  );
}
