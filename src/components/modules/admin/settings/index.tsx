"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Building2,
  Settings as SettingsIcon,
  FileText,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanySettings } from "./sections/company";
import { AppSettings } from "./sections/app-settings";
import { QuotationConfig } from "./sections/quotation-config";

type Section =
  | "general"
  | "company"
  | "quotation"
  | "notifications"
  | "security";

export default function Settings() {
  const [activeSection, setActiveSection] = useState<Section>("general");

  const menuItems = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "company", label: "Company", icon: Building2 },
    // { id: "quotation", label: "Quotations", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header & Navigation */}
      <header className="px-8 pt-8 pb-0 space-y-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
            Settings
          </h1>
          <p className="text-white/40 font-medium mt-2">
            Manage your studio's global configuration and preferences.
          </p>
        </div>

        {/* Horizontal Tabs */}
        <div className="flex items-center gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                className="relative px-6 py-4 group outline-none"
              >
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors duration-300",
                      isActive
                        ? "text-primary"
                        : "text-white/40 group-hover:text-white/80",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-black uppercase tracking-wider transition-colors duration-300",
                      isActive
                        ? "text-white"
                        : "text-white/40 group-hover:text-white/80",
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_2px_rgba(var(--primary-rgb),0.5)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Hover Background */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-t-lg transition-colors duration-300",
                    isActive
                      ? "bg-white/[0.02]"
                      : "group-hover:bg-white/[0.02]",
                  )}
                />
              </button>
            );
          })}
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeSection === "general" && <AppSettings />}
          {activeSection === "company" && <CompanySettings />}
          {/* {activeSection === "quotation" && <QuotationConfig />} */}

          {["notifications", "security"].includes(activeSection) && (
            <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-white/10 rounded-3xl bg-white/5">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-2xl shadow-primary/5">
                <SettingsIcon className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
                Module Coming Soon
              </h3>
              <p className="text-white/40 font-medium max-w-md text-center">
                This setting module is currently under active development and
                will be available in the next release.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
