/**
 * Project Wizard Container
 *
 * Main container for the 5-step project request wizard.
 * Uses the established pattern with premium UX animations.
 */

"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { WizardFormProvider, useWizardForm } from "./wizard-form-context";
import { StepNavigation, type FormStep } from "./step-navigation";
import { WizardStep1 } from "./steps/step-1-project-type";
import { WizardStep2 } from "./steps/step-2";
import { WizardStep3 } from "./steps/step-3-files";
import { WizardStep4 } from "./steps/step-4-description";
import { WizardStep5 } from "./steps/step-5-review";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { ArrowLeft, Loader2, X } from "lucide-react";
import Link from "next/link";

// Define the wizard steps
const WIZARD_STEPS: FormStep[] = [
  { id: "basic", title: "Basics" },
  { id: "details", title: "Details" },
  { id: "files", title: "Files", isOptional: true },
  { id: "description", title: "Description" },
  { id: "review", title: "Review" },
];

export function ProjectWizard() {
  return (
    <WizardFormProvider>
      <ProjectWizardContent />
    </WizardFormProvider>
  );
}

function ProjectWizardContent() {
  const router = useRouter();
  const { currentStep, projectCode, isDirty, isLoading, error, goToStep } =
    useWizardForm();

  // Track completed steps based on current progress
  const completedSteps = new Set(
    Array.from({ length: currentStep }, (_, i) => i)
  );

  // Unsaved changes warning
  const { showDialog, confirmNavigation, cancelNavigation, safeNavigate } =
    useUnsavedChanges({ isDirty });

  const handleCancel = () => {
    if (isDirty) {
      safeNavigate("/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      goToStep((stepIndex + 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="py-4 px-3 md:py-5 md:px-5 lg:py-6 lg:px-6">
        <div className="w-full max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl backdrop-blur-md bg-card/95 overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-muted/30">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <div className="absolute -top-1 -right-1 w-24 h-24 bg-linear-to-bl from-primary/10 to-transparent rounded-bl-full" />

              <CardHeader className="relative px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-4">
                  <div className="flex-1 space-y-2.5">
                    <div className="flex-1 space-y-1.5">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          New Project Request
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1 w-12 bg-linear-to-r from-primary to-primary/60 rounded-full" />
                          {projectCode && (
                            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
                              {projectCode}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Step Navigation */}
              <div className="border-t bg-muted/10">
                <StepNavigation
                  steps={WIZARD_STEPS}
                  currentStep={currentStep - 1}
                  completedSteps={completedSteps}
                  onStepClick={handleStepClick}
                  className="py-1"
                />
              </div>
            </div>

            {/* Form Content */}
            <CardContent className="p-4 sm:p-5 lg:p-6">
              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading Overlay */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20"
                  >
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Saving...
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Content */}
              <div className="min-h-[400px] relative">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <WizardStep1 />
                    </motion.div>
                  )}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <WizardStep2 />
                    </motion.div>
                  )}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <WizardStep3 />
                    </motion.div>
                  )}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <WizardStep4 />
                    </motion.div>
                  )}
                  {currentStep === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <WizardStep5 />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your
              draft will be saved, but any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
