"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { getFieldIcon, type FieldRenderProps } from "./types";
import { FieldLabelWithRequired } from "./shared-components";

export function NumberField({
  fieldDef,
  value,
  onChange,
  onBlur,
  isInvalid,
  errors,
  isHighlighted,
}: FieldRenderProps) {
  const Icon = getFieldIcon(fieldDef.type, fieldDef.name);

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabelWithRequired
        htmlFor={`field-${fieldDef.name}`}
        label={fieldDef.label}
        required={fieldDef.required}
      />
      <FieldContent>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Icon
              className={`h-4 w-4 ${
                isHighlighted ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </InputGroupAddon>
          <InputGroupInput
            id={`field-${fieldDef.name}`}
            type="number"
            name={fieldDef.name}
            value={(value as number) ?? ""}
            onBlur={onBlur}
            onChange={(e) =>
              onChange(e.target.value ? Number(e.target.value) : null)
            }
            aria-invalid={isInvalid}
            placeholder={fieldDef.placeholder}
            min={fieldDef.min}
            max={fieldDef.max}
            className={`text-base ${isHighlighted ? "font-medium" : ""}`}
          />
        </InputGroup>
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
