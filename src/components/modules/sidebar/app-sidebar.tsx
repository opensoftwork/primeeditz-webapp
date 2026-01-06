"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNavGroup } from "./sidebar-nav-group";
import { SidebarUserMenu } from "./sidebar-user-menu";
import { getNavItemsForRole, commonNavItems } from "./navigation-config";

export function AppSidebar() {
  // Fetch current user's profile
  const profile = useQuery(api.profiles.getMyProfile);

  // Build navigation items based on role
  const mainNavItems = useMemo(() => {
    if (!profile) return [];
    return getNavItemsForRole(profile.role);
  }, [profile]);

  // Get user display info
  const displayName = profile?.name || "User";
  const displayRole = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "User";

  // Check if loading
  const isLoading = profile === undefined;

  return (
    <Sidebar collapsible="icon">
      <SidebarBrand />

      <SidebarContent>
        {isLoading ? (
          // Inline skeleton while loading
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[1, 2, 3].map((i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton disabled>
                      <Skeleton className="size-4 shrink-0" />
                      <Skeleton className="h-4 flex-1" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            {/* Main Navigation - Role-specific */}
            <SidebarNavGroup label="Navigation" items={mainNavItems} />

            {/* System/Settings - Common for all roles */}
            <SidebarNavGroup label="System" items={commonNavItems} />
          </>
        )}
      </SidebarContent>

      <SidebarUserMenu
        userName={displayName}
        userRole={displayRole}
        isLoading={isLoading}
      />

      <SidebarRail />
    </Sidebar>
  );
}
