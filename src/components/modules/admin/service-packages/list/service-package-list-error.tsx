"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServicePackageListErrorProps {
  error: string;
}

export function ServicePackageListError({ error }: ServicePackageListErrorProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-zinc-900/50 rounded-[32px] border border-red-500/10 backdrop-blur-sm animate-in zoom-in-95 duration-300">
      <div className="p-4 bg-red-500/10 rounded-3xl mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">
        Error Loading Packages
      </h2>
      <p className="text-white/40 max-w-md mx-auto mb-8 font-medium">
        {error || "Something went wrong while fetching the service packages. Please try again."}
      </p>
      <Button 
        onClick={() => window.location.reload()}
        variant="outline"
        className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl gap-2 transition-all active:scale-95"
      >
        <RefreshCcw className="h-4 w-4" />
        Retry Loading
      </Button>
    </div>
  );
}
