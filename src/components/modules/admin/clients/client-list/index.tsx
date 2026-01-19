"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Building, Eye, Mail, Phone, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { OnboardingBadge } from "./status-badge";
import type { AdminClient } from "./types";
import { NewClientDrawer } from "./new-client-drawer";
import { useState } from "react";

// ============================================================================
// Client Card Component (for card view)
// ============================================================================

function ClientCard({ client }: { client: AdminClient }) {
  return (
    <Link href={`/clients/${client._id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group p-6 rounded-[1.5rem] bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
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
                  {client.name}
                </span>
                <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                  ID: {client._id.slice(-6).toUpperCase()}
                </div>
              </div>
            </div>
            <OnboardingBadge isComplete={client.onboardingComplete} />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-white/50">
              <Mail className="h-3 w-3" />
              <span className="text-xs font-medium truncate">
                {client.email}
              </span>
            </div>
            {client.company && (
              <div className="flex items-center gap-2">
                <Building className="h-3 w-3 text-white/30" />
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                  {client.company}
                </span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-white/40">
                <Phone className="h-3 w-3" />
                <span className="text-xs font-mono">{client.phone}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              Joined {new Date(client._creationTime).toLocaleDateString()}
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

interface ClientListProps {
  /** If true, only shows clients that have at least one project */
  onlyWithProjects?: boolean;
  /** Whether to show the page header */
  showHeader?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export default function ClientList({
  onlyWithProjects = false,
  showHeader = true,
}: ClientListProps) {
  const [showNewClientDrawer, setShowNewClientDrawer] = useState(false);
  // Fetch clients based on the filter prop
  const allClients = useQuery(api.admin.getClients, {});
  const clientsWithProjects = useQuery(api.admin.getClientsWithProjects);

  const rawClients = onlyWithProjects ? clientsWithProjects : allClients;

  // Transform the data to match AdminClient type
  const clients: AdminClient[] = useMemo(() => {
    if (!rawClients) return [];
    return rawClients.map((client) => ({
      _id: client._id,
      name: client.name,
      email: client.email,
      company: client.company,
      phone: client.phone,
      onboardingComplete: client.onboardingComplete ?? false,
      role: client.role,
      _creationTime: client._creationTime,
    }));
  }, [rawClients]);

  // Get unique companies for filtering
  const companyOptions = useMemo(() => {
    const companies = new Set<string>();
    clients.forEach((c) => {
      companies.add(c.company || "Individual");
    });
    return Array.from(companies).map((company) => ({
      label: company,
      value: company,
    }));
  }, [clients]);

  const onboardingOptions = [
    { label: "Complete", value: "complete" },
    { label: "Pending", value: "pending" },
  ];

  if (rawClients === undefined) {
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
                CLIENT MANAGEMENT
              </span>
              <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
                Client Directory
              </h1>
            </motion.div>
          </div>
        )}
        <DataTableSkeleton rows={6} columns={6} />
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
              CLIENT MANAGEMENT
            </span>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Client Directory
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={() => setShowNewClientDrawer(true)}
              className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
            >
              ADD CLIENT
            </Button>
          </motion.div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={clients}
        emptyTitle="No Clients Found"
        emptyDescription="No clients match your current filters. Try adjusting your search criteria."
        renderCard={(client) => <ClientCard client={client} />}
        defaultView="table"
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

      <NewClientDrawer
        open={showNewClientDrawer}
        onOpenChange={setShowNewClientDrawer}
      />
    </div>
  );
}

// Re-export for convenience
export { ClientCard };
export type { ClientListProps };
