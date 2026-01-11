"use client";

import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListEmptyProps {
  onCreate: () => void;
}

export function ListEmpty({ onCreate }: ListEmptyProps) {
  return (
    <div className="h-96 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
      <Boxes className="h-12 w-12 text-white/10 mb-4" />
      <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
        No project types found
      </p>
      <Button
        variant="link"
        onClick={onCreate}
        className="text-primary mt-2 font-black uppercase tracking-widest text-[10px]"
      >
        Create your first one
      </Button>
    </div>
  );
}
