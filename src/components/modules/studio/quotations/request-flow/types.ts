/**
 * Quote Request Wizard Types
 *
 * Type definitions for the 3-step studio engagement request flow.
 */

export type RequestStepId = 1 | 2 | 3;

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  isOptional?: boolean;
}

export const REQUEST_WIZARD_STEPS = [
  {
    id: 1 as RequestStepId,
    title: "Packages",
    description: "Select production models",
  },
  {
    id: 2 as RequestStepId,
    title: "Details",
    description: "Engagement specifications",
  },
  { id: 3 as RequestStepId, title: "Review", description: "Review and submit" },
] as const;

export interface RequestFormData {
  endClientName: string;
  eventName: string;
  eventDate: string;
  venue: string;
  notes: string;
}

export const INITIAL_REQUEST_FORM_DATA: RequestFormData = {
  endClientName: "",
  eventName: "",
  eventDate: "",
  venue: "",
  notes: "",
};
