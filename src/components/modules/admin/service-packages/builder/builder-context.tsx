"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { QuotationSubItem } from "../../quotations/types";

export interface Step1Data {
  name: string;
  description?: string;
}

export interface ProjectConfig {
  id: string;
  label: string;
  categoryId?: Id<"projectCategories">;
  projectTypeId: Id<"projectTypes">;
  folderTemplateId: Id<"folderTemplates">;
  defaultStorageTierId?: Id<"storageTiers">;
}

export interface Step2Data {
  projectConfigs: ProjectConfig[];
}

export interface LineItem {
  id: string;
  description: string;
  sectionId?: string;
  projectConfigId?: string;
  rate: number;
  quantity: number;
  unit: string;
  subItems?: QuotationSubItem[];
}

export interface Step3Data {
  lineItems: LineItem[];
  terms?: string;
  applyGST: boolean;
  gstPercentage: number;
}

interface BuilderContextValue {
  currentStep: number;
  setCurrentStep: (step: number) => void;

  step1Data: Step1Data | null;
  setStep1Data: (data: Step1Data) => void;

  step2Data: Step2Data | null;
  setStep2Data: (data: Step2Data) => void;

  step3Data: Step3Data | null;
  setStep3Data: (data: Step3Data) => void;

  isEditing: boolean;
  isEditor: boolean;
  packageId: Id<"servicePackages"> | null;
  draftId: Id<"servicePackageDrafts"> | null;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  submitTrigger: (() => void) | null;
  setSubmitTrigger: (fn: any) => void;

  // Step data sync - called before navigation to save current form data to context
  syncCurrentStep: (() => boolean | void) | null;
  setSyncCurrentStep: (fn: any) => void;

