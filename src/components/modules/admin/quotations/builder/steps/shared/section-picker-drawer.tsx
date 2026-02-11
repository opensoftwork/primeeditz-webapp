/**
 * Section Picker Drawer
 *
 * Drawer for selecting a quotation section.
 * Same width as LineItemDrawer for consistency.
 */

"use client";

import { Check, ChevronRight, Layers, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Section } from "../../types";

interface SectionPickerDrawerProps {
  sections: Section[];
  selectedSectionId?: string;
  onSelect: (sectionId: string) => void;
  triggerClassName?: string;
}

export function SectionPickerDrawer({
  sections,
  selectedSectionId,
  onSelect,
  triggerClassName,
}: SectionPickerDrawerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedSection = sections.find((s) => s._id === selectedSectionId);

  const filteredSections = useMemo(() => {
    if (!search) return sections;
    const lowerSearch = search.toLowerCase();
    return sections.filter((s) => s.name.toLowerCase().includes(lowerSearch));
  }, [sections, search]);

  const handleSelect = (sectionId: string) => {
    onSelect(sectionId);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full justify-between bg-white/5 border-white/10 rounded-xl px-4 text-left hover:bg-white/8",
            triggerClassName,
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {selectedSection ? (
              <>
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full shrink-0",
                    selectedSection.color === "blue"
                      ? "bg-blue-500"
                      : selectedSection.color === "purple"
                        ? "bg-purple-500"
                        : selectedSection.color === "green"
                          ? "bg-emerald-500"
                          : selectedSection.color === "amber"
                            ? "bg-amber-500"
                            : selectedSection.color === "red"
                              ? "bg-red-500"
                              : "bg-zinc-500",
                  )}
                />
                <span className="text-sm font-medium text-white truncate">
                  {selectedSection.name}
                </span>
              </>
            ) : (
              <span className="text-sm text-white/30">Select section...</span>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-white/20 shrink-0" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-md bg-zinc-950 border-white/10 p-0 sm:max-w-md"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Layers className="h-4 w-4" />
                </div>
                Choose Section
              </SheetTitle>
              <SheetDescription className="text-xs text-white/40 font-medium">
                Categorize this line item under a section
              </SheetDescription>
            </div>

            <div className="pt-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search sections..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 bg-white/2 border-white/5 rounded-xl text-sm font-medium placeholder:text-white/10 focus:border-primary/50 transition-all"
                />
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredSections.map((section) => {
                  const isSelected = section._id === selectedSectionId;
                  return (
                    <motion.button
                      key={section._id}
                      type="button"
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={() => handleSelect(section._id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                        isSelected
                          ? "bg-primary/10 border-primary/30"
                          : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center border",
                            section.color === "blue"
                              ? "bg-blue-500/10 border-blue-500/20"
                              : section.color === "purple"
                                ? "bg-purple-500/10 border-purple-500/20"
                                : section.color === "green"
                                  ? "bg-emerald-500/10 border-emerald-500/20"
                                  : section.color === "amber"
                                    ? "bg-amber-500/10 border-amber-500/20"
                                    : section.color === "red"
                                      ? "bg-red-500/10 border-red-500/20"
                                      : "bg-zinc-500/10 border-zinc-500/20",
                          )}
                        >
                          <div
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              section.color === "blue"
                                ? "bg-blue-500"
                                : section.color === "purple"
                                  ? "bg-purple-500"
                                  : section.color === "green"
                                    ? "bg-emerald-500"
                                    : section.color === "amber"
                                      ? "bg-amber-500"
                                      : section.color === "red"
                                        ? "bg-red-500"
                                        : "bg-zinc-500",
                            )}
                          />
                        </div>
                        <span className="text-sm font-bold text-white">
                          {section.name}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>

              {filteredSections.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center mx-auto text-white/10">
                    <Layers className="h-6 w-6" />
                  </div>
                  <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">
                    No sections found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
