"use client";

import { ChevronDown, Scale } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UNITS } from "@/lib/constants/units";
import { cn } from "@/lib/utils";

interface NestedUnitSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  size?: "sm" | "default";
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Get category name in a display-friendly format
 */
function getCategoryDisplayName(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function NestedUnitSelector({
  value,
  onValueChange,
  className,
  triggerClassName,
  size = "default",
  disabled = false,
  placeholder = "Select unit",
}: NestedUnitSelectorProps) {
  const categories = React.useMemo(() => Object.keys(UNITS), []);

  const handleUnitSelect = (unit: string) => {
    if (onValueChange) {
      onValueChange(unit);
    }
  };

  const displayValue = value ? value.toUpperCase() : placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={size}
          disabled={disabled}
          className={cn(
            "h-11 bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/10 transition-all rounded-xl px-4 flex items-center justify-between min-w-[140px] group",
            triggerClassName,
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Scale className="h-3.5 w-3.5 text-white/20 group-hover:text-primary transition-colors shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider truncate">
              {displayValue}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-white/20 group-hover:text-white transition-colors shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "min-w-[220px] bg-zinc-900/95 backdrop-blur-3xl border-white/10 rounded-2xl shadow-2xl p-2",
          className,
        )}
        align="start"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-3 py-3">
          Measurement Units
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5 mx-2" />
        <div className="space-y-1 mt-1">
          {categories.map((category) => (
            <DropdownMenuSub key={category}>
              <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 rounded-xl focus:bg-primary/20 focus:text-white data-[state=open]:bg-primary/20 transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-tight">
                  {getCategoryDisplayName(category)}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="min-w-[160px] bg-zinc-900/98 backdrop-blur-3xl border-white/10 rounded-2xl shadow-2xl p-2 ml-1">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1 space-y-1">
                  {UNITS[category as keyof typeof UNITS].map((unit) => (
                    <DropdownMenuItem
                      key={unit}
                      onClick={() => handleUnitSelect(unit)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                        value === unit
                          ? "bg-primary text-primary-foreground font-black"
                          : "text-white/70 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-widest">
                        {unit}
                      </span>
                      {value === unit && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
