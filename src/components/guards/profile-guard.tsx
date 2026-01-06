"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const profile = useQuery(api.profiles.getMyProfile);

  useEffect(() => {
    if (profile === undefined) {
      // Still loading, do nothing
      return;
    }

    const isOnboardingPage = pathname === "/onboarding";

    if (profile === null && !isOnboardingPage) {
      // No profile and not on onboarding -> redirect to onboarding
      router.push("/onboarding");
    } else if (profile !== null && isOnboardingPage) {
      // Has profile but on onboarding -> redirect to dashboard
      router.push("/dashboard");
    }
  }, [profile, pathname, router]);

  // Show loading state while profile is being fetched
  if (profile === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
