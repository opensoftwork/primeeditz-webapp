"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { FieldRenderProps } from "./types";

export function CheckboxField({
  fieldDef,
  value,
  onChange,
  isInvalid,
  errors,
}: FieldRenderProps) {
  const id = `field-${fieldDef.name}`;

  return (
    <FieldLabel
      htmlFor={id}
      className={cn(
        "group/card flex flex-col p-0 transition-all duration-300 rounded-2xl border cursor-pointer overflow-hidden relative shadow-lg shadow-black/20",
        (value as boolean)
          ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
          : "bg-white/3 border-white/10 hover:bg-white/5 hover:border-white/20",
      )}
    >
      <Field
        orientation="horizontal"
        data-invalid={isInvalid}
        className="w-full gap-5 p-5"
      >
        {/* Active accent bar */}
        {(value as boolean) && (
          <div className="absolute left-0 top-0 w-1.5 h-full bg-primary shadow-[2px_0_10px_rgba(var(--primary-rgb),0.3)]" />
        )}

        <Checkbox
          id={id}
          name={fieldDef.name}
          checked={(value as boolean) ?? false}
          onCheckedChange={(checked) => onChange(!!checked)}
          aria-invalid={isInvalid}
          className="size-5 rounded-md border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
        />

        <FieldContent>
          <FieldTitle
            className={cn(
              "text-[14px] font-black uppercase tracking-wider transition-colors",
              (value as boolean) ? "text-primary" : "text-foreground/80",
            )}
          >
            {fieldDef.label}
          </FieldTitle>
          {fieldDef.description && (
            <FieldDescription className="text-[11px] mt-0.5 text-muted-foreground/50 font-medium leading-relaxed">
              {fieldDef.description}
            </FieldDescription>
          )}
          {isInvalid && (
            <FieldError
              className="mt-1"
              errors={errors.map((m) => ({ message: m }))}
            />
          )}
        </FieldContent>
      </Field>
    </FieldLabel>
  );
}
