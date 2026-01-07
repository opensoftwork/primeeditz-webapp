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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Sheets per Album</span>
        </div>
        {totalSheets > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
          >
            Total: {totalSheets} sheets
          </motion.div>
        )}
      </div>

      {/* Dynamic Album Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {Array.from({ length: albumCount }).map((_, index) => (
            <motion.div
              key={`album-${index}`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: index * 0.05,
              }}
            >
              <Field>
                <FieldLabel
                  htmlFor={`album-sheets-${index}`}
                  className="sr-only"
                >
                  Album {index + 1} Sheets
                </FieldLabel>
                <FieldContent>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <span
                        className={cn(
                          "text-xs font-mono transition-colors",
                          localSheets[index]
                            ? "text-primary"
                            : "text-muted-foreground group-focus-within:text-primary"
                        )}
                      >
                        #{index + 1}
                      </span>
                    </div>
                    <InputGroup>
                      <InputGroupInput
                        id={`album-sheets-${index}`}
                        type="number"
                        placeholder={`Album ${index + 1}`}
                        value={localSheets[index] ?? ""}
                        onChange={(e) =>
                          handleSheetChange(index, e.target.value)
                        }
                        onBlur={onBlur}
                        onKeyDown={handleKeyDown}
                        min={min}
                        max={max}
                        className="text-base pl-10 pr-16"
                      />
                      <InputGroupAddon align="inline-end">
                        <span className="text-xs text-muted-foreground">
                          sheets
                        </span>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </FieldContent>
              </Field>
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
