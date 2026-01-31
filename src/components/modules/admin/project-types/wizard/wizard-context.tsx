"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { FolderLevel1 } from "@convex/schema";
import { toast } from "sonner";
import type { WizardStep, Step1Data, WizardState } from "./types";

interface ProjectTypeWizardContextValue extends WizardState {
  // Navigation
  goToStep: (step: WizardStep) => void;
  handleNext: () => void;
  handleBack: () => void;
  canProceed: boolean;

  // Data setters
  setStep1Data: (data: Step1Data) => void;
  setFolders: (folders: FolderLevel1[]) => void;

  // Actions
  saveDraft: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isSavingDraft: boolean;
}

const ProjectTypeWizardContext =
  createContext<ProjectTypeWizardContextValue | null>(null);

interface ProjectTypeWizardProviderProps {
  children: ReactNode;
  projectTypeId?: Id<"projectTypes">;
}

export function ProjectTypeWizardProvider({
  children,
  projectTypeId,
}: ProjectTypeWizardProviderProps) {
  const router = useRouter();

  // State
  const [step, setStep] = useState<WizardStep>(1);
  const [step1Data, setStep1DataState] = useState<Step1Data | null>(null);
  const [folders, setFoldersState] = useState<FolderLevel1[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Queries for edit mode
  const existingProjectType = useQuery(
    api.functions.projectTypes.queries.getById,
    projectTypeId ? { id: projectTypeId } : "skip",
  );
  const existingTemplate = useQuery(
    api.functions.folderTemplates.queries.getByProjectTypeId,
    projectTypeId ? { projectTypeId } : "skip",
  );

  // Mutations
  const createWithTemplate = useMutation(
    api.functions.projectTypes.mutations.createWithTemplate,
  );
  const updateWithTemplate = useMutation(
    api.functions.projectTypes.mutations.updateWithTemplate,
  );
  const saveDraftMutation = useMutation(
    api.functions.projectTypes.mutations.saveDraft,
  );

  // Derived state
  const isEditing = !!projectTypeId && !!existingProjectType;
  const isDraft = existingProjectType?.isDraft ?? false;

  // Initialize from existing data (edit mode)
  useEffect(() => {
    if (existingProjectType && !step1Data) {
      setStep1DataState({
        name: existingProjectType.name,
        description: existingProjectType.description,
        categoryId: existingProjectType.categoryId,
        icon: existingProjectType.icon,
        isActive: existingProjectType.isActive,
      });

      // If draft, restore saved step and folders
      if (existingProjectType.isDraft && existingProjectType.draftData) {
        if (existingProjectType.draftData.step) {
          setStep(existingProjectType.draftData.step as WizardStep);
        }
        if (existingProjectType.draftData.folders) {
          setFoldersState(existingProjectType.draftData.folders);
        }
      }
    }

    if (existingTemplate && folders.length === 0) {
      setFoldersState(existingTemplate.folders);
    }
  }, [existingProjectType, existingTemplate, step1Data, folders.length]);

  // Validation
  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return !!step1Data?.name && step1Data.name.length >= 2;
      case 2:
        return folders.length > 0; // At least one folder required
      case 3:
        return true; // Review step always allows submission
      default:
        return false;
    }
  }, [step, step1Data, folders]);

  // Navigation
  const goToStep = useCallback((newStep: WizardStep) => {
    setStep(newStep);
  }, []);

  const handleNext = useCallback(() => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as WizardStep);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step === 1) {
      router.push("/settings/project-types");
    } else {
      setStep((prev) => (prev - 1) as WizardStep);
    }
  }, [step, router]);

  // Data setters
  const setStep1Data = useCallback((data: Step1Data) => {
    setStep1DataState(data);
  }, []);

  const setFolders = useCallback((newFolders: FolderLevel1[]) => {
    setFoldersState(newFolders);
  }, []);

  // Actions
  const saveDraft = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      await saveDraftMutation({
        id: projectTypeId,
        step,
        formData: {
          name: step1Data?.name || "",
          description: step1Data?.description,
          categoryId: step1Data?.categoryId as Id<"projectCategories">,
          icon: step1Data?.icon,
          isActive: step1Data?.isActive ?? true,
        },
        folders,
      });
      toast.success("Draft saved successfully");
      router.push("/settings/project-types");
    } catch (error) {
      console.error("Save draft error:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  }, [step1Data, step, folders, projectTypeId, saveDraftMutation, router]);

  const handleSubmit = useCallback(async () => {
    if (!step1Data) {
      toast.error("Missing project type data");
      return;
    }

    if (folders.length === 0) {
      toast.error("At least one folder is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && projectTypeId) {
        await updateWithTemplate({
          projectTypeId,
          templateId: existingTemplate?._id,
          projectType: {
            name: step1Data.name,
            description: step1Data.description,
            categoryId: step1Data.categoryId as Id<"projectCategories">,
            icon: step1Data.icon,
            isActive: step1Data.isActive,
          },
          folders,
        });
        toast.success("Project type updated successfully");
      } else {
        await createWithTemplate({
          projectType: {
            name: step1Data.name,
            description: step1Data.description,
            categoryId: step1Data.categoryId as Id<"projectCategories">,
            icon: step1Data.icon,
            isActive: step1Data.isActive,
          },
          folders,
        });
        toast.success("Project type created successfully");
      }
      router.push("/settings/project-types");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to save project type");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    step1Data,
    folders,
    isEditing,
    projectTypeId,
    existingTemplate,
    createWithTemplate,
    updateWithTemplate,
    router,
  ]);

  const value: ProjectTypeWizardContextValue = {
    // State
    step,
    step1Data,
    folders,
    isDraft,
    draftId: isDraft ? (projectTypeId ?? null) : null,
    isEditing,
    editingId: projectTypeId ?? null,
    existingTemplateId: existingTemplate?._id ?? null,

    // Navigation
    goToStep,
    handleNext,
    handleBack,
    canProceed: canProceed(),

    // Data setters
    setStep1Data,
    setFolders,

    // Actions
    saveDraft,
    handleSubmit,
    isSubmitting,
    isSavingDraft,
  };

  return (
    <ProjectTypeWizardContext.Provider value={value}>
      {children}
    </ProjectTypeWizardContext.Provider>
  );
}

export function useProjectTypeWizard() {
  const context = useContext(ProjectTypeWizardContext);
  if (!context) {
    throw new Error(
      "useProjectTypeWizard must be used within ProjectTypeWizardProvider",
    );
  }
  return context;
}
