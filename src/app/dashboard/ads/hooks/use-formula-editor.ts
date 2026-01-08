'use client'

import { useCallback, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { useToast } from '@/components/ui/use-toast'
import { apiFetch } from '@/lib/api-client'
import { extractFormulaVariables, safeEvaluateFormula } from '@/lib/metrics'

// =============================================================================
// TYPES
// =============================================================================

export type CustomFormula = {
    workspaceId: string
    formulaId: string
    name: string
    description?: string | null
    formula: string
    inputs: string[]
    outputMetric: string
    isActive: boolean
    createdBy: string
    createdAt?: string | null
    updatedAt?: string | null
}

export type CreateCustomFormulaInput = {
    name: string
    description?: string
    formula: string
    inputs: string[]
    outputMetric: string
}

export type UpdateCustomFormulaInput = {
    formulaId: string
    name?: string
    description?: string | null
    formula?: string
    inputs?: string[]
    outputMetric?: string
    isActive?: boolean
}

export interface FormulaValidationResult {
    valid: boolean
    error?: string
    inputs?: string[]
}

export interface UseFormulaEditorReturn {
    // State
    formulas: CustomFormula[]
    loading: boolean
    error: string | null

    // Actions
    loadFormulas: () => Promise<void>
    createFormula: (input: CreateCustomFormulaInput) => Promise<CustomFormula | null>
    updateFormula: (input: UpdateCustomFormulaInput) => Promise<void>
    deleteFormula: (formulaId: string) => Promise<void>
    validateFormula: (formula: string) => FormulaValidationResult

    // Execution
    executeFormula: (formula: string, inputs: Record<string, number>) => number | null
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Supported operators and functions in formulas */
const SUPPORTED_OPERATORS = ['+', '-', '*', '/', '(', ')', '.']
const SUPPORTED_FUNCTIONS = ['abs', 'min', 'max', 'round', 'floor', 'ceil']

/** Known metric names for validation */
const KNOWN_METRICS = [
    'spend', 'impressions', 'clicks', 'conversions', 'revenue',
    'ctr', 'cpc', 'cpm', 'roas', 'cpa'
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract variable names from a formula string
 */
function extractVariables(formula: string): string[] {
    return extractFormulaVariables(formula)
}

/**
 * Validate formula syntax
 */
function validateFormulaSyntax(formula: string): FormulaValidationResult {
    if (!formula.trim()) {
        return { valid: false, error: 'Formula cannot be empty' }
    }

    // Check for balanced parentheses
    let parenCount = 0
    for (const char of formula) {
        if (char === '(') parenCount++
        if (char === ')') parenCount--
        if (parenCount < 0) {
            return { valid: false, error: 'Unbalanced parentheses' }
        }
    }
    if (parenCount !== 0) {
        return { valid: false, error: 'Unbalanced parentheses' }
    }

    // Check for invalid characters
    const validChars = /^[a-zA-Z0-9_+\-*/().\s]+$/
    if (!validChars.test(formula)) {
        return { valid: false, error: 'Formula contains invalid characters' }
    }

    // Extract and validate inputs
    const inputs = extractVariables(formula)
    if (inputs.length === 0) {
        return { valid: false, error: 'Formula must contain at least one metric variable' }
    }

    return { valid: true, inputs }
}

/**
 * Safely execute a formula with given inputs
 */
function safeEvaluate(formula: string, inputs: Record<string, number>): number | null {
    return safeEvaluateFormula(formula, inputs)
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for managing custom formula definitions
 */
export function useFormulaEditor(): UseFormulaEditorReturn {
    const { user } = useAuth()
    const { selectedClientId } = useClientContext()
    const { toast } = useToast()

    const [formulas, setFormulas] = useState<CustomFormula[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load formulas from storage
    const loadFormulas = useCallback(async () => {
        if (!selectedClientId) return

        setLoading(true)
        setError(null)

        try {
            const result = await apiFetch<{ formulas: CustomFormula[]; count: number }>(
                `/api/integrations/formulas?workspaceId=${encodeURIComponent(selectedClientId)}`,
                { cache: 'no-store' }
            )
            setFormulas(Array.isArray(result.formulas) ? result.formulas : [])
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load formulas'
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [selectedClientId])

    // Create a new formula
    const handleCreateFormula = useCallback(async (
        input: CreateCustomFormulaInput
    ): Promise<CustomFormula | null> => {
        if (!selectedClientId || !user?.id) {
            toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' })
            return null
        }

        // Validate formula first
        const validation = validateFormulaSyntax(input.formula)
        if (!validation.valid) {
            toast({ title: 'Invalid Formula', description: validation.error, variant: 'destructive' })
            return null
        }

        try {
            const record = await apiFetch<CustomFormula>('/api/integrations/formulas', {
                method: 'POST',
                body: JSON.stringify({
                    ...input,
                    workspaceId: selectedClientId,
                    inputs: validation.inputs ?? input.inputs,
                }),
            })

            setFormulas((prev) => [...prev, record])
            toast({ title: 'Formula Created', description: `"${input.name}" saved successfully` })
            return record
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create formula'
            toast({ title: 'Error', description: message, variant: 'destructive' })
            return null
        }
    }, [selectedClientId, user?.id, toast])

    // Update an existing formula
    const handleUpdateFormula = useCallback(async (
        input: UpdateCustomFormulaInput
    ): Promise<void> => {
        if (!selectedClientId) return

        // Validate if formula is being updated
        if (input.formula) {
            const validation = validateFormulaSyntax(input.formula)
            if (!validation.valid) {
                toast({ title: 'Invalid Formula', description: validation.error, variant: 'destructive' })
                return
            }
        }

        try {
            const updated = await apiFetch<CustomFormula>(
                `/api/integrations/formulas/${encodeURIComponent(input.formulaId)}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        workspaceId: selectedClientId,
                        ...input,
                    }),
                }
            )

            setFormulas((prev) => prev.map((f) => (f.formulaId === input.formulaId ? updated : f)))
            toast({ title: 'Formula Updated' })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update formula'
            toast({ title: 'Error', description: message, variant: 'destructive' })
        }
    }, [selectedClientId, toast])

    // Delete a formula
    const handleDeleteFormula = useCallback(async (formulaId: string): Promise<void> => {
        if (!selectedClientId) return

        try {
            await apiFetch<{ ok: true }>(
                `/api/integrations/formulas/${encodeURIComponent(formulaId)}?workspaceId=${encodeURIComponent(selectedClientId)}`,
                { method: 'DELETE' }
            )
            setFormulas((prev) => prev.filter((f) => f.formulaId !== formulaId))
            toast({ title: 'Formula Deleted' })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete formula'
            toast({ title: 'Error', description: message, variant: 'destructive' })
        }
    }, [selectedClientId, toast])

    // Validate a formula
    const validateFormula = useCallback((formula: string): FormulaValidationResult => {
        return validateFormulaSyntax(formula)
    }, [])

    // Execute a formula with inputs
    const executeFormula = useCallback((
        formula: string,
        inputs: Record<string, number>
    ): number | null => {
        return safeEvaluate(formula, inputs)
    }, [])

    return {
        formulas,
        loading,
        error,
        loadFormulas,
        createFormula: handleCreateFormula,
        updateFormula: handleUpdateFormula,
        deleteFormula: handleDeleteFormula,
        validateFormula,
        executeFormula,
    }
}
