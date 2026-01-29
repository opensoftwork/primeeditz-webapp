import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface QuotationRequestErrorProps {
  error: Error;
  reset: () => void;
}

export function QuotationRequestError({
  error,
  reset,
}: QuotationRequestErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Alert variant="destructive" className="max-w-xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading request form</AlertTitle>
        <AlertDescription>
          {error.message ||
            "An unexpected error occurred while loading the page."}
        </AlertDescription>
      </Alert>
      <Button onClick={reset} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
