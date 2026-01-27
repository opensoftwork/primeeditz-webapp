/**
 * Selection Option Card Component
 * Individual option card for studio selection mode
 */

"use client";

import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectionOption } from "./types";
import type { StudioSelectionMode } from "../../types";

interface SelectionOptionCardProps {
  option: SelectionOption;
  isSelected: boolean;
  onSelect: (id: StudioSelectionMode) => void;
}

export function SelectionOptionCard({
  option,
  isSelected,
  onSelect,
}: SelectionOptionCardProps) {
  const Icon = option.icon;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "relative p-6 rounded-xl border transition-all duration-300 text-left group overflow-hidden",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5",
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          isSelected && "opacity-100",
        )}
      >
        <div className="absolute top-0 left-1/2 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative space-y-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            isSelected
              ? "bg-primary/20 text-primary"
              : "bg-white/5 text-white/40 group-hover:text-white/60",
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <h3
            className={cn(
              "font-black text-base uppercase tracking-tight transition-colors",
              isSelected ? "text-primary" : "text-white",
            )}
          >
            {option.title}
          </h3>
          <p className="text-xs text-white/40 mt-1">{option.description}</p>
        </div>

        {/* Selected indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
            >
              <Check className="h-3.5 w-3.5 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
