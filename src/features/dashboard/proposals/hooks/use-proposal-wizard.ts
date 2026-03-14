import { useCallback, useMemo, useState } from 'react'
import { useToast } from '@/shared/ui/use-toast'
import type { ProposalFormData } from '@/lib/proposals'
import {
    collectStepValidationErrors,
    createInitialProposalFormState,
    hasCompletedAnyStepData,
    proposalSteps,
    validateProposalStep,
    stepErrorPaths,
} from '../utils/form-steps'

export interface UseProposalWizardOptions {
    onSubmit?: () => Promise<void>
}

export interface UseProposalWizardReturn {
    // State
    currentStep: number
    formState: ProposalFormData
    validationErrors: Record<string, string>

    // Computed
    steps: typeof proposalSteps
    step: typeof proposalSteps[number]
    isFirstStep: boolean
    isLastStep: boolean
    hasPersistableData: boolean

    // Actions
    setCurrentStep: (step: number) => void
    setFormState: (state: ProposalFormData | ((prev: ProposalFormData) => ProposalFormData)) => void
    setValidationErrors: (errors: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void
    updateField: (path: string[], value: string) => void
    toggleArrayValue: (path: string[], value: string) => void
    handleSocialHandleChange: (handle: string, value: string) => void
    clearErrors: (paths: string | string[]) => void
    handleNext: () => void
    handleBack: () => void
    resetWizard: () => void
}

export function useProposalWizard(options: UseProposalWizardOptions = {}): UseProposalWizardReturn {
    const { onSubmit } = options
    const { toast } = useToast()

    const [currentStep, setCurrentStep] = useState(0)
    const [formState, setFormState] = useState<ProposalFormData>(() => createInitialProposalFormState())
    const [manualErrors, setManualErrors] = useState<Record<string, string>>({})

    const steps = proposalSteps
    const step = steps[currentStep] ?? steps[0]!
    const stepId = step.id
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === steps.length - 1

    const hasPersistableData = useMemo(() => hasCompletedAnyStepData(formState), [formState])

    const clearErrors = useCallback((paths: string | string[]) => {
        const keys = Array.isArray(paths) ? paths : [paths]
        setManualErrors((prev) => {
            const next = { ...prev }
            let changed = false
            keys.forEach((key) => {
                if (key in next) {
                    delete next[key]
                    changed = true
                }
            })
            return changed ? next : prev
        })
    }, [])

    const toggleArrayValue = useCallback((path: string[], value: string) => {
        setFormState((prev) => {
            const field = path.at(-1)
            if (!field) {
                return prev
            }
            const updated = structuredClone(prev) as typeof prev
            let target: Record<string, unknown> = updated as unknown as Record<string, unknown>
            path.slice(0, -1).forEach((key) => {
                const next = target[key]
                if (next && typeof next === 'object') {
                    target = next as Record<string, unknown>
                }
            })
            const array = Array.isArray(target[field]) ? (target[field] as string[]) : []
            target[field] = array.includes(value) ? array.filter((item) => item !== value) : [...array, value]
            return updated
        })
        const fieldPath = path.join('.')
        if (path[path.length - 1] === 'objectives' || path[path.length - 1] === 'services') {
            // Check if we're adding a value (not removing)
            setFormState((current) => {
                const lastKey = path[path.length - 1]
                const hasValues = lastKey === 'objectives'
                    ? !current.goals.objectives.includes(value)
                    : !current.scope.services.includes(value)
                if (hasValues) {
                    clearErrors(fieldPath)
                }
                return current
            })
        } else {
            clearErrors(fieldPath)
        }
    }, [clearErrors])

    const updateField = useCallback((path: string[], value: string) => {
        setFormState((prev) => {
            const field = path.at(-1)
            if (!field) {
                return prev
            }
            const updated = structuredClone(prev) as typeof prev
            let target: Record<string, unknown> = updated as unknown as Record<string, unknown>
            path.slice(0, -1).forEach((key) => {
                const next = target[key]
                if (next && typeof next === 'object') {
                    target = next as Record<string, unknown>
                }
            })
            target[field] = value
            return updated
        })
        clearErrors(path.join('.'))
    }, [clearErrors])

    const handleSocialHandleChange = useCallback((handle: string, value: string) => {
        setFormState((prev) => ({
            ...prev,
            marketing: {
                ...prev.marketing,
                socialHandles: {
                    ...prev.marketing.socialHandles,
                    [handle]: value,
                },
            },
        }))
    }, [])

    const stepErrors = useMemo(
        () => collectStepValidationErrors(stepId, formState),
        [formState, stepId]
    )

    const validationErrors = useMemo(() => {
        const next: Record<string, string> = { ...manualErrors }

        stepErrorPaths[stepId].forEach((key) => {
            if (stepErrors[key]) {
                next[key] = stepErrors[key]
            } else {
                delete next[key]
            }
        })

        return next
    }, [manualErrors, stepErrors, stepId])

    const handleNext = useCallback(() => {
        if (!validateProposalStep(stepId, formState)) {
            const message = 'Please complete the required fields before continuing.'
            toast({ title: 'Complete required fields', description: message, variant: 'destructive' })
            const stepErrors = collectStepValidationErrors(stepId, formState)
            setManualErrors((prev) => ({ ...prev, ...stepErrors }))
            return
        }
        clearErrors(stepErrorPaths[stepId])
        if (!isLastStep) {
            setCurrentStep((prev) => prev + 1)
        } else if (onSubmit) {
            void onSubmit()
        }
    }, [clearErrors, formState, isLastStep, onSubmit, stepId, toast])

    const handleBack = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStep((prev) => prev - 1)
        }
    }, [isFirstStep])

    const resetWizard = useCallback(() => {
        setFormState(createInitialProposalFormState())
        setCurrentStep(0)
        setManualErrors({})
    }, [])

    return {
        currentStep,
        formState,
        validationErrors,
        steps,
        step,
        isFirstStep,
        isLastStep,
        hasPersistableData,
        setCurrentStep,
        setFormState,
        setValidationErrors: setManualErrors,
        updateField,
        toggleArrayValue,
        handleSocialHandleChange,
        clearErrors,
        handleNext,
        handleBack,
        resetWizard,
    }
}
