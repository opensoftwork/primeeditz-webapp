/**
 * Wizard Form Context
 * 
 * Provides form instance to step components without prop drilling.
 * Uses a simplified type approach to avoid TanStack Form's complex generics.
 */

import { createContext, useContext } from 'react'
import type { WizardFormValues } from './types'

// We use 'any' for the form type because TanStack Form's generics are extremely complex
// (requiring 11-23 type arguments). The form API is well-typed at the usage site.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormInstance = any

interface WizardFormContextValue {
  form: FormInstance
  /** Typed access to form values */
  values: WizardFormValues
  isSubmitting: boolean
  isSaving: boolean
}

const WizardFormContext = createContext<WizardFormContextValue | null>(null)

export function useWizardForm() {
  const context = useContext(WizardFormContext)
  if (!context) {
    throw new Error('useWizardForm must be used within a WizardFormProvider')
  }
  return context
}

export const WizardFormProvider = WizardFormContext.Provider
