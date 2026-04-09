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

export const STEP_FIELDS = {
  0: ["firstName", "lastName"],
  1: ["email", "password", "confirmPassword"],
  2: ["phone", "company"],
} as const;

export type StepNumber = keyof typeof STEP_FIELDS;
