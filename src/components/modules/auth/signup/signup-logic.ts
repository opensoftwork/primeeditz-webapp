"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, STEP_FIELDS, StepNumber } from "./schema";

interface UseSignUpLogicProps {
  isAuthenticated: boolean;
  isSetupMode: boolean;
  totalSteps: number;
  createProfile: (args: { name: string; phone?: string; company?: string }) => Promise<any>;
}

export function useSignUpLogic({
  isAuthenticated,
  isSetupMode,
  totalSteps,
  createProfile,
}: UseSignUpLogicProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      company: "",
    },
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      try {
        if (isAuthenticated && isSetupMode) {
          await createProfile({
            name: `${value.firstName} ${value.lastName}`,
            phone: value.phone || undefined,
            company: value.company || undefined,
          });
          toast.success("Welcome, Admin! Your studio is ready.");
          router.push("/dashboard");
          return;
        }

        const { error } = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: `${value.firstName} ${value.lastName}`,
          callbackURL: "/onboarding",
        });

        if (error) {
          toast.error(error.message || "Something went wrong");
          setIsLoading(false);
          return;
        }

        toast.success(
          isSetupMode
            ? "Admin account created! Setting up studio..."
            : "Account created! Please complete your profile.",
        );
        router.push("/onboarding");
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create account",
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const fieldsToValidate = STEP_FIELDS[currentStep as StepNumber] || [];

    await Promise.all(
      fieldsToValidate.map((field) => form.validateField(field as any, "submit"))
    );

    const state = form.state.fieldMeta;
    const hasErrors = fieldsToValidate.some((field) => state[field as keyof typeof state]?.errors.length > 0);
    const hasEmptyValues = fieldsToValidate.some((field) => !form.getFieldValue(field as any));

    if (!hasErrors && !hasEmptyValues) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    } else {
      toast.error("Please fill in all fields correctly to continue");
    }
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
      });
    } catch (_err) {
      toast.error("Google sign up failed");
      setIsGoogleLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isGoogleLoading,
    currentStep,
    handleNextStep,
    handlePrevStep,
    handleGoogleSignUp,
  };
}
