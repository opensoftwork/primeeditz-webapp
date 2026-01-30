"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  Package,
  Rocket,
  Sparkles,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function QuoteRequestWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] =
    useState<Id<"servicePackages"> | null>(null);
  const [formData, setFormData] = useState({
    endClientName: "",
    eventName: "",
    eventDate: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const categories = useQuery(
    api.functions.projectCategories.queries.getProjectCategories,
  );
  const packages = useQuery(
    api.functions.servicePackages.queries.listActive,
    {},
  );

  // Mutations
  const requestQuotation = useMutation(
    api.functions.quotations.mutations.requestQuotation,
  );

  const handleNext = () => {
    if (step < 3) setStep((prev) => (prev + 1) as any);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as any);
    else router.push("/dashboard");
  };

  const handleSubmit = async () => {
    if (!selectedPackageId) return;

    setIsSubmitting(true);
    try {
      await requestQuotation({
        selectedPackageIds: [selectedPackageId],
        endClientName: formData.endClientName,
        eventName: formData.eventName,
        eventDate: formData.eventDate
          ? new Date(formData.eventDate).getTime()
          : undefined,
        notes: formData.notes,
      });

      toast.success("Quote request submitted!", {
        description: "Our team will review it and get back to you shortly.",
      });
      router.push("/dashboard");
    } catch (err) {
      toast.error("Failed to submit request", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter packages by category
  const filteredPackages = packages?.filter(
    (p) =>
      !selectedCategory ||
      categories?.find((c) => c._id === p.categoryId)?.name.toLowerCase() ===
        selectedCategory.toLowerCase(),
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 selection:bg-primary/20">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-8 bg-primary rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">
              Studio Portal
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black uppercase tracking-tight">
              Request New Engagement
            </h1>
            <div className="flex items-center gap-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 w-8 rounded-full transition-all duration-500",
                    step === s ? "bg-primary w-12" : "bg-white/10",
                  )}
                />
              ))}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* Step 1: Category & Package Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> 1. Select Production Model
                </h2>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    className="rounded-full text-[10px] font-black uppercase tracking-widest"
                  >
                    All Types
                  </Button>
                  {categories?.map((cat) => (
                    <Button
                      key={cat._id}
                      variant={
                        selectedCategory === cat.name ? "default" : "outline"
                      }
                      onClick={() => setSelectedCategory(cat.name)}
                      className="rounded-full text-[10px] font-black uppercase tracking-widest"
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Packages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPackages?.map((pkg) => (
                  <Card
                    key={pkg._id}
                    onClick={() => setSelectedPackageId(pkg._id)}
                    className={cn(
                      "group relative overflow-hidden bg-white/3 border-white/5 p-6 cursor-pointer transition-all duration-300 hover:border-primary/40",
                      selectedPackageId === pkg._id &&
                        "border-primary bg-primary/5 ring-1 ring-primary/20",
                    )}
                  >
                    <div className="flex flex-col h-full gap-4">
                      <div className="flex items-start justify-between">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                          <Package
                            className={cn(
                              "h-5 w-5 transition-colors",
                              selectedPackageId === pkg._id
                                ? "text-primary"
                                : "text-white/40",
                            )}
                          />
                        </div>
                        {selectedPackageId === pkg._id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">
                          {pkg.name}
                        </h3>
                        <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">
                          {pkg.description ||
                            "Standard production package for high-quality outputs."}
                        </p>
                      </div>
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                        <Badge
                          variant="outline"
                          className="text-[8px] font-black uppercase tracking-widest border-white/10 px-2 py-0.5"
                        >
                          {categories?.find((c) => c._id === pkg.categoryId)
                            ?.name || "Standard"}
                        </Badge>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                          Estimated ₹
                          {pkg.lineItems
                            .reduce((acc, i) => acc + i.rate * i.quantity, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Event Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-w-2xl mx-auto"
            >
              <h2 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <FileText className="h-4 w-4" /> 2. Engagement Specifications
              </h2>

              <div className="space-y-6">
                {/* End Client Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <User className="h-3 w-3" /> End Client Name / Family Name
                  </label>
                  <Input
                    value={formData.endClientName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endClientName: e.target.value,
                      }))
                    }
                    placeholder="e.g. Sharma Family Wedding"
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white"
                  />
                </div>

                {/* Event Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <Rocket className="h-3 w-3" /> Event Variant / Description
                  </label>
                  <Input
                    value={formData.eventName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        eventName: e.target.value,
                      }))
                    }
                    placeholder="e.g. 3-Day Destination Wedding"
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white"
                  />
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Expected Event Date
                  </label>
                  <Input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        eventDate: e.target.value,
                      }))
                    }
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white scheme-dark"
                  />
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Additional Requirements
                  </label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Tell us more about the scope, specific deliverables or deadlines..."
                    className="min-h-[120px] bg-white/5 border-white/10 rounded-xl font-medium text-white resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-w-lg mx-auto"
            >
              <div className="text-center space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Ready to Submit?
                </h2>
                <p className="text-white/40 text-[11px] uppercase tracking-widest font-black leading-relaxed">
                  Review your engagement details before sending the request to
                  our production team.
                </p>
              </div>

              <div className="bg-white/3 border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    Package
                  </span>
                  <span className="text-[11px] font-black uppercase text-primary">
                    {packages?.find((p) => p._id === selectedPackageId)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    End Client
                  </span>
                  <span className="text-[11px] font-black uppercase text-white">
                    {formData.endClientName || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    Event
                  </span>
                  <span className="text-[11px] font-black uppercase text-white">
                    {formData.eventName || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    Date
                  </span>
                  <span className="text-[11px] font-black uppercase text-white">
                    {formData.eventDate || "TBD"}
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-[0.2em]">
                Your request will be processed into a official quotation.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation */}
        <footer className="pt-12 border-t border-white/5 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />{" "}
            {step === 1 ? "Back to Dashboard" : "Go Back"}
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
              Step {step} of 3
            </span>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 && !selectedPackageId}
                className="h-12 px-10 rounded-xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] transition-all group"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-12 px-10 rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_10px_30px_rgba(var(--primary),0.2)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Send Request
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
