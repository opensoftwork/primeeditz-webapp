"use client";

import {
  Save,
  Eye,
  Layers,
  ReceiptIndianRupee,
  Info,
  ArrowLeft,
  Loader2,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBuilder } from "./builder-context";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { Step1Identity } from "./steps/step-1-identity";
import { Step2ProjectConfig } from "./steps/step-2-config";
import { Step3Pricing } from "./steps/step-3-pricing";
import { Step4Terms } from "./steps/step-4-terms";
import { Step5Review } from "./steps/step-5-review";

const SECTIONS = [
  { id: 1, label: "Basic Identity", icon: Info, component: Step1Identity },
  {
    id: 2,
    label: "Project Setup",
    icon: Layers,
    component: Step2ProjectConfig,
  },
  {
    id: 3,
    label: "Cost & Pricing",
    icon: ReceiptIndianRupee,
    component: Step3Pricing,
  },
  { id: 4, label: "Terms & Conditions", icon: FileText, component: Step4Terms },
  { id: 5, label: "Final Review", icon: Eye, component: Step5Review },
];

export function PackageEditor() {
  const router = useRouter();
  const {
    savePackageUpdate,
    isSubmitting,
    packageId,
    setCurrentStep,
    syncCurrentStep,
    step1Data,
  } = useBuilder();
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const [activeSection, setActiveSection] = useState(1);

  // Update breadcrumb name
  useEffect(() => {
    if (packageId && step1Data?.name) {
      setOverride(packageId, step1Data.name);
    }
    return () => {
      if (packageId) removeOverride(packageId);
    };
  }, [packageId, step1Data?.name, setOverride, removeOverride]);

  // Keep currentStep in sync with activeSection for step components logic
  useEffect(() => {
    setCurrentStep(activeSection);
  }, [activeSection, setCurrentStep]);

  const handleUpdate = async () => {
    if (syncCurrentStep) {
      syncCurrentStep();
    }
    await savePackageUpdate();
  };

  const ActiveComponent =
    SECTIONS.find((s) => s.id === activeSection)?.component || Step1Identity;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden">
      {/* FIXED HEADER */}
      <header className="shrink-0 h-20 border-b border-white/5 flex items-center justify-between px-12 bg-zinc-950/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-8">
          <Button
            variant="default"
            size="sm"
            onClick={() =>
              router.push(`/settings/service-packages/${packageId}`)
            }
            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] rounded-xl transition-all group shadow-2xl shadow-primary/20 border border-primary/20"
          >
            <ArrowLeft className="h-4 w-4  group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex flex-col">
            <h1 className="text-xl font-black uppercase tracking-widest text-white">
              Package Editor
            </h1>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none">
              Modifying Live Service Configuration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Live Draft
            </span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT (SIDEBAR + CONTENT) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation - Non-linear Edit View */}
        <aside className="w-64 shrink-0 border-r border-white/5 bg-zinc-950/30 p-6 flex flex-col gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-4 ml-1">
              Configuration
            </p>
            <div className="space-y-2">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center justify-start px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden text-left",
                      isActive
                        ? "bg-primary/10 border border-primary/20 text-primary shadow-[0_4px_20px_rgba(var(--primary),0.05)]"
                        : "text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent",
                    )}
                  >
                    <div className="flex items-center gap-3 relative z-10 w-full">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "text-primary"
                            : "text-white/20 group-hover:text-white/40",
                        )}
                      />
                      <span className="text-[11px] font-black uppercase tracking-widest leading-tight text-left">
                        {section.label}
                      </span>
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto">
            <div className="p-5 rounded-3xl bg-white/2 border border-white/5 space-y-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center relative z-10">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed text-white/40 relative z-10">
                Live Editing
                <span className="text-white block mt-0.5">
                  Changes apply immediately upon save
                </span>
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative p-8 md:p-12 custom-scrollbar bg-black/20 pb-32">
          <div className="w-full">
            <ActiveComponent />
          </div>
        </main>
      </div>

      {/* FIXED FOOTER */}
      <footer className="shrink-0 h-20 border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-between px-12 z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
              Active Selection
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              {SECTIONS.find((s) => s.id === activeSection)?.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isSubmitting && (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                Syncing to cloud...
              </span>
            </div>
          )}
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 border border-primary/20"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Commit Changes
          </Button>
        </div>
      </footer>
    </div>
  );
}
