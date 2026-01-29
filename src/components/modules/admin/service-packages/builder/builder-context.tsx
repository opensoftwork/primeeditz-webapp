"use client";

import type { Id } from "@convex/_generated/dataModel";
import { createContext, type ReactNode, useContext, useState } from "react";

export interface Step1Data {
  name: string;
  description?: string;
  categoryId?: string;
}

export interface Step2Data {
  projectTypeId: string;
  folderTemplateId: string;
  defaultStorageTierId?: string;
}

export interface LineItem {
  id: string;
  description: string;
  sectionId?: string;
  rate: number;
  quantity: number;
  unit: string;
}

export interface Step3Data {
  lineItems: LineItem[];
  terms?: string;
  applyGST: boolean;
}

interface BuilderContextValue {
  currentStep: number;
  setCurrentStep: (step: number) => void;

  step1Data: Step1Data | null;
  setStep1Data: (data: Step1Data) => void;

  step2Data: Step2Data | null;
  setStep2Data: (data: Step2Data) => void;

  step3Data: Step3Data | null;
  setStep3Data: (data: Step3Data) => void;

  isEditing: boolean;
  packageId: Id<"servicePackages"> | null;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({
  children,
  packageId,
}: {
  children: ReactNode;
  packageId?: Id<"servicePackages">;
}) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null);

  return (
    <BuilderContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        step1Data,
        setStep1Data,
        step2Data,
        setStep2Data,
        step3Data,
        setStep3Data,
        isEditing: !!packageId,
        packageId: packageId || null,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilder must be used within BuilderProvider");
  }
  return context;
}
