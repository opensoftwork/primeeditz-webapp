/**
 * Project Picker Drawer
 *
 * Drawer for selecting a single project to associate with a line item.
 * Same width as LineItemDrawer for consistency.
 */

"use client";

import { Briefcase, Check, ChevronRight, Hash, Search, X } from "lucide-react";
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
import type { Project } from "../../types";

interface ProjectPickerDrawerProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelect: (projectId: string | undefined) => void;
  triggerClassName?: string;
}

export function ProjectPickerDrawer({
  projects,
  selectedProjectId,
  onSelect,
  triggerClassName,
}: ProjectPickerDrawerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const filteredProjects = useMemo(() => {
    if (!search) return projects;
    const lowerSearch = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.eventName?.toLowerCase().includes(lowerSearch) ||
        p.code.toLowerCase().includes(lowerSearch) ||
        p.projectTypeName?.toLowerCase().includes(lowerSearch),
    );
  }, [projects, search]);

  const handleSelect = (projectId: string | undefined) => {
    onSelect(projectId);
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
            {selectedProject ? (
              <>
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-white truncate">
                    {selectedProject.eventName || selectedProject.code}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-sm text-white/30">
                General / No Project
              </span>
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
                  <Briefcase className="h-4 w-4" />
                </div>
                Link to Project
              </SheetTitle>
              <SheetDescription className="text-xs text-white/40 font-medium">
                Associate this line item with a project
              </SheetDescription>
            </div>

            <div className="pt-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 bg-white/2 border-white/5 rounded-xl text-sm font-medium placeholder:text-white/10 focus:border-primary/50 transition-all"
                />
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            <div className="space-y-2">
              {/* General / No Project Option */}
              <motion.button
                type="button"
                layout
                onClick={() => handleSelect(undefined)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                  !selectedProjectId
                    ? "bg-primary/10 border-primary/30"
                    : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <X className="h-4 w-4 text-white/30" />
                  </div>
                  <span className="text-sm font-bold text-white/60">
                    General / No Project
                  </span>
                </div>

                {!selectedProjectId && (
                  <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
              </motion.button>

              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => {
                  const isSelected = project._id === selectedProjectId;
                  return (
                    <motion.button
                      key={project._id}
                      type="button"
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={() => handleSelect(project._id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                        isSelected
                          ? "bg-primary/10 border-primary/30"
                          : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <Hash className="h-3.5 w-3.5 text-white/40" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">
                            {project.eventName || project.code}
                          </span>
                          <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
                            {project.projectTypeName}
                          </span>
                        </div>
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

              {filteredProjects.length === 0 && search && (
                <div className="py-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center mx-auto text-white/10">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">
                    No projects found
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
