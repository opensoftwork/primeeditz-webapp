"use client";

import { motion } from "motion/react";
import { CheckCircle2, Calendar as CalendarIcon, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ClientDataTable } from "../../../clients/client-data-table";
import { useQuotationBuilder } from "../../builder/quotation-builder-context";
import type { Client } from "../../builder/types";

export function EditorClientSection() {
  const { formData, setFormData, selectedClient } = useQuotationBuilder();
  const step1Data = formData.step1;

  const handleClientSelect = (client: Client) => {
    setFormData("step1", { clientId: client._id });
    toast.success(`Selected ${client.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-black tracking-tight uppercase text-white">
          Client & Validity
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Selection */}
        <div className="p-6 rounded-[2rem] bg-white/2 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">
              Recipient
            </h3>
            {step1Data.clientId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
              >
                <CheckCircle2 className="h-3 w-3 text-primary" />
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                  {selectedClient?.name}
                </span>
              </motion.div>
            )}
          </div>

          <ClientDataTable
            onSelect={handleClientSelect}
            selectedId={step1Data.clientId}
            onlyWithProjects
          />
        </div>

        {/* Project & Validity Window */}
        <div className="p-6 rounded-[2rem] bg-white/2 border border-white/5 space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-3">
              Validity Window
            </h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-14 bg-white/5 border-white/5 rounded-2xl px-5 flex items-center justify-between text-white font-bold hover:bg-white/10 transition-colors text-left",
                    !step1Data.validUntil && "text-white/40"
                  )}
                >
                  <span>
                    {step1Data.validUntil
                      ? format(step1Data.validUntil, "PPP")
                      : "Pick a date"}
                  </span>
                  <CalendarIcon className="h-4 w-4 opacity-40" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-zinc-900 border-white/10"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={step1Data.validUntil}
                  onSelect={(date) => {
                    setFormData("step1", {
                      validUntil: date ?? undefined,
                    });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-white/40 font-medium leading-relaxed">
              Updating the recipient will refresh the available projects and
              pricing logic for this quotation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
