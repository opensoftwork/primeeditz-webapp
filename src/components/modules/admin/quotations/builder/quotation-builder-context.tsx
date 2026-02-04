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

  // Query existing quotation if editing
  const existingQuotation = useQuery(
    api.functions.quotations.queries.getQuotation,
    initialQuotationId
      ? { quotationId: initialQuotationId as Id<"quotations"> }
      : "skip",
  );

  // Populate form data if editing
  useEffect(() => {
    if (existingQuotation && initialQuotationId) {
      setFormDataState({
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
    }
  }, [existingQuotation, initialQuotationId]);

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

  // Data loading state - ready when:
  // 1. Not editing (no initialQuotationId), OR
  // 2. Editing and existingQuotation has loaded
  const isDataReady = !initialQuotationId || existingQuotation !== undefined;

  // Navigation
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step as QuotationStepId);
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4) as QuotationStepId);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as QuotationStepId);
  }, []);

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

  // Save quotation
  const saveQuotation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { step1, step2, step3, step4, step5 } = formData;

      if (!step1.studioId) throw new Error("Please select a client");

      // Allow empty line items if we have packages selected (validation can be looser or handled by applyPackageItems)
      if (step4.lineItems.length === 0 && step2.packageIds.length === 0)
        throw new Error("Please add packages or line items");

      const lineItemsPayload = step4.lineItems.map((item) => ({
        id: item.id || crypto.randomUUID(),
        sectionId: (item.sectionId ||
          sections?.[0]?._id ||
          "") as Id<"quotationSections">,
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
      }));

      // Determine end client name (project name)
      // Prefer the name of the first associated project
      const firstProjectId = step3.projectIds[0];
      const associatedProject = (projects as Project[])?.find(
        (p) => p._id === firstProjectId,
      );
      const endClientName =
        associatedProject?.eventName ||
        selectedStudio?.name ||
        "Untitled Quotation";

      // 3. Project IDs list
      const projectIds =
        step3.projectIds.length > 0 ? step3.projectIds : undefined;

      // NOTE: We pass an empty array for selectedPackageIds because the lineItems
      // already contain items from packages (applied in applyPackageItems).
      // This prevents the backend from doubling items by re-aggregating package data.
      // The selectedPackageIds field is kept for record/reference purposes but not for item aggregation.
      const payload = {
        studioId: step1.studioId as Id<"profiles">,
        projectIds: projectIds as Id<"projects">[] | undefined,
        selectedPackageIds: step2.packageIds as Id<"servicePackages">[],
        lineItems: lineItemsPayload,
        terms: step4.terms,
        taxRate: step5.taxRate / 100, // API expects decimal
        discountAmount: step5.discountAmount,
        validUntil: step1.validUntil?.getTime(),
        endClientName,
        createdBy: "ADMIN",
      };

      if (quotationId) {
        await updateQuotation({
          quotationId: quotationId as Id<"quotations">,
          lineItems: lineItemsPayload,
          terms: step4.terms,
          taxRate: step5.taxRate / 100,
          discountAmount: step5.discountAmount,
          studioId: step1.studioId as Id<"profiles">,
          projectIds: projectIds as Id<"projects">[] | undefined,
          selectedPackageIds: step2.packageIds as Id<"servicePackages">[],
          endClientName,
          validUntil: step1.validUntil?.getTime(),
        });
        toast.success("Quotation updated successfully");
      } else {
        const res = await createQuotation(payload);
        setQuotationId(res);
        toast.success("Quotation created successfully");
        router.push(`/quotations/${res}`);
      }

      setIsDirty(false);
    } catch (err: unknown) {
      // Extract user-friendly error message from Convex errors
      let message = "Failed to save quotation";

      if (err instanceof Error) {
        // Check for Convex error patterns
        const errorMessage = err.message;

        // Handle specific business logic errors with friendly messages
        if (errorMessage.includes("Can only edit draft quotations")) {
          message =
            "This quotation can no longer be edited. Only draft quotations can be modified.";
          toast.error(message, {
            description: "Redirecting to quotation details...",
            duration: 3000,
          });
          // Redirect back to detail page after a short delay
          setTimeout(() => {
            router.push(`/quotations/${quotationId}`);
          }, 1500);
          setIsLoading(false);
          return;
        }

        // Handle other known error patterns
        if (errorMessage.includes("Quotation not found")) {
          message = "This quotation no longer exists.";
        } else if (errorMessage.includes("Server Error")) {
          // Generic Convex server error - extract the meaningful part
          const match = errorMessage.match(/Uncaught Error: (.+?)(?:\n|$)/);
          message =
            match?.[1] || "An unexpected error occurred. Please try again.";
        } else {
          // Use original message if it's already user-friendly
          message = errorMessage;
        }
      }

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    quotationId,
    sections,
    createQuotation,
    updateQuotation,
    router,
    projects,
    selectedStudio,
  ]);

  // Save quotation and return ID without navigating (for Send to Studio flow)
  const saveQuotationAndReturn = useCallback(async (): Promise<
    string | null
  > => {
    setIsLoading(true);
    setError(null);

    try {
      const { step1, step2, step3, step4, step5 } = formData;

      if (!step1.studioId) throw new Error("Please select a client");

      if (step4.lineItems.length === 0 && step2.packageIds.length === 0)
        throw new Error("Please add packages or line items");

      const lineItemsPayload = step4.lineItems.map((item) => ({
        id: item.id || crypto.randomUUID(),
        sectionId: (item.sectionId ||
          sections?.[0]?._id ||
          "") as Id<"quotationSections">,
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
      }));

      const firstProjectId = step3.projectIds[0];
      const associatedProject = (projects as Project[])?.find(
        (p) => p._id === firstProjectId,
      );
      const endClientName =
        associatedProject?.eventName ||
        selectedStudio?.name ||
        "Untitled Quotation";

      const projectIds =
        step3.projectIds.length > 0 ? step3.projectIds : undefined;

      // NOTE: We pass an empty array for selectedPackageIds because the lineItems
      // already contain items from packages (applied in applyPackageItems).
      // This prevents the backend from doubling items by re-aggregating package data.
      const payload = {
        studioId: step1.studioId as Id<"profiles">,
        projectIds: projectIds as Id<"projects">[] | undefined,
        selectedPackageIds: step2.packageIds as Id<"servicePackages">[],
        lineItems: lineItemsPayload as any,
        terms: step4.terms,
        taxRate: step5.taxRate / 100,
        discountAmount: step5.discountAmount,
        validUntil: step1.validUntil?.getTime(),
        endClientName,
        createdBy: "ADMIN",
      };

      let resultId: string;

      if (quotationId) {
        await updateQuotation({
          quotationId: quotationId as Id<"quotations">,
          lineItems: lineItemsPayload as any,
          terms: step4.terms,
          taxRate: step5.taxRate / 100,
          discountAmount: step5.discountAmount,
          studioId: step1.studioId as Id<"profiles">,
          projectIds: projectIds as Id<"projects">[] | undefined,
          selectedPackageIds: step2.packageIds as Id<"servicePackages">[],
          endClientName,
          validUntil: step1.validUntil?.getTime(),
        });
        resultId = quotationId;
        toast.success("Quotation saved successfully");
      } else {
        const res = await createQuotation(payload);
        setQuotationId(res);
        resultId = res;
        toast.success("Quotation created successfully");
      }

      setIsDirty(false);
      return resultId;
    } catch (err: unknown) {
      let message = "Failed to save quotation";

      if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    quotationId,
    sections,
    createQuotation,
    updateQuotation,
    projects,
    selectedStudio,
  ]);

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
