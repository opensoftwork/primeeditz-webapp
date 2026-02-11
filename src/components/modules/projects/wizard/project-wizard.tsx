/**
 * Project Wizard Container
 *
 * Main container for the project request wizard.
 * Supports both studio mode (5 steps) and admin mode (6 steps).
 * Uses the established pattern with premium UX animations.
 */

"use client";

import type { Id } from "@convex/_generated/dataModel";
import { ArrowLeft, ArrowRight, Check, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { cn } from "@/lib/utils";
import { type FormStep, StepNavigation } from "./step-navigation";
import { WizardStep0 } from "./steps/step-0-studio-selection";
import { WizardStep1 } from "./steps/step-1-basics";
import { WizardStep2 } from "./steps/step-2-details";
import { WizardStep3 } from "./steps/step-3-files";
import { WizardStep4 } from "./steps/step-4-description";
import { WizardStep5 } from "./steps/step-5-review";
import type { WizardMode } from "./types";
import { useWizardForm, WizardFormProvider } from "./wizard-form-context";

// Step definitions for UI display (studio mode - 5 steps)
const CLIENT_FORM_STEPS: FormStep[] = [
  { id: "basic", title: "Basics" },
  { id: "details", title: "Details" },
  { id: "files", title: "Files", isOptional: true },
  { id: "description", title: "Description" },
  { id: "review", title: "Review" },
];

// Step definitions for UI display (admin mode - 6 steps)
const ADMIN_FORM_STEPS: FormStep[] = [
  { id: "studio", title: "Studio" },
  { id: "basic", title: "Basics" },
  { id: "details", title: "Details" },
  { id: "files", title: "Files", isOptional: true },
  { id: "description", title: "Description" },
  { id: "review", title: "Review" },
];

const ONBOARDING_FORM_STEPS: FormStep[] = [
  { id: "files", title: "Files" },
  { id: "description", title: "Brief" },
  { id: "review", title: "Confirm" },
];

interface ProjectWizardProps {
  mode?: WizardMode;
  initialProjectId?: Id<"projects">;
}

export function ProjectWizard({
  mode = "studio",
  initialProjectId,
}: ProjectWizardProps) {
  return (
    <WizardFormProvider mode={mode} initialProjectId={initialProjectId}>
      <ProjectWizardContent />
    </WizardFormProvider>
  );
}

function ProjectWizardContent() {
  const router = useRouter();
  const {
    mode,
    currentStep,
    formData,
    projectCode,
    isDirty,
    isLoading,
    error,
    goToStep,
    prevStep,
    nextStep,
    cancelWizard,
    submitTrigger,
    isReviewing,
    stepCount,
  } = useWizardForm();

  // Get the appropriate form steps based on mode
  const formSteps =
    mode === "admin"
      ? ADMIN_FORM_STEPS
      : mode === "onboarding"
        ? ONBOARDING_FORM_STEPS
        : CLIENT_FORM_STEPS;
  const firstStepId = mode === "admin" ? 0 : mode === "onboarding" ? 3 : 1;
  const lastStepId = 5; // Review is always step 5

  // Debounce the loading state and ensure a minimum display time to prevent flicker
  const [showSyncOverlay, setShowSyncOverlay] = useState(false);
  const loadingStartTime = useRef<number>(0);

  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    if (isLoading) {
      // Much larger delay for the modal overlay - only show for truly slow connections
      showTimer = setTimeout(() => {
        setShowSyncOverlay(true);
        loadingStartTime.current = Date.now();
      }, 1000);
    } else {
      // If we are currently showing it, ensure it stays for a minimum time
      const timeShown = Date.now() - loadingStartTime.current;
      const MIN_VISIBILITY = 600;

      if (showSyncOverlay && timeShown < MIN_VISIBILITY) {
        hideTimer = setTimeout(() => {
          setShowSyncOverlay(false);
        }, MIN_VISIBILITY - timeShown);
      } else {
        setShowSyncOverlay(false);
      }
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isLoading, showSyncOverlay]);

  // Track completed steps based on current progress
  // For admin mode (0-5), completed = steps before current
  // For studio mode (1-5), completed = steps before current
  const completedSteps = new Set(
    Array.from({ length: currentStep - firstStepId }, (_, i) => i),
  );

  // Unsaved changes warning
  const { showDialog, confirmNavigation, cancelNavigation, safeNavigate } =
    useUnsavedChanges({ isDirty });

  const dashboardPath = mode === "onboarding" ? "/dashboard" : "/dashboard"; // Both go to dashboard for now

  const handleCancel = async () => {
    if (isDirty) {
      safeNavigate(dashboardPath);
    } else {
      await cancelWizard();
      router.push(dashboardPath);
    }
  };

  const handleConfirmLeave = async () => {
    await cancelWizard();
    confirmNavigation();
  };

  const handleStepClick = (stepIndex: number) => {
    // stepIndex is 0-based UI index
    // For admin mode: step 0 = index 0, step 1 = index 1, etc.
    // For studio mode: step 1 = index 0, step 2 = index 1, etc.
    const targetStepId = firstStepId + stepIndex;
    if (targetStepId < currentStep) {
      goToStep(targetStepId as 0 | 1 | 2 | 3 | 4 | 5);
    }
  };

  // Calculate current step index for UI (0-based)
  const currentStepIndex = currentStep - firstStepId;

  return (
    <div className="dark flex flex-col h-screen bg-background overflow-hidden text-foreground selection:bg-primary/20">
      {/* Utility Header */}
      <header className="shrink-0 border-b border-white/5 flex items-center justify-between px-10 bg-background/95 backdrop-blur-xl z-20 py-8">
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-black uppercase tracking-widest text-white">
              {mode === "onboarding"
                ? "Project Onboarding"
                : "Create Project Request"}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {mode === "onboarding"
                ? "Finalize your project manifest"
                : "Project Setup"}
            </p>
          </div>
          {projectCode && (
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-white/2 border border-white/5 shadow-sm group hover:border-primary/30 transition-all duration-500 cursor-default">
                <span className="text-[13px] font-mono font-black text-primary tracking-widest leading-none">
                  {projectCode}
                </span>
              </div>

              {/* Header Syncing Indicator - Subtler than the big overlay */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80">
                      Saving
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          {isLoading && (
            <div className="flex items-center gap-2 mr-1 text-white/40 animate-in fade-in slide-in-from-right-2 duration-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Saving
              </span>
            </div>
          )}
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-11 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            Cancel
          </Button>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Step Navigation Sidebar */}
        <aside className="w-64 shrink-0 border-r bg-[#09090b] p-6 flex flex-col pt-10">
          <StepNavigation
            steps={formSteps}
            currentStep={currentStepIndex}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />

          <div className="mt-auto relative">
            <div className="p-5 rounded-xl bg-white/2 border border-white/5 space-y-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm" />
                  <Loader2 className="h-4 w-4 text-primary animate-spin relative z-10" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                  Progress
                </span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                {mode === "onboarding"
                  ? "Upload assets and provide creative notes to initiate production."
                  : "Complete all required fields to proceed to the review stage."}
              </p>
            </div>

            {/* Nav Icon Placeholder (The 'N' button from image) */}
            <div className="absolute -left-2 -bottom-2 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-lg cursor-pointer hover:bg-muted transition-colors">
              <span className="text-[10px] font-black italic">N</span>
            </div>
          </div>
        </aside>

        {/* Content Area - Full Horizontal Width */}
        <main className="flex-1 overflow-y-auto bg-background/50 relative flex flex-col">
          <div className="flex-1 w-full p-6 md:p-8">
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-8 p-4 bg-destructive/5 border border-destructive/10 rounded-xl text-destructive text-xs font-semibold flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Form Container */}
            <div className="relative w-full">
              <AnimatePresence mode="wait">
                {/* Step 0: Studio Selection (Admin mode only) */}
                {currentStep === 0 && mode === "admin" && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <WizardStep0 />
                  </motion.div>
                )}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <WizardStep1 />
                  </motion.div>
                )}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <WizardStep2 />
                  </motion.div>
                )}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <WizardStep3 />
                  </motion.div>
                )}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <WizardStep4 />
                  </motion.div>
                )}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <WizardStep5 />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Global Sticky Footer */}
          <footer className="sticky bottom-0 shrink-0 border-t border-white/5 bg-[#09090b]/95 backdrop-blur-xl px-10 py-6 flex items-center justify-between z-20">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isLoading || currentStep === firstStepId}
              className={cn(
                "h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] border-white/10 hover:bg-white/5 transition-all duration-300 gap-3",
                currentStep === firstStepId && "opacity-0 pointer-events-none",
              )}
            >
              <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mr-4">
                Step {String(currentStepIndex + 1).padStart(2, "0")} /{" "}
                {String(stepCount).padStart(2, "0")}
              </span>
              <Button
                type="button"
                onClick={() => {
                  if (submitTrigger) {
                    submitTrigger();
                  } else {
                    nextStep();
                  }
                }}
                disabled={
                  isLoading ||
                  (currentStep === 0 &&
                    (!formData.step0.selectionMode ||
                      (formData.step0.selectionMode !== "none" &&
                        !formData.step0.studioData)))
                }
                className={cn(
                  "h-12 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all duration-500 group min-w-[180px] gap-3",
                  "bg-white text-black hover:bg-white/90 shadow-white/10",
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {currentStep === 5
                      ? "Submit Project"
                      : isReviewing
                        ? "Save & Return"
                        : currentStep === 4
                          ? "Review Order"
                          : "Next Step"}
                    {currentStep === 5 ? (
                      <Check className="h-4 w-4 group-hover:scale-125 transition-transform" />
                    ) : (
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </>
                )}
              </Button>
            </div>
          </footer>

          {/* Sync Overlay */}
          <AnimatePresence>
            {showSyncOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
              >
                <div className="bg-background/95 border border-border/50 p-6 rounded-4xl shadow-2xl flex flex-col items-center gap-4 min-w-[240px]">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-black uppercase tracking-widest">
                      Saving Changes
                    </p>
                    <p className="text-[10px] text-white font-bold uppercase tracking-tighter opacity-40">
                      Ensuring data integrity...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showDialog} onOpenChange={cancelNavigation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Leaving will discard these changes and
              permanently remove this project draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLeave}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
