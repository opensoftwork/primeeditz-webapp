"use client";

import {
  DynamicField,
  type DbFieldDefinition,
} from "@/components/shared/dynamic-form-fields";

interface FormFieldWrapperProps {
  form: any;
  fieldDef: DbFieldDefinition;
  isAlbumCountField: boolean;
}

export function FormFieldWrapper({
  form,
  fieldDef,
  isAlbumCountField,
}: FormFieldWrapperProps) {
  return (
    <form.Field
      name={fieldDef.name}
      validators={
        fieldDef.required
          ? {
              onChange: ({
                value,
              }: {
                value: string | number | boolean | null;
              }) =>
                value === undefined || value === null || value === ""
                  ? `${fieldDef.label} is required`
                  : undefined,
            }
          : undefined
      }
      children={(field: any) => (
        <DynamicField
          fieldDef={fieldDef}
          value={field.state.value}
          onChange={field.handleChange}
          onBlur={field.handleBlur}
          isInvalid={
            field.state.meta.isTouched && field.state.meta.errors.length > 0
          }
          errors={field.state.meta.errors}
          isAlbumCountField={isAlbumCountField}
        />
      )}
    />
  );
}
