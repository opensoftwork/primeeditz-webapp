/**
 * Wizard Form Context
 *
 * Provides form state management across wizard steps using React Context.
 * Persists form data to Convex draft on step changes.
 * Supports both client mode (5 steps) and admin mode (6 steps).
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@convex/_generated/api";
import { useReferenceFilesStore } from "@/stores/reference-files-store";
import { toast } from "sonner";
import type { Id } from "@convex/_generated/dataModel";
import {
  type WizardFormData,
  type WizardStepId,
  type WizardMode,
  type ReferenceFile,
  type SelectedClientData,
  INITIAL_FORM_DATA,
  WIZARD_STEPS,
  getWizardSteps,
  getFirstStepId,
  getStepCount,
} from "./types";

// ============================================================================
// Context Types
// ============================================================================

interface WizardContextValue {
  // State
  mode: WizardMode;
  projectId: Id<"projects"> | null;
  projectCode: string | null;
  currentStep: WizardStepId;
  formData: WizardFormData;
  isDirty: boolean;
  isReviewing: boolean;
  isVaultDrawerOpen: boolean;
  isLoading: boolean;
  error: string | null;
  submitTrigger: (() => void) | null;
  projectTypes: any[] | undefined;
  stepCount: number;
  wizardSteps: readonly { id: number; title: string; description: string }[];

  // Actions
  setFormData: <K extends keyof WizardFormData>(
    step: K,
    data: Partial<WizardFormData[K]>,
  ) => void;
  setReviewing: (isReviewing: boolean) => void;
  setVaultDrawerOpen: (open: boolean) => void;
  goToStep: (step: WizardStepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveDraft: (step?: WizardStepId) => Promise<void>;
  submitProject: () => Promise<boolean>;
  cancelWizard: () => Promise<void>;
  resetWizard: () => void;
  setSubmitTrigger: (fn: (() => void) | null) => void;
  setClientData: (clientData: SelectedClientData | null) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

// ============================================================================
// Hook
// ============================================================================

export function useWizardForm() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizardForm must be used within WizardFormProvider");
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface WizardFormProviderProps {
  children: React.ReactNode;
  mode?: WizardMode;
  initialProjectId?: Id<"projects">;
  initialProjectCode?: string;
  initialStep?: WizardStepId;
  initialFormData?: Partial<WizardFormData>;
}

export function WizardFormProvider({
  children,
  mode = "client",
  initialProjectId,
  initialProjectCode,
  initialStep,
  initialFormData,
}: WizardFormProviderProps) {
  // Compute mode-based values
  const firstStepId = getFirstStepId(mode);
  const stepCount = getStepCount(mode);
  const wizardSteps = getWizardSteps(mode);

  // State
  const [projectId, setProjectId] = useState<Id<"projects"> | null>(
    initialProjectId ?? null,
  );
  const [projectCode, setProjectCode] = useState<string | null>(
    initialProjectCode ?? null,
  );
  const [currentStep, setCurrentStep] = useState<WizardStepId>(
    initialStep ?? firstStepId,
  );
  const [submitTrigger, setSubmitTriggerState] = useState<(() => void) | null>(
    null,
  );
  const [formData, setFormDataState] = useState<WizardFormData>({
    ...INITIAL_FORM_DATA,
    ...initialFormData,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isVaultDrawerOpen, setIsVaultDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutations
  const createDraft = useMutation(api.functions.projects.mutations.createDraft);
  const updateDraft = useMutation(api.functions.projects.mutations.updateDraft);
  const deleteDraftMutation = useMutation(
    api.functions.projects.mutations.deleteDraft,
  );
  const submitProjectMutation = useMutation(
    api.functions.projects.mutations.submitProject,
  );
  const generateUploadUrl = useAction(
    api.functions.projects.storage.generateUploadUrl,
  );

  const existingClientDraft = useQuery(
    api.functions.projects.queries.getMyActiveDraft,
    mode === "admin" ? "skip" : {},
  );

  // Query for admin draft when in admin mode
  const existingAdminDraft = useQuery(
    api.functions.projects.queries.getAdminActiveDraft,
    mode === "admin" ? {} : "skip",
  );

  // Combined existing draft based on mode
  const existingDraft =
    mode === "admin" ? existingAdminDraft : existingClientDraft;

  // Fetch all active project types for logic and selection
  const projectTypes = useQuery(
    api.functions.projectTypes.queries.getActiveProjectTypes,
  );

  // Ref to prevent double-initialization in Strict Mode
  const hasInitialized = useRef(false);

  // Create or Resume draft on first load
  useEffect(() => {
    // Wait for existingDraft query to return (undefined means loading)
    if (existingDraft === undefined) return;
    if (projectId || hasInitialized.current) return;

    const initDraft = async () => {
      if (existingDraft) {
        // Resume existing draft
        setProjectId(existingDraft._id);
        setProjectCode(existingDraft.code);
        if (existingDraft.lastStep) {
          setCurrentStep(existingDraft.lastStep as WizardStepId);
        }

        // Populate form data from draft
        setFormDataState(
          (prev): WizardFormData => ({
            ...prev,
            // Step 0 for admin mode - restore client selection
            // Note: clientData is null because draft only stores clientId, not full profile data
            // The UI can query full client data separately using the clientId if needed
            step0:
              mode === "admin" && existingDraft.clientId
                ? {
                    clientId: existingDraft.clientId,
                    clientData: null,
                    selectionMode: "existing" as const,
                    isNewClient: false,
                  }
                : prev.step0,
            step1: {
              projectTypeId: existingDraft.projectTypeId,
              endClientName: existingDraft.endClientName || "",
              eventName: existingDraft.eventName || "",
              eventDate: existingDraft.eventDate ?? null,
              venue: existingDraft.venue || "",
            },
            step2: {
              typeSpecificDetails: existingDraft.typeSpecificDetails || {},
            },
            step3: {
              referenceFiles:
                (existingDraft.referenceFiles as ReferenceFile[]) || [],
            },
            step4: {
              description: existingDraft.description || "",
              additionalNotes: existingDraft.additionalNotes || "",
              preferredDeliveryDate:
                existingDraft.preferredDeliveryDate ?? null,
            },
          }),
        );
        return;
      }

      // No existing draft, create one
      hasInitialized.current = true;
      setIsLoading(true);
      try {
        const result = await createDraft({});
        setProjectId(result.projectId);
        setProjectCode(result.code);
        setError(null);
      } catch (err) {
        hasInitialized.current = false; // Allow retry on failure
        const errorMessage =
          err instanceof ConvexError
            ? (err.data as string)
            : err instanceof Error
              ? err.message
              : "Failed to create draft";

        setError(errorMessage);
        toast.error("Wizard Initialization Failed", {
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    initDraft();
  }, [projectId, createDraft, existingDraft, mode]);

  // Update form data for a specific step
  const setFormData = useCallback(
    <K extends keyof WizardFormData>(
      step: K,
      data: Partial<WizardFormData[K]>,
    ) => {
      setFormDataState((prev) => ({
        ...prev,
        [step]: { ...prev[step], ...data },
      }));
      setIsDirty(true);
    },
    [],
  );

  // Save current form data to Convex draft
  const saveDraft = useCallback(
    async (stepOverride?: WizardStepId) => {
      if (!projectId) return;

      setIsLoading(true);
      setError(null);
      try {
        await updateDraft({
          projectId,
          clientId: formData.step0.clientId ?? undefined,
          // Step 1
          projectTypeId: formData.step1.projectTypeId ?? undefined,
          endClientName: formData.step1.endClientName || undefined,
          eventName: formData.step1.eventName || undefined,
          eventDate: formData.step1.eventDate ?? undefined,
          venue: formData.step1.venue || undefined,
          // Step 2
          typeSpecificDetails: formData.step2.typeSpecificDetails,
          // Step 3
          referenceFiles:
            formData.step3.referenceFiles.length > 0
              ? formData.step3.referenceFiles
              : undefined,
          // Step 4
          description: formData.step4.description || undefined,
          additionalNotes: formData.step4.additionalNotes || undefined,
          preferredDeliveryDate:
            formData.step4.preferredDeliveryDate ?? undefined,
          lastStep: stepOverride ?? currentStep,
        });
        setIsDirty(false);
      } catch (err) {
        const errorMessage =
          err instanceof ConvexError
            ? (err.data as string)
            : err instanceof Error
              ? err.message
              : "Failed to save draft";

        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, formData, updateDraft],
  );

  // Navigation
  const goToStep = useCallback(
    async (step: WizardStepId) => {
      // Navigate immediately for instant UX feedback
      setCurrentStep(step);

      // Persist progress in the background
      try {
        await saveDraft(step);
      } catch (err) {
        // Error is handled inside saveDraft (sets state.error)
      }
    },
    [saveDraft],
  );

  const nextStep = useCallback(async () => {
    const currentIndex = wizardSteps.findIndex((s) => s.id === currentStep);
    const nextIndex = currentIndex + 1;

    if (nextIndex < wizardSteps.length) {
      let nextStepId = wizardSteps[nextIndex].id as WizardStepId;

      // Logic: Skip Step 2 if project type has no custom fields
      if (nextStepId === 2) {
        const selectedType = projectTypes?.find(
          (pt) => pt._id === formData.step1.projectTypeId,
        );

        if (selectedType && !selectedType.hasCustomFields) {
          // Jump over step 2 directly to step 3 (Files)
          nextStepId = 3;
        }
      }

      await goToStep(nextStepId);
    }
  }, [
    currentStep,
    goToStep,
    projectTypes,
    formData.step1.projectTypeId,
    wizardSteps,
  ]);

  const prevStep = useCallback(async () => {
    const prevIndex = wizardSteps.findIndex((s) => s.id === currentStep) - 1;
    if (prevIndex >= 0) {
      await goToStep(wizardSteps[prevIndex].id as WizardStepId);
    }
  }, [currentStep, goToStep, wizardSteps]);

  // Submit project
  const submitProject = useCallback(async (): Promise<boolean> => {
    if (!projectId) return false;

    setIsLoading(true);
    setError(null);
    try {
      // 1. Get all files from the store that need uploading
      const storeState = useReferenceFilesStore.getState();
      const filesToUpload = storeState.files;
      const uploadedFiles: ReferenceFile[] = [];

      if (filesToUpload.length > 0) {
        toast.info(
          `Transmitting ${filesToUpload.length} assets to cloud storage...`,
          {
            duration: 5000,
          },
        );

        // 2. Upload files in parallel with graceful error handling
        const uploadPromises = filesToUpload.map(async (clientFile) => {
          // If already has storageKey, use it
          if (clientFile.storageKey) {
            return {
              fileId: clientFile.id,
              fileName: clientFile.fileName,
              fileSize: clientFile.fileSize,
              fileType: clientFile.fileType,
              storageKey: clientFile.storageKey,
              previewUrl: clientFile.previewUrl || undefined,
            };
          }

          // Otherwise, upload to MinIO
          const { uploadUrl, storageKey } = await generateUploadUrl({
            projectId,
            fileName: clientFile.fileName,
            fileType: clientFile.fileType,
          });

          const response = await fetch(uploadUrl, {
            method: "PUT",
            body: clientFile.file, // This is the actual File object
            headers: {
              "Content-Type": clientFile.fileType,
            },
          });

          if (!response.ok)
            throw new Error(`Failed to transmit ${clientFile.fileName}`);

          return {
            fileId: clientFile.id,
            fileName: clientFile.fileName,
            fileSize: clientFile.fileSize,
            fileType: clientFile.fileType,
            storageKey: storageKey,
            previewUrl: clientFile.previewUrl || undefined,
          };
        });

        // Use allSettled to handle partial failures gracefully
        const results = await Promise.allSettled(uploadPromises);

        const failedUploads: string[] = [];

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            uploadedFiles.push(result.value);
          } else {
            const fileName =
              filesToUpload[index]?.fileName || `File ${index + 1}`;
            failedUploads.push(fileName);
            console.error(`Upload failed for ${fileName}:`, result.reason);
          }
        });

        // Notify user of any failed uploads
        if (failedUploads.length > 0) {
          const allFailed =
            uploadedFiles.length === 0 && filesToUpload.length > 0;
          toast.warning(
            allFailed
              ? "Files could not be uploaded"
              : `${failedUploads.length} file${
                  failedUploads.length > 1 ? "s" : ""
                } failed to upload`,
            {
              description: allFailed
                ? "Your project will be created without files. You can upload them later from the project details."
                : `Could not upload: ${failedUploads.slice(0, 3).join(", ")}${
                    failedUploads.length > 3
                      ? ` and ${failedUploads.length - 3} more`
                      : ""
                  }. You can upload missing files later.`,
              duration: 6000,
            },
          );
        }
      }

      // 3. Save final form data with updated storage keys
      await updateDraft({
        projectId,
        // Step 1
        projectTypeId: formData.step1.projectTypeId ?? undefined,
        endClientName: formData.step1.endClientName || undefined,
        eventName: formData.step1.eventName || undefined,
        eventDate: formData.step1.eventDate ?? undefined,
        venue: formData.step1.venue || undefined,
        // Step 2
        typeSpecificDetails: formData.step2.typeSpecificDetails,
        // Step 3 - Use the actual uploaded files metadata
        referenceFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        // Step 4
        description: formData.step4.description || undefined,
        additionalNotes: formData.step4.additionalNotes || undefined,
        preferredDeliveryDate:
          formData.step4.preferredDeliveryDate ?? undefined,
        lastStep: currentStep,
      });

      // 4. Finally submit
      await submitProjectMutation({ projectId });
      return true;
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage =
        err instanceof ConvexError
          ? (err.data as string)
          : err instanceof Error
            ? err.message
            : "Failed to submit project";

      setError(errorMessage);
      toast.error("Submission Failed", {
        description: errorMessage,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    projectId,
    formData,
    updateDraft,
    submitProjectMutation,
    generateUploadUrl,
    currentStep,
  ]);

  // Cancel wizard and delete draft
  const cancelWizard = useCallback(async () => {
    if (projectId) {
      setIsLoading(true);
      try {
        await deleteDraftMutation({ projectId });
      } catch (err) {
        console.error("Failed to delete draft:", err);
        const errorMessage =
          err instanceof ConvexError
            ? (err.data as string)
            : err instanceof Error
              ? err.message
              : "Failed to delete draft";
        toast.error("Cleanup Failed", {
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }
    resetWizard();
  }, [projectId, deleteDraftMutation]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setProjectId(null);
    setProjectCode(null);
    setCurrentStep(firstStepId);
    setFormDataState(INITIAL_FORM_DATA);
    setIsDirty(false);
    setIsReviewing(false);
    setIsVaultDrawerOpen(false);
    setError(null);
  }, [firstStepId]);

  const setSubmitTrigger = useCallback((fn: (() => void) | null) => {
    setSubmitTriggerState(() => fn);
  }, []);

  // Set client data (for admin mode client selection)
  const setClientData = useCallback((clientData: SelectedClientData | null) => {
    setFormDataState((prev) => ({
      ...prev,
      step0: {
        ...prev.step0,
        clientId: clientData?._id ?? null,
        clientData,
        selectionMode: clientData ? "existing" : prev.step0.selectionMode,
      },
    }));
    setIsDirty(true);
  }, []);

  return (
    <WizardContext.Provider
      value={{
        mode,
        projectId,
        projectCode,
        currentStep,
        formData,
        isDirty,
        isReviewing,
        isVaultDrawerOpen,
        isLoading,
        error,
        stepCount,
        wizardSteps,
        setFormData,
        setReviewing: setIsReviewing,
        setVaultDrawerOpen: setIsVaultDrawerOpen,
        goToStep,
        nextStep,
        prevStep,
        saveDraft,
        submitProject,
        cancelWizard,
        resetWizard,
        submitTrigger,
        setSubmitTrigger,
        projectTypes,
        setClientData,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}
