"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  BookOpen,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";

type TabType = "all" | "library" | "templates";

interface LibraryItemsDrawerProps {
  onSelect: (item: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSectionId?: string | null;
}

export function LibraryItemsDrawer({
  onSelect,
  open,
  onOpenChange,
  initialSectionId = null,
}: LibraryItemsDrawerProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  const itemGroups =
    useQuery(api.functions.quotations.queries.getLibraryItems, {}) || [];

  // Sync section selection with initialSectionId when drawer opens
  useEffect(() => {
    if (open) {
      setSelectedSectionId(initialSectionId);
      setSearch("");
      setActiveTab("all");
    }
  }, [open, initialSectionId]);

  const selectedGroup = useMemo(() => {
    if (!selectedSectionId) return null;
    return itemGroups.find((g) => g.section._id === selectedSectionId);
  }, [itemGroups, selectedSectionId]);

  const filteredItems = useMemo(() => {
    if (!selectedGroup) return [];

    return selectedGroup.items.filter((item: any) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.templateName?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "library") return item.source === "library";
      if (activeTab === "templates") return item.source === "template";

      return true;
    });
  }, [selectedGroup, search, activeTab]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[500px] sm:max-w-none bg-zinc-950 border-white/10 p-0 flex flex-col h-full shadow-2xl"
      >
        <SheetHeader className="p-8 pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {selectedSectionId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/40 hover:text-white"
                  onClick={() => setSelectedSectionId(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="space-y-1">
                <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  {selectedGroup
                    ? selectedGroup.section.name
                    : "Service Library"}
                </SheetTitle>
                <SheetDescription className="text-sm text-white/40 font-medium italic">
                  {selectedGroup
                    ? `Explore ${selectedGroup.section.name} services and templates`
                    : "Select a segment to explore curated services"}
                </SheetDescription>
              </div>
            </div>

            {selectedSectionId && (
              <div className="flex flex-col gap-4 pt-2">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search services or templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 pl-11 bg-white/2 border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-white/10 focus:border-primary/50 transition-all shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-2 p-1 bg-white/2 border border-white/5 rounded-2xl w-fit">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      activeTab === "all"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("library")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      activeTab === "library"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    Library
                  </button>
                  <button
                    onClick={() => setActiveTab("templates")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      activeTab === "templates"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    Suggested
                  </button>
                </div>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
          {!selectedSectionId ? (
            // SEGMENTS VIEW
            <div className="grid grid-cols-1 gap-4">
              {itemGroups.map((group) => (
                <button
                  key={group.section._id}
                  onClick={() => setSelectedSectionId(group.section._id)}
                  className="group p-6 rounded-[2rem] bg-white/2 border border-white/5 hover:border-primary/40 hover:bg-white/5 transition-all text-left relative overflow-hidden flex items-center justify-between"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

                  <div className="space-y-3 relative z-10">
                    <div
                      className={cn(
                        "h-8 px-4 w-fit rounded-xl flex items-center justify-center border font-black uppercase tracking-[0.2em] text-[10px] shadow-sm",
                        group.section.color === "blue"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : group.section.color === "purple"
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          : group.section.color === "green"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : group.section.color === "amber"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : group.section.color === "indigo"
                          ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                          : group.section.color === "orange"
                          ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                          : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                      )}
                    >
                      {group.section.name}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">
                        Explore segments
                      </span>
                      <h4 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                        {group.section.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 relative z-10">
                    <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest mt-2">
                      {group.items.length} items
                    </span>
                  </div>
                </button>
              ))}

              {itemGroups.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="h-16 w-16 rounded-3xl bg-white/2 border border-white/5 flex items-center justify-center mx-auto text-white/10">
                    <Layers className="h-8 w-8" />
                  </div>
                  <p className="text-white/20 font-black uppercase tracking-widest text-xs italic">
                    No segments available in library
                  </p>
                </div>
              )}
            </div>
          ) : (
            // ITEMS LIST VIEW
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {filteredItems.map((item: any) => (
                  <button
                    key={item._id}
                    onClick={() => onSelect(item)}
                    className="flex flex-col items-start p-5 rounded-3xl bg-white/2 border border-white/5 hover:border-primary/40 hover:bg-white/5 transition-all text-left group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full translate-x-12 -translate-y-12" />

                    <div className="absolute top-4 right-4 h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border transition-colors",
                          item.source === "template"
                            ? "bg-primary/10 border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                            : "bg-white/5 border-white/10 text-white/30"
                        )}
                      >
                        {item.source === "template" ? "Suggested" : "Base"}
                      </span>
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">
                        {item.unitPrice.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}{" "}
                        / {item.unit}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[10px] font-medium text-white/30 leading-relaxed italic group-hover:text-white/50 transition-colors line-clamp-2">
                      {item.description}
                    </p>

                    {item.templateName && (
                      <div className="mt-3 pt-3 border-t border-white/5 w-full flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-primary/40" />
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest truncate">
                          {item.templateName}
                        </span>
                      </div>
                    )}
                  </button>
                ))}

                {filteredItems.length === 0 && (
                  <div className="py-20 text-center space-y-4">
                    <div className="h-16 w-16 rounded-3xl bg-white/2 border border-white/5 flex items-center justify-center mx-auto text-white/10">
                      <Search className="h-8 w-8" />
                    </div>
                    <p className="text-white/20 font-black uppercase tracking-widest text-xs italic">
                      No results found in this segment
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearch("");
                        setActiveTab("all");
                      }}
                      className="text-primary hover:text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[9px]"
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="p-8 border-t border-white/5 bg-zinc-950">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-12 w-full rounded-2xl bg-white/2 hover:bg-white/5 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs transition-all"
          >
            Close Library
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
