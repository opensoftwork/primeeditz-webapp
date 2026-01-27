"use client";

import { AlertCircle, FileText, User } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">
            Engagement Protocol
          </span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
          Project Intel
        </h2>
        <p className="text-xs font-semibold text-white/40 max-w-lg leading-relaxed">
          Configure parameters for this production request.
        </p>
      </div>

      <Card className="bg-zinc-900/30 border-white/5 p-6 rounded-3xl backdrop-blur-sm overflow-hidden relative group">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -mr-24 -mt-24 pointer-events-none transition-opacity duration-1000 group-hover:opacity-100 opacity-50" />

        <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 relative z-10">
          {/* End Client Name */}
          <Field className="space-y-2">
            <FieldLabel
              htmlFor="endClientName"
              className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-2"
            >
              End Client Identity <span className="text-primary">*</span>
            </FieldLabel>
            <div className="relative group/input">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-primary transition-colors">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="endClientName"
                value={formData.endClientName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endClientName: e.target.value,
                  }))
                }
                placeholder="e.g. Sharma Family Wedding"
                className="pl-11 h-12 bg-black/20 border-white/5 rounded-2xl font-bold text-white text-base focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-white/10"
              />
            </div>
          </Field>

          {/* Technical Requirements */}
          <Field className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between pl-2 pr-1">
              <FieldLabel
                htmlFor="notes"
                className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2"
              >
                Technical Requirements & Notes
              </FieldLabel>
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-primary/60 uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                <AlertCircle className="h-2.5 w-2.5" />
                <span>Optional</span>
              </div>
            </div>
            <div className="relative group/input">
              <div className="absolute left-4 top-4 text-white/20 group-focus-within/input:text-primary transition-colors">
                <FileText className="h-4 w-4" />
              </div>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Specify scope, special deliverables, raw footage handling, or strict deadlines..."
                className="pl-11 py-4 min-h-[120px] bg-black/20 border-white/5 rounded-2xl font-medium text-white text-sm leading-relaxed focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-white/10"
              />
            </div>
            <FieldDescription className="text-[9px] text-white/20 font-medium pl-2 max-w-2xl leading-relaxed">
              * Please verify client details carefully.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </Card>
    </motion.div>
  );
}
