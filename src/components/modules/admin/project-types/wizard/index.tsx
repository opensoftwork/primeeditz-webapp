"use client";

import { ArrowLeft, ArrowRight, ChevronRight, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WizardStepNavigation } from "./wizard-step-navigation";
import {
  ProjectTypeWizardProvider,
  useProjectTypeWizard,
} from "./wizard-context";
import { Step1Identity } from "./steps/step-1-identity";
import { Step2Folders } from "./steps/step-2-folders";
import { Step3Review } from "./steps/step-3-review";
import { WIZARD_STEPS } from "./types";
import type { Id } from "@convex/_generated/dataModel";

interface ProjectTypeWizardProps {
  projectTypeId?: Id<"projectTypes">;
}

export default function ProjectTypeWizard({
  projectTypeId,
}: ProjectTypeWizardProps) {
  return (
    <ProjectTypeWizardProvider projectTypeId={projectTypeId}>
      <ProjectTypeWizardContent />
    </ProjectTypeWizardProvider>
  );
}

function ProjectTypeWizardContent() {
  const {
    step,
    handleNext,
    handleBack,
    handleSubmit,
    isSubmitting,
    canProceed,
    isEditing,
  } = useProjectTypeWizard();

  return (
    <div className="dark flex flex-col h-screen bg-zinc-950 overflow-hidden text-white selection:bg-primary/20">
      {/* 1. Global Utility Header */}
      <header className="shrink-0 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/95 backdrop-blur-xl z-20 py-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-black uppercase tracking-widest text-white">
              {isEditing ? "Modify Project Type" : "Create Project Type"}
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
              Project Blueprint Configuration
            </p>
          </div>

          <div className="h-6 w-px bg-white/5" />

          <div className="flex items-center gap-5">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                Step 0{step} / 03
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1 w-4 rounded-full transition-all duration-700",
                      s <= step
                        ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        : "bg-white/10",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/settings/project-types">
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
        <aside className="w-80 shrink-0 border-r border-white/5 bg-zinc-950 p-6 flex flex-col pt-10">
          <WizardStepNavigation
            steps={WIZARD_STEPS.map((s) => ({
              id: s.id.toString(),
              title: s.title,
              description: s.description,
              icon: s.icon,
            }))}
            currentStep={step}
          />

          <div className="mt-auto">
            <div className="p-6 rounded-4xl bg-white/3 border border-white/5 space-y-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <X className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-white">
                  Configuration Guide
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-1 text-white/20">
                  Select a category, define folders, and unify defaults.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Step Canvas */}
        <main className="flex-1 overflow-hidden bg-zinc-950/50 relative flex flex-col">
          <div className="flex-1 min-h-0 w-full p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                {step === 1 && <Step1Identity />}
                {step === 2 && <Step2Folders />}
                {step === 3 && <Step3Review />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky Footer */}
          <footer className="sticky bottom-0 shrink-0 border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl px-12 py-6 flex items-center justify-between z-20">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              {step === 1 ? "Exit Wizard" : "Previous Stage"}
            </Button>

            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                Stage {step} of 3
              </span>
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="h-14 px-12 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] group min-w-[200px]"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_10px_40px_rgba(var(--primary),0.2)] min-w-[220px] group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      {isEditing
                        ? "Update Configuration"
                        : "Finalize & Create Type"}
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
