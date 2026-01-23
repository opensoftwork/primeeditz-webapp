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
import {
  getNavItemsForRole,
  commonNavGroup,
  type NavItem,
  type NavGroup,
} from "./navigation-config";

// Type guard for NavGroup
function isNavGroup(item: any): item is NavGroup {
  return item && typeof item === "object" && "label" in item && "items" in item;
}

function isNavGroupArray(items: (NavItem | NavGroup)[]): items is NavGroup[] {
  return Array.isArray(items) && items.length > 0 && isNavGroup(items[0]);
}

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
    <Sidebar
      collapsible="icon"
      className="border-r-white/5 bg-background/50 backdrop-blur-3xl"
    >
      <SidebarBrand />

      <SidebarContent>
        {isLoading ? (
          // Inline skeleton while loading
          <SidebarGroup className="px-4 group-data-[collapsible=icon]:px-0">
            <div className="h-4 w-24 bg-white/5 rounded-full mb-6 animate-pulse group-data-[collapsible=icon]:hidden" />
            <SidebarMenu className="gap-2">
              {[1, 2, 3, 4].map((i) => (
                <SidebarMenuItem key={i} className="flex justify-center">
                  <div className="flex items-center gap-3 px-3 py-4 rounded-xl border border-white/5 bg-white/2 animate-pulse group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
                    <div className="size-6 rounded-lg bg-white/5 shrink-0 group-data-[collapsible=icon]:size-6" />
                    <div className="h-4 flex-1 bg-white/5 rounded-md group-data-[collapsible=icon]:hidden" />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          <>
            {/* Role-specific Navigation */}
            {isNavGroupArray(mainNavItems) ? (
              mainNavItems.map((group) => (
                <SidebarNavGroup
                  key={group.label}
                  label={group.label}
                  items={group.items}
                />
              ))
            ) : (
              <SidebarNavGroup
                label="Navigation"
                items={mainNavItems as NavItem[]}
              />
            )}

            {/* System/Settings - Only for non-admins (Admins have it in Configuration group) */}
            {profile?.role !== "admin" && (
              <SidebarNavGroup
                label={commonNavGroup.label}
                items={commonNavGroup.items}
              />
            )}
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
