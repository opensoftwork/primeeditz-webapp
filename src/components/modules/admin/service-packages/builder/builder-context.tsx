"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface Step1Data {
  name: string;
  description?: string;
  categoryId?: string;
}

export interface ProjectConfig {
  id: string;
  label: string;
  projectTypeId: Id<"projectTypes">;
  folderTemplateId: Id<"folderTemplates">;
  defaultStorageTierId?: Id<"storageTiers">;
}

export interface Step2Data {
  projectConfigs: ProjectConfig[];
}

export interface LineItem {
  id: string;
  description: string;
  sectionId?: string;
  projectConfigId?: string;
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

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  submitTrigger: (() => void) | null;
  setSubmitTrigger: (fn: (() => void) | null) => void;
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch package data if editing
  const pkg = useQuery(
    api.functions.servicePackages.queries.get,
    packageId ? { id: packageId } : "skip",
  );

  useEffect(() => {
    if (packageId && pkg && !isInitialized) {
      // Initialize Step 1
      setStep1Data({
        name: pkg.name,
        description: pkg.description,
        categoryId: pkg.categoryId,
      });

      // Initialize Step 2
      // Clone array to avoid read-only mutation
      const projectConfigs = pkg.projectConfigs ? [...pkg.projectConfigs] : [];

      // Handle legacy single-config packages
      if (projectConfigs.length === 0 && pkg.projectTypeId) {
        projectConfigs.push({
          id: crypto.randomUUID(),
          label: "Standard Config",
          projectTypeId: pkg.projectTypeId,
          folderTemplateId: pkg.folderTemplateId as Id<"folderTemplates">,
          defaultStorageTierId: pkg.defaultStorageTierId,
        });
      }

      setStep2Data({
        projectConfigs: projectConfigs.map((config) => ({
          ...config,
          label: config.label ?? "Standard Config",
        })) as ProjectConfig[],
      });

      // Initialize Step 3
      setStep3Data({
        lineItems: pkg.lineItems.map((item) => ({
          ...item,
          id: item.id || crypto.randomUUID(),
        })),
        terms: pkg.terms,
        applyGST: pkg.applyGST ?? true,
      });

      setIsInitialized(true);
    } else if (!packageId) {
      setIsInitialized(true);
    }
  }, [packageId, pkg, isInitialized]);

  const [submitTrigger, setSubmitTrigger] = useState<(() => void) | null>(null);

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) setCurrentStep(step);
  };

  const value = useMemo(
    () => ({
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
      nextStep,
      prevStep,
      goToStep,
      submitTrigger,
      setSubmitTrigger,
    }),
    [currentStep, step1Data, step2Data, step3Data, packageId, submitTrigger],
  );

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
          Loading Configuration...
        </p>
      </div>
    );
  }

  return (
    <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilder must be used within BuilderProvider");
  }
  return context;
}
