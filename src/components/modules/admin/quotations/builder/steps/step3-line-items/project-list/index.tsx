"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Search,
  Briefcase,
  Hash,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Id } from "@convex/_generated/dataModel";
import type { Project } from "../../../types";

interface ProjectListingDrawerProps {
  clientId: string;
  selectedProjectIds: string[];
  onAddProject: (projectId: string) => void;
  onRemoveProject: (projectId: string) => void;
}

export function ProjectListingDrawer({
  clientId,
  selectedProjectIds,
  onAddProject,
  onRemoveProject,
}: ProjectListingDrawerProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Use simple query since we want a "lighter" UI and usually clients don't have hundreds of projects
  const projects = useQuery(
    api.admin.getAdminProjectsSimple,
    clientId ? { clientId: clientId as Id<"profiles"> } : {}
  ) as Project[] | undefined;

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!search) return projects;
    const lowerSearch = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.eventName?.toLowerCase().includes(lowerSearch) ||
        p.code.toLowerCase().includes(lowerSearch) ||
        p.projectTypeName?.toLowerCase().includes(lowerSearch)
    );
  }, [projects, search]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 bg-white/5 border-white/5 rounded-xl px-4 text-[10px] font-black uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
          disabled={!clientId}
        >
          <Plus className="h-3.5 w-3.5 mr-2 text-primary" />
          Add Projects
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[450px] bg-zinc-950 border-white/10 p-0 sm:max-w-none"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="p-8 pb-4">
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                Project Vault
              </SheetTitle>
              <SheetDescription className="text-sm text-white/40 font-medium italic">
                Select projects to associate with this quotation
              </SheetDescription>
            </div>

            <div className="pt-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-12 bg-white/2 border-white/5 rounded-2xl text-sm font-bold placeholder:text-white/10 focus:border-primary/50 transition-all shadow-inner"
                />
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {paginatedProjects.map((project) => {
                  const isSelected = selectedProjectIds.includes(project._id);
                  return (
                    <motion.div
                      key={project._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        "group p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden cursor-pointer",
                        isSelected
                          ? "bg-primary/5 border-primary/30"
                          : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"
                      )}
                      onClick={() =>
                        isSelected
                          ? onRemoveProject(project._id)
                          : onAddProject(project._id)
                      }
                    >
                      <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                              <Hash className="h-3 w-3 text-white/40" />
                            </div>
                            <span className="text-xs font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                              {project.code}
                            </span>
                            {isSelected && (
                              <Badge
                                variant="outline"
                                className="h-5 text-[8px] font-black uppercase tracking-widest bg-primary/20 border-primary/40 text-primary animate-pulse"
                              >
                                Selected
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                              {project.eventName || "Untitled Project"}
                            </h4>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                                {project.projectTypeName}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center border transition-all",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                              : "bg-white/5 border-white/10 text-white/20 group-hover:text-white/40 group-hover:bg-white/10"
                          )}
                        >
                          {isSelected ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </div>
                      </div>

                      {/* Accent Glow */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full translate-x-12 -translate-y-12" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredProjects.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="h-16 w-16 rounded-3xl bg-white/2 border border-white/5 flex items-center justify-center mx-auto text-white/10">
                    <Briefcase className="h-8 w-8" />
                  </div>
                  <p className="text-white/20 font-black uppercase tracking-widest text-xs italic">
                    No projects found for this client
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-8 border-t border-white/5 bg-white/1 flex items-center justify-between">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white disabled:opacity-20"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white disabled:opacity-20"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
