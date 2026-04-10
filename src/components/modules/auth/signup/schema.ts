import { isValidPhoneNumber } from "@/components/ui/phone-input";
import * as z from "zod";

export const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z.string().refine((val) => !val || isValidPhoneNumber(val), {
      message: "Invalid phone number",
    }),
    company: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;

// Field names that belong to each logical step
type FieldName = keyof Omit<SignUpSchema, never>;

const IDENTITY_FIELDS: FieldName[] = ["firstName", "lastName"];
const CREDENTIALS_FIELDS: FieldName[] = ["email", "password", "confirmPassword"];
const STUDIO_FIELDS: FieldName[] = ["phone", "company"];

/**
 * A "step descriptor" defines what component renders and which fields to validate.
 * This replaces the old static STEP_FIELDS map that broke when steps were remapped.
 */
export interface StepDescriptor {
  id: "identity" | "credentials" | "studio";
  fields: FieldName[];
}

/**
 * Build the ordered list of steps based on auth state and setup mode.
 *
 * - isSetupMode + isAuthenticated: [identity, studio]        (2 steps, no credentials)
 * - isSetupMode + !isAuthenticated: [identity, credentials, studio]  (3 steps)
 * - !isSetupMode (regular signup): [identity, credentials]   (2 steps, no studio)
 */
export function buildStepPlan(isSetupMode: boolean, isAuthenticated: boolean): StepDescriptor[] {
  const steps: StepDescriptor[] = [
    { id: "identity", fields: IDENTITY_FIELDS },
  ];

  if (!isAuthenticated) {
    steps.push({ id: "credentials", fields: CREDENTIALS_FIELDS });
  }

  if (isSetupMode) {
    steps.push({ id: "studio", fields: STUDIO_FIELDS });
  }

  return steps;
}
