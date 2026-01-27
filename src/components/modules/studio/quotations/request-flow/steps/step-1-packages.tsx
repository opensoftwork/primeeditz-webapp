"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRequestWizard } from "../request-wizard-context";
import { PackageDetailsDrawer } from "./package-details-drawer";

export function Step1Packages() {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedPackage,
    setSelectedPackage,
    filteredTemplates,
    projectTypes,
  } = useRequestWizard();

  const [detailPkg, setDetailPkg] = useState<any>(null);

  const detailIndex =
    detailPkg && filteredTemplates
      ? filteredTemplates.findIndex((t: any) => t._id === detailPkg._id)
      : -1;

  const handleNext = () => {
    if (
      filteredTemplates &&
      detailIndex !== -1 &&
      detailIndex < filteredTemplates.length - 1
    ) {
      setDetailPkg(filteredTemplates[detailIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (filteredTemplates && detailIndex > 0) {
      setDetailPkg(filteredTemplates[detailIndex - 1]);
    }
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
              Strategic Selection
            </span>
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white">
            Production Model
          </h2>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "rounded-full px-6 h-10 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
              selectedCategory === null
                ? "bg-primary text-black shadow-lg shadow-primary/20"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10",
            )}
          >
            All Production Types
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat._id}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "rounded-full px-6 h-10 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                selectedCategory === cat.name
                  ? "bg-primary text-black shadow-lg shadow-primary/20"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10",
              )}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
        {filteredTemplates?.map((pkg) => {
          const isSelected = selectedPackage === pkg._id;
          const minPrice = pkg.lineItems.reduce(
            (acc: number, i: any) => acc + i.unitPrice * i.defaultQuantity,
            0,
          );

          const projectType = projectTypes?.find(
            (pt) => pt._id === pkg.projectTypeHint,
          );

          return (
            <motion.div
              key={pkg._id}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Card
                onClick={() => setSelectedPackage(pkg._id)}
                className={cn(
                  "h-full relative overflow-hidden group cursor-pointer transition-all duration-700 rounded-[2.5rem] border-2",
                  isSelected
                    ? "bg-primary border-primary shadow-[0_30px_60px_rgba(var(--primary),0.3)] ring-4 ring-primary/20"
                    : "bg-zinc-900/40 border-white/5 hover:border-primary/40 hover:bg-zinc-900/60 shadow-2xl shadow-black/40",
                )}
              >
                {/* Background Textures */}
                <div
                  className={cn(
                    "absolute inset-0 bg-grid-white/[0.02] bg-size-[40px_40px] pointer-events-none transition-opacity duration-500",
                    isSelected ? "opacity-20" : "opacity-40",
                  )}
                />

                {/* Dynamic Glow */}
                <div
                  className={cn(
                    "absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full transition-all duration-1000 group-hover:w-80 group-hover:h-80",
                    isSelected
                      ? "bg-black/20"
                      : "bg-primary/10 opacity-0 group-hover:opacity-100",
                  )}
                />

                <div className="relative z-10 p-8 flex flex-col h-full min-h-[500px]">
                  {/* Top: Branding & Title */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                          isSelected
                            ? "bg-black/10 text-black"
                            : "bg-white/5 text-primary border border-primary/20",
                        )}
                      >
                        <Package className="h-6 w-6" />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 border-2 rounded-full transition-all",
                          isSelected
                            ? "bg-black/10 text-black border-black/20"
                            : "bg-primary/10 text-primary border-primary/20",
                        )}
                      >
                        {projectType?.name ||
                          pkg.projectTypeHint ||
                          "Production"}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3
                        className={cn(
                          "text-4xl font-black uppercase tracking-tighter leading-[0.85] transition-colors",
                          isSelected
                            ? "text-black"
                            : "text-white group-hover:text-primary",
                        )}
                      >
                        {pkg.name}
                      </h3>
                      <p
                        className={cn(
                          "text-[12px] font-bold leading-relaxed transition-colors mt-3 max-w-[80%]",
                          isSelected ? "text-black/70" : "text-white/40",
                        )}
                      >
                        {pkg.description ||
                          "The gold standard for modern creative production."}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Value Prop / Features */}
                  <div className="mt-10 flex-1 space-y-3">
                    <div
                      className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40",
                        isSelected ? "text-black" : "text-primary",
                      )}
                    >
                      Core Deliverables
                    </div>
                    {pkg.lineItems.slice(0, 4).map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300",
                          isSelected
                            ? "bg-black/5 border-black/5 text-black"
                            : "bg-white/5 border-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white/90 group-hover:border-white/10",
                        )}
                      >
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full flex items-center justify-center shrink-0 border",
                            isSelected
                              ? "bg-black/10 border-black/10"
                              : "bg-primary/10 border-primary/20",
                          )}
                        >
                          <CheckCircle2
                            className={cn(
                              "h-3 w-3",
                              isSelected ? "text-black" : "text-primary",
                            )}
                          />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tight truncate">
                          {item.description}
                        </span>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full mt-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                        isSelected
                          ? "hover:bg-black/10 text-black/60 hover:text-black"
                          : "hover:bg-white/5 text-white/30 hover:text-white",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailPkg(pkg);
                      }}
                    >
                      Explore Full Specs
                    </Button>
                  </div>

                  {/* Bottom: Pricing (As per sketch) */}
                  <div className="mt-8 pt-8 border-t-2 border-dashed border-current opacity-20 relative">
                    <div className="flex items-baseline justify-end gap-1">
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60",
                        )}
                      >
                        Starting at
                      </span>
                      <span
                        className={cn(
                          "text-5xl font-black tracking-tighter",
                          isSelected ? "text-black" : "text-white",
                        )}
                      >
                        ₹{minPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="selection"
                      className="absolute top-6 right-6 h-10 w-10 rounded-full bg-black flex items-center justify-center shadow-xl z-20"
                    >
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <PackageDetailsDrawer
        open={!!detailPkg}
        onOpenChange={(open) => !open && setDetailPkg(null)}
        pkg={detailPkg}
        onSelect={(id) => setSelectedPackage(id)}
        isSelected={selectedPackage === detailPkg?._id}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={
          filteredTemplates ? detailIndex < filteredTemplates.length - 1 : false
        }
        hasPrev={detailIndex > 0}
      />
    </motion.div>
  );
}
