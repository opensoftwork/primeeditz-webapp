"use client";

import React from "react";
import Link from "next/link";
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
  const { isAuthenticated } = useConvexAuth();

  // Skip query if not authenticated - matches reference pattern
  const userProfile = useQuery(
    api.profiles.getMyProfile,
    isAuthenticated ? {} : "skip"
  );

  const pathname = usePathname();
  const isWizardPage = pathname?.includes("/projects/new");

  // Show loading state while profile is being fetched
  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-muted-foreground animate-pulse font-medium">
          Loading your dashboard...
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
                        (segment) => segment !== "" && segment !== "dashboard"
                      )
                      .map((segment, index, array) => {
                        const isLast = index === array.length - 1;
                        const href = `/${array.slice(0, index + 1).join("/")}`;
                        const label =
                          segment.charAt(0).toUpperCase() +
                          segment.slice(1).replace(/-/g, " ");

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
              <div className="hidden md:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium leading-none">
                    {userProfile.name}
                  </span>
                  <span className="mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize">
                    {userProfile.role}
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-sm font-semibold">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
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
