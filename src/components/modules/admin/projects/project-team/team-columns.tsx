"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Crown, Trash2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeatBar } from "./heat-bar";

export interface TeamMember {
  profileId: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  image?: string;
  isLead: boolean;
  activeProjects: number;
  maxCapacity: number;
  assignedAt?: number;
}

export function getTeamColumns(
  onRemove: (profileId: string) => void,
): ColumnDef<TeamMember>[] {
  return [
    {
      accessorKey: "name",
      header: () => (
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          Team Member
        </span>
      ),
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-10 w-10 border border-white/5 bg-zinc-900">
                <AvatarImage src={member.image} />
                <AvatarFallback className="bg-white/5 text-[10px] font-black text-white/40">
                  {member.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {member.isLead && (
                <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-zinc-950">
                  <Crown className="h-2.5 w-2.5 text-black stroke-[3px]" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {member.name}
                </span>
                {member.isLead && (
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Lead
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                {member.designation || "Creative Staff"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: () => (
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          Role
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: "activeProjects",
      header: () => (
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          Current Load
        </span>
      ),
      cell: ({ row }) => (
        <HeatBar
          current={row.original.activeProjects}
          max={row.original.maxCapacity}
        />
      ),
    },
    {
      accessorKey: "email",
      header: () => (
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          Contact
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-white/30 lowercase">
          {row.original.email}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(row.original.profileId)}
          className="h-8 w-8 rounded-lg text-white/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}
