/**
 * Quotation Builder Form Context
 *
 * Provides form state management across quotation builder steps using React Context.
 * Modularized into hooks to manage complexity.
 */

"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  INITIAL_FORM_DATA,
  QuotationFormData,
  QuotationStepId,
  QUOTATION_STEPS,
} from "./constants";
import {
  useQuotationState,
} from "./hooks/use-quotation-state";
import {
  useQuotationCalculations,
} from "./hooks/use-quotation-calculations";
import {
  useQuotationMutations,
} from "./hooks/use-quotation-mutations";
import {
  useQuotationPackageLogic,
} from "./hooks/use-quotation-package-logic";
import {
  useQuotationItems,
} from "./hooks/use-quotation-items";
import type {
  Client,
  Project,
  QuotationLineItem,
  QuotationSubItem,
  Section,
  Template,
} from "./types";

export { QUOTATION_STEPS };
export type { QuotationFormData, QuotationStepId };
export { INITIAL_FORM_DATA };

// ============================================================================
// Context Types
// ============================================================================

interface QuotationBuilderContextValue {
  // State
  quotationId: string | null;
  currentStep: QuotationStepId;
  formData: QuotationFormData;
  isDirty: boolean;
  isLoading: boolean;
  isDataReady: boolean;
  error: string | null;
  submitTrigger: (() => void) | null;

  // Data from queries
  studios: Client[] | undefined;
  projects: Project[] | undefined;
  templates: Template[] | undefined;
  sections: Section[] | undefined;
  selectedStudio: Client | undefined;

  // Computed values
  subtotal: number;
  taxAmount: number;
  grandTotal: number;

  // Actions
  setFormData: <K extends keyof QuotationFormData>(
    step: K,
    data: Partial<QuotationFormData[K]>,
  ) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  applyPackageItems: () => void;
  addLineItem: (data?: Partial<QuotationLineItem>) => void;
  updateLineItem: (idx: number, updates: Partial<QuotationLineItem>) => void;
  removeLineItem: (idx: number) => void;
  addSubItem: (
    parentIdx: number,
    subItem: QuotationSubItem,
    subParentIdx?: number,
  ) => void;
  updateSubItem: (
    parentIdx: number,
    subIdx: number,
    updates: Partial<QuotationSubItem>,
    subSubIdx?: number,
  ) => void;
  removeSubItem: (
    parentIdx: number,
    subIdx: number,
    subSubIdx?: number,
  ) => void;
  saveQuotation: () => Promise<void>;
  saveQuotationAndReturn: () => Promise<string | null>;
  setSubmitTrigger: (fn: (() => void) | null) => void;
}

const QuotationBuilderContext =
  createContext<QuotationBuilderContextValue | null>(null);

// ============================================================================
// Hook
// ============================================================================

