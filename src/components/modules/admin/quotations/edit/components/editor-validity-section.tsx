"use client";

import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useQuotationBuilder } from "../../builder/quotation-builder-context";

export function EditorValiditySection() {
  const { formData, setFormData } = useQuotationBuilder();
  const validUntil = formData.step1.validUntil;

  const daysRemaining = validUntil
    ? differenceInDays(validUntil, new Date())
    : null;

  const isExpired = validUntil ? isPast(validUntil) : false;

  return (
    <div className="p-6 rounded-[2rem] bg-white/2 border border-white/5 space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
        <Clock className="h-3 w-3" />
        Validity Settings
      </h3>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full h-14 bg-white/5 border-white/5 rounded-2xl px-5 flex items-center justify-between text-white font-bold hover:bg-white/10 transition-colors text-left",
              !validUntil && "text-white/40",
              isExpired && "border-red-500/30 bg-red-500/5",
            )}
          >
            <span>
              {validUntil ? format(validUntil, "PPP") : "Set expiry date"}
            </span>
            <CalendarIcon className="h-4 w-4 opacity-40" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-zinc-900 border-white/10"
          align="end"
        >
          <Calendar
            mode="single"
            selected={validUntil}
            onSelect={(date) => {
              setFormData("step1", {
                validUntil: date ?? undefined,
              });
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Status Indicator */}
      {validUntil && (
        <div
          className={cn(
            "p-3 rounded-xl text-center",
            isExpired
              ? "bg-red-500/10 border border-red-500/20"
              : daysRemaining !== null && daysRemaining <= 7
                ? "bg-amber-500/10 border border-amber-500/20"
                : "bg-emerald-500/10 border border-emerald-500/20",
          )}
        >
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isExpired
                ? "text-red-400"
                : daysRemaining !== null && daysRemaining <= 7
                  ? "text-amber-400"
                  : "text-emerald-400",
            )}
          >
            {isExpired
              ? "Expired"
              : daysRemaining === 0
                ? "Expires Today"
                : daysRemaining === 1
                  ? "1 Day Remaining"
                  : `${daysRemaining} Days Remaining`}
          </span>
        </div>
      )}
    </div>
  );
}
