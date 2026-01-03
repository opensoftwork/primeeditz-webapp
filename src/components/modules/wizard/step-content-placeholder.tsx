/**
 * Step Content Placeholder Component
 *
 * Temporary placeholder for wizard step content.
 * Will be replaced by actual step components in Stories 2.2-2.6.
 */

interface StepContentPlaceholderProps {
  step: number
}

const STEP_PLACEHOLDERS: Record<number, string> = {
  1: 'Project Type & Basic Info form will be here (Story 2.2)',
  2: 'Dynamic Project-Specific Details form will be here (Story 2.3)',
  3: 'Reference Files Upload component will be here (Story 2.4)',
  4: 'Description & Notes form will be here (Story 2.5)',
  5: 'Review & Submit summary will be here (Story 2.6)',
}

export function StepContentPlaceholder({ step }: StepContentPlaceholderProps) {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <p className="text-lg">{STEP_PLACEHOLDERS[step]}</p>
      <p className="text-sm mt-2">Step {step} of 5</p>
    </div>
  )
}
