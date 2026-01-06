/**
 * Step 4: Description
 * 
 * Add project description, notes, and preferred delivery date.
 * Uses TanStack Form Field pattern with shadcn/ui Field component.
 */

import { Input } from '@/components/ui/input'
import { 
  Field, 
  FieldLabel, 
  FieldDescription,
  FieldError,
  FieldGroup 
} from '@/components/ui/field'
import { useWizardForm } from '../wizard-form-context'
import { transformErrors } from '../types'
import type { OptionalStringField, OptionalNumberField } from '../types'

export function Step4Description() {
  const { form } = useWizardForm()

  return (
    <FieldGroup>
      {/* Description */}
      <form.Field name="description">
        {(field: OptionalStringField) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Project Description</FieldLabel>
              <textarea
                id={field.name}
                name={field.name}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] resize-y"
                placeholder="Describe what you need for this project..."
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value || undefined)}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={transformErrors(field.state.meta.errors)} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Additional Notes */}
      <form.Field name="additionalNotes">
        {(field: OptionalStringField) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Additional Notes</FieldLabel>
              <textarea
                id={field.name}
                name={field.name}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-y"
                placeholder="Any special requirements or preferences..."
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value || undefined)}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={transformErrors(field.state.meta.errors)} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Preferred Delivery Date */}
      <form.Field name="preferredDeliveryDate">
        {(field: OptionalNumberField) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Preferred Delivery Date</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="date"
                value={field.state.value ? new Date(field.state.value).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).getTime() : undefined
                  field.handleChange(date)
                }}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              <FieldDescription>
                When do you need the final deliverables?
              </FieldDescription>
              {isInvalid && <FieldError errors={transformErrors(field.state.meta.errors)} />}
            </Field>
          )
        }}
      </form.Field>
    </FieldGroup>
  )
}
