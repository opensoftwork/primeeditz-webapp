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
            <Icon className="h-4 w-4 text-white/20" />
          </InputGroupAddon>
          <InputGroupInput
            id={`field-${fieldDef.name}`}
            name={fieldDef.name}
            type="number"
            value={(value as number) ?? ""}
            onBlur={onBlur}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === "" ? null : Number(val));
            }}
            aria-invalid={isInvalid}
            min={fieldDef.min}
            max={fieldDef.max}
            placeholder={fieldDef.placeholder}
            className="h-14 px-6 text-[15px] font-black uppercase tracking-wider text-white bg-white/3 border-white/10 focus:border-primary/40 focus:ring-primary/20 transition-all rounded-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-white/10"
          />
        </InputGroup>
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
