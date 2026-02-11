"use client";

import { Edit2 } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

interface SectionWrapperProps {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}

export function SectionWrapper({
  title,
  icon,
  onEdit,
  children,
}: SectionWrapperProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            {icon}
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60">
            {title}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-4 rounded-lg bg-white/2 hover:bg-primary/10 hover:text-primary border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
          onClick={onEdit}
        >
          <Edit2 className="h-3 w-3 mr-2" />
          Modify
        </Button>
      </div>
      <div className="p-8 rounded-[2rem] bg-white/2 border border-white/5 border-dashed relative">
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[20px_20px] rounded-[2rem]" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
