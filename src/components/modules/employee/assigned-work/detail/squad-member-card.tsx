"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SquadMemberCardProps {
  member: any;
}

export function SquadMemberCard({ member }: SquadMemberCardProps) {
  const { profile, role, isLead } = member;

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border transition-all duration-500 relative overflow-hidden group",
        isLead
          ? "bg-indigo-500/5 border-indigo-500/20"
          : "bg-white/2 border-white/5 hover:border-white/10",
      )}
    >
      {isLead && (
        <div className="absolute top-0 right-0 p-3">
          <Star className="h-3 w-3 text-indigo-400 fill-indigo-400" />
        </div>
      )}

      <div className="flex items-center gap-4 relative z-10">
        <Avatar className="h-10 w-10 border border-white/5 bg-zinc-800">
          <AvatarImage src={profile?.image} />
          <AvatarFallback className="bg-white/5 text-[10px] font-black text-white/40">
            {profile?.name?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-tight text-white">
            {profile?.name}
          </span>
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
            {role} {isLead && "• SQUAD LEAD"}
          </span>
        </div>
      </div>

      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/2 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </div>
  );
}
