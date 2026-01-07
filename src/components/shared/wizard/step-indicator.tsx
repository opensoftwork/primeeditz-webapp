/**
 * Step Indicator Component
 *
 * Visual progress indicator for multi-step wizards.
 * Shows completed, active, and upcoming steps with connecting lines.
 */

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WizardStep {
  id: number
  title: string
  description: string
}

interface StepIndicatorProps {
  steps: readonly WizardStep[]
  currentStep: number
  onStepClick?: (step: number) => void
  /** Whether to allow clicking on future steps */
  allowForwardNavigation?: boolean
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  allowForwardNavigation = true,
}: StepIndicatorProps) {
  const handleStepClick = (stepId: number) => {
    if (!onStepClick) return
    
    // Only allow clicking on completed steps or forward if enabled
    if (stepId < currentStep || allowForwardNavigation) {
      onStepClick(stepId)
    }
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = step.id < currentStep
        const isClickable = onStepClick && (isCompleted || allowForwardNavigation)

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <button
              type="button"
              onClick={() => handleStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm',
                'transition-all duration-200',
                isCompleted && 'bg-primary text-primary-foreground',
                isActive && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                !isCompleted && !isActive && 'bg-muted text-muted-foreground',
                isClickable && 'cursor-pointer hover:opacity-80',
                !isClickable && 'cursor-default'
              )}
              aria-label={`Step ${step.id}: ${step.title}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {isCompleted ? <Check className="h-5 w-5" /> : step.id}
            </button>

            {/* Step Label (visible on md+) */}
            <div className="hidden md:block ml-3">
              <p
                className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4',
                  step.id < currentStep ? 'bg-primary' : 'bg-muted'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
