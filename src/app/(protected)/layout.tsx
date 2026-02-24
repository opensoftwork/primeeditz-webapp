"use client";

import { api } from "@convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { AppSidebar } from "@/components/modules/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { createPortal } from "react-dom";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";

interface DashboardLayoutProps {
  children: React.ReactNode;
  admin: React.ReactNode;
  studio: React.ReactNode;
  employee: React.ReactNode;
}

export default function DashboardLayout({
  children,
  admin,
  studio,
  employee,
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const router = useRouter();

  // Skip query if not authenticated - matches reference pattern
  const userProfile = useQuery(
    //@ts-ignore
    api.profiles.getMyProfile,
    isAuthenticated ? {} : "skip",
  );

  const pathname = usePathname();
  const { overrides } = useBreadcrumbStore();
  const isWizardPage =
    pathname?.includes("/projects/new") ||
    pathname?.includes("/quotations/new") ||
    pathname?.includes("/quotations/request") ||
    pathname?.includes("/onboarding") ||
    (pathname?.includes("/quotations/") && pathname?.includes("/builder")) ||
    pathname?.includes("/settings/service-packages/new") ||
    (pathname?.includes("/settings/service-packages/") &&
      pathname?.includes("/edit")) ||
    pathname?.includes("/settings/project-types/new") ||
    pathname?.includes("/preview");
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
      case "studio":
        return studio;
      case "employee":
        return employee;
      default:
        return null;
    }
  };

  if (isWizardPage) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        {renderRoleContent()}
      </div>
    );
  }

  const showGlobalHeader =
    (!isWizardPage && !pathname?.includes("/settings/service-packages/")) ||
    (pathname?.includes("/settings/service-packages/") &&
      !pathname?.includes("/new") &&
      !pathname?.includes("/edit"));

  // Simplification: We want the sidebar for everyone except wizard pages
  // We want the global header for everyone except wizard pages and editors
  const isEditorPage =
    pathname?.includes("/settings/service-packages/") &&
    pathname?.includes("/edit");

  return (
    <SidebarProvider>
      {!isWizardPage && <AppSidebar />}
      <SidebarInset>
        {!isWizardPage && !isEditorPage && (
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

                        // Determine label with role-aware defaults
                        let label = overrides[segment];
                        if (!label) {
                          if (segment === "projects") {
                            label =
                              userProfile?.role === "admin"
                                ? "All Projects"
                                : userProfile?.role === "studio"
                                  ? "My Projects"
                                  : "Projects";
                          } else if (segment === "clients") {
                            label = "Studios";
                          } else if (segment === "assigned-work") {
                            label = "Assigned Work";
                          } else {
                            label = segment
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ");
                          }
                        }

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
          </header>
        )}
        <div
          id="layout-main-content"
          className="flex flex-1 flex-col overflow-y-auto scrollbar-hide"
        >
          {renderRoleContent()}
        </div>

        {/* Global Footer Area - For Sticky Pagination / Portals */}
        <div
          id="layout-sticky-footer"
          className="shrink-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 empty:hidden"
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
