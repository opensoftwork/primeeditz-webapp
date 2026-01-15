"use client";

import { useState } from "react";
import { Search, Plus, BookOpen } from "lucide-react";
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

export function LibraryItemsDrawer({
  onSelect,
}: {
  onSelect: (item: any) => void;
}) {
  const [search, setSearch] = useState("");
  const itemGroups =
    useQuery(api.functions.quotations.queries.getLibraryItems, {}) || [];

  const filteredGroups = itemGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item: any) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

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
      <DrawerContent className="bg-zinc-950 border-white/10">
        <div className="mx-auto w-full max-w-5xl">
          <DrawerHeader className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-white">
                  Service Library
                </DrawerTitle>
                <DrawerDescription className="text-sm text-white/40 font-medium italic">
                  Explore segments curated from your library and existing
                  templates
                </DrawerDescription>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input
                  placeholder="Search services, segments or templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 pl-11 bg-white/5 border-none rounded-xl text-sm font-bold text-white placeholder:text-white/20"
                />
              </div>
            </div>
          </DrawerHeader>

          <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-12">
            {filteredGroups.map((group) => {
              const { section, items } = group;
              return (
                <div key={section._id} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-8 px-4 rounded-xl flex items-center justify-center border font-black uppercase tracking-[0.2em] text-[10px]",
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
                    <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">
                      {items.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item: any) => (
                      <button
                        key={item._id}
                        onClick={() => onSelect(item)}
                        className="flex flex-col items-start p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="h-4 w-4 text-primary" />
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border",
                              item.source === "template"
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "bg-white/5 border-white/10 text-white/40"
                            )}
                          >
                            {item.source === "template" ? "Suggested" : "Base"}
                          </span>
                          <span className="text-[9px] font-black text-white uppercase tracking-tight">
                            {item.unitPrice.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })}
                          </span>
                        </div>

                        <h4 className="text-[11px] font-black text-white uppercase tracking-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[9px] font-medium text-white/30 leading-tight line-clamp-2 italic">
                          {item.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="py-20 text-center">
                <div className="h-20 w-20 rounded-full bg-white/2 border border-white/5 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-white/10" />
                </div>
                <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">
                  No matching services or segments found
                </p>
              </div>
            )}
          </div>

          <DrawerFooter className="p-8 border-t border-white/5">
            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="h-11 rounded-xl text-white/40 hover:text-white font-black uppercase tracking-widest text-xs"
              >
                Back to Quotation
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
