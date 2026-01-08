'use client'

import { useCallback, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { useToast } from '@/components/ui/use-toast'
import {
    createCustomFormula,
    getCustomFormulas,
    updateCustomFormula,
    deleteCustomFormula,
    type CustomFormulaRecord,
    type CreateCustomFormulaInput,
    type UpdateCustomFormulaInput,
} from '@/lib/storage'

// =============================================================================
// TYPES
// =============================================================================

export interface FormulaValidationResult {
    valid: boolean
    error?: string
    inputs?: string[]
}

export interface UseFormulaEditorReturn {
    // State
    formulas: CustomFormulaRecord[]
    loading: boolean
    error: string | null

    // Actions
    loadFormulas: () => Promise<void>
    createFormula: (input: Omit<CreateCustomFormulaInput, 'workspaceId' | 'createdBy'>) => Promise<CustomFormulaRecord | null>
    updateFormula: (input: Omit<UpdateCustomFormulaInput, 'workspaceId'>) => Promise<void>
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
    // Remove numbers, operators, and whitespace to find variable names
    const cleaned = formula
        .replace(/[0-9.]+/g, ' ')
        .replace(/[+\-*/()]/g, ' ')

    const words = cleaned.split(/\s+/).filter(Boolean)

    // Filter out known functions
    const variables = words.filter((word) =>
        !SUPPORTED_FUNCTIONS.includes(word.toLowerCase()) &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word)
    )

    return [...new Set(variables)]
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
    try {
        // Replace variable names with their values
        let expression = formula
        Object.entries(inputs).forEach(([name, value]) => {
            expression = expression.replace(
                new RegExp(`\\b${name}\\b`, 'g'),
                String(value)
            )
        })

        // Replace function names with Math equivalents
        expression = expression
            .replace(/\babs\b/gi, 'Math.abs')
            .replace(/\bmin\b/gi, 'Math.min')
            .replace(/\bmax\b/gi, 'Math.max')
            .replace(/\bround\b/gi, 'Math.round')
            .replace(/\bfloor\b/gi, 'Math.floor')
            .replace(/\bceil\b/gi, 'Math.ceil')

        // Validate no remaining letters (which would indicate undefined variables)
        if (/[a-zA-Z]/.test(expression.replace(/Math\./g, ''))) {
            return null
        }

        // Use Function constructor for safe evaluation (no access to external scope)
        // eslint-disable-next-line no-new-func
        const fn = new Function(`return (${expression})`)
        const result = fn()

        if (typeof result !== 'number' || !isFinite(result)) {
            return null
        }

        return result
    } catch {
        return null
    }
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

    const [formulas, setFormulas] = useState<CustomFormulaRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load formulas from storage
    const loadFormulas = useCallback(async () => {
        if (!selectedClientId) return

        setLoading(true)
        setError(null)

        try {
            const result = await getCustomFormulas({ workspaceId: selectedClientId })
            setFormulas(result.formulas)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load formulas'
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [selectedClientId])

    // Create a new formula
    const handleCreateFormula = useCallback(async (
        input: Omit<CreateCustomFormulaInput, 'workspaceId' | 'createdBy'>
    ): Promise<CustomFormulaRecord | null> => {
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
            const record = await createCustomFormula({
                ...input,
                workspaceId: selectedClientId,
                createdBy: user.id,
                inputs: validation.inputs ?? input.inputs,
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
        input: Omit<UpdateCustomFormulaInput, 'workspaceId'>
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
            await updateCustomFormula({ ...input, workspaceId: selectedClientId })
            setFormulas((prev) =>
                prev.map((f) => (f.formulaId === input.formulaId ? { ...f, ...input } : f))
            )
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
            await deleteCustomFormula({ workspaceId: selectedClientId, formulaId })
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
