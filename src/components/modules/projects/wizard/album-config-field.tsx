"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlbumConfigFieldProps {
  albumCount: number;
  value: number[];
  onChange: (sheetsPerAlbum: number[]) => void;
  onBlur?: () => void;
  error?: string;
  min?: number;
  max?: number;
}

export function AlbumConfigField({
  albumCount,
  value,
  onChange,
  onBlur,
  error,
  min = 10,
  max = 100,
}: AlbumConfigFieldProps) {
  // Local state for managing input values (allows empty string while typing)
  const [localSheets, setLocalSheets] = useState<(number | "")[]>([]);
  const isSyncingToParent = useRef(false);

  // Sync local state when albumCount changes
  useEffect(() => {
    if (isSyncingToParent.current) {
      return;
    }

    if (albumCount === 0) {
      setLocalSheets([]);
      return;
    }

    // If we have existing values that match the count, use them
    if (value && Array.isArray(value) && value.length === albumCount) {
      setLocalSheets(value);
      return;
    }

    // Adjust local sheets to match album count
    setLocalSheets((prev) => {
      if (prev.length === albumCount) return prev;
      if (prev.length < albumCount) {
        // Extend with empty strings
        return [...prev, ...Array(albumCount - prev.length).fill("")];
      }
      // Trim to album count
      return prev.slice(0, albumCount);
    });
  }, [albumCount, value]);

  // Sync to parent when all values are valid
  useEffect(() => {
    if (albumCount === 0) {
      onChange([]);
      return;
    }

    // Check if all values are valid numbers
    const allValid =
      localSheets.length === albumCount &&
      localSheets.every((s) => typeof s === "number" && s > 0);

    if (allValid) {
      const numericSheets = localSheets.filter(
        (s): s is number => typeof s === "number"
      );

      // Only update if different from current value
      if (JSON.stringify(value) !== JSON.stringify(numericSheets)) {
        isSyncingToParent.current = true;
        onChange(numericSheets);
        setTimeout(() => {
          isSyncingToParent.current = false;
        }, 0);
      }
    }
  }, [localSheets, albumCount, value, onChange]);

  const handleSheetChange = (index: number, inputValue: string) => {
    const numValue = inputValue === "" ? "" : parseInt(inputValue, 10);

    setLocalSheets((prev) => {
      const newSheets = [...prev];
      newSheets[index] = isNaN(numValue as number) ? "" : numValue;
      return newSheets;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrow keys
    if (
      [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey ||
      ["Home", "End"].includes(e.key)
    ) {
      return;
    }

    // Allow numbers (0-9)
    if (/^[0-9]$/.test(e.key)) {
      return;
    }

    // Prevent everything else
    e.preventDefault();
  };

  // Calculate total sheets
  const totalSheets = localSheets.reduce<number>(
    (sum, s) => sum + (typeof s === "number" ? s : 0),
    0
  );

  if (albumCount === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-1.5 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">
                Album Specifications
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium">
                Define exact sheet counts for each of your {albumCount}{" "}
                deliverables
              </p>
            </div>
          </div>
          {totalSheets > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-tighter"
            >
              Total Volume: {totalSheets} sheets
            </motion.div>
          )}
        </div>
      </div>

      {/* Dynamic Album Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <AnimatePresence mode="popLayout">
          {Array.from({ length: albumCount }).map((_, index) => (
            <motion.div
              key={`album-${index}`}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05,
              }}
              className="relative"
            >
              <div
                className={cn(
                  "p-6 rounded-2xl border transition-all duration-300 group cursor-pointer relative overflow-hidden",
                  localSheets[index]
                    ? "bg-primary/5 border-primary/20 shadow-xl ring-1 ring-primary/10"
                    : "bg-white/3 border-white/10 hover:bg-white/5 hover:border-primary/40 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1"
                )}
                onClick={() => {
                  document.getElementById(`album-sheets-${index}`)?.focus();
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em]",
                      localSheets[index]
                        ? "text-primary"
                        : "text-muted-foreground/30"
                    )}
                  >
                    Volume {index + 1}
                  </span>
                  <div
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      localSheets[index] ? "bg-primary/10" : "bg-white/5"
                    )}
                  >
                    <Layers
                      className={cn(
                        "h-3 w-3",
                        localSheets[index]
                          ? "text-primary"
                          : "text-muted-foreground/20"
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mt-4 relative z-10">
                  <input
                    id={`album-sheets-${index}`}
                    type="number"
                    placeholder="00"
                    value={localSheets[index] ?? ""}
                    onChange={(e) => handleSheetChange(index, e.target.value)}
                    onBlur={onBlur}
                    onKeyDown={handleKeyDown}
                    min={min}
                    max={max}
                    className="w-16 bg-transparent border-none p-0 focus:ring-0 text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-widest group-hover:text-primary/40 transition-colors">
                    Sheets
                  </span>
                </div>

                {/* Subtle background glow on hover if not active */}
                {!localSheets[index] && (
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Helper Text */}
      <FieldDescription className="text-xs text-primary/80">
        * Enter the number of sheets for each of the {albumCount} album
        {albumCount > 1 ? "s" : ""}
      </FieldDescription>

      {/* Error Display */}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
