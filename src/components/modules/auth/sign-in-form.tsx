"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "motion/react";
import { Label } from "@/components/ui/label";

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
      <div className="flex-1 flex items-center justify-center bg-[#050507]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            Loading Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#050507]">
      {/* Left Column: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto my-auto space-y-10"
        >
          {/* Header */}
          <div className="space-y-3 text-center lg:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 block">
              WELCOME BACK
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none">
              SIGN IN
            </h1>
            <p className="text-sm font-medium text-white/40 leading-relaxed max-w-[360px] mx-auto lg:mx-0">
              Access your studio dashboard and manage your creative production pipeline.
            </p>
          </div>

          <div className="space-y-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-[0.98] group"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center justify-center w-full">
                  <GoogleIcon className="mr-3 h-4 w-4" />
                  <span className="flex-1 text-center">Continue with Google</span>
                </div>
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[9px]">
                <span className="bg-[#050507] px-3 text-white/20 font-black uppercase">
                  OR
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
              <FieldGroup className="space-y-4">
                <form.Field
                  name="email"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1"
                      >
                        Email address
                      </Label>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="you@company.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-[#0A0A0C] border-white/5 text-white h-12 rounded-xl focus:ring-1 focus:ring-indigo-500/50 font-medium text-xs placeholder:text-white/10"
                        disabled={isLoading}
                      />
                      <FieldError errors={field.state.meta.errors} className="text-red-500/80 text-[10px] ml-1 mt-1 font-bold uppercase tracking-[0.05em]" />
                    </div>
                  )}
                />

                <form.Field
                  name="password"
                  children={(field) => (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor={field.name}
                          className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1"
                        >
                          Password
                        </Label>
                        <Link
                          href="/forgot-password"
                          className="text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors uppercase font-black"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <PasswordInput
                        id={field.name}
                        placeholder="••••••••"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-[#0A0A0C] border-white/5 text-white h-12 rounded-xl focus:ring-1 focus:ring-indigo-500/50 font-medium text-xs"
                        disabled={isLoading}
                      />
                      <FieldError errors={field.state.meta.errors} className="text-red-500/80 text-[10px] ml-1 mt-1 font-bold uppercase tracking-[0.05em]" />
                    </div>
                  )}
                />
              </FieldGroup>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#4F46E5] hover:bg-[#4338ca] text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] mt-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign in <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
                Account
              </h4>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-indigo-400 transition-colors group"
              >
                Create Account
                <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
                Support
              </h4>
              <p className="text-[9px] text-white/30 leading-relaxed font-medium">
                PrimeEditz Studio Help Center
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block lg:w-3/5 relative bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-l from-transparent to-[#050507] z-10" />
        <img
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop"
          alt="Post Production Studio"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute bottom-16 right-16 z-20 text-right max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3 leading-none">
              PrimeEditz Studio
            </h2>
            <div className="flex items-center justify-end gap-3 text-indigo-400/60">
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Edit
              </span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Grade
              </span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Deliver
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
