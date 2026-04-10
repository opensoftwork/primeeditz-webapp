"use client";

import { api } from "@convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";

import { Footer } from "./footer";
import { GoogleAuthButton } from "./google-auth-button";
import { Header } from "./header";
import { CredentialsStep } from "./credentials-step";
import { IdentityStep } from "./identity-step";
import { StudioStep } from "./studio-step";
import { StepIndicator } from "./step-indicator";
import { useSignUpLogic } from "./signup-logic";

export default function SignUpForm() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  //@ts-ignore
  const isFirstUser = useQuery(api.profiles.isFirstUser);
  const createProfile = useMutation(api.profiles.createProfile);
  
  const isSetupMode = isFirstUser === true;

  const {
    form,
    isLoading,
    isGoogleLoading,
    currentStep,
    totalSteps,
    stepPlan,
    handleNextStep,
    handlePrevStep,
    handleGoogleSignUp,
  } = useSignUpLogic({
    isAuthenticated,
    isSetupMode,
    //@ts-ignore - handled inside mutation
    createProfile,
  });

  if (isAuthLoading || isFirstUser === undefined) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050507]">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    );
  }

  // Resolve the current step's component from the step plan
  const currentStepDescriptor = stepPlan[currentStep];
  const stepComponentMap = {
    identity: <IdentityStep form={form} isLoading={isLoading} />,
    credentials: <CredentialsStep form={form} isLoading={isLoading} />,
    studio: <StudioStep form={form} isLoading={isLoading} />,
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#050507] min-h-screen lg:h-screen overflow-x-hidden">
      {/* Left Column: Form */}
      <div className="flex-1 flex flex-col lg:overflow-y-auto px-6 py-20 lg:px-12 xl:px-16 relative z-10 scrollbar-hide">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg mx-auto my-auto"
        >
          {/* Header Component */}
          <Header isSetupMode={isSetupMode} isAuthenticated={isAuthenticated} />

          <div className="space-y-12 mt-14">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-10"
            >
              <div className="relative">
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <FieldGroup>
                      {currentStepDescriptor && stepComponentMap[currentStepDescriptor.id]}
                    </FieldGroup>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={isLoading}
                    className="flex-1 h-12 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    Back
                  </Button>
                )}

                {currentStep < totalSteps - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-12 rounded-xl bg-[#4F46E5] hover:bg-[#4338ca] text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {isSetupMode ? "Initialize Studio" : "Create account"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            {/* Google Authentication */}
            {!isAuthenticated && (
              <GoogleAuthButton
                isLoading={isGoogleLoading}
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              />
            )}
          </div>

          {/* Footer Component */}
          <Footer />
        </motion.div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-l from-transparent to-[#050507] z-10" />
        <img
          src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2574&auto=format&fit=crop"
          alt="Post Production Studio"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute bottom-16 right-16 z-20 text-right max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-[32px] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none relative z-10">
              {isSetupMode ? "Admin Control" : "Creative Freedom"}
            </h2>
            <div className="flex items-center justify-end gap-3 text-indigo-400 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Collaborate
              </span>
              <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Organize
              </span>
              <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Scale
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
