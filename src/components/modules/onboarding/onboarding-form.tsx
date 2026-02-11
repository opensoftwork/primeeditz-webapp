"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Crown,
  Loader2,
  Shield,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { isValidPhoneNumber, PhoneInput } from "@/components/ui/phone-input";

// Zod validation schema
const onboardingSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || isValidPhoneNumber(val), {
      message: "Phone number must be 10 digits",
    }),
  company: z.string().optional(),
});

export default function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const createProfile = useMutation(api.profiles.createProfile);
  const claimProfile = useMutation(api.profiles.claimDraftProfile);
  const isFirstUser = useQuery(api.profiles.isFirstUser);
  const myProfile = useQuery(api.profiles.getMyProfile);

  const profileId = searchParams.get("profileId");

  // Handle automatic profile claiming if profileId is present
  useEffect(() => {
    const autoClaim = async () => {
      if (profileId && myProfile === null && !isClaiming && !claimError) {
        setIsClaiming(true);
        try {
          await claimProfile({ profileId: profileId as Id<"profiles"> });
          toast.success("Profile linked successfully!");
          router.push("/dashboard");
        } catch (error: any) {
          console.error("Failed to claim profile:", error);
          const message =
            error.data || error.message || "Failed to link profile.";
          setClaimError(message);
          toast.error(message);
        } finally {
          setIsClaiming(false);
        }
      }
    };
    autoClaim();
  }, [profileId, myProfile, claimProfile, router, isClaiming, claimError]);

  // Redirect if profile already exists
  useEffect(() => {
    if (myProfile) {
      router.push("/dashboard");
    }
  }, [myProfile, router]);

  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      company: "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      const validation = onboardingSchema.safeParse(value);
      if (!validation.success) {
        toast.error(validation.error.issues[0].message);
        setIsLoading(false);
        return;
      }

      try {
        const result = await createProfile({
          name: value.name,
          phone: value.phone || undefined,
          company: value.company || undefined,
        });

        const roleMessage =
          result.role === "admin"
            ? "Welcome, Admin! Your studio is ready."
            : result.role === "studio"
              ? "Welcome! Your studio profile is ready."
              : "Profile created! Welcome to PrimeEditz.";

        toast.success(roleMessage);
        router.push("/dashboard");
      } catch (error: any) {
        const message =
          error.data || error.message || "Failed to create profile.";
        toast.error(message);
        setIsLoading(false);
      }
    },
  });

  // Show loading state while checking profile
  if (myProfile === undefined || isFirstUser === undefined) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-white/40">Loading...</p>
        </div>
      </div>
    );
  }

  const willBeAdmin = isFirstUser === true;

  // Show specialized setup state for employees/studios claiming a draft profile
  if (profileId && !myProfile) {
    if (claimError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-10 rounded-[2.5rem] border border-red-500/20 bg-red-500/5 backdrop-blur-3xl text-center space-y-8"
          >
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Claim Failed
              </h2>
              <p className="text-white/60 text-sm font-medium leading-relaxed">
                {claimError}
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => {
                  setClaimError(null);
                  setIsClaiming(false);
                }}
                className="w-full h-12 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/90 transition-all"
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  // Remove profileId from URL and proceed with fresh onboarding
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("profileId");
                  router.push(`/onboarding?${params.toString()}`);
                }}
                className="w-full h-12 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px]"
              >
                Create Fresh Profile
              </Button>
            </div>

            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] leading-relaxed">
              If this profile belongs to a different email address, please sign
              out and sign in with the correct account.
            </p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-12 rounded-[2.5rem] border border-white/5 bg-white/2 backdrop-blur-3xl text-center space-y-6"
        >
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Setting up your account
            </h2>
            <p className="text-white/40 text-sm font-medium">
              We're linking your credentials to your new team profile. This will
              only take a moment...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================================================
  // FIRST USER (ADMIN) - Premium Setup Experience
  // ==========================================================================
  if (willBeAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[128px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Admin Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-amber-500/10 to-primary/10 border border-amber-500/20">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                Admin Setup
              </span>
            </div>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-10 rounded-[2.5rem] border border-white/5 bg-white/2 backdrop-blur-3xl space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-primary/20 to-amber-500/10 border border-primary/20">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                  Welcome to PrimeEditz
                </h1>
                <p className="text-white/40 text-sm font-medium max-w-sm mx-auto">
                  You're setting up the studio! As the first user, you'll have
                  full admin access.
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <FieldGroup>
                <form.Field
                  name="name"
                  children={(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-xs font-black uppercase tracking-widest text-white/40"
                      >
                        Your Name *
                      </FieldLabel>
                      <Input
                        id={field.name}
                        placeholder="Enter your full name"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        className="h-14 bg-white/5 border-white/5 rounded-2xl px-5 text-white font-medium placeholder:text-white/20 focus:border-primary/30 focus:bg-white/[0.07] transition-all"
                        disabled={isLoading}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="phone"
                  children={(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-xs font-black uppercase tracking-widest text-white/40"
                      >
                        Phone Number
                      </FieldLabel>
                      <PhoneInput
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(value) => field.handleChange(value)}
                        placeholder="98765 43210"
                        disabled={isLoading}
                        className="w-full"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="company"
                  children={(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-xs font-black uppercase tracking-widest text-white/40"
                      >
                        Studio / Company Name
                      </FieldLabel>
                      <Input
                        id={field.name}
                        placeholder="Prime Editz Studio"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        className="h-14 bg-white/5 border-white/5 rounded-2xl px-5 text-white font-medium placeholder:text-white/20 focus:border-primary/30 focus:bg-white/[0.07] transition-all"
                        disabled={isLoading}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                type="submit"
                className="w-full h-14 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Setting up studio...
                  </>
                ) : (
                  <>
                    Initialize Studio
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Features Preview */}
            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">
                What you'll unlock
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Manage Clients",
                  "Create Quotations",
                  "Track Projects",
                  "Assign Team Members",
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-white/40 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary/60" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ==========================================================================
  // REGULAR USER (CLIENT) - Standard Onboarding
  // ==========================================================================
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-linear-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/5">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Side: Form */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
              {/* Header */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                  <UserCircle className="w-7 h-7 text-primary" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text">
                    Complete your profile
                  </h1>
                  <p className="text-muted-foreground text-base">
                    Tell us a bit about yourself to get started
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="space-y-6"
              >
                <FieldGroup>
                  <form.Field
                    name="name"
                    children={(field) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium"
                        >
                          Full name *
                        </FieldLabel>
                        <Input
                          id={field.name}
                          placeholder="John Doe"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.handleChange(e.target.value)
                          }
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                          disabled={isLoading}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />

                  <form.Field
                    name="phone"
                    children={(field) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium"
                        >
                          Phone number
                        </FieldLabel>
                        <PhoneInput
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(value) => field.handleChange(value)}
                          placeholder="98765 43210"
                          disabled={isLoading}
                          className="w-full"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />

                  <form.Field
                    name="company"
                    children={(field) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium"
                        >
                          Studio / Company name
                        </FieldLabel>
                        <Input
                          id={field.name}
                          placeholder="Acme Studios"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.handleChange(e.target.value)
                          }
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                          disabled={isLoading}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </FieldGroup>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating profile...
                    </>
                  ) : (
                    <>
                      Complete setup <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Right Side: Visual */}
          <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-muted/50 via-muted/30 to-muted/50 p-12 lg:p-16 border-l border-border/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Almost there!</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
                One last step before you begin
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Complete your profile to unlock the full PrimeEditz experience.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              {[
                "Track your project progress",
                "Receive real-time updates",
                "Download your deliverables",
                "Communicate with the team",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card/30 border border-border/30 backdrop-blur-sm"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm text-foreground/90">{feature}</span>
                </div>
              ))}
            </div>

            <div className="relative z-10">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-xl">
                <p className="text-foreground/90 leading-relaxed text-sm">
                  Your workspace is ready. Let's get you set up and start
                  creating amazing content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
