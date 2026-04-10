import type { useSignUpLogic } from "./signup-logic";

// Derive the form type directly from useSignUpLogic's return type.
// This captures the full ReactFormExtendedApi (FormApi + ReactFormApi)
// which includes the .Field component, without manually specifying 12+ generics.
export type SignUpFormApi = ReturnType<typeof useSignUpLogic>["form"];

export interface StepProps {
  form: SignUpFormApi;
  isLoading?: boolean;
}

export interface SignUpState {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  isGoogleLoading: boolean;
  isSetupMode: boolean;
  isAuthenticated: boolean;
}
