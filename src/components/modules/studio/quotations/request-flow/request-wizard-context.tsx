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
  selectedPackageIds: Id<"servicePackages">[];
  setSelectedPackageIds: (ids: Id<"servicePackages">[]) => void;

  // Queries
  categories: any[] | undefined;
  projectTypes: any[] | undefined;
  packages: any[] | undefined;
  filteredPackages: any[] | undefined;

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
  const [selectedPackageIds, setSelectedPackageIds] = useState<
    Id<"servicePackages">[]
  >([]);
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
  const packages = useQuery(api.functions.servicePackages.queries.listActive);

  const filteredPackages = React.useMemo(() => {
    if (!packages) return undefined;
    if (!selectedCategory) return packages;
    if (!projectTypes) return [];

    return packages.filter((p) => {
      if (!p.categoryId) return false;
      const cat = categories?.find((c) => c._id === p.categoryId);
      return cat?.name.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [packages, categories, selectedCategory]);

  // Mutations
  const requestQuotation = useMutation(
    api.functions.quotations.mutations.requestQuotation,
  );

  // Handlers
  const handleNext = useCallback(() => {
    if (step === 1 && selectedPackageIds.length === 0) {
      toast.error("No Services Selected", {
        description: "Please select at least one package to proceed.",
      });
      return;
    }
    if (step === 2 && !formData.endClientName.trim()) {
      toast.error("Missing Identity", {
        description: "End Client Identity is required to proceed.",
      });
      return;
    }
    if (step < 3) setStep((prev) => (prev + 1) as RequestStepId);
  }, [step, selectedPackageIds, formData.endClientName]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((prev) => (prev - 1) as RequestStepId);
    else router.push("/dashboard");
  }, [step, router]);

  const handleSubmit = async () => {
    if (selectedPackageIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const quotationId = await requestQuotation({
        selectedPackageIds,
        endClientName: formData.endClientName,
        eventName: formData.eventName || undefined,
        eventDate: formData.eventDate
          ? new Date(formData.eventDate).getTime()
          : undefined,
        notes: formData.notes || undefined,
      });

      toast.success("Quote request submitted!", {
        description: "Our team will review it and get back to you shortly.",
      });
      router.push(`/quotations/${quotationId}`);
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
    selectedPackageIds,
    setSelectedPackageIds,
    categories,
    projectTypes,
    packages,
    filteredPackages,
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
