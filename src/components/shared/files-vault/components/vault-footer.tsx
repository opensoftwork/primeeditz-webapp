"use client";

import { X } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

interface VaultFooterProps {
  onClose: () => void;
}

export function VaultFooter({ onClose }: VaultFooterProps) {
  return (
    <div className="shrink-0 p-10 border-t border-white/5 bg-white/1 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
      <Button
        variant="outline"
        className="w-full h-16 rounded-[1.2rem] border-white/10 hover:border-white/20 hover:bg-white/5 font-black uppercase tracking-[0.3em] text-[10px] text-white/40 hover:text-white transition-all"
        onClick={onClose}
      >
        DISMISS VAULT
        <X className="ml-3 h-4 w-4 opacity-40 group-hover:opacity-100 transition-all duration-500" />
      </Button>
    </div>
  );
}
