"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SidebarBrand() {
  return (
    <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:pt-8 transition-all duration-300">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            asChild
            className="hover:bg-transparent px-0 group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:mx-auto"
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group/brand"
            >
              <div className="flex aspect-square size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary via-primary/80 to-primary/40 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] ring-1 ring-white/20 transition-all duration-500 group-hover/brand:scale-110 group-hover/brand:rotate-3 group-hover/brand:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:rounded-lg">
                <LayoutDashboard className="size-6 transition-transform duration-500 group-hover/brand:scale-110 group-data-[collapsible=icon]:size-5" />
              </div>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-[18px] font-black tracking-tighter uppercase text-foreground transition-colors group-hover/brand:text-primary">
                  PrimeEditz
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 group-hover/brand:text-white/60 transition-colors">
                  Studio Portal
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
