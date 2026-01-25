"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/modules/sidebar";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { UserNav } from "@/components/modules/header/user-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  admin: React.ReactNode;
  client: React.ReactNode;
  employee: React.ReactNode;
}

export default function DashboardLayout({
  children,
  admin,
  client,
  employee,
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const router = useRouter();

  // Skip query if not authenticated - matches reference pattern
  const userProfile = useQuery(
    api.profiles.getMyProfile,
    isAuthenticated ? {} : "skip",
  );

  const pathname = usePathname();
  const { overrides } = useBreadcrumbStore();
  const isWizardPage =
    pathname?.includes("/projects/new") || pathname?.includes("/preview");
  const isOnboardingPage = pathname === "/onboarding";

  // Redirect to onboarding or sign-in based on auth state
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      const signInUrl = new URL("/sign-in", window.location.origin);
      signInUrl.searchParams.set("redirect", pathname + window.location.search);
      router.push(signInUrl.pathname + signInUrl.search);
      return;
    }

    if (userProfile === null && !isOnboardingPage) {
      const searchParams = window.location.search;
      router.push(`/onboarding${searchParams}`);
    }
  }, [
    isAuthLoading,
    isAuthenticated,
    userProfile,
    isOnboardingPage,
    router,
    pathname,
  ]);

  // Show loading state while auth is loading OR (authenticated AND profile is loading)
  if (isAuthLoading || (isAuthenticated && userProfile === undefined)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-muted-foreground animate-pulse font-medium">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  // If not authenticated, the useEffect will handle redirection
  // We return null to prevent rendering protected content while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // If we are on the onboarding page, allow rendering children ONLY IF authenticated
  if (isOnboardingPage) {
    // If user already has a profile, don't show onboarding, redirect handled by useEffect
    if (userProfile) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg text-muted-foreground animate-pulse font-medium">
            Redirecting to dashboard...
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Redirect to onboarding if no profile exists (handled by useEffect above)
  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-muted-foreground animate-pulse font-medium">
          Redirecting to onboarding...
        </div>
      </div>
    );
  }

  // Render role-specific dashboard with sidebar
  const renderRoleContent = () => {
    switch (userProfile.role) {
      case "admin":
        return admin;
      case "client":
      case "studio":
        return client;
      case "employee":
        return employee;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      {!isWizardPage && <AppSidebar />}
      <SidebarInset>
        {!isWizardPage && (
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathname !== "/dashboard" && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    {pathname
                      .split("/")
                      .filter(
                        (segment) => segment !== "" && segment !== "dashboard",
                      )
                      .map((segment, index, array) => {
                        const isLast = index === array.length - 1;
                        const href = `/${array.slice(0, index + 1).join("/")}`;
                        const label =
                          overrides[segment] ||
                          segment
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ");

                        return (
                          <React.Fragment key={href}>
                            <BreadcrumbItem>
                              {isLast ? (
                                <BreadcrumbPage>{label}</BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink asChild>
                                  <Link href={href}>{label}</Link>
                                </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                          </React.Fragment>
                        );
                      })}
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>

            {/* Right side - Polished user info */}
            <div className="ml-auto flex items-center gap-3">
              <UserNav
                user={{
                  name: userProfile.name,
                  email: userProfile.email,
                  role: userProfile.role,
                  image: userProfile.image,
                }}
              />
            </div>
          </header>
        )}
        <div className="flex flex-1 flex-col overflow-hidden">
          {renderRoleContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
