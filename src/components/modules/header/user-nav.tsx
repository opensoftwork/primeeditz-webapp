"use client";

import { LogOut, Settings, Sparkles, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

interface UserNavProps {
  user: {
    name: string;
    email?: string;
    role: string;
    image?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            // Full page reload to clear all state and redirect
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-auto gap-4 pl-5 pr-1.5 hover:bg-primary/10 rounded-full transition-all duration-300 group border border-transparent hover:border-primary/20"
        >
          <div className="flex-col items-end hidden md:flex">
            <span className="text-sm font-bold leading-none tracking-tight group-hover:text-primary transition-colors">
              {user.name}
            </span>
            <span className="mt-1.5 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
              {user.role}
            </span>
          </div>
          <Avatar className="h-9 w-9 border-2 border-background shadow-lg shadow-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/20 group-active:scale-95">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 p-2 bg-popover/80 backdrop-blur-xl border-white/10 shadow-2xl"
        align="end"
        forceMount
        sideOffset={10}
      >
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground opacity-70">
              {user.email || "No email available"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem className="rounded-lg py-2.5 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer group">
            <User className="mr-2 h-4 w-4 opacity-60 group-hover:opacity-100" />
            <span className="font-medium text-sm">Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg py-2.5 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer group">
            <Settings className="mr-2 h-4 w-4 opacity-60 group-hover:opacity-100" />
            <span className="font-medium text-sm">System Preferences</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/5" />
        <div className="px-2 py-2">
          <div className="rounded-xl bg-linear-to-br from-primary/10 to-transparent p-3 border border-primary/10 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Pro Account
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Managing all your creative projects in one place.
            </p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSignOutLoading}
          className="rounded-lg py-2.5 focus:bg-destructive/10 focus:text-destructive transition-colors text-destructive cursor-pointer group m-1"
        >
          <LogOut
            className={`mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1 ${isSignOutLoading ? "animate-pulse" : ""}`}
          />
          <span className="font-bold text-sm">
            {isSignOutLoading ? "Signing out..." : "Sign out"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
