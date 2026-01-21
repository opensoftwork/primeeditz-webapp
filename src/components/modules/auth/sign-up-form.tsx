"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import {
  Loader2,
  ArrowRight,
  Sparkles,
  Shield,
  Crown,
  CheckCircle2,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "motion/react";

import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

// Google Icon Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// Zod validation schema
const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const isFirstUser = useQuery(api.profiles.isFirstUser);
  console.log(isFirstUser);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
      });
    } catch (error: any) {
      console.error("Google sign up error:", error);
      toast.error(error.message || "Failed to sign up with Google.");
      setIsGoogleLoading(false);
    }
  };

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        const result = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: `${value.firstName} ${value.lastName}`,
          image: undefined,
        });

        // Check if sign-up was successful
        if (result.error) {
          if (result.error.message?.includes("already exists")) {
            toast.error("An account with this email already exists.");
          } else {
            toast.error(result.error.message || "Failed to create account.");
          }
          setIsLoading(false);
          return;
        }

        toast.success(
          isFirstUser
            ? "Admin account created! Setting up studio..."
            : "Account created! Please complete your profile.",
        );
        router.push("/onboarding");
      } catch (error: any) {
        console.error("Sign up error:", error);
        toast.error(error.message || "Failed to create account.");
        setIsLoading(false);
      }
    },
  });

  if (isFirstUser === undefined) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSetupMode = isFirstUser === true;

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 ${isSetupMode ? "bg-zinc-950" : "bg-linear-to-br from-background via-muted/20 to-background"}`}
    >
      {/* Background Effects for Setup Mode */}
      {isSetupMode && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none" />
        </>
      )}

      <div
        className={`w-full max-w-5xl grid lg:grid-cols-5 gap-0 overflow-hidden rounded-[2.5rem] border ${isSetupMode ? "border-white/5 bg-white/2 backdrop-blur-3xl" : "border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/5"}`}
      >
        {/* Left Side: Form */}
        <div className="lg:col-span-3 p-6 md:p-10 lg:p-12 flex flex-col justify-center relative">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-sm mx-auto space-y-6 relative z-10">
            {/* Admin Badge */}
            {isSetupMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest mb-4"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Initial Admin Setup</span>
              </motion.div>
            )}

            {/* Header */}
            <div className="space-y-3">
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${isSetupMode ? "bg-primary/20 border border-primary/30" : "bg-primary/10 border border-primary/20"} mb-4`}
              >
                {isSetupMode ? (
                  <Shield className="w-7 h-7 text-primary" />
                ) : (
                  <Sparkles className="w-7 h-7 text-primary" />
                )}
              </div>
              <h1
                className={`text-3xl font-black tracking-tight uppercase ${isSetupMode ? "text-white" : "bg-linear-to-br from-foreground to-foreground/70 bg-clip-text"}`}
              >
                {isSetupMode ? "Setup Studio" : "Create Account"}
              </h1>
              <p
                className={`${isSetupMode ? "text-white/40" : "text-muted-foreground"} text-base font-medium`}
              >
                {isSetupMode
                  ? "Create the master admin account to initialize PrimeEditz."
                  : "Join PrimeEditz and transform your workflow"}
              </p>
            </div>

            {/* Google Sign-up Button */}
            <Button
              type="button"
              variant="outline"
              className={`w-full h-12 ${isSetupMode ? "bg-white/5 border-white/5 hover:bg-white/10 text-white rounded-xl" : "bg-background/50 border-border/50 hover:bg-muted/50 hover:border-border rounded-xl"} transition-all duration-200 font-bold group`}
              onClick={handleGoogleSignUp}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <GoogleIcon className="mr-3 h-5 w-5" />
                  {isSetupMode
                    ? "Initialize with Google"
                    : "Sign up with Google"}
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div
                  className={`w-full border-t ${isSetupMode ? "border-white/5" : "border-border/50"}`}
                />
              </div>
              <div className="relative flex justify-center text-xs">
                <span
                  className={`${isSetupMode ? "bg-zinc-950 px-4 text-white/20" : "bg-background px-4 text-muted-foreground"} uppercase font-black tracking-widest`}
                >
                  Or use email
                </span>
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
                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="firstName"
                    children={(field) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className={`text-xs font-black uppercase tracking-widest ${isSetupMode ? "text-white/40" : ""}`}
                        >
                          First name
                        </FieldLabel>
                        <Input
                          id={field.name}
                          placeholder="John"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.handleChange(e.target.value)
                          }
                          className={`h-11 ${isSetupMode ? "bg-white/5 border-white/5 text-white placeholder:text-white/20 rounded-xl" : "bg-background/50 border-border/50 focus:border-primary/50"}`}
                          disabled={isLoading}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                  <form.Field
                    name="lastName"
                    children={(field) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className={`text-xs font-black uppercase tracking-widest ${isSetupMode ? "text-white/40" : ""}`}
                        >
                          Last name
                        </FieldLabel>
                        <Input
                          id={field.name}
                          placeholder="Doe"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.handleChange(e.target.value)
                          }
                          className={`h-11 ${isSetupMode ? "bg-white/5 border-white/5 text-white placeholder:text-white/20 rounded-xl" : "bg-background/50 border-border/50 focus:border-primary/50"}`}
                          disabled={isLoading}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </div>

                <form.Field
                  name="email"
                  children={(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className={`text-xs font-black uppercase tracking-widest ${isSetupMode ? "text-white/40" : ""}`}
                      >
                        Email address
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="admin@primeeditz.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        className={`h-12 ${isSetupMode ? "bg-white/5 border-white/5 text-white placeholder:text-white/20 rounded-xl" : "bg-background/50 border-border/50 focus:border-primary/50"}`}
                        disabled={isLoading}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="password"
                  children={(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className={`text-xs font-black uppercase tracking-widest ${isSetupMode ? "text-white/40" : ""}`}
                      >
                        Password
                      </FieldLabel>
                      <PasswordInput
                        id={field.name}
                        placeholder="Create a strong password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        className={`h-12 ${isSetupMode ? "bg-white/5 border-white/5 text-white placeholder:text-white/20 rounded-xl" : "bg-background/50 border-border/50 focus:border-primary/50"}`}
                        disabled={isLoading}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="confirmPassword"
                  children={(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className={`text-xs font-black uppercase tracking-widest ${isSetupMode ? "text-white/40" : ""}`}
                      >
                        Confirm password
                      </FieldLabel>
                      <PasswordInput
                        id={field.name}
                        placeholder="Confirm your password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        className={`h-12 ${isSetupMode ? "bg-white/5 border-white/5 text-white placeholder:text-white/20 rounded-xl" : "bg-background/50 border-border/50 focus:border-primary/50"}`}
                        disabled={isLoading}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                type="submit"
                className={`w-full h-12 font-black uppercase tracking-widest text-sm shadow-xl transition-all ${isSetupMode ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 rounded-xl" : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 rounded-xl"}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    {isSetupMode ? "Initialize Studio" : "Create account"}{" "}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <Link
                href="/sign-in"
                className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${isSetupMode ? "text-white/40 hover:text-white" : "text-foreground hover:text-primary"} transition-colors group`}
              >
                Sign in instead
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div
          className={`hidden lg:flex lg:col-span-2 flex-col justify-between p-8 lg:p-12 border-l relative overflow-hidden ${isSetupMode ? "bg-zinc-900/50 border-white/5" : "bg-linear-to-br from-muted/50 via-muted/30 to-muted/50 border-border/30"}`}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isSetupMode ? "bg-primary/10 border border-primary/20 text-primary" : "bg-primary/10 border border-primary/20 text-primary"} text-sm font-bold uppercase tracking-wider`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSetupMode ? "Step 1 of Setup" : "Join the studio"}</span>
            </div>
            <h2
              className={`text-2xl font-black uppercase tracking-tight leading-tight ${isSetupMode ? "text-white" : "text-foreground"}`}
            >
              {isSetupMode ? "Production Empire" : "Professional Management"}
            </h2>
            <p
              className={`${isSetupMode ? "text-white/40" : "text-muted-foreground"} leading-relaxed font-medium`}
            >
              {isSetupMode
                ? "Setup the master control center for your editing services and client collaborations."
                : "Streamline collaboration, organize assets, and deliver projects on time."}
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            {(isSetupMode
              ? [
                  "Master Admin Control",
                  "B2B Rate Card Integration",
                  "Custom Workflow Engine",
                  "Scaleable Cloud Storage",
                ]
              : [
                  "Real-time team collaboration",
                  "Smart asset organization",
                  "Client review workflows",
                  "Automated delivery tracking",
                ]
            ).map((feature, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-sm ${isSetupMode ? "bg-white/5 border-white/5" : "bg-card/30 border-border/30"}`}
              >
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span
                  className={`text-sm font-bold uppercase tracking-wider ${isSetupMode ? "text-white/60" : "text-foreground/90"}`}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-10">
            <div
              className={`rounded-3xl border p-6 shadow-xl ${isSetupMode ? "bg-white/2 border-white/5" : "bg-card/50 border-border/50 backdrop-blur-sm"}`}
            >
              <p
                className={`italic text-sm mb-4 font-medium ${isSetupMode ? "text-white/60" : "text-foreground/90"}`}
              >
                {isSetupMode
                  ? "The foundation for your digital production house starts here."
                  : '"A game changer for our post-production workflow. It brings clarity to chaos."'}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 border ${isSetupMode ? "border-primary/30" : "border-primary/20"}`}
                />
                <div>
                  <p
                    className={`font-black uppercase tracking-widest text-xs ${isSetupMode ? "text-white" : "text-foreground"}`}
                  >
                    {isSetupMode ? "PRIME EDITZ" : "Alex Chen"}
                  </p>
                  <p
                    className={`text-[10px] uppercase font-black tracking-widest ${isSetupMode ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {isSetupMode ? "SYSTEM CORE" : "Creative Director"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
