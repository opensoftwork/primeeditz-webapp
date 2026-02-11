"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ConvexError } from "convex/values";
import { Database, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ConvexErrorBoundary
 *
 * Specifically handles ConvexError thrown from useQuery/useMutation/useAction.
 * Provides a graceful fallback UI for common errors like "Project not found".
 */
export class ConvexErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log actual errors, not planned business logic errors if possible
    // But for now, we log everything for debugging
    console.error("ConvexErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const error = this.state.error;

      // Check if it's a ConvexError with a specific message
      const isConvexError = error instanceof ConvexError;
      const errorMessage = isConvexError ? String(error.data) : error?.message;

      const isNotFound =
        errorMessage?.includes("not found") ||
        errorMessage?.includes("Access denied");

      if (isNotFound) {
        return (
          <div className="flex flex-col items-center justify-center p-20 space-y-4 min-h-[50vh]">
            <div className="p-6 rounded-full bg-white/5 border border-white/10">
              <Database className="h-12 w-12 text-white/20" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              Project Not Found
            </h2>
            <p className="text-sm font-bold text-white/40 uppercase tracking-widest text-center max-w-md">
              The project you are looking for does not exist, has been removed,
              or you don't have permission to view it.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-6 rounded-xl border-white/10 bg-white/2 hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
            >
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        );
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default Error UI
      return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 min-h-[50vh]">
          <div className="p-6 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-12 w-12 text-red-500/50" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            Something went wrong
          </h2>
          <p className="text-sm font-bold text-white/40 uppercase tracking-widest text-center max-w-md">
            {errorMessage ||
              "An unexpected error occurred while communicating with the server."}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
            className="mt-6 rounded-xl border-white/10 bg-white/2 hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
