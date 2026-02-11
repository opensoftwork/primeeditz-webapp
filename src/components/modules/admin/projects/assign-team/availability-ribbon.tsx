"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AvailabilityRibbonProps {
  days?: number;
}

export function AvailabilityRibbon({ days = 14 }: AvailabilityRibbonProps) {
  // Mock data for demonstration - in real app, this would come from the server
  const mockSchedule = Array.from({ length: days }, (_, i) => {
    const rand = Math.random();
    if (rand > 0.8) return "busy";
    if (rand > 0.6) return "leave";
    return "free";
  });

  return (
    <TooltipProvider>
      <div className="flex gap-1 items-center bg-white/5 p-1 rounded-lg border border-white/5 w-fit">
        {mockSchedule.map((status, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "w-2 h-6 rounded-[2px] transition-all duration-300 hover:scale-x-125 cursor-help outline-none",
                  status === "free" &&
                    "bg-emerald-500/20 hover:bg-emerald-500/40",
                  status === "busy" &&
                    "bg-rose-500/60 shadow-[0_0_5px_rgba(244,63,94,0.3)] hover:bg-rose-500/80",
                  status === "leave" && "bg-zinc-500/30 hover:bg-zinc-500/50",
                )}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-950 border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
              <div className="flex flex-col gap-1">
                <span>Day {i + 1}</span>
                <span
                  className={cn(
                    "uppercase",
                    status === "free" && "text-emerald-400",
                    status === "busy" && "text-rose-400",
                    status === "leave" && "text-zinc-400",
                  )}
                >
                  {status}
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
