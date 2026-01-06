/**
 * Project Wizard Component
 *
 * Multi-step wizard for creating project requests.
 * Container component that manages wizard state, form management, and navigation.
 *
 * Pattern: Container/Presentational
 * - Handles form state with TanStack Form
 * - Manages draft creation and updates via Convex
 * - syncs with URL
 */

import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'

import { api } from '@/../convex/_generated/api'
import type { Id } from '@/../convex/_generated/dataModel'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StepIndicator, type WizardStep } from '@/components/shared/wizard'
import { WizardFormProvider } from './wizard-form-context'
import { ProjectWizardLoading } from './project-wizard-loading'
import { Step1BasicInfo, Step2Details, Step3Files, Step4Description, Step5Review } from './steps'

// Wizard step configuration
export const WIZARD_STEPS: readonly WizardStep[] = [
  { id: 1, title: 'Project Type', description: 'Select project type and basic info' },
  { id: 2, title: 'Details', description: 'Project-specific details' },
  { id: 3, title: 'Files', description: 'Upload reference files' },
  { id: 4, title: 'Description', description: 'Add notes and description' },
  { id: 5, title: 'Review', description: 'Review and submit' },
] as const

interface ProjectWizardProps {
  /** Initial step from URL search params */
  initialStep: number
  /** Project ID from URL search params (if editing draft) */
  projectId?: string
  /** Callback to sync step to URL */
  onStepChange?: (step: number) => void
}

export function ProjectWizard({
  initialStep,
  projectId,
  onStepChange,
}: ProjectWizardProps) {
  const navigate = useNavigate()
  
  // Mutations
  const createDraft = useMutation(api.functions.projects.mutations.createDraft)
  const updateDraft = useMutation(api.functions.projects.mutations.updateDraft)
  const submitProject = useMutation(api.functions.projects.mutations.submitProject)
  
  // Queries
  // Skip query if no projectId
  const existingDraft = useQuery(
    api.functions.projects.queries.getDraft, 
    projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
  )

  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  const [currentStep, setCurrentStep] = useState(() => 
    Math.max(1, Math.min(initialStep, 5))
  )

  // Initialize form
  const form = useForm({
    defaultValues: {
      projectTypeId: '',
      eventName: '',
      endClientName: '',
      referenceFiles: [] as string[],
      typeSpecificDetails: {} as Record<string, unknown>,
      venue: undefined as string | undefined,
      eventDate: undefined as number | undefined,
      description: undefined as string | undefined,
      additionalNotes: undefined as string | undefined,
      preferredDeliveryDate: undefined as number | undefined,
    },
    onSubmit: async () => {
      // Final submission logic
      if (!projectId) return

      try {
        await submitProject({ projectId: projectId as Id<'projects'> })
        toast.success('Project request submitted successfully!')
        navigate({ to: '/client/dashboard' })
      } catch (error) {
        console.error('Submit error:', error)
        toast.error('Failed to submit project')
      }
    },
  })

  // Load existing draft data when available
  useEffect(() => {
    if (existingDraft) {
      form.setFieldValue('projectTypeId', existingDraft.projectTypeId)
      form.setFieldValue('eventName', existingDraft.eventName ?? '')
      form.setFieldValue('endClientName', existingDraft.endClientName ?? '')
      form.setFieldValue('venue', existingDraft.venue)
      form.setFieldValue('eventDate', existingDraft.eventDate)
      form.setFieldValue('description', existingDraft.description)
      form.setFieldValue('additionalNotes', existingDraft.additionalNotes)
      form.setFieldValue('preferredDeliveryDate', existingDraft.preferredDeliveryDate)
      form.setFieldValue('referenceFiles', [])
      if (existingDraft.typeSpecificDetails) {
        form.setFieldValue('typeSpecificDetails', existingDraft.typeSpecificDetails)
      }
    }
  }, [existingDraft, form])

  // Sync step changes to parent (URL)
  useEffect(() => {
    onStepChange?.(currentStep)
  }, [currentStep, onStepChange])

  // Handle draft creation on mount if needed
  useEffect(() => {
    async function initialize() {
      if (!projectId && !isCreatingDraft && !existingDraft) {
        setIsCreatingDraft(true)
        try {
          // Create draft without projectTypeId initially
          const { projectId: newId } = await createDraft({})
          // Update URL with new projectId, keeping current step
          navigate({ 
            to: '.', 
            search: (prev: any) => ({ ...prev, projectId: newId }),
            replace: true 
          })
        } catch (error) {
          console.error('Failed to create draft:', error)
          toast.error('Failed to initialize project')
        } finally {
          setIsCreatingDraft(false)
        }
      }
    }
    initialize()
  }, [projectId, isCreatingDraft, createDraft, navigate, existingDraft])

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!projectId) return

    const values = form.state.values
    
    // Only save if we have an ID
    try {
      await updateDraft({
        projectId: projectId as Id<'projects'>,
        projectTypeId: values.projectTypeId ? values.projectTypeId as Id<'projectTypes'> : undefined,
        eventName: values.eventName || undefined,
        endClientName: values.endClientName || undefined,
        venue: values.venue,
        eventDate: values.eventDate,
        description: values.description,
        additionalNotes: values.additionalNotes,
        preferredDeliveryDate: values.preferredDeliveryDate,
        typeSpecificDetails: values.typeSpecificDetails,
        referenceFiles: values.referenceFiles,
      })
    } catch (error) {
      console.error('Auto-save failed:', error)
      // Silent fail for auto-save
    }
  }, [projectId, form.state.values, updateDraft])

  const goToStep = (newStep: number) => {
    const validStep = Math.max(1, Math.min(newStep, 5))
    
    // Validate current step before moving forward
    // For now, allow navigation, but in real app we might block if invalid
    
    // Trigger auto-save on navigation
    autoSave()
    setCurrentStep(validStep)
  }

  const handleNext = () => {
    if (currentStep < 5) {
      goToStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1)
    }
  }

  // Show loading state while creating draft or fetching initial data
  if ((!projectId && isCreatingDraft) || (projectId && existingDraft === undefined)) {
    return <ProjectWizardLoading />
  }

  return (
    <WizardFormProvider value={{ 
      form, 
      values: form.state.values,
      isSubmitting: form.state.isSubmitting,
      isSaving: false // Could wire up to mutation loading state
    }}>
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Request New Project</h1>
            <p className="text-muted-foreground mt-1">
              Complete the steps below to submit your project request {projectId && <span className="text-xs font-mono bg-muted px-1 rounded ml-2">Draft: {projectId.slice(-8)}</span>}
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
          />

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{WIZARD_STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription>
                {WIZARD_STEPS[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Render current step component */}
              {currentStep === 1 && <Step1BasicInfo />}
              {currentStep === 2 && <Step2Details />}
              {currentStep === 3 && <Step3Files />}
              {currentStep === 4 && <Step4Description />}
              {currentStep === 5 && <Step5Review />}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={form.handleSubmit}
                disabled={form.state.isSubmitting}
              >
                {form.state.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
                {!form.state.isSubmitting && <Check className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </AppLayout>
    </WizardFormProvider>
  )
}
