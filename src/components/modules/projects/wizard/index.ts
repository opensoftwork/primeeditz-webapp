/**
 * Project Wizard Module Exports
 */

export {
  type DbFieldDefinition,
  DynamicField,
} from "@/components/shared/dynamic-form-fields";
export { AlbumConfigField } from "./album-config-field";
// Sub-components
export { ProjectTypeSelectionDrawer } from "./project-type-drawer";
// Main wizard component
export { ProjectWizard } from "./project-wizard";
export { type FormStep, StepNavigation } from "./step-navigation";
// Step components (for direct access if needed)
export { WizardStep1 } from "./steps/step-1-basics";
export { WizardStep2 } from "./steps/step-2-details";
export { WizardStep3 } from "./steps/step-3-files";
export { WizardStep4 } from "./steps/step-4-description";
export { WizardStep5 } from "./steps/step-5-review";
// Types
export * from "./types";
// Context and hooks
export { useWizardForm, WizardFormProvider } from "./wizard-form-context";
