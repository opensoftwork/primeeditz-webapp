"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Building, Eye, Mail, Phone, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { columns } from "./columns";
import { NewStudioDrawer } from "./new-studio-drawer";
import { OnboardingBadge } from "./status-badge";
import type { AdminStudio } from "./types";

// ============================================================================
// Studio Card Component (for card view)
// ============================================================================

function StudioCard({ studio }: { studio: AdminStudio }) {
  return (
    <Link href={`/clients/${studio._id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group p-6 rounded-3xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white group-hover:text-primary transition-colors uppercase">
                  {studio.name}
                </span>
                <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                  ID: {studio._id.slice(-6).toUpperCase()}
                </div>
              </div>
            </div>
            <OnboardingBadge isComplete={studio.onboardingComplete} />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-white/50">
              <Mail className="h-3 w-3" />
              <span className="text-xs font-medium truncate">
                {studio.email}
              </span>
            </div>
            {studio.company && (
              <div className="flex items-center gap-2">
                <Building className="h-3 w-3 text-white/30" />
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                  {studio.company}
                </span>
              </div>
            )}
            {studio.phone && (
              <div className="flex items-center gap-2 text-white/40">
                <Phone className="h-3 w-3" />
                <span className="text-xs font-mono">{studio.phone}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              Joined {new Date(studio._creationTime).toLocaleDateString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg gap-1"
            >
              View <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ============================================================================
// Props Interface
// ============================================================================

interface StudioListProps {
  /** If true, only shows studios that have at least one project */
  onlyWithProjects?: boolean;
  /** Whether to show the page header */
  showHeader?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export default function StudioList({
  onlyWithProjects = false,
  showHeader = true,
}: StudioListProps) {
  const [showNewStudioDrawer, setShowNewStudioDrawer] = useState(false);
  const { setOverride, removeOverride } = useBreadcrumbStore();

  useEffect(() => {
    setOverride("clients", "Studios");
    return () => removeOverride("clients");
  }, [setOverride, removeOverride]);

  // Fetch studios based on the filter prop
  const allStudios = useQuery(api.admin.getStudios, {});
  const studiosWithProjects = useQuery(api.admin.getStudiosWithProjects);

  const rawStudios = onlyWithProjects ? studiosWithProjects : allStudios;

  // Transform the data to match AdminStudio type
  const studios: AdminStudio[] = useMemo(() => {
    if (!rawStudios) return [];
    return rawStudios.map((studio) => ({
      _id: studio._id,
      name: studio.name,
      email: studio.email,
      company: studio.company,
      phone: studio.phone,
      onboardingComplete: studio.onboardingComplete ?? false,
      role: studio.role,
      _creationTime: studio._creationTime,
    }));
  }, [rawStudios]);

  // Get unique companies for filtering
  const companyOptions = useMemo(() => {
    const companies = new Set<string>();
    studios.forEach((s) => {
      companies.add(s.company || "Individual");
    });
    return Array.from(companies).map((company) => ({
      label: company,
      value: company,
    }));
  }, [studios]);

  const onboardingOptions = [
    { label: "Complete", value: "complete" },
    { label: "Pending", value: "pending" },
  ];

  if (rawStudios === undefined) {
    return (
      <div className="flex-1 p-8 md:p-12 w-full">
        {showHeader && (
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
                STUDIO MANAGEMENT
              </span>
              <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
                Studio Directory
              </h1>
            </motion.div>
          </div>
        )}
        <DataTableSkeleton rows={6} columns={6} viewMode="cards" />
      </div>
    );
  }

  return (
    <div className={showHeader ? "flex-1 p-8 md:p-12 w-full" : "w-full"}>
      {showHeader && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
              STUDIO MANAGEMENT
            </span>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Studio Directory
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={() => setShowNewStudioDrawer(true)}
              className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
            >
              ADD STUDIO
            </Button>
          </motion.div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={studios}
        emptyTitle="No Studios Found"
        emptyDescription="No studios match your current filters. Try adjusting your search criteria."
        renderCard={(studio) => <StudioCard studio={studio} />}
        defaultView="cards"
        showViewToggle={showHeader}
        toolbar={{
          search: {
            column: "name",
            placeholder: "Search by name, email or company...",
          },
          filters: [
            {
              column: "onboardingComplete",
              title: "Onboarding",
              options: onboardingOptions,
            },
            ...(companyOptions.length > 1
              ? [
                  {
                    column: "company",
                    title: "Company",
                    options: companyOptions,
                  },
                ]
              : []),
          ],
        }}
      />

      <NewStudioDrawer
        open={showNewStudioDrawer}
        onOpenChange={setShowNewStudioDrawer}
      />
    </div>
  );
}

// Re-export for convenience
export { StudioCard };
export type { StudioListProps };
