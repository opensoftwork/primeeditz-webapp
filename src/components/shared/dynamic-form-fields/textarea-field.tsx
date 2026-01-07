"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { type FieldRenderProps } from "./types";
import { FieldLabelWithRequired } from "./shared-components";

export function TextareaField({
  fieldDef,
  value,
  onChange,
  onBlur,
  isInvalid,
  errors,
}: FieldRenderProps) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabelWithRequired
        htmlFor={`field-${fieldDef.name}`}
        label={fieldDef.label}
        required={fieldDef.required}
      />
      <FieldContent>
        <Textarea
          id={`field-${fieldDef.name}`}
          name={fieldDef.name}
          value={(value as string) ?? ""}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={isInvalid}
          placeholder={fieldDef.placeholder}
          className="min-h-[100px] text-base resize-none"
        />
        {fieldDef.description && (
          <FieldDescription className="text-xs mt-1.5">
            {fieldDef.description}
          </FieldDescription>
        )}
        {isInvalid && <FieldError>{errors.join(", ")}</FieldError>}
      </FieldContent>
    </Field>
  );
}
