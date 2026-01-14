/**
 * Quotation Builder Form Context
 *
 * Provides form state management across quotation builder steps using React Context.
 * Follows the established TanStack Form pattern from the project wizard.
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";
import type {
  QuotationLineItem,
  QuotationSubItem,
  Client,
  Project,
  Template,
  TemplateLineItem,
  Section,
} from "./types";

// ============================================================================
// Types
// ============================================================================

export type QuotationStepId = 1 | 2 | 3 | 4;

export interface QuotationFormData {
  step1: {
    clientId: string;
    projectId: string;
    projectIds: string[];
    validUntil: Date | undefined;
  };
  step2: {
    templateId: string;
  };
  step3: {
    lineItems: QuotationLineItem[];
  };
  step4: {
    terms: string;
    taxRate: number;
    discountAmount: number;
  };
}

export const INITIAL_FORM_DATA: QuotationFormData = {
  step1: {
    clientId: "",
    projectId: "",
    projectIds: [],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  step2: {
    templateId: "",
  },
  step3: {
    lineItems: [],
  },
  step4: {
    terms: "",
    taxRate: 18,
    discountAmount: 0,
  },
};

export const QUOTATION_STEPS = [
  { id: 1 as const, label: "Client & Context" },
  { id: 2 as const, label: "Template Selection" },
  { id: 3 as const, label: "Calculate Worth" },
  { id: 4 as const, label: "Terms & Conditions" },
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
  clients: Client[] | undefined;
  projects: Project[] | undefined;
  templates: Template[] | undefined;
  sections: Section[] | undefined;
  selectedClient: Client | undefined;

  // Computed values
  subtotal: number;
  taxAmount: number;
  grandTotal: number;

  // Actions
  setFormData: <K extends keyof QuotationFormData>(
    step: K,
    data: Partial<QuotationFormData[K]>
  ) => void;
  goToStep: (step: QuotationStepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  applyTemplate: (templateId: string) => void;
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
      "useQuotationBuilder must be used within QuotationBuilderProvider"
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
    initialQuotationId ?? null
  );
  const [currentStep, setCurrentStep] = useState<QuotationStepId>(1);
  const [formData, setFormDataState] =
    useState<QuotationFormData>(INITIAL_FORM_DATA);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitTrigger, setSubmitTriggerState] = useState<(() => void) | null>(
    null
  );

  // Queries - cast to proper types
  const clientsQuery = useQuery(api.admin.getClients);
  const clients = clientsQuery as Client[] | undefined;

  const projectsQuery = useQuery(
    api.admin.getAdminProjectsSimple,
    formData.step1.clientId
      ? { clientId: formData.step1.clientId as Id<"profiles"> }
      : "skip"
  );

  const templatesQuery = useQuery(
    api.functions.quotations.templates.queries.getTemplates,
    {
      activeOnly: true,
    }
  );
  const templates = templatesQuery as Template[] | undefined;

  const sectionsQuery = useQuery(
    api.functions.quotations.sections.queries.getSections,
    {
      activeOnly: true,
    }
  );
  const sections = sectionsQuery as Section[] | undefined;

  // Mutations
  const createQuotation = useMutation(
    api.functions.quotations.mutations.createQuotation
  );
  const updateQuotation = useMutation(
    api.functions.quotations.mutations.updateQuotation
  );

  // Computed
  const selectedClient = useMemo(
    () => clients?.find((c) => c._id === formData.step1.clientId),
    [clients, formData.step1.clientId]
  );

  const projects = useMemo((): Project[] | undefined => {
    if (!projectsQuery || !Array.isArray(projectsQuery)) return undefined;
    return projectsQuery as Project[];
  }, [projectsQuery]);

  const subtotal = useMemo(() => {
    return formData.step3.lineItems.reduce((acc, item) => {
      const itemTotal = item.rate * item.quantity;
      const subItemsTotal =
        item.subItems?.reduce(
          (s: number, sub: QuotationSubItem) => s + sub.rate * sub.quantity,
          0
        ) ?? 0;
      return acc + itemTotal + subItemsTotal;
    }, 0);
  }, [formData.step3.lineItems]);

  const taxAmount =
    (subtotal - formData.step4.discountAmount) * (formData.step4.taxRate / 100);
  const grandTotal = subtotal - formData.step4.discountAmount + taxAmount;

  // Update form data for a specific step
  const setFormData = useCallback(
    <K extends keyof QuotationFormData>(
      step: K,
      data: Partial<QuotationFormData[K]>
    ) => {
      setFormDataState((prev) => ({
        ...prev,
        [step]: { ...prev[step], ...data },
      }));
      setIsDirty(true);
    },
    []
  );

  // Navigation
  const goToStep = useCallback((step: QuotationStepId) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    const nextStepId = Math.min(currentStep + 1, 4) as QuotationStepId;
    setCurrentStep(nextStepId);
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const prevStepId = Math.max(currentStep - 1, 1) as QuotationStepId;
    setCurrentStep(prevStepId);
  }, [currentStep]);

  // Template application
  const applyTemplate = useCallback(
    (templateId: string) => {
      const template = templates?.find((t) => t._id === templateId);
      if (!template) return;

      setFormData("step2", { templateId });
      setFormData("step4", { terms: template.terms || "" });

      const mappedItems: QuotationLineItem[] = template.lineItems.map(
        (li: TemplateLineItem) => ({
          id: crypto.randomUUID(),
          sectionId: li.sectionId,
          description: li.description,
          unit: li.unit,
          rate: li.unitPrice,
          quantity: li.defaultQuantity,
          subItems: li.subItems?.map((si) => ({
            id: crypto.randomUUID(),
            description: si.description,
            unit: si.unit,
            rate: si.unitPrice,
            quantity: si.defaultQuantity,
          })),
        })
      );

      setFormData("step3", { lineItems: mappedItems });
      setCurrentStep(3);
    },
    [templates, setFormData]
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
      setFormData("step3", {
        lineItems: [...formData.step3.lineItems, newItem],
      });
    },
    [sections, formData.step3.lineItems, setFormData]
  );

  const updateLineItem = useCallback(
    (idx: number, updates: Partial<QuotationLineItem>) => {
      const newItems = [...formData.step3.lineItems];
      newItems[idx] = { ...newItems[idx], ...updates };
      setFormData("step3", { lineItems: newItems });
    },
    [formData.step3.lineItems, setFormData]
  );

  const removeLineItem = useCallback(
    (idx: number) => {
      const newItems = formData.step3.lineItems.filter((_, i) => i !== idx);
      setFormData("step3", { lineItems: newItems });
    },
    [formData.step3.lineItems, setFormData]
  );

  // Save quotation
  const saveQuotation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { step1, step3, step4 } = formData;

      if (!step1.clientId) throw new Error("Please select a client");
      if (step3.lineItems.length === 0)
        throw new Error("Please add at least one line item");

      const lineItemsPayload = step3.lineItems.map((item) => ({
        id: item.id || crypto.randomUUID(),
        sectionId: (item.sectionId ||
          sections?.[0]?._id ||
          "") as Id<"quotationSections">,
        projectId: item.projectId,
        description: item.description,
        unit: item.unit,
        rate: item.rate,
        quantity: item.quantity,
        subItems: item.subItems?.map((s) => ({
          id: s.id || crypto.randomUUID(),
          description: s.description,
          unit: s.unit,
          rate: s.rate,
          quantity: s.quantity,
        })),
      }));

      const payload = {
        clientId: step1.clientId,
        projectId:
          step1.projectId && step1.projectId !== "none"
            ? step1.projectId
            : undefined,
        projectIds: step1.projectIds.length > 0 ? step1.projectIds : undefined,
        templateId: formData.step2.templateId
          ? (formData.step2.templateId as Id<"quotationTemplates">)
          : undefined,
        lineItems: lineItemsPayload,
        terms: step4.terms,
        taxRate: step4.taxRate / 100, // API expects decimal
        discountAmount: step4.discountAmount,
        validUntil: step1.validUntil?.getTime(),
        createdBy: "ADMIN",
      };

      if (quotationId) {
        await updateQuotation({
          quotationId: quotationId as Id<"quotations">,
          lineItems: lineItemsPayload,
          terms: step4.terms,
          taxRate: step4.taxRate / 100,
          discountAmount: step4.discountAmount,
          clientId: step1.clientId,
          projectId:
            step1.projectId && step1.projectId !== "none"
              ? step1.projectId
              : undefined,
          validUntil: step1.validUntil?.getTime(),
        });
        toast.success("Quotation updated successfully");
      } else {
        const res = await createQuotation(payload);
        setQuotationId(res);
        toast.success("Quotation created successfully");
        router.push(`/admin/quotations/${res}`);
      }

      setIsDirty(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save quotation";
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
        clients,
        projects,
        templates,
        sections,
        selectedClient,
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
