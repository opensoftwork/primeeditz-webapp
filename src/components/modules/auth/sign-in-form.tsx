"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const isFirstUser = useQuery(api.profiles.isFirstUser);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google.");
      setIsGoogleLoading(false);
    }
  };

  // Redirect to sign-up if it's the first time user
  useEffect(() => {
    if (isFirstUser === true) {
      router.push("/sign-up");
    }
  }, [isFirstUser, router]);

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
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });

        if (result.error) {
          toast.error(result.error.message || "Invalid email or password.");
          setIsLoading(false);
          return;
        }

        toast.success("Welcome back!");
        router.push("/dashboard");
      } catch (error: any) {
        console.error("Sign in error:", error);
        toast.error(error.message || "Failed to sign in.");
        setIsLoading(false);
      }
    },
  });

  if (isFirstUser === undefined || isFirstUser === true) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-linear-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-0 overflow-hidden rounded-[2.5rem] border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/5">
        {/* Left Side: Form */}
        <div className="lg:col-span-2 p-6 md:p-10 lg:p-12 flex flex-col justify-center relative">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-sm mx-auto space-y-6 relative z-10">
            {/* Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-black tracking-tight uppercase bg-linear-to-br from-foreground to-foreground/70 bg-clip-text">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Sign in to continue to your workspace
              </p>
            </div>

            {/* Google Sign-in Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-background/50 border-border/50 hover:bg-muted/50 hover:border-border transition-all duration-200 font-bold group rounded-lg"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <GoogleIcon className="mr-3 h-4 w-4" />
                  Continue with Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-background px-4 text-muted-foreground uppercase font-black tracking-widest">
                  Or continue with email
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <FieldGroup>
                <form.Field
                  name="email"
                  children={(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-[10px] font-black uppercase tracking-widest"
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
                        className="h-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
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
                          className="text-[10px] font-black uppercase tracking-widest"
                        >
                          Password
                        </FieldLabel>
                        <Link
                          href="/forgot-password"
                          className="text-[10px] text-primary hover:text-primary/80 transition-colors uppercase font-black"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <PasswordInput
                        id={field.name}
                        placeholder="••••••••"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        className="h-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                        disabled={isLoading}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/25 transition-all rounded-lg"
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

            <div className="text-center pt-2">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors group"
              >
                Create an account
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between bg-linear-to-br from-muted/50 via-muted/30 to-muted/50 p-8 lg:p-12 border-l border-border/30 relative overflow-hidden gap-3">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creative Production</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-foreground max-w-lg leading-tight">
              Streamline your workflow
            </h2>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed font-medium">
              Join thousands of professionals managing their projects with
              clarity and precision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="space-y-2 p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="w-4 h-4 rounded-md bg-primary/20" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-1">
                  Collaboration
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                  Work together seamlessly
                </p>
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="w-4 h-4 rounded-md bg-primary/20" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-1">
                  Organization
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                  Keep assets accessible
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-xl">
              <div className="space-y-3">
                <p className="text-foreground/90 leading-relaxed italic text-sm font-medium">
                  "PrimeEditz transformed how we manage our post-production
                  pipeline. A game changer."
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 border border-primary/20" />
                  <div>
                    <p className="font-black uppercase tracking-widest text-[10px] text-foreground">
                      Sarah Chen
                    </p>
                    <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">
                      Pixel Studios
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
