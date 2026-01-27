"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import {
  INITIAL_REQUEST_FORM_DATA,
  type RequestFormData,
  type RequestStepId,
} from "./types";

interface RequestWizardContextType {
  // Navigation
  step: RequestStepId;
  setStep: (step: RequestStepId) => void;
  handleNext: () => void;
  handleBack: () => void;

  // Data
  formData: RequestFormData;
  setFormData: React.Dispatch<React.SetStateAction<RequestFormData>>;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedPackage: Id<"quotationTemplates"> | null;
  setSelectedPackage: (id: Id<"quotationTemplates"> | null) => void;

  // Queries
  categories: any[] | undefined;
  projectTypes: any[] | undefined;
  templates: any[] | undefined;
  filteredTemplates: any[] | undefined;

  // Actions
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
}

const RequestWizardContext = createContext<
  RequestWizardContextType | undefined
>(undefined);

export function RequestWizardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // State
  const [step, setStep] = useState<RequestStepId>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] =
    useState<Id<"quotationTemplates"> | null>(null);
  const [formData, setFormData] = useState<RequestFormData>(
    INITIAL_REQUEST_FORM_DATA,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const categories = useQuery(
    api.functions.projectCategories.queries.getActiveCategories,
  );
  const projectTypes = useQuery(
    api.functions.projectTypes.queries.getActiveProjectTypes,
  );
  const templates = useQuery(
    api.functions.quotations.templates.queries.getTemplates,
    { activeOnly: true },
  );

  const filteredTemplates = React.useMemo(() => {
    if (!templates) return undefined;
    if (!selectedCategory) return templates;
    if (!projectTypes) return [];

    return templates.filter((t) => {
      // Find the project type for this template
      const pt = projectTypes.find((p: any) => p._id === t.projectTypeHint);
      if (!pt) return false;

      return pt.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [templates, projectTypes, selectedCategory]);

  // Mutations
  const requestQuotation = useMutation(
    api.functions.quotations.mutations.requestQuotation,
  );

  // Handlers
  const handleNext = useCallback(() => {
    if (step === 2 && !formData.endClientName.trim()) {
      toast.error("Missing Identity", {
        description: "End Client Identity is required to proceed.",
      });
      return;
    }
    if (step < 3) setStep((prev) => (prev + 1) as RequestStepId);
  }, [step, formData.endClientName]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((prev) => (prev - 1) as RequestStepId);
    else router.push("/dashboard");
  }, [step, router]);

  const handleSubmit = async () => {
    if (!selectedPackage) return;

    setIsSubmitting(true);
    try {
      await requestQuotation({
        templateId: selectedPackage,
        endClientName: formData.endClientName,
        notes: formData.notes,
      });

      toast.success("Quote request submitted!", {
        description: "Our team will review it and get back to you shortly.",
      });
      router.push("/dashboard");
    } catch (err) {
      toast.error("Failed to submit request", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const value: RequestWizardContextType = {
    step,
    setStep,
    handleNext,
    handleBack,
    formData,
    setFormData,
    selectedCategory,
    setSelectedCategory,
    selectedPackage,
    setSelectedPackage,
    categories,
    projectTypes,
    templates,
    filteredTemplates,
    isSubmitting,
    handleSubmit,
  };

  return (
    <RequestWizardContext.Provider value={value}>
      {children}
    </RequestWizardContext.Provider>
  );
}

export function useRequestWizard() {
  const context = useContext(RequestWizardContext);
  if (context === undefined) {
    throw new Error(
      "useRequestWizard must be used within a RequestWizardProvider",
    );
  }
  return context;
}
