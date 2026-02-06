"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
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

  // Queries
  const categories = useQuery(
    api.functions.projectCategories.queries.getActiveCategories,
  );
  const projectTypes = useQuery(
    api.functions.projectTypes.queries.getActiveProjectTypes,
  );
  const packages = useQuery(api.functions.servicePackages.queries.listActive);
  const draft = useQuery(api.functions.quotations.queries.getMyDraft);

  // Mutations
  const getOrCreateDraft = useMutation(
    api.functions.quotations.mutations.getOrCreateDraft,
  );
  const updateDraft = useMutation(
    api.functions.quotations.mutations.updateDraft,
  );
  const deleteDraftMutation = useMutation(
    api.functions.quotations.mutations.deleteDraft,
  );
  const requestQuotation = useMutation(
    api.functions.quotations.mutations.requestQuotation,
  );

  // State
  const [step, setStepState] = useState<RequestStepId>(1);
  const [selectedCategory, setSelectedCategoryState] = useState<string | null>(
    null,
  );
  const [selectedPackageIds, setSelectedPackageIdsState] = useState<
    Id<"servicePackages">[]
  >([]);
  const [formData, setFormDataState] = useState<RequestFormData>(
    INITIAL_REQUEST_FORM_DATA,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from draft on load
  React.useEffect(() => {
    const init = async () => {
      if (isInitialized) return;

      // Ensure a draft exists
      const { draft: currentDraft } = await getOrCreateDraft();

      if (currentDraft) {
        setStepState((currentDraft.lastStep as RequestStepId) || 1);
        setSelectedCategoryState(currentDraft.selectedCategory || null);
        setSelectedPackageIdsState(currentDraft.selectedPackageIds || []);
        setFormDataState({
          endClientName: currentDraft.endClientName || "",
          eventName: currentDraft.eventName || "",
          eventDate: currentDraft.eventDate || "",
          venue: currentDraft.venue || "",
          notes: currentDraft.notes || "",
        });
      }
      setIsInitialized(true);
    };

    init();
  }, [getOrCreateDraft, isInitialized]);

  // Sync draft from other devices (real-time reflect)
  React.useEffect(() => {
    if (draft && isInitialized) {
      setStepState((draft.lastStep as RequestStepId) || 1);
      setSelectedCategoryState(draft.selectedCategory || null);
      setSelectedPackageIdsState(draft.selectedPackageIds || []);
      setFormDataState({
        endClientName: draft.endClientName || "",
        eventName: draft.eventName || "",
        eventDate: draft.eventDate || "",
        venue: draft.venue || "",
        notes: draft.notes || "",
      });
    }
  }, [draft, isInitialized]);

  // Reactive monitor for draft existence (e.g. if submitted on another device)
  React.useEffect(() => {
    if (isInitialized && !isSubmitting && draft === null) {
      toast.error("Draft session ended", {
        description: "This request has already been submitted or removed in another session.",
      });
      router.replace("/dashboard");
    }
  }, [draft, isInitialized, isSubmitting, router]);

  // Wrappers to update Convex
  const setStep = useCallback(
    (newStep: RequestStepId) => {
      setStepState(newStep);
      if (draft?._id) {
        updateDraft({ draftId: draft._id, lastStep: newStep });
      }
    },
    [draft?._id, updateDraft],
  );

  const setSelectedCategory = useCallback(
    (category: string | null) => {
      setSelectedCategoryState(category);
      if (draft?._id) {
        updateDraft({ draftId: draft._id, selectedCategory: category || undefined });
      }
    },
    [draft?._id, updateDraft],
  );

  const setSelectedPackageIds = useCallback(
    (ids: Id<"servicePackages">[]) => {
      setSelectedPackageIdsState(ids);
      if (draft?._id) {
        updateDraft({ draftId: draft._id, selectedPackageIds: ids });
      }
    },
    [draft?._id, updateDraft],
  );

  // Debounced update for form data
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setFormData: React.Dispatch<React.SetStateAction<RequestFormData>> =
    useCallback(
      (value) => {
        setFormDataState((prev) => {
          const next = typeof value === "function" ? value(prev) : value;

          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (draft?._id) {
              updateDraft({ draftId: draft._id, ...next });
            }
          }, 500);

          return next;
        });
      },
      [draft?._id, updateDraft],
    );

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
    if (step < 3) setStep((step + 1) as RequestStepId);
  }, [step, selectedPackageIds, formData.endClientName, setStep]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((step - 1) as RequestStepId);
    else router.push("/dashboard");
  }, [step, router, setStep]);

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

      // Clear the draft on success
      if (draft?._id) {
        await deleteDraftMutation({ draftId: draft._id });
      }

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
