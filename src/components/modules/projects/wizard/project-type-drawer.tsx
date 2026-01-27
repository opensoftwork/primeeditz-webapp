/**
 * Project Type Selection Drawer
 *
 * A slide-out drawer for selecting project type.
 * Premium UX with high-contrast UI and smooth animations.
 */

"use client";

import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface ProjectType {
  _id: string;
  name: string;
  categoryName?: string;
}

interface ProjectTypeSelectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTypes: ProjectType[] | undefined;
  selectedProjectTypeId: string | null;
  onSelect: (projectTypeId: string) => void;
}

export function ProjectTypeSelectionDrawer({
  open,
  onOpenChange,
  projectTypes,
  selectedProjectTypeId,
  onSelect,
}: ProjectTypeSelectionDrawerProps) {
  // Group project types by category
  const groupedTypes = projectTypes?.reduce(
    (acc, type) => {
      const category = type.categoryName || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(type);
      return acc;
    },
    {} as Record<string, ProjectType[]>,
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-l border-white/10 data-[vaul-drawer-direction=right]:w-full! data-[vaul-drawer-direction=right]:sm:w-[500px]! data-[vaul-drawer-direction=right]:max-w-none! overflow-y-auto p-0 h-full shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-l-[2.5rem]">
        <DrawerTitle className="sr-only">Select Project Type</DrawerTitle>
        <div className="h-full flex flex-col relative">
          {/* Dashboard Premium Header */}
          <div className="shrink-0 px-10 py-12 border-b border-white/5 relative overflow-hidden bg-white/2">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] rounded-full -mr-40 -mt-40 animate-pulse duration-5000" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px]" />

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-0.5 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                      Configuration Protocol
                    </span>
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 leading-none">
                    Project Type
                  </h2>
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all h-10 w-10 mt-[-20px]"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm font-semibold text-white/40 max-w-sm leading-relaxed">
                Select the production category that best fits your needs
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10 space-y-12">
            {!projectTypes || projectTypes.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/1 flex flex-col items-center justify-center space-y-4">
                <div className="p-8 rounded-full bg-white/5 border border-white/5">
                  <span className="text-white/10 animate-pulse">
                    Initializing Assets...
                  </span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                  {projectTypes === undefined
                    ? "Searching Vault..."
                    : "No production types found"}
                </p>
              </div>
            ) : (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <AnimatePresence mode="popLayout">
                  {Object.entries(groupedTypes || {}).map(
                    ([category, types], categoryIndex) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: categoryIndex * 0.1,
                          ease: [0.165, 0.84, 0.44, 1],
                        }}
                      >
                        <div className="flex items-center gap-4 mb-8">
                          <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap flex items-center gap-3">
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            {category}
                          </h3>
                          <div className="h-px w-full bg-white/5" />
                        </div>

                        <div className="space-y-4">
                          {types.map((projectType, typeIndex) => {
                            const isSelected =
                              selectedProjectTypeId === projectType._id;
                            return (
                              <motion.div
                                key={projectType._id}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.5,
                                  delay: categoryIndex * 0.1 + typeIndex * 0.05,
                                  ease: "easeOut",
                                }}
                              >
                                <button
                                  className={cn(
                                    "w-full text-left group relative p-6 rounded-[1.8rem] transition-all duration-500 overflow-hidden border",
                                    isSelected
                                      ? "bg-primary border-primary shadow-[0_20px_40px_rgba(var(--primary),0.2)] scale-[1.02]"
                                      : "bg-white/1 border-white/5 hover:border-primary/40 hover:bg-white/3 hover:scale-[1.01]",
                                  )}
                                  onClick={() => {
                                    onSelect(projectType._id);
                                    onOpenChange(false);
                                  }}
                                >
                                  {/* Glass highlight effect */}
                                  <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                  <div className="flex items-center justify-between relative z-10">
                                    <div className="flex flex-col gap-1.5">
                                      <span
                                        className={cn(
                                          "text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                          isSelected
                                            ? "text-black/50"
                                            : "text-white/20 group-hover:text-primary/60",
                                        )}
                                      >
                                        PRT-
                                        {projectType._id
                                          .slice(-6)
                                          .toUpperCase()}
                                      </span>
                                      <p
                                        className={cn(
                                          "text-xl font-black uppercase tracking-tight transition-all",
                                          isSelected
                                            ? "text-black"
                                            : "text-white group-hover:text-primary",
                                        )}
                                      >
                                        {projectType.name}
                                      </p>
                                    </div>

                                    <div
                                      className={cn(
                                        "p-2.5 rounded-2xl transition-all duration-500",
                                        isSelected
                                          ? "bg-black/10 scale-110"
                                          : "bg-white/5 group-hover:bg-primary/10 group-hover:scale-110",
                                      )}
                                    >
                                      {isSelected ? (
                                        <CheckCircle2 className="h-6 w-6 text-black" />
                                      ) : (
                                        <ChevronRight
                                          className={cn(
                                            "h-6 w-6 transition-colors",
                                            "text-white/10 group-hover:text-primary",
                                          )}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ),
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer - Dashboard style */}
          <div className="shrink-0 p-10 border-t border-white/5 bg-white/1 relative">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
            <Button
              variant="outline"
              className="w-full h-16 rounded-[1.2rem] border-white/10 hover:border-white/20 hover:bg-white/5 font-black uppercase tracking-[0.3em] text-[10px] text-white/40 hover:text-white transition-all"
              onClick={() => onOpenChange(false)}
            >
              CLOSE LIST
              <X className="ml-3 h-4 w-4 opacity-40 group-hover:opacity-100 transition-all duration-500" />
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
