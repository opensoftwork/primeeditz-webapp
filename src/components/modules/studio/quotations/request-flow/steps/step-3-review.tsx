"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Rocket,
  Package,
  Calendar,
  User,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRequestWizard } from "../request-wizard-context";
import { cn } from "@/lib/utils";
import { PackageDetailsDrawer } from "./package-details-drawer";

export function Step3Review() {
  const {
    formData,
    templates,
    selectedPackage,
    projectTypes,
    setSelectedPackage,
    filteredTemplates,
  } = useRequestWizard();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const pkg = templates?.find((t) => t._id === selectedPackage);
  const projectType = pkg
    ? projectTypes?.find((pt: any) => pt._id === pkg.projectTypeHint)
    : null;

  const totalAmount =
    pkg?.lineItems.reduce(
      (acc: number, item: any) => acc + item.unitPrice * item.defaultQuantity,
      0,
    ) || 0;

  const detailIndex =
    pkg && filteredTemplates
      ? filteredTemplates.findIndex((t: any) => t._id === pkg._id)
      : -1;

  const handleNextPkg = () => {
    if (
      filteredTemplates &&
      detailIndex !== -1 &&
      detailIndex < filteredTemplates.length - 1
    ) {
      setSelectedPackage(filteredTemplates[detailIndex + 1]._id);
    }
  };

  const handlePrevPkg = () => {
    if (filteredTemplates && detailIndex > 0) {
      setSelectedPackage(filteredTemplates[detailIndex - 1]._id);
    }
  };

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8 w-full"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">
            Final Confirmation
          </span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
          Production Manifest
        </h2>
        <p className="text-xs font-semibold text-white/40 max-w-lg leading-relaxed">
          Verify the engagement parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Package Identity */}
        <Card className="bg-zinc-900/30 border-white/5 overflow-hidden flex flex-col relative group rounded-3xl">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -mr-24 -mt-24 pointer-events-none transition-opacity duration-1000 group-hover:opacity-100 opacity-50" />

          <div className="p-6 space-y-6 relative z-10 flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full bg-primary/10 border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest px-2 pr-2.5 py-0.5"
                  >
                    Selected Model
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest px-3 h-6 text-white/40 hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all font-sans"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    View Details
                  </Button>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                    {pkg?.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Package className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      {projectType?.name || "Standard Production"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                <Rocket className="h-5 w-5 text-white/80" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black w-24 uppercase tracking-widest text-white/20">
                    Base Value
                  </span>
                  <span className="text-lg font-black text-white tracking-tighter">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="h-px w-full bg-white/5" />
                <div className="flex items-start justify-between">
                  <span className="text-[9px] font-black w-24 uppercase tracking-widest text-white/20 mt-1">
                    Includes
                  </span>
                  <div className="text-right space-y-1">
                    {pkg?.lineItems
                      .slice(0, 3)
                      .map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="text-[10px] font-bold text-white/60"
                        >
                          {item.quantity}x {item.description}
                        </div>
                      ))}
                    {pkg?.lineItems.length > 3 && (
                      <div className="text-[8px] font-black text-primary/60 uppercase tracking-wider pt-0.5">
                        + {pkg.lineItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Engagement Intel */}
        <div className="space-y-6">
          <Card className="bg-zinc-900/30 border-white/5 p-6 relative overflow-hidden group rounded-3xl">
            <div className="absolute inset-0 bg-white/1 pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="rounded-full bg-white/5 border-white/10 text-white/40 text-[8px] font-black uppercase tracking-widest px-2 py-0.5"
                >
                  Engagement Intel
                </Badge>
              </div>

              <div className="grid gap-5">
                {/* Client */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 text-white/40">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">
                      End Client Identity
                    </p>
                    <p className="text-base font-bold text-white">
                      {formData.endClientName || "Not Specified"}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 text-white/40">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">
                      Target Execution Date
                    </p>
                    <p className="text-base font-bold text-white">
                      {formData.eventDate
                        ? format(new Date(formData.eventDate), "PPP")
                        : "TBD"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {formData.eventName && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 text-white/40">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20">
                        Operation Variant
                      </p>
                      <p className="text-sm font-medium text-white/80 leading-relaxed line-clamp-2">
                        {formData.eventName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Terms */}
          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">
                Protocol Verification
              </h4>
              <p className="text-[10px] font-medium text-primary/60 leading-relaxed">
                By submitting this manifest, you confirm that strategic
                parameters are accurate.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PackageDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        pkg={pkg}
        onSelect={(id) => {
          setSelectedPackage(id);
          setIsDrawerOpen(false);
        }}
        isSelected={selectedPackage === pkg?._id}
        onNext={handleNextPkg}
        onPrev={handlePrevPkg}
        hasNext={
          filteredTemplates ? detailIndex < filteredTemplates.length - 1 : false
        }
        hasPrev={detailIndex > 0}
      />
    </motion.div>
  );
}
