/**
 * Project Wizard Error Component
 *
 * Displayed when the wizard route encounters an error.
 */

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectWizardErrorProps {
  error: Error;
  reset?: () => void;
}

export function ProjectWizardError({ error, reset }: ProjectWizardErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Failed to Load Wizard</CardTitle>
          <CardDescription>
            {error.message ||
              "An unexpected error occurred while loading the project wizard."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Please try again or contact support if the problem persists.</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {reset && (
            <Button variant="outline" onClick={reset}>
              Try Again
            </Button>
          )}
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
