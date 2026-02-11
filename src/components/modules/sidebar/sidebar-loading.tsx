"use client";

import { ChevronUp, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarLoading() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:pt-8 transition-all duration-300">
        <div className="flex items-center gap-3 px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex aspect-square size-12 shrink-0 items-center justify-center rounded-xl bg-muted animate-pulse group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:rounded-lg">
            <LayoutDashboard className="size-6 opacity-20 group-data-[collapsible=icon]:size-6" />
          </div>
          <div className="grid flex-1 gap-1.5 group-data-[collapsible=icon]:hidden">
            <div className="h-4 w-24 bg-muted rounded-full animate-pulse" />
            <div className="h-3 w-16 bg-muted/40 rounded-full animate-pulse" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-4 mt-2 group-data-[collapsible=icon]:px-0">
          <div className="h-3 w-20 bg-muted/20 rounded-full mb-6 uppercase tracking-widest animate-pulse group-data-[collapsible=icon]:hidden" />
          <SidebarMenu className="gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <SidebarMenuItem key={i} className="flex justify-center">
                <div className="flex items-center gap-3.5 px-3 py-4 rounded-xl border border-white/5 bg-white/2 animate-pulse group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
                  <div className="size-6 rounded-lg bg-muted/20 shrink-0 group-data-[collapsible=icon]:size-6" />
                  <div className="h-4 flex-1 bg-muted/20 rounded-md group-data-[collapsible=icon]:hidden" />
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:pb-8 transition-all duration-300">
        <div className="h-14 rounded-xl border border-white/5 bg-white/2 px-3 flex items-center gap-3 animate-pulse group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto">
          <div className="size-10 rounded-lg bg-muted/20 shrink-0 group-data-[collapsible=icon]:size-10" />
          <div className="grid flex-1 gap-1.5 group-data-[collapsible=icon]:hidden">
            <div className="h-4 w-3/4 bg-muted/20 rounded-md" />
            <div className="h-3 w-1/2 bg-muted/10 rounded-md" />
          </div>
          <ChevronUp className="size-4 opacity-10 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
