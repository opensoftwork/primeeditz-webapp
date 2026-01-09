"use client";

import {
  DynamicField,
  type DbFieldDefinition,
  type FieldValue,
} from "@/components/shared/dynamic-form-fields";

interface FormFieldWrapperProps<TFormData> {
  form: {
    Field: any; // We use a simpler structure instead of ReactFormApi to avoid 12-arg requirement
  };
  fieldDef: DbFieldDefinition;
  isAlbumCountField: boolean;
}

export function FormFieldWrapper<TFormData>({
  form,
  fieldDef,
  isAlbumCountField,
}: FormFieldWrapperProps<TFormData>) {
  return (
    <form.Field
      name={fieldDef.name as any} // TanStack Form names are strictly typed to keys, but our fields are dynamic
      validators={{
        onChange: ({ value }: { value: FieldValue }) => {
          if (
            fieldDef.required &&
            (value === undefined || value === null || value === "")
          ) {
            return `${fieldDef.label} is required`;
          }
          if (isAlbumCountField && typeof value === "number" && value > 10) {
            return "Maximum 10 albums allowed per project";
          }
          return undefined;
        },
      }}
    >
      {(field: {
        state: {
          value: FieldValue;
          meta: { isTouched: boolean; errors: any[] };
        };
        handleChange: (val: FieldValue) => void;
        handleBlur: () => void;
      }) => (
        <DynamicField
          fieldDef={{
            ...fieldDef,
            max: isAlbumCountField ? 10 : fieldDef.max,
          }}
          value={field.state.value}
          onChange={field.handleChange}
          onBlur={field.handleBlur}
          isInvalid={
            field.state.meta.isTouched && field.state.meta.errors.length > 0
          }
          errors={field.state.meta.errors.map(String)}
          isAlbumCountField={isAlbumCountField}
        />
      )}
    </form.Field>
  );
}
