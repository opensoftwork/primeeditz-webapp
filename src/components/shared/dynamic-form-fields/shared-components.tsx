"use client";

import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/ui/field";

interface FieldLabelWithRequiredProps {
  htmlFor: string;
  label: string;
  required: boolean;
  className?: string;
}

export function FieldLabelWithRequired({
  htmlFor,
  label,
  required,
  className,
}: FieldLabelWithRequiredProps) {
  return (
    <FieldLabel
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-black uppercase tracking-widest mb-3 text-white/60 flex items-center",
        className
      )}
    >
      {label}
      {required && <span className="text-primary ml-1.5">*</span>}
    </FieldLabel>
  );
}
