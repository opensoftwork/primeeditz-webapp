/**
 * Step 1: Basic Info
 * 
 * Collects project type, event name, client name, date, and venue.
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
import type { StringField, OptionalStringField, OptionalNumberField } from '../types'

export function Step1BasicInfo() {
  const { form } = useWizardForm()

  return (
    <FieldGroup>
      {/* Project Type - placeholder for now, will be a select */}
      <form.Field name="projectTypeId">
        {(field: StringField) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Project Type</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                placeholder="Select project type..."
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              <FieldDescription>
                Select the type of project you want to request
              </FieldDescription>
              {isInvalid && <FieldError errors={transformErrors(field.state.meta.errors)} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Event/Project Name */}
      <form.Field name="eventName">
        {(field: StringField) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Event / Project Name *</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                placeholder="e.g., Wedding Reception, Corporate Event"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={transformErrors(field.state.meta.errors)} />}
            </Field>
          )
        }}
      </form.Field>

      {/* End Client Name */}
      <form.Field name="endClientName">
        {(field: StringField) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Client Name *</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                placeholder="Name of the end client"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={transformErrors(field.state.meta.errors)} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Event Date */}
      <form.Field name="eventDate">
        {(field: OptionalNumberField) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Event Date</FieldLabel>
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
              {isInvalid && <FieldError errors={transformErrors(field.state.meta.errors)} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Venue */}
      <form.Field name="venue">
        {(field: OptionalStringField) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Venue / Location</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                placeholder="Event venue or location"
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
    </FieldGroup>
  )
}
