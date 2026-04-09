import { motion } from "motion/react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[...Array(totalSteps)].map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-500 relative bg-white/5 overflow-hidden`}
        >
          {i <= currentStep && (
            <motion.div
              layoutId="step-progress"
              className="absolute inset-0 bg-indigo-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
