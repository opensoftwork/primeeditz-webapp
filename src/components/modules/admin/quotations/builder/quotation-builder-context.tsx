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

export type QuotationStepId = 1 | 2 | 3 | 4 | 5;

export interface QuotationFormData {
  step1: {
    studioId: string;
    projectId: string; // Left for compatibility
    projectIds: string[]; // Master list, but we sync with step2
    validUntil: Date | undefined;
  };
  step2: {
    // Project Selection
    projectIds: string[];
  };
  step3: {
    // Template Selection (Per Project)
    projectTemplates: Record<string, string>; // projectId -> templateId
  };
  step4: {
    // Calculate Worth
    lineItems: QuotationLineItem[];
  };
  step5: {
    // Terms
    terms: string;
    taxRate: number;
    discountAmount: number;
  };
}

export const INITIAL_FORM_DATA: QuotationFormData = {
  step1: {
    studioId: "",
    projectId: "",
    projectIds: [],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  step2: {
    projectIds: [],
  },
  step3: {
    projectTemplates: {},
  },
  step4: {
    lineItems: [],
  },
  step5: {
    terms: "",
    taxRate: 18,
    discountAmount: 0,
  },
};

export const QUOTATION_STEPS = [
  { id: 1 as const, label: "Studio & Context" },
  { id: 2 as const, label: "Projects" },
  { id: 3 as const, label: "Template Selection" },
  { id: 4 as const, label: "Calculate Worth" },
  { id: 5 as const, label: "Terms & Conditions" },
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
  applyTemplate: (templateId: string, projectId: string) => void;
  addLineItem: (initialData?: Partial<QuotationLineItem>) => void;
  updateLineItem: (idx: number, updates: Partial<QuotationLineItem>) => void;
  removeLineItem: (idx: number) => void;
  saveQuotation: () => Promise<void>;
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
}

export function QuotationBuilderProvider({
  children,
  initialQuotationId,
}: QuotationBuilderProviderProps) {
  const router = useRouter();

  // State
  const [quotationId, setQuotationId] = useState<string | null>(
    initialQuotationId ?? null,
  );
  const [currentStep, setCurrentStep] = useState<QuotationStepId>(1);
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
          projectId: existingQuotation.projectId || "",
          projectIds: existingQuotation.projectIds || [],
          validUntil: existingQuotation.validUntil
            ? new Date(existingQuotation.validUntil)
            : undefined,
        },
        step2: {
          projectIds: existingQuotation.projectIds || [],
        },
        step3: {
          projectTemplates: {}, // TODO: Can we infer this from existing items? For now start empty or rely on stored separate field if we add one
        },
        step4: {
          lineItems: existingQuotation.lineItems.map((item: any) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          })),
        },
        step5: {
          terms: existingQuotation.terms || "",
          taxRate: (existingQuotation.taxRate || 0.18) * 100, // API stores as decimal
          discountAmount: existingQuotation.discountAmount || 0,
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

  // Navigation
  // Update step1.projectIds whenever step2 changes for syncing
  useEffect(() => {
    if (
      JSON.stringify(formData.step2.projectIds) !==
      JSON.stringify(formData.step1.projectIds)
    ) {
      setFormData("step1", { projectIds: formData.step2.projectIds });
    }
  }, [formData.step2.projectIds, formData.step1.projectIds, setFormData]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step as QuotationStepId);
    }
  }, []);

  const nextStep = useCallback(() => {
    const nextStepId = Math.min(currentStep + 1, 5) as QuotationStepId;
    setCurrentStep(nextStepId);
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const prevStepId = Math.max(currentStep - 1, 1) as QuotationStepId;
    setCurrentStep(prevStepId);
  }, [currentStep]);

  // Template application
  const applyTemplate = useCallback(
    (templateId: string, projectId: string) => {
      // Logic for "Start from Scratch" (empty templateId)
      if (!templateId) {
        setFormDataState((prev) => {
          const currentItems = prev.step4.lineItems;
          // Remove items for this project
          const filteredItems = currentItems.filter(
            (item) => item.projectId !== projectId,
          );
          return {
            ...prev,
            step3: {
              ...prev.step3,
              projectTemplates: {
                ...prev.step3.projectTemplates,
                [projectId]: "",
              },
            },
            step4: {
              ...prev.step4,
              lineItems: filteredItems,
            },
          };
        });
        return;
      }

      const template = templates?.find((t) => t._id === templateId);
      if (!template) return;

      // Update project template mapping
      setFormDataState((prev) => ({
        ...prev,
        step3: {
          ...prev.step3,
          projectTemplates: {
            ...prev.step3.projectTemplates,
            [projectId]: templateId,
          },
        },
      }));

      // Append terms if they are not already there (simple logic for now)
      setFormDataState((prev) => {
        const currentTerms = prev.step5.terms;
        const newTerms = template.terms || "";
        // Only add if not present to avoid duplication on re-select
        const combinedTerms = currentTerms.includes(newTerms.substring(0, 20))
          ? currentTerms
          : currentTerms
            ? `${currentTerms}\n\n${newTerms}`
            : newTerms;
        return {
          ...prev,
          step5: { ...prev.step5, terms: combinedTerms },
        };
      });

      const mappedItems: QuotationLineItem[] = template.lineItems.map(
        (li: TemplateLineItem) => ({
          id: crypto.randomUUID(),
          sectionId: li.sectionId,
          description: li.description,
          unit: li.unit,
          rate: li.unitPrice,
          quantity: li.defaultQuantity,
          projectId: projectId, // Assign to specific project
          spawnsProject: li.spawnsProject,
          projectTypeId: li.projectTypeId,
          selectedFolderTemplateId: li.selectedFolderTemplateId,
          subItems: li.subItems?.map((si) => ({
            id: crypto.randomUUID(),
            description: si.description,
            unit: si.unit,
            rate: si.unitPrice,
            quantity: si.defaultQuantity,
          })),
        }),
      );

      // Merge items: Remove old items for this project, add new ones
      setFormDataState((prev) => {
        const otherItems = prev.step4.lineItems.filter(
          (item) => item.projectId !== projectId,
        );
        return {
          ...prev,
          step4: {
            ...prev.step4,
            lineItems: [...otherItems, ...mappedItems],
          },
        };
      });
    },
    [templates],
  );

  // Line Item management
  const addLineItem = useCallback(
    (initialData?: Partial<QuotationLineItem>) => {
      const newItem: QuotationLineItem = {
        id: crypto.randomUUID(),
        sectionId: (initialData?.sectionId ||
          sections?.[0]?._id) as Id<"quotationSections">,
        description: initialData?.description || "",
        unit: initialData?.unit || "ls",
        rate: initialData?.rate || 0,
        quantity: initialData?.quantity || 1,
        projectId: initialData?.projectId,
      };
      setFormData("step4", {
        lineItems: [...formData.step4.lineItems, newItem],
      });
    },
    [sections, formData.step4.lineItems, setFormData],
  );

  const updateLineItem = useCallback(
    (idx: number, updates: Partial<QuotationLineItem>) => {
      const newItems = [...formData.step4.lineItems];
      newItems[idx] = { ...newItems[idx], ...updates };
      setFormData("step4", { lineItems: newItems });
    },
    [formData.step4.lineItems, setFormData],
  );

  const removeLineItem = useCallback(
    (idx: number) => {
      const newItems = formData.step4.lineItems.filter((_, i) => i !== idx);
      setFormData("step4", { lineItems: newItems });
    },
    [formData.step4.lineItems, setFormData],
  );

  // Save quotation
  const saveQuotation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { step1, step2, step3, step4, step5 } = formData;

      if (!step1.studioId) throw new Error("Please select a client");
      if (step4.lineItems.length === 0)
        throw new Error("Please add at least one line item");

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

      // Prefer step2 projectIds, fallback to step1 if sync failed
      const projectIds =
        step2.projectIds.length > 0
          ? step2.projectIds
          : step1.projectIds.length > 0
            ? step1.projectIds
            : undefined;

      const payload = {
        studioId: step1.studioId as Id<"profiles">,
        projectId:
          step1.projectId && step1.projectId !== "none"
            ? (step1.projectId as Id<"projects">)
            : undefined,
        projectIds: projectIds as Id<"projects">[] | undefined,

        // Template ID is ambiguous with multiple projects, passing undefined or we could pass a primary one.
        // For now, let's omit it as the source of truth is the line items.
        templateId: undefined as Id<"quotationTemplates"> | undefined,
        lineItems: lineItemsPayload as any,
        terms: step5.terms,
        taxRate: step5.taxRate / 100, // API expects decimal
        discountAmount: step5.discountAmount,
        validUntil: step1.validUntil?.getTime(),
        createdBy: "ADMIN",
      };

      if (quotationId) {
        await updateQuotation({
          quotationId: quotationId as Id<"quotations">,
          lineItems: lineItemsPayload as any,
          terms: step5.terms,
          taxRate: step5.taxRate / 100,
          discountAmount: step5.discountAmount,
          studioId: step1.studioId as Id<"profiles">,
          projectId:
            step1.projectId && step1.projectId !== "none"
              ? (step1.projectId as Id<"projects">)
              : undefined,
          projectIds: projectIds as Id<"projects">[] | undefined,
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
        applyTemplate,
        addLineItem,
        updateLineItem,
        removeLineItem,
        saveQuotation,
        setSubmitTrigger,
      }}
    >
      {children}
    </QuotationBuilderContext.Provider>
  );
}
