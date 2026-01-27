/**
 * Step Navigation Component (Slim Vertical)
 *
 * ultra-slim vertical stepper following the provided reference image.
 */

"use client";

import { CheckIcon } from "lucide-react";
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
    <nav className={cn("flex flex-col gap-3", className)} aria-label="Progress">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(index);
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && (isCompleted || index < currentStep);

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => isClickable && onStepClick?.(index)}
            disabled={!isClickable}
            className={cn(
              "group relative flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 w-full text-left",
              isCurrent
                ? "bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.05)]"
                : isClickable
                  ? "hover:bg-white/5 cursor-pointer"
                  : "opacity-80 cursor-default",
            )}
          >
            {/* Indicator Box */}
            <div className="relative shrink-0">
              <span
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold border-2 transition-all duration-500",
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20"
                    : isCurrent
                      ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-white/5 border-white/10 text-muted-foreground/30 group-hover:border-white/20",
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5 stroke-[3px]" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>

              {/* Active Pulse effect */}
              {isCurrent && (
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping -z-10" />
              )}
            </div>

            {/* Label Content */}
            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest font-black mb-0.5 transition-opacity duration-300",
                  isCurrent || isCompleted ? "opacity-40" : "opacity-20",
                )}
              >
                Step {index + 1}
              </span>
              <span
                className={cn(
                  "text-[15px] font-bold tracking-tight transition-all duration-300",
                  isCurrent
                    ? "text-foreground"
                    : isCompleted
                      ? "text-foreground/80"
                      : "text-muted-foreground/20",
                )}
              >
                {step.title}
              </span>
              {step.isOptional && !isCurrent && !isCompleted && (
                <span className="text-[10px] text-muted-foreground/20 font-bold mt-0.5">
                  Optional
                </span>
              )}
            </div>

            {/* Active Indicator Bar (Left) */}
            {isCurrent && (
              <motion.div
                layoutId="active-bar"
                className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
