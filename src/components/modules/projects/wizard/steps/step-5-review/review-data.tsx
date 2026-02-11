"use client";

import type React from "react";

interface ReviewDataProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export function ReviewData({ icon, label, value }: ReviewDataProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-primary/40">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
          {label}
        </span>
      </div>
      <p className="text-[15px] font-black uppercase tracking-wider text-white">
        {value || "Not Specified"}
      </p>
    </div>
  );
}

export function ReviewLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-3">
      {label}
    </div>
  );
}
