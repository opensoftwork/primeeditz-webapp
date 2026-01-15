/**
 * Project Wizard Module Exports
 */

// Main wizard component
export { ProjectWizard } from "./project-wizard"

// Context and hooks
export { WizardFormProvider, useWizardForm } from "./wizard-form-context"

// Types
export * from "./types"

// Sub-components
export { ProjectTypeSelectionDrawer } from "./project-type-drawer"
export { StepNavigation, type FormStep } from "./step-navigation"
export { AlbumConfigField } from "./album-config-field"
export { DynamicField, type DbFieldDefinition } from "@/components/shared/dynamic-form-fields"

// Step components (for direct access if needed)
export { WizardStep1 } from "./steps/step-1-basics"
export { WizardStep2 } from "./steps/step-2-details"
export { WizardStep3 } from "./steps/step-3-files"
export { WizardStep4 } from "./steps/step-4-description"
export { WizardStep5 } from "./steps/step-5-review"
