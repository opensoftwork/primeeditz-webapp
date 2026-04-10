"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { buildStepPlan, type StepDescriptor } from "./schema";

interface UseSignUpLogicProps {
  isAuthenticated: boolean;
  isSetupMode: boolean;
  createProfile: (args: { name: string; phone?: string; company?: string }) => Promise<any>;
}

export function useSignUpLogic({
  isAuthenticated,
  isSetupMode,
  createProfile,
}: UseSignUpLogicProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Guard to prevent the auto-advance useEffect from fighting the Back button.
  // Once the user explicitly navigates back, auto-advance is permanently disabled.
  const hasAutoAdvanced = useRef(false);

  // Compute the step plan once based on auth state — memo'd to avoid reference churn.
  const stepPlan = useMemo<StepDescriptor[]>(
    () => buildStepPlan(isSetupMode, isAuthenticated),
    [isSetupMode, isAuthenticated],
  );

  const totalSteps = stepPlan.length;

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
    // No form-level validator — we validate per-step in handleNextStep
    // and rely on per-field validators only for the fields actually shown.
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

  const session = authClient.useSession();

  // Smart Resume: Pre-fill form from auth session and auto-advance ONCE.
  useEffect(() => {
    if (session.data?.user) {
      const user = session.data.user;
      const nameParts = user.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Only update if current values are empty to avoid overwriting user edits
      if (!form.getFieldValue("firstName")) form.setFieldValue("firstName", firstName);
      if (!form.getFieldValue("lastName")) form.setFieldValue("lastName", lastName);
      if (!form.getFieldValue("email")) form.setFieldValue("email", user.email);
      
      // Auto-advance past the identity step ONCE if authenticated in setup mode.
      // The ref guard prevents this from re-firing when the user clicks Back.
      if (isSetupMode && currentStep === 0 && !hasAutoAdvanced.current) {
        hasAutoAdvanced.current = true;
        setCurrentStep(1);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.data, isSetupMode]);
  // Intentionally omit `currentStep` and `form` from deps:
  // - currentStep: including it causes re-fire on Back navigation (the bug)
  // - form: stable reference from useForm, doesn't need to be a dep

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const step = stepPlan[currentStep];
    if (!step) return;

    const fieldsToValidate = step.fields;

    await Promise.all(
      fieldsToValidate.map((field) => form.validateField(field as any, "submit"))
    );

    const state = form.state.fieldMeta;
    const hasErrors = fieldsToValidate.some(
      (field) => (state[field as keyof typeof state]?.errors?.length ?? 0) > 0
    );
    const hasEmptyValues = fieldsToValidate.some(
      (field) => !form.getFieldValue(field as any)
    );

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
    totalSteps,
    stepPlan,
    handleNextStep,
    handlePrevStep,
    handleGoogleSignUp,
  };
}
