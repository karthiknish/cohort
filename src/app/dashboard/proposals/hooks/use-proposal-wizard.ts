import { useState, useCallback, useMemo } from 'react'
import { useToast } from '@/components/ui/use-toast'
import type { ProposalFormData } from '@/lib/proposals'
import {
    proposalSteps,
    createInitialProposalFormState,
    stepErrorPaths,
    validateProposalStep,
    collectStepValidationErrors,
    hasCompletedAnyStepData,
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
    const step = steps[currentStep]
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
            const updated = structuredClone(prev) as typeof prev
            let target: Record<string, unknown> = updated as unknown as Record<string, unknown>
            path.slice(0, -1).forEach((key) => {
                const next = target[key]
                if (next && typeof next === 'object') {
                    target = next as Record<string, unknown>
                }
            })
            const field = path[path.length - 1]
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
            const updated = structuredClone(prev) as typeof prev
            let target: Record<string, unknown> = updated as unknown as Record<string, unknown>
            path.slice(0, -1).forEach((key) => {
                const next = target[key]
                if (next && typeof next === 'object') {
                    target = next as Record<string, unknown>
                }
            })
            target[path[path.length - 1]] = value
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
        () => collectStepValidationErrors(step.id, formState),
        [formState, step.id]
    )

    const validationErrors = useMemo(() => {
        const next: Record<string, string> = { ...manualErrors }

        stepErrorPaths[step.id].forEach((key) => {
            if (stepErrors[key]) {
                next[key] = stepErrors[key]
            } else {
                delete next[key]
            }
        })

        return next
    }, [manualErrors, step.id, stepErrors])

    const handleNext = useCallback(() => {
        if (!validateProposalStep(step.id, formState)) {
            const message = 'Please complete the required fields before continuing.'
            toast({ title: 'Complete required fields', description: message, variant: 'destructive' })
            const stepErrors = collectStepValidationErrors(step.id, formState)
            setManualErrors((prev) => ({ ...prev, ...stepErrors }))
            return
        }
        clearErrors(stepErrorPaths[step.id])
        if (!isLastStep) {
            setCurrentStep((prev) => prev + 1)
        } else if (onSubmit) {
            void onSubmit()
        }
    }, [step.id, formState, isLastStep, onSubmit, clearErrors, toast])

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
