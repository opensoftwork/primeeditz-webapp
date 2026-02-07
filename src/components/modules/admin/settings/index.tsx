"use client";

import { useQuery } from "convex/react";
import { 
  Building2, 
  Settings as SettingsIcon, 
  FileText, 
  Bell, 
  ShieldCheck, 
  Layers, 
  FolderTree, 
  Boxes,
  Database,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";
import { CompanySettings } from "../company/company-settings";
import { AppSettings } from "./sections/app-settings";
import { QuotationConfig } from "./sections/quotation-config";
// import { ProjectSettings } from "./sections/project-settings";

type Section = "general" | "company" | "quotation" | "notifications" | "security";

export default function Settings() {
  const [activeSection, setActiveSection] = useState<Section>("general");

  const menuItems = [
    { id: "general", label: "General Settings", icon: SettingsIcon, description: "App defaults & behavior" },
    { id: "company", label: "Company Profile", icon: Building2, description: "Billing & identity info" },
    { id: "quotation", label: "Quotation Config", icon: FileText, description: "Terms, tax & numbering" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Email & alert preferences" },
    { id: "security", label: "Access & Security", icon: ShieldCheck, description: "Roles & permissions" },
  ];

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-zinc-950/20 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm">
      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-white/5 bg-black/40 p-6 flex flex-col gap-8 overflow-y-auto">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 px-4">Admin Control</h2>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as Section)}
                  className={cn(
                    "w-full group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 text-left",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                      : "hover:bg-white/5 text-white/50 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 mt-0.5",
                    isActive ? "text-primary-foreground" : "text-primary"
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-black uppercase tracking-tight leading-none mb-1">{item.label}</p>
                    <p className={cn(
                      "text-[10px] font-medium leading-tight",
                      isActive ? "text-primary-foreground/70" : "text-white/30"
                    )}>{item.description}</p>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 opacity-50 self-center" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-6 pt-6 border-t border-white/5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-4">Resources</h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickLink icon={Layers} label="Types" href="/settings/project-types" />
            <QuickLink icon={FolderTree} label="Folders" href="/settings/folder-templates" />
            <QuickLink icon={Boxes} label="Packages" href="/settings/service-packages" />
            <QuickLink icon={Database} label="Storage" href="/settings/storage-tiers" />
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeSection === "general" && <AppSettings />}
          {activeSection === "company" && <CompanySettings />}
          {activeSection === "quotation" && <QuotationConfig />}
          {/* Add more sections as they are built */}
          {["notifications", "security"].includes(activeSection) && (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <SettingsIcon className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Module Coming Soon</h3>
              <p className="text-sm text-white/30 font-bold tracking-tight">This setting module is currently under active development.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function QuickLink({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
  return (
    <a 
      href={href}
      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/10 transition-all group"
    >
      <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
      <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{label}</span>
    </a>
  );
}
