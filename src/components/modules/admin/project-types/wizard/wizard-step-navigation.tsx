"use client";

import { cn } from "@/lib/utils";
import { useProjectTypeWizard } from "./wizard-context";
import { CheckCircle2, Tag, FolderTree, ClipboardCheck } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface WizardStepNavigationProps {
  steps: Step[];
  currentStep: number;
}

const ICONS = {
  Tag: Tag,
  FolderTree: FolderTree,
  CheckCircle: ClipboardCheck,
};

export function WizardStepNavigation({
  steps,
  currentStep,
}: WizardStepNavigationProps) {
  const { goToStep, canProceed, step1Data, folders } = useProjectTypeWizard();

  const isStepComplete = (stepId: number) => {
    if (stepId === 1) return !!step1Data?.name;
    if (stepId === 2) return folders.length > 0;
    return false;
  };

  const canGoToStep = (stepId: number) => {
    if (stepId < currentStep) return true; // Can always go back
    if (stepId === currentStep) return true;
    if (stepId === currentStep + 1) return canProceed;
    return false;
  };

  return (
    <nav className="space-y-2">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        const isComplete = isStepComplete(stepNum);
        const canNavigate = canGoToStep(stepNum);
        const Icon = ICONS[step.icon as keyof typeof ICONS] || Tag;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => canNavigate && goToStep(stepNum as 1 | 2 | 3)}
            disabled={!canNavigate}
            className={cn(
              "w-full flex items-start gap-4 p-4 rounded-2xl transition-all text-left group",
              isActive
                ? "bg-primary/10 border border-primary/20"
                : canNavigate
                  ? "hover:bg-white/5"
                  : "opacity-40 cursor-not-allowed",
            )}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-lg",
                isActive
                  ? "bg-primary text-black"
                  : isComplete
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/5 text-white/40",
              )}
            >
              {isComplete && !isActive ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  isActive ? "text-primary" : "text-white/80",
                )}
              >
                {step.title}
              </p>
              <p className="text-[10px] text-white/40 font-medium mt-0.5 line-clamp-2 leading-relaxed">
                {step.description}
              </p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
