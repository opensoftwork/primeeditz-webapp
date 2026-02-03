"use client";

import { User, Calendar, MapPin, Tag, FileText } from "lucide-react";
import { motion } from "motion/react";
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
      className="space-y-12 w-full pb-12"
    >
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight uppercase text-white">
          Review & Send
        </h2>
        <p className="text-sm text-white/40 font-medium">
          Verify details before submitting your request
        </p>
      </div>

      <div className="space-y-8">
        {/* Project Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-white/20" />
              Project Details
            </h3>
            <div className="h-px w-full bg-white/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Client */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/20">
                <User className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Client Identity
                </span>
              </div>
              <p className="text-sm font-black text-white uppercase tracking-wider truncate">
                {formData.endClientName || "N/A"}
              </p>
            </div>

            {/* Event */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/20">
                <Tag className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Event
                </span>
              </div>
              <p className="text-sm font-black text-white uppercase tracking-wider truncate">
                {formData.eventName || "General Production"}
              </p>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/20">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Schedule
                </span>
              </div>
              <p className="text-sm font-black text-white uppercase tracking-wider">
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
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/20">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Venue
                </span>
              </div>
              <p className="text-sm font-black text-white uppercase tracking-wider truncate">
                {formData.venue || "Global Distribution"}
              </p>
            </div>
          </div>

          {formData.notes && (
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-white/20">
                <FileText className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Requirements & Notes
                </span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                {formData.notes}
              </p>
            </div>
          )}
        </div>

        {/* Selected Packages */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-white/20" />
              Selected Packages
            </h3>
            <div className="h-px w-full bg-white/5" />
          </div>
          
          <SelectedPackagesSummary selectedIds={selectedPackageIds} />
        </div>
      </div>
    </motion.div>
  );
}
