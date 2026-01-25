"use client";

import { motion } from "motion/react";
import {
  FileText,
  User,
  Rocket,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useRequestWizard } from "../request-wizard-context";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function Step2Details() {
  const { formData, setFormData } = useRequestWizard();

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 w-full max-w-5xl"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
            Engagement Protocol
          </span>
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tighter text-white">
          Project Intel
        </h2>
        <p className="text-sm font-semibold text-white/40 max-w-lg leading-relaxed">
          Configure the specific parameters for this production request.
          Accurate details ensure precise resource allocation.
        </p>
      </div>

      <Card className="bg-zinc-900/30 border-white/5 p-8 rounded-[2.5rem] backdrop-blur-sm overflow-hidden relative group">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none transition-opacity duration-1000 group-hover:opacity-100 opacity-50" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 relative z-10">
          {/* End Client Name */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-4">
              End Client Identity
            </label>
            <div className="relative group/input">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-primary transition-colors">
                <User className="h-5 w-5" />
              </div>
              <Input
                value={formData.endClientName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endClientName: e.target.value,
                  }))
                }
                placeholder="e.g. Sharma Family Wedding"
                className="pl-12 h-16 bg-black/20 border-white/5 rounded-3xl font-bold text-white text-lg focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-white/10"
              />
            </div>
          </div>

          {/* Event Date */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-4">
              Target Execution Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative group/input cursor-pointer">
                  <div
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10",
                      formData.eventDate
                        ? "text-primary"
                        : "text-white/20 group-hover/input:text-primary",
                    )}
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full pl-12 h-16 bg-black/20 border-white/5 rounded-3xl font-bold text-lg justify-start hover:bg-black/40 hover:text-white hover:border-primary/50 hover:ring-4 hover:ring-primary/5 transition-all text-left",
                      !formData.eventDate && "text-white/10",
                      formData.eventDate ? "text-white" : "text-white/10",
                    )}
                  >
                    {formData.eventDate ? (
                      format(new Date(formData.eventDate), "PPP")
                    ) : (
                      <span>MM / DD / YYYY</span>
                    )}
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-white/10 bg-zinc-950 text-white"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={
                    formData.eventDate
                      ? new Date(formData.eventDate)
                      : undefined
                  }
                  onSelect={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      eventDate: date ? date.toISOString() : "",
                    }))
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Event Variant */}
          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-4">
              Event Variant Identifier
            </label>
            <div className="relative group/input">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-primary transition-colors">
                <Rocket className="h-5 w-5" />
              </div>
              <Input
                value={formData.eventName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventName: e.target.value,
                  }))
                }
                placeholder="e.g. 3-Day Destination Wedding in Jaipur"
                className="pl-12 h-16 bg-black/20 border-white/5 rounded-3xl font-bold text-white text-lg focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-white/10"
              />
            </div>
          </div>

          {/* Technical Requirements */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center justify-between pl-4 pr-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                Technical Requirements & Notes
              </label>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary/60 uppercase tracking-wider bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
                <AlertCircle className="h-3 w-3" />
                <span>Optional</span>
              </div>
            </div>
            <div className="relative group/input">
              <div className="absolute left-4 top-6 text-white/20 group-focus-within/input:text-primary transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Specify scope, special deliverables, raw footage handling, or strict deadlines..."
                className="pl-12 py-6 min-h-[160px] bg-black/20 border-white/5 rounded-3xl font-medium text-white text-base leading-relaxed focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-white/10"
              />
            </div>
            <p className="text-[10px] text-white/20 font-medium pl-4 max-w-2xl leading-relaxed">
              * Please verify client details carefully. These will be used for
              final invoice generation.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
