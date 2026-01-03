/**
 * Wizard Form Types
 * 
 * Type definitions for the project wizard form.
 * Uses simplified types to avoid complex TanStack Form generics.
 */

// Form values type - matches what we pass to useForm
export interface WizardFormValues {
  projectTypeId: string
  eventName: string
  endClientName: string
  venue: string | undefined
  eventDate: number | undefined
  description: string | undefined
  additionalNotes: string | undefined
  preferredDeliveryDate: number | undefined
  referenceFiles: string[]
  typeSpecificDetails: Record<string, unknown>
}

// TanStack Form error type (can be string or object with message)
type FormError = string | { message?: string } | undefined

// Simplified field state type (what we actually use in render props)
export interface FieldState<T> {
  value: T
  meta: {
    isTouched: boolean
    isValid: boolean
    errors: FormError[]
  }
}

// Simplified field API (what we actually use in render props)
export interface SimpleFieldApi<T> {
  name: string
  state: FieldState<T>
  handleChange: (value: T) => void
  handleBlur: () => void
}

// Type aliases for common field types
export type StringField = SimpleFieldApi<string>
export type OptionalStringField = SimpleFieldApi<string | undefined>
export type OptionalNumberField = SimpleFieldApi<number | undefined>
export type StringArrayField = SimpleFieldApi<string[]>

/**
 * Transform TanStack Form errors to FieldError format
 * TanStack Form can return strings or objects with message property
 */
export function transformErrors(errors: FormError[]): Array<{ message?: string } | undefined> {
  return errors.map(error => {
    if (typeof error === 'string') {
      return { message: error }
    }
    return error
  })
}
