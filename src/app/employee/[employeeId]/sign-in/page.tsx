"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { motion } from "motion/react";
import { Loader2, UserCheck, AlertCircle, ArrowRight, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

// Google Icon Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function EmployeeSignInPage() {
  const params = useParams();
  const employeeId = params.employeeId as Id<"profiles">;
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Fetch employee profile to verify it exists and get their name (public query)
  const employee = useQuery(api.employees.getEmployeeForOnboarding, { employeeId });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Sign in with Google and redirect to dashboard
      // The auth system will need to link this to the employee profile
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `/dashboard?onboarding=employee&profileId=${employeeId}`,
      });
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google.");
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setIsLoading(true);
    try {
      // Try to sign in first
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: `/dashboard?onboarding=employee&profileId=${employeeId}`,
      });

      if (result.error) {
        // If sign in fails, try to sign up (assuming they are creating their account)
        const signUpResult = await authClient.signUp.email({
          email,
          password,
          name: employee?.employee.name || "Employee",
          callbackURL: `/dashboard?onboarding=employee&profileId=${employeeId}`,
        });

        if (signUpResult.error) {
          throw new Error(signUpResult.error.message || "Authentication failed");
        }
        
        toast.success("Account created! Redirecting...");
      } else {
        toast.success("Signed in successfully! Redirecting...");
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      toast.error(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (employee === undefined) {
    return (
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Employee not found
  if (employee === null) {
    return (
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
            Invalid Link
          </h2>
          <p className="text-white/50 max-w-md mx-auto">
            This onboarding link is invalid or has expired. Please contact your
            administrator for a new invitation.
          </p>
        </motion.div>
      </div>
    );
  }

  const isAlreadyOnboarded = employee.employee.onboardingComplete;

  // Main onboarding view
  return (
    <div className="max-w-2xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Welcome Card */}
        <div className="rounded-[2rem] border border-indigo-500/20 bg-indigo-500/5 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -translate-x-32 translate-y-32" />
          
          <div className="relative z-10 w-full max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-indigo-400" />
            </div>
            
            <div className="space-y-3 mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60">
                {isAlreadyOnboarded ? "Welcome Back" : "Welcome to the Team"}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                Hello, {employee.employee.name}!
              </h1>
              <p className="text-white/50 max-w-md mx-auto">
                {isAlreadyOnboarded 
                  ? "Sign in to access your projects and task dashboard."
                  : "You've been invited to join PrimeEditz as a team member. Complete your registration to start collaborating."}
              </p>
            </div>

            {/* Employee Info */}
            <div className="bg-black/20 rounded-2xl border border-white/5 p-6 mb-8 text-left space-y-3">
              {employee.employee.designation && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Designation
                  </span>
                  <span className="text-sm font-bold text-indigo-400">
                    {employee.employee.designation}
                  </span>
                </div>
              )}
              {employee.employee.company && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Company
                  </span>
                  <span className="text-sm font-bold text-white/70">
                    {employee.employee.company}
                  </span>
                </div>
              )}
              {employee.employee.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Phone
                  </span>
                  <span className="text-sm font-mono text-white/60">
                    {employee.employee.phone}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-white text-zinc-900 font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/20 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <GoogleIcon className="mr-3 h-5 w-5" />
                    Continue with Google
                    <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-[#0c0c0e] px-4 text-white/20 font-black uppercase tracking-widest">
                    OR
                  </span>
                </div>
              </div>

              {/* Email Sign In Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                    Work Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-indigo-500/20 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                    Password
                  </Label>
                  <PasswordInput
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-indigo-500/20 font-bold"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full h-12 rounded-xl bg-indigo-500 text-white font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/10"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isAlreadyOnboarded ? "Sign In to Portal" : "Complete Registration"
                  )}
                </Button>
              </form>
            </div>

            <p className="text-[10px] text-white/30 mt-4 max-w-xs mx-auto">
              By continuing, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/2 p-6 space-y-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              What you'll get
            </h3>
            <ul className="text-xs text-white/50 space-y-1.5">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Access to assigned projects
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Task management dashboard
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                File upload & management
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/2 p-6 space-y-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Need help?
            </h3>
            <p className="text-xs text-white/50">
              Contact your administrator if you're having trouble completing your
              registration or if this invitation was sent to you by mistake.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
