import { AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuotationRequestErrorProps {
  error: Error;
  reset: () => void;
}

export function QuotationRequestError({
  error,
  reset,
}: QuotationRequestErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-4">
      <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
        <XCircle className="h-10 w-10 text-red-500/80" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-xl font-black uppercase tracking-tight text-white">
          System Malfunction
        </h2>
        <p className="text-sm font-medium text-white/40 leading-relaxed">
          {error.message ||
            "An unexpected protocol error occurred while loading the request module."}
        </p>
      </div>

      <Button
        onClick={reset}
        variant="outline"
        className="h-12 px-8 rounded-xl border-white/10 hover:bg-white/5 hover:text-white uppercase tracking-widest font-black text-[10px]"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Reinitialize
      </Button>
    </div>
  );
}
