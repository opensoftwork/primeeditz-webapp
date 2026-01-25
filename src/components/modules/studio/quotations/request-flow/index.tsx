"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  RequestWizardProvider,
  useRequestWizard,
} from "./request-wizard-context";
import { RequestStepNavigation } from "./request-step-navigation";
import { REQUEST_WIZARD_STEPS } from "./types";
import { Step1Packages } from "./steps/step-1-packages";
import { Step2Details } from "./steps/step-2-details";
import { Step3Review } from "./steps/step-3-review";
import Link from "next/link";

export default function QuoteRequestWizard() {
  return (
    <RequestWizardProvider>
      <QuoteRequestWizardContent />
    </RequestWizardProvider>
  );
}

function QuoteRequestWizardContent() {
  const {
    step,
    handleNext,
    handleBack,
    handleSubmit,
    isSubmitting,
    selectedPackage,
  } = useRequestWizard();

  return (
    <div className="dark flex flex-col h-screen bg-zinc-950 overflow-hidden text-white selection:bg-primary/20">
      {/* 1. Global Utility Header */}
      <header className="shrink-0 border-b border-white/5 flex items-center justify-between px-12 bg-zinc-950/95 backdrop-blur-xl z-20 py-6">
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-black uppercase tracking-widest text-white">
              Request Engagement
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              New Production Quote
            </p>
          </div>

          <div className="h-8 w-px bg-white/5" />

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              Step {step} of 3
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 w-4 rounded-full transition-all duration-500",
                    s <= step ? "bg-primary" : "bg-white/10",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              Cancel
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="h-11 px-6 text-[11px] font-black uppercase tracking-widest border-white/10 hover:border-primary/40 hover:bg-primary/5 rounded-xl transition-all shadow-lg shadow-black/20"
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. Main Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Step Navigation Sidebar */}
        <aside className="w-80 shrink-0 border-r border-white/5 bg-zinc-950 p-8 flex flex-col pt-10">
          <RequestStepNavigation
            steps={REQUEST_WIZARD_STEPS.map((s) => ({
              id: s.id.toString(),
              title: s.title,
              description: s.description,
            }))}
            currentStep={step}
          />

          <div className="mt-auto">
            <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <X className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-white/40">
                Need more information about our packages?
                <span className="text-white block mt-1">
                  Consult with our team
                </span>
              </p>
            </div>
          </div>
        </aside>

        {/* Main Step Canvas */}
        <main className="flex-1 overflow-y-auto bg-zinc-950/50 relative flex flex-col">
          <div className="flex-1 w-full p-8 md:p-12">
            <div className="max-w-full mx-auto min-h-full flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1"
                >
                  {step === 1 && <Step1Packages />}
                  {step === 2 && <Step2Details />}
                  {step === 3 && <Step3Review />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Stick Footer at bottom of main content area, not within the max-width container */}
          <footer className="sticky bottom-0 shrink-0 border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl px-12 py-6 flex items-center justify-between z-20">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all group"
            >
              <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              {step === 1 ? "Exit Wizard" : "Back"}
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mr-4">
                Step 0{step} / 03
              </span>
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={step === 1 && !selectedPackage}
                  className="h-14 px-12 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[11px] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] group min-w-[200px]"
                >
                  Next Step
                  <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[11px] transition-all shadow-[0_10px_40px_rgba(var(--primary),0.2)] min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ChevronRight className="ml-3 h-5 w-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
