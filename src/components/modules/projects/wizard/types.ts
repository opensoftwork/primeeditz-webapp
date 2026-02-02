/**
 * Project Wizard Types
 *
 * Type definitions for the 5-step project request wizard.
 * Supports project-type-specific fields based on category.
 */

import type { Id } from "@convex/_generated/dataModel";

// ============================================================================
// Wizard Mode
// ============================================================================

/** Wizard mode: studio-initiated (5 steps), admin-initiated (6 steps), or onboarding (3 steps) */
export type WizardMode = "studio" | "admin" | "onboarding";

// ============================================================================
// Step Definitions
// ============================================================================

/** Steps for studio-initiated projects (5 steps) */
export const STUDIO_WIZARD_STEPS = [
  {
    id: 1,
    title: "Project Type",
    description: "Select project type and basic info",
  },
  { id: 2, title: "Details", description: "Project-specific details" },
  { id: 3, title: "Files", description: "Upload reference files" },
  { id: 4, title: "Description", description: "Add description and notes" },
  { id: 5, title: "Review", description: "Review and submit" },
] as const;

/** Steps for admin-initiated projects (6 steps) */
export const ADMIN_WIZARD_STEPS = [
  { id: 0, title: "Studio", description: "Select or create studio" },
  { id: 1, title: "Basics", description: "Project type and basic info" },
  { id: 2, title: "Details", description: "Project-specific details" },
  { id: 3, title: "Files", description: "Upload reference files" },
  { id: 4, title: "Description", description: "Add description and notes" },
  { id: 5, title: "Review", description: "Review and submit" },
] as const;

/** Steps for project onboarding (3 steps: Files, Description, Review) */
export const ONBOARDING_WIZARD_STEPS = [
  { id: 3, title: "Files", description: "Upload reference files" },
  { id: 4, title: "Description", description: "Add description and notes" },
  { id: 5, title: "Review", description: "Review and confirm" },
] as const;

/** Default wizard steps (studio mode) */
export const WIZARD_STEPS = STUDIO_WIZARD_STEPS;

/** Step IDs: 0-5 for admin mode, 1-5 for studio mode */
export type WizardStepId = 0 | 1 | 2 | 3 | 4 | 5;

/** Get wizard steps based on mode */
export function getWizardSteps(mode: WizardMode) {
  if (mode === "admin") return ADMIN_WIZARD_STEPS;
  if (mode === "onboarding") return ONBOARDING_WIZARD_STEPS;
  return STUDIO_WIZARD_STEPS;
}

/** Get total step count based on mode */
export function getStepCount(mode: WizardMode): number {
  if (mode === "admin") return 6;
  if (mode === "onboarding") return 3;
  return 5;
}

/** Get first step ID based on mode */
export function getFirstStepId(mode: WizardMode): WizardStepId {
  if (mode === "admin") return 0;
  if (mode === "onboarding") return 3;
  return 1;
}

// ============================================================================
// Project Type Definition
// ============================================================================

/** Project type from the database */
export interface ProjectType {
  _id: Id<"projectTypes">;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  hasCustomFields: boolean;
  isActive: boolean;
  sortOrder?: number;
}

// ============================================================================
// Form Data Types
// ============================================================================

/** Studio selection mode in admin wizard */
export type StudioSelectionMode = "existing" | "new" | "none" | null;

/** Selected studio data for display */
export interface SelectedStudioData {
  _id: Id<"profiles">;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  onboardingComplete: boolean;
  projectCount?: number;
  activeProjectCount?: number;
}

/** Step 0: Studio Selection (admin mode only) */
export interface Step0Data {
  selectionMode: StudioSelectionMode;
  studioId: Id<"profiles"> | null;
  studioData: SelectedStudioData | null;
  isNewStudio: boolean;
}

/** Step 1: Basic Info */
export interface Step1Data {
  projectTypeId: Id<"projectTypes"> | null;
  endClientName: string;
  venue: string;
  eventName: string;
  eventDate: number | null;
}

import type { FieldValue } from "@/components/shared/dynamic-form-fields";

/** Step 2: Type-Specific Details (dynamic based on project type) */
export interface Step2Data {
  typeSpecificDetails: Record<string, FieldValue>;
}

/** Step 3: Reference Files */
export interface ReferenceFile {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageKey?: string;
  previewUrl?: string;
}

export interface Step3Data {
  referenceFiles: ReferenceFile[];
}

/** Step 4: Description & Notes */
export interface Step4Data {
  description?: string;
  additionalNotes?: string;
  preferredDeliveryDate: number | null;
}

/** Combined wizard form data */
export interface WizardFormData {
  step0: Step0Data; // Studio selection (admin mode only)
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
}

/** Initial empty form state */
export const INITIAL_FORM_DATA: WizardFormData = {
  step0: {
    selectionMode: null,
    studioId: null,
    studioData: null,
    isNewStudio: false,
  },
  step1: {
    projectTypeId: null,
    endClientName: "",
    venue: "",
    eventName: "",
    eventDate: null,
  },
  step2: {
    typeSpecificDetails: {},
  },
  step3: {
    referenceFiles: [],
  },
  step4: {
    description: "",
    additionalNotes: "",
    preferredDeliveryDate: null,
  },
};

// ============================================================================
// Project Type Field Definitions
// ============================================================================

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "album-config" // Special type for album configuration with dynamic sheets
  | "media-requirements"; // Special type for photo/video count requirements

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
}

/** Dynamic fields per project type category - DEPRECATED: Use database-driven fields instead */
export const PROJECT_TYPE_FIELDS: Record<string, FieldDefinition[]> = {};

/** Get fields for a project type, with fallback to empty array */
export function getFieldsForProjectType(
  projectTypeName: string,
): FieldDefinition[] {
  return PROJECT_TYPE_FIELDS[projectTypeName] ?? [];
}

/** Get default values for a project type's fields */
export function getDefaultValuesForProjectType(
  projectTypeName: string,
): Record<string, unknown> {
  const fields = getFieldsForProjectType(projectTypeName);
  const defaults: Record<string, unknown> = {};

  for (const field of fields) {
    switch (field.type) {
      case "checkbox":
        defaults[field.name] = false;
        break;
      case "number":
        defaults[field.name] = null;
        break;
      case "album-config":
        defaults[field.name] = [];
        break;
      default:
        defaults[field.name] = "";
    }
  }

  return defaults;
}
