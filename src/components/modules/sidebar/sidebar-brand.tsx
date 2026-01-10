"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex aspect-square size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-105 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:rounded-lg">
                <LayoutDashboard className="size-6 group-data-[collapsible=icon]:size-5" />
              </div>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-[17px] font-black tracking-tighter uppercase text-foreground">
                  PrimeEditz
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/50">
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
