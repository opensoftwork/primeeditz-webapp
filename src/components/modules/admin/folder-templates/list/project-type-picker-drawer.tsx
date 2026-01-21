"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Search, Check, Tag, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectTypePickerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTypeId: string | undefined;
  onSelect: (typeId: string | undefined) => void;
}

export function ProjectTypePickerDrawer({
  open,
  onOpenChange,
  selectedTypeId,
  onSelect,
}: ProjectTypePickerDrawerProps) {
  const projectTypes = useQuery(api.functions.projectTypes.queries.getProjectTypes);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTypes = projectTypes?.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (typeId: string | undefined) => {
    onSelect(typeId);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full sm:max-w-lg ml-auto rounded-none flex flex-col">
        <DrawerHeader className="border-b border-white/5 py-8">
          <DrawerTitle className="text-2xl font-black text-white uppercase tracking-tighter">
            Select Project Type
          </DrawerTitle>
          <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
            Choose a project type association for this template.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-6 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search project types..."
              className="bg-white/5 border-white/10 text-white h-12 rounded-xl pl-11 focus:ring-primary/20 font-medium text-sm placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {/* General Option */}
          <button
            onClick={() => handleSelect(undefined)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
              selectedTypeId === undefined
                ? "bg-primary/10 border-primary/30"
                : "bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                selectedTypeId === undefined
                  ? "bg-primary/20 border border-primary/30"
                  : "bg-white/5 border border-white/5"
              )}
            >
              <Globe
                className={cn(
                  "h-5 w-5",
                  selectedTypeId === undefined ? "text-primary" : "text-white/40"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-black uppercase tracking-tight text-sm",
                  selectedTypeId === undefined ? "text-primary" : "text-white"
                )}
              >
                General (All Projects)
              </p>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                Template applies to all project types
              </p>
            </div>
            {selectedTypeId === undefined && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </button>

          {/* Project Types */}
          {filteredTypes?.map((type) => (
            <button
              key={type._id}
              onClick={() => handleSelect(type._id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                selectedTypeId === type._id
                  ? "bg-primary/10 border-primary/30"
                  : "bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  selectedTypeId === type._id
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-white/5 border border-white/5"
                )}
              >
                <Tag
                  className={cn(
                    "h-5 w-5",
                    selectedTypeId === type._id ? "text-primary" : "text-white/40"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-black uppercase tracking-tight text-sm",
                    selectedTypeId === type._id ? "text-primary" : "text-white"
                  )}
                >
                  {type.name}
                </p>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                  Project-specific template
                </p>
              </div>
              {selectedTypeId === type._id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </button>
          ))}

          {filteredTypes?.length === 0 && searchQuery && (
            <div className="py-12 text-center">
              <p className="text-white/30 text-sm font-medium">
                No project types found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
