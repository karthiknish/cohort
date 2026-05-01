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

export interface FormStateUpdateOptions {
    recordHistory?: boolean
    resetHistory?: boolean
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
    setFormState: (state: ProposalFormData | ((prev: ProposalFormData) => ProposalFormData), options?: FormStateUpdateOptions) => void
    setValidationErrors: (errors: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void
    updateField: (path: string[], value: string) => void
    toggleArrayValue: (path: string[], value: string) => void
    handleSocialHandleChange: (handle: string, value: string) => void
    clearErrors: (paths: string | string[]) => void
    clearHistory: () => void
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
    handleNext: () => void
    handleBack: () => void
    resetWizard: () => void
}

const HISTORY_LIMIT = 50

function cloneFormState(state: ProposalFormData): ProposalFormData {
    return structuredClone(state) as ProposalFormData
}

function formsEqual(left: ProposalFormData, right: ProposalFormData): boolean {
    return JSON.stringify(left) === JSON.stringify(right)
}

export function useProposalWizard(options: UseProposalWizardOptions = {}): UseProposalWizardReturn {
    const { onSubmit } = options
    const { toast } = useToast()

    const [currentStep, setCurrentStep] = useState(0)
    const [formState, setFormStateState] = useState<ProposalFormData>(() => createInitialProposalFormState())
    const [manualErrors, setManualErrors] = useState<Record<string, string>>({})
    const [undoStack, setUndoStack] = useState<ProposalFormData[]>([])
    const [redoStack, setRedoStack] = useState<ProposalFormData[]>([])

    const setFormState = useCallback((
        state: ProposalFormData | ((prev: ProposalFormData) => ProposalFormData),
        options: FormStateUpdateOptions = {},
    ) => {
        setFormStateState((prev) => {
            const next = typeof state === 'function'
                ? (state as (prev: ProposalFormData) => ProposalFormData)(prev)
                : state

            if (options.resetHistory) {
                setUndoStack([])
                setRedoStack([])
                return next
            }

            if (options.recordHistory && !formsEqual(prev, next)) {
                setUndoStack((current) => [cloneFormState(prev), ...current].slice(0, HISTORY_LIMIT))
                setRedoStack([])
            }

            return next
        })
    }, [])

    const clearHistory = useCallback(() => {
        setUndoStack([])
        setRedoStack([])
    }, [])

    const undo = useCallback(() => {
        setUndoStack((current) => {
            const [next, ...rest] = current
            if (!next) {
                return current
            }

            setRedoStack((redoCurrent) => [cloneFormState(formState), ...redoCurrent].slice(0, HISTORY_LIMIT))
            setFormStateState(next)
            setManualErrors({})
            return rest
        })
    }, [formState])

    const redo = useCallback(() => {
        setRedoStack((current) => {
            const [next, ...rest] = current
            if (!next) {
                return current
            }

            setUndoStack((undoCurrent) => [cloneFormState(formState), ...undoCurrent].slice(0, HISTORY_LIMIT))
            setFormStateState(next)
            setManualErrors({})
            return rest
        })
    }, [formState])

    const canUndo = undoStack.length > 0
    const canRedo = redoStack.length > 0

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
        }, { recordHistory: true })
        clearErrors(path.join('.'))
    }, [clearErrors, setFormState])

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
        }, { recordHistory: true })
        clearErrors(path.join('.'))
    }, [clearErrors, setFormState])

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
        }), { recordHistory: true })
    }, [setFormState])

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
        setFormState(createInitialProposalFormState(), { resetHistory: true })
        setCurrentStep(0)
        setManualErrors({})
    }, [setFormState])

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
        clearHistory,
        undo,
        redo,
        canUndo,
        canRedo,
        handleNext,
        handleBack,
        resetWizard,
    }
}
