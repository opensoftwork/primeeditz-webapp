/**
 * Quotation Builder Form Context
 *
 * Provides form state management across quotation builder steps using React Context.
 * Follows the established TanStack Form pattern from the project wizard.
 */

"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
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
import type {
  Client,
  Project,
  QuotationLineItem,
  QuotationSubItem,
  Section,
  Template,
  TemplateLineItem,
} from "./types";

// ============================================================================
// Types
// ============================================================================

export type QuotationStepId = 1 | 2 | 3 | 4;

export interface QuotationFormData {
  step1: {
    studioId: string;
    validUntil: Date | undefined;
  };
  step2: {
    // Package Selection
    packageIds: string[];
  };
  step3: {
    // Project & Template Selection (Legacy Step 3 data moved here or implicitly handled)
    projectIds: string[];
    projectTemplates: Record<string, string>; // projectId -> templateId
  };
  step4: {
    // Items & Terms
    lineItems: QuotationLineItem[];
    terms: string;
  };
  step5: {
    // Review & Send
    taxRate: number;
    discountAmount: number;
    shareLinkEnabled: boolean;
  };
}

export const INITIAL_FORM_DATA: QuotationFormData = {
  step1: {
    studioId: "",
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  step2: {
    packageIds: [],
  },
  step3: {
    projectIds: [],
    projectTemplates: {},
  },
  step4: {
    lineItems: [],
    terms: "",
  },
  step5: {
    taxRate: 18,
    discountAmount: 0,
    shareLinkEnabled: true,
  },
};

export const QUOTATION_STEPS = [
  { id: 1 as const, label: "Studio & Context" },
  { id: 2 as const, label: "Package Selection" },
  { id: 3 as const, label: "Items & Terms" },
  { id: 4 as const, label: "Review & Send" },
];

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
  initialStep?: 1 | 2 | 3 | 4;
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
  const [currentStep, setCurrentStep] = useState<QuotationStepId>(initialStep);
  const [formData, setFormDataState] =
    useState<QuotationFormData>(INITIAL_FORM_DATA);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitTrigger, setSubmitTriggerState] = useState<(() => void) | null>(
    null,
  );

  // Refs for tracking draft state and preventing race conditions (merging pattern from studio wizard)
  const lastUpdateTimestamp = useRef<number>(0);
  const isLocalUpdate = useRef(false);
  const draftWasSeen = useRef(false);

  // Query existing quotation if editing
  const existingQuotation = useQuery(
    api.functions.quotations.queries.getQuotation,
    quotationId ? { quotationId: quotationId as Id<"quotations"> } : "skip",
  );

  // Auto-resume logic: If no specific ID provided, check for the latest un-finalized draft
  const latestDraft = useQuery(
    api.functions.quotations.queries.getMyLatestDraft,
    !quotationId ? {} : "skip",
  );

  // Redirection effect for auto-resume
  useEffect(() => {
    if (!quotationId && latestDraft && !isLoading) {
      // Small delay to let user see "Redirecting to your draft..." if we added a message
      // But for now, let's just do it.
      router.replace(`/quotations/${latestDraft._id}/builder`);
    }
  }, [latestDraft, quotationId, router, isLoading]);

  // Data loading state - ready when:
  // 1. Not editing AND no draft found (truly new), OR
  // 2. Editing and existingQuotation has loaded
  // 3. We are in the middle of a redirect (hide content)
  const isDataReady =
    (quotationId && existingQuotation !== undefined) ||
    (!quotationId && latestDraft === null);

  // Populate form data if editing
  useEffect(() => {
    // Only overwrite local state if we have data from DB and either:
    // 1. We are not dirty (no unsaved local changes)
    // 2. This is the first time we're getting data for this quotation
    // AND it's not a local update echo
    if (existingQuotation && quotationId && !isLocalUpdate.current) {
      const serverTimestamp = existingQuotation.updatedAt || 0;

      if (!isDirty || serverTimestamp > lastUpdateTimestamp.current) {
        setFormDataState({
          step1: {
            studioId: existingQuotation.studioId || "",
            validUntil: existingQuotation.validUntil
              ? new Date(existingQuotation.validUntil)
              : undefined,
          },
          step2: {
            packageIds:
              (existingQuotation.selectedPackageIds as string[]) || [],
          },
          step3: {
            projectIds: existingQuotation.projectIds || [],
            projectTemplates: {},
          },
          step4: {
            lineItems: existingQuotation.lineItems.map((item: any) => ({
              ...item,
              id: item.id || crypto.randomUUID(),
            })),
            terms: existingQuotation.terms || "",
          },
          step5: {
            taxRate: (existingQuotation.taxRate || 0.18) * 100,
            discountAmount: existingQuotation.discountAmount || 0,
            shareLinkEnabled: true,
          },
        });

        if (existingQuotation.lastStep) {
          setCurrentStep(existingQuotation.lastStep as QuotationStepId);
        }
        
        lastUpdateTimestamp.current = serverTimestamp;
      }
    }
    // Always reset local update flag after processing
    isLocalUpdate.current = false;
  }, [existingQuotation, quotationId, isDirty]);

  // Update draftWasSeen when data is available
  useEffect(() => {
    if (existingQuotation) {
      draftWasSeen.current = true;
    }
  }, [existingQuotation]);

  // Reactive monitor for quotation existence
  useEffect(() => {
    if (isDataReady && quotationId && !isLoading) {
      if (existingQuotation === null && draftWasSeen.current) {
        toast.error("Quotation session ended", {
          description: "This quotation has been removed or finalized in another session.",
        });
        router.push("/quotations");
      }
    }
  }, [existingQuotation, isDataReady, quotationId, isLoading, router]);

  // Queries - cast to proper types
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
    {
      activeOnly: true,
    },
  );
  const templates = templatesQuery as Template[] | undefined;

  const sectionsQuery = useQuery(
    api.functions.quotations.sections.queries.getSections,
    {
      activeOnly: true,
    },
  );
  const sections = sectionsQuery as Section[] | undefined;

  // Mutations
  const createQuotation = useMutation(
    api.functions.quotations.mutations.createQuotation,
  );
  const updateQuotation = useMutation(
    api.functions.quotations.mutations.updateQuotation,
  );

  // Computed
  const selectedStudio = useMemo(
    () => studios?.find((c) => c._id === formData.step1.studioId),
    [studios, formData.step1.studioId],
  );

  const projects = useMemo((): Project[] | undefined => {
    if (!projectsQuery || !Array.isArray(projectsQuery)) return undefined;
    return projectsQuery as Project[];
  }, [projectsQuery]);

  const subtotal = useMemo(() => {
    return formData.step4.lineItems.reduce((acc, item) => {
      const itemTotal = item.rate * item.quantity;
      const subItemsTotal =
        item.subItems?.reduce(
          (s: number, sub: QuotationSubItem) => s + sub.rate * sub.quantity,
          0,
        ) ?? 0;
      return acc + itemTotal + subItemsTotal;
    }, 0);
  }, [formData.step4.lineItems]);

  const taxAmount =
    (subtotal - formData.step5.discountAmount) * (formData.step5.taxRate / 100);
  const grandTotal = subtotal - formData.step5.discountAmount + taxAmount;


  // Save quotation core logic (shared between Finalize and Auto-save)
  const performSave = useCallback(
    async (isAutoSave = false, overrides: any = {}) => {
      const { step1, step2, step3, step4, step5 } = formData;

      // For auto-save, we can be more lenient, but we at least need a studio
      if (isAutoSave && !step1.studioId) return null;
      if (!isAutoSave && !step1.studioId)
        throw new Error("Please select a client");

      // Skip auto-save if no packages or line items (backend would reject anyway)
      if (isAutoSave && step4.lineItems.length === 0 && step2.packageIds.length === 0) {
        return null;
      }

      // Validation for line items only on final submission, unless we have package IDs
      if (
        !isAutoSave &&
        step4.lineItems.length === 0 &&
        step2.packageIds.length === 0
      ) {
        throw new Error("Please add packages or line items");
      }

      const lineItemsPayload = step4.lineItems.map((item) => {
        // Ensure sectionId is either a valid ID or undefined, never an empty string
        const sectionId = item.sectionId || sections?.[0]?._id;

        return {
          id: item.id || crypto.randomUUID(),
          sectionId: sectionId as Id<"quotationSections"> | undefined,
          projectId: item.projectId,
          description: item.description,
          unit: item.unit,
          rate: item.rate,
          quantity: item.quantity,
          spawnsProject: item.spawnsProject,
          projectTypeId: item.projectTypeId as Id<"projectTypes"> | undefined,
          selectedFolderTemplateId: item.selectedFolderTemplateId as
            | Id<"folderTemplates">
            | undefined,
          subItems: item.subItems?.map((s) => ({
            id: s.id || crypto.randomUUID(),
            description: s.description,
            unit: s.unit,
            rate: s.rate,
            quantity: s.quantity,
          })),
        };
      });

      const firstProjectId = step3.projectIds[0];
      const associatedProject = (projects as Project[])?.find(
        (p) => p._id === firstProjectId,
      );
      const endClientName =
        associatedProject?.eventName ||
        selectedStudio?.name ||
        "Untitled Quotation";

      const projectIds =
        step3.projectIds.length > 0
          ? (step3.projectIds as Id<"projects">[])
          : undefined;

      // Base payload shared between create and update
      const basePayload = {
        studioId: step1.studioId as Id<"profiles">,
        projectIds: projectIds,
        selectedPackageIds: step2.packageIds as Id<"servicePackages">[],
        lineItems: lineItemsPayload,
        terms: step4.terms,
        taxRate: step5.taxRate / 100,
        discountAmount: step5.discountAmount,
        validUntil: step1.validUntil?.getTime(),
        endClientName,
        lastStep: currentStep,
        ...overrides,
      };

      if (quotationId) {
        // Update existing quotation (no createdBy field)
        isLocalUpdate.current = true;
        lastUpdateTimestamp.current = Date.now();
        await updateQuotation({
          quotationId: quotationId as Id<"quotations">,
          ...basePayload,
        });
        return quotationId;
      } else {
        // Create new quotation (includes createdBy)
        isLocalUpdate.current = true;
        lastUpdateTimestamp.current = Date.now();
        const res = await createQuotation({
          ...basePayload,
          createdBy: "ADMIN",
        });
        setQuotationId(res);
        // Silently update URL if we created a new quotation via auto-save
        if (isAutoSave) {
          window.history.replaceState(
            null,
            "",
            `/quotations/${res}/builder?step=${currentStep}`,
          );
        }
        return res;
      }
    },
    [
      formData,
      sections,
      projects,
      selectedStudio,
      currentStep,
      quotationId,
      updateQuotation,
      createQuotation,
    ],
  );

  // Navigation
  const goToStep = useCallback(async (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step as QuotationStepId);
      toast.promise(performSave(true, { lastStep: step }), {
        loading: "Saving progress...",
        success: "Progress saved",
        error: "Failed to save progress",
      });
    }
  }, [performSave]);

  const nextStep = useCallback(async () => {
    const next = Math.min(currentStep + 1, 4) as QuotationStepId;
    if (next !== currentStep) {
      setCurrentStep(next);
      toast.promise(performSave(true, { lastStep: next }), {
        loading: "Saving progress...",
        success: "Progress saved",
        error: "Failed to save progress",
      });
    }
  }, [currentStep, performSave]);

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
  }, [currentStep, performSave]);

  // Item Management
  const addLineItem = useCallback((data?: Partial<QuotationLineItem>) => {
    const newItem: QuotationLineItem = {
      id: crypto.randomUUID(),
      description: "",
      rate: 0,
      quantity: 1,
      unit: "ea",
      ...data,
    };
    setFormDataState((prev) => ({
      ...prev,
      step4: {
        ...prev.step4,
        lineItems: [...prev.step4.lineItems, newItem],
      },
    }));
    setIsDirty(true);
  }, []);

  const updateLineItem = useCallback(
    (idx: number, updates: Partial<QuotationLineItem>) => {
      setFormDataState((prev) => {
        const newItems = [...prev.step4.lineItems];
        newItems[idx] = { ...newItems[idx], ...updates };
        return {
          ...prev,
          step4: { ...prev.step4, lineItems: newItems },
        };
      });
      setIsDirty(true);
    },
    [],
  );

  const removeLineItem = useCallback((idx: number) => {
    setFormDataState((prev) => {
      const newItems = [...prev.step4.lineItems];
      newItems.splice(idx, 1);
      return {
        ...prev,
        step4: { ...prev.step4, lineItems: newItems },
      };
    });
    setIsDirty(true);
  }, []);

  // Package Logic
  const applyPackageItems = useCallback(() => {
    // Only apply if we have packages and no items yet (or logic to merge)
    // For now, let's simply append items from selected packages if they aren't already there?
    // Or closer to original: Reset items based on packages?
    // Let's implement a safe add: Add items from packages if the list is empty.

    if (!templates) return;

    const { step2, step4 } = formData;

    // IF line items are already populated, we might not want to nuke them every time we nav.
    // However, if the user fundamentally changed packages, we might expect updates.
    // For this refactor, let's assume we populate if empty to avoid accidental data loss.
    if (step4.lineItems.length > 0) return;

    const selectedTemplates = templates.filter((t) =>
      step2.packageIds.includes(t._id),
    );

    const newItems: QuotationLineItem[] = [];

    selectedTemplates.forEach((template) => {
      template.lineItems.forEach((item) => {
        newItems.push({
          id: crypto.randomUUID(),
          description: item.description,
          unit: item.unit,
          rate: item.rate,
          quantity: item.quantity,
          sectionId: item.sectionId,
          spawnsProject: item.spawnsProject,
          projectTypeId: item.projectTypeId as string,
          selectedFolderTemplateId: item.selectedFolderTemplateId as string,
          subItems: item.subItems?.map((s) => ({
            description: s.description,
            unit: "unit",
            rate: s.amount || 0,
            quantity: 1,
          })),
        });
      });
    });

    if (newItems.length > 0) {
      setFormDataState((prev) => ({
        ...prev,
        step4: {
          ...prev.step4,
          lineItems: newItems,
        },
      }));
      setIsDirty(true);
    }
  }, [formData, templates]);

  // Update form data for a specific step
  const setFormData = useCallback(
    <K extends keyof QuotationFormData>(
      step: K,
      data: Partial<QuotationFormData[K]>,
    ) => {
      setFormDataState((prev) => ({
        ...prev,
        [step]: { ...prev[step], ...data },
      }));
      setIsDirty(true);
    },
    [],
  );



  // Save quotation (Public Action)
  const saveQuotation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resId = await performSave(false);
      if (!quotationId && resId) {
        router.push(`/quotations/${resId}/builder?step=${currentStep}`);
      }
      toast.success(
        quotationId
          ? "Quotation updated successfully"
          : "Quotation created successfully",
      );
      setIsDirty(false);
    } catch (err: unknown) {
      handleError(err, "Failed to save quotation");
    } finally {
      setIsLoading(false);
    }
  }, [performSave, quotationId, router, currentStep]);

  // Save quotation and return ID
  const saveQuotationAndReturn = useCallback(async (): Promise<
    string | null
  > => {
    setIsLoading(true);
    setError(null);
    try {
      const resId = await performSave(false);
      setIsDirty(false);
      return resId;
    } catch (err: unknown) {
      handleError(err, "Failed to save quotation");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [performSave]);

  // Auto-save logic
  useEffect(() => {
    if (!isDirty || isLoading || !isDataReady) return;

    const timer = setTimeout(async () => {
      try {
        await performSave(true);
        setIsDirty(false);
        // No toast for auto-save to keep it subtle
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [isDirty, performSave, isLoading, isDataReady]);

  // Centralized error handler
  const handleError = (err: unknown, defaultMessage: string) => {
    let message = defaultMessage;
    if (err instanceof Error) {
      const errorMessage = err.message;
      if (errorMessage.includes("Can only edit draft quotations")) {
        message = "This quotation can no longer be edited. Redirecting...";
        setTimeout(() => router.push(`/quotations/${quotationId}`), 1500);
      } else if (errorMessage.includes("Quotation not found")) {
        message = "This quotation no longer exists.";
      } else {
        const match = errorMessage.match(/Uncaught Error: (.+?)(?:\n|$)/);
        message = match?.[1] || errorMessage;
      }
    }
    setError(message);
    toast.error(message);
  };

  const setSubmitTrigger = useCallback((fn: (() => void) | null) => {
    setSubmitTriggerState(() => fn);
  }, []);

  return (
    <QuotationBuilderContext.Provider
      value={{
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
        saveQuotation,
        saveQuotationAndReturn,
        setSubmitTrigger,
      }}
    >
      {children}
    </QuotationBuilderContext.Provider>
  );
}
