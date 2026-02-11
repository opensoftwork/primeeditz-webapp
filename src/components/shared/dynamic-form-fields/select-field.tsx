"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FieldLabelWithRequired } from "./shared-components";
import { type FieldRenderProps, parseSelectOptions } from "./types";

export function SelectField({
  fieldDef,
  value,
  onChange,
  isInvalid,
  errors,
}: FieldRenderProps) {
  const options = parseSelectOptions(fieldDef.options);

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabelWithRequired
        htmlFor={`field-${fieldDef.name}`}
        label={fieldDef.label}
        required={fieldDef.required}
        className="text-[13px] font-black uppercase tracking-widest mb-3 text-muted-foreground/80"
      />
      <FieldContent>
        <Select
          name={fieldDef.name}
          value={(value as string) ?? ""}
          onValueChange={(val) => onChange(val)}
        >
          <SelectTrigger
            id={`field-${fieldDef.name}`}
            aria-invalid={isInvalid}
            className={cn(
              "h-14 text-[15px] font-black uppercase tracking-wider transition-all duration-300 rounded-2xl px-6 shadow-lg shadow-black/20",
              isInvalid
                ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                : "bg-white/3 border-white/10 hover:bg-white/5 hover:border-primary/40 focus:ring-2 focus:ring-primary/20",
            )}
          >
            <SelectValue
              placeholder={fieldDef.placeholder || "Select an option..."}
            />
          </SelectTrigger>
          <SelectContent className="bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-[13px] font-black uppercase tracking-widest focus:bg-primary/20 focus:text-primary py-3.5 px-6 transition-colors border-b border-white/5 last:border-none"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldDef.description && (
          <FieldDescription className="text-[11px] mt-3 text-muted-foreground/50 leading-relaxed font-medium ml-1">
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
