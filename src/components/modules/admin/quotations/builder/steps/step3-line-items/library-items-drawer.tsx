"use client";

import { useState, useMemo } from "react";
import { Search, Plus, BookOpen, Layers, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";

type TabType = "all" | "library" | "templates";

export function LibraryItemsDrawer({
  onSelect,
}: {
  onSelect: (item: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const itemGroups =
    useQuery(api.functions.quotations.queries.getLibraryItems, {}) || [];

  const filteredGroups = useMemo(() => {
    return itemGroups
      .map((group) => {
        const filteredItems = group.items.filter((item: any) => {
          const matchesSearch =
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description?.toLowerCase().includes(search.toLowerCase()) ||
            item.templateName?.toLowerCase().includes(search.toLowerCase());

          if (!matchesSearch) return false;

          if (activeTab === "library") return item.source === "library";
          if (activeTab === "templates") return item.source === "template";

          return true;
        });

        return {
          ...group,
          items: filteredItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [itemGroups, search, activeTab]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="h-10 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] border border-white/5"
        >
          <BookOpen className="h-4 w-4 mr-2 text-primary" />
          Library Segments
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-zinc-950 border-white/10 max-h-[90vh]">
        <div className="mx-auto w-full max-w-6xl flex flex-col h-full">
          <DrawerHeader className="px-8 pt-8 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <DrawerTitle className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                  <span className="text-primary italic">#</span> Service Library
                </DrawerTitle>
                <DrawerDescription className="text-sm text-white/40 font-medium italic">
                  Explore segments curated from your library and existing
                  templates
                </DrawerDescription>
              </div>
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search services, segments or templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 pl-11 bg-white/2 border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-white/20 focus:border-primary/50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Premium Tab Toggles */}
            <div className="mt-8 flex items-center gap-2 p-1 bg-white/2 border border-white/5 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "all"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-white/40 hover:text-white"
                )}
              >
                <Layers className="h-3 w-3" /> All Items
              </button>
              <button
                onClick={() => setActiveTab("library")}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "library"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-white/40 hover:text-white"
                )}
              >
                <BookOpen className="h-3 w-3" /> Base Library
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "templates"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-white/40 hover:text-white"
                )}
              >
                <Sparkles className="h-3 w-3" /> Suggested
              </button>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar space-y-12 pb-20">
            {filteredGroups.map((group) => {
              const { section, items } = group;
              return (
                <div key={section._id} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-8 px-4 rounded-xl flex items-center justify-center border font-black uppercase tracking-[0.2em] text-[10px] shadow-sm",
                        section.color === "blue"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : section.color === "purple"
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          : section.color === "green"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : section.color === "amber"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : section.color === "indigo"
                          ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                          : section.color === "orange"
                          ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                          : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                      )}
                    >
                      {section.name}
                    </div>
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">
                      {items.length} segments available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item: any) => (
                      <button
                        key={item._id}
                        onClick={() => onSelect(item)}
                        className="flex flex-col items-start p-6 rounded-[2rem] bg-white/2 border border-white/5 hover:border-primary/40 hover:bg-white/5 transition-all text-left group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

                        <div className="absolute top-4 right-4 h-8 w-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110 active:scale-95">
                          <Plus className="h-4 w-4 text-primary" />
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-colors",
                              item.source === "template"
                                ? "bg-primary/10 border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                : "bg-white/5 border-white/10 text-white/30 group-hover:border-white/20"
                            )}
                          >
                            {item.source === "template" ? "Suggested" : "Base"}
                          </span>
                          <span className="text-[10px] font-black text-white uppercase tracking-tight">
                            {item.unitPrice.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })}
                          </span>
                        </div>

                        <h4 className="text-[12px] font-black text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[10px] font-medium text-white/30 leading-relaxed line-clamp-2 italic group-hover:text-white/50 transition-colors">
                          {item.description}
                        </p>

                        {item.templateName && (
                          <div className="mt-4 pt-3 border-t border-white/5 w-full flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-primary/40" />
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest truncate">
                              {item.templateName}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="py-20 text-center space-y-6">
                <div className="h-24 w-24 rounded-[2.5rem] bg-white/2 border border-white/5 flex items-center justify-center mx-auto transition-transform group-hover:rotate-12">
                  <Search className="h-10 w-10 text-white/10" />
                </div>
                <div className="space-y-2">
                  <p className="text-white/40 font-black uppercase tracking-widest text-lg italic">
                    No results found
                  </p>
                  <p className="text-white/20 font-bold text-sm italic max-w-xs mx-auto">
                    Try adjusting your search or switching tabs to find what
                    you're looking for.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setActiveTab("all");
                  }}
                  className="text-primary hover:text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px]"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>

          <DrawerFooter className="p-8 border-t border-white/5 bg-zinc-950">
            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="h-12 w-full rounded-2xl bg-white/2 hover:bg-white/5 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs transition-all"
              >
                Back to Quotation Builder
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
