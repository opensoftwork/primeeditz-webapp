"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { AppSettingsSkeleton } from "./app-settings-skeleton";
import { QuotationSection } from "./components/quotation-section";
import { NotificationSection } from "./components/notification-section";

export function AppSettings() {
  // @ts-ignore
  const settings = useQuery(api.functions.settings.queries.get);

  if (settings === undefined) {
    return <AppSettingsSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full px-1">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-1">
            General Settings
          </h1>
          <p className="text-sm text-white/40 font-medium tracking-tight">
            Manage global application behaviors and defaults.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <QuotationSection initialData={settings?.quotation} />
        <NotificationSection initialData={settings?.notifications} />
      </div>
    </div>
  );
}
