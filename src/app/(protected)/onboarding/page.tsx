import { Suspense } from "react";
import OnboardingForm from "@/components/modules/onboarding/onboarding-form";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading onboarding...</div>}>
      <OnboardingForm />
    </Suspense>
  );
}
