"use client";

import * as React from "react";
import { icons, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const ICON_NAMES = Object.keys(icons).sort() as (keyof typeof icons)[];

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * IconPicker component that provides a drawer-based interface to select Lucide icons.
 * The selection is stored as the Lucide icon name (PascalCase string).
 */
export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);
  const [displayCount, setDisplayCount] = React.useState(60);

  // Reset display count when drawer closes
  React.useEffect(() => {
    if (!open) {
      setDisplayCount(60);
    }
  }, [open]);

  const filteredIcons = React.useMemo(() => {
    if (!deferredSearch) return ICON_NAMES;
    const lowerSearch = deferredSearch.toLowerCase();
    return ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(lowerSearch),
    );
  }, [deferredSearch]);

  const visibleIcons = React.useMemo(() => {
    return filteredIcons.slice(0, displayCount);
  }, [filteredIcons, displayCount]);

  // Load more icons on scroll or via intersection observer if needed,
  // but for now let's just use a "Load More" or auto-increment for simplicity
  const hasMore = filteredIcons.length > displayCount;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 w-full justify-between bg-white/5 border-white/10 px-4 rounded-xl hover:bg-white/10 transition-all group",
            className,
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
              <DynamicIcon
                name={value || "Plus"}
                className="h-4 w-4 text-primary"
              />
            </div>
            <span
              className={cn(
                "font-bold tracking-tight",
                value ? "text-white" : "text-white/40",
              )}
            >
              {value || "Select Lucide Icon"}
            </span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary transition-colors">
            Choose
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-zinc-950 border-l border-white/10 h-full sm:max-w-xl p-0 flex flex-col"
      >
        <SheetHeader className="border-b border-white/5 p-6 shrink-0 relative text-left">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-black uppercase tracking-tighter text-white">
                Icon Library
              </SheetTitle>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">
                Select a visual identifier from Lucide
              </p>
            </div>
          </div>

          <div className="mt-6 relative px-2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input
              placeholder="Search icons (e.g. camera, star, heart)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 placeholder:text-white/10 font-bold"
            />
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {visibleIcons.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 group relative aspect-square",
                  value === name
                    ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/10"
                    : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl mb-2 transition-colors",
                    value === name
                      ? "bg-primary/20 text-primary"
                      : "bg-black/20 text-white/40 group-hover:text-white/80",
                  )}
                >
                  <DynamicIcon name={name} className="h-6 w-6" />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest truncate w-full text-center transition-colors px-1",
                    value === name
                      ? "text-primary"
                      : "text-white/20 group-hover:text-white/40",
                  )}
                >
                  {name}
                </span>
                {value === name && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}

            {hasMore && (
              <div className="col-span-full pt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setDisplayCount((prev) => prev + 100)}
                  className="h-10 px-8 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10"
                >
                  Load More Icons
                </Button>
              </div>
            )}

            {filteredIcons.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-3xl bg-white/5 border border-dashed border-white/10">
                  <Search className="h-8 w-8 text-white/10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                  No icons found matching "{search}"
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-white/5 bg-white/2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                {filteredIcons.length} Visual Assets Available
              </span>
            </div>
            <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.2em]">
              Selection is saved as Lucide identifier
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
