"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

export function Step4Header() {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
        Description & Delivery
        <Badge
          variant="outline"
          className="ml-2 border-primary/20 text-primary uppercase text-[10px] tracking-widest font-black py-0.5"
        >
          Stage 04
        </Badge>
      </h2>
      <p className="text-sm font-medium text-white/20 max-w-lg">
        Tell us more about your project vision and delivery requirements.
      </p>
    </div>
  );
}
