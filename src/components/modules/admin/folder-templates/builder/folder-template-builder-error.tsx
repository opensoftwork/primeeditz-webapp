"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";

export function FolderTemplateBuilderError({ error, onRetry }: { error: string, onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 font-geist">
      <div className="p-4 rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md">
        {error || "Failed to load folder template. Please check your connection or permissions."}
      </p>
      <div className="flex gap-2 pt-4">
        <Button variant="outline" asChild>
          <Link href="/admin/folder-templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Link>
        </Button>
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
