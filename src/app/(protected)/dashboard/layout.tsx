"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/modules/sidebar";
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

  // Show loading state while profile is being fetched
  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading your dashboard...</div>
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
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Home</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {renderRoleContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
