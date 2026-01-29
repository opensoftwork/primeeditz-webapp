"use client";

import { ArrowLeft, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { useBuilder } from "./builder-context";
import { Step1Identity } from "./step-1-identity";
import { Step2ProjectConfig } from "./step-2-project-config";
import { Step3Pricing } from "./step-3-pricing";
import { Step4Review } from "./step-4-review";

const STEPS = [
  { id: 1, label: "Identity", description: "Basic Info" },
  { id: 2, label: "Config", description: "Project Setup" },
  { id: 3, label: "Pricing", description: "Line Items" },
  { id: 4, label: "Review", description: "Publishing" },
];

export function PackageBuilder() {
  const { currentStep, isEditing } = useBuilder();
  const router = useRouter();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Identity />;
      case 2:
        return <Step2ProjectConfig />;
      case 3:
        return <Step3Pricing />;
      case 4:
        return <Step4Review />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-12 pb-32">
      {/* Header */}
      <PageHeader
        title={isEditing ? "Edit Package" : "Create Package"}
        description="Configure a unified service offering for your studios"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/settings/service-packages")}
          className="bg-white/5 border-white/5 hover:bg-white/10 h-10 px-4 rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cancel & Exit
        </Button>
      </PageHeader>

      {/* Step Indicator */}
      <div className="max-w-4xl mx-auto">
        <div className="relative flex justify-between items-center px-4">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 z-0 mx-8" />
          <div
            className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 z-0 mx-8 transition-all duration-500 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            }}
          />

          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center gap-3"
              >
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor:
                      isActive || isCompleted
                        ? "var(--primary)"
                        : "rgba(255,255,255,0.05)",
                    scale: isActive ? 1.2 : 1,
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 border-zinc-950 transition-all shadow-xl",
                    isActive || isCompleted ? "bg-primary" : "bg-white/5",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span
                      className={cn(
                        "text-xs font-black",
                        isActive ? "text-white" : "text-white/20",
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </motion.div>
                <div className="absolute top-12 flex flex-col items-center min-w-[80px]">
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest transition-colors",
                      isActive ? "text-white" : "text-white/20",
                    )}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="step-desc"
                      className="text-[8px] font-bold text-primary uppercase tracking-widest mt-1 whitespace-nowrap"
                    >
                      {step.description}
                    </motion.span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
