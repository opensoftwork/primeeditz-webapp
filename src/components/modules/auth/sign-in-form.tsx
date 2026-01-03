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

// Zod validation schema
const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });
        toast.success("Welcome back!");
        router.push("/dashboard");
      } catch (error: any) {
        if (error.message?.includes("Invalid")) {
          toast.error("Invalid email or password.");
        } else {
          toast.error(error.message || "Failed to sign in.");
        }
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Enhanced Container with subtle glow */}
      <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-0 overflow-hidden rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/5">
        {/* Left Side: Form - 2 columns */}
        <div className="lg:col-span-2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-sm mx-auto space-y-8 relative z-10">
            {/* Header with icon */}
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-base">
                Sign in to continue to your workspace
              </p>
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
                      <div className="flex items-center justify-between">
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium"
                        >
                          Password
                        </FieldLabel>
                        <Link
                          href="/forgot-password"
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <PasswordInput
                        id={field.name}
                        placeholder="Enter your password"
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="ml-2 h-4 w-4" />
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
                  New to PrimeEditz?
                </span>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors group"
              >
                Create an account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Enhanced Visual - 3 columns */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 p-12 lg:p-16 border-l border-border/30 relative overflow-hidden gap-3">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by creative teams</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground max-w-lg leading-tight">
              Streamline your video production workflow
            </h2>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              Join thousands of creative professionals managing their projects
              with clarity and precision.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="space-y-3 p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <div className="w-5 h-5 rounded-lg bg-primary/20" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Real-time Collaboration
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Work together seamlessly with your team
                </p>
              </div>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <div className="w-5 h-5 rounded-lg bg-primary/20" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Smart Organization
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Keep all your assets organized and accessible
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="relative z-10">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-xl">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-primary/20"
                    />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed italic text-lg">
                  "PrimeEditz transformed how we manage our post-production
                  pipeline. It's an absolute game changer."
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20" />
                  <div>
                    <p className="font-semibold text-foreground">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">
                      Creative Director, Pixel Studios
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
