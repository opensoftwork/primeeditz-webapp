"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2, Sparkles, UserCircle, Shield } from "lucide-react";
import { useMutation, useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { api } from "@convex/_generated/api";

// Zod validation schema
const onboardingSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export default function OnboardingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const createProfile = useMutation(api.profiles.createProfile);
  const isFirstUser = useQuery(api.profiles.isFirstUser);
  const myProfile = useQuery(api.profiles.getMyProfile);

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

      // Validate with Zod
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
            ? "Welcome, Admin! You're the first user."
            : "Profile created! Welcome to PrimeEditz.";

        toast.success(roleMessage);
        router.push("/dashboard");
      } catch (error: any) {
        toast.error(error.message || "Failed to create profile.");
        setIsLoading(false);
      }
    },
  });

  // Show loading state while checking profile
  if (myProfile === undefined || isFirstUser === undefined) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const willBeAdmin = isFirstUser === true;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Enhanced Container */}
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/5">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Side: Form */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
              {/* Header with role badge */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                  {willBeAdmin ? (
                    <Shield className="w-7 h-7 text-primary" />
                  ) : (
                    <UserCircle className="w-7 h-7 text-primary" />
                  )}
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                    Complete your profile
                  </h1>
                  <p className="text-muted-foreground text-base">
                    {willBeAdmin
                      ? "You're the first user! You'll be assigned as Admin."
                      : "Tell us a bit about yourself to get started"}
                  </p>
                </div>

                {/* Role badge */}
                {willBeAdmin && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    <span>Admin Role</span>
                  </div>
                )}
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
                        <Input
                          id={field.name}
                          type="tel"
                          placeholder="+91 98765 43210"
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
                    name="company"
                    children={(field) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium"
                        >
                          Company name
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
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 p-12 lg:p-16 border-l border-border/30 relative overflow-hidden">
            {/* Decorative elements */}
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

            {/* Feature list */}
            <div className="space-y-4 relative z-10">
              {[
                "Manage video projects effortlessly",
                "Collaborate with your team in real-time",
                "Track progress and deliverables",
                "Streamline client communications",
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

            {/* Bottom decoration */}
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
