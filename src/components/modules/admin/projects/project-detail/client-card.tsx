"use client";

import { User, Mail, Calendar, CheckCircle2 } from "lucide-react";

interface ClientCardProps {
  clientName: string;
  clientEmail?: string;
  submittedAt: number;
}

function LocalSidebarItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 group">
      <div className="flex items-center gap-2.5">
        <div className="text-white/40 p-1.5 rounded-lg bg-white/5 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
          {label}
        </span>
      </div>
      <span className="text-[12px] font-black text-white uppercase tracking-tight">
        {value}
      </span>
    </div>
  );
}

export function ClientCard({
  clientName,
  clientEmail,
  submittedAt,
}: ClientCardProps) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 space-y-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 blur-[80px] rounded-full" />

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
          <User className="h-5 w-5" />
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">
          Client Information
        </h3>
      </div>

      <div className="space-y-4 relative z-10">
        <LocalSidebarItem
          icon={<User className="h-4 w-4" />}
          label="Name"
          value={clientName}
        />
        <LocalSidebarItem
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={clientEmail || "—"}
        />
        <LocalSidebarItem
          icon={<Calendar className="h-4 w-4" />}
          label="Submitted"
          value={new Date(submittedAt).toLocaleDateString()}
        />
        <LocalSidebarItem
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Portal"
          value="Active"
        />
      </div>
    </div>
  );
}
