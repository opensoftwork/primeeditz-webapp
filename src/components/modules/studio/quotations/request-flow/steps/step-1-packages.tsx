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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
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
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="relative group h-full"
            >
              <Card
                onClick={() => setSelectedPackage(pkg._id)}
                className={cn(
                  "h-full relative overflow-hidden p-8 cursor-pointer transition-all duration-500 rounded-4xl border flex flex-col gap-6",
                  isSelected
                    ? "bg-primary border-primary shadow-[0_20px_50px_rgba(var(--primary),0.25)]"
                    : "bg-zinc-900/50 border-white/5 hover:border-primary/40 hover:bg-zinc-900/80 shadow-2xl shadow-black/40",
                )}
              >
                {/* Background Pattern */}
                <div
                  className={cn(
                    "absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px] pointer-events-none",
                    isSelected ? "opacity-10" : "opacity-30",
                  )}
                />

                {/* Glass Highlight */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-40 h-40 blur-[80px] rounded-full -mr-20 -mt-20 transition-colors duration-500",
                    isSelected ? "bg-black/10" : "bg-primary/5",
                  )}
                />

                <div className="flex items-start justify-between relative z-10">
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 border",
                      isSelected
                        ? "bg-black/10 border-black/10 text-black"
                        : "bg-white/5 border-white/10 text-white/40 group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20",
                    )}
                  >
                    <Package className="h-7 w-7" />
                  </div>
                  {isSelected ? (
                    <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest px-4 h-8 text-white/40 hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all font-sans"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailPkg(pkg);
                      }}
                    >
                      View Breakdown
                    </Button>
                  )}
                </div>

                <div className="space-y-2 relative z-10 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3
                      className={cn(
                        "text-2xl font-black uppercase tracking-tighter leading-none transition-colors",
                        isSelected
                          ? "text-black"
                          : "text-white group-hover:text-primary",
                      )}
                    >
                      {pkg.name}
                    </h3>
                  </div>
                  <p
                    className={cn(
                      "text-[11px] font-medium leading-relaxed transition-colors line-clamp-3",
                      isSelected ? "text-black/60" : "text-white/40",
                    )}
                  >
                    {pkg.description ||
                      "Standard production package for high-quality outputs."}
                  </p>
                </div>

                <div
                  className={cn(
                    "mt-auto pt-6 border-t relative z-10 transition-colors",
                    isSelected ? "border-black/10" : "border-white/5",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all",
                        isSelected
                          ? "bg-black text-white border-black"
                          : "bg-white/5 text-white/60 border-white/10 group-hover:border-primary/30",
                      )}
                    >
                      {projectType?.name || pkg.projectTypeHint || "Standard"}
                    </Badge>
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          "text-[8px] font-black uppercase tracking-widest leading-none mb-1",
                          isSelected ? "text-black/40" : "text-white/20",
                        )}
                      >
                        Starts from
                      </span>
                      <span
                        className={cn(
                          "text-lg font-black tracking-tighter transition-colors",
                          isSelected ? "text-black" : "text-white",
                        )}
                      >
                        ₹{minPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
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
