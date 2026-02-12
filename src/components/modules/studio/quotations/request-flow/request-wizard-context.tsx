"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { toast } from "sonner";
import {
  INITIAL_REQUEST_FORM_DATA,
  type RequestFormData,
  type RequestStepId,
} from "./types";

interface RequestWizardContextType {
  // Navigation
  step: RequestStepId;
  setStep: (step: RequestStepId) => Promise<void>;
  handleNext: () => Promise<void>;
  handleBack: () => Promise<void>;

  // Data
  formData: RequestFormData;
  setFormData: React.Dispatch<React.SetStateAction<RequestFormData>>;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedPackageIds: Id<"servicePackages">[];
  setSelectedPackageIds: (ids: Id<"servicePackages">[]) => void;

  // Draft info
  draftId: Id<"quotationRequestDrafts"> | null;

  // Queries
  categories: any[] | undefined;
  projectTypes: any[] | undefined;
  packages: any[] | undefined;
  filteredPackages: any[] | undefined;

  // Actions
  isSubmitting: boolean;
  isInitialized: boolean;
  handleSubmit: () => Promise<void>;
  cancelWizard: () => Promise<void>;
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
  const [draftId, setDraftId] = useState<Id<"quotationRequestDrafts"> | null>(
    null,
  );

  // Refs for tracking latest state to avoid stale closures in mutations/timeouts
  const stepRef = useRef<RequestStepId>(1);
  const selectedCategoryRef = useRef<string | null>(null);
  const selectedPackageIdsRef = useRef<Id<"servicePackages">[]>([]);
  const formDataRef = useRef<RequestFormData>(INITIAL_REQUEST_FORM_DATA);
  const draftWasSeen = useRef(false);
  const lastUpdateTimestamp = useRef<number>(0);
  const isLocalUpdate = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    selectedCategoryRef.current = selectedCategory;
  }, [selectedCategory]);
  useEffect(() => {
    selectedPackageIdsRef.current = selectedPackageIds;
  }, [selectedPackageIds]);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Unified save function that persists everything
  const saveProgress = useCallback(
    async (overrides?: Partial<Parameters<typeof updateDraft>[0]>) => {
      // Don't save if not initialized or no draft ID
      const currentDraftId = draftId;
      if (!isInitialized || !currentDraftId) return;

      // Clear any pending debounced updates
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Mark as local update to prevent sync effect from overwriting
      isLocalUpdate.current = true;
      lastUpdateTimestamp.current = Date.now();

      try {
        await updateDraft({
          draftId: currentDraftId,
          lastStep: stepRef.current,
          selectedPackageIds: selectedPackageIdsRef.current,
          selectedCategory: selectedCategoryRef.current || undefined,
          ...formDataRef.current,
          ...overrides,
        });
      } catch (err) {
        console.error("Failed to save draft progress:", err);
      }
    },
    [draftId, isInitialized, updateDraft],
  );

  // Initialize from draft on load
  useEffect(() => {
    const init = async () => {
      if (isInitialized) return;

      try {
        const { draft: currentDraft, isNew } = await getOrCreateDraft();

        if (currentDraft) {
          setDraftId(currentDraft._id);

          const initialStep = (currentDraft.lastStep as RequestStepId) || 1;
          const initialCategory = currentDraft.selectedCategory || null;
          const initialPackageIds = currentDraft.selectedPackageIds || [];
          const initialFormData = {
            endClientName: currentDraft.endClientName || "",
            eventName: currentDraft.eventName || "",
            eventDate: currentDraft.eventDate || "",
            venue: currentDraft.venue || "",
            notes: currentDraft.notes || "",
          };

          // Update state
          setStepState(initialStep);
          setSelectedCategoryState(initialCategory);
          setSelectedPackageIdsState(initialPackageIds);
          setFormDataState(initialFormData);

          // Update refs immediately
          stepRef.current = initialStep;
          selectedCategoryRef.current = initialCategory;
          selectedPackageIdsRef.current = initialPackageIds;
          formDataRef.current = initialFormData;

          lastUpdateTimestamp.current = currentDraft.updatedAt || Date.now();

          // Show toast only if resuming an existing draft with some progress
          if (!isNew && (initialStep > 1 || initialPackageIds.length > 0)) {
            toast.success("Resumed your previous draft", {
              description:
                "We've loaded your progress from where you left off.",
            });
          }
        }
      } catch (err) {
        console.error("Failed to initialize draft:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, [getOrCreateDraft, isInitialized]);

  // Update draftWasSeen when draft is available from query
  useEffect(() => {
    if (draft) {
      draftWasSeen.current = true;
    }
  }, [draft]);

  // Sync draft from other devices (real-time reflect) - ONLY for external changes
  useEffect(() => {
    if (draft && isInitialized) {
      if (isLocalUpdate.current) {
        // Reset local update flag after processing one query update
        isLocalUpdate.current = false;
        return;
      }

      // Only sync if the draft was updated externally (different timestamp)
      const draftTimestamp = draft.updatedAt || 0;
      if (draftTimestamp > lastUpdateTimestamp.current) {
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
        lastUpdateTimestamp.current = draftTimestamp;
      }
    }
  }, [draft, isInitialized]);

  // Reactive monitor for draft existence (e.g. if submitted on another device)
  useEffect(() => {
    if (isInitialized && draftId && !isSubmitting) {
      // If draft was seen before and is now null, it was submitted/deleted elsewhere
      if (draft === null && draftWasSeen.current) {
        toast.error("Draft session ended", {
          description:
            "This request has already been submitted or removed in another session.",
        });
        router.replace("/dashboard");
      }
    }
  }, [draft, isInitialized, draftId, isSubmitting, router]);

  // Setters with persistence
  const setStep = useCallback(
    async (newStep: RequestStepId) => {
      setStepState(newStep);
      stepRef.current = newStep; // Update ref immediately for the save call
      toast.promise(saveProgress({ lastStep: newStep }), {
        loading: "Saving progress...",
        success: "Progress saved",
        error: "Failed to save progress",
      });
    },
    [saveProgress],
  );

  const setSelectedCategory = useCallback(
    (category: string | null) => {
      setSelectedCategoryState(category);
      selectedCategoryRef.current = category;
      saveProgress({ selectedCategory: category || undefined });
    },
    [saveProgress],
  );

  const setSelectedPackageIds = useCallback(
    (ids: Id<"servicePackages">[]) => {
      setSelectedPackageIdsState(ids);
      selectedPackageIdsRef.current = ids;
      saveProgress({ selectedPackageIds: ids });
    },
    [saveProgress],
  );

  const setFormData: React.Dispatch<React.SetStateAction<RequestFormData>> =
    useCallback(
      (value) => {
        setFormDataState((prev) => {
          const next = typeof value === "function" ? value(prev) : value;
          formDataRef.current = next;

          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            saveProgress();
          }, 500);

          return next;
        });
      },
      [saveProgress],
    );

  const filteredPackages = React.useMemo(() => {
    if (!packages) return undefined;
    if (!selectedCategory) return packages;

    return packages.filter((p) => {
      if (!p.categoryId) return false;
      const cat = categories?.find((c) => c._id === p.categoryId);
      return cat?.name.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [packages, categories, selectedCategory]);

  // Handlers
  const handleNext = useCallback(async () => {
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

    if (step < 3) {
      await setStep((step + 1) as RequestStepId);
    }
  }, [step, selectedPackageIds.length, formData.endClientName, setStep]);

  const handleBack = useCallback(async () => {
    if (step > 1) {
      await setStep((step - 1) as RequestStepId);
    } else {
      router.push("/dashboard");
    }
  }, [step, setStep, router]);

  const handleSubmit = async () => {
    if (selectedPackageIds.length === 0) return;

    setIsSubmitting(true);
    try {
      // Final flush of any pending data
      await saveProgress();

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
      if (draftId) {
        await deleteDraftMutation({ draftId });
      }

      toast.success("Quote request submitted!", {
        description: "Our team will review it and get back to you shortly.",
      });
      router.push(`/quotations/${quotationId}`);
    } catch (err) {
      const isNotFound =
        err instanceof Error && err.message?.includes("not found");
      toast.error(
        isNotFound
          ? "This draft has already been submitted or removed."
          : "Failed to submit request",
        {
          description: isNotFound
            ? "Redirecting to dashboard..."
            : err instanceof Error
              ? err.message
              : "Something went wrong",
        },
      );
      if (isNotFound) {
        router.replace("/dashboard");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelWizard = useCallback(async () => {
    if (draftId) {
      await deleteDraftMutation({ draftId });
    }
    router.push("/dashboard");
  }, [draftId, deleteDraftMutation, router]);

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
    draftId,
    categories,
    projectTypes,
    packages,
    filteredPackages,
    isSubmitting,
    isInitialized,
    handleSubmit,
    cancelWizard,
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse bg-zinc-950 h-screen w-full">
        <div className="w-12 h-12 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
          Loading Your Draft...
        </p>
      </div>
    );
  }

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
