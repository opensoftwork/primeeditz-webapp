/**
 * Quotation Builder
 *
 * Multi-step wizard for creating and editing quotations.
 * Uses Context pattern for state management across steps.
 */

"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FolderOpen,
  Layout,
  Loader2,
  Receipt,
  Save,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  QUOTATION_STEPS,
  QuotationBuilderProvider,
  useQuotationBuilder,
} from "./quotation-builder-context";
import { QuotationStepNavigation } from "./quotation-step-navigation";
import {
  Step1StudioContext,
  Step2PackageSelection,
  Step3ProjectTemplates,
  Step4ItemsTerms,
  Step5ReviewSend,
} from "./steps";

// ============================================================================
// Main Export (with Provider wrapper)
// ============================================================================

export function QuotationBuilder({ quotationId }: { quotationId?: string }) {
  return (
    <QuotationBuilderProvider initialQuotationId={quotationId}>
      <QuotationBuilderContent quotationId={quotationId} />
    </QuotationBuilderProvider>
  );
}

// ============================================================================
// Content Component (consumes context)
// ============================================================================

function QuotationBuilderContent({ quotationId }: { quotationId?: string }) {
  const {
    currentStep,
    prevStep,
    nextStep,
    saveQuotation,
    submitTrigger,
    isLoading,
    formData,
    subtotal,
    taxAmount,
    grandTotal,
    selectedStudio,
    goToStep,
  } = useQuotationBuilder();

  const handlePrimaryAction = () => {
    if (currentStep < 5) {
      if (submitTrigger) {
        submitTrigger();
      } else {
        nextStep();
      }
    } else {
      if (submitTrigger) {
        submitTrigger();
      } else {
        saveQuotation();
      }
    }
  };

  const canSubmit = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!formData.step1.studioId;
      case 2:
        return true; // Packages can be optional (start from scratch)
      case 3:
        return true; // Informational/automatic configuration step
      case 4:
        return formData.step4.lineItems.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  return (
    <div className="dark flex flex-col h-screen bg-zinc-950 overflow-hidden text-white selection:bg-primary/20">
      {/* 1. Global Utility Header */}
      <header className="shrink-0 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/95 backdrop-blur-xl z-20 py-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-black uppercase tracking-widest text-white">
              {quotationId ? "Edit Quotation" : "Create Quotation"}
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
              Crafting a professional proposal
            </p>
          </div>

          <div className="h-6 w-px bg-white/5" />

          <div className="flex items-center gap-5">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                Step {currentStep} of 5
              </span>
              <div className="flex gap-1">
                {QUOTATION_STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "h-1 w-3 rounded-full transition-all duration-500",
                      s.id <= currentStep ? "bg-primary" : "bg-white/10",
                    )}
                  />
                ))}
              </div>
            </div>

            {selectedStudio && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">
                  {selectedStudio.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/quotations">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Cancel
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 text-[10px] font-black uppercase tracking-widest border-white/10 hover:border-primary/40 hover:bg-primary/5 rounded-lg transition-all shadow-lg shadow-black/20"
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. Main Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Step Navigation Sidebar */}
        <aside className="w-80 shrink-0 border-r border-white/5 bg-zinc-950 p-6 flex flex-col pt-8">
          <QuotationStepNavigation
            steps={QUOTATION_STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
          />

          <div className="mt-auto space-y-4">
            {/* Valuation Summary in Sidebar */}
            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-20 w-20 bg-primary/10 blur-2xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Subtotal
                    </span>
                    <span className="text-xs font-bold text-white/60 italic">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                      Tax (GST)
                    </span>
                    <span className="text-xs font-bold text-primary/60 italic">
                      ₹{taxAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-px bg-white/5 my-1" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      Total
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black text-white/40 tracking-tighter italic">
                        ₹
                      </span>
                      <span className="text-xl font-black text-white tracking-tighter">
                        {grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <X className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed text-white/40">
                Need more help?
                <span className="text-white block mt-0.5">
                  Check our documentation
                </span>
              </p>
            </div>
          </div>
        </aside>

        {/* Main Step Canvas */}
        <main className="flex-1 overflow-y-auto bg-zinc-950/50 relative flex flex-col">
          <div className="flex-1 w-full">
            <div className="w-full mx-auto min-h-full flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 p-8"
                >
                  <div className="w-full mx-auto space-y-8">
                    {currentStep === 1 && <Step1StudioContext />}
                    {currentStep === 2 && <Step2PackageSelection />}
                    {currentStep === 3 && <Step3ProjectTemplates />}
                    {currentStep === 4 && <Step4ItemsTerms />}
                    {currentStep === 5 && <Step5ReviewSend />}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sticky Footer */}
          <footer className="sticky bottom-0 shrink-0 border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl px-8 py-4 flex items-center justify-between z-20">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              {currentStep === 1 ? "Exit" : "Back"}
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mr-2">
                Step 0{currentStep} / 05
              </span>
              <Button
                onClick={handlePrimaryAction}
                disabled={!canSubmit || isLoading}
                className={cn(
                  "h-12 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all min-w-[180px] group",
                  currentStep === 5
                    ? "bg-primary text-black hover:bg-primary/90 shadow-[0_10px_40px_rgba(var(--primary),0.2)]"
                    : "bg-white text-black hover:bg-white/90 shadow-[0_10px_40px_rgba(255,255,255,0.1)]",
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wait...
                  </>
                ) : (
                  <>
                    {currentStep === 5 ? "Finalize" : "Next"}
                    {currentStep < 5 && (
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    )}
                    {currentStep === 5 && (
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    )}
                  </>
                )}
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
