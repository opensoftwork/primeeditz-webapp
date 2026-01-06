"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@convex/_generated/api";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Only query profile if authenticated
  const userProfile = useQuery(
    api.profiles.getMyProfile,
    isAuthenticated ? {} : "skip"
  );

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  // Redirect to onboarding if user has no profile (unless already on onboarding)
  useEffect(() => {
    if (
      isAuthenticated &&
      userProfile === null &&
      !pathname.includes("/onboarding")
    ) {
      router.push("/onboarding");
    }
  }, [isAuthenticated, userProfile, pathname, router]);

  // Redirect away from onboarding if user already has a profile
  useEffect(() => {
    if (
      isAuthenticated &&
      userProfile !== null &&
      userProfile !== undefined &&
      pathname.includes("/onboarding")
    ) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, userProfile, pathname, router]);

  // Show loading state while auth or profile is loading
  if (isLoading || (isAuthenticated && userProfile === undefined)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // CRITICAL FIX: Don't render children if user needs onboarding
  // This prevents flash of dashboard before redirect
  const isOnboardingPage = pathname.includes("/onboarding");

  if (userProfile === null && !isOnboardingPage) {
    // User has no profile and not on onboarding page - show loading while redirecting
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Setting up your account...
          </p>
        </div>
      </div>
    );
  }

  if (userProfile !== null && isOnboardingPage) {
    // User has profile but on onboarding - show loading while redirecting
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Only render children when user is in the correct place
  return <>{children}</>;
}
