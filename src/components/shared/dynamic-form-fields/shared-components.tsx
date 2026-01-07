"use client";

import { FieldLabel } from "@/components/ui/field";

interface FieldLabelWithRequiredProps {
  htmlFor: string;
  label: string;
  required: boolean;
}

export function FieldLabelWithRequired({
  htmlFor,
  label,
  required,
}: FieldLabelWithRequiredProps) {
  return (
    <FieldLabel htmlFor={htmlFor}>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </FieldLabel>
  );
}
