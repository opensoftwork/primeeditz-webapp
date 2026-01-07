"use client";

import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { type FieldRenderProps } from "./types";
import { FieldLabel } from "@/components/ui/field";

export function CheckboxField({
  fieldDef,
  value,
  onChange,
  isInvalid,
  errors,
}: FieldRenderProps) {
  return (
    <Field orientation="horizontal" data-invalid={isInvalid}>
      <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
        <Checkbox
          id={`field-${fieldDef.name}`}
          name={fieldDef.name}
          checked={(value as boolean) ?? false}
          onCheckedChange={(checked) => onChange(!!checked)}
          aria-invalid={isInvalid}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <FieldLabel
            htmlFor={`field-${fieldDef.name}`}
            className="font-normal cursor-pointer text-base"
          >
            {fieldDef.label}
          </FieldLabel>
          {fieldDef.description && (
            <FieldDescription className="text-xs mt-0.5">
              {fieldDef.description}
            </FieldDescription>
          )}
        </div>
      </div>
      {isInvalid && <FieldError>{errors.join(", ")}</FieldError>}
    </Field>
  );
}
