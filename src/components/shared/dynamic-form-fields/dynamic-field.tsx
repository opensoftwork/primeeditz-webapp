"use client";

import { DbFieldDefinition, FieldRenderProps, FieldValue } from "./types";
import { TextField } from "./text-field";
import { NumberField } from "./number-field";
import { SelectField } from "./select-field";
import { CheckboxField } from "./checkbox-field";
import { TextareaField } from "./textarea-field";

interface DynamicFieldProps {
  fieldDef: DbFieldDefinition;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  isInvalid: boolean;
  errors: string[];
  isAlbumCountField?: boolean;
}

export function DynamicField({
  fieldDef,
  value,
  onChange,
  onBlur,
  isInvalid,
  errors,
  isAlbumCountField,
}: DynamicFieldProps) {
  const commonProps: FieldRenderProps = {
    fieldDef,
    value,
    onChange,
    onBlur,
    isInvalid,
    errors,
    isHighlighted: isAlbumCountField,
  };

  switch (fieldDef.type) {
    case "text":
      return <TextField {...commonProps} />;
    case "number":
      return <NumberField {...commonProps} />;
    case "select":
      return <SelectField {...commonProps} />;
    case "checkbox":
      return <CheckboxField {...commonProps} />;
    case "textarea":
      return <TextareaField {...commonProps} />;
    default:
      return null;
  }
}
