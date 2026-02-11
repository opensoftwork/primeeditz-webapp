"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useBuilder } from "./builder-context";
import { PackageStepNavigation } from "./package-step-navigation";
import { Step1Identity } from "./steps/step-1-identity";
import { Step2ProjectConfig } from "./steps/step-2-config";
import { Step3Pricing } from "./steps/step-3-pricing";
import { Step4Terms } from "./steps/step-4-terms";
import { Step5Review } from "./steps/step-5-review";

const STEPS = [
  { id: 1, label: "Identity", description: "Basic Info" },
  { id: 2, label: "Config", description: "Project Setup" },
  { id: 3, label: "Pricing", description: "Line Items" },
  { id: 4, label: "Terms", description: "Conditions" },
  { id: 5, label: "Review", description: "Publishing" },
];

export function PackageBuilder() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const {
    currentStep,
    isEditing,
    nextStep,
    prevStep,
    goToStep,
    submitTrigger,
    cancelWizard,
  } = useBuilder();
  const router = useRouter();

  const handlePrimaryAction = () => {
    if (submitTrigger) {
      submitTrigger();
    } else {
      nextStep();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Identity />;
      case 2:
        return <Step2ProjectConfig />;
      case 3:
        return <Step3Pricing />;
      case 4:
        return <Step4Terms />;
      case 5:
        return <Step5Review />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden text-white selection:bg-primary/20">
      {/* 1. Global Utility Header */}
      <header className="shrink-0 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/95 backdrop-blur-xl z-20 py-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-black uppercase tracking-widest text-white">
              {isEditing ? "Edit Package" : "Create Package"}
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
              Configuring a premium service offering
            </p>
          </div>

          <div className="h-6 w-px bg-white/5" />

          <div className="flex items-center gap-5">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                Step {currentStep} of 5
              </span>
              <div className="flex gap-1">
                {STEPS.map((s) => (
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
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCancelDialog(true)}
            className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            Cancel
          </Button>

          <AlertDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
          >
            <AlertDialogContent className="bg-zinc-950 border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white font-black uppercase tracking-tight">
                  Discard Changes?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/60">
                  Are you sure you want to cancel? Any unsaved progress in this
                  package builder will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center gap-2">
                  Continue Editing
                  <kbd className="hidden sm:inline-flex h-4 items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[8px] font-medium text-white/40">
                    ESC
                  </kbd>
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await cancelWizard();
                    setShowCancelDialog(false);
                  }}
                  className="bg-primary text-black hover:bg-primary/90 font-black uppercase flex items-center gap-2"
                >
                  Discard & Exit
                  <kbd className="hidden sm:inline-flex h-4 items-center gap-1 rounded border border-black/20 bg-black/5 px-1.5 font-mono text-[8px] font-medium text-black/40">
                    ⏎
                  </kbd>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
          <PackageStepNavigation
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
          />

          <div className="mt-auto space-y-4">
            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 text-primary" />
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
                  className="flex-1 p-6 md:p-10"
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sticky Footer */}
          <footer className="sticky bottom-0 shrink-0 border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl px-8 py-4 flex items-center justify-between z-20">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
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
                className={cn(
                  "h-12 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all min-w-[180px] group",
                  currentStep === 5
                    ? "bg-primary text-black hover:bg-primary/90 shadow-[0_10px_40px_rgba(var(--primary),0.2)]"
                    : "bg-white text-black hover:bg-white/90 shadow-[0_10px_40px_rgba(255,255,255,0.1)]",
                )}
              >
                {currentStep === 5 ? "Finalize Package" : "Next Step"}
                {currentStep < 5 && (
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                )}
                {currentStep === 5 && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
