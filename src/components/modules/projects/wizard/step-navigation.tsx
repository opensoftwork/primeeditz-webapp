/**
 * Step Navigation Component
 *
 * Visual progress indicator for the wizard with proper styling and animations.
 * Based on the established pattern from the old project.
 */

"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  isOptional?: boolean;
}

interface StepNavigationProps {
  steps: FormStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function StepNavigation({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className,
}: StepNavigationProps) {
  return (
    <div className={cn("w-full px-2 py-2 sm:px-4", className)}>
      <div className="relative mb-4 pt-5">
        <div className="relative flex justify-between items-start">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isClickable =
              onStepClick && (isCompleted || index < currentStep);

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative"
                style={{ flex: 1 }}
              >
                <motion.button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.05 } : undefined}
                  whileTap={isClickable ? { scale: 0.95 } : undefined}
                  className={cn(
                    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                    "bg-background",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : isCurrent
                      ? "border-primary bg-background text-primary shadow-md ring-1 ring-primary/30"
                      : "border-muted-foreground/40 bg-background text-muted-foreground",
                    isClickable &&
                      !isCurrent &&
                      "cursor-pointer hover:ring-2 hover:ring-primary/20",
                    !isClickable && "cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <span className="text-[0.8rem] font-semibold">
                      {index + 1}
                    </span>
                  )}
                </motion.button>

                {/* Step Label */}
                <div className="mt-1 text-center w-full px-1 min-w-0">
                  <p
                    className={cn(
                      "text-[0.78rem] font-medium transition-colors truncate",
                      isCurrent || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                    title={step.title}
                  >
                    {step.title}
                  </p>
                  {step.isOptional && (
                    <p className="text-[0.7rem] text-muted-foreground mt-0.5 truncate">
                      Optional
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
