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
          className="min-h-[120px] p-6 text-[15px] font-black uppercase tracking-wider bg-white/3 border-white/10 focus:border-primary/40 focus:ring-primary/20 transition-all rounded-2xl resize-none"
        />
        {fieldDef.description && (
          <FieldDescription className="text-xs mt-1.5">
            {fieldDef.description}
          </FieldDescription>
        )}
        {isInvalid && (
          <FieldError
            className="mt-2 ml-1"
            errors={errors.map((m) => ({ message: m }))}
          />
        )}
      </FieldContent>
    </Field>
  );
}