  // Lifecycle
  isSubmitting: boolean;
  publishPackage: () => Promise<Id<"servicePackages"> | undefined>;
  savePackageUpdate: () => Promise<void>;
  cancelWizard: () => Promise<void>;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({
  children,
  packageId,
}: {
  children: ReactNode;
  packageId?: Id<"servicePackages">;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [draftId, setDraftId] = useState<Id<"servicePackageDrafts"> | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for immediate access to data during async saves
  const step1DataRef = useRef<Step1Data | null>(null);
  const step2DataRef = useRef<Step2Data | null>(null);
  const step3DataRef = useRef<Step3Data | null>(null);
  const draftWasSeen = useRef(false);

  const setStep1DataWithRef = useCallback((data: Step1Data) => {
    step1DataRef.current = data;
    setStep1Data(data);
  }, []);

  const setStep2DataWithRef = useCallback((data: Step2Data) => {
    step2DataRef.current = data;
    setStep2Data(data);
  }, []);

  const setStep3DataWithRef = useCallback((data: Step3Data) => {
    step3DataRef.current = data;
    setStep3Data(data);
  }, []);

  // Mutations
  const createDraft = useMutation(
    //@ts-ignore
    api.functions.servicePackages.drafts.mutations.createDraft,
  );
  const updateDraft = useMutation(
    api.functions.servicePackages.drafts.mutations.updateDraft,
  );
  const deleteDraftMutation = useMutation(
    api.functions.servicePackages.drafts.mutations.deleteDraft,
  );
  const publishDraft = useMutation(
    api.functions.servicePackages.drafts.mutations.publishDraft,
  );

  // Query for existing draft (if not editing live package)
  const activeDraft = useQuery(
    api.functions.servicePackages.drafts.queries.getActiveDraft,
    packageId ? "skip" : {},
  );

  // Fetch package data if editing
  const pkg = useQuery(
    api.functions.servicePackages.queries.get,
    packageId ? { id: packageId } : "skip",
  );

  // Persistence Helper
  const saveDraft = useCallback(
    async (stepOverride?: number) => {
      // Only persist drafts during creation flow, not editing
      if (packageId || !draftId) return;

      try {
        await updateDraft({
          draftId,
          lastStep: stepOverride ?? currentStep,
          name: step1DataRef.current?.name,
          description: step1DataRef.current?.description,
          projectConfigs: step2DataRef.current?.projectConfigs?.map(
            (config) => ({
              ...config,
              categoryId: (config.categoryId &&
              (config.categoryId as string) !== ""
                ? config.categoryId
                : undefined) as Id<"projectCategories">,
              projectTypeId: (config.projectTypeId &&
              (config.projectTypeId as string) !== ""
                ? config.projectTypeId
                : undefined) as Id<"projectTypes">,
              folderTemplateId: (config.folderTemplateId &&
              (config.folderTemplateId as string) !== ""
                ? config.folderTemplateId
                : undefined) as Id<"folderTemplates">,
              defaultStorageTierId: (config.defaultStorageTierId &&
              (config.defaultStorageTierId as string) !== ""
                ? config.defaultStorageTierId
                : undefined) as Id<"storageTiers">,
            }),
          ),
          lineItems: step3DataRef.current?.lineItems?.map((item) => ({
            ...item,
            sectionId:
              item.sectionId && (item.sectionId as string) !== ""
                ? (item.sectionId as Id<"quotationSections">)
                : undefined,
            projectConfigId: item.projectConfigId || undefined,
            rate: Number(item.rate) || 0,
            quantity: Number(item.quantity) || 1,
            subItems: item.subItems, // Sub-items are already typed correctly
          })),
          terms: step3DataRef.current?.terms,
          applyGST: step3DataRef.current?.applyGST,
          gstPercentage: step3DataRef.current?.gstPercentage,
        });
      } catch (err) {
        console.error("Failed to save draft:", err);
      }
    },
    [
      draftId,
      currentStep,
      step1Data,
      step2Data,
      step3Data,
      updateDraft,
      packageId,
    ],
  );

  // Initialization
  useEffect(() => {
    if (isInitialized) return;

    const init = async () => {
      if (packageId) {
        if (!pkg) return; // Wait for query

        // Initialize from Live Package
        setStep1DataWithRef({
          name: pkg.name,
          description: pkg.description,
        });

        const projectConfigs = pkg.projectConfigs
          ? [...pkg.projectConfigs]
          : [];
        if (projectConfigs.length === 0 && pkg.projectTypeId) {
          projectConfigs.push({
            id: crypto.randomUUID(),
            label: "Standard Config",
            categoryId: pkg.categoryId, // Legacy: apply package category to config
            projectTypeId: pkg.projectTypeId,
            folderTemplateId: pkg.folderTemplateId as Id<"folderTemplates">,
            defaultStorageTierId: pkg.defaultStorageTierId,
          });
        }

        setStep2DataWithRef({
          projectConfigs: projectConfigs.map((config) => ({
            ...config,
            label: config.label ?? "Standard Config",
            categoryId: config.categoryId ?? pkg.categoryId, // Fallback to package category for legacy
          })) as ProjectConfig[],
        });

        setStep3DataWithRef({
          lineItems: pkg.lineItems.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          })),
          terms: pkg.terms,
          applyGST: pkg.applyGST ?? true,
          gstPercentage: (pkg as any).gstPercentage ?? 18,
        });

        setIsInitialized(true);
      } else {
        // Creation Flow
        if (activeDraft === undefined) return; // Loading

        if (activeDraft) {
          // Resume Draft
          setDraftId(activeDraft._id);
          setCurrentStep(activeDraft.lastStep);
          setStep1DataWithRef({
            name: activeDraft.name ?? "",
            description: activeDraft.description,
          });
          setStep2DataWithRef({
            projectConfigs: (activeDraft.projectConfigs ?? []).map(
              (config: any) => ({
                ...config,
                categoryId: config.categoryId ?? activeDraft.categoryId, // Fallback for legacy drafts
              }),
            ) as ProjectConfig[],
          });
          setStep3DataWithRef({
            lineItems: (activeDraft.lineItems ?? []) as LineItem[],
            terms: activeDraft.terms,
            applyGST: activeDraft.applyGST ?? true,
            gstPercentage: activeDraft.gstPercentage ?? 18,
          });
          toast.success("Resumed your previous draft", {
            description: "We've loaded your progress.",
          });
        } else {
          // Start Fresh
          const result = await createDraft({});
          setDraftId(result.draftId);
        }
        setIsInitialized(true);
      }
    };

    init();
  }, [packageId, pkg, activeDraft, isInitialized, createDraft]);

  // Update draftWasSeen when activeDraft is available
  useEffect(() => {
    if (activeDraft) {
      draftWasSeen.current = true;
    }
  }, [activeDraft]);

  // Reactive monitor for draft existence
  // This handles the scenario where another machine/tab publishes or deletes the active draft
  useEffect(() => {
    if (isInitialized && !packageId && draftId) {
      // If activeDraft is null and we've already seen it once, it means it was deleted/published
      if (activeDraft === null && draftWasSeen.current && !isSubmitting) {
        // Prevent multiple redirects
        setIsSubmitting(true);

        toast.error("Draft session ended", {
          description:
            "This package has already been published or the draft was removed in another session.",
        });

        // Redirect back to the package list
        router.replace("/settings/service-packages");
      }
    }
  }, [activeDraft, isInitialized, packageId, draftId, isSubmitting, router]);

  const [submitTrigger, setSubmitTrigger] = useState<(() => void) | null>(null);
  const [syncCurrentStep, setSyncCurrentStep] = useState<
    (() => boolean | void) | null
  >(null);

  // Reference to hold the latest sync function (avoids stale closure issues)
  const syncCurrentStepRef = useRef<(() => boolean | void) | null>(null);
  useEffect(() => {
    syncCurrentStepRef.current = syncCurrentStep;
  }, [syncCurrentStep]);

  const goToStep = useCallback(
    async (step: number) => {
      if (step >= 1 && step <= 5) {
        // First, sync the current step's form data to context
        if (syncCurrentStepRef.current) {
          const result = syncCurrentStepRef.current();
          if (result === false) return; // Block navigation if sync/validation failed
        }
        // Then save to backend (draft persistence)
        await saveDraft(step);
        setCurrentStep(step);
      }
    },
    [saveDraft],
  );

  const nextStep = useCallback(() => {
    const next = Math.min(currentStep + 1, 5);
    goToStep(next);
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    const prev = Math.max(currentStep - 1, 1);
    goToStep(prev);
  }, [currentStep, goToStep]);

  const cancelWizard = useCallback(async () => {
    if (draftId && !packageId) {
      await deleteDraftMutation({ draftId });
    }
    router.push("/settings/service-packages");
  }, [draftId, packageId, deleteDraftMutation, router]);

  const publishPackage = useCallback(async () => {
    if (!draftId || packageId) return;

    setIsSubmitting(true);
    try {
      const newPackageId = await publishDraft({ draftId });
      toast.success("Package published successfully!");
      return newPackageId;
    } catch (err: any) {
      const isNotFound = err.message?.includes("not found");
      toast.error(
        isNotFound
          ? "This draft has already been published or removed."
          : err.message || "Failed to publish package",
      );
      if (isNotFound) {
        router.replace("/settings/service-packages");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [draftId, packageId, publishDraft]);

  const updatePackageMutation = useMutation(
    api.functions.servicePackages.mutations.update,
  );

  const savePackageUpdate = useCallback(async () => {
    if (!packageId) return;

    setIsSubmitting(true);
    try {
      await updatePackageMutation({
        id: packageId,
        name: step1DataRef.current?.name,
        description: step1DataRef.current?.description,
        projectConfigs: step2DataRef.current?.projectConfigs?.map((config) => ({
          ...config,
          categoryId: (config.categoryId && (config.categoryId as string) !== ""
            ? config.categoryId
            : undefined) as Id<"projectCategories">,
          projectTypeId: (config.projectTypeId &&
          (config.projectTypeId as string) !== ""
            ? config.projectTypeId
            : undefined) as Id<"projectTypes">,
          folderTemplateId: (config.folderTemplateId &&
          (config.folderTemplateId as string) !== ""
            ? config.folderTemplateId
            : undefined) as Id<"folderTemplates">,
          defaultStorageTierId: (config.defaultStorageTierId &&
          (config.defaultStorageTierId as string) !== ""
            ? config.defaultStorageTierId
            : undefined) as Id<"storageTiers">,
        })) as any,
        lineItems: step3DataRef.current?.lineItems?.map((item) => ({
          ...item,
          sectionId:
            item.sectionId && (item.sectionId as string) !== ""
              ? (item.sectionId as Id<"quotationSections">)
              : undefined,
          projectConfigId: item.projectConfigId || undefined,
          rate: Number(item.rate) || 0,
          quantity: Number(item.quantity) || 1,
          subItems: item.subItems,
        })),
        terms: step3DataRef.current?.terms,
        applyGST: step3DataRef.current?.applyGST,
        gstPercentage: step3DataRef.current?.gstPercentage,
      });
      toast.success("Section updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update package");
    } finally {
      setIsSubmitting(false);
    }
  }, [packageId, step1Data, step2Data, step3Data, updatePackageMutation]);

  const value = useMemo(
    () => ({
      currentStep,
      setCurrentStep,
      step1Data,
      setStep1Data: setStep1DataWithRef,
      step2Data,
      setStep2Data: setStep2DataWithRef,
      step3Data,
      setStep3Data: setStep3DataWithRef,
      isEditing: !!packageId,
      isEditor: !!packageId, // If we have a packageId, we are in the standard dashboard edit mode
      packageId: packageId || null,
      draftId,
      nextStep,
      prevStep,
      goToStep,
      submitTrigger,
      setSubmitTrigger,
      syncCurrentStep,
      setSyncCurrentStep,
      isSubmitting,
      publishPackage,
      savePackageUpdate,
      cancelWizard,
    }),
    [
      currentStep,
      step1Data,
      step2Data,
      step3Data,
      packageId,
      draftId,
      submitTrigger,
      syncCurrentStep,
      isSubmitting,
      nextStep,
      prevStep,
      goToStep,
      publishPackage,
      savePackageUpdate,
      cancelWizard,
    ],
  );

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse bg-zinc-950 h-screen w-full">
        <div className="w-12 h-12 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
          Loading Configuration...
        </p>
      </div>
    );
  }

  return (
    <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilder must be used within BuilderProvider");
  }
  return context;
}
