import { FormApi } from "@tanstack/react-form";
import { SignUpSchema } from "./schema";

// Using 'any' for the rest of the generics to avoid the 12-argument requirement
// while still keeping the data type for the schema.
export type SignUpFormApi = FormApi<SignUpSchema, any, any, any, any, any, any, any, any, any, any, any>;

export interface StepProps {
  form: any; // Using any here for the component props to be more flexible with ReactFormExtendedApi
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
