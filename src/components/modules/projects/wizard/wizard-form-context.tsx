/**
 * Wizard Form Context
 *
 * Provides form state management across wizard steps using React Context.
 * Persists form data to Convex draft on step changes.
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  type WizardFormData,
  type WizardStepId,
  INITIAL_FORM_DATA,
  WIZARD_STEPS,
} from "./types";

// ============================================================================
// Context Types
// ============================================================================

interface WizardContextValue {
  // State
  projectId: Id<"projects"> | null;
  projectCode: string | null;
  currentStep: WizardStepId;
  formData: WizardFormData;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setFormData: <K extends keyof WizardFormData>(
    step: K,
    data: Partial<WizardFormData[K]>
  ) => void;
  goToStep: (step: WizardStepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveDraft: () => Promise<void>;
  submitProject: () => Promise<boolean>;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

// ============================================================================
// Hook
// ============================================================================

export function useWizardForm() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizardForm must be used within WizardFormProvider");
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface WizardFormProviderProps {
  children: React.ReactNode;
  initialProjectId?: Id<"projects">;
  initialProjectCode?: string;
  initialStep?: WizardStepId;
  initialFormData?: Partial<WizardFormData>;
}

export function WizardFormProvider({
  children,
  initialProjectId,
  initialProjectCode,
  initialStep = 1,
  initialFormData,
}: WizardFormProviderProps) {
  // State
  const [projectId, setProjectId] = useState<Id<"projects"> | null>(
    initialProjectId ?? null
  );
  const [projectCode, setProjectCode] = useState<string | null>(
    initialProjectCode ?? null
  );
  const [currentStep, setCurrentStep] = useState<WizardStepId>(initialStep);
  const [formData, setFormDataState] = useState<WizardFormData>({
    ...INITIAL_FORM_DATA,
    ...initialFormData,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutations
  const createDraft = useMutation(api.functions.projects.mutations.createDraft);
  const updateDraft = useMutation(api.functions.projects.mutations.updateDraft);
  const submitProjectMutation = useMutation(
    api.functions.projects.mutations.submitProject
  );

  // Create draft on first load if no projectId
  useEffect(() => {
    if (!projectId) {
      const initDraft = async () => {
        setIsLoading(true);
        try {
          const result = await createDraft({});
          setProjectId(result.projectId);
          setProjectCode(result.code);
          setError(null);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to create draft"
          );
        } finally {
          setIsLoading(false);
        }
      };
      initDraft();
    }
  }, [projectId, createDraft]);

  // Update form data for a specific step
  const setFormData = useCallback(
    <K extends keyof WizardFormData>(
      step: K,
      data: Partial<WizardFormData[K]>
    ) => {
      setFormDataState((prev) => ({
        ...prev,
        [step]: { ...prev[step], ...data },
      }));
      setIsDirty(true);
    },
    []
  );

  // Save current form data to Convex draft
  const saveDraft = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);
    try {
      await updateDraft({
        projectId,
        // Step 1
        projectTypeId: formData.step1.projectTypeId ?? undefined,
        endClientName: formData.step1.endClientName || undefined,
        eventName: formData.step1.eventName || undefined,
        eventDate: formData.step1.eventDate ?? undefined,
        venue: formData.step1.venue || undefined,
        // Step 2
        typeSpecificDetails: formData.step2.typeSpecificDetails,
        // Step 3
        referenceFiles:
          formData.step3.referenceFiles.length > 0
            ? formData.step3.referenceFiles
            : undefined,
        // Step 4
        description: formData.step4.description || undefined,
        additionalNotes: formData.step4.additionalNotes || undefined,
        preferredDeliveryDate:
          formData.step4.preferredDeliveryDate ?? undefined,
      });
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, formData, updateDraft]);

  // Navigation
  const goToStep = useCallback(
    async (step: WizardStepId) => {
      // Save current step before navigating
      if (isDirty) {
        try {
          await saveDraft();
        } catch {
          // Don't navigate if save fails
          return;
        }
      }
      setCurrentStep(step);
    },
    [isDirty, saveDraft]
  );

  const nextStep = useCallback(async () => {
    const nextIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep) + 1;
    if (nextIndex < WIZARD_STEPS.length) {
      await goToStep(WIZARD_STEPS[nextIndex].id);
    }
  }, [currentStep, goToStep]);

  const prevStep = useCallback(async () => {
    const prevIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep) - 1;
    if (prevIndex >= 0) {
      await goToStep(WIZARD_STEPS[prevIndex].id);
    }
  }, [currentStep, goToStep]);

  // Submit project
  const submitProject = useCallback(async (): Promise<boolean> => {
    if (!projectId) return false;

    setIsLoading(true);
    setError(null);
    try {
      // Save final form data first
      await saveDraft();
      // Then submit
      await submitProjectMutation({ projectId });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit project");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, saveDraft, submitProjectMutation]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setProjectId(null);
    setProjectCode(null);
    setCurrentStep(1);
    setFormDataState(INITIAL_FORM_DATA);
    setIsDirty(false);
    setError(null);
  }, []);

  return (
    <WizardContext.Provider
      value={{
        projectId,
        projectCode,
        currentStep,
        formData,
        isDirty,
        isLoading,
        error,
        setFormData,
        goToStep,
        nextStep,
        prevStep,
        saveDraft,
        submitProject,
        resetWizard,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}
