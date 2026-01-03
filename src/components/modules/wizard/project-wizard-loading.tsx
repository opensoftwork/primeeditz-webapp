/**
 * Project Wizard Loading Component
 *
 * Displayed while the wizard route is loading data.
 */

import { Loader2 } from 'lucide-react'

export function ProjectWizardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading wizard...</p>
      </div>
    </div>
  )
}
