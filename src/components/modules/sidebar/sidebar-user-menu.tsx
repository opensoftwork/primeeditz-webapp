"use client";

import { User2, ChevronUp, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarUserMenuProps {
  userName: string;
  userRole: string;
  isLoading?: boolean;
}

export function SidebarUserMenu({
  userName,
  userRole,
  isLoading = false,
}: SidebarUserMenuProps) {
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            // Full page reload to clear all state
            window.location.href = "/sign-in";
          },
          onError: (ctx) => {
            setIsSignOutLoading(false);
            toast.error(ctx.error.message || "Failed to sign out");
          }
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
      setIsSignOutLoading(false);
    }
  };

  return (
    <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:pb-8 transition-all duration-300">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-14 rounded-xl border border-white/5 bg-white/2 px-3 transition-all duration-300 hover:bg-white/5 hover:border-white/10 data-[state=open]:bg-white/5 shadow-sm group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
              >
                {isLoading ? (
                  <>
                    <Skeleton className="size-10 rounded-lg shrink-0 group-data-[collapsible=icon]:size-10" />
                    <div className="grid flex-1 text-left text-sm leading-tight gap-1 group-data-[collapsible=icon]:hidden">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </>
                ) : (
                  <>
                    <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-linear-to-br from-white/10 to-white/5 text-foreground/80 shadow-inner ring-1 ring-white/10 shrink-0 group-data-[collapsible=icon]:size-10">
                      <User2 className="size-6 group-data-[collapsible=icon]:size-6" />
                    </div>
                    <div className="grid flex-1 text-left leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                      <span className="truncate text-sm font-bold tracking-tight">
                        {userName}
                      </span>
                      <span className="truncate text-[10px] uppercase tracking-widest font-black opacity-30 mt-0.5">
                        {userRole}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4 opacity-30 group-data-[collapsible=icon]:hidden" />
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl p-2 bg-popover/80 backdrop-blur-xl border-white/10 shadow-2xl"
              side="right"
              align="end"
              sideOffset={16}
            >
              <DropdownMenuItem
                asChild
                className="rounded-lg py-2.5 focus:bg-primary/10 focus:text-primary transition-colors"
              >
                <Link href="/settings/profile">
                  <User2 className="mr-2 size-4 opacity-60" />
                  <span className="font-medium text-sm">Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="rounded-lg py-2.5 focus:bg-primary/10 focus:text-primary transition-colors"
              >
                <Link href="/settings">
                  <Settings className="mr-2 size-4 opacity-60" />
                  <span className="font-medium text-sm">System Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10 my-1" />
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isSignOutLoading}
                className="rounded-lg py-2.5 focus:bg-destructive/10 focus:text-destructive transition-colors text-destructive"
              >
                <LogOut className={`mr-2 size-4 ${isSignOutLoading ? 'animate-pulse' : ''}`} />
                <span className="font-bold text-sm">{isSignOutLoading ? "Signing out..." : "Sign out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
