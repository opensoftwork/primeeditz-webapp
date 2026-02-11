"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NoFieldsStateProps {
  projectTypeName: string;
  onPrev: () => void;
  onNext: () => void;
  isLoading: boolean;
}

export function NoFieldsState({
  projectTypeName,
  onPrev,
  onNext,
  isLoading,
}: NoFieldsStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No additional details required for{" "}
            <span className="font-medium">{projectTypeName}</span>.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            You can proceed to the next step.
          </p>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={onNext} disabled={isLoading}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
