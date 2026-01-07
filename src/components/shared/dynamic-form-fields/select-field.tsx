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
import { parseSelectOptions, type FieldRenderProps } from "./types";
import { FieldLabelWithRequired } from "./shared-components";

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
            className="text-base"
          >
            <SelectValue
              placeholder={fieldDef.placeholder || "Select an option..."}
            />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
