"use client";

import { ArrowLeft, ArrowRight, ChevronRight, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { RequestStepNavigation } from "./request-step-navigation";
import {
  RequestWizardProvider,
  useRequestWizard,
} from "./request-wizard-context";
import { Step1Packages } from "./steps/step-1-packages";
import { Step2Details } from "./steps/step-2-details";
import { Step3Review } from "./steps/step-3-review";
import { REQUEST_WIZARD_STEPS } from "./types";

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
    setStep,
    handleNext,
    handleBack,
    handleSubmit,
    isSubmitting,
    selectedPackageIds,
    cancelWizard,
  } = useRequestWizard();
  const { data: session } = authClient.useSession();

  return (
    <div className="dark flex flex-col h-screen bg-zinc-950 overflow-hidden text-white selection:bg-primary/20">
      {/* 1. Global Utility Header */}
      <header className="shrink-0 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/95 backdrop-blur-xl z-20 py-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-black uppercase tracking-widest text-white">
              Request Engagement
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
              New Production Quote
            </p>
          </div>

          <div className="h-6 w-px bg-white/5" />

          <div className="flex items-center gap-5">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                Step {step} of 3
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1 w-3 rounded-full transition-all duration-500",
                      s <= step ? "bg-primary" : "bg-white/10",
                    )}
                  />
                ))}
              </div>
            </div>

            {session?.user && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">
                  {(session.user as any).role}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to cancel? This will delete your draft progress.")) {
                cancelWizard();
              }
            }}
            className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            Cancel
          </Button>
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
        <aside className="w-72 shrink-0 border-r border-white/5 bg-zinc-950 p-6 flex flex-col pt-8">
          <RequestStepNavigation
            steps={REQUEST_WIZARD_STEPS.map((s) => ({
              id: s.id.toString(),
              title: s.title,
              description: s.description,
            }))}
            currentStep={step}
            onStepClick={(s) => setStep(s as any)}
          />

          <div className="mt-auto">
            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <X className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed text-white/40">
                Need more info?
                <span className="text-white block mt-0.5">
                  Consult our team
                </span>
              </p>
            </div>
          </div>
        </aside>

        {/* Main Step Canvas */}
        <main className="flex-1 overflow-y-auto bg-zinc-950/50 relative flex flex-col">
          <div className="flex-1 w-full p-6 md:p-8">
            <div className="w-full mx-auto min-h-full flex flex-col">
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
          <footer className="sticky bottom-0 shrink-0 border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl px-8 py-4 flex items-center justify-between z-20">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              {step === 1 ? "Exit" : "Back"}
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mr-2">
                Step 0{step} / 03
              </span>
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={step === 1 && selectedPackageIds.length === 0}
                  className="h-12 px-10 rounded-xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] group min-w-[160px]"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-12 px-10 rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_10px_40px_rgba(var(--primary),0.2)] min-w-[160px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wait...
                    </>
                  ) : (
                    <>
                      Submit
                      <ChevronRight className="ml-2 h-4 w-4" />
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
