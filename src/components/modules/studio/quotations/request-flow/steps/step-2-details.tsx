"use client";

import { motion } from "motion/react";
import { FileText, User, Rocket, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRequestWizard } from "../request-wizard-context";

export function Step2Details() {
  const { formData, setFormData } = useRequestWizard();

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 w-full"
    >
      <h2 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
        <FileText className="h-4 w-4" /> 2. Engagement Specifications
      </h2>

      <div className="space-y-6">
        {/* End Client Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
            <User className="h-3 w-3" /> End Client Name / Family Name
          </label>
          <Input
            value={formData.endClientName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                endClientName: e.target.value,
              }))
            }
            placeholder="e.g. Sharma Family Wedding"
            className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white"
          />
        </div>

        {/* Event Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
            <Rocket className="h-3 w-3" /> Event Variant / Description
          </label>
          <Input
            value={formData.eventName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                eventName: e.target.value,
              }))
            }
            placeholder="e.g. 3-Day Destination Wedding"
            className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white"
          />
        </div>

        {/* Event Date */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
            <Calendar className="h-3 w-3" /> Expected Event Date
          </label>
          <Input
            type="date"
            value={formData.eventDate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                eventDate: e.target.value,
              }))
            }
            className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white scheme-dark"
          />
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
            <FileText className="h-3 w-3" /> Additional Requirements
          </label>
          <Textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            placeholder="Tell us more about the scope, specific deliverables or deadlines..."
            className="min-h-[120px] bg-white/5 border-white/10 rounded-xl font-medium text-white resize-none"
          />
        </div>
      </div>
    </motion.div>
  );
}
