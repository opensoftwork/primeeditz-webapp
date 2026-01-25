"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@convex/_generated/dataModel";
import {
  RequestStepId,
  RequestFormData,
  INITIAL_REQUEST_FORM_DATA,
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
  const templates = useQuery(
    api.functions.quotations.templates.queries.getTemplates,
    { activeOnly: true },
  );

  const filteredTemplates = templates?.filter(
    (t) =>
      !selectedCategory ||
      t.projectTypeHint?.toLowerCase() === selectedCategory.toLowerCase(),
  );

  // Mutations
  const requestQuotation = useMutation(
    api.functions.quotations.mutations.requestQuotation,
  );

  // Handlers
  const handleNext = useCallback(() => {
    if (step < 3) setStep((prev) => (prev + 1) as RequestStepId);
  }, [step]);

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
        eventName: formData.eventName,
        eventDate: formData.eventDate
          ? new Date(formData.eventDate).getTime()
          : undefined,
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
