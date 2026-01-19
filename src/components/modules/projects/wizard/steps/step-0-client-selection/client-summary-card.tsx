/**
 * Client Summary Card Component
 * Displays the selected client information with change option
 */

"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { SelectedClientData } from "../../types";

interface ClientSummaryCardProps {
  client: SelectedClientData;
  isNewClient: boolean;
  onChangeClient: () => void;
}

export function ClientSummaryCard({
  client,
  isNewClient,
  onChangeClient,
}: ClientSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 p-6 rounded-2xl bg-white/3 border border-white/10 relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <span className="text-base font-black text-primary">
              {client.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>

          {/* Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {client.name}
              </h3>
              {isNewClient && (
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-full">
                  New Client
                </span>
              )}
              {!client.onboardingComplete && (
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  Pending Onboarding
                </span>
              )}
            </div>
            <p className="text-sm text-white/60">{client.email}</p>
            <div className="flex items-center gap-4 text-xs text-white/40">
              {client.phone && <span>{client.phone}</span>}
              {client.company && <span>{client.company}</span>}
              {client.projectCount !== undefined && (
                <span>
                  {client.projectCount} project
                  {client.projectCount !== 1 ? "s" : ""}
                  {client.activeProjectCount !== undefined &&
                    client.activeProjectCount > 0 &&
                    `, ${client.activeProjectCount} active`}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onChangeClient}
          className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border-white/10 hover:border-primary/30 hover:bg-primary/5 rounded-xl"
        >
          Change Client
        </Button>
      </div>
    </motion.div>
  );
}
