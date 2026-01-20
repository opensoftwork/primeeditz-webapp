"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";



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
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
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
          // Better Auth returns error in result object
          if (result.error.message?.includes("already exists")) {
            toast.error("An account with this email already exists.");
          } else {
            toast.error(result.error.message || "Failed to create account.");
          }
          setIsLoading(false);
          return;
        }

        // Only redirect if successful
        toast.success("Account created! Please complete your profile.");
        router.push("/onboarding");
      } catch (error: any) {
        // Fallback error handling
        console.error("Sign up error:", error);
        toast.error(error.message || "Failed to create account.");
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Enhanced Container with subtle glow */}
      <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-0 overflow-hidden rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/5">
        {/* Left Side: Form - 3 columns */}
        <div className="lg:col-span-3 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
            {/* Header with icon */}
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                Create your account
              </h1>
              <p className="text-muted-foreground text-base">
                Join PrimeEditz and transform your workflow
              </p>
            </div>

            {/* Google Sign-up Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-background/50 border-border/50 hover:bg-muted/50 hover:border-border transition-all duration-200 font-medium group"
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
                  Sign up with Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-4 text-muted-foreground">
                  Or sign up with email
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
                          className="text-sm font-medium"
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
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
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
                          className="text-sm font-medium"
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
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
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
                        className="text-sm font-medium"
                      >
                        Email address
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="you@company.com"
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
                  name="password"
                  children={(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-sm font-medium"
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
                        className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
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
                        className="text-sm font-medium"
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-4 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors group"
              >
                Sign in instead
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Enhanced Visual - 2 columns */}
        <div className="hidden lg:flex lg:col-span-2 flex-col justify-between bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 p-12 lg:p-16 border-l border-border/30 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Join 10,000+ creatives</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
              Everything you need to manage video projects
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Streamline collaboration, organize assets, and deliver projects on
              time.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 relative z-10">
            {[
              "Real-time team collaboration",
              "Smart asset organization",
              "Client review workflows",
              "Automated delivery tracking",
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-card/30 border border-border/30 backdrop-blur-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-sm text-foreground/90">{feature}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="relative z-10">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-xl">
              <p className="text-foreground/90 leading-relaxed italic text-sm mb-4">
                "A game changer for our post-production workflow. It brings
                clarity to chaos."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20" />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Alex Chen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creative Director
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
