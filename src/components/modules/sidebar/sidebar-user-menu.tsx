"use client";

import { ChevronUp, LogOut, Settings, User2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAction } from "convex/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { api } from "@convex/_generated/api";

interface SidebarUserMenuProps {
  userName: string;
  userRole: string;
  userImage?: string | null;
  isLoading?: boolean;
}

export function SidebarUserMenu({
  userName,
  userRole,
  userImage,
  isLoading = false,
}: SidebarUserMenuProps) {
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const getSignedUrl = useAction(
    //@ts-ignore
    api.functions.storage.actions.getSignedFileUrl,
  );

  // Resolve storage key to a signed URL
  useEffect(() => {
    const fetchUrl = async () => {
      if (
        userImage &&
        (userImage.startsWith("profiles/") || userImage.includes("/"))
      ) {
        try {
          const url = await getSignedUrl({ storageKey: userImage });
          setAvatarUrl(url);
        } catch (error) {
          console.error("Failed to fetch sidebar avatar URL:", error);
          setAvatarUrl(null);
        }
      } else if (userImage) {
        // Direct URL (e.g. from auth provider)
        setAvatarUrl(userImage);
      } else {
        setAvatarUrl(null);
      }
    };
    fetchUrl();
  }, [userImage, getSignedUrl]);

  const initials = userName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
          },
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
                className="h-16 rounded-2xl border border-white/5 bg-white/2 px-3 transition-all duration-500 hover:bg-white/5 hover:border-white/10 data-[state=open]:bg-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)] group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto overflow-hidden group/user-btn"
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
                    <Avatar className="size-10 rounded-full shrink-0 group-data-[collapsible=icon]:size-10 ring-1 ring-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] transition-transform duration-500 group-hover/user-btn:scale-110">
                      {avatarUrl ? (
                        <AvatarImage
                          src={avatarUrl}
                          alt={userName}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-linear-to-br from-white/10 to-transparent text-foreground/80 text-sm font-bold rounded-full">
                        {initials || <User2 className="size-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left leading-tight ml-3 group-data-[collapsible=icon]:hidden">
                      <span className="truncate text-[15px] font-bold tracking-tight">
                        {userName}
                      </span>
                      <span className="truncate text-[10px] uppercase tracking-[0.2em] font-black text-primary filter drop-shadow-[0_0_4px_rgba(var(--primary-rgb),0.5)] mt-1">
                        {userRole}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4 opacity-20 group-hover/user-btn:opacity-60 transition-opacity group-data-[collapsible=icon]:hidden" />
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
                <LogOut
                  className={`mr-2 size-4 ${isSignOutLoading ? "animate-pulse" : ""}`}
                />
                <span className="font-bold text-sm">
                  {isSignOutLoading ? "Signing out..." : "Sign out"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
