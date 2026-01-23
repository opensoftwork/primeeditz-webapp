import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";
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

  // Check if any child is active to auto-expand
  const hasActiveChild = useMemo(() => {
    return items.some((item: NavItem) => {
      if (item.url === "/settings") return pathname === "/settings";
      return pathname === item.url || pathname.startsWith(item.url + "/");
    });
  }, [items, pathname]);

  const [isOpen, setIsOpen] = useState(true);

  return (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel
        asChild
        className="group/label flex items-center justify-between px-4 mb-2 cursor-pointer hover:text-foreground transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-40 group-hover/label:opacity-80 transition-opacity">
            {label}
          </span>
          <ChevronRight
            className={cn(
              "size-3.5 transition-transform duration-300 opacity-30 group-hover/label:opacity-100",
              isOpen ? "rotate-90" : "rotate-0",
            )}
          />
        </div>
      </SidebarGroupLabel>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5 px-2 group-data-[collapsible=icon]:px-0">
                {items.map((item: NavItem) => {
                  // Specific fix for settings collision:
                  // If it's the root /settings, only match exactly.
                  // This prevents it from being active when a sub-setting is active.
                  const isActive =
                    item.url === "/settings"
                      ? pathname === "/settings"
                      : pathname === item.url ||
                        pathname.startsWith(item.url + "/");

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "relative flex items-center px-4 py-3 rounded-xl transition-all duration-500 h-12 overflow-hidden group/btn",
                          "group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:mx-auto",
                          isActive
                            ? "bg-white/3 backdrop-blur-md ring-1 ring-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_0_20px_rgba(255,255,255,0.02)] text-foreground"
                            : "hover:bg-white/5 hover:backdrop-blur-sm text-white/40 hover:text-white/90",
                        )}
                      >
                        <Link
                          href={item.url}
                          className="group/link flex items-center justify-start w-full relative group-data-[collapsible=icon]:justify-center"
                        >
                          {/* Inner container to hold content and handle scaling */}
                          <div className="flex items-center relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1 group-data-[collapsible=icon]:group-hover/btn:translate-x-0">
                            <item.icon
                              className={cn(
                                "size-5 transition-all duration-300 shrink-0",
                                isActive
                                  ? "text-primary filter drop-shadow-[0_0_8px_rgba(var(--primary),0.5)] scale-110"
                                  : "opacity-40 group-hover/btn:opacity-100 group-hover/btn:scale-110",
                              )}
                            />
                            <span
                              className={cn(
                                "text-[14px] font-semibold tracking-tight transition-all duration-300 group-data-[collapsible=icon]:hidden ml-3.5",
                                isActive
                                  ? "text-foreground"
                                  : "text-white/50 group-hover/btn:text-white/90",
                              )}
                            >
                              {item.title}
                            </span>
                          </div>

                          {/* Futuristic Glow Effect on Hover */}
                          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent pointer-events-none" />
                          </div>

                          {/* Active Indicator Bar (Left) - Prominent Neon Highlight */}
                          {isActive && (
                            <motion.div
                              layoutId="nav-active-bar"
                              className={cn(
                                "absolute bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.8),0_0_30px_rgba(var(--primary-rgb),0.4)] rounded-full z-20",
                                // Expanded state: Clean minimal bar
                                "left-[-8px] top-2 bottom-2 w-1.5",
                                // Collapsed state: Distinct centered highlight
                                "group-data-[collapsible=icon]:left-[-6px] group-data-[collapsible=icon]:top-3 group-data-[collapsible=icon]:bottom-3 group-data-[collapsible=icon]:w-1.5",
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
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarGroup>
  );
}
