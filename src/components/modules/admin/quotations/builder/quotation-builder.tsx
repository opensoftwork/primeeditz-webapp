/**
 * Quotation Builder
 *
 * Multi-step wizard for creating and editing quotations.
 * Uses Context pattern for state management across steps.
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Receipt,
  User,
  Layout,
  CheckCircle2,
  Save,
  ArrowLeft,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  QuotationBuilderProvider,
  useQuotationBuilder,
  QUOTATION_STEPS,
} from "./quotation-builder-context";
import {
  Step1StudioContext,
  Step2ProjectSelection,
  Step2TemplateSelection,
  Step3LineItems,
  Step4Terms,
} from "./steps";
import { SummarySidebar } from "./summary-sidebar";

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
    saveQuotation,
    submitTrigger,
    isLoading,
    formData,
    subtotal,
    grandTotal,
    selectedStudio,
    goToStep,
  } = useQuotationBuilder();

  const handlePrimaryAction = () => {
    if (submitTrigger) {
      submitTrigger();
    } else if (currentStep === 5) {
      saveQuotation();
    }
  };

  const canSubmit = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!formData.step1.clientId;
      case 2:
        return formData.step2.projectIds.length > 0;
      case 3:
        return true; // Template can be skipped or is handled by component
      case 4:
        return formData.step4.lineItems.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              {quotationId ? "Edit Quotation" : "Create Quotation"}
            </h1>
          </div>
          <p className="text-white/50 text-xs font-medium">
            Crafting a new professional proposal for your strategic studios.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={isLoading}
              className="text-white/40 hover:text-white font-bold uppercase text-[10px] tracking-widest gap-2"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Button>
          )}
          <Button
            type="button"
            onClick={handlePrimaryAction}
            disabled={!canSubmit || isLoading}
            className="bg-primary text-primary-foreground font-black px-8 h-12 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {quotationId
                  ? "Save Changes"
                  : currentStep === 5
                    ? "Finalize & Preview"
                    : "Next Step"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-1">
        {QUOTATION_STEPS.map((step, idx) => {
          const StepIcon = [User, FolderOpen, Layout, Receipt, CheckCircle2][
            idx
          ];
          return (
            <div key={step.id} className="flex-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  (quotationId || currentStep > step.id) && goToStep(step.id)
                }
                className={cn(
                  "group flex items-center gap-3 transition-all text-left",
                  quotationId || currentStep > step.id
                    ? "cursor-pointer hover:opacity-100"
                    : "cursor-default",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all border",
                    currentStep === step.id
                      ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : currentStep > step.id
                        ? "bg-primary/20 border-primary/30 text-primary"
                        : "bg-white/5 border-white/5 text-white/40",
                  )}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 leading-none mb-1">
                    Step 0{step.id}
                  </span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    {step.label}
                  </span>
                </div>
              </button>
              {idx < 4 && <div className="flex-1 h-px bg-white/5 mx-4" />}
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {currentStep === 1 && <Step1StudioContext />}
              {currentStep === 2 && <Step2ProjectSelection />}
              {currentStep === 3 && <Step2TemplateSelection />}
              {currentStep === 4 && <Step3LineItems />}
              {currentStep === 5 && <Step4Terms />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <SummarySidebar
            subtotal={subtotal}
            grandTotal={grandTotal}
            selectedStudio={selectedStudio}
          />
        </div>
      </div>
    </div>
  );
}
