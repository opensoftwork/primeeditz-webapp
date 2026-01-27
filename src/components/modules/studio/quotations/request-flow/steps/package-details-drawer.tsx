"use client";

import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface PackageDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkg: any;
  onSelect: (pkgId: any) => void;
  isSelected: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function PackageDetailsDrawer({
  open,
  onOpenChange,
  pkg,
  onSelect,
  isSelected,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: PackageDetailsDrawerProps) {
  if (!pkg) return null;

  const totalAmount = pkg.lineItems.reduce(
    (acc: number, item: any) => acc + item.unitPrice * item.defaultQuantity,
    0,
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-l border-white/10 data-[vaul-drawer-direction=right]:w-full! data-[vaul-drawer-direction=right]:sm:w-[50%]! data-[vaul-drawer-direction=right]:max-w-none! overflow-y-auto p-0 h-full shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-l-[2.5rem]">
        <DrawerTitle className="sr-only">{pkg.name} Breakdown</DrawerTitle>
        <div className="h-full flex flex-col relative">
          {/* Header Section */}
          <div className="shrink-0 px-10 py-12 border-b border-white/5 relative overflow-hidden bg-white/2">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] rounded-full -mr-40 -mt-40 animate-pulse duration-5000" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px]" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-0.5 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                      Package Protocol
                    </span>
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 leading-none">
                    {pkg.name}
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
                Comprehensive breakdown of deliverables and production
                standards.
              </p>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10 space-y-12">
            {/* Overview Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-white/20" />
                Overview
              </h3>
              <p className="text-base text-white/80 leading-relaxed font-medium">
                {pkg.description || "No description provided for this package."}
              </p>
            </div>

            {/* Line Items Breakdown Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap flex items-center gap-3">
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  Production Deliverables
                </h3>
                <div className="h-px w-full bg-white/5" />
              </div>

              <div className="grid gap-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pkg._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {pkg.lineItems.map((item: any, index: number) => (
                      <div
                        key={`${item.description}-${index}`}
                        className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between gap-6"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">
                            {item.description}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-[7px] font-black border-white/10 text-white/40 uppercase tracking-widest px-1.5 py-0"
                          >
                            {item.quantity} {item.unit}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-primary tracking-tighter">
                            ₹{item.unitPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Terms & Standards Section */}
            {pkg.terms && (
              <div className="space-y-6 pb-12">
                <div className="flex items-center gap-4">
                  <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    Production Standards
                  </h3>
                  <div className="h-px w-full bg-white/5" />
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
                  <pre className="text-[13px] font-medium text-white/60 leading-relaxed whitespace-pre-wrap font-sans">
                    {pkg.terms}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 p-10 border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl relative flex flex-col gap-6">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">
                  Base Production Value
                </span>
                <span className="text-3xl font-black text-white tracking-tighter">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Navigation Arrows in Footer */}
              <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!hasPrev}
                  onClick={onPrev}
                  className="h-10 w-10 rounded-full hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-20"
                >
                  <ChevronRight className="h-5 w-5 rotate-180" />
                </Button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!hasNext}
                  onClick={onNext}
                  className="h-10 w-10 rounded-full hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-20"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Button
              className={cn(
                "w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500",
                isSelected
                  ? "bg-white/10 text-white border border-white/10 cursor-default"
                  : "bg-primary text-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]",
              )}
              onClick={() => {
                if (!isSelected) {
                  onSelect(pkg._id);
                  onOpenChange(false);
                }
              }}
            >
              {isSelected
                ? "Current Package Selected"
                : "Select Production Model"}
              {!isSelected && <ChevronRight className="ml-3 h-5 w-5" />}
              {isSelected && <CheckCircle2 className="ml-3 h-5 w-5" />}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