export function useQuotationBuilder() {
  const context = useContext(QuotationBuilderContext);
  if (!context) {
    throw new Error(
      "useQuotationBuilder must be used within QuotationBuilderProvider",
    );
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface QuotationBuilderProviderProps {
  children: React.ReactNode;
  initialQuotationId?: string;
  initialStep?: 1 | 2 | 3;
}

export function QuotationBuilderProvider({
  children,
  initialQuotationId,
  initialStep = 1,
}: QuotationBuilderProviderProps) {
  const router = useRouter();

  // State
  const [quotationId, setQuotationId] = useState<string | null>(
    initialQuotationId ?? null,
  );
  
  const {
    formData,
    formDataRef,
    setFormData,
    updateFormData,
    currentStep,
    setCurrentStep,
    isDirty,
    setIsDirty
  } = useQuotationState(initialStep);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitTrigger, setSubmitTriggerState] = useState<(() => void) | null>(
    null,
  );

  // Refs for logic
  const lastUpdateTimestampRef = useRef<number>(0);
  const isLocalUpdateRef = useRef(false);
  const draftWasSeenRef = useRef(false);

  // Queries
  const existingQuotation = useQuery(
    // @ts-ignore
    api.functions.quotations.queries.getQuotation,
    quotationId ? { quotationId: quotationId as Id<"quotations"> } : "skip",
  );

  const latestDraft = useQuery(
    api.functions.quotations.queries.getMyLatestDraft,
    !quotationId ? {} : "skip",
  );

  useEffect(() => {
    if (!quotationId && latestDraft && !isLoading) {
      router.replace(`/quotations/${latestDraft._id}/builder`);
    }
  }, [latestDraft, quotationId, router, isLoading]);

  const isDataReady =
    (quotationId && existingQuotation !== undefined) ||
    (!quotationId && latestDraft === null);

  // Sync with DB
  useEffect(() => {
    if (existingQuotation && quotationId && !isLocalUpdateRef.current) {
      const serverTimestamp = existingQuotation.updatedAt || 0;

      if (!isDirty || serverTimestamp > lastUpdateTimestampRef.current) {
        updateFormData(() => ({
          step1: {
            studioId: existingQuotation.studioId || "",
            validUntil: existingQuotation.validUntil
              ? new Date(existingQuotation.validUntil)
              : undefined,
          },
          step2: {
            packageIds: (existingQuotation.selectedPackageIds as string[]) || [],
          },
          step3: {
            projectIds: existingQuotation.projectIds || [],
            lineItems: existingQuotation.lineItems.map((item: any) => ({
              ...item,
              id: item.id || crypto.randomUUID(),
            })),
            terms: existingQuotation.terms || "",
            taxRate: (existingQuotation.taxRate || 0.18) * 100,
            discountAmount: existingQuotation.discountAmount || 0,
            shareLinkEnabled: true,
          },
        }));

        if (existingQuotation.lastStep) {
          setCurrentStep(existingQuotation.lastStep as QuotationStepId);
        }

        lastUpdateTimestampRef.current = serverTimestamp;
      }
    }
    isLocalUpdateRef.current = false;
  }, [existingQuotation, quotationId, isDirty, updateFormData, setCurrentStep]);

  useEffect(() => {
    if (existingQuotation) draftWasSeenRef.current = true;
  }, [existingQuotation]);

  useEffect(() => {
    if (isDataReady && quotationId && !isLoading) {
      if (existingQuotation === null && draftWasSeenRef.current) {
        toast.error("Quotation session ended");
        router.push("/quotations");
      }
    }
  }, [existingQuotation, isDataReady, quotationId, isLoading, router]);

  // Master Data Queries
  const studiosQuery = useQuery(api.admin.getStudios, {});
  const studios = studiosQuery as Client[] | undefined;

  const projectsQuery = useQuery(
    api.admin.getAdminProjectsSimple,
    formData.step1.studioId
      ? { studioId: formData.step1.studioId as Id<"profiles"> }
      : "skip",
  );

  const templatesQuery = useQuery(
    api.functions.quotations.templates.queries.getPackages,
    { activeOnly: true },
  );
  const templates = templatesQuery as Template[] | undefined;

  const sectionsQuery = useQuery(
    api.functions.quotations.sections.queries.getSections,
    { activeOnly: true },
  );
  const sections = sectionsQuery as Section[] | undefined;

  const selectedStudio = useMemo(
    () => studios?.find((c) => c._id === formData.step1.studioId),
    [studios, formData.step1.studioId],
  );

  const projects = useMemo((): Project[] | undefined => {
    if (!projectsQuery || !Array.isArray(projectsQuery)) return undefined;
    return projectsQuery as Project[];
  }, [projectsQuery]);

  // Hooks integration
  const { calculateItemTotal, subtotal, taxAmount, grandTotal } = useQuotationCalculations(formData);

  const { performSave } = useQuotationMutations({
    formDataRef,
    quotationId,
    setQuotationId,
    currentStep,
    projects,
    selectedStudio,
    sections,
    isLocalUpdateRef,
    lastUpdateTimestampRef,
  });

  const { applyPackageItems, lastAppliedPackageIds } = useQuotationPackageLogic(
    formDataRef,
    updateFormData,
    templates
  );
  
  // Sync package ID ref with DB data
  useEffect(() => {
    if (existingQuotation?.selectedPackageIds) {
      lastAppliedPackageIds.current = JSON.stringify(existingQuotation.selectedPackageIds);
    }
  }, [existingQuotation, lastAppliedPackageIds]);

  const {
    addLineItem,
    updateLineItem,
    removeLineItem,
    addSubItem,
    updateSubItem,
    removeSubItem,
  } = useQuotationItems(updateFormData);

  // Public Actions
  const goToStep = useCallback(
    async (step: number) => {
      if (step >= 1 && step <= 3) {
        setCurrentStep(step as QuotationStepId);
        toast.promise(performSave(true, { lastStep: step }), {
          loading: "Saving progress...",
          success: "Progress saved",
          error: "Failed to save progress",
        });
      }
    },
    [performSave, setCurrentStep],
  );

  const nextStep = useCallback(async () => {
    const next = Math.min(currentStep + 1, 3) as QuotationStepId;
    if (next !== currentStep) {
      setCurrentStep(next);
      toast.promise(performSave(true, { lastStep: next }), {
        loading: "Saving progress...",
        success: "Progress saved",
        error: "Failed to save progress",
      });
    }
  }, [currentStep, performSave, setCurrentStep]);

  const prevStep = useCallback(async () => {
    const prev = Math.max(currentStep - 1, 1) as QuotationStepId;
    if (prev !== currentStep) {
      setCurrentStep(prev);
      toast.promise(performSave(true, { lastStep: prev }), {
        loading: "Saving progress...",
        success: "Progress saved",
        error: "Failed to save progress",
      });
    }
  }, [currentStep, performSave, setCurrentStep]);

  const saveQuotation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resId = await performSave(false);
      if (!quotationId && resId) {
        router.push(`/quotations/${resId}/builder?step=${currentStep}`);
      }
      toast.success(quotationId ? "Quotation updated" : "Quotation created");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [performSave, quotationId, router, currentStep]);

  const saveQuotationAndReturn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await performSave(false);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [performSave]);

  const setSubmitTrigger = useCallback((fn: (() => void) | null) => {
    setSubmitTriggerState(() => fn);
  }, []);

  const value = {
    quotationId,
    currentStep,
    formData,
    isDirty,
    isLoading,
    isDataReady,
    error,
    submitTrigger,
    studios,
    projects,
    templates,
    sections,
    selectedStudio,
    subtotal,
    taxAmount,
    grandTotal,
    setFormData,
    goToStep,
    nextStep,
    prevStep,
    applyPackageItems,
    addLineItem,
    updateLineItem,
    removeLineItem,
    addSubItem,
    updateSubItem,
    removeSubItem,
    saveQuotation,
    saveQuotationAndReturn,
    setSubmitTrigger,
  };

  return (
    <QuotationBuilderContext.Provider value={value}>
      {children}
    </QuotationBuilderContext.Provider>
  );
}
