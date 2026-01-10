"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { NavItem } from "./navigation-config";

interface SidebarNavGroupProps {
  label: string;
  items: NavItem[];
}

export function SidebarNavGroup({ label, items }: SidebarNavGroupProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-black opacity-30 px-4 mb-2">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1 px-1 group-data-[collapsible=icon]:px-0">
          {items.map((item) => {
            const isActive =
              pathname === item.url || pathname.startsWith(item.url + "/");

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 h-12",
                    "group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:mx-auto",
                    isActive
                      ? "bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.05)] text-foreground"
                      : "hover:bg-white/5 text-muted-foreground/60 hover:text-foreground/80"
                  )}
                >
                  <Link
                    href={item.url}
                    className="group/link flex items-center justify-start w-full relative group-data-[collapsible=icon]:justify-center"
                  >
                    <item.icon
                      className={cn(
                        "size-6 transition-transform duration-300 group-hover/link:scale-110 shrink-0",
                        isActive ? "text-primary opacity-100" : "opacity-40"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[15px] font-bold tracking-tight transition-all duration-300 group-data-[collapsible=icon]:hidden ml-3.5",
                        isActive ? "opacity-100" : "opacity-60"
                      )}
                    >
                      {item.title}
                    </span>

                    {/* Active Indicator Bar (Left) - Prominent Neon Highlight */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bar"
                        className={cn(
                          "absolute bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8),0_0_40px_rgba(34,211,238,0.3)] rounded-full z-20",
                          // Expanded state: Thicker, taller neon bar
                          "left-[-9px] top-1 bottom-1 w-1.5",
                          // Collapsed state: Distinct centered highlight
                          "group-data-[collapsible=icon]:left-[-8px] group-data-[collapsible=icon]:top-2 group-data-[collapsible=icon]:bottom-2 group-data-[collapsible=icon]:w-2"
                        )}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
